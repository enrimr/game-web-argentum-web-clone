/**
 * Minimap.js
 * Sistema de minimapa
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { TILES } from '../world/TileTypes.js';
import { MAP_DEFINITIONS } from '../world/MapDefinitions.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

// Minimap canvas setup
const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas.getContext('2d');
let minimapVisible = false;

/**
 * Toggle minimap visibility
 */
export function toggleMinimap() {
    const container = document.getElementById('minimapContainer');
    const button = document.getElementById('toggleMinimap');

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
    if (!minimapVisible) return;

    const scaleX = minimapCanvas.width / MAP_WIDTH;
    const scaleY = minimapCanvas.height / MAP_HEIGHT;

    // Clear minimap
    minimapCtx.fillStyle = '#000';
    minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

    // Draw map tiles
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const tile = gameState.map[y][x];
            let color = '#2d5016'; // Default grass

            if (tile === TILES.WALL) color = '#4b5563';
            else if (tile === TILES.WATER) color = '#1e40af';
            else if (tile === TILES.STONE) color = '#6b7280';
            else if (tile === TILES.TREE) color = '#228b22';
            else if (tile === TILES.BUILDING) color = '#92400e';
            else if (tile === TILES.FLOOR) color = '#374151';
            else if (tile === TILES.DUNGEON_WALL) color = '#1f2937';
            else if (tile === TILES.PATH) color = '#a16207';

            minimapCtx.fillStyle = color;
            minimapCtx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
        }
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
