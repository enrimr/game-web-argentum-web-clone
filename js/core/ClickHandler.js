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
import { getCameraPosition, setPlayerAnimationState } from './Renderer.js';
import { getEntityAtPosition, getTargetDescription } from './EntityDetection.js';
import { screenToWorld, updatePlayerFacingTowardsTarget, isPlayerFacingTarget } from './CoordinateUtils.js';
import { setAutoMoveTarget } from './AutoMovement.js';
import { getSpellsUIState, handleTargetSelection } from '../ui/SpellsUI.js';

const { TILE_SIZE } = CONFIG;

/**
 * Manejar clics en el canvas
 * @param {MouseEvent} event - Evento del clic
 */
export function handleCanvasClick(event) {
    // Verificar si el jugador está meditando y cancelar la meditación si es así
    if (gameState.player.meditating) {
        console.log("🖱️ Clic detectado mientras meditaba - cancelando meditación");
        gameState.player.meditating = false; // Cancelar meditación directamente
        setPlayerAnimationState('idle'); // Restaurar animación normal
        addChatMessage('system', '🧘 Has dejado de meditar para moverte.');
    }

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
    
    // Verificar primero si estamos en modo de selección de objetivo para un hechizo
    const spellsUIState = getSpellsUIState();
    if (spellsUIState && spellsUIState.waitingForTarget) {
        console.log('🔮 Modo de selección de objetivo para hechizo');
        
        // Verificar si estamos haciendo clic en la posición del jugador
        if (worldCoords.x === gameState.player.x && worldCoords.y === gameState.player.y) {
            // Si es el jugador, pasar directamente el objeto gameState.player
            const success = handleTargetSelection(gameState.player);
            if (success) {
                console.log('✨ Hechizo lanzado con éxito sobre el jugador');
                return;
            }
        }
        // Si no es el jugador, verificar si hay otra entidad
        else {
            const clickedEntity = getEntityAtPosition(worldCoords.x, worldCoords.y);
            
            if (clickedEntity) {
                // Si hay una entidad, intentar lanzar el hechizo sobre ella
                const success = handleTargetSelection(clickedEntity.entity);
                if (success) {
                    console.log('✨ Hechizo lanzado con éxito sobre objetivo');
                    return; // Salir si el hechizo se lanzó con éxito
                }
            } 
            else {
                // Si no hay entidad, intentar usar las coordenadas como objetivo
                // (útil para hechizos de área o de terreno)
                const success = handleTargetSelection(worldCoords);
                if (success) {
                    console.log('✨ Hechizo lanzado con éxito en ubicación');
                    return; // Salir si el hechizo se lanzó con éxito
                }
            }
        }
        
        // Si llegamos aquí, el objetivo no era válido para el hechizo
        console.log('❌ Objetivo no válido para el hechizo seleccionado');
        addChatMessage('system', '❌ Objetivo no válido para este hechizo.');
        return; // No continuar con la lógica normal de clic
    }

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
        // Verificar si es un tile de agua para pescar
        import('../world/TileTypes.js').then(({ TILES }) => {
            const tile = gameState.map[worldCoords.y][worldCoords.x];
            if (tile === TILES.WATER) {
                console.log(`🎣 Tile de agua detectado`);
                handleWaterTileClick(worldCoords.x, worldCoords.y);
            } else {
                console.log(`❌ Posición no walkable (tile: ${tile})`);
            }
        });
    }
}

/**
 * Manejar clic en una entidad
 * @param {Object} clickedEntity - Información de la entidad clickeada
 * @param {Object} worldCoords - Coordenadas del mundo donde se hizo clic
 */
function handleEntityClick(clickedEntity, worldCoords) {
    switch (clickedEntity.type) {
        case 'onlinePlayer':
            handleOnlinePlayerClick(clickedEntity.entity, clickedEntity.socketId);
            break;
        case 'bot':
            handleBotClick(clickedEntity.entity);
            break;
        case 'syncedNPC':
            handleSyncedNPCClick(clickedEntity.entity, clickedEntity.instanceId);
            break;
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
        case 'portal':
            handlePortalClick(clickedEntity.entity);
            break;
        case 'resource':
            handleResourceClick(clickedEntity.entity);
            break;
    }
}

