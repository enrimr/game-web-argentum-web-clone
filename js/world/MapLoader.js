/**
 * MapLoader.js
 * Carga de mapas estáticos desde archivos JSON o definiciones predefinidas
 */

import { loadStaticMap } from './generators/StaticMapLoader.js';
import { MapProcessor } from './MapProcessor.js';
import { getMapConfig } from './MapConfig.js';

/**
 * MapLoader class - Handles static map loading
 */
export class MapLoader {
    /**
     * Load a static map by type
     * @param {string} mapType - Type of map to load
     * @returns {Array|null} Loaded map or null if not found
     */
    static loadMap(mapType) {
        console.log(`📂 Cargando mapa estático: ${mapType}`);

        try {
            // Check configuration
            const config = getMapConfig(mapType);
            if (!config || config.type !== 'static') {
                console.warn(`⚠️ ${mapType} no está configurado como mapa estático`);
                return null;
            }

            // Try to load static map
            const staticMapData = loadStaticMap(mapType);
            if (staticMapData && Array.isArray(staticMapData) && staticMapData.length > 0) {
                console.log(`✅ Mapa estático ${mapType} cargado: ${staticMapData.length}x${staticMapData[0]?.length || 0}`);
                return staticMapData;
            }

            console.warn(`⚠️ No se pudo cargar mapa estático para ${mapType}`);
            return null;

        } catch (error) {
            console.error(`❌ Error cargando mapa estático ${mapType}:`, error);
            return null;
        }
    }

    /**
     * Load a map with layers (multicapa format)
     * @param {string} mapType - Type of map to load
     * @returns {Object|null} Map data with layers or null
     */
    static loadMapWithLayers(mapType) {
        console.log(`📂 Cargando mapa multicapa: ${mapType}`);

        try {
            const config = getMapConfig(mapType);
            if (!config) {
                console.warn(`⚠️ Configuración no encontrada para ${mapType}`);
                return null;
            }

            // For now, delegate to the existing static loader
            // This could be enhanced to load from JSON files directly
            const staticMapData = loadStaticMap(mapType);

            if (staticMapData && Array.isArray(staticMapData)) {
                // Convert to multicapa format if needed
                return {
                    map: staticMapData,
                    layers: {
                        base: staticMapData,
                        objects: [],
                        roofs: [],
                        doors: [],
                        windows: []
                    }
                };
            }

            return null;

        } catch (error) {
            console.error(`❌ Error cargando mapa multicapa ${mapType}:`, error);
            return null;
        }
    }

    /**
     * Check if a static map file exists
     * @param {string} mapType - Type of map
     * @returns {boolean} True if static map exists
     */
    static staticMapExists(mapType) {
        try {
            const config = getMapConfig(mapType);
            if (!config || config.type !== 'static') {
                return false;
            }

            // Try to load and see if it returns valid data
            const mapData = loadStaticMap(mapType);
            return mapData && Array.isArray(mapData) && mapData.length > 0;

        } catch (error) {
            return false;
        }
    }

    /**
     * Get list of available static maps
     * @returns {Array} Array of available static map types
     */
    static getAvailableStaticMaps() {
        const staticMaps = [];
        // This would ideally scan the maps directory
        // For now, return known static maps from config
        const allMaps = Object.keys(require('./MapConfig.js').MAP_CONFIG);
        allMaps.forEach(mapType => {
            if (this.staticMapExists(mapType)) {
                staticMaps.push(mapType);
            }
        });
        return staticMaps;
    }

    /**
     * Load map from JSON file (async)
     * @param {string} fileName - JSON file name
     * @returns {Promise<Object|null>} Map data or null
     */
    static async loadMapFromJSON(fileName) {
        try {
            console.log(`📂 Cargando mapa desde JSON: ${fileName}`);

            // In a browser environment, this would use fetch
            // For now, return null as we don't have async file loading
            console.warn(`⚠️ Carga async desde JSON no implementada aún: ${fileName}`);
            return null;

        } catch (error) {
            console.error(`❌ Error cargando JSON ${fileName}:`, error);
            return null;
        }
    }

    /**
     * Validate static map data
     * @param {Array} mapData - Map data to validate
     * @param {string} mapType - Type of map for context
     * @returns {boolean} True if valid
     */
    static validateStaticMap(mapData, mapType) {
        if (!Array.isArray(mapData)) {
            console.error(`❌ Mapa estático ${mapType} no es un array`);
            return false;
        }

        if (mapData.length === 0) {
            console.error(`❌ Mapa estático ${mapType} está vacío`);
            return false;
        }

        if (!Array.isArray(mapData[0])) {
            console.error(`❌ Primera fila del mapa estático ${mapType} no es un array`);
            return false;
        }

        // Check dimensions
        const expectedWidth = mapData[0].length;
        for (let y = 1; y < mapData.length; y++) {
            if (!Array.isArray(mapData[y]) || mapData[y].length !== expectedWidth) {
                console.error(`❌ Fila ${y} del mapa estático ${mapType} tiene ancho inconsistente`);
                return false;
            }
        }

        console.log(`✅ Mapa estático ${mapType} validado: ${mapData.length}x${expectedWidth}`);
        return true;
    }
}
