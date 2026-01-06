/**
 * StaticMapLoader.js
 * Funcionalidad para cargar mapas estáticos desde JSON o definiciones predefinidas
 */

import { TILES, isClosedDoor, isOpenDoor } from '../TileTypes.js';
import { gameState } from '../../state.js';
import { CONFIG } from '../../config.js';
import { identifyBuildingsFromMap } from './BuildingIdentifier.js';
import { createFallbackMap } from './BaseGenerator.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Load a static map from JSON file if it exists
 * @param {string} mapType - Map type to load
 * @returns {Array|null} Combined map array or null if not found
 */
export function loadStaticMap(mapType) {
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
 * @param {string} mapType - Map type to load
 * @returns {Object} Map data with layers
 */
function loadStaticMapData(mapType) {
    // This simulates loading JSON data
    // In production, this would be async JSON loading

    switch (mapType) {
        case 'newbie_field':
            return {
                name: "🏞️ Campos de Ullathorpe",
                description: "Campos seguros para aventureros novatos",
                type: "field",
                safeZone: true,
                worldPosition: { x: 100, y: 250 },
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
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
                    ]
                },
                npcs: [
                    { "type": "guard", "x": 25, "y": 32, "dialogue": "guard_field" }
                ],
                enemies: { "enabled": true, "spawnAreas": [{ "x": 10, "y": 10, "width": 30, "height": 20 }] },
                objects: {
                    "density": 0.05,
                    "types": ["potion", "gold"],
                    "spawnAreas": "walkable"
                },
                portals: [
                    { "x": 25, "y": 37, "targetMap": "newbie_city", "targetX": 25, "targetY": 1, "name": "Ciudad" }
                ],
                connections: {}
            };

        default:
            return null;
    }
}

/**
 * Combine map layers into a single 2D array for rendering
 * We'll now keep roofs in a separate layer while base and objects remain combined
 * @param {Object} mapData - Map data with layers
 * @returns {Array} Combined 2D map array and separate roof layer
 */
export function combineMapLayers(mapData) {
    if (!mapData.layers) {
        console.error('Map data must contain layers', mapData);
        return null;
    }

    const baseLayer = mapData.layers.base;
    
    // Validar la capa base
    if (!baseLayer) {
        console.error('Base layer is required in mapData', mapData);
        return null;
    }
    
    if (!Array.isArray(baseLayer)) {
        console.error('Base layer is not an array', baseLayer);
        return null;
    }
    
    if (baseLayer.length === 0) {
        console.error('Base layer is empty');
        return null;
    }
    
    if (!Array.isArray(baseLayer[0])) {
        console.error('Base layer is not a 2D array, first row:', baseLayer[0]);
        return null;
    }
    
    console.log(`🗺️ Procesando mapa con capas: ${baseLayer.length}x${baseLayer[0].length}`);
    
    const objectsLayer = mapData.layers.objects || [];
    const roofsLayer = mapData.layers.roofs || [];

    const height = baseLayer.length;
    const width = baseLayer[0].length;

    // Create combined map (without roofs)
    const combinedMap = [];
    
    // Initialize layers
    gameState.roofLayer = [];
    gameState.doorLayer = [];
    for (let y = 0; y < height; y++) {
        gameState.roofLayer[y] = [];
        gameState.doorLayer[y] = [];
        combinedMap[y] = Array(width).fill(TILES.GRASS); // Inicializar con césped por defecto
    }

    // Procesar el mapa por capas
    try {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Base layer validation
                if (baseLayer[y] === undefined || baseLayer[y][x] === undefined) {
                    console.warn(`Base layer missing at [${y}][${x}], using GRASS`);
                    combinedMap[y][x] = TILES.GRASS;
                } else {
                    // Start with base layer
                    combinedMap[y][x] = baseLayer[y][x];
                }

                // Override with objects layer (doors, walls, etc.)
                if (objectsLayer[y] && objectsLayer[y][x] !== undefined && objectsLayer[y][x] !== 0) {
                    const objectTile = objectsLayer[y][x];
                    // If it's a door, put it in the door layer instead of base layer
                    if (isClosedDoor(objectTile) || isOpenDoor(objectTile)) {
                        gameState.doorLayer[y][x] = objectTile;
                        // Keep base layer as floor interior for doors
                        combinedMap[y][x] = TILES.FLOOR_INTERIOR;
                    } else {
                        combinedMap[y][x] = objectTile;
                    }
                }

                // Save roof data in the separate roof layer (if any)
                if (roofsLayer[y] && roofsLayer[y][x] !== undefined && roofsLayer[y][x] !== 0) {
                    gameState.roofLayer[y][x] = roofsLayer[y][x];
                } else {
                    gameState.roofLayer[y][x] = 0; // No roof
                }

                // Initialize door layer if not set
                if (gameState.doorLayer[y][x] === undefined) {
                    gameState.doorLayer[y][x] = 0;
                }
            }
        }
        
        // Validar mapa combinado
        if (!Array.isArray(combinedMap) || combinedMap.length === 0 || !Array.isArray(combinedMap[0])) {
            console.error('Failed to generate valid combined map', {
                isArray: Array.isArray(combinedMap),
                length: combinedMap?.length,
                firstRowIsArray: Array.isArray(combinedMap[0])
            });
            return createFallbackMap(height, width);
        }
        
        // Detect and register buildings
        identifyBuildingsFromMap(combinedMap);
        
        console.log(`✅ Mapa combinado generado: ${combinedMap.length}x${combinedMap[0].length}`);
        return combinedMap;
        
    } catch (error) {
        console.error('Error combining map layers:', error);
        return createFallbackMap(height, width);
    }
}
