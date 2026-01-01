/**
 * ObjectGenerator.js
 * Generación de objetos, enemigos y NPCs para el mundo del juego
 */

import { CONFIG } from '../config.js';
import { gameState } from '../state.js';
import { MAP_DEFINITIONS } from './MapDefinitions.js';
import { STATIC_WORLD_MAPS, getStaticMap } from './StaticWorldMaps.js';
import { ENEMY_STATS } from '../entities/EnemyTypes.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';
import { TILES } from './TileTypes.js';
import { isWalkable } from './MapGenerator.js';
import { NPC } from '../entities/NPC.js';

const { MAP_WIDTH, MAP_HEIGHT, MAX_INVENTORY_SLOTS } = CONFIG;

/**
 * Generate objects (chests, gold, items) based on current map
 * @param {string} mapType - Current map type
 * @returns {Array} Array of objects
 */
export function generateObjects(mapType) {
    const objects = [];

    if (mapType === 'field') {
        // Field map - outdoor exploration
        // Add chests (AO style)
        for (let i = 0; i < 15; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            objects.push({
                type: 'chest',
                x: x,
                y: y,
                opened: false,
                contains: { gold: Math.floor(Math.random() * 50) + 20 }
            });
        }

        // Add gold coins
        for (let i = 0; i < 25; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            objects.push({
                type: 'gold',
                x: x,
                y: y,
                amount: Math.floor(Math.random() * 20) + 5
            });
        }

    } else if (mapType === 'city') {
        // City map - urban area with buildings
        // Add some chests in safe spots
        for (let i = 0; i < 5; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            objects.push({
                type: 'chest',
                x: x,
                y: y,
                opened: false,
                contains: { gold: Math.floor(Math.random() * 30) + 10 }
            });
        }

    } else if (mapType === 'dungeon') {
        // Dungeon map - dangerous area with better loot
        // Add better chests
        for (let i = 0; i < 10; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR); // Only on floor tiles

            objects.push({
                type: 'chest',
                x: x,
                y: y,
                opened: false,
                contains: { gold: Math.floor(Math.random() * 100) + 50 }
            });
        }

        // Add gold coins
        for (let i = 0; i < 15; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR);

            objects.push({
                type: 'gold',
                x: x,
                y: y,
                amount: Math.floor(Math.random() * 30) + 10
            });
        }
    }

    // Add portals for current map - PLACE IN SAFE WALKABLE POSITIONS
    // First check static maps, then fallback to procedural definitions
    let portalDefinitions = null;

    // Check if it's a static map
    const staticMap = getStaticMap(mapType);
    if (staticMap && staticMap.portals) {
        portalDefinitions = staticMap.portals;
    }
    // Fallback to procedural map definitions
    else {
        const mapDef = MAP_DEFINITIONS[mapType];
        if (mapDef && mapDef.portals) {
            portalDefinitions = mapDef.portals;
        }
    }

    // Create portals from definitions
    if (portalDefinitions) {
        for (const portal of portalDefinitions) {
            // Find safe position for portal (starting from preferred position)
            const safePos = findSafeWalkablePosition(portal.x, portal.y);

            if (safePos) {
                objects.push({
                    type: 'portal',
                    portalId: `portal_to_${portal.targetMap}`,
                    x: safePos.x,
                    y: safePos.y,
                    targetMap: portal.targetMap,
                    targetX: portal.targetX,
                    targetY: portal.targetY,
                    name: portal.name
                });
            } else {
                console.warn(`No se pudo encontrar posición segura para portal a ${portal.name}`);
            }
        }
    }

    // Add items on ground (different amounts per map)
    const itemTypes = Object.keys(ITEM_TYPES);
    let itemCount = 40; // Default for field

    if (mapType === 'city') itemCount = 20; // Fewer in city
    if (mapType === 'dungeon') itemCount = 30; // More in dungeon
    if (['forest', 'castle', 'market'].includes(mapType)) itemCount = 25;
    if (['deep_dungeon', 'ruins', 'throne_room'].includes(mapType)) itemCount = 35;

    const maxAttempts = 50;

    for (let i = 0; i < itemCount; i++) {
        let foundSpot = false;
        let attempts = 0;

        while (!foundSpot && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;

            // Check appropriate walkable tile for each map
            let validTile = false;
            if (['field', 'forest', 'ruins'].includes(mapType) && gameState.map[y][x] === TILES.GRASS) {
                validTile = true;
            } else if (['city', 'market'].includes(mapType) && gameState.map[y][x] === TILES.GRASS) {
                validTile = true;
            } else if (['castle', 'throne_room'].includes(mapType) && gameState.map[y][x] === TILES.FLOOR) {
                validTile = true;
            } else if (['dungeon', 'deep_dungeon'].includes(mapType) && gameState.map[y][x] === TILES.FLOOR) {
                validTile = true;
            }

            if (validTile) {
                const hasObject = objects.some(obj => obj.x === x && obj.y === y);
                if (!hasObject) {
                    const randomItemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                    const itemDef = ITEM_TYPES[randomItemType];

                    objects.push({
                        type: 'item',
                        itemType: randomItemType,
                        x: x,
                        y: y,
                        quantity: itemDef.stackable ? Math.floor(Math.random() * 5) + 1 : 1
                    });
                    foundSpot = true;
                }
            }
            attempts++;
        }
    }

    return objects;
}

