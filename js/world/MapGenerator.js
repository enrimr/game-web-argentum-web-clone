/**
 * MapGenerator.js
 * Generación de mapas para diferentes áreas del juego
 * Compatible con mapas estáticos y generación procedimental
 */

import { CONFIG } from '../config.js';
import { TILES, isTileWalkable } from './TileTypes.js';

const { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } = CONFIG;

/**
 * Generate map based on current map type
 * First checks for static maps, then falls back to procedural generation
 * @param {string} mapType - Type of map to generate
 * @returns {Array} 2D array representing the map
 */
export function generateMap(mapType) {
    // First, try to load a static map
    const staticMap = loadStaticMap(mapType);
    if (staticMap) {
        return staticMap;
    }

    // If no static map is found, use procedural generation
    switch (mapType) {
        case 'field':
            return generateFieldMap();
        case 'city':
            return generateCityMap();
        case 'dungeon':
            return generateDungeonMap();
        case 'forest':
            return generateForestMap();
        case 'castle':
            return generateCastleMap();
        case 'market':
            return generateMarketMap();
        case 'deep_dungeon':
            return generateDeepDungeonMap();
        case 'ruins':
            return generateRuinsMap();
        case 'throne_room':
            return generateThroneRoomMap();
        default:
            return generateFieldMap();
    }
}

/**
 * Load a static map from JSON file if it exists
 * @param {string} mapType - Map type to load
 * @returns {Array|null} Combined map array or null if not found
 */
function loadStaticMap(mapType) {
    try {
        // Map of mapType to static map file names
        const staticMapFiles = {
            'newbie_city': 'newbie_city.json',
            'newbie_field': 'newbie_field.json',
            'dark_forest': 'dark_forest.json',
            // Add more mappings as static maps are created
        };

        if (staticMapFiles[mapType]) {
            // For now, we'll simulate loading JSON data
            // In production, this would load JSON files asynchronously
            const mapData = loadStaticMapData(mapType);
            if (mapData && mapData.layers) {
                // Combine layers into single map for compatibility
                return combineMapLayers(mapData);
            }
            return null;
        }
    } catch (error) {
        console.warn(`Failed to load static map for ${mapType}:`, error);
    }
    return null;
}

/**
 * Load map data from JSON file (placeholder for future async loading)
 * @param {string} fileName - JSON file name
 * @returns {Promise<Object>} Map data with layers
 */
async function loadMapDataFromJSON(fileName) {
    // Placeholder for async JSON loading
    // In production, this would be:
    // const response = await fetch(`maps/${fileName}`);
    // return await response.json();

    throw new Error('Async JSON loading not implemented yet');
}

/**
 * Combine map layers into a single 2D array for rendering
 * Layer priority: roofs (top) -> objects -> base (bottom)
 * @param {Object} mapData - Map data with layers
 * @returns {Array} Combined 2D map array
 */
function combineMapLayers(mapData) {
    if (!mapData.layers) {
        throw new Error('Map data must contain layers');
    }

    const baseLayer = mapData.layers.base;
    const objectsLayer = mapData.layers.objects || [];
    const roofsLayer = mapData.layers.roofs || [];

    if (!baseLayer || !Array.isArray(baseLayer)) {
        throw new Error('Base layer is required');
    }

    const height = baseLayer.length;
    const width = baseLayer[0].length;

    // Create combined map
    const combinedMap = [];

    for (let y = 0; y < height; y++) {
        combinedMap[y] = [];

        for (let x = 0; x < width; x++) {
            // Start with base layer
            let tile = baseLayer[y][x];

            // Override with objects layer (doors, walls, etc.)
            if (objectsLayer[y] && objectsLayer[y][x] !== undefined && objectsLayer[y][x] !== 0) {
                tile = objectsLayer[y][x];
            }

            // Override with roofs layer (only if roof exists)
            if (roofsLayer[y] && roofsLayer[y][x] !== undefined && roofsLayer[y][x] !== 0) {
                tile = roofsLayer[y][x];
            }

            combinedMap[y][x] = tile;
        }
    }

    return combinedMap;
}

