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

    // ===== NUESTROS MAPAS JSON =====
    // Zona 1: Bosques Exteriores
    forest_outskirts_1: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'El límite norte de los campos de entrenamiento. Los árboles comienzan a densificarse.',
        worldPosition: { x: 110, y: 90 },
        fileSource: 'forest_outskirts_1.json'
    },

    forest_outskirts_2: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'Bosque más denso al este de los campos de entrenamiento. Los árboles se hacen más abundantes.',
        worldPosition: { x: 120, y: 100 },
        fileSource: 'forest_outskirts_2.json'
    },

    forest_outskirts_3: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'La zona más densa del bosque exterior. Los árboles casi bloquean el paso en algunas áreas.',
        worldPosition: { x: 130, y: 100 },
        fileSource: 'forest_outskirts_3.json'
    },

    // Zona 2: Bosque Oscuro
    dark_forest_north: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'El bosque se vuelve más oscuro y peligroso. Los lobos acechan entre las sombras.',
        worldPosition: { x: 110, y: 80 },
        fileSource: 'dark_forest_north.json'
    },

    dark_forest_center: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'El corazón del bosque oscuro. Más denso y peligroso, con una entrada a una cueva misteriosa.',
        worldPosition: { x: 110, y: 70 },
        fileSource: 'dark_forest_center.json'
    },

    dark_forest_south: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'La zona sur del bosque oscuro. Más cerca de las montañas, con menos árboles pero mayor peligro.',
        worldPosition: { x: 110, y: 60 },
        fileSource: 'dark_forest_south.json'
    },

    dark_forest_east: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'El límite oriental del bosque oscuro. La transición a las montañas comienza aquí.',
        worldPosition: { x: 120, y: 70 },
        fileSource: 'dark_forest_east.json'
    },

    // Zona 3: Montañas
    mountain_pass_lower: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'El inicio de las peligrosas montañas. Los caminos son estrechos y los peligros abundan.',
        worldPosition: { x: 110, y: 50 },
        fileSource: 'mountain_pass_lower.json'
    },

    mountain_pass_middle: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'La zona intermedia del paso de montaña. Las pendientes se hacen más pronunciadas y los peligros aumentan.',
        worldPosition: { x: 110, y: 40 },
        fileSource: 'mountain_pass_middle.json'
    },

    mountain_pass_upper: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'Las alturas extremas del paso de montaña. El aire es frío y los vientos son intensos.',
        worldPosition: { x: 110, y: 30 },
        fileSource: 'mountain_pass_upper.json'
    },

    mountain_peak: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'La cumbre más alta de las montañas. Desde aquí se divisa todo el mundo.',
        worldPosition: { x: 110, y: 20 },
        fileSource: 'mountain_peak.json'
    },

    // Mazmorras
    forest_cave: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'Una mazmorra subterránea llena de peligros. Corredores estrechos conectan varias salas grandes.',
        worldPosition: null,
        fileSource: 'forest_cave.json'
    },

    mountain_dungeon: {
        type: 'static',
        generator: 'StaticMapLoader',
        cache: true,
        safeZone: false,
        description: 'Una antigua mazmorra excavada en las profundidades de las montañas.',
        worldPosition: null,
        fileSource: 'mountain_dungeon.json'
    },

    // Mapas legacy
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
