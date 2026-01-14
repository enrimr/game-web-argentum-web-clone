/**
 * MapGenerator.js
 * Sistema unificado de generación de mapas usando separación de responsabilidades
 * Coordina MapLoader, ProceduralMapGenerator, MapProcessor, MapCache y MapConfig
 */

import { CONFIG } from '../config.js';
import { gameState } from '../state.js';
import { generateNewbieCityWithBuildings } from './StaticMapLayouts.js';
import { isWalkable, createFallbackMap } from './generators/BaseGenerator.js';
import { MapLoader } from './MapLoader.js';
import { ProceduralMapGenerator } from './ProceduralMapGenerator.js';
import { MapProcessor } from './MapProcessor.js';
import { MapCache, mapCache } from './MapCache.js';
import { getMapConfig, shouldCacheMap } from './MapConfig.js';

/**
 * Strategy for special newbie maps with enhanced features
 */
class SpecialMapStrategy {
    generate(mapType) {
        console.log(`⭐ Generando mapa especial: ${mapType}`);

        switch (mapType) {
            case 'newbie_city':
                return this.generateNewbieCity();
            case 'newbie_field':
                return this.generateNewbieField();
            default:
                return null;
        }
    }

    generateNewbieCity() {
        console.log("🏙️ Generando mapa de Newbie City con edificios mejorados");

        try {
            const mapData = generateNewbieCityWithBuildings();
            console.log("🏙️ generateNewbieCityWithBuildings devolvió:", {
                type: typeof mapData,
                isArray: Array.isArray(mapData),
                hasMap: !!(mapData && mapData.map),
                hasRoofLayer: !!(mapData && mapData.roofLayer),
                hasDoorLayer: !!(mapData && mapData.doorLayer),
                hasWindowLayer: !!(mapData && mapData.windowLayer)
            });

            return MapProcessor.processMulticapaMap(mapData);
        } catch (error) {
            console.error("Error al generar mapa con edificios mejorados:", error);
            console.log("⚠️ Usando versión básica como fallback");
        }

        // Fallback
        const mapData = MapLoader.loadMap('newbie_city') || createFallbackMap();
        MapProcessor.extractRoofLayer(mapData);
        return mapData;
    }

    generateNewbieField() {
        console.log("🏞️ Generando mapa de Newbie Field");

        try {
            // Try multicapa generation first
            const mapData = generateNewbieCityWithBuildings(); // This actually generates newbie_field layout
            return MapProcessor.processMulticapaMap(mapData);
        } catch (error) {
            console.error("Error generando newbie_field:", error);
        }

        // Fallback
        const fallbackMap = createFallbackMap();
        console.log(`⚠️ Usando mapa fallback para newbie_field: ${fallbackMap.length}x${fallbackMap[0].length}`);
        MapProcessor.extractRoofLayer(fallbackMap);
        return fallbackMap;
    }
}

/**
 * Unified Map Generator - Main entry point for all map generation
 */
