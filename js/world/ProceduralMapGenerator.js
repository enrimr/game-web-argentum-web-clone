/**
 * ProceduralMapGenerator.js
 * Generación procedural de mapas usando configuración
 */

import {
    generateFieldMap,
    generateCityMap,
    generateForestMap,
    generateCastleMap,
    generateMarketMap,
    generateRuinsMap,
    generateThroneRoomMap
} from './generators/BasicMapGenerator.js';
import {
    generateDungeonMap,
    generateDeepDungeonMap
} from './generators/DungeonGenerator.js';
import {
    generateNewbieCityLayout,
    generateNewbieFieldLayout,
    generateDarkForestLayout
} from './generators/StaticMapGenerator.js';
import { MapProcessor } from './MapProcessor.js';
import { getMapConfig, getMapParams } from './MapConfig.js';
import { createFallbackMap } from './generators/BaseGenerator.js';

/**
 * ProceduralMapGenerator class - Handles procedural map generation
 */
export class ProceduralMapGenerator {
    /**
     * Generate a procedural map by type
     * @param {string} mapType - Type of map to generate
     * @returns {Array|null} Generated map or null if failed
     */
    static generateMap(mapType) {
        console.log(`🎲 Generando mapa procedural: ${mapType}`);

        try {
            const config = getMapConfig(mapType);
            if (!config || config.type !== 'procedural') {
                console.warn(`⚠️ ${mapType} no está configurado como mapa procedural`);
                return null;
            }

            const params = getMapParams(mapType);
            const generator = this.getGeneratorFunction(mapType);

            if (!generator) {
                console.error(`❌ No se encontró generador para ${mapType}`);
                return null;
            }

            // Generate the map
            const mapData = generator(params);

            if (MapProcessor.validateMap(mapData)) {
                console.log(`✅ Mapa procedural ${mapType} generado: ${mapData.length}x${mapData[0]?.length || 0}`);
                return mapData;
            } else {
                console.error(`❌ Mapa procedural ${mapType} no pasó validación`);
                return null;
            }

        } catch (error) {
            console.error(`❌ Error generando mapa procedural ${mapType}:`, error);
            return null;
        }
    }

    /**
     * Get the appropriate generator function for a map type
     * @param {string} mapType - Type of map
     * @returns {Function|null} Generator function or null
     */
    static getGeneratorFunction(mapType) {
        const generators = {
            // Basic procedural generators
            field: generateFieldMap,
            city: generateCityMap,
            forest: generateForestMap,
            castle: generateCastleMap,
            market: generateMarketMap,
            ruins: generateRuinsMap,
            throne_room: generateThroneRoomMap,

            // Dungeon generators
            dungeon: generateDungeonMap,
            deep_dungeon: generateDeepDungeonMap,

            // Special procedural generators (from StaticMapGenerator)
            dark_forest: generateDarkForestLayout
        };

        return generators[mapType] || null;
    }

    /**
     * Generate map with custom parameters (overrides config)
     * @param {string} mapType - Base map type
     * @param {Object} customParams - Custom generation parameters
     * @returns {Array|null} Generated map or null
     */
    static generateMapWithParams(mapType, customParams = {}) {
        console.log(`🎲 Generando mapa ${mapType} con parámetros custom:` , customParams);

        try {
            const baseConfig = getMapConfig(mapType);
            if (!baseConfig) {
                console.warn(`⚠️ Tipo de mapa desconocido: ${mapType}`);
                return null;
            }

            const params = { ...getMapParams(mapType), ...customParams };
            const generator = this.getGeneratorFunction(mapType);

            if (!generator) {
                console.error(`❌ No se encontró generador para ${mapType}`);
                return null;
            }

            // For now, ignore custom params and use base generator
            // Future enhancement: pass params to generator functions
            const mapData = generator();

            if (MapProcessor.validateMap(mapData)) {
                console.log(`✅ Mapa procedural ${mapType} generado con custom params: ${mapData.length}x${mapData[0]?.length || 0}`);
                return mapData;
            } else {
                console.error(`❌ Mapa procedural ${mapType} no pasó validación`);
                return null;
            }

        } catch (error) {
            console.error(`❌ Error generando mapa procedural con params ${mapType}:`, error);
            return null;
        }
    }

    /**
     * Generate a random procedural map of specified type
     * @param {string} baseType - Base type ('field', 'forest', 'dungeon', etc.)
     * @param {Object} variations - Random variation parameters
     * @returns {Array|null} Generated map or null
     */
    static generateRandomMap(baseType, variations = {}) {
        console.log(`🎲 Generando mapa aleatorio basado en ${baseType}`);

        try {
            // Apply random variations to parameters
            const baseParams = getMapParams(baseType) || {};
            const randomParams = this.applyRandomVariations(baseParams, variations);

            return this.generateMapWithParams(baseType, randomParams);

        } catch (error) {
            console.error(`❌ Error generando mapa aleatorio ${baseType}:`, error);
            return null;
        }
    }

