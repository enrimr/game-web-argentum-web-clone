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

    // Solo procesar si el objeto está en la posición del jugador
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
            // Objetos caídos - solo fantasmas pueden recogerlos
            if (!gameState.player.isGhost) {
                addChatMessage('system', 'Solo los fantasmas pueden recoger objetos caídos.');
                return;
            }

            // Recoger objeto caído
            pickUpDroppedItem(obj);
        }

        // Actualizar UI
        import('../ui/UI.js').then(({ updateUI }) => {
            updateUI();
        });
    }
}

/**
 * Recoger un objeto caído del suelo
 * @param {Object} droppedItem - Objeto caído a recoger
 */
function pickUpDroppedItem(droppedItem) {
    // Verificar que el objeto pertenece al jugador fantasma
    if (!droppedItem.droppedByPlayer) {
        addChatMessage('system', 'Este objeto no te pertenece.');
        return;
    }

    // Recoger el objeto
    if (droppedItem.equippedSlot) {
        // Era un objeto equipado - volver a equiparlo
        gameState.player.equipped[droppedItem.equippedSlot] = {
            type: droppedItem.type,
            name: droppedItem.name || droppedItem.type
        };
        addChatMessage('system', `⚔️ ¡Recuperaste tu ${droppedItem.name || droppedItem.type}!`);
    } else {
        // Era un objeto de inventario - añadir al inventario
        import('../systems/Inventory.js').then(({ addItemToInventory }) => {
            const success = addItemToInventory(droppedItem.type, droppedItem.quantity);
            if (success) {
                addChatMessage('system', `📦 ¡Recuperaste ${droppedItem.quantity}x ${droppedItem.name || droppedItem.type}!`);
            } else {
                addChatMessage('system', '❌ ¡Inventario lleno! No puedes recuperar el objeto.');
                return; // No remover el objeto caído si no se pudo recoger
            }
        });
    }

    // Remover el objeto caído del suelo
    gameState.droppedItems.splice(gameState.droppedItems.indexOf(droppedItem), 1);
}
