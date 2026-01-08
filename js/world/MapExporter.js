/**
 * MapExporter.js
 * Funciones para exportar mapas generados proceduralmente a archivos JSON
 */

/**
 * Intenta guardar un mapa generado proceduralmente como un archivo JSON
 * @param {string} mapName - Nombre del mapa (usado para el nombre del archivo)
 * @param {Object} mapData - Los datos del mapa generado
 * @param {boolean} forceOverwrite - Si true, sobrescribe el archivo aunque ya exista
 * @param {boolean} useProvidedEntities - Si true, usa los objetos, enemigos y NPCs proporcionados en mapData
 */
export function exportMapToJSON(mapName, mapData, forceOverwrite = false, useProvidedEntities = false) {
    try {
        console.log(`🔍 Intentando exportar mapa ${mapName}...`);
        
        // Para depuración: siempre forzar la exportación
        forceOverwrite = true;
        
        // Verificar si el archivo ya existe usando localStorage como caché
        const cacheKey = `mapExport_${mapName}`;
        const hasExported = localStorage.getItem(cacheKey);
        
        console.log(`  - Estado previo: ${hasExported ? "Ya exportado" : "No exportado"}`);
        console.log(`  - Forzar sobrescritura: ${forceOverwrite}`);
        
        // Si ya se exportó y no queremos forzar sobreescritura, salimos
        if (hasExported && !forceOverwrite) {
            console.log(`🗺️ Mapa ${mapName} ya fue exportado previamente.`);
            return;
        }
        
        // Preparar el objeto JSON con metadatos
        const mapObject = {
            name: getMapDisplayName(mapName),
            description: mapName.includes("_exported") ? `Estado del mapa ${mapName.replace('_exported', '')} en momento de exportación` : 
                        mapName.includes("newbie_city") ? "Ciudad inicial con edificios navegables" : 
                        "Mapa generado proceduralmente",
            type: mapName.includes("city") ? "city" : 
                 mapName.includes("forest") ? "forest" :
                 mapName.includes("dungeon") ? "dungeon" : "field",
            safeZone: mapName.includes("city") || mapName.includes("newbie"),
            worldPosition: mapData.worldPosition || { x: 100, y: 100 },
            layers: {
                base: mapData.map,
                roofs: mapData.roofLayer || [],
                doors: mapData.doorLayer || [],
                windows: mapData.windowLayer || []
            }
        };
        
        // Añadir los portales - usar los proporcionados o predeterminados
        mapObject.portals = useProvidedEntities && mapData.objects ? 
            extractPortalsFromObjects(mapData.objects) : 
            [
                {
                    x: 25,
                    y: 5,
                    targetMap: "newbie_field",
                    targetX: 25,
                    targetY: 30,
                    name: "Campo"
                }
            ];
            
        // Añadir NPCs - usar los proporcionados o predeterminados
        mapObject.npcs = useProvidedEntities && mapData.npcs ? 
            mapData.npcs.map(npc => ({
                type: npc.npcType || "citizen",
                x: npc.x,
                y: npc.y,
                name: npc.name || "NPC",
                dialogue: npc.dialogue || null
            })) : 
            [
                {
                    type: "citizen",
                    x: 25,
                    y: 25,
                    name: "Guardia"
                }
            ];
            
        // Añadir enemigos si se proporcionan
        if (useProvidedEntities && mapData.enemies && mapData.enemies.length > 0) {
            mapObject.enemies = mapData.enemies.map(enemy => ({
                type: enemy.enemyType || "slime",
                x: enemy.x,
                y: enemy.y,
                level: enemy.level || 1
            }));
        }
        
        // Añadir objetos interactivos (no portales) si se proporcionan
        if (useProvidedEntities && mapData.objects) {
            const interactiveObjects = mapData.objects.filter(obj => obj.type !== 'portal');
            if (interactiveObjects.length > 0) {
                mapObject.objects = interactiveObjects;
            }
        }
        
        // Si se proporciona, incluir la posición del jugador
        if (mapData.playerPosition) {
            mapObject.playerSpawn = mapData.playerPosition;
        }
        
        // Crear un formateador personalizado para matrices en formato compacto
        const jsonContent = formatMapJSON(mapObject);
        
        // Crear un objeto Blob con el contenido JSON
        const blob = new Blob([jsonContent], { type: 'application/json' });
        
        // Crear un enlace para descargar
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${mapName}.json`;
        
        // Intenta guardar automáticamente (navegador permitiendo)
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        
        // Registrar en la consola que intentamos guardar
        console.log(`🗺️ Intentando exportar mapa "${mapName}" a JSON... Revise sus descargas o use el enlace:`);
        console.log(downloadLink.href);
        
        // Simular click para descargar
        downloadLink.click();
        
        // Guardar en localStorage que ya se exportó
        // Para depuración: no guardar el estado de exportación por ahora
        // localStorage.setItem(cacheKey, "true");
        console.log(`  - Exportación completa. No se marca como exportado para facilitar pruebas.`);
        
        // Mostrar mensaje en la consola para verificar
        console.log(`✅ Mapa "${mapName}" exportado correctamente como JSON.`);
        
        // Limpiar recursos
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadLink.href);
        }, 100);
    } catch (error) {
        console.error(`❌ Error al exportar mapa "${mapName}" a JSON:`, error);
    }
}

/**
 * Verifica si un mapa ya ha sido exportado previamente
 * @param {string} mapName - Nombre del mapa a verificar
 * @returns {boolean} - true si ya fue exportado, false en caso contrario
 */
export function hasMapBeenExported(mapName) {
    const cacheKey = `mapExport_${mapName}`;
    return localStorage.getItem(cacheKey) === "true";
}

/**
 * Marca un mapa como exportado sin realizar la exportación real
 * @param {string} mapName - Nombre del mapa a marcar
 */
export function markMapAsExported(mapName) {
    const cacheKey = `mapExport_${mapName}`;
    localStorage.setItem(cacheKey, "true");
}

/**
 * Formatea un objeto de mapa a JSON con formato especial para matrices
 * Las matrices se muestran con cada fila en una sola línea
 * @param {Object} mapObject - El objeto de mapa a formatear
 * @returns {string} - JSON formateado
 */
function formatMapJSON(mapObject) {
    // Generar el JSON final con el formato deseado
    let output = "{\n";
    
    // Procesar cada propiedad del objeto
    Object.keys(mapObject).forEach((key, index, arr) => {
        if (key === "layers") {
            // Procesar especialmente las capas
            output += '  "layers": {\n';
            
            // Procesar cada capa
            Object.keys(mapObject.layers).forEach((layer, layerIndex, layerArr) => {
                output += `    "${layer}": [\n`;
                
                // Procesar cada fila de la matriz en una sola línea
                mapObject.layers[layer].forEach((row, rowIndex, rowArr) => {
                    output += `      [${row.join(',')}]`;
                    if (rowIndex < rowArr.length - 1) output += ',';
                    output += '\n';
                });
                
                output += '    ]';
                if (layerIndex < layerArr.length - 1) output += ',';
                output += '\n';
            });
            
            output += '  }';
        } else {
            // Otras propiedades con formato estándar
            output += `  "${key}": ${JSON.stringify(mapObject[key], null, 2).replace(/\n/g, '\n  ')}`;
        }
        
        if (index < arr.length - 1) output += ',';
        output += '\n';
    });
    
    output += '}';
    return output;
}

/**
 * Exporta el mapa actual en el que se encuentra el jugador
 */
export function exportCurrentMap() {
    try {
        // Importar gameState para acceder al mapa actual
        import('../state.js').then(({ gameState }) => {
            // Obtener el nombre del mapa actual
            const currentMapName = gameState.currentMap;
            
            console.log(`🔄 Exportando mapa actual: ${currentMapName}`);
            
            // Preparar los datos del mapa actual con todas sus capas
            const mapData = {
                map: gameState.map,
                roofLayer: gameState.roofLayer || [],
                doorLayer: gameState.doorLayer || [],
                windowLayer: gameState.windowLayer || [],
                // Capturamos también los objetos, enemigos y NPCs actuales
                objects: gameState.objects,
                enemies: gameState.enemies,
                npcs: gameState.npcs,
                // Metadatos adicionales útiles
                currentMap: currentMapName,
                playerPosition: { x: gameState.player.x, y: gameState.player.y }
            };
            
            // Exportar el mapa con el nombre actual y toda la información
            exportMapToJSON(`${currentMapName}_exported`, mapData, true, true);
        }).catch(err => {
            console.error('❌ Error al importar gameState:', err);
        });
    } catch (error) {
        console.error('❌ Error al exportar mapa actual:', error);
    }
}

/**
 * Añade un botón para exportar manualmente mapas a la interfaz
 * @param {string} mapName - Nombre del mapa para exportar
 * @param {Object} mapData - Datos del mapa
 * @param {boolean} addToDebugPanel - Si true, se añadirán al panel de depuración en lugar de directamente al DOM
 */
export function addExportButton(mapName, mapData, addToDebugPanel = true) {
    // Si debemos añadir al panel de depuración, solo registrar para añadirlo cuando se necesite
    if (addToDebugPanel) {
        // Registrar el mapa para ser añadido al panel de depuración
        registerMapForExport(mapName, mapData);
        return;
    }
    
    // Comportamiento original: crear contenedor y añadir directamente al DOM
    let container = document.getElementById('map-export-buttons');
    if (!container) {
        container = document.createElement('div');
        container.id = 'map-export-buttons';
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.right = '10px';
        container.style.zIndex = '1000';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        document.body.appendChild(container);
        
        // Añadir el botón de "Exportar Mapa Actual" siempre como primer botón
        addCurrentMapExportButton(container);
    }
    
    // Crear un botón para este mapa específico si no existe
    createExportButton(container, mapName, mapData);
}

/**
 * Crea un botón de exportación para un mapa específico
 * @param {HTMLElement} container - Contenedor donde añadir el botón
 * @param {string} mapName - Nombre del mapa para exportar
 * @param {Object} mapData - Datos del mapa
 * @returns {HTMLElement} El botón creado
 */
function createExportButton(container, mapName, mapData) {
    const buttonId = `export-button-${mapName}`;
    
    // Si ya existe el botón, no hacer nada
    if (document.getElementById(buttonId)) {
        return null;
    }
    
    const button = document.createElement('button');
    button.id = buttonId;
    button.textContent = `Exportar ${mapName}`;
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '3px';
    button.style.cursor = 'pointer';
    button.style.marginBottom = '5px';
    button.style.padding = '5px';
    button.style.width = '100%';
    
    button.onclick = () => {
        exportMapToJSON(mapName, mapData, true);
    };
    
    container.appendChild(button);
    return button;
}

/**
 * Añade el botón para exportar el mapa actual
 * @param {HTMLElement} container - Contenedor donde añadir el botón
 * @returns {HTMLElement} El botón creado
 */
function addCurrentMapExportButton(container) {
    const currentMapButtonId = 'export-current-map-button';
    
    // Comprobar si ya existe el botón
    if (document.getElementById(currentMapButtonId)) {
        return null;
    }
    
    const button = document.createElement('button');
    button.id = currentMapButtonId;
    button.textContent = '📍 Exportar Mapa Actual';
    button.style.backgroundColor = '#FF5722'; // Color naranja para destacar
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '3px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.marginBottom = '10px';
    button.style.padding = '5px';
    button.style.width = '100%';
    
    // Al hacer clic, exportar el mapa actual
    button.onclick = () => {
        exportCurrentMap();
    };
    
    // Añadir como primer hijo (al inicio del contenedor)
    if (container.firstChild) {
        container.insertBefore(button, container.firstChild);
    } else {
        container.appendChild(button);
    }
    
    return button;
}

// Almacén de mapas registrados para exportación
const registeredMaps = new Map();

/**
 * Registra un mapa para ser añadido al panel de depuración
 * @param {string} mapName - Nombre del mapa
 * @param {Object} mapData - Datos del mapa
 */
function registerMapForExport(mapName, mapData) {
    registeredMaps.set(mapName, mapData);
}

/**
 * Añade los botones de exportación al panel de depuración
 * @param {HTMLElement} debugPanel - El panel de depuración donde añadir los botones
 */
export function addExportButtonsToDebugPanel(debugPanel) {
    // Crear sección de exportación de mapas
    const exportTitle = document.createElement('div');
    exportTitle.textContent = 'Exportación de mapas:';
    exportTitle.style.marginTop = '15px';
    exportTitle.style.marginBottom = '5px';
    exportTitle.style.borderTop = '1px solid #555';
    exportTitle.style.paddingTop = '5px';
    debugPanel.appendChild(exportTitle);
    
    // Contenedor para los botones de exportación
    const exportContainer = document.createElement('div');
    exportContainer.id = 'debug-export-buttons';
    exportContainer.style.marginLeft = '10px';
    debugPanel.appendChild(exportContainer);
    
    // Añadir el botón de exportación del mapa actual
    addCurrentMapExportButton(exportContainer);
    
    // Añadir botones para todos los mapas registrados
    registeredMaps.forEach((mapData, mapName) => {
        createExportButton(exportContainer, mapName, mapData);
    });
}

/**
 * Obtiene un nombre de visualización para el mapa
 * @param {string} mapName - Nombre del mapa
 * @returns {string} Nombre de visualización
 */
function getMapDisplayName(mapName) {
    // Nombres predefinidos para mapas conocidos
    const mapDisplayNames = {
        'newbie_city': '🏘️ Ciudad de Ullathorpe',
        'newbie_field': '🏞️ Campos de Ullathorpe',
        'dark_forest': '🌲 Bosque Oscuro',
        'canarias_capital': '🏙️ Las Palmas de Gran Canaria',
        'canarias_playa_canteras': '🏖️ Playa de Las Canteras',
        'canarias_dunas': '🏜️ Dunas de Maspalomas',
        'canarias_teide_dungeon': '🌋 Volcán del Teide'
    };
    
    // Si es una exportación, indicarlo
    if (mapName.includes('_exported')) {
        const baseName = mapName.replace('_exported', '');
        const displayName = mapDisplayNames[baseName] || baseName;
        return `${displayName} (Exportado)`;
    }
    
    // Devolver el nombre conocido o una versión formateada del nombre
    return mapDisplayNames[mapName] || 
           mapName.replace(/_/g, ' ')
                 .split(' ')
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                 .join(' ');
}

/**
 * Extrae portales de la lista de objetos del mapa
 * @param {Array} objects - Lista de objetos del mapa
 * @returns {Array} Lista de portales extraídos
 */
function extractPortalsFromObjects(objects) {
    if (!objects || !Array.isArray(objects)) {
        return [];
    }
    
    return objects
        .filter(obj => obj.type === 'portal')
        .map(portal => ({
            x: portal.x,
            y: portal.y,
            targetMap: portal.targetMap || 'newbie_field',
            targetX: portal.targetX || 0,
            targetY: portal.targetY || 0,
            name: portal.name || `Portal a ${portal.targetMap}`
        }));
}

/**
 * Reinicia el estado de exportación para todos los mapas
 */
export function resetAllMapExports() {
    // Busca todas las claves que empiezan con 'mapExport_' en localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mapExport_')) {
            localStorage.removeItem(key);
        }
    }
    console.log('🔄 Estado de exportación de mapas reiniciado.');
}