/**
 * Generate enemies based on current map
 * @param {string} mapType - Current map type
 * @returns {Array} Array of enemies
 */
export function generateEnemies(mapType) {
    const enemies = [];

    if (mapType === 'field') {
        // Field - mix of goblins and skeletons
        const enemyTypes = ['goblin', 'skeleton'];
        for (let i = 0; i < 25; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = ENEMY_STATS[enemyType];

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (mapType === 'city') {
        // City - bandits and elementals
        const enemyTypes = ['bandit', 'elemental'];
        for (let i = 0; i < 8; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] === TILES.GRASS); // Avoid buildings

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = ENEMY_STATS[enemyType];

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (mapType === 'dungeon') {
        // Dungeon - orcs and trolls
        const enemyTypes = ['orc', 'troll'];
        for (let i = 0; i < 20; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = ENEMY_STATS[enemyType];

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (mapType === 'forest') {
        // Forest - goblins, skeletons, and elementals
        const enemyTypes = ['goblin', 'skeleton', 'elemental'];
        for (let i = 0; i < 18; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = ENEMY_STATS[enemyType];

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (mapType === 'castle') {
        // Castle - bandits and demons
        const enemyTypes = ['bandit', 'demon'];
        for (let i = 0; i < 12; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = ENEMY_STATS[enemyType];

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (mapType === 'deep_dungeon') {
        // Deep dungeon - trolls, demons, and dragons
        const enemyTypes = ['troll', 'demon', 'dragon'];
        for (let i = 0; i < 15; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = ENEMY_STATS[enemyType];

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (mapType === 'ruins') {
        // Ruins - skeletons, demons, and elementals
        const enemyTypes = ['skeleton', 'demon', 'elemental'];
        for (let i = 0; i < 16; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] === TILES.GRASS || gameState.map[y][x] === TILES.FLOOR);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = ENEMY_STATS[enemyType];

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (mapType === 'throne_room') {
        // Throne room - only dragons as bosses
        for (let i = 0; i < 3; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR);

            const enemyStats = ENEMY_STATS.dragon;

            enemies.push({
                type: 'dragon',
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    }

    return enemies;
}

/**
 * Generate NPCs based on current map
 * @param {string} mapType - Current map type
 * @returns {Array} Array of NPCs
 */
export function generateNPCs(mapType) {
    const npcs = [];

    // First check if it's a static map with defined NPCs
    const staticMap = getStaticMap(mapType);
    if (staticMap && staticMap.npcs) {
        // Use static map NPC definitions
        for (const npcSpawn of staticMap.npcs) {
            // Find walkable position near preferred location
            let x = npcSpawn.x;
            let y = npcSpawn.y;

            // Search for walkable position
            for (let dy = -3; dy <= 3; dy++) {
                for (let dx = -3; dx <= 3; dx++) {
                    const testX = npcSpawn.x + dx;
                    const testY = npcSpawn.y + dy;
                    if (testX > 0 && testX < MAP_WIDTH - 1 &&
                        testY > 0 && testY < MAP_HEIGHT - 1 &&
                        isWalkable(gameState.map, testX, testY)) {
                        x = testX;
                        y = testY;
                        break;
                    }
                }
                if (x !== npcSpawn.x || y !== npcSpawn.y) break;
            }

            // Create NPC instance
            const npc = new NPC(npcSpawn.type, x, y);
            npcs.push(npc);
        }
    } else {
        // Fallback to procedural NPC generation
        if (mapType === 'city') {
            // Ciudad: Colocar varios NPCs usando la clase NPC
            const cityNPCs = [
                { type: 'merchant_general', x: 25, y: 15 },
                { type: 'blacksmith_ullathorpe', x: 18, y: 22 },
                { type: 'guard_city', x: 32, y: 18 },
                { type: 'banker_city', x: 20, y: 10 }
            ];

            for (const npcSpawn of cityNPCs) {
                // Buscar posición walkable cercana
                let x = npcSpawn.x;
                let y = npcSpawn.y;

                // Ajustar si no es walkable
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        const testX = npcSpawn.x + dx;
                        const testY = npcSpawn.y + dy;
                        if (testX > 0 && testX < MAP_WIDTH - 1 &&
                            testY > 0 && testY < MAP_HEIGHT - 1 &&
                            isWalkable(gameState.map, testX, testY)) {
                            x = testX;
                            y = testY;
                            break;
                        }
                    }
                }

                // Crear instancia de NPC usando la clase NPC
                const npc = new NPC(npcSpawn.type, x, y);
                npcs.push(npc);
            }
        } else if (mapType === 'market') {
            // Mercado: Mercader y Alquimista
            const marketNPCs = [
                { type: 'merchant_general', x: 15, y: 12 },
                { type: 'alchemist_market', x: 25, y: 18 }
            ];

            for (const npcSpawn of marketNPCs) {
                let x = npcSpawn.x;
                let y = npcSpawn.y;

                // Buscar posición walkable cercana
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        const testX = npcSpawn.x + dx;
                        const testY = npcSpawn.y + dy;
                        if (testX > 0 && testX < MAP_WIDTH - 1 &&
                            testY > 0 && testY < MAP_HEIGHT - 1 &&
                            isWalkable(gameState.map, testX, testY)) {
                            x = testX;
                            y = testY;
                            break;
                        }
                    }
                }

                const npc = new NPC(npcSpawn.type, x, y);
                npcs.push(npc);
            }
        } else if (mapType === 'field') {
            // Campo: Entrenador y un mercader
            const fieldNPCs = [
                { type: 'trainer_skills', x: 30, y: 25 },
                { type: 'merchant_general', x: 15, y: 10 }
            ];

            for (const npcSpawn of fieldNPCs) {
                let x = npcSpawn.x;
                let y = npcSpawn.y;

                // Buscar posición walkable cercana
                for (let dy = -3; dy <= 3; dy++) {
                    for (let dx = -3; dx <= 3; dx++) {
                        const testX = npcSpawn.x + dx;
                        const testY = npcSpawn.y + dy;
                        if (testX > 0 && testX < MAP_WIDTH - 1 &&
                            testY > 0 && testY < MAP_HEIGHT - 1 &&
                            isWalkable(gameState.map, testX, testY)) {
                            x = testX;
                            y = testY;
                            break;
                        }
                    }
                }

                const npc = new NPC(npcSpawn.type, x, y);
                npcs.push(npc);
            }
        }
    }

    console.log(`Generated ${npcs.length} NPCs for map: ${mapType}`);
    return npcs;
}

/**
 * Find a safe walkable position for placing objects/portals
 * @param {number} preferredX - Preferred X coordinate
 * @param {number} preferredY - Preferred Y coordinate
 * @param {number} maxAttempts - Maximum attempts to find position
 * @returns {Object|null} Position object {x, y} or null if not found
 */
function findSafeWalkablePosition(preferredX, preferredY, maxAttempts = 50) {
    // First, try the preferred position
    if (isWalkable(gameState.map, preferredX, preferredY)) {
        return { x: preferredX, y: preferredY };
    }

    // Search in expanding circles around preferred position
    for (let radius = 1; radius < 10; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                    const x = preferredX + dx;
                    const y = preferredY + dy;

                    if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
                        if (isWalkable(gameState.map, x, y)) {
                            return { x, y };
                        }
                    }
                }
            }
        }
    }

    // Last resort: find ANY walkable position
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
        const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;

        if (isWalkable(gameState.map, x, y)) {
            return { x, y };
        }
    }

    return null; // Failed to find position
}

/**
 * Find nearest walkable tile to a given position
 * @param {Array} map - Map to check
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @returns {Object|null} Position object {x, y} or null if not found
 */
function findNearestWalkableTile(map, startX, startY) {
    // Search in expanding circles around the target position
    for (let radius = 0; radius < 10; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                // Only check perimeter of current radius
                if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                    const x = startX + dx;
                    const y = startY + dy;

                    if (isWalkable(map, x, y)) {
                        return { x, y };
                    }
                }
            }
        }
    }
    return null; // No walkable tile found nearby
}

/**
 * Check if a position is walkable on a specific map
 * @param {Array} map - Map to check
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if the position is walkable
 */
function isWalkableOnMap(map, x, y) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;

    const tile = map[y][x];
    return tile === TILES.GRASS || tile === TILES.FLOOR || tile === TILES.PATH;
}
