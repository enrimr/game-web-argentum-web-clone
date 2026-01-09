/**
 * LayerRenderers.js
 * Renderiza las diferentes capas del mapa (base, techo, puertas, ventanas, etc.)
 */

import { gameState, isBuildingVisible, getBuildingId } from '../../state.js';
import { CONFIG } from '../../config.js';
import { TILES, isRoof, isWindowAboveDoor } from '../../world/TileTypes.js';
import { shouldRenderRoof, shouldRenderWindow, isInsideCurrentBuilding } from '../../systems/BuildingSystem.js';
import { isInViewport, worldToScreen, getBuildingForTile } from './RendererCore.js';
import { getTileSprite } from './SpriteHelpers.js';
import { layerVisibility } from './RendererCore.js';

const { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Render the map tiles (base layer only)
 * @param {Object} camera - Camera position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderMap(camera, ctx) {
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
 * Render the tree layer (between base map and entities)
 * @param {Object} camera - Camera position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderTreeLayer(camera, ctx) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.treeLayer) return;
    
    // Validate tree layer exists
    if (!gameState.treeLayer || !Array.isArray(gameState.treeLayer) || gameState.treeLayer.length === 0) {
        return; // No tree layer to render
    }

    for (let vy = 0; vy < VIEWPORT_HEIGHT; vy++) {
        for (let vx = 0; vx < VIEWPORT_WIDTH; vx++) {
            const worldX = camera.x + vx;
            const worldY = camera.y + vy;

            // Check bounds and validate row exists
            if (worldX >= 0 && worldX < MAP_WIDTH && worldY >= 0 && worldY < MAP_HEIGHT &&
                gameState.treeLayer[worldY] && gameState.treeLayer[worldY][worldX] !== undefined) {
                
                const treeTile = gameState.treeLayer[worldY][worldX];
                
                // Skip empty tiles
                if (treeTile === 0) {
                    continue;
                }
                
                // Get the sprite for this tree
                const treeSprite = getTileSprite(treeTile);
                if (treeSprite) {
                    const screenPos = worldToScreen(worldX, worldY);
                    
                    // Si el jugador está dentro de un edificio, aplicar el mismo filtro que se aplica al mapa base
                    if (gameState.playerInBuilding) {
                        const isInsideBuilding = isInsideCurrentBuilding(worldX, worldY);
                        
                        // Si es el exterior (no estamos dentro de este edificio), aplicar un filtro
                        if (!isInsideBuilding) {
                            ctx.globalAlpha = 0.7;
                            ctx.drawImage(treeSprite, screenPos.x, screenPos.y);
                            ctx.globalAlpha = 1.0;
                            continue;
                        }
                    }
                    
                    // Dibujar el árbol con transparencia
                    ctx.drawImage(treeSprite, screenPos.x, screenPos.y);
                }
            }
        }
    }
}

/**
 * Render the door layer (between map and entities)
 * @param {Object} camera - Camera position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderDoorLayer(camera, ctx) {
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
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderWindowLayer(camera, ctx) {
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
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderRoofLayer(camera, ctx) {
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