/**
 * Manejar clic en tile de agua para pescar
 * @param {number} waterX - Coordenada X del agua
 * @param {number} waterY - Coordenada Y del agua
 */
function handleWaterTileClick(waterX, waterY) {
    // Verificar que el jugador no sea fantasma
    if (gameState.player.isGhost) {
        addChatMessage('system', '👻 Como fantasma no puedes pescar.');
        return;
    }

    // Verificar que el jugador tiene caña equipada
    const equippedWeapon = gameState.player.equipped.weapon;
    const hasFishingRod = equippedWeapon === 'FISHING_ROD' || equippedWeapon === 'FISHING_ROD_GOOD';
    
    if (!hasFishingRod) {
        addChatMessage('system', '❌ Necesitas equipar una caña de pescar para pescar.');
        return;
    }

    // Calcular distancia al tile de agua
    const dist = Math.abs(waterX - gameState.player.x) + Math.abs(waterY - gameState.player.y);

    if (dist <= 1) {
        // El jugador está adyacente al agua, puede pescar
        console.log(`🎣 Pescando directamente en agua adyacente`);

        // Actualizar dirección hacia el agua
        updatePlayerFacingTowardsTarget(waterX, waterY);

        // Crear una zona de pesca temporal como recurso
        const fishingSpot = {
            type: 'resource',
            resourceType: 'FISHING_SPOT',
            x: waterX,
            y: waterY,
            sprite: 'water', // Usamos el sprite de agua
            // No se añade a gameState.objects, es temporal solo para la acción
        };

        // Intentar pescar usando el sistema de recolección
        import('../systems/ResourceGathering.js').then(({ attemptGathering }) => {
            attemptGathering(fishingSpot);
        });

        return;
    } else {
        // Moverse hacia el agua para pescar
        console.log(`🚶 Moviéndose hacia agua para pescar`);
        
        // Buscar tile walkable adyacente al agua
        const adjacentTiles = [
            { x: waterX - 1, y: waterY },
            { x: waterX + 1, y: waterY },
            { x: waterX, y: waterY - 1 },
            { x: waterX, y: waterY + 1 }
        ];

        // Encontrar el tile walkable más cercano
        let closestWalkable = null;
        let minDist = Infinity;

        for (const tile of adjacentTiles) {
            if (tile.x >= 0 && tile.x < CONFIG.MAP_WIDTH && 
                tile.y >= 0 && tile.y < CONFIG.MAP_HEIGHT &&
                isWalkable(gameState.map, tile.x, tile.y)) {
                
                const tileDist = Math.abs(tile.x - gameState.player.x) + Math.abs(tile.y - gameState.player.y);
                if (tileDist < minDist) {
                    minDist = tileDist;
                    closestWalkable = tile;
                }
            }
        }

        if (closestWalkable) {
            // Mover hacia el tile adyacente al agua
            setAutoMoveTarget(closestWalkable.x, closestWalkable.y, 'water_fishing', {x: waterX, y: waterY});
            addChatMessage('system', `🎯 Moviendo hacia el agua para pescar`);
        } else {
            addChatMessage('system', '❌ No puedes acceder a esa zona de agua.');
        }
    }
}

/**
 * Manejar clic en recurso (árboles, vetas, etc.)
 * @param {Object} resource - El recurso clickeado
 */
