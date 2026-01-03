/**
 * NPC.js
 * Clase NPC (Non-Player Character)
 * Similar a la estructura de NPCs de Argentum Online
 */

import { Character } from './Character.js';
import { NPC_DEFINITIONS } from './NPCTypes.js';

export class NPC extends Character {
    constructor(npcType, x, y) {
        super();
        
        const definition = NPC_DEFINITIONS[npcType];
        if (!definition) {
            console.error(`NPC type ${npcType} not found`);
            return;
        }
        
        this.npcType = npcType;
        this.name = definition.name;
        this.type = definition.type;
        this.sprite = definition.sprite;
        this.x = x;
        this.y = y;
        
        // Dialogue
        this.dialogue = definition.dialogue || {};
        
        // Inventory for merchants
        this.inventory = definition.inventory ? [...definition.inventory] : [];
        
        // Crafting abilities
        this.crafting = definition.crafting || null;
        
        // Services (for bankers, trainers, etc.)
        this.services = definition.services || [];
        
        // Combat stats (for guards)
        if (definition.combat) {
            this.hp = definition.combat.hp;
            this.maxHp = definition.combat.hp;
            this.damage = definition.combat.damage;
            this.defense = definition.combat.defense;
            this.attacksOnCriminal = definition.combat.attacksOnCriminal || false;
        }
        
        // Training (for trainers)
        this.training = definition.training || null;
        
        // Interaction state
        this.interacting = false;
        this.lastInteraction = 0;
    }
    
    /**
     * Interact with the NPC
     */
    interact(player) {
        const now = Date.now();
        if (now - this.lastInteraction < 500) return null; // Prevent spam
        
        this.lastInteraction = now;
        
        // Return dialogue based on NPC type
        return {
            npc: this,
            greeting: this.dialogue.greeting || 'Hola, aventurero.',
            options: this.getInteractionOptions()
        };
    }
    
    /**
     * Get available interaction options
     */
    getInteractionOptions() {
        const options = [];
        
        // Merchants can trade
        if (this.inventory && this.inventory.length > 0) {
            options.push({
                id: 'trade',
                label: 'Comerciar',
                action: 'openTrade'
            });
        }
        
        // NPCs with crafting can craft
        if (this.crafting && this.crafting.canCraft) {
            options.push({
                id: 'craft',
                label: 'Craftear',
                action: 'openCrafting'
            });
        }
        
        // Bankers
        if (this.services.includes('deposit')) {
            options.push({
                id: 'deposit',
                label: 'Depositar Oro',
                action: 'depositGold'
            });
        }
        if (this.services.includes('withdraw')) {
            options.push({
                id: 'withdraw',
                label: 'Retirar Oro',
                action: 'withdrawGold'
            });
        }
        
        // Trainers
        if (this.training) {
            options.push({
                id: 'train',
                label: 'Entrenar',
                action: 'openTraining'
            });
        }
        
        // Healers
        if (this.services && this.services.canHeal) {
            options.push({
                id: 'heal',
                label: 'Curar Heridas',
                action: 'heal'
            });
        }
        
        // Resurrection for ghosts
        if (this.services && this.services.canResurrect) {
            const player = window.gameState.player;
            if (player && player.isGhost) {
                options.push({
                    id: 'resurrect',
                    label: 'Resucitar',
                    action: 'resurrect'
                });
            }
        }
        
        // Always allow saying goodbye
        options.push({
            id: 'farewell',
            label: 'Adiós',
            action: 'closeDialogue'
        });
        
        return options;
    }
    
    /**
     * Trade with player - buy item
     */
    sellItem(itemType, quantity, player) {
        const item = this.inventory.find(i => i.itemType === itemType);
        if (!item) return { success: false, message: 'No tengo ese item.' };
        
        if (item.quantity < quantity) {
            return { success: false, message: 'No tengo suficientes.' };
        }
        
        const totalCost = item.price * quantity;
        if (player.gold < totalCost) {
            return { success: false, message: 'No tienes suficiente oro.' };
        }
        
        // Process transaction
        player.gold -= totalCost;
        item.quantity -= quantity;
        
        // Remove from inventory if depleted
        if (item.quantity <= 0) {
            this.inventory = this.inventory.filter(i => i !== item);
        }
        
        return {
            success: true,
            message: `Has comprado ${quantity}x ${item.itemType} por ${totalCost} oro.`,
            item: itemType,
            quantity: quantity,
            cost: totalCost
        };
    }
    
