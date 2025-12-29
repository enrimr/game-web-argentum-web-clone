/**
 * UI.js
 * Sistema de interfaz de usuario
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';
import { toggleEquipItem } from '../systems/Inventory.js';
// Note: We import the Inventory module dynamically when needed to avoid circular dependencies

const { MAX_INVENTORY_SLOTS } = CONFIG;

/**
 * Update all UI elements
 */
export function updateUI() {
    updatePlayerStats();
    updateInventory();
    updateCurrentMap();
    updateMinimap();
}

/**
 * Update player stats display
 */
function updatePlayerStats() {
    document.getElementById('hp').textContent = gameState.player.hp;
    document.getElementById('hpMax').textContent = gameState.player.maxHp;
    document.getElementById('mana').textContent = gameState.player.mana;
    document.getElementById('manaMax').textContent = gameState.player.maxMana;
    document.getElementById('gold').textContent = gameState.player.gold;

    // Update level and experience
    const levelEl = document.getElementById('level');
    const expEl = document.getElementById('exp');
    const expBarEl = document.getElementById('expBar');

    if (levelEl) {
        levelEl.textContent = gameState.player.level;
    }
    if (expEl) {
        expEl.textContent = `${gameState.player.exp}/${gameState.player.expToNextLevel}`;
    }
    if (expBarEl) {
        const expPercent = (gameState.player.exp / gameState.player.expToNextLevel) * 100;
        expBarEl.style.width = expPercent + '%';
    }

    // Update player position
    const playerPosEl = document.getElementById('playerPos');
    if (playerPosEl) {
        playerPosEl.textContent = `${gameState.player.x},${gameState.player.y}`;
    }

    // Update character stats
    const enemiesKilledEl = document.getElementById('enemiesKilled');
    const chestsOpenedEl = document.getElementById('chestsOpened');

    if (enemiesKilledEl) {
        enemiesKilledEl.textContent = gameState.stats.enemiesKilled;
    }
    if (chestsOpenedEl) {
        chestsOpenedEl.textContent = gameState.stats.chestsOpened;
    }
}

/**
 * Update inventory UI (AO style) - Show total quantity per item type
 */
function updateInventory() {
    for (let i = 0; i < MAX_INVENTORY_SLOTS; i++) {
        const slotEl = document.querySelector(`.item-slot:nth-child(${i + 1})`);
        if (!slotEl) continue;

        const item = gameState.player.inventory[i];

        // Remove previous classes
        slotEl.classList.remove('empty', 'equipped');

        if (item) {
            slotEl.textContent = item.icon;

            // Calculate total quantity of this item type in inventory
            let totalQuantity = 0;
            for (const invItem of gameState.player.inventory) {
                if (invItem.type === item.type) {
                    totalQuantity += invItem.quantity;
                }
            }

            // Always show total quantity for this item type
            const quantityEl = document.createElement('span');
            quantityEl.className = 'item-quantity';
            quantityEl.textContent = totalQuantity;
            slotEl.appendChild(quantityEl);

            // Check if this item is equipped
            const isWeaponEquipped = gameState.player.equipped.weapon === item.type;
            const isShieldEquipped = gameState.player.equipped.shield === item.type;

            if (isWeaponEquipped || isShieldEquipped) {
                slotEl.classList.add('equipped');
            }

            // Update title for tooltips
            const equipStatus = (isWeaponEquipped || isShieldEquipped) ? ' [EQUIPADO]' : '';
            slotEl.title = `${item.name} (${totalQuantity} total)${equipStatus}`;
        } else {
            slotEl.textContent = '-';
            slotEl.classList.add('empty');
            slotEl.title = 'Espacio vacío';
        }
    }
}

/**
 * Update current map display
 */
function updateCurrentMap() {
    const currentMapEl = document.getElementById('currentMap');
    const currentMapIdEl = document.getElementById('currentMapId');
    const mapNames = {
        'field': '🏞️ Campo',
        'city': '🏘️ Ciudad',
        'dungeon': '🏰 Mazmorra'
    };

    if (currentMapEl) {
        currentMapEl.textContent = mapNames[gameState.currentMap] || '🏞️ Campo';
    }

    if (currentMapIdEl) {
        currentMapIdEl.textContent = gameState.currentMap;
    }
}

/**
 * Update minimap if visible
 */
function updateMinimap() {
    // This will be handled by the Minimap module
}

/**
 * Initialize UI event listeners
 */
export function initUI() {
    // Create context menu for inventory
    const contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    contextMenu.className = 'context-menu';
    document.body.appendChild(contextMenu);

    // Add click listeners to inventory slots
    for (let i = 0; i < MAX_INVENTORY_SLOTS; i++) {
        const slotEl = document.querySelector(`.item-slot:nth-child(${i + 1})`);
        if (slotEl) {
            // Left click to equip/use
            slotEl.addEventListener('click', () => toggleEquipItem(i));
            
            // Right click to open context menu
            slotEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const item = gameState.player.inventory[i];
                if (!item) return; // No menu for empty slots
                
                showContextMenu(e, i, item);
            });
        }
    }

    // Close context menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            hideContextMenu();
        }
    });
}