function handleResourceClick(resource) {
    console.log(`🌲 Clic en recurso tipo: ${resource.resourceType}`);
    
    const dist = Math.abs(resource.x - gameState.player.x) + Math.abs(resource.y - gameState.player.y);

    // Los recursos se pueden recolectar desde distancia adyacente (dist <= 1)
    if (dist <= 1) {
        console.log(`🪓 Interactuando directamente con recurso adyacente`);

        // Actualizar la dirección del jugador para mirar hacia el recurso
        if (dist > 0) {
            updatePlayerFacingTowardsTarget(resource.x, resource.y);
        }

        // Importar y usar la función de recolección
        import('../systems/ResourceGathering.js').then(({ attemptGathering }) => {
            const success = attemptGathering(resource);
            if (!success) {
                console.log(`❌ No se pudo recolectar el recurso`);
            }
        });

        return; // Salir sin iniciar movimiento automático
    } else {
        // Si no está adyacente, establecer objetivo de movimiento
        console.log(`🚶 Moviéndose hacia recurso para recolectar`);
        setAutoMoveTarget(resource.x, resource.y, 'resource', resource);
        addChatMessage('system', `🎯 Moviendo hacia recurso para recolectar`);
    }
}

/**
 * Manejar clic en bot
 * @param {Object} bot - El bot clickeado
 */
function handleBotClick(bot) {
    console.log(`🤖 Clic en bot: ${bot.name}`);
    
    // Importar y mostrar la ficha de información del bot
    import('../ui/BotInfoCard.js').then(({ showBotInfoCard }) => {
        showBotInfoCard(bot);
    });
}

/**
 * Manejar clic en portal
 * @param {Object} portal - El portal clickeado
 */
function handlePortalClick(portal) {
    const dist = Math.abs(portal.x - gameState.player.x) + Math.abs(portal.y - gameState.player.y);

    // Si está en la posición del jugador (distancia = 0), usar directamente
    if (dist === 0) {
        console.log(`🌀 Usando portal directamente`);

        // Importar y usar la función de cambio de mapa
        import('./Game.js').then(({ changeMap }) => {
            changeMap(portal.targetMap, portal.targetX, portal.targetY);
        });

        return; // Salir sin iniciar movimiento automático
    }
    
    // Si no está en la posición, establecer objetivo de movimiento
    console.log(`🚶 Moviéndose hacia portal para teletransportarse`);
    setAutoMoveTarget(portal.x, portal.y, 'portal', portal);
    addChatMessage('system', `🎯 Moviendo hacia portal para teletransportarse`);
}

/**
 * Manejar clic en enemigo
 * @param {Object} enemy - El enemigo clickeado
 */
function handleEnemyClick(enemy) {
    // Los fantasmas no pueden atacar
    if (gameState.player.isGhost) {
        addChatMessage('system', '👻 Como fantasma no puedes atacar.');
        return;
    }
    
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
    // Si el objeto es un portal, usar el handler específico de portales
    if (obj.type === 'portal') {
        handlePortalClick(obj);
        return;
    }
    
    // Si el jugador es un fantasma, solo permitir movimiento (no recoger objetos)
    if (gameState.player.isGhost) {
        console.log(`👻 Fantasma moviéndose hacia objeto (sin recogerlo)`);
        setAutoMoveTarget(obj.x, obj.y, 'position', null); // Usar 'position' en lugar de 'object'
        addChatMessage('system', `🎯 Moviendo hacia posición (${obj.x}, ${obj.y})`);
        return;
    }
    
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
    } else {
        // Si no está adyacente, establecer objetivo de movimiento
        console.log(`🚶 Moviéndose hacia objeto para interactuar`);
        setAutoMoveTarget(obj.x, obj.y, 'object', obj);
        addChatMessage('system', `🎯 Moviendo hacia objeto para interactuar`);
    }
}

/**
 * Manejar clic en jugador online (PvP)
 * @param {Object} player - El jugador online clickeado
 * @param {string} socketId - Socket ID del jugador
 */
