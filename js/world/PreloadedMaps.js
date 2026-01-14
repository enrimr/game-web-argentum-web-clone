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
        { id: 'training_fields', path: 'js/world/maps/training_fields.json' }
        // Los mapas de Canarias están en backup/ temporalmente
        // Se añadirán nuevos mapas del mundo aquí conforme se creen
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