    /**
     * Trade with player - sell item (player sells to NPC)
     */
    buyItem(itemType, quantity, player) {
        // NPCs buy at 50% of sell price
        const item = this.inventory.find(i => i.itemType === itemType);
        if (!item) {
            return { success: false, message: 'No compro ese tipo de items.' };
        }
        
        const buyPrice = Math.floor(item.price * 0.5);
        const totalValue = buyPrice * quantity;
        
        // Give gold to player
        player.gold += totalValue;
        
        // Add to NPC inventory
        item.quantity += quantity;
        
        return {
            success: true,
            message: `Has vendido ${quantity}x ${itemType} por ${totalValue} oro.`,
            earned: totalValue
        };
    }
    
    /**
     * Craft item for player
     */
    craftItem(recipeIndex, player, playerSkills) {
        if (!this.crafting || !this.crafting.canCraft) {
            return { success: false, message: 'No puedo craftear items.' };
        }
        
        const recipe = this.crafting.recipes[recipeIndex];
        if (!recipe) {
            return { success: false, message: 'Receta no encontrada.' };
        }
        
        // Check skill requirement
        if (recipe.skillRequired) {
            const playerSkill = playerSkills[recipe.skillRequired.skill];
            if (!playerSkill || playerSkill.level < recipe.skillRequired.level) {
                return {
                    success: false,
                    message: `Necesitas nivel ${recipe.skillRequired.level} en ${recipe.skillRequired.skill}.`
                };
            }
        }
        
        // Check materials
        for (const material of recipe.materials) {
            const hasEnough = player.inventory.some(item => 
                item.type === material.itemType && item.quantity >= material.quantity
            );
            
            if (!hasEnough) {
                return {
                    success: false,
                    message: `Te faltan materiales: ${material.quantity}x ${material.itemType}.`
                };
            }
        }
        
        // Check gold
        if (player.gold < recipe.cost) {
            return {
                success: false,
                message: `Necesitas ${recipe.cost} oro para craftear esto.`
            };
        }
        
        // Consume materials and gold
        for (const material of recipe.materials) {
            const item = player.inventory.find(i => i.type === material.itemType);
            item.quantity -= material.quantity;
            if (item.quantity <= 0) {
                player.inventory = player.inventory.filter(i => i !== item);
            }
        }
        player.gold -= recipe.cost;
        
        // Give crafted item
        const resultQuantity = recipe.quantity || 1;
        
        return {
            success: true,
            message: `¡He crafteado ${resultQuantity}x ${recipe.result} para ti!`,
            result: recipe.result,
            quantity: resultQuantity,
            expGained: recipe.expGained || 0
        };
    }
    
    /**
     * Train player skill
     */
    trainSkill(skillName, player) {
        if (!this.training) {
            return { success: false, message: 'No soy un entrenador.' };
        }
        
        if (!this.training.skills.includes(skillName)) {
            return { success: false, message: 'No entreno esa habilidad.' };
        }
        
        const cost = this.training.costPerLevel;
        if (player.gold < cost) {
            return {
                success: false,
                message: `Necesitas ${cost} oro para entrenar.`
            };
        }
        
        player.gold -= cost;
        
        return {
            success: true,
            message: `¡Has entrenado ${skillName}!`,
            skill: skillName,
            cost: cost
        };
    }
    
