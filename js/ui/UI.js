/**
 * UI.js
 * Sistema de interfaz de usuario
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';
import { toggleEquipItem } from '../systems/Inventory.js';

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
    const mapNames = {
        'field': '🏞️ Campo',
        'city': '🏘️ Ciudad',
        'dungeon': '🏰 Mazmorra'
    };

    if (currentMapEl) {
        currentMapEl.textContent = mapNames[gameState.currentMap] || '🏞️ Campo';
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
    // Add click listeners to inventory slots
    for (let i = 0; i < MAX_INVENTORY_SLOTS; i++) {
        const slotEl = document.querySelector(`.item-slot:nth-child(${i + 1})`);
        if (slotEl) {
            slotEl.addEventListener('click', () => toggleEquipItem(i));
        }
    }
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
