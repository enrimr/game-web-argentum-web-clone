/**
 * MapGenerator.js
 * Generación de mapas para diferentes áreas del juego
 * Compatible con mapas estáticos y generación procedimental
 */

import { CONFIG } from '../config.js';
import { TILES, isTileWalkable, isClosedDoor, isOpenDoor } from './TileTypes.js';
import { generateNewbieCityWithBuildings } from './StaticMapLayouts.js';
import { gameState } from '../state.js';

const { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } = CONFIG;

/**
 * Generate map based on current map type
 * First checks for static maps, then falls back to procedural generation
 * @param {string} mapType - Type of map to generate
 * @returns {Array} 2D array representing the map
 */
export function generateMap(mapType) {
    // Special cases for newbie maps
    if (mapType === 'newbie_city') {
        console.log("🏙️ Generando mapa de Newbie City con edificios mejorados");

        try {
            // Usamos directamente la función importada al inicio del archivo
            const mapData = generateNewbieCityWithBuildings();

            // Guardar la capa de techos por separado
            if (mapData && Array.isArray(mapData)) {
                extractRoofLayer(mapData);
                return mapData;
            } else {
                return mapData;
            }
        } catch (error) {
            console.error("Error al generar mapa con edificios mejorados:", error);
            console.log("⚠️ Usando versión básica como fallback");
            const mapData = generateNewbieCityLayout();
            extractRoofLayer(mapData);
            return mapData;
        }
    }

    if (mapType === 'newbie_field') {
        console.log("🏞️ Generando mapa de Newbie Field");
        const mapData = generateNewbieFieldLayout();

        // Verificar que el mapa es válido
        if (mapData && Array.isArray(mapData) && mapData.length > 0) {
            console.log(`🏞️ Mapa Newbie Field generado correctamente: ${mapData.length}x${mapData[0]?.length}`);
            
            try {
                extractRoofLayer(mapData);
                return mapData;
            } catch (error) {
                console.error("Error al extraer capa de techos para newbie_field:", error);
            }
        } else {
            console.error(`❌ generateNewbieFieldLayout devolvió un mapa inválido: ${typeof mapData}`);
            
            // Como fallback, crear un mapa mínimo válido
            const fallbackMap = [];
            for (let y = 0; y < MAP_HEIGHT; y++) {
                const row = [];
                for (let x = 0; x < MAP_WIDTH; x++) {
                    if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                        row.push(TILES.WALL);
                    } else {
                        row.push(TILES.GRASS);
                    }
                }
                fallbackMap.push(row);
            }
            console.log(`⚠️ Usando mapa fallback para newbie_field: ${fallbackMap.length}x${fallbackMap[0].length}`);
            extractRoofLayer(fallbackMap);
            return fallbackMap;
        }
    }
    
    // For other maps, try to load a static map
    const staticMapData = loadStaticMap(mapType);
    if (staticMapData && Array.isArray(staticMapData) && staticMapData.length > 0) {
        extractRoofLayer(staticMapData);
        return staticMapData;
    }

    // If no static map is found, use procedural generation
    let mapData;
    switch (mapType) {
        case 'field':
            mapData = generateFieldMap();
            break;
        case 'city':
            mapData = generateCityMap();
            break;
        case 'dungeon':
            mapData = generateDungeonMap();
            break;
        case 'forest':
            mapData = generateForestMap();
            break;
        case 'castle':
            mapData = generateCastleMap();
            break;
        case 'market':
            mapData = generateMarketMap();
            break;
        case 'deep_dungeon':
            mapData = generateDeepDungeonMap();
            break;
        case 'ruins':
            mapData = generateRuinsMap();
            break;
        case 'throne_room':
            mapData = generateThroneRoomMap();
            break;
        default:
            mapData = generateFieldMap();
    }
    
    extractRoofLayer(mapData);
    return mapData;
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
 * We'll now keep roofs in a separate layer while base and objects remain combined
 * @param {Object} mapData - Map data with layers
 * @returns {Array} Combined 2D map array and separate roof layer
 */
function combineMapLayers(mapData) {
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

/**
 * Create a fallback map when normal map generation fails
 * @param {number} height - Map height
 * @param {number} width - Map width
 * @returns {Array} Simple fallback map
 */
function createFallbackMap(height = MAP_HEIGHT, width = MAP_WIDTH) {
    console.warn('⚠️ Usando mapa fallback por error en procesamiento');
    const fallbackMap = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
        }
        fallbackMap.push(row);
    }
    return fallbackMap;
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
    // Boundary check
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;

    // Map validity check
    if (!map || !Array.isArray(map)) {
        console.error("isWalkable: map is not an array", map);
        return false;
    }

    // Row validity check
    if (!map[y] || !Array.isArray(map[y])) {
        console.error(`isWalkable: map[${y}] is not an array`, map[y]);
        return false;
    }

    // Cell validity check
    if (map[y][x] === undefined) {
        console.error(`isWalkable: map[${y}][${x}] is undefined`);
        return false;
    }

    // Puerta check
    if (gameState.doorLayer && gameState.doorLayer[y] && gameState.doorLayer[y][x] !== undefined && 
        gameState.doorLayer[y][x] !== 0) {
        
        const doorTile = gameState.doorLayer[y][x];
        
        // Si hay una puerta cerrada, no es caminable
        if (isClosedDoor(doorTile)) {
            return false;
        }
        
        // Si hay una puerta abierta, es caminable
        if (isOpenDoor(doorTile)) {
            return true;
        }
    }

    // Normal tile check
    const tile = map[y][x];
    return isTileWalkable(tile);
}

