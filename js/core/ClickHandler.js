/**
 * ClickHandler.js
 * Manejo de clics en el canvas y lógica de interacción
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { isWalkable } from '../world/MapGenerator.js';
import { addChatMessage } from '../ui/UI.js';
import { isToggleableDoor } from '../world/TileTypes.js';
import { toggleDoor } from '../systems/BuildingSystem.js';
import { getCameraPosition } from './Renderer.js';
import { getEntityAtPosition, getTargetDescription } from './EntityDetection.js';
import { screenToWorld, updatePlayerFacingTowardsTarget, isPlayerFacingTarget } from './CoordinateUtils.js';
import { setAutoMoveTarget } from './AutoMovement.js';

const { TILE_SIZE } = CONFIG;

/**
 * Manejar clics en el canvas
 * @param {MouseEvent} event - Evento del clic
 */
export function handleCanvasClick(event) {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();

    // Obtener coordenadas del clic relativo al canvas
    // Ajustar por cualquier escalado del canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const screenX = (event.clientX - rect.left) * scaleX;
    const screenY = (event.clientY - rect.top) * scaleY;

    // Obtener posición de la cámara para debugging
    const camera = getCameraPosition();

    // Convertir a coordenadas del mundo usando Math.floor para consistencia con renderizado
    const worldCoords = screenToWorld(screenX, screenY);

    // Debug detallado
    console.log(`🖱️ Clic Debug:`);
    console.log(`   Mouse global: (${event.clientX}, ${event.clientY})`);
    console.log(`   Canvas rect: (${rect.left}, ${rect.top})`);
    console.log(`   Pantalla relativa: (${Math.floor(screenX)}, ${Math.floor(screenY)})`);
    console.log(`   Cámara actual: (${camera.x}, ${camera.y})`);
    console.log(`   Mundo calculado: (${worldCoords.x}, ${worldCoords.y})`);
    console.log(`   TILE_SIZE: ${TILE_SIZE}`);
    console.log(`   Cálculo esperado: debería ir a la celda que muestra esas coordenadas`);

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

        handleEntityClick(clickedEntity, worldCoords);
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
 * Manejar clic en una entidad
 * @param {Object} clickedEntity - Información de la entidad clickeada
 * @param {Object} worldCoords - Coordenadas del mundo donde se hizo clic
 */
function handleEntityClick(clickedEntity, worldCoords) {
    switch (clickedEntity.type) {
        case 'enemy':
            handleEnemyClick(clickedEntity.entity);
            break;
        case 'npc':
            handleNPCClick(clickedEntity.entity);
            break;
        case 'door':
            handleDoorClick(clickedEntity.entity);
            break;
        case 'object':
            handleObjectClick(clickedEntity.entity);
            break;
    }
}

/**
 * Manejar clic en enemigo
 * @param {Object} enemy - El enemigo clickeado
 */
function handleEnemyClick(enemy) {
    const dist = Math.abs(enemy.x - gameState.player.x) + Math.abs(enemy.y - gameState.player.y);
    const player = gameState.player;

    // Verificar primero si el jugador tiene arco y flechas equipadas para atacar a distancia
    import('../systems/Inventory.js').then(({ hasRangedWeaponEquipped, hasAmmunitionEquipped }) => {
        if (hasRangedWeaponEquipped() && hasAmmunitionEquipped()) {
            console.log(`🏹 Atacando a distancia con arco`);

            // Si el enemigo no está en la dirección a la que mira el jugador, girar primero
            if (!isPlayerFacingTarget(enemy.x, enemy.y)) {
                // Actualizar la dirección del jugador para mirar hacia el enemigo
                updatePlayerFacingTowardsTarget(enemy.x, enemy.y);
            }

            // Importar y ejecutar la función de ataque a distancia
            import('../systems/Combat.js').then(({ shootArrow }) => {
                const success = shootArrow();
                if (success) {
                    // La lógica de daño y mensajes se maneja en shootArrow
                    import('./Renderer.js').then(({ setPlayerAnimationState }) => {
                        setPlayerAnimationState('attacking');
                    });
                }
            });

            return; // Salir sin iniciar movimiento automático
        }
        // Si no tiene arco y flechas, continuar con la lógica de ataque cuerpo a cuerpo
        else {
            // Si está adyacente (distancia = 1), atacar directamente
            if (dist === 1) {
                console.log(`⚔️ Atacando directamente al enemigo adyacente`);

                // Importar y ejecutar la función de ataque
                import('../systems/Combat.js').then(({ playerAttack }) => {
                    playerAttack(enemy);
                    addChatMessage('system', `⚔️ ¡Atacando al enemigo ${enemy.type}!`);
                });

                // Actualizar la dirección del jugador para mirar hacia el enemigo
                updatePlayerFacingTowardsTarget(enemy.x, enemy.y);
            }
            // Si no está adyacente, moverse hacia el enemigo
            else {
                console.log(`🚶 Moviéndose hacia enemigo para ataque cuerpo a cuerpo`);
                // Establecer movimiento automático hacia el enemigo
                setAutoMoveTarget(enemy.x, enemy.y, 'enemy', enemy);
                addChatMessage('system', `🎯 Objetivo: ${getTargetDescription({type: 'enemy', entity: enemy})}`);
            }
        }
    });
}

/**
 * Manejar clic en NPC
 * @param {Object} npc - El NPC clickeado
 */
function handleNPCClick(npc) {
    const dist = Math.abs(npc.x - gameState.player.x) + Math.abs(npc.y - gameState.player.y);

    // Si está adyacente (distancia = 1), hablar directamente
    if (dist === 1) {
        console.log(`💬 Hablando directamente con NPC adyacente`);

        // Importar y ejecutar la función de diálogo
        import('../ui/Dialogue.js').then(({ showDialogue, isDialogueOpen }) => {
            if (!isDialogueOpen()) {
                showDialogue(npc);
                addChatMessage('system', `💬 Conversando con ${npc.name}`);
            }
        });

        // Actualizar la dirección del jugador para mirar hacia el NPC
        updatePlayerFacingTowardsTarget(npc.x, npc.y);

        return; // Salir sin iniciar movimiento automático
    }
}

/**
 * Manejar clic en puerta
 * @param {Object} door - La puerta clickeada
 */
function handleDoorClick(door) {
    const dist = Math.abs(door.x - gameState.player.x) + Math.abs(door.y - gameState.player.y);

    // Si está adyacente (distancia = 1, como con teclado)
    if (dist <= 1) {
        console.log(`🚪 Interactuando directamente con puerta adyacente`);

        // Actualizar la dirección del jugador para mirar hacia la puerta
        updatePlayerFacingTowardsTarget(door.x, door.y);

        // Alternar estado de la puerta
        toggleDoor(door.x, door.y);

        return; // Salir sin iniciar movimiento automático
    } else {
        // Si no está adyacente, establecer objetivo de movimiento
        console.log(`🚶 Moviéndose hacia puerta para interactuar`);
        setAutoMoveTarget(door.x, door.y, 'door', door);
        addChatMessage('system', `🎯 Moviendo hacia puerta para abrir/cerrar`);
        return;
    }
}

/**
 * Manejar clic en objeto
 * @param {Object} obj - El objeto clickeado
 */
function handleObjectClick(obj) {
    const dist = Math.abs(obj.x - gameState.player.x) + Math.abs(obj.y - gameState.player.y);

    // Si está adyacente (distancia = 1) o en la posición del jugador (distancia = 0)
    if (dist <= 1) {
        console.log(`📦 Interactuando directamente con objeto adyacente`);

        // Actualizar la dirección del jugador para mirar hacia el objeto
        if (dist > 0) { // Solo si no estamos encima del objeto
            updatePlayerFacingTowardsTarget(obj.x, obj.y);
        }

        // Importar y usar la función centralizada de interacción con objetos
        import('./ObjectInteraction.js').then(({ handleObjectInteraction }) => {
            handleObjectInteraction(obj);
        });

        return; // Salir sin iniciar movimiento automático
    }
}
