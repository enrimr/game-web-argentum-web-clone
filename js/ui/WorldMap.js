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
    
    // Ajustar el tamaño del canvas para que sea más grande
    canvas.width = 600;
    canvas.height = 450;

    // Clear canvas completely before drawing anything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f2027');
    gradient.addColorStop(0.5, '#203a43');
    gradient.addColorStop(1, '#2c5364');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Añadir título
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAPA DEL MUNDO - ARGENTUM ONLINE', canvas.width / 2, 30);
    
    // Dibujar leyenda (movida a la parte superior derecha para evitar solapamiento)
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    const legendX = canvas.width - 200;
    ctx.fillText('🟢 Ubicación actual', legendX, 60);
    ctx.fillText('🔵 Áreas accesibles', legendX, 80);
    ctx.fillText('🟤 Áreas por descubrir', legendX, 100);
    ctx.fillText('⚔️ Haz clic para ver detalles', legendX, 120);
    
    // Añadir borde al mapa
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    // Área para mostrar información del mapa al hacer clic
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, canvas.height - 80, canvas.width - 20, 70);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, canvas.height - 80, canvas.width - 20, 70);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Haz clic en un mapa para ver más información', canvas.width / 2, canvas.height - 45);

    // Draw connections first (behind maps)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

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

    // Draw each map as a rectangle
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        const isCurrentMap = mapKey === gameState.currentMap;
        // Para la demo, definimos que los mapas reales (newbie_city, newbie_field, dark_forest) 
        // son accesibles, y los demás no
        const canAccess = mapKey === 'newbie_city' || mapKey === 'newbie_field' || mapKey === 'dark_forest';

        // Draw map rectangle (más grande)
        ctx.fillStyle = isCurrentMap ? '#4ade80' : canAccess ? '#60a5fa' : '#8b5cf6';
        ctx.fillRect(mapDef.worldX - 25, mapDef.worldY - 20, 50, 40);

        // Draw border
        ctx.strokeStyle = isCurrentMap ? '#22c55e' : canAccess ? '#3b82f6' : '#7c3aed';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapDef.worldX - 25, mapDef.worldY - 20, 50, 40);

        // Draw map name with shadow for better readability
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 3;
        
        // Extract the location name without the emoji prefix
        const nameWithoutEmoji = mapDef.name.split(' ').slice(1).join(' ');
        
        // Display name in multiple lines if needed
        const words = nameWithoutEmoji.split(' ');
        if (words.length > 1) {
            // First line
            ctx.fillText(words[0], mapDef.worldX, mapDef.worldY);
            // Second line
            const secondLine = words.slice(1).join(' ');
            ctx.fillText(secondLine, mapDef.worldX, mapDef.worldY + 12);
        } else {
            ctx.fillText(nameWithoutEmoji, mapDef.worldX, mapDef.worldY + 6);
        }
        
        ctx.shadowBlur = 0;
    }

    // Draw player position indicator
    const currentMapDef = MAP_DEFINITIONS[gameState.currentMap];
    if (currentMapDef) {
        // Dibujar un marcador más visible
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(currentMapDef.worldX, currentMapDef.worldY - 25, 8, 0, Math.PI * 2);
        ctx.fill();

        // Añadir un borde blanco al marcador
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dibujar una estrella dentro del marcador
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.fillText('★', currentMapDef.worldX - 4, currentMapDef.worldY - 21);
    }
    
    // Añadir instrucción en la parte inferior
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Haz clic en el botón X para cerrar', canvas.width / 2, canvas.height - 20);
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

    // Check if clicked on a map
    let clickedOnMap = false;
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        if (x >= mapDef.worldX - 25 && x <= mapDef.worldX + 25 &&
            y >= mapDef.worldY - 20 && y <= mapDef.worldY + 20) {
            
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

    // Check if hovering over a map
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        if (x >= mapDef.worldX - 20 && x <= mapDef.worldX + 20 &&
            y >= mapDef.worldY - 15 && y <= mapDef.worldY + 15) {
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
