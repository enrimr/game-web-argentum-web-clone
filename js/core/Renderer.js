/**
 * Renderer.js
 * Sistema de renderizado del juego
 */

import { gameState, isBuildingVisible, getBuildingId } from '../state.js';
import { CONFIG } from '../config.js';
import { generateAllSprites } from '../graphics/SpriteGenerator.js';
import { TILES, isRoof, isWindowAboveDoor } from '../world/TileTypes.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';
import { shouldRenderRoof, shouldRenderWindow, isInsideCurrentBuilding } from '../systems/BuildingSystem.js';

const { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, MAP_WIDTH, MAP_HEIGHT } = CONFIG;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load sprites
const sprites = generateAllSprites(TILE_SIZE);

// Debug visibility controls for each layer
export const layerVisibility = {
    baseMap: true,
    doorLayer: true,
    windowLayer: true,
    roofLayer: true,
    objects: true,
    npcs: true,
    enemies: true,
    player: true,
    buildings: true  // Control para mostrar/ocultar casas completas
};

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

    // Draw base map (only visible tiles)
    renderMap(camera);
    
    // Draw door layer over the map but under entities
    renderDoorLayer(camera);
    
    // Draw objects, entities, NPCs, etc.
    renderObjects(camera);
    renderEnemies(camera);
    renderNPCs(camera);
    renderProjectiles(camera);
    
    // Draw player at correct position in viewport
    renderPlayer(camera);
    
    // Draw window layer, so it appears on top of player but below roofs
    renderWindowLayer(camera);
    
    // Draw roof layer last, so it appears on top of everything
    renderRoofLayer(camera);
}

/**
 * Render the map tiles (base layer only)
 * @param {Object} camera - Camera position {x, y}
 */
function renderMap(camera) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.baseMap) return;

    // Validate map exists
    if (!gameState.map || !Array.isArray(gameState.map) || gameState.map.length === 0) {
        console.error('Renderer: gameState.map is invalid');
        return;
    }

    for (let vy = 0; vy < VIEWPORT_HEIGHT; vy++) {
        for (let vx = 0; vx < VIEWPORT_WIDTH; vx++) {
            const worldX = camera.x + vx;
            const worldY = camera.y + vy;

            // Check bounds and validate row exists
            if (worldX >= 0 && worldX < MAP_WIDTH && worldY >= 0 && worldY < MAP_HEIGHT) {
                // Validate row exists
                if (!gameState.map[worldY] || !Array.isArray(gameState.map[worldY])) {
                    console.warn(`Renderer: fila ${worldY} del mapa es inválida`);
                    continue;
                }

                // Validate column exists
                if (worldX >= gameState.map[worldY].length) {
                    console.warn(`Renderer: columna ${worldX} en fila ${worldY} no existe`);
                    continue;
                }

                // Comprobar si hay una puerta en la capa de puertas
                // Si la hay, no dibujamos el tile del mapa en esta posición
                let hasDoor = false;
                if (gameState.doorLayer && 
                    gameState.doorLayer[worldY] && 
                    gameState.doorLayer[worldY][worldX] !== undefined && 
                    gameState.doorLayer[worldY][worldX] !== 0) {
                    hasDoor = true;
                }

                const tile = gameState.map[worldY][worldX];
                
                // Skip roof tiles, door tiles, and window tiles above doors if player is inside
                // - Roof tiles are rendered in the roof layer
                // - Door tiles are rendered in the door layer
                // - Window tiles above doors should disappear when inside like roofs
                if (isRoof(tile) || hasDoor) {
                    continue;
                }

                // Ya no necesitamos comprobar las ventanas aquí, porque ahora están en su propia capa
                
                // Verificar si es una parte de un edificio (pared)
                const isBuildingWall = tile === TILES.BUILDING || tile === TILES.WALL_INTERIOR;
                if (isBuildingWall) {
                    // Verificar si la opción global de mostrar edificios está desactivada
                    if (!layerVisibility.buildings) {
                        continue; // No renderizar paredes de edificios si están desactivados globalmente
                    }
                    
                    // Verificar si este edificio en particular está oculto
                    // Primero encontrar a qué edificio pertenece esta pared
                    let buildingFound = false;
                    for (const building of gameState.buildings) {
                        // Comprobar si esta posición está en el perímetro del edificio
                        if (worldX >= building.x - 1 && worldX <= building.x + building.width + 1 &&
                            worldY >= building.y - 1 && worldY <= building.y + building.height + 1) {
                            
                            // Verificar visibilidad específica del edificio
                            const buildingId = getBuildingId(gameState.currentMap, building.x, building.y, building.width, building.height);
                            if (!isBuildingVisible(buildingId)) {
                                buildingFound = true;
                                continue; // No renderizar este edificio en particular si está oculto
                            }
                            break;
                        }
                    }
                    
                    if (buildingFound) continue;
                }

                const sprite = getTileSprite(tile);

                if (sprite) {
                    const screenPos = worldToScreen(worldX, worldY);
                    
                    // Si el jugador está dentro de un edificio, mostrar el interior con claridad
                    // y el exterior ligeramente oscurecido para dar sensación de profundidad
                    if (gameState.playerInBuilding) {
                        const isInsideBuilding = isInsideCurrentBuilding(worldX, worldY);
                        
                        // Si es el exterior (no estamos dentro de este edificio), aplicar un filtro
                        if (!isInsideBuilding) {
                            // Mostrar el exterior con menor opacidad
                            ctx.globalAlpha = 0.7; // Valor entre 0 y 1 (0 = invisible, 1 = totalmente visible)
                            ctx.drawImage(sprite, screenPos.x, screenPos.y);
                            ctx.globalAlpha = 1.0; // Restaurar transparencia para el resto de elementos
                            continue;
                        }
                    }

                    // Dibujar normalmente si no hay restricciones
                    ctx.drawImage(sprite, screenPos.x, screenPos.y);
                }
            }
        }
    }
}

