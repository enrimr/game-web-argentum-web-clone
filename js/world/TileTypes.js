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
    DOOR_OPEN_LEFT: 9,    // Puerta abierta hacia la izquierda - walkable
    WALL_INTERIOR: 10,    // Interior wall - not walkable
    FLOOR_INTERIOR: 11,   // Interior floor - walkable
    ROOF: 12,             // Roof tile - visible only from outside
    WINDOW: 13,           // Window - not walkable, decorative
    DOOR_SHADOW: 14,      // Shadow/entrance marker in front of door - walkable
    FACADE: 15,           // Building facade - not walkable, visual distinction for building exterior
    DOOR_CLOSED_LEFT: 16, // Puerta cerrada con pomo a la derecha (abre hacia la izquierda) - not walkable
    DOOR_OPEN_RIGHT: 17,  // Puerta abierta hacia la derecha - walkable
    DOOR_CLOSED_RIGHT: 18, // Puerta cerrada con pomo a la izquierda (abre hacia la derecha) - not walkable
    WINDOW_WALKABLE: 19   // Ventana junto a puerta - walkable
};

// Por compatibilidad con el código existente
export const DOOR = 9; // Alias para DOOR_OPEN_LEFT
export const DOOR_OPEN = 9; // Alias para DOOR_OPEN_LEFT
export const DOOR_CLOSED = 16; // Alias para DOOR_CLOSED_LEFT

/**
 * Check if a tile is walkable
 * @param {number} tile - Tile type
 * @returns {boolean} True if walkable
 */
export function isTileWalkable(tile) {
    return tile === TILES.GRASS || 
           tile === TILES.FLOOR || 
           tile === TILES.PATH || 
           tile === TILES.DOOR_OPEN_LEFT ||
           tile === TILES.DOOR_OPEN_RIGHT ||
           tile === TILES.DOOR_SHADOW ||
           tile === TILES.FLOOR_INTERIOR ||
           tile === TILES.WINDOW_WALKABLE;      // Solo ventanas junto a puertas son caminables
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
 * Check if a tile is a window above door (should be hidden when player is inside)
 * @param {number} tile - Tile type
 * @returns {boolean} True if it's a window above door
 */
export function isWindowAboveDoor(tile) {
    return tile === TILES.WINDOW_WALKABLE;
}

/**
 * Check if a tile is a door that can be passed through (is open)
 * @param {number} tile - Tile type
 * @returns {boolean} True if it's an open door
 */
export function isOpenDoor(tile) {
    return tile === TILES.DOOR_OPEN_LEFT || tile === TILES.DOOR_OPEN_RIGHT;
}

/**
 * Check if a tile is a closed door
 * @param {number} tile - Tile type
 * @returns {boolean} True if it's a closed door
 */
export function isClosedDoor(tile) {
    return tile === TILES.DOOR_CLOSED_LEFT || tile === TILES.DOOR_CLOSED_RIGHT;
}

/**
 * Check if a tile is a door (triggers interior detection)
 * @param {number} tile - Tile type
 * @returns {boolean} True if it's a door (open or closed)
 */
export function isDoor(tile) {
    return tile === TILES.DOOR_OPEN_LEFT || tile === TILES.DOOR_OPEN_RIGHT || 
           tile === TILES.DOOR_CLOSED_LEFT || tile === TILES.DOOR_CLOSED_RIGHT;
}

/**
 * Check if a tile is a door (either open or closed) that can be toggled
 * @param {number} tile - Tile type
 * @returns {boolean} True if it's a togglable door
 */
export function isToggleableDoor(tile) {
    return tile === TILES.DOOR_OPEN_LEFT || tile === TILES.DOOR_OPEN_RIGHT || 
           tile === TILES.DOOR_CLOSED_LEFT || tile === TILES.DOOR_CLOSED_RIGHT;
}

/**
 * Determina si una puerta abierta o cerrada se abre hacia la derecha
 * @param {number} tile - Tipo de tile
 * @returns {boolean} True si la puerta se abre hacia la derecha
 */
export function isDoorOpeningRight(tile) {
    return tile === TILES.DOOR_OPEN_RIGHT || tile === TILES.DOOR_CLOSED_RIGHT;
}

/**
 * Determina si una puerta abierta o cerrada se abre hacia la izquierda
 * @param {number} tile - Tipo de tile
 * @returns {boolean} True si la puerta se abre hacia la izquierda
 */
export function isDoorOpeningLeft(tile) {
    return tile === TILES.DOOR_OPEN_LEFT || tile === TILES.DOOR_CLOSED_LEFT;
}

/**
 * Determinar qué tipo de puerta abierta debe usarse basado en la posición
 * @param {number} x - Coordenada X de la puerta
 * @param {number} y - Coordenada Y de la puerta 
 * @param {Array} map - Mapa actual con tiles
 * @returns {number} Tipo de tile para puerta abierta
 */
export function getDoorOpenType(x, y, map) {
    // Si hay otra puerta a la izquierda o la derecha, es parte de una puerta doble
    const hasDoorLeft = x > 0 && isDoor(map[y][x-1]);
    const hasDoorRight = x < map[y].length - 1 && isDoor(map[y][x+1]);
    
    if (hasDoorLeft && hasDoorRight) {
        // Puerta en medio de dos puertas (caso poco común, abrimos hacia la izquierda)
        return TILES.DOOR_OPEN_LEFT;
    } else if (hasDoorLeft) {
        // Puerta con otra a su izquierda (es la derecha de un par)
        return TILES.DOOR_OPEN_RIGHT;
    } else if (hasDoorRight) {
        // Puerta con otra a su derecha (es la izquierda de un par)
        return TILES.DOOR_OPEN_LEFT;
    } else {
        // Puerta individual, siempre hacia la izquierda
        return TILES.DOOR_OPEN_LEFT;
    }
}

/**
 * Determinar qué tipo de puerta cerrada debe usarse basado en la posición
 * @param {number} x - Coordenada X de la puerta
 * @param {number} y - Coordenada Y de la puerta 
 * @param {Array} map - Mapa actual con tiles
 * @returns {number} Tipo de tile para puerta cerrada
 */
export function getDoorClosedType(x, y, map) {
    // Si hay otra puerta a la izquierda o la derecha, es parte de una puerta doble
    const hasDoorLeft = x > 0 && isDoor(map[y][x-1]);
    const hasDoorRight = x < map[y].length - 1 && isDoor(map[y][x+1]);
    
    if (hasDoorLeft && hasDoorRight) {
        // Puerta en medio de dos puertas (caso poco común, se cierra con pomo a la derecha)
        return TILES.DOOR_CLOSED_LEFT;
    } else if (hasDoorLeft) {
        // Puerta con otra a su izquierda (es la derecha de un par, pomo a la izquierda)
        return TILES.DOOR_CLOSED_RIGHT;
    } else if (hasDoorRight) {
        // Puerta con otra a su derecha (es la izquierda de un par, pomo a la derecha)
        return TILES.DOOR_CLOSED_LEFT;
    } else {
        // Puerta individual, siempre pomo a la derecha (abre hacia la izquierda)
        return TILES.DOOR_CLOSED_LEFT;
    }
}
