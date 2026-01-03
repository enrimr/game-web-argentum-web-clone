/**
 * EntityDetection.js
 * Utilidades para detectar entidades en posiciones específicas
 */

import { gameState } from '../state.js';
import { isToggleableDoor } from '../world/TileTypes.js';

/**
 * Obtener entidad en una posición específica
 * @param {number} x - Coordenada X del mundo
 * @param {number} y - Coordenada Y del mundo
 * @returns {Object|null} Información de la entidad o null
 */
export function getEntityAtPosition(x, y) {
    // Verificar si hay una puerta en esta posición (primero en doorLayer, luego en map)
    let doorTile = null;

    // Comprobar primero en la capa de puertas (donde se almacenan las puertas toggled)
    if (gameState.doorLayer && gameState.doorLayer[y] && gameState.doorLayer[y][x] !== undefined) {
        doorTile = gameState.doorLayer[y][x];
    }
    // Si no hay puerta en doorLayer, comprobar en la capa base del mapa
    else if (gameState.map && gameState.map[y] && gameState.map[y][x] !== undefined) {
        doorTile = gameState.map[y][x];
    }

    if (doorTile !== null && isToggleableDoor(doorTile)) {
        return { type: 'door', entity: { x, y, tile: doorTile } };
    }

    // Verificar NPCs
    for (const npc of gameState.npcs) {
        if (npc.x === x && npc.y === y) {
            return { type: 'npc', entity: npc };
        }
    }

    // Verificar enemigos
    for (const enemy of gameState.enemies) {
        if (enemy.x === x && enemy.y === y) {
            return { type: 'enemy', entity: enemy };
        }
    }

    // Verificar objetos
    for (const obj of gameState.objects) {
        if (obj.x === x && obj.y === y) {
            return { type: 'object', entity: obj };
        }
    }

    return null; // No hay entidad
}

/**
 * Obtener descripción del objetivo para mensajes
 * @param {Object} entityInfo - Información de la entidad
 * @returns {string} Descripción del objetivo
 */
export function getTargetDescription(entityInfo) {
    switch (entityInfo.type) {
        case 'enemy':
            return `Enemigo ${entityInfo.entity.type}`;
        case 'npc':
            return `NPC ${entityInfo.entity.name}`;
        case 'object':
            return `Objeto ${entityInfo.entity.type}`;
        case 'door':
            return 'Puerta';
        default:
            return 'Posición';
    }
}