    /**
     * Heal player's wounds
     */
    healPlayer(player) {
        if (!this.services || !this.services.canHeal) {
            return { success: false, message: 'No puedo curar heridas.' };
        }
        
        // Check if player needs healing
        if (player.hp >= player.maxHp) {
            return { success: false, message: 'No necesitas curación.' };
        }
        
        // Check if player has enough gold
        const healCost = this.services.healCost || 50;
        if (player.gold < healCost) {
            return {
                success: false,
                message: `Necesitas ${healCost} oro para curarte.`
            };
        }
        
        // Apply healing
        player.gold -= healCost;
        player.hp = player.maxHp;
        
        return {
            success: true,
            message: `¡He curado todas tus heridas! (-${healCost} oro)`
        };
    }
    
    /**
     * Resurrect ghost player
     */
    resurrectPlayer(player) {
        if (!this.services || !this.services.canResurrect) {
            return { success: false, message: 'No puedo resucitar.' };
        }
        
        // Check if player is a ghost
        if (!player.isGhost) {
            return { success: false, message: '¡Pero si estás vivo!' };
        }
        
        // Check if player has enough gold
        const resurrectCost = this.services.resurrectCost || 100;
        if (player.gold < resurrectCost) {
            return {
                success: false,
                message: `Necesitas ${resurrectCost} oro para resucitar.`
            };
        }
        
        // Apply resurrection
        player.gold -= resurrectCost;
        player.isGhost = false;
        player.hp = player.maxHp;
        
        // Return any dropped items that haven't been recovered
        const droppedItems = this.recoverDroppedItems(player);
        
        return {
            success: true,
            message: `¡He devuelto tu alma a tu cuerpo! (-${resurrectCost} oro)${
                droppedItems ? `\nRecuperados ${droppedItems} objetos caídos.` : ''
            }`
        };
    }
    
    /**
     * Recover player's dropped items
     * @param {Object} player - Player object
     * @returns {number} Number of recovered items
     */
    recoverDroppedItems(player) {
        // Look for items dropped by this player
        const droppedItems = window.gameState.droppedItems.filter(
            item => item.droppedByPlayer && !item.recovered
        );
        
        if (droppedItems.length === 0) {
            return 0;
        }
        
        let recoveredCount = 0;
        
        // Process each dropped item
        for (const item of droppedItems) {
            // Mark as recovered
            item.recovered = true;
            
            // Handle equipped items
            if (item.equippedSlot) {
                // Re-equip the item if slot is empty
                if (!player.equipped[item.equippedSlot]) {
                    player.equipped[item.equippedSlot] = {
                        type: item.type,
                        name: item.name || item.type
                    };
                    recoveredCount++;
                }
                // Otherwise add to inventory
                else {
                    import('../systems/Inventory.js').then(({ addItemToInventory }) => {
                        const success = addItemToInventory(item.type, 1);
                        if (success) recoveredCount++;
                    });
                }
            }
            // Handle inventory items
            else {
                import('../systems/Inventory.js').then(({ addItemToInventory }) => {
                    const success = addItemToInventory(item.type, item.quantity);
                    if (success) recoveredCount++;
                });
            }
        }
        
        // Clean up recovered items
        window.gameState.droppedItems = window.gameState.droppedItems.filter(
            item => !item.recovered
        );
        
        return recoveredCount;
    }
    
    /**
     * Check if NPC can move to position (collision detection)
     * @param {number} x - Target X coordinate
     * @param {number} y - Target Y coordinate
     * @param {object} gameState - Game state object
     * @returns {boolean} True if position is free
     */
    canMoveTo(x, y, gameState) {
        // Check if position has player
        if (gameState.player.x === x && gameState.player.y === y) {
            return false;
        }
        
        // Check if position has another NPC
        const hasNPC = gameState.npcs.some(npc => 
            npc !== this && npc.x === x && npc.y === y
        );
        if (hasNPC) return false;
        
        // Check if position has an enemy
        const hasEnemy = gameState.enemies.some(enemy => 
            enemy.x === x && enemy.y === y
        );
        if (hasEnemy) return false;
        
        return true;
    }
    
    /**
     * Update NPC (for guards that patrol, etc.)
     */
    update(timestamp) {
        // Future: implement patrol routes, reactions, etc.
    }
}