/**
 * Extract roof tiles to a separate layer in the game state
 * @param {Array} mapData - 2D map array
 */
function extractRoofLayer(mapData) {
    // Initialize roof layer
    gameState.roofLayer = [];
    gameState.buildings = [];
    
    const height = mapData.length;
    const width = mapData[0].length;
    
    // Create empty roof layer
    for (let y = 0; y < height; y++) {
        gameState.roofLayer[y] = [];
        for (let x = 0; x < width; x++) {
            gameState.roofLayer[y][x] = 0; // Default: no roof
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
function identifyBuildingsFromMap(mapData) {
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
    console.log("🏞️ Generando mapa newbie_field con estructura de capas");
    
    // Crear mapa con estructura de capas como newbie_city
    const mapData = {
        name: "🏞️ Campos de Ullathorpe",
        description: "Campos seguros para aventureros novatos",
        type: "field",
        safeZone: true,
        worldPosition: { x: 100, y: 250 },
        layers: {
            base: [],
            objects: [],
            roofs: []
        },
        npcs: [
            { "type": "guard", "x": 25, "y": 32, "dialogue": "guard_field" },
            { "type": "merchant_general", "x": 15, "y": 10, "dialogue": "merchant_field" }
        ],
        enemies: { 
            "enabled": true, 
            "types": [
                { "type": "goblin", "count": 10 },
                { "type": "skeleton", "count": 5 }
            ]
        },
        portals: [
            { "x": 25, "y": 37, "targetMap": "newbie_city", "targetX": 25, "targetY": 1, "name": "Ciudad de Ullathorpe" }
        ]
    };
    
    // Generar capa base
    const baseLayer = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
        }
        baseLayer.push(row);
    }
    mapData.layers.base = baseLayer;
    
    // Generar capa de objetos
    const objectsLayer = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(0));
    
    // Agregar obstáculos
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            const rand = Math.random();
            if (rand < 0.05) {
                objectsLayer[y][x] = TILES.TREE;
            } else if (rand < 0.07) {
                objectsLayer[y][x] = TILES.STONE;
            }
        }
    }
    
    // Agregar camino
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x < MAP_WIDTH && 15 < MAP_HEIGHT) {
            baseLayer[15][x] = TILES.PATH;
        }
    }
    
    mapData.layers.objects = objectsLayer;
    
    // Capa de techos vacía
    mapData.layers.roofs = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(0));
    
    // Generar el mapa combinado usando el mismo mecanismo que los mapas estáticos
    return combineMapLayers(mapData);
}

/**
 * Generate dark forest layout (static)
 */
function generateDarkForestLayout() {
    console.log("🌲 Generando mapa dark_forest con estructura de capas");
    
    // Crear mapa con estructura de capas
    const mapData = {
        name: "🌲 Bosque Oscuro",
        description: "Un bosque denso y oscuro lleno de peligros",
        type: "forest",
        safeZone: false,
        worldPosition: { x: 200, y: 150 },
        layers: {
            base: [],
            objects: [],
            roofs: []
        },
        npcs: [
            { "type": "hermit", "x": 25, "y": 22, "dialogue": "hermit_forest" }
        ],
        enemies: { 
            "enabled": true, 
            "types": [
                { "type": "goblin", "count": 15 },
                { "type": "wolf", "count": 8 },
                { "type": "elemental", "count": 5 }
            ]
        },
        portals: [
            { "x": 25, "y": 5, "targetMap": "newbie_field", "targetX": 25, "targetY": 37, "name": "Campos de Ullathorpe" }
        ]
    };
    
    // Generar capa base
    const baseLayer = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
        }
        baseLayer.push(row);
    }
    mapData.layers.base = baseLayer;
    
    // Generar capa de objetos
    const objectsLayer = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(0));
    
    // Agregar árboles y piedras
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            const rand = Math.random();
            if (rand < 0.35) {
                objectsLayer[y][x] = TILES.TREE;
            } else if (rand < 0.38) {
                objectsLayer[y][x] = TILES.STONE;
            }
        }
    }
    
    // Agregar camino central
    for (let x = 5; x < MAP_WIDTH - 5; x++) {
        if (x < MAP_WIDTH && 20 < MAP_HEIGHT) {
            baseLayer[20][x] = TILES.PATH;
            if (21 < MAP_HEIGHT) baseLayer[21][x] = TILES.PATH;
        }
    }
    
    mapData.layers.objects = objectsLayer;
    
    // Capa de techos vacía
    mapData.layers.roofs = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(0));
    
    // Generar el mapa combinado usando el mismo mecanismo que los mapas estáticos
    return combineMapLayers(mapData);
}
