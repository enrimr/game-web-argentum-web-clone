/**
 * Renderer.js
 * Sistema de renderizado del juego
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { generateAllSprites } from '../graphics/SpriteGenerator.js';
import { TILES } from '../world/TileTypes.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';

const { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, MAP_WIDTH, MAP_HEIGHT } = CONFIG;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load sprites
const sprites = generateAllSprites(TILE_SIZE);

/**
 * Render the entire game
 */
export function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const camera = getCameraPosition();

    // Draw map (only visible tiles)
    renderMap(camera);

    // Draw objects (only visible ones)
    renderObjects(camera);

    // Draw enemies (only visible ones)
    renderEnemies(camera);

    // Draw NPCs (only visible ones)
    renderNPCs(camera);

    // Draw projectiles (arrows, etc.) - only visible ones
    renderProjectiles(camera);

    // Draw player at correct position in viewport
    renderPlayer(camera);
}

/**
 * Render the map tiles
 * @param {Object} camera - Camera position {x, y}
 */
function renderMap(camera) {
    for (let vy = 0; vy < VIEWPORT_HEIGHT; vy++) {
        for (let vx = 0; vx < VIEWPORT_WIDTH; vx++) {
            const worldX = camera.x + vx;
            const worldY = camera.y + vy;

            // Check bounds
            if (worldX >= 0 && worldX < MAP_WIDTH && worldY >= 0 && worldY < MAP_HEIGHT) {
                const tile = gameState.map[worldY][worldX];
                const sprite = getTileSprite(tile);

                if (sprite) {
                    const screenPos = worldToScreen(worldX, worldY);
                    ctx.drawImage(sprite, screenPos.x, screenPos.y);
                }
            }
        }
    }
}

/**
 * Render objects (chests, gold, items, portals)
 * @param {Object} camera - Camera position {x, y}
 */
function renderObjects(camera) {
    for (const obj of gameState.objects) {
        if (isInViewport(obj.x, obj.y, camera)) {
            const screenPos = worldToScreen(obj.x, obj.y);

            if (obj.type === 'chest') {
                ctx.drawImage(sprites.chest, screenPos.x, screenPos.y);
            } else if (obj.type === 'gold') {
                ctx.drawImage(sprites.gold, screenPos.x, screenPos.y);
            } else if (obj.type === 'item') {
                // Draw item on ground (AO style)
                const itemSprite = sprites[ITEM_TYPES[obj.itemType].sprite];
                if (itemSprite) {
                    ctx.drawImage(itemSprite, screenPos.x, screenPos.y);
                }
            } else if (obj.type === 'portal') {
                // Draw portal (magical gateway)
                // Different sprites for different types of destinations
                if (obj.targetMap === 'city' || obj.targetMap === 'market' || obj.targetMap === 'castle') {
                    ctx.drawImage(sprites.portal, screenPos.x, screenPos.y);
                } else if (obj.targetMap === 'dungeon' || obj.targetMap === 'deep_dungeon') {
                    ctx.drawImage(sprites.dungeonDoor, screenPos.x, screenPos.y);
                } else {
                    // Default portal sprite for other destinations
                    ctx.drawImage(sprites.portal, screenPos.x, screenPos.y);
                }
            }
        }
    }
}

/**
 * Render enemies
 * @param {Object} camera - Camera position {x, y}
 */
function renderEnemies(camera) {
    for (const enemy of gameState.enemies) {
        if (isInViewport(enemy.x, enemy.y, camera)) {
            const screenPos = worldToScreen(enemy.x, enemy.y);

            // Choose sprite based on enemy type
            const enemySprite = getEnemySprite(enemy.type);

            ctx.drawImage(enemySprite, screenPos.x, screenPos.y);

            // Draw enemy health bar
            renderHealthBar(screenPos.x, screenPos.y, enemy.hp, enemy.maxHp);
        }
    }
}

/**
 * Render NPCs
 * @param {Object} camera - Camera position {x, y}
 */
function renderNPCs(camera) {
    for (const npc of gameState.npcs) {
        if (isInViewport(npc.x, npc.y, camera)) {
            const screenPos = worldToScreen(npc.x, npc.y);
            const npcSprite = sprites[npc.sprite];
            if (npcSprite) {
                ctx.drawImage(npcSprite, screenPos.x, screenPos.y);

                // Draw NPC name above sprite
                ctx.fillStyle = '#fbbf24';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name, screenPos.x + TILE_SIZE/2, screenPos.y - 2);
            }
        }
    }
}

