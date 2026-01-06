/**
 * BasicMapGenerator.js
 * Generadores para mapas básicos como campos, ciudades, bosques, etc.
 */

import { CONFIG } from '../../config.js';
import { TILES } from '../TileTypes.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Generate field map (outdoor area) - CORRECT ORDER: terrain -> obstacles
 * @returns {Array} 2D array representing the field map
 */
export function generateFieldMap() {
    const map = [];

    // 1. Create base terrain (borders and ground)
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Base terrain is walkable grass
                row.push(TILES.GRASS);
            }
        }
        map.push(row);
    }

    // 2. Add obstacles (trees, stones) - these block movement AFTER terrain is set
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            if (Math.random() < 0.05) {
                map[y][x] = TILES.TREE;
            } else if (Math.random() < 0.02) {
                map[y][x] = TILES.STONE;
            }
            // Leave some areas as paths for better navigation
        }
    }

    return map;
}

/**
 * Generate city map (buildings and streets)
 * @returns {Array} 2D array representing the city map
 */
export function generateCityMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // City streets every 8 columns and 6 rows
                if (x % 8 === 0 || y % 6 === 0) {
                    row.push(TILES.PATH); // Streets
                } else if (Math.random() < 0.4) {
                    row.push(TILES.BUILDING); // Buildings
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }
    return map;
}

/**
 * Generate forest map (dense woods)
 * @returns {Array} 2D array representing the forest map
 */
export function generateForestMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Dense forest with many trees
                if (Math.random() < 0.3) {
                    row.push(TILES.TREE);
                } else if (Math.random() < 0.05) {
                    row.push(TILES.STONE);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }

    // Create a path through the forest
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x >= 0 && x < MAP_WIDTH && 20 >= 0 && 20 < MAP_HEIGHT) {
            map[20][x] = TILES.PATH;
        }
    }

    return map;
}

/**
 * Generate castle map (castle interior)
 * @returns {Array} 2D array representing the castle map
 */
export function generateCastleMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else if (x <= 2 || x >= MAP_WIDTH - 3 || y <= 2 || y >= MAP_HEIGHT - 3) {
                // Castle walls
                row.push(TILES.WALL);
            } else {
                row.push(TILES.FLOOR);
            }
        }
        map.push(row);
    }

    // Create castle interior rooms
    // Throne room area
    for (let y = 15; y < 25; y++) {
        for (let x = MAP_WIDTH - 15; x < MAP_WIDTH - 5; x++) {
            if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
                map[y][x] = TILES.FLOOR;
            }
        }
    }

    return map;
}

/**
 * Generate market map (open market area)
 * @returns {Array} 2D array representing the market map
 */
export function generateMarketMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Market stalls (buildings) in a grid
                if ((x % 6 === 3 || y % 4 === 2) && Math.random() < 0.6) {
                    row.push(TILES.BUILDING);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }
    return map;
}

/**
 * Generate ruins map (ancient ruins)
 * @returns {Array} 2D array representing the ruins map
 */
export function generateRuinsMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Ruins with scattered walls and floors
                const rand = Math.random();
                if (rand < 0.1) {
                    row.push(TILES.WALL); // Ruined walls
                } else if (rand < 0.3) {
                    row.push(TILES.FLOOR); // Ruined floors
                } else if (rand < 0.35) {
                    row.push(TILES.STONE);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }

    // Create some paths through the ruins
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x >= 0 && x < MAP_WIDTH && 15 >= 0 && 15 < MAP_HEIGHT) {
            map[15][x] = TILES.PATH;
        }
    }

    return map;
}

/**
 * Generate throne room map (king's throne room)
 * @returns {Array} 2D array representing the throne room map
 */
export function generateThroneRoomMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else if (x <= 3 || x >= MAP_WIDTH - 4 || y <= 3 || y >= MAP_HEIGHT - 4) {
                // Throne room walls
                row.push(TILES.WALL);
            } else {
                row.push(TILES.FLOOR);
            }
        }
        map.push(row);
    }

    // Throne area in the center
    const throneX = Math.floor(MAP_WIDTH / 2);
    const throneY = Math.floor(MAP_HEIGHT / 2);
    if (throneX >= 0 && throneX < MAP_WIDTH && throneY >= 0 && throneY < MAP_HEIGHT) {
        map[throneY][throneX] = TILES.FLOOR; // Throne position
    }

    return map;
}
