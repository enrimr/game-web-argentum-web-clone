/**
 * AutoMovement.js
 * Sistema de movimiento automático del jugador
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { isWalkable } from '../world/MapGenerator.js';
import { addChatMessage } from '../ui/UI.js';
import { toggleDoor } from '../systems/BuildingSystem.js';
import { updatePlayerFacingTowardsTarget } from './CoordinateUtils.js';
import { setPlayerAnimationState } from './Renderer.js';

const { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } = CONFIG;

// Estado del movimiento automático
let autoMoveTarget = null; // {x, y, type, target}
let isAutoMoving = false;
let lastAutoMoveTime = 0;
const MOVE_DELAY = CONFIG.PLAYER.MOVE_DELAY; // milliseconds

/**
 * Establecer objetivo de movimiento automático
 * @param {number} x - Coordenada X del objetivo
 * @param {number} y - Coordenada Y del objetivo
 * @param {string} type - Tipo de objetivo ('enemy', 'npc', 'object', 'position')
 * @param {Object} target - Entidad objetivo (opcional)
 */
export function setAutoMoveTarget(x, y, type, target) {
    autoMoveTarget = {
        x: x,
        y: y,
        type: type,
        target: target
    };
    isAutoMoving = true;
}

/**
 * Actualizar movimiento automático del jugador
 * @param {number} timestamp - Timestamp actual para controlar velocidad
 * @returns {boolean} True si el movimiento continúa
 */
export function updateAutoMovement(timestamp) {
    if (!isAutoMoving || !autoMoveTarget) {
        return false;
    }

    // Verificar si el jugador está meditando y cancelar la meditación si es así
    if (gameState.player.meditating) {
        console.log("🖱️ Movimiento automático detectado mientras meditaba - cancelando meditación");
        gameState.player.meditating = false; // Cancelar meditación directamente
        setPlayerAnimationState('idle'); // Restaurar animación normal
        addChatMessage('system', '🧘 Has dejado de meditar para moverte.');
    }

    // Aplicar el mismo delay que el movimiento manual
    if (timestamp - lastAutoMoveTime < MOVE_DELAY) {
        return true; // Continuar esperando
    }

    const player = gameState.player;
    const target = autoMoveTarget;

    // Verificar si ya estamos en el objetivo
    if (player.x === target.x && player.y === target.y) {
        // Llegamos al objetivo - ejecutar acción correspondiente
        executeTargetAction();
        return false; // Movimiento completado
    }

    // Calcular dirección hacia el objetivo
    const dx = target.x - player.x;
    const dy = target.y - player.y;

    // Solo movimientos ortogonales (arriba, abajo, izquierda, derecha)
    const possibleMoves = [];

    // Determinar eje prioritario (el que tiene mayor distancia)
    if (Math.abs(dx) > Math.abs(dy)) {
        // Priorizar movimiento horizontal
        if (dx !== 0) {
            possibleMoves.push({ x: dx > 0 ? 1 : -1, y: 0 }); // izquierda/derecha
        }
        if (dy !== 0) {
            possibleMoves.push({ x: 0, y: dy > 0 ? 1 : -1 }); // arriba/abajo
        }
    } else {
        // Priorizar movimiento vertical
        if (dy !== 0) {
            possibleMoves.push({ x: 0, y: dy > 0 ? 1 : -1 }); // arriba/abajo
        }
        if (dx !== 0) {
            possibleMoves.push({ x: dx > 0 ? 1 : -1, y: 0 }); // izquierda/derecha
        }
    }

    // Intentar cada movimiento posible
    for (const move of possibleMoves) {
        const newX = player.x + move.x;
        const newY = player.y + move.y;

        // Verificar si la nueva posición es válida
        if (isWalkable(gameState.map, newX, newY)) {
            // Verificar que no haya un enemigo bloqueando el camino
            const enemyAtPosition = gameState.enemies.some(e => e.x === newX && e.y === newY);

            // Verificar que no haya un NPC bloqueando el camino
            const npcAtPosition = gameState.npcs.some(npc => npc.x === newX && npc.y === newY);

            // Verificar que no haya un bot bloqueando el camino
            const botAtPosition = gameState.bots && gameState.bots.some(bot => 
                bot.currentMap === gameState.currentMap && bot.x === newX && bot.y === newY
            );

            // Verificar que no haya un jugador online bloqueando el camino
            const onlinePlayerAtPosition = gameState.isOnline && gameState.onlinePlayers && 
                Array.from(gameState.onlinePlayers.values()).some(player => 
                    player.map === gameState.currentMap && 
                    Math.round(player.x) === newX && 
                    Math.round(player.y) === newY
                );

            if (!enemyAtPosition && !npcAtPosition && !botAtPosition && !onlinePlayerAtPosition) {
                // Movimiento válido encontrado
                player.x = newX;
                player.y = newY;
                lastAutoMoveTime = timestamp;

                // Actualizar dirección del jugador basada en el movimiento
                updatePlayerFacing(move.x, move.y);

                return true; // Continuar movimiento
            }
        }
    }

    // No se puede mover en ninguna dirección - cancelar movimiento automático
    cancelAutoMovement();
    addChatMessage('system', '❌ Camino bloqueado, movimiento cancelado');
    return false;
}

