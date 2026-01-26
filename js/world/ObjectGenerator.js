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

    // Add resource gathering objects (trees, veins, etc.)
    addResourceObjects(objects, mapType);
    
    // Convert prop tiles to harvestable resources
    convertPropTilesToResources(objects);

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

    // First check if it's a static map with defined enemies
    const staticMap = getStaticMap(mapType);
    if (staticMap && staticMap.enemies && staticMap.enemies.enabled) {
        // Use static map enemy definitions
        console.log(`Generando enemigos para mapa estático: ${mapType}`);
        
        for (const enemyDef of staticMap.enemies.types) {
            const enemyStats = ENEMY_STATS[enemyDef.type];
            if (!enemyStats) {
                console.error(`Enemy type ${enemyDef.type} not found in ENEMY_STATS`);
                continue;
            }

            // Generate specified count of this enemy type
            for (let i = 0; i < enemyDef.count; i++) {
                let x, y;
                let attempts = 0;
                const maxAttempts = 50;

                // Try to find a valid spawn position
                do {
                    x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                    y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
                    attempts++;
                } while (!isWalkable(gameState.map, x, y) && attempts < maxAttempts);

                if (attempts >= maxAttempts) {
                    console.warn(`Could not find spawn position for ${enemyDef.type}`);
                    continue;
                }

                enemies.push({
                    type: enemyDef.type,
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

        console.log(`✅ Generados ${enemies.length} enemigos para ${mapType}`);
        return enemies;
    }

    // Fallback to procedural enemy generation
    if (mapType === 'field' || mapType === 'newbie_field') {
        // Field - mix of various enemy types
        const enemyTypes = ['goblin', 'skeleton', 'bandit', 'elemental'];
        const enemyCounts = {
            'goblin': 8,     // Más comunes
            'skeleton': 6,   // Bastante comunes
            'bandit': 4,     // Menos comunes
            'elemental': 2   // Raros
        };
        
        // Generar enemigos según su frecuencia
        for (const enemyType of enemyTypes) {
            const count = enemyCounts[enemyType];
            
            for (let i = 0; i < count; i++) {
                let x, y;
                do {
                    x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                    y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
                } while (gameState.map[y][x] !== TILES.GRASS);
    
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
    } else if (mapType === 'forest' || mapType === 'dark_forest') {
        // Tipos de enemigos según dificultad
        let enemyTypes;
        let enemyCounts;
        let totalEnemies;
        
        if (mapType === 'dark_forest') {
            // Bosque oscuro - enemigos más fuertes y en mayor número
            enemyTypes = ['goblin', 'skeleton', 'elemental', 'orc', 'troll', 'demon', 'dragon'];
            enemyCounts = {
                'goblin': 4,     // Débiles pero siguen presentes
                'skeleton': 4,   // Débiles pero siguen presentes
                'elemental': 6,  // Más comunes que en bosques normales
                'orc': 6,        // Enemigos de fuerza media
                'troll': 3,      // Enemigos fuertes
                'demon': 3,      // Enemigos muy fuertes
                'dragon': 1      // Jefe del área
            };
            totalEnemies = 27;   // Mayor densidad de enemigos
        } else {
            // Bosque normal - enemigos estándar
            enemyTypes = ['goblin', 'skeleton', 'elemental'];
            enemyCounts = {
                'goblin': 8,
                'skeleton': 6,
                'elemental': 4
            };
            totalEnemies = 18;
        }

        // Generar enemigos según su tipo y cantidad
        for (const enemyType of enemyTypes) {
            const count = enemyCounts[enemyType] || 0;
            
            for (let i = 0; i < count; i++) {
                let x, y;
                do {
                    x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                    y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
                } while (gameState.map[y][x] !== TILES.GRASS);
    
                const enemyStats = ENEMY_STATS[enemyType];
                
                // Añadir más vida a los enemigos del bosque oscuro
                let hp = enemyStats.hp;
                if (mapType === 'dark_forest' && ['orc', 'troll', 'demon', 'dragon'].includes(enemyType)) {
                    hp = Math.floor(hp * 1.2); // 20% más de vida
                }
    
                enemies.push({
                    type: enemyType,
                    x: x,
                    y: y,
                    hp: hp,
                    maxHp: hp,
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

            // Create NPC instance with currentMap
            const npc = new NPC(npcSpawn.type, x, y, mapType);
            npcs.push(npc);
        }
    } else {
        // Fallback to procedural NPC generation
        if (mapType === 'city' || mapType === 'newbie_city') {
            // Ciudad: Colocar varios NPCs usando la clase NPC
            const cityNPCs = [
                { type: 'merchant_general', x: 25, y: 15 },
                { type: 'blacksmith_ullathorpe', x: 18, y: 22 },
                { type: 'guard_city', x: 32, y: 18 },
                { type: 'banker_city', x: 20, y: 10 },
                { type: 'healer_city', x: 15, y: 15 }  // Añadido sacerdote curandero que puede resucitar al jugador
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

                // Crear instancia de NPC usando la clase NPC con currentMap
                const npc = new NPC(npcSpawn.type, x, y, mapType);
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

                const npc = new NPC(npcSpawn.type, x, y, mapType);
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

                const npc = new NPC(npcSpawn.type, x, y, mapType);
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
    // Validate gameState.map exists and is valid
    if (!gameState.map || !Array.isArray(gameState.map) || gameState.map.length === 0) {
        console.error("findSafeWalkablePosition: gameState.map is invalid", {
            exists: !!gameState.map,
            isArray: Array.isArray(gameState.map),
            length: gameState.map?.length
        });
        return { x: preferredX, y: preferredY }; // Fall back to preferred position
    }

    // First, try the preferred position with validation
    try {
        if (isWalkable(gameState.map, preferredX, preferredY)) {
            return { x: preferredX, y: preferredY };
        }
    } catch (error) {
        console.error("Error checking if preferred position is walkable:", error);
    }

    // Search in expanding circles around preferred position
    for (let radius = 1; radius < 10; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                    const x = preferredX + dx;
                    const y = preferredY + dy;

                    if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
                        try {
                            if (isWalkable(gameState.map, x, y)) {
                                return { x, y };
                            }
                        } catch (error) {
                            console.error(`Error checking if position (${x}, ${y}) is walkable:`, error);
                            continue;
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

        try {
            if (isWalkable(gameState.map, x, y)) {
                return { x, y };
            }
        } catch (error) {
            console.error(`Error checking if position (${x}, ${y}) is walkable:`, error);
            continue;
        }
    }

    console.warn("findSafeWalkablePosition: Could not find any walkable position, returning preferred position");
    return { x: preferredX, y: preferredY }; // Last resort, return the preferred position even if not walkable
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

/**
 * Add resource gathering objects to the map
 * @param {Array} objects - Array of objects to add resources to
 * @param {string} mapType - Current map type
 */
function addResourceObjects(objects, mapType) {
    // Determine which resources to add based on map type
    const resourceConfig = {
        'field': [
            { type: 'TREE', count: 15, tile: TILES.GRASS },
            { type: 'IRON_VEIN', count: 5, tile: TILES.GRASS }
        ],
        'newbie_field': [
            { type: 'TREE', count: 20, tile: TILES.GRASS },
            { type: 'IRON_VEIN', count: 3, tile: TILES.GRASS }
        ],
        'forest': [
            { type: 'TREE', count: 30, tile: TILES.GRASS }
        ],
        'dark_forest': [
            { type: 'TREE', count: 25, tile: TILES.GRASS },
            { type: 'IRON_VEIN', count: 8, tile: TILES.GRASS }
        ],
        'dungeon': [
            { type: 'IRON_VEIN', count: 10, tile: TILES.FLOOR },
            { type: 'SILVER_VEIN', count: 5, tile: TILES.FLOOR }
        ],
        'deep_dungeon': [
            { type: 'SILVER_VEIN', count: 8, tile: TILES.FLOOR },
            { type: 'GOLD_VEIN', count: 5, tile: TILES.FLOOR }
        ],
        'mountain_pass_lower': [
            { type: 'TREE', count: 10, tile: TILES.GRASS },
            { type: 'IRON_VEIN', count: 8, tile: TILES.GRASS }
        ],
        'mountain_pass_middle': [
            { type: 'TREE', count: 5, tile: TILES.GRASS },
            { type: 'IRON_VEIN', count: 10, tile: TILES.GRASS },
            { type: 'SILVER_VEIN', count: 5, tile: TILES.GRASS }
        ],
        'mountain_pass_upper': [
            { type: 'IRON_VEIN', count: 12, tile: TILES.GRASS },
            { type: 'SILVER_VEIN', count: 8, tile: TILES.GRASS },
            { type: 'GOLD_VEIN', count: 3, tile: TILES.GRASS }
        ],
        'mountain_peak': [
            { type: 'SILVER_VEIN', count: 10, tile: TILES.GRASS },
            { type: 'GOLD_VEIN', count: 6, tile: TILES.GRASS }
        ],
        'newbie_city': [
            { type: 'TREE', count: 8, tile: TILES.GRASS },
            { type: 'IRON_VEIN', count: 5, tile: TILES.GRASS }
        ],
        'city': [
            { type: 'TREE', count: 5, tile: TILES.GRASS },
            { type: 'IRON_VEIN', count: 3, tile: TILES.GRASS }
        ],
        'training_fields': [
            { type: 'TREE', count: 12, tile: TILES.GRASS },
            { type: 'IRON_VEIN', count: 6, tile: TILES.GRASS }
        ]
    };

    const resources = resourceConfig[mapType];
    if (!resources) return; // No resources for this map type

    // Add each type of resource
    for (const resourceDef of resources) {
        const maxAttempts = 100;
        let added = 0;

        while (added < resourceDef.count) {
            let x, y;
            let attempts = 0;

            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
                attempts++;
            } while (
                (gameState.map[y][x] !== resourceDef.tile || 
                 objects.some(obj => obj.x === x && obj.y === y)) && 
                attempts < maxAttempts
            );

            if (attempts >= maxAttempts) {
                console.warn(`Could not place resource ${resourceDef.type}, stopping after ${added} placed`);
                break;
            }

            // Add resource object
            objects.push({
                type: 'resource',
                resourceType: resourceDef.type,
                x: x,
                y: y,
                depleted: false,
                sprite: getResourceSprite(resourceDef.type)
            });

            added++;
        }

        console.log(`Added ${added} ${resourceDef.type} resources to ${mapType}`);
    }
}

/**
 * Get the sprite name for a resource type
 * @param {string} resourceType - Resource type
 * @returns {string} Sprite name
 */
function getResourceSprite(resourceType) {
    const spriteMap = {
        'TREE': 'tree',
        'IRON_VEIN': 'ironVein',
        'GOLD_VEIN': 'goldVein',
        'SILVER_VEIN': 'silverVein',
        'SHEEP': 'sheep'
    };
    return spriteMap[resourceType] || 'tree';
}

/**
 * Convert prop layer tiles to harvestable resources
 * Reads the propLayer and creates resource objects for specific tiles
 * @param {Array} objects - Array of objects to add resources to
 */
function convertPropTilesToResources(objects) {
    // Mapping of tile IDs to resource types
    const tileToResource = {
        2: 'TREE',      // Tile 2 = árbol pequeño
        3: 'TREE',      // Tile 3 = árbol grande
        // Puedes agregar más mappings aquí en el futuro
        // 10: 'IRON_VEIN', etc.
    };

    // Verificar que propLayer existe
    if (!gameState.propLayer || !Array.isArray(gameState.propLayer)) {
        return; // No prop layer to process
    }

    let converted = 0;

    // Recorrer la capa de props
    for (let y = 0; y < gameState.propLayer.length; y++) {
        if (!gameState.propLayer[y]) continue;
        
        for (let x = 0; x < gameState.propLayer[y].length; x++) {
            const propTile = gameState.propLayer[y][x];
            
            // Si el tile está en el mapping, convertirlo a recurso
            if (propTile && tileToResource[propTile]) {
                const resourceType = tileToResource[propTile];
                
                // Verificar que no haya ya un objeto en esta posición
                const hasObject = objects.some(obj => obj.x === x && obj.y === y);
                if (!hasObject) {
                    objects.push({
                        type: 'resource',
                        resourceType: resourceType,
                        x: x,
                        y: y,
                        depleted: false,
                        sprite: getResourceSprite(resourceType),
                        fromPropLayer: true  // Marcador para saber que viene de propLayer
                    });
                    converted++;
                }
            }
        }
    }

    if (converted > 0) {
        console.log(`✅ Convertidos ${converted} tiles de propLayer en recursos talables`);
    }
}