/**
 * Load static map data (simulates JSON loading)
 * @param {string} mapType - Map type to load
 * @returns {Object} Map data with layers
 */
function loadStaticMapData(mapType) {
    // This simulates loading JSON data
    // In production, this would be async JSON loading

    switch (mapType) {
        case 'newbie_city':
            return {
                name: "🏘️ Ciudad de Ullathorpe",
                description: "Ciudad inicial para aventureros novatos",
                type: "city",
                safeZone: true,
                worldPosition: { x: 200, y: 150 },
                layers: {
                    base: [
                        [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
                    ],
                    objects: [
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                    ],
                    roofs: [
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                    ]
                },
                npcs: [
                    { "type": "king", "x": 25, "y": 10, "dialogue": "welcome_king" },
                    { "type": "merchant", "x": 15, "y": 15, "dialogue": "shop_weapons" },
                    { "type": "merchant", "x": 35, "y": 15, "dialogue": "shop_armor" },
                    { "type": "healer", "x": 25, "y": 25, "dialogue": "healing" },
                    { "type": "trainer", "x": 10, "y": 30, "dialogue": "training" },
                    { "type": "guard", "x": 25, "y": 5, "dialogue": "guard_north" },
                    { "type": "guard", "x": 5, "y": 20, "dialogue": "guard_west" },
                    { "type": "guard", "x": 45, "y": 20, "dialogue": "guard_east" }
                ],
                enemies: { "enabled": false },
                objects: {
                    "density": 0.02,
                    "types": ["potion", "gold"],
                    "spawnAreas": "walkable"
                },
                portals: [
                    { "x": 25, "y": 3, "targetMap": "newbie_field", "targetX": 25, "targetY": 35, "name": "Campo Norte" }
                ],
                connections: {}
            };

        default:
            return null;
    }
}

/**
 * Get newbie city static layout
 */
function getNewbieCityLayout() {
    const map = [];
    // This would normally be loaded from newbie_city.json
    // For now, we'll call the existing function
    return generateNewbieCityLayout();
}

/**
 * Get newbie field static layout
 */
function getNewbieFieldLayout() {
    const map = [];
    // This would normally be loaded from newbie_field.json
    return generateNewbieFieldLayout();
}

/**
 * Get dark forest static layout
 */
function getDarkForestLayout() {
    const map = [];
    // This would normally be loaded from dark_forest.json
    return generateDarkForestLayout();
}

// Generate field map (outdoor area) - CORRECT ORDER: terrain -> obstacles
function generateFieldMap() {
    const map = [];

    // 1. Create base terrain (borders and ground)
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Base terrain is walkable grass
                row.push(TILES.GRASS);
            }
        }
        map.push(row);
    }

    // 2. Add obstacles (trees, stones) - these block movement AFTER terrain is set
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            if (Math.random() < 0.05) {
                map[y][x] = TILES.TREE;
            } else if (Math.random() < 0.02) {
                map[y][x] = TILES.STONE;
            }
            // Leave some areas as paths for better navigation
        }
    }

    return map;
}

// Generate city map (buildings and streets)
function generateCityMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // City streets every 8 columns and 6 rows
                if (x % 8 === 0 || y % 6 === 0) {
                    row.push(TILES.PATH); // Streets
                } else if (Math.random() < 0.4) {
                    row.push(TILES.BUILDING); // Buildings
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }
    return map;
}

// Generate forest map (dense woods)
function generateForestMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Dense forest with many trees
                if (Math.random() < 0.3) {
                    row.push(TILES.TREE);
                } else if (Math.random() < 0.05) {
                    row.push(TILES.STONE);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }

    // Create a path through the forest
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x >= 0 && x < MAP_WIDTH && 20 >= 0 && 20 < MAP_HEIGHT) {
            map[20][x] = TILES.PATH;
        }
    }

    return map;
}

