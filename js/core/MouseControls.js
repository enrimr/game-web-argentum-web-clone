/**
 * MouseControls.js
 * Sistema de control por ratón - clic para interactuar con el mundo
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { isWalkable } from '../world/MapGenerator.js';
import { addChatMessage } from '../ui/UI.js';

// Importar la función getCameraPosition del renderer para consistencia
import { getCameraPosition } from './Renderer.js';

const { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } = CONFIG;

// Estado del movimiento automático
let autoMoveTarget = null; // {x, y, type, target}
let isAutoMoving = false;
let lastAutoMoveTime = 0;
const MOVE_DELAY = CONFIG.PLAYER.MOVE_DELAY; // milliseconds

/**
 * Inicializar controles de ratón
 */
export function initMouseControls() {
    const canvas = document.getElementById('gameCanvas');

    canvas.addEventListener('click', handleCanvasClick);
    canvas.style.cursor = 'crosshair'; // Cambiar cursor para indicar interactividad
}

/**
 * Manejar clics en el canvas
 * @param {MouseEvent} event - Evento del clic
 */
function handleCanvasClick(event) {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();

    // Obtener coordenadas del clic relativo al canvas
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    // Obtener posición de la cámara para debugging
    const camera = getCameraPosition();

    // Convertir a coordenadas del mundo
    const worldCoords = screenToWorld(screenX, screenY);

    // Debug detallado
    console.log(`🖱️ Clic Debug:`);
    console.log(`   Mouse global: (${event.clientX}, ${event.clientY})`);
    console.log(`   Canvas rect: (${rect.left}, ${rect.top})`);
    console.log(`   Pantalla relativa: (${Math.floor(screenX)}, ${Math.floor(screenY)})`);
    console.log(`   Cámara actual: (${camera.x}, ${camera.y})`);
    console.log(`   Mundo calculado: (${worldCoords.x}, ${worldCoords.y})`);
    console.log(`   TILE_SIZE: ${TILE_SIZE}`);

    // Verificar si las coordenadas están dentro del mapa
    if (worldCoords.x < 0 || worldCoords.x >= CONFIG.MAP_WIDTH ||
        worldCoords.y < 0 || worldCoords.y >= CONFIG.MAP_HEIGHT) {
        console.log(`❌ Coordenadas fuera del mapa: (${worldCoords.x}, ${worldCoords.y}) - Mapa: ${CONFIG.MAP_WIDTH}x${CONFIG.MAP_HEIGHT}`);
        return; // Fuera del mapa
    }

    console.log(`✅ Coordenadas válidas en mapa`);

    // Determinar qué hay en la posición clickeada
    const clickedEntity = getEntityAtPosition(worldCoords.x, worldCoords.y);

    if (clickedEntity) {
        // Hay una entidad en la posición (enemigo, NPC, objeto)
        console.log(`🎯 Entidad encontrada: ${clickedEntity.type} - ${getTargetDescription(clickedEntity)}`);
        setAutoMoveTarget(worldCoords.x, worldCoords.y, clickedEntity.type, clickedEntity.entity);
        addChatMessage('system', `🎯 Objetivo: ${getTargetDescription(clickedEntity)}`);
    } else if (isWalkable(gameState.map, worldCoords.x, worldCoords.y)) {
        // Posición vacía walkable - moverse hacia allí
        console.log(`🚶 Posición walkable encontrada`);
        setAutoMoveTarget(worldCoords.x, worldCoords.y, 'position', null);
        addChatMessage('system', `🎯 Moviendo hacia posición (${worldCoords.x}, ${worldCoords.y})`);
    } else {
        console.log(`❌ Posición no walkable (tile: ${gameState.map[worldCoords.y][worldCoords.x]})`);
    }
}

/**
 * Obtener entidad en una posición específica
 * @param {number} x - Coordenada X del mundo
 * @param {number} y - Coordenada Y del mundo
 * @returns {Object|null} Información de la entidad o null
 */
