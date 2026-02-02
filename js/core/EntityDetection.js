/**
 * EntityDetection.js
 * Utilidades para detectar entidades en posiciones específicas
 */

import { gameState } from '../state.js';
import { isToggleableDoor } from '../world/TileTypes.js';
import { CONFIG } from '../config.js';

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

    // Verificar jugadores online (PRIORIDAD: antes que bots y NPCs)
    if (gameState.isOnline && gameState.onlinePlayers) {
        for (const [socketId, player] of gameState.onlinePlayers) {
            // Solo detectar jugadores en el mismo mapa
            if (player.map === gameState.currentMap) {
                // Usar posiciones redondeadas para comparación
                const playerX = Math.round(player.x);
                const playerY = Math.round(player.y);
                
                if (playerX === x && playerY === y) {
                    return { type: 'onlinePlayer', entity: player, socketId: socketId };
                }
            }
        }
    }

    // Verificar bots (jugadores bot)
    if (gameState.bots) {
        for (const bot of gameState.bots) {
            if (bot.currentMap === gameState.currentMap && bot.x === x && bot.y === y) {
                return { type: 'bot', entity: bot };
            }
        }
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
            // If it's a portal, return it with a specific type for better handling
            if (obj.type === 'portal') {
                return { type: 'portal', entity: obj };
            }
            // If it's a resource, return it with resource type for gathering
            if (obj.type === 'resource') {
                return { type: 'resource', entity: obj };
            }
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
        case 'portal':
            return 'Portal';
        case 'player':
        case 'onlinePlayer':
            return `Jugador ${entityInfo.entity.username || 'Desconocido'}`;
        case 'bot':
            return `Bot ${entityInfo.entity.name}`;
        default:
            return 'Posición';
    }
}

/**
 * Encuentra jugadores dentro de un rango visible alrededor del jugador principal
 * @param {number} range - Radio de visibilidad en tiles (por defecto: 10)
 * @returns {Array} Lista de jugadores visibles, con sus IDs y nombres
 */
export function getPlayersInVisibleRange(range = 10) {
    const visiblePlayers = [];
    
    // Si el juego está en modo online, revisa los jugadores reales
    if (gameState.isOnline) {
        Object.values(gameState.otherPlayers).forEach(player => {
            const dx = Math.abs(player.x - gameState.player.x);
            const dy = Math.abs(player.y - gameState.player.y);
            
            // Comprobar que está dentro del rango visible
            if (dx <= range && dy <= range) {
                visiblePlayers.push({
                    id: player.id,
                    username: player.username,
                    x: player.x,
                    y: player.y
                });
            }
        });
    } 
    // En modo offline, simular algunos jugadores para pruebas
    else {
        // Crear algunos jugadores simulados cerca del jugador
        visiblePlayers.push({
            id: "player1",
            username: "Jugador1",
            x: gameState.player.x + 2,
            y: gameState.player.y
        });
        
        visiblePlayers.push({
            id: "player2", 
            username: "Jugador2",
            x: gameState.player.x,
            y: gameState.player.y + 2
        });
    }
    
    return visiblePlayers;
}