// Generate castle map (castle interior)
function generateCastleMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else if (x <= 2 || x >= MAP_WIDTH - 3 || y <= 2 || y >= MAP_HEIGHT - 3) {
                // Castle walls
                row.push(TILES.WALL);
            } else {
                row.push(TILES.FLOOR);
            }
        }
        map.push(row);
    }

    // Create castle interior rooms
    // Throne room area
    for (let y = 15; y < 25; y++) {
        for (let x = MAP_WIDTH - 15; x < MAP_WIDTH - 5; x++) {
            if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
                map[y][x] = TILES.FLOOR;
            }
        }
    }

    return map;
}

// Generate market map (open market area)
function generateMarketMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Market stalls (buildings) in a grid
                if ((x % 6 === 3 || y % 4 === 2) && Math.random() < 0.6) {
                    row.push(TILES.BUILDING);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }
    return map;
}

// Generate deep dungeon map (more dangerous dungeon)
function generateDeepDungeonMap() {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = TILES.DUNGEON_WALL;
        }
    }
    generateConnectedDungeon(map, { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT });
    return map;
}

// Generate ruins map (ancient ruins)
function generateRuinsMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Ruins with scattered walls and floors
                const rand = Math.random();
                if (rand < 0.1) {
                    row.push(TILES.WALL); // Ruined walls
                } else if (rand < 0.3) {
                    row.push(TILES.FLOOR); // Ruined floors
                } else if (rand < 0.35) {
                    row.push(TILES.STONE);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }

    // Create some paths through the ruins
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x >= 0 && x < MAP_WIDTH && 15 >= 0 && 15 < MAP_HEIGHT) {
            map[15][x] = TILES.PATH;
        }
    }

    return map;
}

// Generate dungeon map (main dungeon level)
function generateDungeonMap() {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = TILES.DUNGEON_WALL;
        }
    }
    generateConnectedDungeon(map, { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT });
    return map;
}

// Generate throne room map (king's throne room)
function generateThroneRoomMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else if (x <= 3 || x >= MAP_WIDTH - 4 || y <= 3 || y >= MAP_HEIGHT - 4) {
                // Throne room walls
                row.push(TILES.WALL);
            } else {
                row.push(TILES.FLOOR);
            }
        }
        map.push(row);
    }

    // Throne area in the center
    const throneX = Math.floor(MAP_WIDTH / 2);
    const throneY = Math.floor(MAP_HEIGHT / 2);
    if (throneX >= 0 && throneX < MAP_WIDTH && throneY >= 0 && throneY < MAP_HEIGHT) {
        map[throneY][throneX] = TILES.FLOOR; // Throne position
    }

    return map;
}

