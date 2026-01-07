/**
 * StaticMapLoader.js
 * Funcionalidad para cargar mapas estáticos desde JSON o definiciones predefinidas
 */

import { TILES, isClosedDoor, isOpenDoor } from '../TileTypes.js';
import { gameState } from '../../state.js';
import { CONFIG } from '../../config.js';
import { identifyBuildingsFromMap } from './BuildingIdentifier.js';
import { createFallbackMap } from './BaseGenerator.js';
import { getStaticMap } from '../StaticWorldMaps.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Load a static map from JSON file if it exists
 * @param {string} mapType - Map type to load
 * @returns {Array|null} Combined map array or null if not found
 */
export function loadStaticMap(mapType) {
    try {
        // Check if the map is defined in STATIC_WORLD_MAPS
        const staticMapConfig = getStaticMap(mapType);
        
        if (staticMapConfig) {
            let mapData = null;
            
            // If the map has a fileSource property, load from JSON file
            if (staticMapConfig.fileSource) {
                console.log(`Loading map from file: ${staticMapConfig.fileSource}`);
                
                try {
                    // Try to load the JSON map using the predefined method
                    mapData = loadJSONMapByType(mapType);
                } catch (e) {
                    console.warn(`Error loading JSON file: ${e.message}, trying fallback...`);
                }
            } 
            // If no fileSource, use layout function if provided
            else if (staticMapConfig.layout) {
                console.log(`Generating map with layout function for: ${mapType}`);
                mapData = {
                    layers: {
                        base: staticMapConfig.layout()
                    }
                };
            }
            
            // Fallback to hardcoded maps
            if (!mapData) {
                mapData = loadStaticMapData(mapType);
            }
            
            if (mapData && mapData.layers) {
                // Combine layers into single map for compatibility
                return combineMapLayers(mapData);
            }
        }
    } catch (error) {
        console.warn(`Failed to load static map for ${mapType}:`, error);
    }
    return null;
}

/**
 * Load JSON map data by type
 * @param {string} mapType - Map type to load
 * @returns {Object|null} Map data object or null
 */
function loadJSONMapByType(mapType) {
    console.log(`Loading JSON map for: ${mapType}`);
    
    try {
        // In a browser environment, we would use fetch
        // But for now, we'll use a direct import approach for the demo
        const staticMapConfig = getStaticMap(mapType);
        
        if (staticMapConfig && staticMapConfig.fileSource) {
            // Since we can't directly load files at runtime in this demo,
            // we'll use our predefined JSON maps that are already loaded
            
            // Check if the mapType is one of our canarias maps
            if (mapType.startsWith('canarias_')) {
                // Return the map data directly from the source
                return {
                    name: staticMapConfig.name,
                    description: staticMapConfig.description,
                    type: staticMapConfig.type,
                    safeZone: staticMapConfig.safeZone,
                    worldPosition: staticMapConfig.worldPosition,
                    // For demo purposes, we'll load the map directly from the layers in the JSON files
                    layers: {
                        base: window.__PRELOADED_MAPS__[mapType]?.layers?.base || [],
                        objects: window.__PRELOADED_MAPS__[mapType]?.layers?.objects || [],
                        roofs: window.__PRELOADED_MAPS__[mapType]?.layers?.roofs || [],
                        doors: window.__PRELOADED_MAPS__[mapType]?.layers?.doors || [],
                        windows: window.__PRELOADED_MAPS__[mapType]?.layers?.windows || []
                    }
                };
            }
        }
    } catch (error) {
        console.error(`Error loading JSON map: ${error}`);
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
                        [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
                        [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
                    ]
                }
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
    const windowsLayer = mapData.layers.windows || [];
    const doorsLayer = mapData.layers.doors || [];

    const height = baseLayer.length;
    const width = baseLayer[0].length;

    // Create combined map (without roofs)
    const combinedMap = [];
    
    // Initialize layers in gameState
    gameState.roofLayer = [];
    gameState.doorLayer = [];
    gameState.windowLayer = [];

    for (let y = 0; y < height; y++) {
        gameState.roofLayer[y] = [];
        gameState.doorLayer[y] = [];
        gameState.windowLayer[y] = [];
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

                // Override with objects layer (walls, etc.)
                if (objectsLayer[y] && objectsLayer[y][x] !== undefined && objectsLayer[y][x] !== 0) {
                    combinedMap[y][x] = objectsLayer[y][x];
                }
                
                // Process door layer
                if (doorsLayer[y] && doorsLayer[y][x] !== undefined && doorsLayer[y][x] !== 0) {
                    gameState.doorLayer[y][x] = doorsLayer[y][x];
                    // Keep base layer as floor interior for doors
                    combinedMap[y][x] = TILES.FLOOR_INTERIOR;
                } else {
                    gameState.doorLayer[y][x] = 0;
                }
                
                // Process window layer
                if (windowsLayer[y] && windowsLayer[y][x] !== undefined && windowsLayer[y][x] !== 0) {
                    gameState.windowLayer[y][x] = windowsLayer[y][x];
                } else {
                    gameState.windowLayer[y][x] = 0;
                }

                // Save roof data in the separate roof layer (if any)
                if (roofsLayer[y] && roofsLayer[y][x] !== undefined && roofsLayer[y][x] !== 0) {
                    gameState.roofLayer[y][x] = roofsLayer[y][x];
                } else {
                    gameState.roofLayer[y][x] = 0; // No roof
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