export class UnifiedMapGenerator {
    /**
     * Generate a map by type with full system integration
     * @param {string} mapType - Type of map to generate
     * @param {Object} options - Generation options
     * @returns {Array} Generated map
     */
    static generateMap(mapType, options = {}) {
        const {
            useCache = true,
            forceRegenerate = false,
            customParams = {}
        } = options;

        console.log(`🗺️ Generando mapa "${mapType}" con sistema unificado`);

        try {
            // Check cache first (if enabled)
            if (useCache && shouldCacheMap(mapType) && !forceRegenerate) {
                const cachedMap = mapCache.get(MapCache.generateKey(mapType));
                if (cachedMap) {
                    return cachedMap.data;
                }
            }

            // Generate map based on configuration
            const config = getMapConfig(mapType);
            let mapData = null;

            if (!config) {
                console.warn(`⚠️ Configuración no encontrada para ${mapType}, intentando generación procedural`);
                mapData = ProceduralMapGenerator.generateMap(mapType);
            } else {
                switch (config.type) {
                    case 'static':
                        mapData = this.generateStaticMap(mapType, config);
                        break;
                    case 'procedural':
                        mapData = ProceduralMapGenerator.generateMap(mapType);
                        break;
                    case 'special':
                        const strategy = new SpecialMapStrategy();
                        mapData = strategy.generate(mapType);
                        break;
                    default:
                        console.warn(`⚠️ Tipo desconocido "${config.type}" para ${mapType}`);
                        mapData = ProceduralMapGenerator.generateMap(mapType);
                }
            }

            // Validate and process the generated map
            // Si es un objeto multicapa, validar el array base
            const mapToValidate = (mapData && typeof mapData === 'object' && mapData.map) ? mapData.map : mapData;
            
            if (mapData && MapProcessor.validateMap(mapToValidate)) {
                // Cache the result if enabled
                if (useCache && shouldCacheMap(mapType)) {
                    mapCache.set(MapCache.generateKey(mapType), mapData, {
                        config: config,
                        generatedAt: Date.now()
                    });
                }

                // Log apropiado según el tipo de mapData
                if (mapData.map && Array.isArray(mapData.map)) {
                    console.log(`✅ Mapa "${mapType}" generado exitosamente (multicapa): ${mapData.map.length}x${mapData.map[0]?.length || 0}`);
                } else {
                    console.log(`✅ Mapa "${mapType}" generado exitosamente: ${mapToValidate.length}x${mapToValidate[0]?.length || 0}`);
                }
                return mapData;
            } else {
                console.error(`❌ Mapa generado para "${mapType}" no pasó validación`);
            }

        } catch (error) {
            console.error(`❌ Error en generación unificada para "${mapType}":`, error);
        }

        // Final fallback
        console.log(`⚠️ Usando mapa fallback para "${mapType}"`);
        const fallbackMap = MapProcessor.createValidatedFallbackMap();
        return fallbackMap;
    }

    /**
     * Generate static map with fallback to procedural
     * @param {string} mapType - Map type
     * @param {Object} config - Map configuration
     * @returns {Array|null} Generated map or null
     */
    static generateStaticMap(mapType, config) {
        console.log(`🏗️ Intentando cargar mapa estático: ${mapType}`);

        // Try static loading first
        let mapData = MapLoader.loadMap(mapType);

        if (mapData) {
            console.log(`✅ Mapa estático ${mapType} cargado`);
            return mapData;
        }

        // Fallback to procedural generation
        console.log(`⚠️ Mapa estático ${mapType} no encontrado, usando generación procedural`);
        return ProceduralMapGenerator.generateMap(mapType);
    }

    /**
     * Preload commonly used maps
     * @param {Array} mapTypes - Types of maps to preload
     * @returns {Promise} Preload promise
     */
    static async preloadMaps(mapTypes) {
        console.log(`🗄️ Preloading mapas con sistema unificado: ${mapTypes.join(', ')}`);
        return mapCache.preloadMaps(mapTypes);
    }

    /**
     * Clear map cache
     */
    static clearCache() {
        mapCache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    static getCacheStats() {
        return mapCache.getStats();
    }

    /**
     * Generate themed map
     * @param {string} theme - Theme name
     * @param {string} baseType - Base map type
     * @returns {Array} Themed map
     */
    static generateThemedMap(theme, baseType) {
        return ProceduralMapGenerator.generateThemedMap(theme, baseType);
    }

    /**
     * Generate map with difficulty
     * @param {string} mapType - Map type
     * @param {string} difficulty - Difficulty level
     * @returns {Array} Generated map
     */
    static generateMapWithDifficulty(mapType, difficulty) {
        return ProceduralMapGenerator.generateMapWithDifficulty(mapType, difficulty);
    }

    /**
     * Get available map types
     * @returns {Array} Available map types
     */
    static getAvailableMapTypes() {
        return Object.keys(require('./MapConfig.js').MAP_CONFIG);
    }

    /**
     * Validate map configuration
     * @param {string} mapType - Map type to validate
     * @returns {Object} Validation result
     */
    static validateMapConfiguration(mapType) {
        return require('./MapConfig.js').validateMapConfig(mapType);
    }
}

/**
 * Legacy function for backward compatibility
 * @param {string} mapType - Type of map to generate
 * @returns {Array} Generated map
 */
export function generateMap(mapType) {
    return UnifiedMapGenerator.generateMap(mapType);
}

// Re-export the isWalkable function for compatibility
export { isWalkable };
