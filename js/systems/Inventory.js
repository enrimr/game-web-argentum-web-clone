/**
 * Inventory.js
 * Sistema de gestión de inventario (estilo Argentum Online)
 */

import { CONFIG } from '../config.js';
import { gameState } from '../state.js';
import { ITEM_TYPES } from './ItemTypes.js';
import { addChatMessage, updateUI } from '../ui/UI.js';

const { MAX_INVENTORY_SLOTS } = CONFIG;

/**
 * Add item to inventory (AO style stacking)
 * @param {string} itemType - Type of item to add
 * @param {number} quantity - Quantity to add
 * @returns {boolean} True if item was added successfully
 */
export function addItemToInventory(itemType, quantity = 1) {
    const itemDef = ITEM_TYPES[itemType];
    if (!itemDef) return false;

    // Check if item already exists in inventory (for stackable items)
    if (itemDef.stackable) {
        const existingItem = gameState.player.inventory.find(item => item.type === itemType);
        if (existingItem) {
            existingItem.quantity = Math.min(existingItem.quantity + quantity, itemDef.maxStack);
            return true;
        }
    }

    // Check inventory space
    if (gameState.player.inventory.length >= MAX_INVENTORY_SLOTS) {
        return false; // Inventory full
    }

    // Add new item
    gameState.player.inventory.push({
        type: itemType,
        name: itemDef.name,
        quantity: quantity,
        icon: itemDef.icon,
        stackable: itemDef.stackable
    });

    return true;
}

/**
 * Use or equip item (AO style)
 * @param {number} slotIndex - Index of the item in inventory
 */
export function toggleEquipItem(slotIndex) {
    const item = gameState.player.inventory[slotIndex];
    if (!item) return;

    const itemDef = ITEM_TYPES[item.type];
    if (!itemDef) return;

    // Handle consumables (potions, etc.)
    if (itemDef.type === 'consumable') {
        useConsumable(slotIndex);
        return;
    }

    // Handle equipment (weapons, armor)
    if (itemDef.type === 'weapon' || itemDef.type === 'armor') {
        equipItem(slotIndex);
        return;
    }

    // Other item types
    addChatMessage('system', '❌ No puedes usar este item.');
}

/**
 * Use consumable item
 * @param {number} slotIndex - Index of the item in inventory
 */
export function useConsumable(slotIndex) {
    const item = gameState.player.inventory[slotIndex];
    if (!item) return;

    const itemDef = ITEM_TYPES[item.type];
    if (!itemDef || itemDef.type !== 'consumable') return;

    // Apply consumable effect
    switch (itemDef.effect) {
        case 'heal_hp':
            const hpBefore = gameState.player.hp;
            gameState.player.hp = Math.min(gameState.player.hp + itemDef.value, gameState.player.maxHp);
            const hpHealed = gameState.player.hp - hpBefore;
            addChatMessage('system', `💚 Has usado ${item.name}! +${hpHealed} HP`);
            break;

        case 'heal_mana':
            const manaBefore = gameState.player.mana;
            gameState.player.mana = Math.min(gameState.player.mana + itemDef.value, gameState.player.maxMana);
            const manaRestored = gameState.player.mana - manaBefore;
            addChatMessage('system', `💙 Has usado ${item.name}! +${manaRestored} Mana`);
            break;

        case 'cure_poison':
            addChatMessage('system', `💚 Has usado ${item.name}! Veneno curado`);
            // En el futuro: gameState.player.poisoned = false;
            break;

        default:
            addChatMessage('system', `✨ Has usado ${item.name}!`);
    }

    // Consume one item
    item.quantity--;

    // Remove from inventory if quantity reaches 0
    if (item.quantity <= 0) {
        gameState.player.inventory.splice(slotIndex, 1);
    }

    // Update UI after using consumable
    updateUI();
}

/**
 * Equip/unequip weapon or armor
 * @param {number} slotIndex - Index of the item in inventory
 */
export function equipItem(slotIndex) {
    const item = gameState.player.inventory[slotIndex];
    if (!item) return;

    const itemDef = ITEM_TYPES[item.type];
    if (!itemDef) return;

    // Determine equipment slot
    const equipSlot = itemDef.slot;
    if (!equipSlot) {
        addChatMessage('system', '❌ Este item no se puede equipar.');
        return;
    }

    // Check if already equipped
    const currentlyEquipped = gameState.player.equipped[equipSlot];

    if (currentlyEquipped === item.type) {
        // Unequip
        gameState.player.equipped[equipSlot] = null;
        addChatMessage('system', `📤 Has desequipado: ${item.name}`);
    } else {
        // Equip (replace if something else was equipped)
        if (currentlyEquipped) {
            const oldItemDef = ITEM_TYPES[currentlyEquipped];
            addChatMessage('system', `📤 ${oldItemDef.name} reemplazado por ${item.name}`);
        } else {
            addChatMessage('system', `⚔️ Has equipado: ${item.name}`);
        }
        gameState.player.equipped[equipSlot] = item.type;
    }

    // Update UI after equipping/unequipping
    updateUI();
}

/**
 * Get total quantity of an item type in inventory
 * @param {string} itemType - Type of item to count
 * @returns {number} Total quantity of the item type
 */
export function getItemQuantity(itemType) {
    let total = 0;
    for (const item of gameState.player.inventory) {
        if (item.type === itemType) {
            total += item.quantity;
        }
    }
    return total;
}

/**
 * Check if player has ammunition equipped
 * @returns {boolean} True if ammunition is equipped
 */
export function hasAmmunitionEquipped() {
    return gameState.player.equipped.ammunition !== null;
}

/**
 * Check if player has a ranged weapon equipped
 * @returns {boolean} True if ranged weapon is equipped
 */
export function hasRangedWeaponEquipped() {
    const weapon = gameState.player.equipped.weapon;
    if (!weapon) return false;

    const weaponDef = ITEM_TYPES[weapon];
    return weaponDef && weaponDef.ranged;
}

/**
 * Get equipped weapon damage bonus
 * @returns {number} Damage bonus from equipped weapon
 */
export function getEquippedWeaponDamage() {
    const weapon = gameState.player.equipped.weapon;
    if (!weapon) return CONFIG.PLAYER.BASE_DAMAGE_MIN; // Base damage

    const weaponDef = ITEM_TYPES[weapon];
    return weaponDef ? weaponDef.damage : CONFIG.PLAYER.BASE_DAMAGE_MIN;
}

/**
 * Get equipped armor defense bonus
 * @returns {number} Defense bonus from equipped armor
 */
export function getEquippedArmorDefense() {
    const shield = gameState.player.equipped.shield;
    if (!shield) return 0;

    const shieldDef = ITEM_TYPES[shield];
    return shieldDef ? shieldDef.defense : 0;
}