/**
 * Show context menu for inventory item
 * @param {Event} e - Mouse event
 * @param {number} slotIndex - Inventory slot index
 * @param {Object} item - Item data
 */
function showContextMenu(e, slotIndex, item) {
    const contextMenu = document.getElementById('context-menu');
    if (!contextMenu) return;

    // Clear previous items
    contextMenu.innerHTML = '';

    // Add actions based on item type
    const itemDef = ITEM_TYPES[item.type];
    
    // Use/Equip option
    const useOption = document.createElement('div');
    useOption.className = 'context-menu-item';
    
    if (itemDef.type === 'weapon' || itemDef.type === 'armor') {
        const isEquipped = gameState.player.equipped.weapon === item.type || 
                          gameState.player.equipped.shield === item.type;
        
        useOption.innerHTML = isEquipped ? 
            '<span class="icon">📤</span> Desequipar' : 
            '<span class="icon">⚔️</span> Equipar';
    } else {
        useOption.innerHTML = '<span class="icon">✨</span> Usar';
    }
    
    useOption.addEventListener('click', () => {
        toggleEquipItem(slotIndex);
        hideContextMenu();
    });
    
    contextMenu.appendChild(useOption);
    
    // Drop option
    const dropOption = document.createElement('div');
    dropOption.className = 'context-menu-item';
    dropOption.innerHTML = '<span class="icon">🗑️</span> Tirar al suelo';
    dropOption.addEventListener('click', () => {
        if (item.quantity > 1) {
            showQuantityPrompt(slotIndex, item);
        } else {
            // Import dropItem dynamically to avoid circular dependencies
            import('../systems/Inventory.js').then(({ dropItem }) => {
                dropItem(slotIndex);
            });
        }
        hideContextMenu();
    });
    
    contextMenu.appendChild(dropOption);

    // Position and show menu
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.display = 'block';
}

/**
 * Hide context menu
 */
function hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

/**
 * Show prompt for quantity selection
 * @param {number} slotIndex - Inventory slot index
 * @param {Object} item - Item data
 */
function showQuantityPrompt(slotIndex, item) {
    // Create modal elements if they don't exist
    let modal = document.getElementById('quantity-modal');
    let backdrop = document.getElementById('modal-backdrop');
    
    if (!modal) {
        backdrop = document.createElement('div');
        backdrop.id = 'modal-backdrop';
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);
        
        modal = document.createElement('div');
        modal.id = 'quantity-modal';
        modal.className = 'quantity-modal';
        modal.innerHTML = `
            <h3 class="quantity-modal-title">¿Cuántos items quieres tirar?</h3>
            <div class="quantity-modal-input">
                <input type="number" id="quantity-input" min="1" value="1">
            </div>
            <div class="quantity-modal-buttons">
                <button class="quantity-modal-btn cancel">Cancelar</button>
                <button class="quantity-modal-btn confirm">Confirmar</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        const cancelBtn = modal.querySelector('.cancel');
        cancelBtn.addEventListener('click', hideQuantityPrompt);
        
        backdrop.addEventListener('click', hideQuantityPrompt);
    }
    
    // Set up the quantity input
    const quantityInput = document.getElementById('quantity-input');
    quantityInput.max = item.quantity;
    quantityInput.value = 1;
    
    // Set up confirm button
    const confirmBtn = modal.querySelector('.confirm');
    confirmBtn.onclick = null; // Remove previous listeners
    confirmBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        if (quantity > 0 && quantity <= item.quantity) {
            // Import dropItem dynamically to avoid circular dependencies
            import('../systems/Inventory.js').then(({ dropItem }) => {
                dropItem(slotIndex, quantity);
                hideQuantityPrompt();
            });
        }
    });
    
    // Show the modal
    backdrop.style.display = 'block';
    modal.style.display = 'flex';
}

/**
 * Hide quantity prompt
 */
function hideQuantityPrompt() {
    const modal = document.getElementById('quantity-modal');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
}

/**
 * Add message to chat
 * @param {string} type - Message type ('system', 'player', or 'npc')
 * @param {string} message - Message content
 */
export function addChatMessage(type, message) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;

    let prefix = 'Sistema';
    if (type === 'player') prefix = 'Jugador';
    else if (type === 'npc') prefix = 'NPC';

    const p = document.createElement('p');
    p.innerHTML = `<span class="${type}">${prefix}:</span> ${message}`;
    chatLog.appendChild(p);
    chatLog.scrollTop = chatLog.scrollHeight;
}
