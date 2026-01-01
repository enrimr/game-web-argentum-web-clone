// Tile types
export const TILES = {
    GRASS: 0,
    WATER: 1,
    STONE: 2,
    TREE: 3,
    WALL: 4,
    BUILDING: 5,
    FLOOR: 6,
    DUNGEON_WALL: 7,
    PATH: 8,
    // Interior building tiles
    DOOR: 9,           // Walkable door - triggers interior mode
    WALL_INTERIOR: 10, // Interior wall - not walkable
    FLOOR_INTERIOR: 11,// Interior floor - walkable
    ROOF: 12,          // Roof tile - visible only from outside
    WINDOW: 13,        // Window - not walkable, decorative
    DOOR_SHADOW: 14    // Shadow/entrance marker in front of door - walkable
};

/**
 * Check if a tile is walkable
 * @param {number} tile - Tile type
 * @returns {boolean} True if walkable
 */
export function isTileWalkable(tile) {
    return tile === TILES.GRASS || 
           tile === TILES.FLOOR || 
           tile === TILES.PATH || 
           tile === TILES.DOOR ||
           tile === TILES.DOOR_SHADOW ||
           tile === TILES.FLOOR_INTERIOR ||
           tile === TILES.WINDOW;      // Hacemos que las ventanas sean caminables
}

/**
 * Check if a tile is a roof (should be hidden when player is inside)
 * @param {number} tile - Tile type
 * @returns {boolean} True if it's a roof tile
 */
export function isRoof(tile) {
    return tile === TILES.ROOF;
}

/**
 * Check if a tile is a door (triggers interior detection)
 * @param {number} tile - Tile type
 * @returns {boolean} True if it's a door
 */
export function isDoor(tile) {
    return tile === TILES.DOOR;
}