/**
 * Render the door layer (between map and entities)
 * @param {Object} camera - Camera position {x, y}
 */
function renderDoorLayer(camera) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.doorLayer) return;
    
    // Validate door layer exists
    if (!gameState.doorLayer || !Array.isArray(gameState.doorLayer) || gameState.doorLayer.length === 0) {
        return; // No door layer to render
    }

    for (let vy = 0; vy < VIEWPORT_HEIGHT; vy++) {
        for (let vx = 0; vx < VIEWPORT_WIDTH; vx++) {
            const worldX = camera.x + vx;
            const worldY = camera.y + vy;

            // Check bounds and validate row exists
            if (worldX >= 0 && worldX < MAP_WIDTH && worldY >= 0 && worldY < MAP_HEIGHT &&
                gameState.doorLayer[worldY] && gameState.doorLayer[worldY][worldX] !== undefined) {
                
                const doorTile = gameState.doorLayer[worldY][worldX];
                
                // Skip empty tiles
                if (doorTile === 0) {
                    continue;
                }
                
                // Get the sprite for this door
                const doorSprite = getTileSprite(doorTile);
                if (doorSprite) {
                    const screenPos = worldToScreen(worldX, worldY);
                    
                    // IMPORTANTE: Las puertas siempre deben ser visibles, especialmente
                    // las del edificio actual, ya que son necesarias para entrar/salir
                    if (gameState.playerInBuilding && gameState.currentBuilding) {
                        // Comprobar si esta puerta pertenece al edificio actual
                        const building = gameState.currentBuilding;
                        
                        // Ampliamos el margen para asegurarnos de incluir las puertas en el perímetro
                        const margin = 1;
                        const isDoorOfCurrentBuilding = 
                            worldX >= building.x - margin && worldX <= building.x + building.width + margin &&
                            worldY >= building.y - margin && worldY <= building.y + building.height + margin;
                            
                        // Si NO es una puerta del edificio actual y estamos dentro de un edificio,
                        // aplicamos un filtro de transparencia pero sin ocultarla completamente
                        if (!isDoorOfCurrentBuilding) {
                            ctx.globalAlpha = 0.7; // Transparencia para puertas de otros edificios
                            ctx.drawImage(doorSprite, screenPos.x, screenPos.y);
                            ctx.globalAlpha = 1.0; // Restaurar para el resto de elementos
                            continue;
                        }
                        // Las puertas del edificio actual se dibujan normalmente
                    }
                    
                    // Dibujar la puerta en su posición
                    ctx.drawImage(doorSprite, screenPos.x, screenPos.y);
                }
            }
        }
    }
}

/**
 * Render the window layer (windows above doors and regular windows)
 * @param {Object} camera - Camera position {x, y}
 */
function renderWindowLayer(camera) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.windowLayer) return;
    
    // Validate window layer exists
    if (!gameState.windowLayer || !Array.isArray(gameState.windowLayer) || gameState.windowLayer.length === 0) {
        return;
    }

    for (let vy = 0; vy < VIEWPORT_HEIGHT; vy++) {
        for (let vx = 0; vx < VIEWPORT_WIDTH; vx++) {
            const worldX = camera.x + vx;
            const worldY = camera.y + vy;

            // Check bounds and validate row exists
            if (worldX >= 0 && worldX < MAP_WIDTH && worldY >= 0 && worldY < MAP_HEIGHT && 
                gameState.windowLayer[worldY] && gameState.windowLayer[worldY][worldX]) {
                
                const windowTile = gameState.windowLayer[worldY][worldX];
                
                // Skip empty window tiles
                if (windowTile === 0) {
                    continue;
                }
                
                // Check if this window should be rendered
                // If player is in this building, the window should be hidden
                const shouldShow = shouldRenderWindow(worldX, worldY);
                
                if (shouldShow) {
                    const sprite = getTileSprite(windowTile);
                    if (sprite) {
                        const screenPos = worldToScreen(worldX, worldY);
                        ctx.drawImage(sprite, screenPos.x, screenPos.y);
                    }
                }
            }
        }
    }
}

