/**
 * Minimap.js
 * Sistema de minimapa
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { TILES } from '../world/TileTypes.js';
import { MAP_DEFINITIONS } from '../world/MapDefinitions.js';

// Ensure all DOM elements exist before accessing

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

// Minimap variables
let minimapCanvas = null;
let minimapCtx = null;
let minimapVisible = false;

// Initialize canvas references when needed
function initMinimapCanvas() {
    if (!minimapCanvas) {
        minimapCanvas = document.getElementById('minimapCanvas');
        if (minimapCanvas) {
            minimapCtx = minimapCanvas.getContext('2d');
        }
    }
}

/**
 * Toggle minimap visibility
 */
export function toggleMinimap() {
    // Initialize canvas if not already done
    initMinimapCanvas();
    
    const container = document.getElementById('minimapContainer');
    const button = document.getElementById('toggleMinimap');
    
    if (!container || !button) return; // Safety check
    
    minimapVisible = !minimapVisible;

    if (minimapVisible) {
        container.style.display = 'block';
        button.textContent = 'Ocultar Minimap';
        renderMinimap();
    } else {
        container.style.display = 'none';
        button.textContent = 'Mostrar Minimap';
    }
}

/**
 * Render the minimap
 */
export function renderMinimap() {
    // Initialize canvas if not already done
    initMinimapCanvas();
    
    if (!minimapVisible || !minimapCanvas || !minimapCtx) return;

    const scaleX = minimapCanvas.width / MAP_WIDTH;
    const scaleY = minimapCanvas.height / MAP_HEIGHT;

    // Clear minimap
    minimapCtx.fillStyle = '#000';
    minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

    // Draw map tiles with validation
    if (gameState.map && Array.isArray(gameState.map) && gameState.map.length > 0) {
        for (let y = 0; y < MAP_HEIGHT && y < gameState.map.length; y++) {
            if (!gameState.map[y] || !Array.isArray(gameState.map[y])) {
                console.warn(`Minimap: fila ${y} del mapa es inválida`);
                continue;
            }
            
            for (let x = 0; x < MAP_WIDTH && x < gameState.map[y].length; x++) {
                // Validación adicional para prevenir acceso a elementos undefined
                const tile = (gameState.map[y] && gameState.map[y][x] !== undefined) ? gameState.map[y][x] : 0;
                let color = '#2d5016'; // Default grass

                if (tile === TILES.WALL) color = '#4b5563';
                else if (tile === TILES.WATER) color = '#1e40af';
                else if (tile === TILES.STONE) color = '#6b7280';
                else if (tile === TILES.TREE) color = '#228b22';
                else if (tile === TILES.BUILDING) color = '#92400e';
                else if (tile === TILES.FLOOR) color = '#374151';
                else if (tile === TILES.DUNGEON_WALL) color = '#1f2937';
                else if (tile === TILES.PATH) color = '#a16207';
                // Añadir soporte para nuevos tipos de tiles
                else if (tile === TILES.DOOR) color = '#a16207'; // Color similar al path para las puertas
                else if (tile === TILES.WALL_INTERIOR) color = '#92400e'; // Color similar a BUILDING
                else if (tile === TILES.FLOOR_INTERIOR) color = '#a16207'; // Color similar al path para suelos interiores
                else if (tile === TILES.ROOF) color = '#dc2626'; // Rojo para techos
                else if (tile === TILES.WINDOW) color = '#60a5fa'; // Azul claro para ventanas
                else if (tile === TILES.DOOR_SHADOW) color = '#2d5016'; // Verde oscuro como el grass para sombras

                minimapCtx.fillStyle = color;
                minimapCtx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
            }
        }
    } else {
        console.error('Minimap: gameState.map no es válido', {
            exists: !!gameState.map,
            isArray: Array.isArray(gameState.map),
            length: gameState.map?.length
        });
    }

    // Draw portals
    for (const obj of gameState.objects) {
        if (obj.type === 'portal') {
            let color = '#8b5cf6'; // Default purple for city
            if (obj.targetMap === 'dungeon') color = '#dc2626'; // Red for dungeon

            minimapCtx.fillStyle = color;
            minimapCtx.fillRect(obj.x * scaleX, obj.y * scaleY, scaleX * 2, scaleY * 2);
        }
    }

    // Draw NPCs (yellow/gold color)
    for (const npc of gameState.npcs) {
        minimapCtx.fillStyle = '#fbbf24'; // Dorado para NPCs
        minimapCtx.fillRect(
            npc.x * scaleX - 1,
            npc.y * scaleY - 1,
            scaleX * 2,
            scaleY * 2
        );
    }

    // Draw player position
    minimapCtx.fillStyle = '#3b82f6';
    minimapCtx.fillRect(
        gameState.player.x * scaleX - 1,
        gameState.player.y * scaleY - 1,
        scaleX * 3,
        scaleY * 3
    );
}

/**
 * Update minimap when needed
 */
export function updateMinimap() {
    if (minimapVisible) {
        renderMinimap();
    }
}

/**
 * Check if minimap is visible
 * @returns {boolean} True if minimap is visible
 */
export function isMinimapVisible() {
    return minimapVisible;
}
