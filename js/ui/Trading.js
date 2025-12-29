/**
 * Trading.js
 * Sistema de comercio con NPCs
 */

import { gameState } from '../state.js';
import { addItemToInventory, dropItem } from '../systems/Inventory.js';
import { addChatMessage, updateUI } from './UI.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';

let tradeContainer = null;
let currentMerchant = null;
let tradeMode = 'buy'; // 'buy' or 'sell'

/**
 * Inicializar sistema de comercio
 */
export function initTrading() {
    // Crear contenedor de comercio
    tradeContainer = document.createElement('div');
    tradeContainer.id = 'trade-container';
    tradeContainer.className = 'trade-container';
    tradeContainer.style.display = 'none';

    // Estilos del comercio
    tradeContainer.innerHTML = `
        <div class="trade-box">
            <div class="trade-header">
                <h2 class="trade-title">Comercio</h2>
                <div class="trade-tabs">
                    <button class="trade-tab buy active" data-mode="buy">Comprar</button>
                    <button class="trade-tab sell" data-mode="sell">Vender</button>
                </div>
            </div>
            <div class="trade-content">
                <div class="trade-list"></div>
                <div class="trade-info">
                    <div class="trade-item-details">
                        <h3 class="item-name">-</h3>
                        <p class="item-description">Selecciona un item para ver detalles</p>
                        <div class="item-price">Precio: <span>-</span></div>
                        <div class="item-quantity">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" class="quantity-input" value="1" min="1" max="99">
                            <button class="quantity-btn plus">+</button>
                        </div>
                    </div>
                    <div class="trade-gold">
                        <div>Oro del jugador: <span class="player-gold">0</span></div>
                        <button class="trade-action-btn">Comprar</button>
                    </div>
                </div>
            </div>
            <button class="trade-close">Cerrar (ESC)</button>
        </div>
    `;

    document.body.appendChild(tradeContainer);

    // Event listeners
    addTradeEventListeners();
}

/**
 * Añadir event listeners al sistema de comercio
 */
function addTradeEventListeners() {
    if (!tradeContainer) return;

    // Cambio de pestaña (comprar/vender)
    const tabs = tradeContainer.querySelectorAll('.trade-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tradeMode = tab.dataset.mode;
            updateTradeItems();
            updateTradeAction();
        });
    });

    // Cerrar comercio
    tradeContainer.querySelector('.trade-close').addEventListener('click', closeTrade);

    // Botones de cantidad
    tradeContainer.querySelector('.quantity-btn.minus').addEventListener('click', () => {
        const input = tradeContainer.querySelector('.quantity-input');
        input.value = Math.max(1, parseInt(input.value) - 1);
        updateTotalPrice();
    });

    tradeContainer.querySelector('.quantity-btn.plus').addEventListener('click', () => {
        const input = tradeContainer.querySelector('.quantity-input');
        const selectedItemEl = tradeContainer.querySelector('.trade-item.selected');
        
        if (selectedItemEl) {
            const maxQuantity = parseInt(selectedItemEl.dataset.maxQuantity || 99);
            input.value = Math.min(maxQuantity, parseInt(input.value) + 1);
            updateTotalPrice();
        }
    });

    // Input de cantidad
    tradeContainer.querySelector('.quantity-input').addEventListener('change', (e) => {
        const selectedItemEl = tradeContainer.querySelector('.trade-item.selected');
        if (selectedItemEl) {
            const maxQuantity = parseInt(selectedItemEl.dataset.maxQuantity || 99);
            e.target.value = Math.min(maxQuantity, Math.max(1, parseInt(e.target.value)));
            updateTotalPrice();
        }
    });

    // Botón de acción (comprar/vender)
    tradeContainer.querySelector('.trade-action-btn').addEventListener('click', executeTrade);

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tradeContainer.style.display !== 'none') {
            closeTrade();
        }
    });
}

/**
 * Mostrar interfaz de comercio con un NPC
 * @param {Object} npc - NPC mercader
 */