/**
 * Render the roof layer on top of everything else
 * @param {Object} camera - Camera position {x, y}
 */
function renderRoofLayer(camera) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.roofLayer) return;
    
    // Validate roof layer exists
    if (!gameState.roofLayer || !Array.isArray(gameState.roofLayer) || gameState.roofLayer.length === 0) {
        return;
    }

    for (let vy = 0; vy < VIEWPORT_HEIGHT; vy++) {
        for (let vx = 0; vx < VIEWPORT_WIDTH; vx++) {
            const worldX = camera.x + vx;
            const worldY = camera.y + vy;

            // Check bounds and validate row exists
            if (worldX >= 0 && worldX < MAP_WIDTH && worldY >= 0 && worldY < MAP_HEIGHT && 
                gameState.roofLayer[worldY] && gameState.roofLayer[worldY][worldX]) {
                
                const roofTile = gameState.roofLayer[worldY][worldX];
                
                // Skip empty roof tiles
                if (roofTile === 0) {
                    continue;
                }
                
                // Check if this roof should be rendered
                // If player is in this building, on a door, or has visited it before, don't render the roof
                const shouldShow = shouldRenderRoof(worldX, worldY);
                
                if (shouldShow) {
                    const sprite = getTileSprite(roofTile);
                    if (sprite) {
                        const screenPos = worldToScreen(worldX, worldY);
                        ctx.drawImage(sprite, screenPos.x, screenPos.y);
                    }
                }
            }
        }
    }
}

// Ya no necesitamos la función isPartOfVisitedBuilding porque ahora usamos shouldRenderWindow desde BuildingSystem.js

/**
 * Helper function to get the building containing a specific tile
 * @param {number} x - Tile X coordinate
 * @param {number} y - Tile Y coordinate
 * @returns {Object|null} Building object or null if not in a building
 */
function getBuildingForTile(x, y) {
    for (const building of gameState.buildings) {
        if (x >= building.x && x < building.x + building.width &&
            y >= building.y && y < building.y + building.height) {
            return building;
        }
    }
    return null;
}

/**
 * Render debug coordinates for each tile
 * @param {number} screenX - Screen X position
 * @param {number} screenY - Screen Y position
 * @param {number} worldX - World X coordinate
 * @param {number} worldY - World Y coordinate
 */
function renderDebugCoordinates(screenX, screenY, worldX, worldY) {
    ctx.save();

    // Fondo semi-transparente para el texto
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(screenX, screenY, TILE_SIZE, 20);

    // Texto de coordenadas
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${worldX},${worldY}`, screenX + TILE_SIZE/2, screenY + 14);

    ctx.restore();
}

/**
 * Render objects (chests, gold, items, portals)
 * @param {Object} camera - Camera position {x, y}
 */
function renderObjects(camera) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.objects) return;
    
    for (const obj of gameState.objects) {
        // Si estamos dentro de un edificio, solo mostrar objetos dentro del mismo
        if (gameState.playerInBuilding && !isInsideCurrentBuilding(obj.x, obj.y)) {
            continue;
        }
        
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
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.enemies) return;
    
    for (const enemy of gameState.enemies) {
        // Si estamos dentro de un edificio, solo mostrar enemigos dentro del mismo
        if (gameState.playerInBuilding && !isInsideCurrentBuilding(enemy.x, enemy.y)) {
            continue;
        }
        
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
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.npcs) return;
    
    for (const npc of gameState.npcs) {
        // Si estamos dentro de un edificio, solo mostrar NPCs dentro del mismo
        if (gameState.playerInBuilding && !isInsideCurrentBuilding(npc.x, npc.y)) {
            continue;
        }
        
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
        // Si estamos dentro de un edificio, solo mostrar proyectiles dentro del mismo
        if (gameState.playerInBuilding && !isInsideCurrentBuilding(projectile.x, projectile.y)) {
            continue;
        }
        
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
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.player) return;
    
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
        // Interior building tiles
        case TILES.DOOR_OPEN_LEFT: return sprites.doorOpenLeft;
        case TILES.DOOR_OPEN_RIGHT: return sprites.doorOpenRight;
        case TILES.DOOR_CLOSED_LEFT: return sprites.doorClosedLeft;
        case TILES.DOOR_CLOSED_RIGHT: return sprites.doorClosedRight;
        case TILES.WALL_INTERIOR: return sprites.wallInterior;
        case TILES.FLOOR_INTERIOR: return sprites.floorInterior;
        case TILES.ROOF: return sprites.roof;
        case TILES.WINDOW: return sprites.window;
        case TILES.WINDOW_WALKABLE: return sprites.window; // Usar el mismo sprite de ventana normal
        case TILES.DOOR_SHADOW: return sprites.doorShadow;
        case TILES.FACADE: return sprites.facade;
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
