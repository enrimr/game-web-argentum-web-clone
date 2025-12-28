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
     * Update NPC (for guards that patrol, etc.)
     */
    update(timestamp) {
        // Future: implement patrol routes, reactions, etc.
    }
}
