/**
 * NPC.js
 * Clase NPC (Non-Player Character)
 * Similar a la estructura de NPCs de Argentum Online
 */

import { Character } from './Character.js';
import { NPC_DEFINITIONS } from './NPCTypes.js';

export class NPC extends Character {
    constructor(npcType, x, y, currentMap = null) {
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
        this.currentMap = currentMap; // Mapa actual del NPC
        this.meditating = definition.meditating || false; // Añadimos propiedad de meditación
        
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
        
        // Movement properties (for guards that chase criminals)
        this.targetX = null;
        this.targetY = null;
        this.lastMoveTime = 0;
        this.moveSpeed = 400; // ms per tile (slower than player)
        this.chasing = false;
        this.chasingTarget = null;
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
     * Heal player's wounds and status effects
     */
    healPlayer(player) {
        if (!this.services || !this.services.canHeal) {
            return { success: false, message: 'No puedo curar heridas.' };
        }
        
        // Los fantasmas no pueden ser curados (deben resucitar primero)
        if (player.isGhost) {
            return { success: false, message: 'Debes resucitar primero antes de poder ser curado.' };
        }
        
        // Check if player needs healing
        if (player.hp >= player.maxHp) {
            return { success: false, message: 'No necesitas curación, ya estás en perfecto estado.' };
        }
        
        const healCost = this.services.healCost || 0;
        
        // Verificar oro solo si el costo es mayor que 0
        if (healCost > 0 && player.gold < healCost) {
            return {
                success: false,
                message: `Necesitas ${healCost} oro para curarte.`
            };
        }
        
        // Apply healing
        if (healCost > 0) {
            player.gold -= healCost;
        }
        
        const healedAmount = player.maxHp - player.hp;
        player.hp = player.maxHp; // HP al 100%
        
        // TODO: Curar estados alterados (veneno, confusión, parálisis, etc.)
        // Por ahora solo curamos HP
        
        const costMsg = healCost > 0 ? ` (-${healCost} oro)` : ' (GRATIS por la gracia divina)';
        return {
            success: true,
            message: `¡Curado! +${healedAmount} HP restaurado${costMsg}`
        };
    }
    
    /**
     * Resurrect ghost player and restore to life
     */
    resurrectPlayer(player) {
        if (!this.services || !this.services.canResurrect) {
            return { success: false, message: 'No puedo resucitar.' };
        }
        
        // Check if player is a ghost
        if (!player.isGhost) {
            return { success: false, message: '¡Pero si estás vivo! No necesitas resurrección.' };
        }
        
        const resurrectCost = this.services.resurrectCost || 0;
        
        // Verificar oro solo si el costo es mayor que 0
        if (resurrectCost > 0 && player.gold < resurrectCost) {
            return {
                success: false,
                message: `Necesitas ${resurrectCost} oro para resucitar.`
            };
        }
        
        // Apply resurrection
        if (resurrectCost > 0) {
            player.gold -= resurrectCost;
        }
        
        // Resucitar: restaurar estado vivo
        player.isGhost = false;
        player.hp = player.maxHp; // Vida al 100%
        
        // TODO: Limpiar estados alterados si los hay (veneno, confusión, parálisis)
        
        const costMsg = resurrectCost > 0 ? ` (-${resurrectCost} oro)` : ' (GRATIS por la gracia divina)';
        return {
            success: true,
            message: `¡Resucitado!${costMsg} Tu alma ha vuelto a tu cuerpo y tu HP está al 100%.`
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
     * @param {number} timestamp - Current timestamp
     * @param {object} gameState - Game state object
     */
    update(timestamp, gameState) {
        // Guards actively hunt evil faction members
        if (this.type === 'guard' && this.attacksOnCriminal) {
            this.guardBehavior(gameState);
        }
        
        // Future: implement patrol routes, reactions, etc.
    }
    
    /**
     * Guard behavior - detect, chase, and attack evil faction members
     * @param {object} gameState - Game state object
     */
    guardBehavior(gameState) {
        const currentTime = Date.now();
        
        // Import faction check function and bot death handler
        Promise.all([
            import('../systems/Factions.js'),
            import('../systems/Combat.js'),
            import('../world/MapGenerator.js')
        ]).then(([{ shouldGuardAttack }, { botEnterGhostMode }, { isWalkable }]) => {
            const detectionRange = 8; // 8 tiles de rango de detección
            
            // Find nearest criminal
            let nearestCriminal = null;
            let minDistance = Infinity;
            
            for (const bot of gameState.bots) {
                // Skip if bot is already a ghost
                if (bot.isGhost) continue;
                
                // Skip if bot is not in current map
                if (bot.currentMap !== this.currentMap) continue;
                
                // Check if bot is from evil faction
                if (shouldGuardAttack(bot.faction)) {
                    const distance = Math.abs(bot.x - this.x) + Math.abs(bot.y - this.y);
                    
                    // Only consider bots within detection range
                    if (distance <= detectionRange && distance < minDistance) {
                        minDistance = distance;
                        nearestCriminal = bot;
                    }
                }
            }
            
            // If there's a criminal in range
            if (nearestCriminal) {
                const distance = Math.abs(nearestCriminal.x - this.x) + Math.abs(nearestCriminal.y - this.y);
                
                // Mark bot as detected if first time
                if (!nearestCriminal.attackedByGuard) {
                    console.log(`⚔️ Guardia ${this.name} detectó criminal: ${nearestCriminal.name} (${nearestCriminal.faction})`);
                    nearestCriminal.attackedByGuard = true;
                    nearestCriminal.hostile = true;
                }
                
                // Set as chasing target
                this.chasing = true;
                this.chasingTarget = nearestCriminal;
                
                // Attack if within melee range
                if (distance <= 1) {
                    const damage = Math.floor(Math.random() * (this.damage.max - this.damage.min + 1)) + this.damage.min;
                    nearestCriminal.hp -= damage;
                    console.log(`⚔️ Guardia ${this.name} ataca a ${nearestCriminal.name} - ${damage} daño (${nearestCriminal.hp}/${nearestCriminal.maxHp} HP)`);
                    
                    // Check if bot died
                    if (nearestCriminal.hp <= 0) {
                        console.log(`💀 ${nearestCriminal.name} eliminado por guardia → fantasma`);
                        botEnterGhostMode(nearestCriminal);
                        this.chasing = false;
                        this.chasingTarget = null;
                    }
                } else {
                    // Chase the criminal - move towards them
                    if (currentTime - this.lastMoveTime >= this.moveSpeed) {
                        this.moveTowardsTarget(nearestCriminal.x, nearestCriminal.y, gameState, isWalkable);
                        this.lastMoveTime = currentTime;
                    }
                }
            } else {
                // No criminals in range - stop chasing
                this.chasing = false;
                this.chasingTarget = null;
            }
        });
    }
    
    /**
     * Move towards a target position (simple pathfinding)
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {object} gameState - Game state object
     * @param {function} isWalkable - Function to check if tile is walkable
     */
    moveTowardsTarget(targetX, targetY, gameState, isWalkable) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        
        // Try to move on the axis with greater distance first
        let moved = false;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Try moving horizontally first
            const newX = this.x + Math.sign(dx);
            if (isWalkable(gameState.map, newX, this.y) && this.canMoveTo(newX, this.y, gameState)) {
                this.x = newX;
                moved = true;
            }
            // If blocked, try vertical
            else if (dy !== 0) {
                const newY = this.y + Math.sign(dy);
                if (isWalkable(gameState.map, this.x, newY) && this.canMoveTo(this.x, newY, gameState)) {
                    this.y = newY;
                    moved = true;
                }
            }
        } else {
            // Try moving vertically first
            const newY = this.y + Math.sign(dy);
            if (isWalkable(gameState.map, this.x, newY) && this.canMoveTo(this.x, newY, gameState)) {
                this.y = newY;
                moved = true;
            }
            // If blocked, try horizontal
            else if (dx !== 0) {
                const newX = this.x + Math.sign(dx);
                if (isWalkable(gameState.map, newX, this.y) && this.canMoveTo(newX, this.y, gameState)) {
                    this.x = newX;
                    moved = true;
                }
            }
        }
        
        if (moved) {
            console.log(`👮 Guardia ${this.name} persigue criminal → (${this.x}, ${this.y})`);
        }
    }
}
