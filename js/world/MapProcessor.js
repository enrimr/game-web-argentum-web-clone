/**
 * MapProcessor.js
 * Procesamiento de capas de mapas y validaciones
 * Maneja la lógica de combinación de capas y validaciones de mapas
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { identifyBuildingsFromMap } from './generators/BuildingIdentifier.js';
import { createFallbackMap } from './generators/BaseGenerator.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * MapProcessor class - Handles map layer processing and validation
 */
export class MapProcessor {
    /**
     * Process multicapa map data and assign to gameState
     * @param {Object} mapData - Map data with layers
     * @returns {Array} Processed base map
     */
    static processMulticapaMap(mapData) {
        if (!mapData || typeof mapData !== 'object') {
            console.error('❌ MapData inválido en processMulticapaMap');
            return createFallbackMap();
        }

        // Handle different multicapa formats
        if (mapData.map && Array.isArray(mapData.map)) {
            // Standard multicapa format: { map, roofLayer, doorLayer, windowLayer }
            this.assignLayers(mapData);
            // IMPORTANTE: Retornar el objeto completo con todas las capas
            return mapData;
        } else if (Array.isArray(mapData)) {
            // Simple array format - no layers
            return mapData;
        } else {
            console.error('❌ Formato de mapa multicapa desconocido:', typeof mapData);
            return createFallbackMap();
        }
    }

    /**
     * Assign map layers to gameState
     * @param {Object} mapData - Map data with layers
     */
    static assignLayers(mapData) {
        console.log('🔧 INICIO assignLayers - Tipo de mapData:', typeof mapData);
        console.log('🔧 Keys de mapData:', Object.keys(mapData));
        console.log('🔧 Asignando capas al gameState:', {
            hasRoofLayer: !!(mapData.roofLayer && Array.isArray(mapData.roofLayer)),
            hasDoorLayer: !!(mapData.doorLayer && Array.isArray(mapData.doorLayer)),
            hasWindowLayer: !!(mapData.windowLayer && Array.isArray(mapData.windowLayer)),
            hasTreeLayer: !!(mapData.treeLayer && Array.isArray(mapData.treeLayer)),
            hasPropLayer: !!(mapData.propLayer && Array.isArray(mapData.propLayer))
        });

        if (mapData.roofLayer && Array.isArray(mapData.roofLayer)) {
            gameState.roofLayer = mapData.roofLayer;
            console.log(`🏠 Capa de techos asignada: ${mapData.roofLayer.length}x${mapData.roofLayer[0]?.length || 0}`);

            // Verificar que hay techos en la capa
            let roofCount = 0;
            for (let y = 0; y < mapData.roofLayer.length; y++) {
                if (mapData.roofLayer[y]) {
                    for (let x = 0; x < mapData.roofLayer[y].length; x++) {
                        if (mapData.roofLayer[y][x] !== 0) roofCount++;
                    }
                }
            }
            console.log(`🏠 Total de tiles de techo encontrados: ${roofCount}`);
            
            // Verificar el estado INMEDIATAMENTE después de la asignación
            setTimeout(() => {
                let checkCount = 0;
                for (let y = 0; y < gameState.roofLayer.length; y++) {
                    if (gameState.roofLayer[y]) {
                        for (let x = 0; x < gameState.roofLayer[y].length; x++) {
                            if (gameState.roofLayer[y][x] !== 0) checkCount++;
                        }
                    }
                }
                console.log(`🏠 VERIFICACIÓN POSTERIOR: Techos en gameState.roofLayer: ${checkCount}`);
                console.log(`🏠 Muestra gameState.roofLayer[5][5-10]:`, gameState.roofLayer[5]?.slice(5, 11));
            }, 100);
        } else {
            console.warn('⚠️ No se encontró roofLayer válido');
        }

        if (mapData.doorLayer && Array.isArray(mapData.doorLayer)) {
            gameState.doorLayer = mapData.doorLayer;
            console.log(`🚪 Capa de puertas asignada: ${mapData.doorLayer.length}x${mapData.doorLayer[0]?.length || 0}`);

            // Verificar que hay puertas en la capa
            let doorCount = 0;
            for (let y = 0; y < mapData.doorLayer.length; y++) {
                if (mapData.doorLayer[y]) {
                    for (let x = 0; x < mapData.doorLayer[y].length; x++) {
                        if (mapData.doorLayer[y][x] !== 0) doorCount++;
                    }
                }
            }
            console.log(`🚪 Total de tiles de puerta encontrados: ${doorCount}`);
            
            // Log de muestra de valores en la capa
            console.log('🚪 Muestra de doorLayer[10][8-9]:', {
                pos8: mapData.doorLayer[10]?.[8],
                pos9: mapData.doorLayer[10]?.[9],
                type: typeof mapData.doorLayer[10]?.[8]
            });
            
            // Verificar estado del jugador
            console.log('👤 Estado del jugador:', {
                playerInBuilding: gameState.playerInBuilding,
                playerX: gameState.player.x,
                playerY: gameState.player.y,
                buildingsCount: gameState.buildings?.length || 0
            });
        } else {
            console.warn('⚠️ No se encontró doorLayer válido');
        }

        if (mapData.windowLayer && Array.isArray(mapData.windowLayer)) {
            gameState.windowLayer = mapData.windowLayer;
            console.log(`🪟 Capa de ventanas asignada: ${mapData.windowLayer.length}x${mapData.windowLayer[0]?.length || 0}`);

            // Verificar que hay ventanas en la capa
            let windowCount = 0;
            for (let y = 0; y < mapData.windowLayer.length; y++) {
                if (mapData.windowLayer[y]) {
                    for (let x = 0; x < mapData.windowLayer[y].length; x++) {
                        if (mapData.windowLayer[y][x] !== 0) windowCount++;
                    }
                }
            }
            console.log(`🪟 Total de tiles de ventana encontrados: ${windowCount}`);
        } else {
            console.warn('⚠️ No se encontró windowLayer válido');
        }

        if (mapData.treeLayer && Array.isArray(mapData.treeLayer)) {
            gameState.treeLayer = mapData.treeLayer;
            console.log(`🌳 Capa de árboles asignada: ${mapData.treeLayer.length}x${mapData.treeLayer[0]?.length || 0}`);
        }

        if (mapData.propLayer && Array.isArray(mapData.propLayer)) {
            gameState.propLayer = mapData.propLayer;
            console.log(`🏺 Capa de props asignada: ${mapData.propLayer.length}x${mapData.propLayer[0]?.length || 0}`);
            
            // Verificar que hay props en la capa
            let propCount = 0;
            for (let y = 0; y < mapData.propLayer.length; y++) {
                if (mapData.propLayer[y]) {
                    for (let x = 0; x < mapData.propLayer[y].length; x++) {
                        if (mapData.propLayer[y][x] !== 0) propCount++;
                    }
                }
            }
            console.log(`🏺 Total de tiles de props encontrados: ${propCount}`);
        } else {
            console.warn('⚠️ No se encontró propLayer válido');
        }
    }

