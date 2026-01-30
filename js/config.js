/**
 * Configuración global del juego
 * Todas las constantes y valores de balance en un solo lugar
 */

export const CONFIG = {
    // Dimensiones del juego
    TILE_SIZE: 32,
    VIEWPORT_WIDTH: 20,  // Celdas visibles horizontalmente
    VIEWPORT_HEIGHT: 13, // Celdas visibles verticalmente
    MAP_WIDTH: 60,       // Mapa total ancho (3x más grande)
    MAP_HEIGHT: 40,      // Mapa total alto (3x más grande)
    MAX_INVENTORY_SLOTS: 45, // Máximo de items (9 slots x 5 páginas)
    INVENTORY_SLOTS_PER_PAGE: 9, // Slots visibles por página

    // Configuración de edificios
    BUILDING: {
        // Si es false, los techos se vuelven a mostrar cuando el jugador sale del edificio
        // Si es true, los techos permanecen ocultos una vez visitado el edificio
        PERSISTENT_ROOF_VISIBILITY: false,
    },

    // Canvas
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 416,

    // Jugador
    PLAYER: {
        STARTING_X: 18,
        STARTING_Y: 15,
        STARTING_HP: 100,
        STARTING_MANA: 50,
        MOVE_DELAY: 150, // milliseconds
        BASE_DAMAGE_MIN: 10,
        BASE_DAMAGE_MAX: 15,
        DAMAGE_PER_LEVEL: 2,
    },

    // Sistema de niveles
    LEVEL: {
        STARTING_LEVEL: 1,
        STARTING_EXP: 0,
        BASE_EXP_TO_LEVEL: 100,
        EXP_MULTIPLIER: 1.5, // Cada nivel requiere 1.5x más EXP
        HP_GAIN_PER_LEVEL: 20,
        MANA_GAIN_PER_LEVEL: 10,
    },

    // Enemigos
    ENEMY: {
        COUNT: 4,
        HP: 30,
        BASE_MOVE_DELAY: 800,
        MOVE_DELAY_VARIANCE: 400,
        ATTACK_DELAY: 2000,
        ATTACK_RANGE: 1, // tiles
        DETECTION_RANGE: 8, // tiles
        DAMAGE_MIN: 5,
        DAMAGE_MAX: 10,
        EXP_REWARD: 40,
        GOLD_DROP_MIN: 10,
        GOLD_DROP_MAX: 20,
    },

    // Objetos del mundo
    WORLD: {
        CHEST_COUNT: 3,
        CHEST_GOLD_MIN: 20,
        CHEST_GOLD_MAX: 50,
        COIN_COUNT: 5,
        COIN_VALUE_MIN: 5,
        COIN_VALUE_MAX: 20,
    },

    // Generación del mapa
    MAP: {
        TREE_PROBABILITY: 0.1,
        STONE_PROBABILITY: 0.05,
    },

    // Tiles
    TILES: {
        GRASS: 0,
        WATER: 1,
        STONE: 2,
        TREE: 3,
        WALL: 4,      // Solid walls for city/dungeon borders
        BUILDING: 5,  // Buildings in city
        FLOOR: 6,     // Dungeon floor
        DUNGEON_WALL: 7, // Dungeon walls
        PATH: 8       // Dirt paths to other areas
    },

    // Audio
    AUDIO: {
        ENABLED: true,
        MUSIC_ENABLED: false,  // OFF por defecto
        SFX_ENABLED: false,    // OFF por defecto
        VOLUMES: {
            MASTER: 1.0,
            MUSIC: 0.2,      // Volumen más bajo de música de fondo
            BATTLE: 0.5,
            ENEMIES: 0.4,
            GATHERING: 0.4,
            INVENTORY: 0.3,
            WORLD: 0.4
        },
        COOLDOWN_MS: 100, // Tiempo mínimo entre reproducción del mismo sonido
        POOL_SIZE: 3, // Cantidad de instancias por sonido para overlapping
        FALLBACK_ENEMY_SOUND: 'general', // Sonido por defecto para enemigos
        MUSIC: {
            FADE_DURATION: 2000, // Duración del crossfade en ms
            LOOP: true,          // Música en loop
            PRELOAD: 'auto'      // Precarga de música
        },
        // Mapeo de tipos de mapa a música
        MAP_MUSIC: {
            'village': 'village',     // Ciudades y pueblos
            'forest': 'forest',       // Bosques
            'mountain': 'mountain',   // Montañas
            'default': 'forest'       // Por defecto
        }
    },

    // Preloader
    PRELOADER: {
        ENABLED: false,        // Si es false, salta la pantalla de precarga
        MAX_RETRIES: 3,       // Número máximo de reintentos por recurso
        RETRY_DELAY: 1000,    // Delay base entre reintentos (ms)
        TIMEOUT: 10000,       // Timeout por recurso (ms)
        CONCURRENCY: 5        // Número de recursos a cargar en paralelo
    },
};
