/**
 * WorldMap.js
 * Sistema de mapa del mundo
 */

import { gameState } from '../state.js';
import { MAP_DEFINITIONS, WORLD_CONNECTIONS } from '../world/MapDefinitions.js';

// World map variables
let worldMapCanvas = null;
let worldMapCtx = null;
let worldMapVisible = false;

// Initialize canvas references when needed
function initWorldMapCanvas() {
    if (!worldMapCanvas) {
        worldMapCanvas = document.getElementById('worldMapCanvas');
        if (worldMapCanvas) {
            worldMapCtx = worldMapCanvas.getContext('2d');
        }
    }
}

/**
 * Toggle world map visibility
 */
export function toggleWorldMap() {
    // Initialize canvas if not already done
    initWorldMapCanvas();
    
    const container = document.getElementById('worldMapContainer');
    const button = document.getElementById('toggleWorldMap');
    const mapDetailsElement = document.getElementById('worldMapDetails');
    
    if (!container || !button) return; // Safety check
    
    worldMapVisible = !worldMapVisible;

    if (worldMapVisible) {
        // Ocultar la información del mapa original
        if (mapDetailsElement) {
            mapDetailsElement.innerHTML = '';
            mapDetailsElement.style.display = 'none';
        }
        
        // Centrar el mapa en pantalla y mostrarlo
        centerWorldMapOnScreen();
        container.style.display = 'flex';
        button.textContent = 'Ocultar Mapa del Mundo';
        
        // Crear el botón de cierre si no existe o actualizarlo si ya existe
        let closeButton = document.getElementById('closeWorldMapBtn');
        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.id = 'closeWorldMapBtn';
            closeButton.className = 'world-map-close-btn';
            closeButton.textContent = '✕';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '5px';
            closeButton.style.right = '5px';
            closeButton.style.background = 'rgba(200, 0, 0, 0.7)';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '50%';
            closeButton.style.width = '24px';
            closeButton.style.height = '24px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.fontSize = '14px';
            closeButton.style.fontWeight = 'bold';
            closeButton.style.display = 'flex';
            closeButton.style.justifyContent = 'center';
            closeButton.style.alignItems = 'center';
            closeButton.style.zIndex = '1000';
            closeButton.addEventListener('click', closeWorldMap);
            container.appendChild(closeButton);
        } else {
            closeButton.style.display = 'flex';
        }
        
        renderWorldMap();
    } else {
        closeWorldMap();
    }
}

/**
 * Close the world map
 */
function closeWorldMap() {
    const container = document.getElementById('worldMapContainer');
    const button = document.getElementById('toggleWorldMap');
    const mapDetailsElement = document.getElementById('worldMapDetails');
    
    if (!container || !button) return; // Safety check
    
    worldMapVisible = false;
    container.style.display = 'none';
    button.textContent = 'Mostrar Mapa del Mundo';
    
    // Restaurar visibilidad de elementos originales
    if (mapDetailsElement) {
        mapDetailsElement.style.display = 'block';
        mapDetailsElement.innerHTML = '';
    }
    
    // Ocultar el botón de cierre
    const closeButton = document.getElementById('closeWorldMapBtn');
    if (closeButton) {
        closeButton.style.display = 'none';
    }
    
    // Limpiar el canvas
    if (worldMapCanvas && worldMapCtx) {
        worldMapCtx.clearRect(0, 0, worldMapCanvas.width, worldMapCanvas.height);
    }
}

/**
 * Center the world map on screen
 */
function centerWorldMapOnScreen() {
    const container = document.getElementById('worldMapContainer');
    if (!container) return;
    
    // Limpiar cualquier contenido HTML existente, excepto el canvas
    const canvas = worldMapCanvas;
    container.innerHTML = '';
    if (canvas) {
        container.appendChild(canvas);
    }
    
    // Establecer estilos para posicionar el mapa en el centro de la pantalla
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.maxWidth = '80%';
    container.style.maxHeight = '80%';
    container.style.width = 'auto';
    container.style.height = 'auto';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    container.style.border = '2px solid #ffd700';
    container.style.borderRadius = '8px';
    container.style.padding = '20px';
    container.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
    container.style.zIndex = '1000';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
}

