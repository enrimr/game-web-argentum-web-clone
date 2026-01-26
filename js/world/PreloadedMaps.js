/**
 * PreloadedMaps.js
 * Sistema para precargar mapas JSON y tenerlos disponibles para el juego
 */

// Inicializar objeto global de mapas precargados
window.__PRELOADED_MAPS__ = {};

/**
 * Carga un mapa JSON desde un archivo
 * @param {string} mapId - Identificador del mapa
 * @param {string} filePath - Ruta al archivo JSON
 * @returns {Promise} - Promesa que se resuelve cuando el mapa está cargado
 */
export function loadMapFromJson(mapId, filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error cargando mapa ${mapId}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            window.__PRELOADED_MAPS__[mapId] = data;
            console.log(`✅ Mapa ${mapId} cargado con éxito desde ${filePath}`);
            return data;
        })
        .catch(error => {
            console.error(`❌ Error cargando mapa ${mapId} desde ${filePath}:`, error);
        });
}

/**
 * Inicializa la precarga de todos los mapas necesarios
 * @returns {Promise} - Promesa que se resuelve cuando todos los mapas están cargados
 */
export function preloadAllMaps() {
    console.log('🗺️ Iniciando precarga de mapas...');
    
    // Lista de mapas a precargar
    const mapsList = [
        // ===== MAPAS EXISTENTES =====
        { id: 'training_fields', path: 'js/world/maps/training_fields.json' },

        // ===== ZONA 1: BOSQUES EXTERIORES =====
        { id: 'forest_outskirts_1', path: 'js/world/maps/forest_outskirts_1.json' },
        { id: 'forest_outskirts_2', path: 'js/world/maps/forest_outskirts_2.json' },
        { id: 'forest_outskirts_3', path: 'js/world/maps/forest_outskirts_3.json' },

        // ===== ZONA 2: BOSQUE OSCURO =====
        { id: 'dark_forest_north', path: 'js/world/maps/dark_forest_north.json' },
        { id: 'dark_forest_center', path: 'js/world/maps/dark_forest_center.json' },
        { id: 'dark_forest_south', path: 'js/world/maps/dark_forest_south.json' },
        { id: 'dark_forest_east', path: 'js/world/maps/dark_forest_east.json' },

        // ===== ZONA 3: MONTAÑAS =====
        { id: 'mountain_pass_lower', path: 'js/world/maps/mountain_pass_lower.json' },
        { id: 'mountain_pass_middle', path: 'js/world/maps/mountain_pass_middle.json' },
        { id: 'mountain_pass_upper', path: 'js/world/maps/mountain_pass_upper.json' },
        { id: 'mountain_peak', path: 'js/world/maps/mountain_peak.json' },

        // ===== MAZMORRAS =====
        { id: 'forest_cave', path: 'js/world/maps/forest_cave.json' },
        { id: 'mountain_dungeon', path: 'js/world/maps/mountain_dungeon.json' },

        // ===== MAPAS DE PRUEBA =====
        { id: 'guard_test_arena', path: 'js/world/maps/guard_test_arena.json' }

        // Los mapas de Canarias están en backup/ temporalmente
        // Se añadirán más mapas del mundo aquí conforme se creen
    ];
    
    // Cargar todos los mapas en paralelo
    const loadPromises = mapsList.map(map => loadMapFromJson(map.id, map.path));
    
    return Promise.all(loadPromises)
        .then(() => {
            console.log('🎮 Todos los mapas han sido precargados correctamente');
        })
        .catch(error => {
            console.error('❌ Error durante la precarga de mapas:', error);
        });
}

// Exportar los mapas precargados
export function getPreloadedMap(mapId) {
    return window.__PRELOADED_MAPS__[mapId] || null;
}

// Inicializar precarga de mapas al cargar este módulo
preloadAllMaps();
