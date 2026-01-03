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
            // Importar y usar la función de cambio de mapa
            import('../core/Game.js').then(({ changeMap }) => {
                changeMap(obj.targetMap, obj.targetX, obj.targetY);
            });
        }

        // Actualizar UI
        import('../ui/UI.js').then(({ updateUI }) => {
            updateUI();
        });
    }
}