/**
 * Actualizar dirección del jugador basada en el movimiento
 * @param {number} moveX - Movimiento en X
 * @param {number} moveY - Movimiento en Y
 */
function updatePlayerFacing(moveX, moveY) {
    // Determinar dirección principal basada en el movimiento
    if (Math.abs(moveX) > Math.abs(moveY)) {
        // Movimiento principalmente horizontal
        gameState.player.facing = moveX > 0 ? 'right' : 'left';
    } else if (Math.abs(moveY) > Math.abs(moveX)) {
        // Movimiento principalmente vertical
        gameState.player.facing = moveY > 0 ? 'down' : 'up';
    } else {
        // Movimiento diagonal - usar la dirección más lógica
        if (moveX > 0 && moveY > 0) gameState.player.facing = 'down'; // diagonal abajo-derecha
        else if (moveX > 0 && moveY < 0) gameState.player.facing = 'right'; // diagonal arriba-derecha
        else if (moveX < 0 && moveY > 0) gameState.player.facing = 'down'; // diagonal abajo-izquierda
        else if (moveX < 0 && moveY < 0) gameState.player.facing = 'up'; // diagonal arriba-izquierda
    }
}

/**
 * Ejecutar acción del objetivo alcanzado
 */
function executeTargetAction() {
    if (!autoMoveTarget) return;

    const target = autoMoveTarget;

    switch (target.type) {
        case 'enemy':
            // Atacar al enemigo - verificar que sigue existiendo y está en rango
            if (target.target && gameState.enemies.includes(target.target)) {
                const dist = Math.abs(target.target.x - gameState.player.x) + Math.abs(target.target.y - gameState.player.y);
                if (dist === 1) {
                    // Importar y ejecutar el ataque
                    import('../systems/Combat.js').then(({ playerAttack }) => {
                        playerAttack(target.target);
                        addChatMessage('system', '⚔️ ¡Atacando al enemigo!');
                    });
                } else {
                    addChatMessage('system', '❌ Enemigo ya no está en rango');
                }
            } else {
                addChatMessage('system', '❌ Enemigo ya no existe');
            }
            break;

        case 'npc':
            // Interactuar con NPC - verificar que sigue existiendo y está en rango
            if (target.target && gameState.npcs.includes(target.target)) {
                const dist = Math.abs(target.target.x - gameState.player.x) + Math.abs(target.target.y - gameState.player.y);
                if (dist === 1) {
                    // Importar y ejecutar el diálogo
                    import('../ui/Dialogue.js').then(({ showDialogue, isDialogueOpen }) => {
                        if (!isDialogueOpen()) {
                            showDialogue(target.target);
                            addChatMessage('system', `💬 Conversando con ${target.target.name}`);
                        }
                    });
                } else {
                    addChatMessage('system', '❌ NPC ya no está en rango');
                }
            } else {
                addChatMessage('system', '❌ NPC ya no existe');
            }
            break;

        case 'object':
            // Recoger objeto - verificar que sigue existiendo
            if (target.target && gameState.objects.includes(target.target)) {
                // Importar y usar la función centralizada de interacción con objetos
                import('./ObjectInteraction.js').then(({ handleObjectInteraction }) => {
                    handleObjectInteraction(target.target);
                });
            } else {
                addChatMessage('system', '❌ Objeto ya no existe');
            }
            break;

        case 'door':
            // Interactuar con puerta - verificar que sigue existiendo
            if (target.target && gameState.map && gameState.map[target.target.y] &&
                gameState.map[target.target.y][target.target.x] !== undefined) {
                const dist = Math.abs(target.target.x - gameState.player.x) + Math.abs(target.target.y - gameState.player.y);
                if (dist === 1) {
                    // Actualizar dirección del jugador
                    updatePlayerFacingTowardsTarget(target.target.x, target.target.y);
                    // Alternar puerta
                    toggleDoor(target.target.x, target.target.y);
                } else {
                    addChatMessage('system', '❌ La puerta no está en rango');
                }
            } else {
                addChatMessage('system', '❌ La puerta ya no existe');
            }
            break;

        case 'position':
            // Solo movimiento - ya completado
            addChatMessage('system', '✅ Posición alcanzada');
            break;
            
        case 'portal':
            // Usar portal - verificar que sigue existiendo
            if (target.target && gameState.objects.includes(target.target)) {
                // Importar y usar la función de cambio de mapa
                import('./Game.js').then(({ changeMap }) => {
                    changeMap(target.target.targetMap, target.target.targetX, target.target.targetY);
                    addChatMessage('system', '🌀 ¡Te has teletransportado!');
                });
            } else {
                addChatMessage('system', '❌ El portal ya no existe');
            }
            break;
            
        case 'resource':
            // Recolectar recurso - verificar que sigue existiendo y está en rango
            if (target.target && gameState.objects.includes(target.target)) {
                const dist = Math.abs(target.target.x - gameState.player.x) + Math.abs(target.target.y - gameState.player.y);
                if (dist <= 1) {
                    // Actualizar dirección del jugador
                    updatePlayerFacingTowardsTarget(target.target.x, target.target.y);
                    // Intentar recolectar
                    import('../systems/ResourceGathering.js').then(({ attemptGathering }) => {
                        const success = attemptGathering(target.target);
                        if (!success) {
                            console.log(`❌ No se pudo recolectar el recurso`);
                        }
                    });
                } else {
                    addChatMessage('system', '❌ Recurso no está en rango');
                }
            } else {
                addChatMessage('system', '❌ Recurso ya no existe');
            }
            break;
            
        case 'water_fishing':
            // Llegamos al agua para pescar
            if (target.target) {
                const waterX = target.target.x;
                const waterY = target.target.y;
                const dist = Math.abs(waterX - gameState.player.x) + Math.abs(waterY - gameState.player.y);
                
                if (dist === 1) {
                    // El jugador está adyacente al agua, puede pescar
                    console.log(`🎣 Llegaste al agua, comenzando a pescar`);
                    
                    // Actualizar dirección hacia el agua
                    updatePlayerFacingTowardsTarget(waterX, waterY);
                    
                    // Crear zona de pesca temporal
                    const fishingSpot = {
                        type: 'resource',
                        resourceType: 'FISHING_SPOT',
                        x: waterX,
                        y: waterY,
                        sprite: 'water'
                    };
                    
                    // Intentar pescar
                    import('../systems/ResourceGathering.js').then(({ attemptGathering }) => {
                        attemptGathering(fishingSpot);
                    });
                } else {
                    addChatMessage('system', '❌ No estás lo suficientemente cerca del agua');
                }
            }
            break;
            
        case 'onlinePlayer':
            // Llegamos a un jugador online - atacar
            if (target.target && target.target.player && target.target.socketId) {
                const player = target.target.player;
                const socketId = target.target.socketId;
                
                // Verificar que el jugador todavía existe en onlinePlayers
                const currentPlayer = gameState.onlinePlayers.get(socketId);
                if (!currentPlayer) {
                    addChatMessage('system', '❌ El jugador ya no está conectado');
                    break;
                }
                
                const playerX = Math.round(currentPlayer.x);
                const playerY = Math.round(currentPlayer.y);
                const dist = Math.abs(playerX - gameState.player.x) + Math.abs(playerY - gameState.player.y);
                
                if (dist === 1) {
                    console.log(`⚔️ Llegaste al jugador online, atacando`);
                    
                    // Actualizar dirección hacia el jugador
                    updatePlayerFacingTowardsTarget(playerX, playerY);
                    
                    // Atacar al jugador
                    import('../systems/Combat.js').then(({ attackPlayer }) => {
                        attackPlayer(socketId, currentPlayer);
                    });
                } else {
                    addChatMessage('system', '❌ El jugador se ha movido, ya no está en rango');
                }
            } else {
                addChatMessage('system', '❌ Jugador ya no disponible');
            }
            break;
    }

    cancelAutoMovement();
}



/**
 * Cancelar movimiento automático
 */
function cancelAutoMovement() {
    autoMoveTarget = null;
    isAutoMoving = false;
}

/**
 * Verificar si el jugador está en movimiento automático
 * @returns {boolean} True si está en movimiento automático
 */
export function isPlayerAutoMoving() {
    return isAutoMoving;
}

/**
 * Obtener objetivo de movimiento automático actual
 * @returns {Object|null} Objetivo actual o null
 */
export function getAutoMoveTarget() {
    return autoMoveTarget;
}