    /**
     * Validate map data structure
     * @param {Array} map - Map to validate
     * @returns {boolean} True if valid
     */
    static validateMap(map) {
        if (!Array.isArray(map)) {
            console.error('❌ Map no es un array');
            return false;
        }

        if (map.length === 0) {
            console.error('❌ Map está vacío');
            return false;
        }

        if (!Array.isArray(map[0])) {
            console.error('❌ Primera fila del map no es un array');
            return false;
        }

        const expectedWidth = map[0].length;
        const expectedHeight = map.length;

        // Validate dimensions
        if (expectedWidth !== MAP_WIDTH || expectedHeight !== MAP_HEIGHT) {
            console.warn(`⚠️ Dimensiones del mapa no coinciden: ${expectedWidth}x${expectedHeight} vs ${MAP_WIDTH}x${MAP_HEIGHT}`);
        }

        // Validate each row has same width
        for (let y = 1; y < map.length; y++) {
            if (!Array.isArray(map[y]) || map[y].length !== expectedWidth) {
                console.error(`❌ Fila ${y} tiene ancho inconsistente: ${map[y]?.length} vs ${expectedWidth}`);
                return false;
            }
        }

        // Validate tile values are numbers
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                if (typeof tile !== 'number' && tile !== null && tile !== undefined) {
                    console.error(`❌ Tile en [${y}][${x}] no es un número: ${typeof tile} (${tile})`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Extract and process roof layer from map
     * @param {Array} map - Base map
     */
    static extractRoofLayer(map) {
        if (!this.validateMap(map)) {
            console.warn('⚠️ Saltando extracción de techos por mapa inválido');
            return;
        }

        try {
            identifyBuildingsFromMap(map);
            console.log('🏠 Techos extraídos del mapa base');
        } catch (error) {
            console.error('❌ Error extrayendo techos:', error);
        }
    }

    /**
     * Combine map layers into single renderable map
     * @param {Object} mapData - Map data with layers
     * @returns {Array} Combined map
     */
    static combineMapLayers(mapData) {
        if (!mapData.layers) {
            console.error('❌ Map data debe contener layers');
            return null;
        }

        const baseLayer = mapData.layers.base;

        // Validate base layer
        if (!baseLayer || !Array.isArray(baseLayer) || baseLayer.length === 0 || !Array.isArray(baseLayer[0])) {
            console.error('❌ Base layer inválida');
            return createFallbackMap();
        }

        console.log(`🗺️ Procesando mapa con capas: ${baseLayer.length}x${baseLayer[0].length}`);

        const objectsLayer = mapData.layers.objects || [];
        const roofsLayer = mapData.layers.roofs || [];
        const windowsLayer = mapData.layers.windows || [];
        const doorsLayer = mapData.layers.doors || [];

        const height = baseLayer.length;
        const width = baseLayer[0].length;

        // Initialize combined map and layers
        const combinedMap = [];
        gameState.roofLayer = [];
        gameState.doorLayer = [];
        gameState.windowLayer = [];
        gameState.propLayer = []; // Initialize propLayer

        for (let y = 0; y < height; y++) {
            gameState.roofLayer[y] = [];
            gameState.doorLayer[y] = [];
            gameState.windowLayer[y] = [];
            gameState.propLayer[y] = []; // Initialize prop layer rows
            combinedMap[y] = Array(width).fill(0); // Initialize with default
        }

        // Process map layer by layer
        try {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    // Start with base layer
                    combinedMap[y][x] = baseLayer[y][x] || 0;

                    // Override with objects layer
                    if (objectsLayer[y] && objectsLayer[y][x] !== undefined && objectsLayer[y][x] !== 0) {
                        combinedMap[y][x] = objectsLayer[y][x];
                    }

                    // Process door layer
                    if (doorsLayer[y] && doorsLayer[y][x] !== undefined && doorsLayer[y][x] !== 0) {
                        gameState.doorLayer[y][x] = doorsLayer[y][x];
                        // Keep base layer as floor interior for doors
                        combinedMap[y][x] = 1; // FLOOR_INTERIOR
                    } else {
                        gameState.doorLayer[y][x] = 0;
                    }

                    // Process window layer
                    if (windowsLayer[y] && windowsLayer[y][x] !== undefined && windowsLayer[y][x] !== 0) {
                        gameState.windowLayer[y][x] = windowsLayer[y][x];
                    } else {
                        gameState.windowLayer[y][x] = 0;
                    }

                    // Save roof data
                    if (roofsLayer[y] && roofsLayer[y][x] !== undefined && roofsLayer[y][x] !== 0) {
                        gameState.roofLayer[y][x] = roofsLayer[y][x];
                    } else {
                        gameState.roofLayer[y][x] = 0;
                    }
                    
                    // Process props layer (if available)
                    if (mapData.layers.props && mapData.layers.props[y] && 
                        mapData.layers.props[y][x] !== undefined && mapData.layers.props[y][x] !== 0) {
                        gameState.propLayer[y][x] = mapData.layers.props[y][x];
                    } else {
                        gameState.propLayer[y][x] = 0;
                    }
                }
            }

            // Final validation
            if (!Array.isArray(combinedMap) || combinedMap.length === 0 || !Array.isArray(combinedMap[0])) {
                console.error('❌ Failed to generate valid combined map');
                return createFallbackMap(height, width);
            }

            // Detect buildings
            identifyBuildingsFromMap(combinedMap);

            console.log(`✅ Mapa combinado generado: ${combinedMap.length}x${combinedMap[0].length}`);
            return combinedMap;

        } catch (error) {
            console.error('❌ Error combinando capas del mapa:', error);
            return createFallbackMap(height, width);
        }
    }

    /**
     * Create a validated fallback map
     * @param {number} height - Map height
     * @param {number} width - Map width
     * @returns {Array} Valid fallback map
     */
    static createValidatedFallbackMap(height = MAP_HEIGHT, width = MAP_WIDTH) {
        const fallback = createFallbackMap(height, width);
        if (this.validateMap(fallback)) {
            console.log(`⚠️ Usando mapa fallback validado: ${fallback.length}x${fallback[0].length}`);
            return fallback;
        } else {
            console.error('❌ Even fallback map is invalid!');
            // Return a minimal valid map
            return [[0]];
        }
    }

    /**
     * Get map statistics
     * @param {Array} map - Map to analyze
     * @returns {Object} Map statistics
     */
    static getMapStats(map) {
        if (!this.validateMap(map)) {
            return { valid: false };
        }

        const stats = {
            valid: true,
            dimensions: `${map.length}x${map[0].length}`,
            totalTiles: map.length * map[0].length,
            tileCounts: {}
        };

        // Count tile types
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                stats.tileCounts[tile] = (stats.tileCounts[tile] || 0) + 1;
            }
        }

        return stats;
    }

    /**
     * Optimize map for rendering (remove redundant data, etc.)
     * @param {Array} map - Map to optimize
     * @returns {Array} Optimized map
     */
    static optimizeMap(map) {
        if (!this.validateMap(map)) {
            return map;
        }

        // For now, just return the map as-is
        // Future optimizations could include:
        // - Compressing repetitive patterns
        // - Removing unreachable areas
        // - Precomputing collision data

        return map;
    }
}