/**
 * Render the world map
 */
export function renderWorldMap() {
    // Initialize canvas if not already done
    initWorldMapCanvas();

    if (!worldMapVisible || !worldMapCanvas || !worldMapCtx) return;

    const canvas = worldMapCanvas;
    const ctx = worldMapCtx;

    // Aumentar significativamente el tamaño del canvas para mejor visibilidad
    canvas.width = 1000;
    canvas.height = 900;

    // Clear canvas completely before drawing anything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#334155');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar zonas de fondo para separar visualmente las áreas
    drawZoneBackgrounds(ctx);

    // Añadir título principal
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗺️ MAPA DEL MUNDO - CALIMA ONLINE', canvas.width / 2, 35);

    // Dibujar conexiones primero (detrás de los mapas)
    drawConnections(ctx);

    // Dibujar cada mapa como un rectángulo más grande y con colores por zona
    drawMapNodes(ctx);

    // Dibujar indicador de posición del jugador
    drawPlayerIndicator(ctx);

    // Dibujar leyenda mejorada
    drawLegend(ctx);

    // Área para mostrar información del mapa al hacer clic (más grande)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(20, canvas.height - 100, canvas.width - 40, 80);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, canvas.height - 100, canvas.width - 40, 80);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Haz clic en cualquier mapa para ver más información detallada', canvas.width / 2, canvas.height - 65);

    // Instrucción de cierre
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Haz clic en ✕ para cerrar el mapa', canvas.width / 2, canvas.height - 30);
}

/**
 * Dibuja los fondos de zona para separar visualmente las áreas
 */
function drawZoneBackgrounds(ctx) {
    const canvas = ctx.canvas;

    // Zona de ciudad (verde claro)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
    ctx.fillRect(150, 720, 150, 80);

    // Zona de campos (amarillo)
    ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
    ctx.fillRect(250, 720, 400, 80);

    // Zona de bosques exteriores (verde oscuro)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
    ctx.fillRect(300, 620, 300, 80);

    // Zona de bosque oscuro (morado oscuro)
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.fillRect(300, 320, 200, 280);

    // Zona de montañas (gris) - ahora mucho más separada
    ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.fillRect(300, 40, 120, 240);

    // Zona de mazmorras (rojo)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(600, 90, 120, 400);

    // Etiquetas de zona
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';

    ctx.fillText('🏘️ Ciudad Inicial', 160, 710);
    ctx.fillText('🏞️ Campos', 260, 710);
    ctx.fillText('🌲 Bosques', 310, 610);
    ctx.fillText('🌑 Bosque Oscuro', 310, 310);
    ctx.fillText('⛰️ Montañas', 310, 30);
    ctx.fillText('🏔️ Mazmorras', 610, 80);
}

/**
 * Dibuja las conexiones entre mapas
 */
function drawConnections(ctx) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 2;

    for (const connection of WORLD_CONNECTIONS) {
        const map1 = MAP_DEFINITIONS[connection[0]];
        const map2 = MAP_DEFINITIONS[connection[1]];

        if (map1 && map2) {
            ctx.beginPath();
            ctx.moveTo(map1.worldX, map1.worldY);
            ctx.lineTo(map2.worldX, map2.worldY);
            ctx.stroke();
        }
    }

    ctx.setLineDash([]); // Reset line dash
    ctx.shadowBlur = 0;
}

/**
 * Dibuja los nodos de mapa con colores diferenciados por zona
 */
