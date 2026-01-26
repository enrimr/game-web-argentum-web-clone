/**
 * ObjectInteraction.js
 * Sistema de interacción con objetos del mundo
 */

import { gameState } from '../state.js';
import { addChatMessage } from '../ui/UI.js';

/**
 * Manejar interacción con objeto
 * @param {Object} obj - Objeto a interactuar
 */
export function handleObjectInteraction(obj) {
    const px = gameState.player.x;
    const py = gameState.player.y;

    // Permitir interacción con recursos desde distancia adyacente
    const isAdjacent = Math.abs(obj.x - px) <= 1 && Math.abs(obj.y - py) <= 1;
    const isOnSamePosition = obj.x === px && obj.y === py;
    
    // Recursos recolectables pueden ser interactuados desde distancia adyacente
    if (obj.type === 'resource' && isAdjacent) {
        handleResourceGathering(obj);
        return;
    }

    // Solo procesar otros objetos si está en la posición del jugador
    if (obj.x === px && obj.y === py) {
        if (obj.type === 'chest' && !obj.opened) {
            // Solo jugadores vivos pueden abrir cofres
            if (gameState.player.isGhost) {
                addChatMessage('system', '👻 Como fantasma no puedes abrir cofres.');
                return;
            }
            obj.opened = true;
            gameState.player.gold += obj.contains.gold;
            gameState.stats.chestsOpened++;
            addChatMessage('system', `¡Has abierto un cofre y encontrado ${obj.contains.gold} de oro!`);
            gameState.objects.splice(gameState.objects.indexOf(obj), 1);
        } else if (obj.type === 'gold') {
            // Solo jugadores vivos pueden recoger oro
            if (gameState.player.isGhost) {
                addChatMessage('system', '👻 Como fantasma no puedes recoger oro.');
                return;
            }
            gameState.player.gold += obj.amount;
            addChatMessage('system', `¡Has recogido ${obj.amount} de oro!`);
            gameState.objects.splice(gameState.objects.indexOf(obj), 1);
        } else if (obj.type === 'item') {
            // Solo jugadores vivos pueden recoger items
            if (gameState.player.isGhost) {
                addChatMessage('system', '👻 Como fantasma no puedes recoger items.');
                return;
            }
            // Importar y usar la función de inventario
            import('../systems/Inventory.js').then(({ addItemToInventory }) => {
                import('../systems/ItemTypes.js').then(({ ITEM_TYPES }) => {
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
            // Tanto vivos como fantasmas pueden usar portales
            // Importar y usar la función de cambio de mapa
            import('../core/Game.js').then(({ changeMap }) => {
                changeMap(obj.targetMap, obj.targetX, obj.targetY);
            });
        } else if (obj.type === 'dropped_item') {
            // Objetos caídos - cualquier jugador puede recogerlos
            // (No restringir solo a fantasmas, permitir que cualquiera los recoja)
            pickUpDroppedItem(obj);
        }

        // Actualizar UI
        import('../ui/UI.js').then(({ updateUI }) => {
            updateUI();
        });
    }
}

/**
 * Manejar recolección de recursos
 * @param {Object} obj - Objeto de recurso a recolectar
 */
function handleResourceGathering(obj) {
    // Importar el sistema de recolección
    import('../systems/ResourceGathering.js').then(({ attemptGathering }) => {
        attemptGathering(obj);
    });
}

/**
 * Recoger un objeto caído del suelo
 * @param {Object} obj - Objeto visual en gameState.objects
 */
function pickUpDroppedItem(obj) {
    const droppedItem = obj.droppedItem;
    
    // Verificar que el objeto existe
    if (!droppedItem) {
        console.error('pickUpDroppedItem: No droppedItem reference');
        return;
    }

    // Recoger el objeto
    import('../systems/Inventory.js').then(({ addItemToInventory }) => {
        import('../systems/ItemTypes.js').then(({ ITEM_TYPES }) => {
            const itemDef = ITEM_TYPES[droppedItem.type];
            if (!itemDef) {
                console.error(`pickUpDroppedItem: Item type not found: ${droppedItem.type}`);
                return;
            }

            if (droppedItem.equippedSlot) {
                // Era un objeto equipado - añadir al slot correspondiente
                gameState.player.equipped[droppedItem.equippedSlot] = droppedItem.type;
                addChatMessage('system', `⚔️ ¡Recogiste ${itemDef.name}!`);
            } else {
                // Era un objeto de inventario - añadir al inventario
                const success = addItemToInventory(droppedItem.type, droppedItem.quantity);
                if (success) {
                    addChatMessage('system', `📦 ¡Recogiste ${droppedItem.quantity}x ${itemDef.name}!`);
                } else {
                    addChatMessage('system', '❌ ¡Inventario lleno! No puedes recoger el objeto.');
                    return; // No hacer nada si no se pudo recoger
                }
            }

            // Eliminar el item del suelo - solo el jugador que lo recoge se lo queda
            // Remover el objeto del suelo (gameState.objects)
            const objIndex = gameState.objects.indexOf(obj);
            if (objIndex !== -1) {
                gameState.objects.splice(objIndex, 1);
            }

            // Remover de la lista de items dropeados persistentes
            const droppedIndex = gameState.droppedItems.indexOf(droppedItem);
            if (droppedIndex !== -1) {
                gameState.droppedItems.splice(droppedIndex, 1);
            }

            // Actualizar UI
            import('../ui/UI.js').then(({ updateUI }) => {
                updateUI();
            });
        });
    });
}
