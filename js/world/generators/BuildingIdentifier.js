/**
 * BuildingIdentifier.js
 * Funcionalidad para identificar y manejar estructuras de edificios en el mapa
 */

import { TILES } from '../TileTypes.js';
import { gameState } from '../../state.js';
import { CONFIG } from '../../config.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Extract roof tiles to a separate layer in the game state
 * @param {Array} mapData - 2D map array
 */
export function extractRoofLayer(mapData) {
    // Initialize roof layer and tree layer
    gameState.roofLayer = [];
    gameState.treeLayer = [];
    gameState.buildings = [];
    
    const height = mapData.length;
    const width = mapData[0].length;
    
    // Create empty roof layer and tree layer
    for (let y = 0; y < height; y++) {
        gameState.roofLayer[y] = [];
        gameState.treeLayer[y] = [];
        for (let x = 0; x < width; x++) {
            gameState.roofLayer[y][x] = 0; // Default: no roof
            gameState.treeLayer[y][x] = 0; // Default: no tree
        }
    }

    // Buscar árboles en el mapa y moverlos a la capa de árboles
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (mapData[y][x] === TILES.TREE) {
                // Mover el árbol a la capa de árboles
                gameState.treeLayer[y][x] = TILES.TREE;
                // Dejar el suelo original (grass) en la capa base
                mapData[y][x] = TILES.GRASS;
            }
        }
    }

    // Identify building structures
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Check for wall building tiles with potential roofs
            if (mapData[y][x] === TILES.BUILDING) {
                // Check if this is part of a larger building
                const building = findBuildingStructure(mapData, x, y);
                
                if (building) {
                    // Add building to the list if not already registered
                    if (!isBuildingRegistered(building)) {
                        gameState.buildings.push(building);
                        
                        // Create roof tiles over the building
                        for (let by = building.y; by < building.y + building.height; by++) {
                            for (let bx = building.x; bx < building.x + building.width; bx++) {
                                // Only place roof tiles over interior or building walls
                                if (mapData[by][bx] === TILES.BUILDING || 
                                    mapData[by][bx] === TILES.FLOOR_INTERIOR) {
                                    gameState.roofLayer[by][bx] = TILES.ROOF;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    console.log(`🏠 Identified and registered ${gameState.buildings.length} buildings with roofs`);
}

/**
 * Check if a building structure is already registered
 * @param {Object} building - Building structure object
 * @returns {boolean} True if building is already registered
 */
function isBuildingRegistered(building) {
    return gameState.buildings.some(b => 
        b.x === building.x && 
        b.y === building.y && 
        b.width === building.width && 
        b.height === building.height
    );
}

/**
 * Find a building structure starting from a building wall tile
 * @param {Array} mapData - 2D map array
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @returns {Object|null} Building bounds {x, y, width, height, doorX, doorY} or null
 */
function findBuildingStructure(mapData, startX, startY) {
    // Find building boundaries
    let minX = startX;
    let maxX = startX;
    let minY = startY;
    let maxY = startY;

    // Expand horizontally to find building edges
    while (minX > 0 && mapData[startY][minX - 1] === TILES.BUILDING) minX--;
    while (maxX < MAP_WIDTH - 1 && mapData[startY][maxX + 1] === TILES.BUILDING) maxX++;

    // Expand vertically to find building edges
    while (minY > 0 && mapData[minY - 1][startX] === TILES.BUILDING) minY--;
    while (maxY < MAP_HEIGHT - 1 && mapData[maxY + 1][startX] === TILES.BUILDING) maxY++;

    // Find door position
    let doorX = null;
    let doorY = null;
    
    // Check bottom edge for doors
    for (let x = minX; x <= maxX; x++) {
        if (maxY + 1 < MAP_HEIGHT && mapData[maxY + 1][x] === TILES.DOOR) {
            doorX = x;
            doorY = maxY + 1;
            break;
        }
    }
    
    // Check other edges if door not found on bottom
    if (doorX === null) {
        // Check top edge
        for (let x = minX; x <= maxX; x++) {
            if (minY - 1 >= 0 && mapData[minY - 1][x] === TILES.DOOR) {
                doorX = x;
                doorY = minY - 1;
                break;
            }
        }
    }
    
    if (doorX === null) {
        // Check left edge
        for (let y = minY; y <= maxY; y++) {
            if (minX - 1 >= 0 && mapData[y][minX - 1] === TILES.DOOR) {
                doorX = minX - 1;
                doorY = y;
                break;
            }
        }
    }
    
    if (doorX === null) {
        // Check right edge
        for (let y = minY; y <= maxY; y++) {
            if (maxX + 1 < MAP_WIDTH && mapData[y][maxX + 1] === TILES.DOOR) {
                doorX = maxX + 1;
                doorY = y;
                break;
            }
        }
    }
    
    // Create and return building object
    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        doorX: doorX,
        doorY: doorY
    };
}

/**
 * Identify and register all buildings in a map
 * @param {Array} mapData - 2D map array
 */
export function identifyBuildingsFromMap(mapData) {
    // Clear current buildings
    gameState.buildings = [];
    
    // Find all building structures and their doors
    const height = mapData.length;
    const width = height > 0 ? mapData[0].length : 0;
    
    const processedTiles = [];
    for (let y = 0; y < height; y++) {
        processedTiles[y] = [];
        for (let x = 0; x < width; x++) {
            processedTiles[y][x] = false;
        }
    }
    
    // Scan map for buildings
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // If this is a building tile that hasn't been processed yet
            if (mapData[y][x] === TILES.BUILDING && !processedTiles[y][x]) {
                // Find building boundaries
                const building = findBuildingStructure(mapData, x, y);
                
                if (building) {
                    // Mark all tiles in this building as processed
                    for (let by = building.y; by < building.y + building.height; by++) {
                        for (let bx = building.x; bx < building.x + building.width; bx++) {
                            if (by >= 0 && by < height && bx >= 0 && bx < width) {
                                processedTiles[by][bx] = true;
                            }
                        }
                    }
                    
                    // Add building to list
                    gameState.buildings.push(building);
                }
            }
        }
    }
    
    console.log(`🏠 Identified ${gameState.buildings.length} buildings in map`);
}