function drawMapNodes(ctx) {
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        const isCurrentMap = mapKey === gameState.currentMap;
        const canAccess = isMapAccessible(mapKey);

        // Determinar colores según zona
        const colors = getZoneColors(mapDef.zone, isCurrentMap, canAccess);

        // Dibujar rectángulo más grande (80x60 en lugar de 50x40)
        const rectWidth = 80;
        const rectHeight = 60;

        // Sombra para profundidad
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = colors.fill;
        ctx.fillRect(mapDef.worldX - rectWidth/2, mapDef.worldY - rectHeight/2, rectWidth, rectHeight);

        // Borde
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = isCurrentMap ? 4 : 3;
        ctx.strokeRect(mapDef.worldX - rectWidth/2, mapDef.worldY - rectHeight/2, rectWidth, rectHeight);

        ctx.shadowBlur = 0;

        // Dibujar nombre del mapa con mejor legibilidad
        ctx.fillStyle = '#ffffff';
        ctx.font = mapDef.isDungeon ? 'bold 11px sans-serif' : 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;

        // Extraer nombre sin emoji
        const nameWithoutEmoji = mapDef.name.split(' ').slice(1).join(' ');

        // Mostrar nombre en múltiples líneas si es necesario
        const words = nameWithoutEmoji.split(' ');
        if (words.length > 2) {
            // Tres líneas para nombres largos
            const line1 = words.slice(0, 2).join(' ');
            const line2 = words.slice(2).join(' ');
            ctx.fillText(line1, mapDef.worldX, mapDef.worldY - 8);
            ctx.fillText(line2, mapDef.worldX, mapDef.worldY + 6);
        } else if (words.length > 1) {
            // Dos líneas
            ctx.fillText(words[0], mapDef.worldX, mapDef.worldY - 5);
            ctx.fillText(words.slice(1).join(' '), mapDef.worldX, mapDef.worldY + 10);
        } else {
            // Una línea
            ctx.fillText(nameWithoutEmoji, mapDef.worldX, mapDef.worldY + 4);
        }

        ctx.shadowBlur = 0;
    }
}

/**
 * Dibuja el indicador de posición del jugador
 */
function drawPlayerIndicator(ctx) {
    const currentMapDef = MAP_DEFINITIONS[gameState.currentMap];
    if (currentMapDef) {
        // Círculo grande y visible
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(currentMapDef.worldX, currentMapDef.worldY - 35, 12, 0, Math.PI * 2);
        ctx.fill();

        // Borde blanco brillante
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icono de estrella
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText('★', currentMapDef.worldX - 5, currentMapDef.worldY - 30);

        // Texto "TÚ ESTÁS AQUÍ"
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('¡TÚ ESTÁS AQUÍ!', currentMapDef.worldX, currentMapDef.worldY - 50);
    }
}

/**
 * Dibuja la leyenda mejorada
 */
function drawLegend(ctx) {
    const canvas = ctx.canvas;
    const legendX = canvas.width - 220;
    const legendY = 70;

    // Fondo de la leyenda
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(legendX - 10, legendY - 20, 210, 140);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(legendX - 10, legendY - 20, 210, 140);

    // Título de leyenda
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LEYENDA', legendX, legendY);

    // Elementos de la leyenda
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';

    const legendItems = [
        { color: '#4ade80', text: 'Tu ubicación actual' },
        { color: '#60a5fa', text: 'Áreas accesibles' },
        { color: '#8b5cf6', text: 'Áreas por explorar' },
        { color: '#ef4444', text: 'Marcador de jugador' },
        { color: '#fbbf24', text: 'Conexiones entre mapas' }
    ];

    legendItems.forEach((item, index) => {
        const y = legendY + 25 + (index * 18);

        // Color de ejemplo
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, y - 8, 15, 12);

        // Texto
        ctx.fillStyle = '#ffffff';
        ctx.fillText(item.text, legendX + 25, y);
    });

    // Instrucción adicional
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Haz clic en un mapa', legendX, legendY + 120);
    ctx.fillText('para ver detalles', legendX, legendY + 135);
}

/**
 * Determina si un mapa es accesible
 */
function isMapAccessible(mapKey) {
    // Lógica simple: todos los mapas son accesibles por ahora
    return true;
}

/**
 * Obtiene colores según la zona del mapa
 */
function getZoneColors(zone, isCurrent, canAccess) {
    const baseColors = {
        city: { fill: '#22c55e', border: '#16a34a' },
        fields: { fill: '#eab308', border: '#ca8a04' },
        forest: { fill: '#16a34a', border: '#15803d' },
        dark_forest: { fill: '#7c3aed', border: '#6d28d9' },
        mountain: { fill: '#64748b', border: '#475569' },
        dungeon: { fill: '#dc2626', border: '#b91c1c' }
    };

    const colors = baseColors[zone] || { fill: '#8b5cf6', border: '#7c3aed' };

    if (isCurrent) {
        return { fill: '#4ade80', border: '#22c55e' };
    } else if (!canAccess) {
        return { fill: '#64748b', border: '#475569' };
    }

    return colors;
}

