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
        MUSIC_ENABLED: false,  // Control separado para música
        SFX_ENABLED: false,    // Control separado para efectos de sonido
        VOLUMES: {
            MASTER: 1.0,
            MUSIC: 0.1,      // Volumen de música de fondo
            BATTLE: 0.8,
            ENEMIES: 0.7,
            GATHERING: 0.6,
            INVENTORY: 0.5,
            WORLD: 0.7
        },
        COOLDOWN_MS: 100, // Tiempo mínimo entre reproducción del mismo sonido
        POOL_SIZE: 5, // Cantidad de instancias por sonido para overlapping
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

    // Configuración del servidor (Multiplayer)
    // NOTA: Puedes crear js/config.local.js para sobrescribir estos valores sin modificar este archivo
    SERVER: {
        // URL del servidor API y WebSocket
        // Se detecta automáticamente según el hostname:
        // - localhost/127.0.0.1 → http://localhost:3000
        // - Otro dominio → URL de producción definida abajo
        API_URL: getServerUrl(),
        
        // URL de producción (edita esto con tu URL de servidor en producción)
        PRODUCTION_URL: 'https://calima-online-server-production.up.railway.app',
        
        // Configuración de reconexión
        RECONNECTION_ATTEMPTS: 5,
        RECONNECTION_DELAY: 1000,
        
        // Timeout de peticiones HTTP (ms)
        REQUEST_TIMEOUT: 10000
    },
};

/**
 * Detecta automáticamente la URL del servidor según el entorno
 * Prioridad: window.ENV > config.local.js > detección automática
 * @returns {string} URL del servidor
 */
function getServerUrl() {
    // 1. Prioridad MÁXIMA: Variables de entorno inyectadas por el servidor web (Vercel, Netlify, etc.)
    if (typeof window !== 'undefined' && window.ENV && window.ENV.API_URL) {
        console.log('🔧 Usando variable de entorno del servidor web:', window.ENV.API_URL);
        return window.ENV.API_URL;
    }
    
    // 2. Prioridad MEDIA: Detección automática por hostname
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isDevelopment) {
        console.log('🏠 Entorno detectado: DESARROLLO (localhost)');
        return 'http://localhost:3000';
    } else {
        // En producción, usar la URL configurada
        console.log('🌐 Entorno detectado: PRODUCCIÓN');
        // Esta URL se obtiene de CONFIG.SERVER.PRODUCTION_URL después de inicializar CONFIG
        return null; // Se asignará después
    }
}

// Aplicar URL de producción si estamos en producción
if (CONFIG.SERVER.API_URL === null) {
    CONFIG.SERVER.API_URL = CONFIG.SERVER.PRODUCTION_URL;
}

console.log(`🔗 URL del servidor configurada: ${CONFIG.SERVER.API_URL}`);

// 3. Prioridad BAJA: Intentar cargar configuración local si existe (opcional, para override manual)
try {
    const { LOCAL_CONFIG_OVERRIDES } = await import('./config.local.js');
    
    // Aplicar overrides de configuración local
    if (LOCAL_CONFIG_OVERRIDES) {
        console.log('📝 Aplicando configuración local (config.local.js) - OVERRIDE MANUAL');
        
        // Sobrescribir valores de SERVER si existen
        if (LOCAL_CONFIG_OVERRIDES.SERVER) {
            Object.assign(CONFIG.SERVER, LOCAL_CONFIG_OVERRIDES.SERVER);
            console.log('🔗 URL del servidor sobrescrita manualmente:', CONFIG.SERVER.API_URL);
        }
    }
} catch (error) {
    // config.local.js no existe - usar detección automática o window.ENV
    console.log('📌 Configuración final aplicada');
}