// Generate connected dungeon with guaranteed accessibility
function generateConnectedDungeon(map, bounds) {
    // Initialize with walls
    for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
        for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
            if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                map[y][x] = TILES.DUNGEON_WALL;
            }
        }
    }

    const rooms = [];
    const minRoomSize = 3;
    const maxRoomSize = 6;

    // Create rooms with guaranteed spacing
    for (let attempts = 0; attempts < 20 && rooms.length < 8; attempts++) {
        const roomW = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
        const roomH = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));

        const roomX = bounds.x + 2 + Math.floor(Math.random() * (bounds.width - roomW - 4));
        const roomY = bounds.y + 2 + Math.floor(Math.random() * (bounds.height - roomH - 4));

        // Check if room fits and doesn't overlap existing rooms
        let canPlace = true;
        for (let y = roomY - 1; y < roomY + roomH + 1 && canPlace; y++) {
            for (let x = roomX - 1; x < roomX + roomW + 1 && canPlace; x++) {
                if (x >= bounds.x && x < bounds.x + bounds.width &&
                    y >= bounds.y && y < bounds.y + bounds.height) {
                    if (map[y][x] === TILES.FLOOR) {
                        canPlace = false;
                    }
                }
            }
        }

        if (canPlace) {
            // Carve the room
            for (let y = roomY; y < roomY + roomH; y++) {
                for (let x = roomX; x < roomX + roomW; x++) {
                    if (x >= bounds.x && x < bounds.x + bounds.width &&
                        y >= bounds.y && y < bounds.y + bounds.height) {
                        map[y][x] = TILES.FLOOR;
                    }
                }
            }

            // Store room center for connecting
            const centerX = Math.floor(roomX + roomW / 2);
            const centerY = Math.floor(roomY + roomH / 2);
            rooms.push({ x: centerX, y: centerY });
        }
    }

    // Ensure we have at least 3 rooms
    if (rooms.length < 3) {
        // Create minimum rooms if needed
        const forcedRooms = [
            { x: bounds.x + 3, y: bounds.y + 3, w: 4, h: 4 },
            { x: bounds.x + bounds.width - 7, y: bounds.y + 3, w: 4, h: 4 },
            { x: bounds.x + Math.floor(bounds.width / 2) - 2, y: bounds.y + bounds.height - 7, w: 4, h: 4 }
        ];

        for (const room of forcedRooms) {
            for (let y = room.y; y < room.y + room.h; y++) {
                for (let x = room.x; x < room.x + room.w; x++) {
                    if (x >= bounds.x && x < bounds.x + bounds.width &&
                        y >= bounds.y && y < bounds.y + bounds.height) {
                        map[y][x] = TILES.FLOOR;
                    }
                }
            }
            rooms.push({ x: room.x + Math.floor(room.w / 2), y: room.y + Math.floor(room.h / 2) });
        }
    }

    // Connect all rooms with corridors (minimum spanning tree approach)
    if (rooms.length > 1) {
        // Start with first room
        const connected = new Set([0]);

        while (connected.size < rooms.length) {
            let bestDistance = Infinity;
            let bestConnection = null;

            // Find closest unconnected room to any connected room
            for (const connectedIdx of connected) {
                for (let i = 0; i < rooms.length; i++) {
                    if (!connected.has(i)) {
                        const dist = Math.abs(rooms[connectedIdx].x - rooms[i].x) +
                                   Math.abs(rooms[connectedIdx].y - rooms[i].y);
                        if (dist < bestDistance) {
                            bestDistance = dist;
                            bestConnection = { from: connectedIdx, to: i };
                        }
                    }
                }
            }

            if (bestConnection) {
                // Connect the rooms
                connectRooms(map, rooms[bestConnection.from], rooms[bestConnection.to], bounds);
                connected.add(bestConnection.to);
            } else {
                break; // No more connections possible
            }
        }
    }

    // Create entrance from main path (bottom of dungeon zone)
    const entranceY = bounds.y + bounds.height - 1;
    const entranceX = Math.floor(bounds.x + bounds.width / 2);

    if (entranceX >= bounds.x && entranceX < bounds.x + bounds.width &&
        entranceY >= bounds.y && entranceY < bounds.y + bounds.height) {

        // Find nearest room to connect to entrance
        let nearestRoom = null;
        let minDistance = Infinity;

        for (const room of rooms) {
            const dist = Math.abs(room.x - entranceX) + Math.abs(room.y - entranceY);
            if (dist < minDistance) {
                minDistance = dist;
                nearestRoom = room;
            }
        }

        if (nearestRoom) {
            // Connect entrance to nearest room
            connectRooms(map, { x: entranceX, y: entranceY }, nearestRoom, bounds);
        }
    }
}

