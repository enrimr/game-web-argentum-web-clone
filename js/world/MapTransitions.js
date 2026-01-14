/**
 * MapTransitions.js
 * Sistema de transiciones automáticas entre mapas contiguos
 * Permite navegación fluida cuando el jugador alcanza los bordes del mapa
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { changeMap } from '../core/Game.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Map world positions and adjacency
 * Define qué mapas están conectados y en qué posiciones del mundo
 */
const WORLD_MAP_LAYOUT = {
    'newbie_city': {
        worldPos: { x: 100, y: 100 },
        adjacentMaps: {
            north: null,
            south: null,
            east: 'training_fields',
            west: null
        }
    },
    'training_fields': {
        worldPos: { x: 110, y: 100 },
        adjacentMaps: {
            north: 'forest_outskirts',
            south: null,
            east: null,
            west: 'newbie_city'
        }
    },
    'forest_outskirts': {
        worldPos: { x: 110, y: 90 },
        adjacentMaps: {
            north: 'dark_forest',
            south: 'training_fields',
            east: null,
            west: null
        }
    },
    'dark_forest': {
        worldPos: { x: 110, y: 80 },
        adjacentMaps: {
            north: null,
            south: 'forest_outskirts',
            east: 'mountain_pass',
            west: null
        }
    },
    'mountain_pass': {
        worldPos: { x: 120, y: 80 },
        adjacentMaps: {
            north: null,
            south: null,
            east: null,
            west: 'dark_forest'
        }
    },
    'coastal_town': {
        worldPos: { x: 90, y: 100 },
        adjacentMaps: {
            north: null,
            south: 'beach_resort',
            east: 'newbie_city',
            west: null
        }
    },
    'beach_resort': {
        worldPos: { x: 90, y: 110 },
        adjacentMaps: {
            north: 'coastal_town',
            south: 'desert_dunes',
            east: null,
            west: null
        }
    },
    'desert_dunes': {
        worldPos: { x: 90, y: 120 },
        adjacentMaps: {
            north: 'beach_resort',
            south: null,
            east: null,
            west: null
        }
    },
    'capital_city': {
        worldPos: { x: 100, y: 90 },
        adjacentMaps: {
            north: null,
            south: 'newbie_city',
            east: null,
            west: null
        }
    },
    'ancient_ruins': {
        worldPos: { x: 120, y: 90 },
        adjacentMaps: {
            north: null,
            south: 'mountain_pass',
            east: null,
            west: null
        }
    }
};

/**
 * Check if player is at map edge and should transition
 * @returns {Object|null} Transition info or null if no transition needed
 */
export function checkMapEdgeTransition() {
    const player = gameState.player;
    const currentMapLayout = WORLD_MAP_LAYOUT[gameState.currentMap];

    if (!currentMapLayout) {
        return null; // Current map doesn't have world position defined
    }

    const EDGE_THRESHOLD = 0; // Distance from edge to trigger transition

    // Check North edge (y = 0)
    if (player.y <= EDGE_THRESHOLD && currentMapLayout.adjacentMaps.north) {
        return {
            targetMap: currentMapLayout.adjacentMaps.north,
            targetX: player.x,
            targetY: MAP_HEIGHT - 2, // Appear at bottom of new map
            direction: 'north'
        };
    }

    // Check South edge (y = MAP_HEIGHT - 1)
    if (player.y >= MAP_HEIGHT - 1 - EDGE_THRESHOLD && currentMapLayout.adjacentMaps.south) {
        return {
            targetMap: currentMapLayout.adjacentMaps.south,
            targetX: player.x,
            targetY: 1, // Appear at top of new map
            direction: 'south'
        };
    }

    // Check East edge (x = MAP_WIDTH - 1)
    if (player.x >= MAP_WIDTH - 1 - EDGE_THRESHOLD && currentMapLayout.adjacentMaps.east) {
        return {
            targetMap: currentMapLayout.adjacentMaps.east,
            targetX: 1, // Appear at left of new map
            targetY: player.y,
            direction: 'east'
        };
    }

    // Check West edge (x = 0)
    if (player.x <= EDGE_THRESHOLD && currentMapLayout.adjacentMaps.west) {
        return {
            targetMap: currentMapLayout.adjacentMaps.west,
            targetX: MAP_WIDTH - 2, // Appear at right of new map
            targetY: player.y,
            direction: 'west'
        };
    }

    return null; // No transition needed
}

/**
 * Get adjacent map in a direction
 * @param {string} mapName - Current map name
 * @param {string} direction - Direction (north, south, east, west)
 * @returns {string|null} Adjacent map name or null
 */
export function getAdjacentMap(mapName, direction) {
    const mapLayout = WORLD_MAP_LAYOUT[mapName];
    if (!mapLayout) return null;

    return mapLayout.adjacentMaps[direction] || null;
}

/**
 * Check if a map has world position defined (is part of continuous world)
 * @param {string} mapName - Map name to check
 * @returns {boolean} True if map is part of continuous world
 */
export function isMapInContinuousWorld(mapName) {
    return !!WORLD_MAP_LAYOUT[mapName];
}

/**
 * Get world position of a map
 * @param {string} mapName - Map name
 * @returns {Object|null} World position {x, y} or null
 */
export function getMapWorldPosition(mapName) {
    const mapLayout = WORLD_MAP_LAYOUT[mapName];
    return mapLayout ? mapLayout.worldPos : null;
}

/**
 * Update world map layout (for dynamic map additions)
 * @param {string} mapName - Map name
 * @param {Object} layout - Layout configuration
 */
export function updateWorldMapLayout(mapName, layout) {
    WORLD_MAP_LAYOUT[mapName] = layout;
}

/**
 * Get all maps in the continuous world
 * @returns {Array} Array of map names
 */
export function getContinuousWorldMaps() {
    return Object.keys(WORLD_MAP_LAYOUT);
}

/**
 * Check if two maps are adjacent
 * @param {string} map1 - First map name
 * @param {string} map2 - Second map name
 * @returns {boolean} True if maps are adjacent
 */
export function areMapsAdjacent(map1, map2) {
    const layout1 = WORLD_MAP_LAYOUT[map1];
    if (!layout1) return false;

    const adjacentMaps = Object.values(layout1.adjacentMaps);
    return adjacentMaps.includes(map2);
}

/**
 * Get direction from map1 to map2
 * @param {string} map1 - Source map name
 * @param {string} map2 - Target map name
 * @returns {string|null} Direction or null if not adjacent
 */
export function getDirectionBetweenMaps(map1, map2) {
    const layout = WORLD_MAP_LAYOUT[map1];
    if (!layout) return null;

    for (const [direction, adjacentMap] of Object.entries(layout.adjacentMaps)) {
        if (adjacentMap === map2) {
            return direction;
        }
    }

    return null;
}

export { WORLD_MAP_LAYOUT };