export function openTrade(npc) {
    if (!tradeContainer) return;
    
    currentMerchant = npc;
    tradeMode = 'buy';
    
    // Activar pestaña de compra
    tradeContainer.querySelectorAll('.trade-tab').forEach(tab => {
        tab.classList[tab.dataset.mode === 'buy' ? 'add' : 'remove']('active');
    });

    // Actualizar título con nombre del mercader
    tradeContainer.querySelector('.trade-title').textContent = `Comercio con ${npc.name}`;
    
    // Actualizar oro del jugador
    tradeContainer.querySelector('.player-gold').textContent = gameState.player.gold;
    
    // Mostrar items del mercader
    updateTradeItems();
    
    // Actualizar botón de acción
    updateTradeAction();
    
    // Mostrar contenedor
    tradeContainer.style.display = 'flex';
}

/**
 * Cerrar interfaz de comercio
 */
export function closeTrade() {
    if (!tradeContainer) return;
    
    tradeContainer.style.display = 'none';
    currentMerchant = null;
}

/**
 * Actualizar lista de items según modo (compra/venta)
 */
function updateTradeItems() {
    if (!tradeContainer || !currentMerchant) return;
    
    const listEl = tradeContainer.querySelector('.trade-list');
    listEl.innerHTML = '';
    
    if (tradeMode === 'buy') {
        // Mostrar items del mercader
        currentMerchant.inventory.forEach((item, index) => {
            const itemDef = ITEM_TYPES[item.itemType];
            if (!itemDef) return;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'trade-item';
            itemEl.dataset.index = index;
            itemEl.dataset.itemType = item.itemType;
            itemEl.dataset.price = item.price;
            itemEl.dataset.maxQuantity = item.quantity;
            
            itemEl.innerHTML = `
                <div class="item-icon">${itemDef.icon || '📦'}</div>
                <div class="item-details">
                    <div class="item-name">${itemDef.name}</div>
                    <div class="item-price">${item.price} oro</div>
                </div>
                <div class="item-stock">Stock: ${item.quantity}</div>
            `;
            
            itemEl.addEventListener('click', () => selectTradeItem(itemEl));
            listEl.appendChild(itemEl);
        });
    } else {
        // Mostrar items del jugador que se pueden vender
        gameState.player.inventory.forEach((item, index) => {
            const itemDef = ITEM_TYPES[item.type];
            if (!itemDef) return;
            
            // Calcular precio de venta (50% del precio de compra)
            // Buscar si el mercader vende este tipo de item
            const merchantItem = currentMerchant.inventory.find(i => i.itemType === item.type);
            if (!merchantItem) return; // El mercader no compra este item
            
            const sellPrice = Math.floor(merchantItem.price * 0.5);
            
            const itemEl = document.createElement('div');
            itemEl.className = 'trade-item';
            itemEl.dataset.index = index;
            itemEl.dataset.itemType = item.type;
            itemEl.dataset.price = sellPrice;
            itemEl.dataset.maxQuantity = item.quantity;
            
            itemEl.innerHTML = `
                <div class="item-icon">${itemDef.icon || '📦'}</div>
                <div class="item-details">
                    <div class="item-name">${itemDef.name}</div>
                    <div class="item-price">${sellPrice} oro</div>
                </div>
                <div class="item-stock">Tienes: ${item.quantity}</div>
            `;
            
            itemEl.addEventListener('click', () => selectTradeItem(itemEl));
            listEl.appendChild(itemEl);
        });
    }
    
    // Reset selection
    resetItemSelection();
}

/**
 * Seleccionar un item para comerciar
 * @param {HTMLElement} itemEl - Elemento del item seleccionado
 */