function getEntityAtPosition(x, y) {
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
 * Establecer objetivo de movimiento automático
 * @param {number} x - Coordenada X del objetivo
 * @param {number} y - Coordenada Y del objetivo
 * @param {string} type - Tipo de objetivo ('enemy', 'npc', 'object', 'position')
 * @param {Object} target - Entidad objetivo (opcional)
 */
function setAutoMoveTarget(x, y, type, target) {
    autoMoveTarget = {
        x: x,
        y: y,
        type: type,
        target: target
    };
    isAutoMoving = true;
}

/**
 * Obtener descripción del objetivo para mensajes
 * @param {Object} entityInfo - Información de la entidad
 * @returns {string} Descripción del objetivo
 */
function getTargetDescription(entityInfo) {
    switch (entityInfo.type) {
        case 'enemy':
            return `Enemigo ${entityInfo.entity.type}`;
        case 'npc':
            return `NPC ${entityInfo.entity.name}`;
        case 'object':
            return `Objeto ${entityInfo.entity.type}`;
        default:
            return 'Posición';
    }
}

/**
 * Convertir coordenadas de pantalla a coordenadas del mundo
 * @param {number} screenX - Coordenada X de pantalla
 * @param {number} screenY - Coordenada Y de pantalla
 * @returns {Object} Coordenadas del mundo {x, y}
 */
function screenToWorld(screenX, screenY) {
    // Obtener la posición de la cámara (misma función que en Renderer)
    const camera = getCameraPosition();

    // Convertir coordenadas de pantalla a coordenadas del mundo
    // Usar Math.floor para ser consistente con la lógica de renderizado
    const worldX = camera.x + Math.floor(screenX / TILE_SIZE);
    const worldY = camera.y + Math.floor(screenY / TILE_SIZE);

    return { x: worldX, y: worldY };
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
            if (!enemyAtPosition) {
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
                    import('./Combat.js').then(({ playerAttack }) => {
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
                    import('./Dialogue.js').then(({ showDialogue, isDialogueOpen }) => {
                        if (!isDialogueOpen()) {
                            showDialogue(target.target);
                            addChatMessage('system', '💬 Hablando con NPC');
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
                // Ejecutar la lógica de recogida de objetos
                handleObjectInteraction(target.target);
            } else {
                addChatMessage('system', '❌ Objeto ya no existe');
            }
            break;

        case 'position':
            // Solo movimiento - ya completado
            addChatMessage('system', '✅ Posición alcanzada');
            break;
    }

    cancelAutoMovement();
}

/**
 * Manejar interacción con objeto (duplicado de GameLoop para evitar dependencias circulares)
 * @param {Object} obj - Objeto a interactuar
 */
function handleObjectInteraction(obj) {
    const px = gameState.player.x;
    const py = gameState.player.y;

    // Solo procesar si el objeto está en la posición del jugador
    if (obj.x === px && obj.y === py) {
        if (obj.type === 'chest' && !obj.opened) {
            obj.opened = true;
            gameState.player.gold += obj.contains.gold;
            gameState.stats.chestsOpened++;
            addChatMessage('system', `¡Has abierto un cofre y encontrado ${obj.contains.gold} de oro!`);
            gameState.objects.splice(gameState.objects.indexOf(obj), 1);
        } else if (obj.type === 'gold') {
            gameState.player.gold += obj.amount;
            addChatMessage('system', `¡Has recogido ${obj.amount} de oro!`);
            gameState.objects.splice(gameState.objects.indexOf(obj), 1);
        } else if (obj.type === 'item') {
            // Importar y usar la función de inventario
            import('./Inventory.js').then(({ addItemToInventory }) => {
                import('./ItemTypes.js').then(({ ITEM_TYPES }) => {
                    const success = addItemToInventory(obj.itemType, obj.quantity);
                    if (success) {
                        const itemName = ITEM_TYPES[obj.itemType].name;
                        const quantity = obj.quantity;
                        addChatMessage('system', `¡Has recogido ${quantity}x ${itemName}!`);
                        gameState.objects.splice(gameState.objects.indexOf(obj), 1);
                    } else {
                        addChatMessage('system', '❌ ¡Inventario lleno! No puedes recoger el item.');
                    }
                });
            });
        } else if (obj.type === 'portal') {
            // Importar y usar la función de cambio de mapa
            import('./Game.js').then(({ changeMap }) => {
                changeMap(obj.targetMap, obj.targetX, obj.targetY);
            });
        }

        // Actualizar UI
        import('./UI.js').then(({ updateUI }) => {
            updateUI();
        });
    }
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
