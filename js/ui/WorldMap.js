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
    
    if (!container || !button) return; // Safety check
    
    worldMapVisible = !worldMapVisible;

    if (worldMapVisible) {
        container.style.display = 'block';
        button.textContent = 'Ocultar Mapa del Mundo';
        renderWorldMap();
    } else {
        container.style.display = 'none';
        button.textContent = 'Mostrar Mapa del Mundo';
        const detailsDiv = document.getElementById('worldMapDetails');
        if (detailsDiv) detailsDiv.innerHTML = '';
    }
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

    // Clear canvas
    ctx.fillStyle = '#1e3c72';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections first (behind maps)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
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
        const canAccess = true; // For now, all maps are accessible

        // Draw map rectangle
        ctx.fillStyle = isCurrentMap ? '#4ade80' : canAccess ? '#60a5fa' : '#6b7280';
        ctx.fillRect(mapDef.worldX - 20, mapDef.worldY - 15, 40, 30);

        // Draw border
        ctx.strokeStyle = isCurrentMap ? '#22c55e' : canAccess ? '#3b82f6' : '#4b5563';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapDef.worldX - 20, mapDef.worldY - 15, 40, 30);

        // Draw map name
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(mapDef.name.split(' ')[0], mapDef.worldX, mapDef.worldY + 2);
    }

    // Draw player position indicator
    const currentMapDef = MAP_DEFINITIONS[gameState.currentMap];
    if (currentMapDef) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(currentMapDef.worldX, currentMapDef.worldY - 8, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText('★', currentMapDef.worldX - 3, currentMapDef.worldY - 5);
    }
}

/**
 * World map click handler
 */
function handleWorldMapClick(event) {
    // Initialize canvas if not already done
    initWorldMapCanvas();
    
    if (!worldMapVisible || !worldMapCanvas) return;

    const rect = worldMapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicked on a map
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        if (x >= mapDef.worldX - 20 && x <= mapDef.worldX + 20 &&
            y >= mapDef.worldY - 15 && y <= mapDef.worldY + 15) {

            const detailsDiv = document.getElementById('worldMapDetails');
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

            break;
        }
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