function handleOnlinePlayerClick(player, socketId) {
    console.log(`👤 Clic en jugador online: ${player.username} (${socketId})`);
    
    // Los fantasmas no pueden atacar
    if (gameState.player.isGhost) {
        addChatMessage('system', '👻 Como fantasma no puedes atacar.');
        return;
    }

    // No puedes atacar a fantasmas
    if (player.isGhost || !player.isAlive) {
        addChatMessage('system', '❌ No puedes atacar a un fantasma.');
        return;
    }
    
    const playerX = Math.round(player.x);
    const playerY = Math.round(player.y);
    const dist = Math.abs(playerX - gameState.player.x) + Math.abs(playerY - gameState.player.y);

    // Si está adyacente (distancia = 1), atacar directamente
    if (dist === 1) {
        console.log(`⚔️ Atacando directamente a jugador online adyacente`);

        // Actualizar la dirección del jugador para mirar hacia el objetivo
        updatePlayerFacingTowardsTarget(playerX, playerY);

        // Importar y ejecutar la función de ataque PvP
        import('../systems/Combat.js').then(({ attackPlayer }) => {
            attackPlayer(socketId, player);
        });

        return; // Salir sin iniciar movimiento automático
    } else {
        // Si no está adyacente, moverse hacia el jugador
        console.log(`🚶 Moviéndose hacia jugador online para atacar`);
        setAutoMoveTarget(playerX, playerY, 'onlinePlayer', { player, socketId });
        addChatMessage('system', `🎯 Objetivo: Jugador ${player.username}`);
    }
}

/**
 * Manejar clic en NPC sincronizado del servidor
 * @param {Object} npc - El NPC sincronizado clickeado
 * @param {string} instanceId - Instance ID del NPC
 */
function handleSyncedNPCClick(npc, instanceId) {
    console.log(`🎭 Clic en NPC sincronizado: ${npc.name} (${instanceId})`);
    
    // Los fantasmas no pueden atacar
    if (gameState.player.isGhost) {
        addChatMessage('system', '👻 Como fantasma no puedes atacar.');
        return;
    }

    // No atacar NPCs muertos
    if (!npc.isAlive) {
        addChatMessage('system', '❌ Este NPC ya está muerto.');
        return;
    }

    // Verificar si el NPC es hostil (atacable)
    if (npc.behavior && !npc.behavior.attackable) {
        addChatMessage('system', '❌ Este NPC no puede ser atacado.');
        return;
    }
    
    const dist = Math.abs(npc.x - gameState.player.x) + Math.abs(npc.y - gameState.player.y);

    // Verificar si el jugador tiene arco y flechas equipadas para atacar a distancia
    import('../systems/Inventory.js').then(({ hasRangedWeaponEquipped, hasAmmunitionEquipped }) => {
        if (hasRangedWeaponEquipped() && hasAmmunitionEquipped()) {
            console.log(`🏹 Atacando NPC a distancia con arco`);

            // Si el NPC no está en la dirección a la que mira el jugador, girar primero
            if (!isPlayerFacingTarget(npc.x, npc.y)) {
                updatePlayerFacingTowardsTarget(npc.x, npc.y);
            }

            // Atacar al NPC a distancia
            import('../api/SocketClient.js').then(({ default: socketClient }) => {
                socketClient.attackNPC(instanceId, 'ranged', {
                    x: gameState.player.x,
                    y: gameState.player.y
                });
                
                import('./Renderer.js').then(({ setPlayerAnimationState }) => {
                    setPlayerAnimationState('attacking');
                });
            });

            return;
        } else {
            // Si está adyacente (distancia = 1), atacar cuerpo a cuerpo directamente
            if (dist === 1) {
                console.log(`⚔️ Atacando directamente a NPC adyacente cuerpo a cuerpo`);

                // Actualizar la dirección del jugador para mirar hacia el NPC
                updatePlayerFacingTowardsTarget(npc.x, npc.y);

                // Atacar al NPC
                import('../api/SocketClient.js').then(({ default: socketClient }) => {
                    socketClient.attackNPC(instanceId, 'melee', {
                        x: gameState.player.x,
                        y: gameState.player.y
                    });
                    
                    import('./Renderer.js').then(({ setPlayerAnimationState }) => {
                        setPlayerAnimationState('attacking');
                    });
                });

                return;
            } else {
                // Si no está adyacente, moverse hacia el NPC
                console.log(`🚶 Moviéndose hacia NPC para atacar`);
                setAutoMoveTarget(npc.x, npc.y, 'syncedNPC', { npc, instanceId });
                addChatMessage('system', `🎯 Objetivo: ${npc.name}`);
            }
        }
    });
}