/**
 * World map click handler
 */
function handleWorldMapClick(event) {
    // Initialize canvas if not already done
    initWorldMapCanvas();
    
    if (!worldMapVisible || !worldMapCanvas || !worldMapCtx) return;

    const rect = worldMapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Clear previous info area
    const canvas = worldMapCanvas;
    const ctx = worldMapCtx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, canvas.height - 80, canvas.width - 20, 70);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, canvas.height - 80, canvas.width - 20, 70);

    // Check if clicked on a map (rectángulos de 80x60 píxeles)
    let clickedOnMap = false;
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        const rectWidth = 80;
        const rectHeight = 60;
        if (x >= mapDef.worldX - rectWidth/2 && x <= mapDef.worldX + rectWidth/2 &&
            y >= mapDef.worldY - rectHeight/2 && y <= mapDef.worldY + rectHeight/2) {

            clickedOnMap = true;
            
            // Display map info directly on canvas
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(mapDef.name, canvas.width / 2, canvas.height - 60);
            
            ctx.font = '11px sans-serif';
            ctx.fillText(mapDef.description, canvas.width / 2, canvas.height - 40);
            
            const statusText = mapKey === gameState.currentMap ? '✅ Estás aquí' : '🔍 Disponible para explorar';
            ctx.fillText(statusText, canvas.width / 2, canvas.height - 20);
            
            // Update traditional HTML details div too if it exists
            const detailsDiv = document.getElementById('worldMapDetails');
            if (detailsDiv) {
                detailsDiv.innerHTML = `
                    <strong>${mapDef.name}</strong><br>
                    ${mapDef.description}<br>
                    <em>Estado: ${mapKey === gameState.currentMap ? 'Estás aquí' : 'Disponible'}</em>
                `;

                // If it's not the current map, offer to travel
                if (mapKey !== gameState.currentMap) {
                    // For now, just show info. In a full implementation, we could check if player can travel
                    detailsDiv.innerHTML += '<br><em>Viaja usando portales en el mapa</em>';
                }
            }

            break;
        }
    }
    
    // If didn't click on any map, show default message
    if (!clickedOnMap) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Haz clic en un mapa para ver más información', canvas.width / 2, canvas.height - 45);
    }
}

/**
 * World map hover handler
 */
function handleWorldMapHover(event) {
    // Initialize canvas if not already done
    initWorldMapCanvas();
    
    if (!worldMapVisible || !worldMapCanvas) return;

    const rect = worldMapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let hoveredMap = null;

    // Check if hovering over a map (rectángulos de 80x60 píxeles)
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        const rectWidth = 80;
        const rectHeight = 60;
        if (x >= mapDef.worldX - rectWidth/2 && x <= mapDef.worldX + rectWidth/2 &&
            y >= mapDef.worldY - rectHeight/2 && y <= mapDef.worldY + rectHeight/2) {
            hoveredMap = mapDef;
            break;
        }
    }

    worldMapCanvas.style.cursor = hoveredMap ? 'pointer' : 'default';
}

/**
 * Initialize world map event listeners
 */
export function initWorldMap() {
    // Initialize canvas references
    initWorldMapCanvas();
    
    if (!worldMapCanvas) {
        // The canvas might not be available yet at module load time
        // Try again when the DOM is fully loaded
        window.addEventListener('DOMContentLoaded', () => {
            initWorldMapCanvas();
            if (worldMapCanvas) {
                worldMapCanvas.addEventListener('click', handleWorldMapClick);
                worldMapCanvas.addEventListener('mousemove', handleWorldMapHover);
            }
        });
        return;
    }
    
    // If we already have the canvas, attach listeners now
    worldMapCanvas.addEventListener('click', handleWorldMapClick);
    worldMapCanvas.addEventListener('mousemove', handleWorldMapHover);
}

/**
 * Check if world map is visible
 * @returns {boolean} True if world map is visible
 */
export function isWorldMapVisible() {
    return worldMapVisible;
}
