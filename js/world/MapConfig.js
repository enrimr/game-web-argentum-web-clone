/**
 * MapConfig.js
 * Sistema de configuración para generación de mapas
 * Define cómo se generan los diferentes tipos de mapas
 */

/**
 * Map configuration object
 * Defines generation parameters for each map type
 */
export const MAP_CONFIG = {
    // Special newbie maps with enhanced features
    newbie_city: {
        type: 'special',
        generator: 'SpecialMapGenerator',
        cache: true,
        safeZone: true,
        description: 'Ciudad inicial con edificios detallados',
        worldPosition: { x: 100, y: 100 },
        metadata: {
            hasBuildings: true,
            hasDoors: true,
            hasWindows: true,
            hasRoofs: true
        }
    },

    newbie_field: {
        type: 'special',
        generator: 'SpecialMapGenerator',
        cache: true,
        safeZone: true,
        description: 'Campo seguro para principiantes',
        worldPosition: { x: 100, y: 250 },
        metadata: {
            hasTrees: true,
            hasStones: true,
            hasPaths: true
        }
    },

    training_fields: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'Campos de entrenamiento para combate',
        worldPosition: { x: 110, y: 100 },
        fileSource: 'training_fields.json'
    },

    // Static maps (try static first, fallback to procedural)
    canarias_capital: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'Capital de las Islas Canarias',
        worldPosition: { x: 200, y: 200 },
        fileSource: 'canarias_capital.json'
    },

    canarias_dunas: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'Dunas desérticas de Canarias',
        worldPosition: { x: 300, y: 150 },
        fileSource: 'canarias_dunas.json'
    },

    canarias_playa_canteras: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: true,
        description: 'Playa de Las Canteras',
        worldPosition: { x: 250, y: 300 },
        fileSource: 'canarias_playa_canteras.json'
    },

    canarias_teide_dungeon: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: false, // Dungeons might be procedural
        safeZone: false,
        description: 'Mazmorra del Teide',
        worldPosition: { x: 350, y: 100 },
        fileSource: 'canarias_teide_dungeon.json'
    },

    // Procedural maps with parameters
    field: {
        type: 'procedural',
        generator: 'BasicMapGenerator',
        cache: true,
        safeZone: false,
        description: 'Campo abierto básico',
        params: {
            treeDensity: 0.05,
            stoneDensity: 0.02,
            obstacleClusters: true
        }
    },

    city: {
        type: 'procedural',
        generator: 'BasicMapGenerator',
        cache: true,
        safeZone: false,
        description: 'Ciudad con calles y edificios',
        params: {
            streetSpacing: 8,
            buildingDensity: 0.4,
            plazaSize: 6
        }
    },

    forest: {
        type: 'procedural',
        generator: 'BasicMapGenerator',
        cache: true,
        safeZone: false,
        description: 'Bosque denso con caminos',
        params: {
            treeDensity: 0.3,
            stoneDensity: 0.05,
            hasPaths: true,
            pathWidth: 2
        }
    },

    dungeon: {
        type: 'procedural',
        generator: 'DungeonGenerator',
        cache: false, // Dungeons should be unique
        safeZone: false,
        description: 'Mazmorra básica',
        params: {
            roomCount: 5,
            corridorWidth: 2,
            hasTreasures: true
        }
    },

    deep_dungeon: {
        type: 'procedural',
        generator: 'DungeonGenerator',
        cache: false,
        safeZone: false,
        description: 'Mazmorra profunda y peligrosa',
        params: {
            roomCount: 8,
            corridorWidth: 1,
            hasTraps: true,
            hasTreasures: true,
            difficulty: 'hard'
        }
    },

    castle: {
        type: 'procedural',
        generator: 'BasicMapGenerator',
        cache: true,
        safeZone: false,
        description: 'Interior de castillo',
        params: {
            wallThickness: 3,
            roomCount: 3,
            hasThroneRoom: true
        }
    },

    market: {
        type: 'procedural',
        generator: 'BasicMapGenerator',
        cache: true,
        safeZone: true,
        description: 'Mercado al aire libre',
        params: {
            stallSpacing: 6,
            stallDensity: 0.6,
            hasCentralPlaza: true
        }
    },

    ruins: {
        type: 'procedural',
        generator: 'BasicMapGenerator',
        cache: true,
        safeZone: false,
        description: 'Ruinas antiguas',
        params: {
            wallDensity: 0.1,
            floorDensity: 0.3,
            hasPaths: true
        }
    },

    throne_room: {
        type: 'procedural',
        generator: 'BasicMapGenerator',
        cache: true,
        safeZone: false,
        description: 'Sala del trono real',
        params: {
            wallThickness: 4,
            hasThrone: true,
            ceremonial: true
        }
    },

    dark_forest: {
        type: 'procedural',
        generator: 'StaticMapGenerator',
        cache: true,
        safeZone: false,
        description: 'Bosque oscuro misterioso',
        params: {
            treeDensity: 0.35,
            stoneDensity: 0.08,
            hasClearings: true,
            ambientDarkness: true
        }
    }
};

