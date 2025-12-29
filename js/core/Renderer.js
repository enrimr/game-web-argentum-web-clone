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
 * Update player animation frames
 * @param {number} deltaTime - Time elapsed since last update (ms)
 */
export function updatePlayerAnimation(deltaTime) {
    const { animation } = gameState.player;

    // Update animation frame timing
    animation.frameTime += deltaTime;

    // Check if it's time to advance to next frame
    if (animation.frameTime >= animation.frameDelay) {
        animation.frameTime = 0;

        // Advance frame based on animation state
        if (animation.state === 'walking') {
            animation.frame = (animation.frame + 1) % 4; // 4 frames for walking
        } else if (animation.state === 'attacking') {
            animation.frame = (animation.frame + 1) % 3; // 3 frames for attacking
        } else if (animation.state === 'talking') {
            animation.frame = (animation.frame + 1) % 2; // 2 frames for talking
        } else {
            // Idle state - minimal animation
            animation.frame = (animation.frame + 1) % 2; // 2 frames for idle
        }
    }
}

/**
 * Set player animation state
 * @param {string} state - New animation state ('idle', 'walking', 'attacking', 'talking')
 */
export function setPlayerAnimationState(state) {
    const { animation } = gameState.player;

    if (animation.state !== state) {
        animation.state = state;
        animation.frame = 0; // Reset frame when changing state
        animation.frameTime = 0; // Reset timing
    }
}

/**
 * Set player facing direction and update animation
 * @param {string} direction - Direction ('up', 'down', 'left', 'right')
 */
export function setPlayerFacing(direction) {
    if (gameState.player.facing !== direction) {
        gameState.player.facing = direction;
        // Reset animation frame when changing direction
        gameState.player.animation.frame = 0;
        gameState.player.animation.frameTime = 0;
    }
}

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
 * Render player with animations
 * @param {Object} camera - Camera position {x, y}
 */
function renderPlayer(camera) {
    const playerScreenPos = worldToScreen(gameState.player.x, gameState.player.y);

    // Get animated player sprite based on direction and animation state
    const playerSprite = getAnimatedPlayerSprite();

    ctx.drawImage(playerSprite, playerScreenPos.x, playerScreenPos.y);
}

/**
 * Get animated player sprite based on direction and animation state
 * @returns {Image} Player sprite for current animation frame
 */
function getAnimatedPlayerSprite() {
    const { facing, animation } = gameState.player;

    // Base sprite based on direction and animation state
    let spriteName;

    // Choose sprite based on animation state and direction
    if (animation.state === 'walking') {
        // For walking, use animated frames if available, otherwise base directional sprite
        const frameSuffix = animation.frame > 0 ? animation.frame.toString() : '';
        spriteName = `playerWalk${facing.charAt(0).toUpperCase() + facing.slice(1)}${frameSuffix}`;
    } else if (animation.state === 'attacking') {
        // For attacking, use animated frames if available
        const frameSuffix = animation.frame > 0 ? animation.frame.toString() : '';
        spriteName = `playerAttack${facing.charAt(0).toUpperCase() + facing.slice(1)}${frameSuffix}`;
    } else if (animation.state === 'talking') {
        // For talking, use animated frames if available
        const frameSuffix = animation.frame > 0 ? animation.frame.toString() : '';
        spriteName = `playerTalk${facing.charAt(0).toUpperCase() + facing.slice(1)}${frameSuffix}`;
    } else {
        // Idle state - use directional base sprites
        if (facing === 'up') {
            spriteName = 'playerUp';
        } else if (facing === 'down') {
            spriteName = 'player';
        } else if (facing === 'left') {
            spriteName = 'playerLeft';
        } else if (facing === 'right') {
            spriteName = 'playerRight';
        } else {
            spriteName = 'player';
        }
    }

    // Fallback chain: animated sprite -> directional sprite -> base player sprite
    return sprites[spriteName] ||
           sprites[`player${facing.charAt(0).toUpperCase() + facing.slice(1)}`] ||
           sprites.player;
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
 * Obtener posición de la cámara (centered on player, but allows reaching map edges)
 * @returns {Object} Camera position {x, y}
 */
export function getCameraPosition() {
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