function selectTradeItem(itemEl) {
    // Deselect all items
    tradeContainer.querySelectorAll('.trade-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select this item
    itemEl.classList.add('selected');
    
    // Update item details
    const itemType = itemEl.dataset.itemType;
    const itemDef = ITEM_TYPES[itemType];
    const price = parseInt(itemEl.dataset.price);
    const maxQuantity = parseInt(itemEl.dataset.maxQuantity);
    
    tradeContainer.querySelector('.item-name').textContent = itemDef.name;
    tradeContainer.querySelector('.item-description').textContent = itemDef.description || 'Sin descripción disponible';
    tradeContainer.querySelector('.item-price span').textContent = `${price} oro`;
    
    // Reset quantity input
    const quantityInput = tradeContainer.querySelector('.quantity-input');
    quantityInput.value = 1;
    quantityInput.max = maxQuantity;
    
    // Enable action button
    const actionBtn = tradeContainer.querySelector('.trade-action-btn');
    actionBtn.disabled = false;
    
    // Update total price
    updateTotalPrice();
}

/**
 * Resetear selección de item
 */
function resetItemSelection() {
    tradeContainer.querySelectorAll('.trade-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    tradeContainer.querySelector('.item-name').textContent = '-';
    tradeContainer.querySelector('.item-description').textContent = 'Selecciona un item para ver detalles';
    tradeContainer.querySelector('.item-price span').textContent = '-';
    
    const quantityInput = tradeContainer.querySelector('.quantity-input');
    quantityInput.value = 1;
    quantityInput.max = 99;
    
    // Disable action button
    const actionBtn = tradeContainer.querySelector('.trade-action-btn');
    actionBtn.disabled = true;
}

/**
 * Actualizar precio total según cantidad
 */
function updateTotalPrice() {
    const selectedItemEl = tradeContainer.querySelector('.trade-item.selected');
    if (!selectedItemEl) return;
    
    const price = parseInt(selectedItemEl.dataset.price);
    const quantity = parseInt(tradeContainer.querySelector('.quantity-input').value);
    const totalPrice = price * quantity;
    
    tradeContainer.querySelector('.item-price span').textContent = `${totalPrice} oro (${price} x ${quantity})`;
}

/**
 * Actualizar texto del botón de acción según modo
 */
function updateTradeAction() {
    const actionBtn = tradeContainer.querySelector('.trade-action-btn');
    if (tradeMode === 'buy') {
        actionBtn.textContent = 'Comprar';
    } else {
        actionBtn.textContent = 'Vender';
    }
    actionBtn.disabled = true;
}

/**
 * Ejecutar transacción de compra o venta
 */
function executeTrade() {
    if (!currentMerchant) return;
    
    const selectedItemEl = tradeContainer.querySelector('.trade-item.selected');
    if (!selectedItemEl) return;
    
    const itemType = selectedItemEl.dataset.itemType;
    const index = parseInt(selectedItemEl.dataset.index);
    const quantity = parseInt(tradeContainer.querySelector('.quantity-input').value);
    
    let result;
    
    if (tradeMode === 'buy') {
        // El jugador compra al NPC
        result = currentMerchant.sellItem(itemType, quantity, gameState.player);
        
        if (result.success) {
            // Añadir item al inventario del jugador
            addItemToInventory(itemType, quantity);
            addChatMessage('system', result.message);
            
            // Actualizar oro del jugador
            tradeContainer.querySelector('.player-gold').textContent = gameState.player.gold;
            
            // Actualizar lista de items
            updateTradeItems();
        } else {
            addChatMessage('npc', result.message);
        }
    } else {
        // El jugador vende al NPC
        // Crear un objeto con la información necesaria para la transacción
        const item = gameState.player.inventory[index];
        
        result = currentMerchant.buyItem(itemType, quantity, gameState.player);
        
        if (result.success) {
            // Quitar item del inventario del jugador
            item.quantity -= quantity;
            if (item.quantity <= 0) {
                gameState.player.inventory.splice(index, 1);
            }
            
            addChatMessage('system', result.message);
            
            // Actualizar oro del jugador
            tradeContainer.querySelector('.player-gold').textContent = gameState.player.gold;
            
            // Actualizar lista de items
            updateTradeItems();
        } else {
            addChatMessage('npc', result.message);
        }
    }
    
    // Actualizar UI general
    updateUI();
}

/**
 * Verificar si el comercio está abierto
 * @returns {boolean} True si el comercio está abierto
 */
export function isTradeOpen() {
    return tradeContainer && tradeContainer.style.display !== 'none';
}
