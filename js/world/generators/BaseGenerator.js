/**
 * BaseGenerator.js
 * Base functionality for map generation that's shared across all generator types
 */

import { CONFIG } from '../../config.js';
import { TILES, isTileWalkable, isClosedDoor, isOpenDoor } from '../TileTypes.js';
import { gameState } from '../../state.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Check if tile is walkable
 * @param {Array} map - The map to check
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if the tile is walkable
 */
export function isWalkable(map, x, y) {
    // Boundary check
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;

    // Map validity check
    if (!map || !Array.isArray(map)) {
        console.error("isWalkable: map is not an array", map);
        return false;
    }

    // Row validity check
    if (!map[y] || !Array.isArray(map[y])) {
        console.error(`isWalkable: map[${y}] is not an array`, map[y]);
        return false;
    }

    // Cell validity check
    if (map[y][x] === undefined) {
        console.error(`isWalkable: map[${y}][${x}] is undefined`);
        return false;
    }

    // Comprobar capa de árboles - si hay un árbol, no es caminable
    if (gameState.treeLayer && 
        gameState.treeLayer[y] && 
        gameState.treeLayer[y][x] !== undefined && 
        gameState.treeLayer[y][x] === TILES.TREE) {
        return false;
    }

    // Verificar recursos recolectables (árboles, minerales, etc.)
    // Si hay un recurso no agotado, no es caminable
    if (gameState.objects) {
        const resourceAtPosition = gameState.objects.find(obj => 
            obj.type === 'resource' && 
            obj.x === x && 
            obj.y === y && 
            !obj.depleted
        );
        if (resourceAtPosition) {
            return false; // Recursos bloquean el paso (hasta que se talen/minen)
        }
    }

    // Puerta check
    if (gameState.doorLayer && gameState.doorLayer[y] && gameState.doorLayer[y][x] !== undefined && 
        gameState.doorLayer[y][x] !== 0) {
        
        const doorTile = gameState.doorLayer[y][x];
        
        // Si hay una puerta cerrada, no es caminable
        if (isClosedDoor(doorTile)) {
            return false;
        }
        
        // Si hay una puerta abierta, es caminable
        if (isOpenDoor(doorTile)) {
            return true;
        }
    }

    // Normal tile check
    const tile = map[y][x];
    return isTileWalkable(tile);
}

/**
 * Create a fallback map when normal map generation fails
 * @param {number} height - Map height
 * @param {number} width - Map width
 * @returns {Array} Simple fallback map
 */
export function createFallbackMap(height = MAP_HEIGHT, width = MAP_WIDTH) {
    console.warn('⚠️ Usando mapa fallback por error en procesamiento');
    const fallbackMap = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
        }
        fallbackMap.push(row);
    }
    return fallbackMap;
}