/**
 * Render projectiles
 * @param {Object} camera - Camera position {x, y}
 */
function renderProjectiles(camera) {
    for (const projectile of gameState.projectiles) {
        if (isInViewport(projectile.x, projectile.y, camera)) {
            const screenPos = worldToScreen(projectile.x, projectile.y);
            ctx.drawImage(sprites.arrowProjectile, screenPos.x, screenPos.y);
        }
    }
}

/**
 * Render player
 * @param {Object} camera - Camera position {x, y}
 */
function renderPlayer(camera) {
    const playerScreenPos = worldToScreen(gameState.player.x, gameState.player.y);
    ctx.drawImage(sprites.player, playerScreenPos.x, playerScreenPos.y);
}

/**
 * Render a health bar
 * @param {number} x - Screen X position
 * @param {number} y - Screen Y position
 * @param {number} currentHp - Current HP
 * @param {number} maxHp - Maximum HP
 */
function renderHealthBar(x, y, currentHp, maxHp) {
    const barWidth = TILE_SIZE;
    const barHeight = 4;
    const healthPercent = currentHp / maxHp;

    ctx.fillStyle = '#000';
    ctx.fillRect(x, y - 6, barWidth, barHeight);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x, y - 6, barWidth * healthPercent, barHeight);
}

/**
 * Get camera position (centered on player, but allows reaching map edges)
 * @returns {Object} Camera position {x, y}
 */
function getCameraPosition() {
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;

    // Calculate camera top-left corner (centered on player)
    let cameraX = playerX - Math.floor(VIEWPORT_WIDTH / 2);
    let cameraY = playerY - Math.floor(VIEWPORT_HEIGHT / 2);

    // Clamp camera to map boundaries, but allow player to reach viewport edges
    cameraX = Math.max(0, Math.min(cameraX, MAP_WIDTH - VIEWPORT_WIDTH));
    cameraY = Math.max(0, Math.min(cameraY, MAP_HEIGHT - VIEWPORT_HEIGHT));

    return { x: cameraX, y: cameraY };
}

/**
 * Check if a world position is visible in the current viewport
 * @param {number} worldX - World X coordinate
 * @param {number} worldY - World Y coordinate
 * @param {Object} camera - Camera position {x, y}
 * @returns {boolean} True if position is in viewport
 */
function isInViewport(worldX, worldY, camera = getCameraPosition()) {
    return worldX >= camera.x &&
           worldX < camera.x + VIEWPORT_WIDTH &&
           worldY >= camera.y &&
           worldY < camera.y + VIEWPORT_HEIGHT;
}

/**
 * Convert world coordinates to screen coordinates
 * @param {number} worldX - World X coordinate
 * @param {number} worldY - World Y coordinate
 * @returns {Object} Screen position {x, y}
 */
function worldToScreen(worldX, worldY) {
    const camera = getCameraPosition();
    const screenX = (worldX - camera.x) * TILE_SIZE;
    const screenY = (worldY - camera.y) * TILE_SIZE;
    return { x: screenX, y: screenY };
}

/**
 * Get sprite for a tile type
 * @param {number} tileType - Tile type number
 * @returns {Image} Sprite image or null
 */
function getTileSprite(tileType) {
    switch (tileType) {
        case TILES.GRASS: return sprites.grass;
        case TILES.WATER: return sprites.water;
        case TILES.STONE: return sprites.stone;
        case TILES.TREE: return sprites.tree;
        case TILES.WALL: return sprites.wall;
        case TILES.BUILDING: return sprites.building;
        case TILES.FLOOR: return sprites.floor;
        case TILES.DUNGEON_WALL: return sprites.dungeonWall;
        case TILES.PATH: return sprites.path;
        default: return sprites.grass;
    }
}

/**
 * Get sprite for enemy type
 * @param {string} enemyType - Enemy type
 * @returns {Image} Enemy sprite
 */
function getEnemySprite(enemyType) {
    switch (enemyType) {
        case 'goblin': return sprites.enemy;
        case 'skeleton': return sprites.enemySkeleton;
        case 'orc': return sprites.enemy; // Reuse goblin sprite for orcs
        case 'bandit': return sprites.enemy; // Reuse goblin sprite for bandits
        case 'troll': return sprites.enemyTroll;
        case 'dragon': return sprites.enemyDragon;
        case 'elemental': return sprites.enemyElemental;
        case 'demon': return sprites.enemyDemon;
        default: return sprites.enemy;
    }
}