/**
 * Get configuration for a specific map type
 * @param {string} mapType - Type of map
 * @returns {Object|null} Map configuration or null if not found
 */
export function getMapConfig(mapType) {
    return MAP_CONFIG[mapType] || null;
}

/**
 * Get all map types of a specific category
 * @param {string} type - Type category ('static', 'procedural', 'special')
 * @returns {Array} Array of map types
 */
export function getMapsByType(type) {
    return Object.keys(MAP_CONFIG).filter(mapType => MAP_CONFIG[mapType].type === type);
}

/**
 * Check if a map type should be cached
 * @param {string} mapType - Type of map
 * @returns {boolean} True if should be cached
 */
export function shouldCacheMap(mapType) {
    const config = getMapConfig(mapType);
    return config ? config.cache !== false : false;
}

/**
 * Get generation parameters for a map type
 * @param {string} mapType - Type of map
 * @returns {Object} Generation parameters
 */
export function getMapParams(mapType) {
    const config = getMapConfig(mapType);
    return config ? config.params || {} : {};
}

/**
 * Get all preloadable maps (those marked for caching)
 * @returns {Array} Array of map types to preload
 */
export function getPreloadableMaps() {
    return Object.keys(MAP_CONFIG).filter(mapType => {
        const config = MAP_CONFIG[mapType];
        return config.cache === true;
    });
}

/**
 * Validate map configuration
 * @param {string} mapType - Type of map to validate
 * @returns {Object} Validation result
 */
export function validateMapConfig(mapType) {
    const config = getMapConfig(mapType);

    if (!config) {
        return { valid: false, error: `Map type '${mapType}' not found in configuration` };
    }

    const requiredFields = ['type', 'generator', 'description'];
    const missingFields = requiredFields.filter(field => !config[field]);

    if (missingFields.length > 0) {
        return {
            valid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
        };
    }

    const validTypes = ['static', 'procedural', 'special'];
    if (!validTypes.includes(config.type)) {
        return {
            valid: false,
            error: `Invalid type '${config.type}'. Must be one of: ${validTypes.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Get map metadata
 * @param {string} mapType - Type of map
 * @returns {Object} Map metadata
 */
export function getMapMetadata(mapType) {
    const config = getMapConfig(mapType);
    return config ? config.metadata || {} : {};
}

/**
 * Check if map is a safe zone
 * @param {string} mapType - Type of map
 * @returns {boolean} True if safe zone
 */
export function isSafeZone(mapType) {
    const config = getMapConfig(mapType);
    return config ? config.safeZone === true : false;
}

/**
 * Get world position for a map
 * @param {string} mapType - Type of map
 * @returns {Object|null} World position {x, y} or null
 */
export function getWorldPosition(mapType) {
    const config = getMapConfig(mapType);
    return config ? config.worldPosition || null : null;
}
