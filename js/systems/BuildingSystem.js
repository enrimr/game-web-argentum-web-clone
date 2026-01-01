/**
 * BuildingSystem.js
 * Sistema de manejo de edificios con capas y navegación interior
 */

import { gameState } from '../state.js';
import { TILES, isDoor, isRoof } from '../world/TileTypes.js';
import { CONFIG } from '../config.js';

/**
 * Check if player is entering a building through a door
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export function checkDoorEntry(x, y) {
    if (!isDoor(gameState.map[y][x])) return;

    // Find building boundaries around the door
    const buildingBounds = findBuildingBounds(x, y);
    if (!buildingBounds) return;

    // Toggle interior/exterior mode
    toggleBuildingInterior(buildingBounds);
}

/**
 * Find building boundaries around a door
 * @param {number} doorX - Door X coordinate
 * @param {number} doorY - Door Y coordinate
 * @returns {Object|null} Building bounds {x, y, width, height}
 */
function findBuildingBounds(doorX, doorY) {
    // Search for building walls around the door
    // Look for a rectangular building containing the door

    let minX = doorX;
    let maxX = doorX;
    let minY = doorY;
    let maxY = doorY;

    // Expand horizontally
    while (minX > 0 && gameState.map[doorY][minX - 1] === TILES.BUILDING) minX--;
    while (maxX < CONFIG.MAP_WIDTH - 1 && gameState.map[doorY][maxX + 1] === TILES.BUILDING) maxX++;

    // Expand vertically
    while (minY > 0 && gameState.map[minY - 1][doorX] === TILES.BUILDING) minY--;
    while (maxY < CONFIG.MAP_HEIGHT - 1 && gameState.map[maxY + 1][doorX] === TILES.BUILDING) maxY++;

    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
}

/**
 * Toggle between interior and exterior building view
 * @param {Object} buildingBounds - Building boundaries
 */
function toggleBuildingInterior(buildingBounds) {
    if (gameState.playerInBuilding) {
        // Exit building
        exitBuilding();
    } else {
        // Enter building
        enterBuilding(buildingBounds);
    }
}

/**
 * Enter a building and show interior
 * @param {Object} buildingBounds - Building boundaries
 */
function enterBuilding(buildingBounds) {
    gameState.playerInBuilding = true;
    gameState.currentBuilding = buildingBounds;
    gameState.buildingLayer = 1; // Interior layer

    console.log(`🏠 Entrando al edificio: ${buildingBounds.width}x${buildingBounds.height}`);

    // In a full implementation, this would:
    // 1. Hide roofs in the building area
    // 2. Darken exterior areas
    // 3. Show interior decorations/furniture
    // 4. Spawn interior NPCs if any

    // For now, just change the visual state
    // The renderer will handle the roof occlusion
}

/**
 * Exit building and return to exterior view
 */
function exitBuilding() {
    gameState.playerInBuilding = false;
    gameState.currentBuilding = null;
    gameState.buildingLayer = 0; // Exterior layer

    console.log('🏠 Saliendo del edificio');
}

/**
 * Check if player should exit building (walking through door from inside)
 * @param {number} x - Target X coordinate
 * @param {number} y - Target Y coordinate
 */
export function checkBuildingExit(x, y) {
    if (!gameState.playerInBuilding) return;

    // If player walks through a door while inside, exit
    if (isDoor(gameState.map[y][x])) {
        exitBuilding();
    }
}

/**
 * Check if a roof tile should be rendered (based on player position)
 * @param {number} x - Tile X coordinate
 * @param {number} y - Tile Y coordinate
 * @returns {boolean} True if roof should be visible
 */
export function shouldRenderRoof(x, y) {
    // If player is not in any building, show all roofs
    if (!gameState.playerInBuilding) {
        // Techos siempre visibles desde fuera
        return true;
    }

    // Si el jugador está dentro de un edificio...
    const building = gameState.currentBuilding;
    if (building) {
        // Comprobar si la coordenada está dentro del edificio actual
        const isInThisBuilding = 
            x >= building.x && x < building.x + building.width &&
            y >= building.y && y < building.y + building.height;
            
        if (isInThisBuilding) {
            // Estamos dentro de este edificio, así que ocultamos su techo
            return false;
        } else {
            // Estamos dentro de otro edificio, así que mostramos este techo
            return true;
        }
    }

    return true; // Por defecto, mostrar todos los techos
}

/**
 * Get building interior NPCs for current building
 * @returns {Array} Array of NPCs inside the building
 */
export function getBuildingInteriorNPCs() {
    // This would return NPCs that are inside buildings
    // For example, shopkeepers, bankers, etc.

    const interiorNPCs = [];

    if (gameState.playerInBuilding && gameState.currentBuilding) {
        // Add building-specific NPCs based on building type/location
        // This would be configured in the map definitions

        // Example: Add a shopkeeper NPC inside a building
        // interiorNPCs.push(new NPC('merchant_general', interiorX, interiorY));
    }

    return interiorNPCs;
}

/**
 * Check if coordinates are inside the current building
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if inside current building
 */
export function isInsideCurrentBuilding(x, y) {
    if (!gameState.playerInBuilding || !gameState.currentBuilding) return false;

    const building = gameState.currentBuilding;
    return x >= building.x && x < building.x + building.width &&
           y >= building.y && y < building.y + building.height;
}