// Connect two points with a corridor (minimum 2 tiles wide for better gameplay)
function connectRooms(map, point1, point2, bounds) {
    const corridorWidth = 2; // Minimum 2 tiles wide

    // Horizontal corridor first (made wider)
    const startX = Math.min(point1.x, point2.x);
    const endX = Math.max(point1.x, point2.x);

    for (let x = startX; x <= endX; x++) {
        for (let w = 0; w < corridorWidth; w++) {
            const corridorY = point1.y + w - Math.floor(corridorWidth / 2);
            if (x >= bounds.x && x < bounds.x + bounds.width &&
                corridorY >= bounds.y && corridorY < bounds.y + bounds.height) {
                map[corridorY][x] = TILES.FLOOR;
            }
        }
    }

    // Vertical corridor (made wider)
    const startY = Math.min(point1.y, point2.y);
    const endY = Math.max(point1.y, point2.y);

    for (let y = startY; y <= endY; y++) {
        for (let w = 0; w < corridorWidth; w++) {
            const corridorX = point2.x + w - Math.floor(corridorWidth / 2);
            if (corridorX >= bounds.x && corridorX < bounds.x + bounds.width &&
                y >= bounds.y && y < bounds.y + bounds.height) {
                map[y][corridorX] = TILES.FLOOR;
            }
        }
    }

    // Ensure the intersection area is fully connected (L-shaped connection)
    const intersectionX = point2.x;
    const intersectionY = point1.y;

    for (let dx = -Math.floor(corridorWidth / 2); dx <= Math.floor(corridorWidth / 2); dx++) {
        for (let dy = -Math.floor(corridorWidth / 2); dy <= Math.floor(corridorWidth / 2); dy++) {
            const ix = intersectionX + dx;
            const iy = intersectionY + dy;
            if (ix >= bounds.x && ix < bounds.x + bounds.width &&
                iy >= bounds.y && iy < bounds.y + bounds.height) {
                map[iy][ix] = TILES.FLOOR;
            }
        }
    }
}

/**
 * Check if tile is walkable
 * @param {Array} map - The map to check
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if the tile is walkable
 */
export function isWalkable(map, x, y) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;

    const tile = map[y][x];

    // Use the new tile walkability function
    return isTileWalkable(tile);
}

// ===== STATIC MAP LAYOUT FUNCTIONS =====

/**
 * Generate newbie city layout (static)
 */
function generateNewbieCityLayout() {
    const map = [];

    // Create base with walls
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
        }
        map.push(row);
    }

    // Streets in cross pattern
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
        map[20][x] = TILES.PATH;
    }
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        map[y][25] = TILES.PATH;
    }

    // Plaza central
    for (let y = 18; y < 23; y++) {
        for (let x = 23; x < 28; x++) {
            map[y][x] = TILES.PATH;
        }
    }

    // Buildings
    const buildings = [
        { x: 5, y: 5, w: 8, h: 6 },
        { x: 37, y: 5, w: 8, h: 6 },
        { x: 5, y: 28, w: 8, h: 6 },
        { x: 37, y: 28, w: 8, h: 6 },
        { x: 15, y: 10, w: 6, h: 5 },
        { x: 31, y: 10, w: 6, h: 5 }
    ];

    for (const building of buildings) {
        for (let y = building.y; y < building.y + building.h; y++) {
            for (let x = building.x; x < building.x + building.w; x++) {
                if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
                    map[y][x] = TILES.BUILDING;
                }
            }
        }
    }

    return map;
}

/**
 * Generate newbie field layout (static)
 */
function generateNewbieFieldLayout() {
    const map = [];

    // Base with walls
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
        }
        map.push(row);
    }

    // Some obstacles
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            const rand = Math.random();
            if (rand < 0.05) {
                map[y][x] = TILES.TREE;
            } else if (rand < 0.07) {
                map[y][x] = TILES.STONE;
            }
        }
    }

    // Path
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x < MAP_WIDTH && 15 < MAP_HEIGHT) {
            map[15][x] = TILES.PATH;
        }
    }

    return map;
}

/**
 * Generate dark forest layout (static)
 */
function generateDarkForestLayout() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                const rand = Math.random();
                if (rand < 0.35) {
                    row.push(TILES.TREE);
                } else if (rand < 0.38) {
                    row.push(TILES.STONE);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }

    // Central path
    for (let x = 5; x < MAP_WIDTH - 5; x++) {
        if (x < MAP_WIDTH && 20 < MAP_HEIGHT) {
            map[20][x] = TILES.PATH;
            if (21 < MAP_HEIGHT) map[21][x] = TILES.PATH;
        }
    }

    return map;
}