    /**
     * Apply random variations to generation parameters
     * @param {Object} baseParams - Base parameters
     * @param {Object} variations - Variation ranges
     * @returns {Object} Modified parameters
     */
    static applyRandomVariations(baseParams, variations) {
        const result = { ...baseParams };

        // Example variations that could be applied
        Object.keys(variations).forEach(key => {
            if (typeof variations[key] === 'object' && variations[key].min !== undefined && variations[key].max !== undefined) {
                const { min, max } = variations[key];
                result[key] = min + Math.random() * (max - min);
            }
        });

        return result;
    }

    /**
     * Generate a themed map (e.g., "winter_forest", "desert_city")
     * @param {string} theme - Theme name
     * @param {string} baseType - Base map type
     * @returns {Array|null} Themed map or null
     */
    static generateThemedMap(theme, baseType) {
        console.log(`🎨 Generando mapa temático: ${theme}_${baseType}`);

        try {
            // Apply theme modifications
            const themeParams = this.getThemeParams(theme);
            const baseParams = getMapParams(baseType) || {};

            const combinedParams = { ...baseParams, ...themeParams };
            return this.generateMapWithParams(baseType, combinedParams);

        } catch (error) {
            console.error(`❌ Error generando mapa temático ${theme}_${baseType}:`, error);
            return null;
        }
    }

    /**
     * Get theme-specific parameters
     * @param {string} theme - Theme name
     * @returns {Object} Theme parameters
     */
    static getThemeParams(theme) {
        const themes = {
            winter: {
                snowDensity: 0.3,
                iceFeatures: true,
                reducedTrees: true
            },
            desert: {
                sandDensity: 0.8,
                cactusDensity: 0.1,
                oasisChance: 0.05
            },
            volcanic: {
                lavaDensity: 0.2,
                rockDensity: 0.4,
                dangerous: true
            },
            magical: {
                crystalDensity: 0.1,
                enchantedTrees: true,
                magicBarriers: true
            }
        };

        return themes[theme] || {};
    }

    /**
     * Generate a map with specific difficulty level
     * @param {string} mapType - Base map type
     * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard')
     * @returns {Array|null} Generated map or null
     */
    static generateMapWithDifficulty(mapType, difficulty = 'medium') {
        console.log(`⚔️ Generando mapa ${mapType} con dificultad ${difficulty}`);

        try {
            const difficultyMultipliers = {
                easy: { enemyDensity: 0.5, resourceDensity: 1.5, trapDensity: 0.3 },
                medium: { enemyDensity: 1.0, resourceDensity: 1.0, trapDensity: 1.0 },
                hard: { enemyDensity: 1.8, resourceDensity: 0.7, trapDensity: 2.0 }
            };

            const multipliers = difficultyMultipliers[difficulty] || difficultyMultipliers.medium;
            const baseParams = getMapParams(mapType) || {};

            // Apply difficulty multipliers
            const adjustedParams = {};
            Object.keys(baseParams).forEach(key => {
                if (typeof baseParams[key] === 'number') {
                    // Apply difficulty scaling based on parameter type
                    if (key.includes('enemy') || key.includes('trap')) {
                        adjustedParams[key] = baseParams[key] * multipliers.enemyDensity;
                    } else if (key.includes('resource') || key.includes('treasure')) {
                        adjustedParams[key] = baseParams[key] * multipliers.resourceDensity;
                    } else if (key.includes('trap')) {
                        adjustedParams[key] = baseParams[key] * multipliers.trapDensity;
                    } else {
                        adjustedParams[key] = baseParams[key];
                    }
                } else {
                    adjustedParams[key] = baseParams[key];
                }
            });

            return this.generateMapWithParams(mapType, adjustedParams);

        } catch (error) {
            console.error(`❌ Error generando mapa con dificultad ${mapType}/${difficulty}:`, error);
            return null;
        }
    }

    /**
     * Get available procedural map types
     * @returns {Array} Array of available procedural map types
     */
    static getAvailableTypes() {
        return Object.keys(require('./MapConfig.js').MAP_CONFIG)
            .filter(mapType => {
                const config = require('./MapConfig.js').MAP_CONFIG[mapType];
                return config.type === 'procedural';
            });
    }

    /**
     * Validate procedural generation parameters
     * @param {string} mapType - Type of map
     * @param {Object} params - Parameters to validate
     * @returns {Object} Validation result
     */
    static validateGenerationParams(mapType, params) {
        const config = getMapConfig(mapType);
        if (!config || config.type !== 'procedural') {
            return { valid: false, error: `Tipo de mapa no procedural: ${mapType}` };
        }

        // Check for invalid parameter types
        const invalidParams = Object.keys(params).filter(key => {
            const value = params[key];
            return value !== null && value !== undefined &&
                   typeof value !== 'number' && typeof value !== 'boolean' && typeof value !== 'string';
        });

        if (invalidParams.length > 0) {
            return {
                valid: false,
                error: `Parámetros con tipos inválidos: ${invalidParams.join(', ')}`
            };
        }

        return { valid: true };
    }
}
