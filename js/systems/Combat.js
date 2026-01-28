/**
 * Combat.js
 * Sistema de combate del juego
 */

import { gameState } from '../state.js';
import { ENEMY_STATS } from '../entities/EnemyTypes.js';
import { getEquippedWeaponDamage, getEquippedArmorDefense, hasAmmunitionEquipped, hasRangedWeaponEquipped, getItemQuantity } from './Inventory.js';
import { ITEM_TYPES } from './ItemTypes.js';
import { CONFIG } from '../config.js';
import { addChatMessage, updateUI } from '../ui/UI.js';
import { setPlayerAnimationState } from '../core/Renderer.js';
import { getStaticMap } from '../world/StaticWorldMaps.js';
import { isWalkable } from '../world/MapGenerator.js';
import { addExp } from './Experience.js';
import { audioManager } from './AudioManager.js';

/**
 * Handle player attack interaction
 * @param {Object} enemy - Enemy being attacked
 */
export function playerAttack(enemy) {
    // Set attacking animation
    setPlayerAnimationState('attacking');

    // Play attack sound based on equipped weapon
    if (gameState.player.equipped.weapon) {
        audioManager.play('battle/attackSword', 'battle');
    } else {
        audioManager.play('battle/attackPunch', 'battle');
    }

    const damage = calculatePlayerDamage();
    enemy.hp -= damage;
    addChatMessage('player', `¡Atacas al ${enemy.type} causando ${damage} de daño!`);

    // Check if enemy died
    if (enemy.hp <= 0) {
        handleEnemyDeath(enemy);
    }
}

/**
 * Handle enemy attack on player
 * @param {Object} enemy - Enemy attacking
 */
export function enemyAttack(enemy) {
    // Play enemy attack sound
    const enemySoundKey = audioManager.getEnemySound(enemy.type);
    audioManager.play(enemySoundKey, 'enemies');

    const damage = calculateEnemyDamage(enemy);
    gameState.player.hp -= damage;

    if (gameState.player.hp < 0) gameState.player.hp = 0;

    addChatMessage('system', `¡Un ${enemy.type} te ataca causando ${damage} de daño!`);
    updateUI(); // Update UI after taking damage

    // Check if player died
    if (gameState.player.hp === 0 && !gameState.player.isGhost) {
        // Player dies - enter ghost mode
        enterGhostMode();
    }
}

/**
 * Enter ghost mode when player dies
 * @param {object} killedBy - Entidad que mató al jugador (opcional)
 */
export function enterGhostMode(killedBy = null) {
    console.log('💀 Entrando en modo fantasma - reproduciendo sonido de muerte');
    
    // Reproducir sonido de muerte
    audioManager.play('battle/death', 'battle');

    gameState.player.isGhost = true;

    // Drop all items to the ground
    dropAllPlayerItems();
    
    // Si fue matado por un guardia, reducir criminalidad (justicia)
    if (killedBy && killedBy.type === 'guard' && gameState.player.criminalStatus > 0) {
        import('./Factions.js').then(({ reduceCriminalPoints, getCriminalStatusText }) => {
            const oldStatus = gameState.player.criminalStatus;
            const oldStatusText = getCriminalStatusText(oldStatus);
            
            // Reducir 30 puntos por muerte a manos de la justicia
            reduceCriminalPoints(gameState.player, 30);
            
            const newStatusText = getCriminalStatusText(gameState.player.criminalStatus);
            
            addChatMessage('system', `⚖️ La guardia te ha impartido justicia: -30 puntos criminales`);
            addChatMessage('system', `⚖️ Status: ${oldStatusText} (${oldStatus}) → ${newStatusText} (${gameState.player.criminalStatus})`);
            
            if (gameState.player.criminalStatus < 50 && oldStatus >= 50) {
                addChatMessage('system', '✅ Ya no eres un criminal. Los guardias dejarán de atacarte.');
            }
        });
    }

    addChatMessage('system', '💀 ¡Has muerto! Ahora eres un fantasma.');
    addChatMessage('system', '👻 Como fantasma puedes caminar, usar teletransportadores y hablar con sacerdotes.');
    addChatMessage('system', '⛪ Busca un sacerdote para resucitarte y recuperar tus objetos.');
}

/**
 * Convert bot to ghost and drop all items
 * @param {Object} bot - Bot that died
 */
export function botEnterGhostMode(bot) {
    // Reproducir sonido de muerte
    audioManager.play('battle/death', 'battle');

    bot.isGhost = true;
    bot.hp = bot.maxHp; // Fantasmas tienen HP completo pero no pueden ser atacados
    
    // Drop all bot items
    dropAllBotItems(bot);
    
    addChatMessage('system', `💀 ${bot.name} ha muerto y se ha convertido en fantasma.`);
}

/**
 * Drop all bot items to the ground at bot's position
 * @param {Object} bot - Bot whose items to drop
 */
function dropAllBotItems(bot) {
    const botX = bot.x;
    const botY = bot.y;
    const currentMap = bot.currentMap;
    
    console.log(`📦 dropAllBotItems llamado para ${bot.name}:`);
    console.log(`  - Inventario:`, bot.inventory);
    console.log(`  - Equipamiento:`, bot.equipment);
    
    let itemsDropped = 0;
    const allItems = [];

    // Recopilar todos los items del inventario del bot
    if (bot.inventory && bot.inventory.length > 0) {
        console.log(`  📋 Procesando ${bot.inventory.length} items del inventario`);
        bot.inventory.forEach(item => {
            if (item && item.type) {
                console.log(`    - ${item.type} x${item.quantity}`);
                allItems.push({
                    type: item.type,
                    quantity: item.quantity,
                    equippedSlot: null
                });
            }
        });
    } else {
        console.log(`  ⚠️ Bot no tiene inventario o está vacío`);
    }

    // NOTA: bot.equipment contiene sprites visuales (weaponHammer, helmetFull)
    // NO items de ITEM_TYPES, así que NO se droppean
    // Solo se droppea el inventario que sí contiene items válidos de ITEM_TYPES
    console.log(`  ℹ️ Equipamiento visual (no dropeado): ${bot.equipment ? Object.keys(bot.equipment).length + ' slots' : 'ninguno'}`);
    
    console.log(`  📦 Total items a dropear: ${allItems.length}`);

    // Dropear cada item en una posición diferente alrededor del bot
    allItems.forEach((item, index) => {
        // Calcular posición aleatoria en un radio de 2 casillas alrededor del bot
        const offsetX = Math.floor(Math.random() * 5) - 2; // -2 a +2
        const offsetY = Math.floor(Math.random() * 5) - 2; // -2 a +2
        const dropX = botX + offsetX;
        const dropY = botY + offsetY;

        // Verificar que la posición es válida (dentro del mapa y caminable)
        const isValidDrop = dropX >= 0 && dropX < CONFIG.MAP_WIDTH && 
                           dropY >= 0 && dropY < CONFIG.MAP_HEIGHT &&
                           isWalkable(gameState.map, dropX, dropY);

        const finalX = isValidDrop ? dropX : botX;
        const finalY = isValidDrop ? dropY : botY;

        // Añadir a droppedItems para persistencia
        const droppedItem = {
            type: item.type,
            quantity: item.quantity,
            x: finalX,
            y: finalY,
            map: currentMap,
            droppedByBot: true,
            botName: bot.name,
            dropTime: Date.now(),
            equippedSlot: item.equippedSlot
        };
        gameState.droppedItems.push(droppedItem);
        
        // Añadir también a objects para renderizado inmediato
        gameState.objects.push({
            type: 'dropped_item',
            x: finalX,
            y: finalY,
            droppedItem: droppedItem
        });
        
        itemsDropped++;
    });

    // Clear bot's inventory and equipment
    bot.inventory = [];
    bot.equipment = {
        weapon: null,
        shield: null,
        ammunition: null,
        body: null,
        head: null
    };

    if (itemsDropped > 0) {
        addChatMessage('system', `📦 ${bot.name} ha soltado ${itemsDropped} objetos en (${botX}, ${botY}).`);
    }
}

/**
 * Drop all player items to the ground at current position
 */
function dropAllPlayerItems() {
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;
    const currentMap = gameState.currentMap;
    
    let itemsDropped = 0;
    const allItems = [];

    // Recopilar todos los items del inventario
    gameState.player.inventory.forEach(item => {
        if (item && item.type) {
            allItems.push({
                type: item.type,
                quantity: item.quantity,
                equippedSlot: null
            });
        }
    });

    // Recopilar todos los items equipados
    Object.keys(gameState.player.equipped).forEach(slot => {
        const itemType = gameState.player.equipped[slot];
        if (itemType) {
            allItems.push({
                type: itemType,
                quantity: 1,
                equippedSlot: slot
            });
        }
    });

    // Dropear cada item en una posición diferente alrededor del jugador
    allItems.forEach((item, index) => {
        // Calcular posición aleatoria en un radio de 2 casillas alrededor del jugador
        const offsetX = Math.floor(Math.random() * 5) - 2; // -2 a +2
        const offsetY = Math.floor(Math.random() * 5) - 2; // -2 a +2
        const dropX = playerX + offsetX;
        const dropY = playerY + offsetY;

        // Verificar que la posición es válida (dentro del mapa y caminable)
        const isValidDrop = dropX >= 0 && dropX < CONFIG.MAP_WIDTH && 
                           dropY >= 0 && dropY < CONFIG.MAP_HEIGHT &&
                           isWalkable(gameState.map, dropX, dropY);

        const finalX = isValidDrop ? dropX : playerX;
        const finalY = isValidDrop ? dropY : playerY;

        // Añadir a droppedItems para persistencia
        const droppedItem = {
            type: item.type,
            quantity: item.quantity,
            x: finalX,
            y: finalY,
            map: currentMap,
            droppedByPlayer: true,
            dropTime: Date.now(),
            equippedSlot: item.equippedSlot
        };
        gameState.droppedItems.push(droppedItem);
        
        // Añadir también a objects para renderizado inmediato
        gameState.objects.push({
            type: 'dropped_item',
            x: finalX,
            y: finalY,
            droppedItem: droppedItem
        });
        
        itemsDropped++;
    });

    // Clear player's inventory and equipment
    gameState.player.inventory = [];
    gameState.player.equipped = {
        weapon: null,
        shield: null,
        ammunition: null,
        body: null,
        head: null
    };

    // Lose gold (optional - could keep it or drop it too)
    // For now, keep gold for resurrection

    if (itemsDropped > 0) {
        addChatMessage('system', `📦 Todos tus objetos (${itemsDropped}) han caído al suelo en (${playerX}, ${playerY}).`);
    }
}

/**
 * Handle enemy death and rewards
 * @param {Object} enemy - Enemy that died
 */
export function handleEnemyDeath(enemy) {
    const goldDrop = Math.floor(Math.random() * (enemy.goldDrop.max - enemy.goldDrop.min + 1)) + enemy.goldDrop.min;
    const expGain = enemy.expReward;

    gameState.player.gold += goldDrop;
    gameState.stats.enemiesKilled++;

    addChatMessage('system', `¡Has derrotado al ${enemy.type}! +${goldDrop} oro, +${expGain} EXP`);
    addExp(expGain);

    // Add enemy to dead enemies list for respawn
    gameState.deadEnemies.push({
        type: enemy.type,
        map: gameState.currentMap,
        deathTime: Date.now(),
        originalEnemy: enemy // Keep reference for respawn time calculation
    });

    // Remove enemy from game
    gameState.enemies = gameState.enemies.filter(e => e !== enemy);

    // Update UI after gaining gold and exp
    updateUI();
}

/**
 * Calculate player damage
 * @param {object} target - Target being attacked (optional, for faction bonus)
 * @returns {number} Damage dealt by player
 */
export function calculatePlayerDamage(target = null) {
    let baseDamage = Math.floor(Math.random() * (CONFIG.PLAYER.BASE_DAMAGE_MAX - CONFIG.PLAYER.BASE_DAMAGE_MIN + 1)) + CONFIG.PLAYER.BASE_DAMAGE_MIN;
    baseDamage += CONFIG.PLAYER.DAMAGE_PER_LEVEL * (gameState.player.level - 1);

    // Add weapon damage bonus
    const weaponDamage = getEquippedWeaponDamage();
    if (weaponDamage > CONFIG.PLAYER.BASE_DAMAGE_MIN) {
        baseDamage = weaponDamage; // Replace base damage with weapon damage
    }
    
    // Apply faction damage bonus
    if (target && target.faction) {
        import('./Factions.js').then(({ getDamageBonus }) => {
            const bonus = getDamageBonus(gameState.player.faction, target.faction);
            if (bonus > 1.0) {
                baseDamage = Math.floor(baseDamage * bonus);
                console.log(`⚔️ Bonus de facción aplicado: x${bonus} (${gameState.player.faction} vs ${target.faction})`);
            }
        });
    }

    return Math.max(1, baseDamage); // Minimum 1 damage
}

/**
 * Calculate enemy damage
 * @param {Object} enemy - Enemy attacking
 * @returns {number} Damage dealt by enemy
 */
export function calculateEnemyDamage(enemy) {
    const baseDamage = Math.floor(Math.random() * (enemy.damage.max - enemy.damage.min + 1)) + enemy.damage.min;

    // Apply shield defense bonus
    const shieldDefense = getEquippedArmorDefense();
    const totalDamage = Math.max(0, baseDamage - shieldDefense);

    return totalDamage;
}

/**
 * Shoot arrow if player has ranged weapon and ammunition
 * @returns {boolean} True if arrow was shot successfully
 */
export function shootArrow() {
    // Check if player has a ranged weapon equipped
    if (!hasRangedWeaponEquipped()) return false;

    // Check if player has arrows equipped
    if (!hasAmmunitionEquipped()) {
        addChatMessage('system', '❌ ¡No tienes flechas equipadas!');
        return false;
    }

    // Check if arrows are available
    const arrowItem = gameState.player.inventory.find(item => item.type === 'ARROW');
    if (!arrowItem || arrowItem.quantity <= 0) {
        // Should not happen if equipped, but safety check
        gameState.player.equipped.ammunition = null; // Unequip empty arrows
        addChatMessage('system', '❌ ¡Flechas agotadas!');
        return false;
    }

    // Create projectile
    const weaponDef = ITEM_TYPES[gameState.player.equipped.weapon];
    const projectile = {
        type: 'arrow',
        x: gameState.player.x + (gameState.player.facing === 'left' ? -1 : gameState.player.facing === 'right' ? 1 : 0),
        y: gameState.player.y + (gameState.player.facing === 'up' ? -1 : gameState.player.facing === 'down' ? 1 : 0),
        dx: gameState.player.facing === 'left' ? -1 : gameState.player.facing === 'right' ? 1 : 0,
        dy: gameState.player.facing === 'up' ? -1 : gameState.player.facing === 'down' ? 1 : 0,
        range: weaponDef.range,
        damage: weaponDef.damage,
        distanceTravelled: 0
    };

    gameState.projectiles.push(projectile);

    // Play arrow shoot sound
    audioManager.play('battle/attackSword', 'battle');

    // Consume one arrow from equipped slot
    arrowItem.quantity--;

    // Check if arrows are depleted
    if (arrowItem.quantity <= 0) {
        // Remove from inventory and unequip
        gameState.player.inventory = gameState.player.inventory.filter(item => item !== arrowItem);
        gameState.player.equipped.ammunition = null;
        addChatMessage('system', '🏹 ¡Flechas agotadas! Desequipando munición');
    }

    addChatMessage('system', '🏹 ¡Disparas una flecha!');
    return true;
}

/**
 * Update projectiles (arrows, etc.)
 */
export function updateProjectiles() {
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const projectile = gameState.projectiles[i];

        // Move projectile
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;
        projectile.distanceTravelled++;

        // Check if projectile has exceeded range
        if (projectile.distanceTravelled >= projectile.range) {
            gameState.projectiles.splice(i, 1);
            continue;
        }

        // Check bounds
        if (projectile.x < 0 || projectile.x >= CONFIG.MAP_WIDTH ||
            projectile.y < 0 || projectile.y >= CONFIG.MAP_HEIGHT) {
            gameState.projectiles.splice(i, 1);
            continue;
        }

        // Check collision with walls/obstacles
        const tile = gameState.map[projectile.y][projectile.x];
        if (tile !== 0 && tile !== 6 && tile !== 8) { // Not grass, floor, or path
            gameState.projectiles.splice(i, 1);
            continue;
        }

        // Check collision with enemies
        let hitEnemy = false;
        for (let enemy of gameState.enemies) {
            if (enemy.x === projectile.x && enemy.y === projectile.y) {
                // Apply damage
                enemy.hp -= projectile.damage;

                // Show damage message
                addChatMessage('system', `🏹 ¡Flecha impacta al ${enemy.type} causando ${projectile.damage} de daño!`);

                // Check if enemy died
                if (enemy.hp <= 0) {
                    handleEnemyDeath(enemy);
                }

                // Remove projectile
                gameState.projectiles.splice(i, 1);
                hitEnemy = true;
                break;
            }
        }

        if (hitEnemy) continue;
    }
}


/**
 * Check if player is alive or is a ghost
 * @returns {boolean} True if player has HP > 0 or is a ghost
 */
export function isPlayerAlive() {
    // Consider ghost players as "alive" for movement purposes
    return gameState.player.hp > 0 || gameState.player.isGhost;
}

// ===== ENEMY RESPAWN SYSTEM =====

/**
 * Check for enemy respawns and spawn them if ready
 * Call this periodically (e.g., every few seconds)
 */
export function checkEnemyRespawns() {
    const now = Date.now();

    for (let i = gameState.deadEnemies.length - 1; i >= 0; i--) {
        const deadEnemy = gameState.deadEnemies[i];

        // Only respawn enemies from current map
        if (deadEnemy.map !== gameState.currentMap) continue;

        // Check if enough time has passed for respawn
        const respawnTime = getRespawnTimeForMap(gameState.currentMap);
        if (now - deadEnemy.deathTime >= respawnTime) {
            // Try to spawn the enemy
            if (spawnEnemy(deadEnemy.type)) {
                // Remove from dead enemies list
                gameState.deadEnemies.splice(i, 1);
                console.log(`🔄 ${deadEnemy.type} ha respawneado`);
            }
        }
    }
}

/**
 * Get respawn time for a specific map
 * @param {string} mapId - Map identifier
 * @returns {number} Respawn time in milliseconds
 */
function getRespawnTimeForMap(mapId) {
    // Check static maps first
    const staticMap = getStaticMap(mapId);
    if (staticMap && staticMap.enemies && staticMap.enemies.respawnTime) {
        return staticMap.enemies.respawnTime;
    }

    // Default respawn time (30 seconds)
    return 30000;
}

/**
 * Spawn an enemy of the specified type in a valid location
 * @param {string} enemyType - Type of enemy to spawn
 * @returns {boolean} True if enemy was spawned successfully
 */
function spawnEnemy(enemyType) {
    const enemyStats = ENEMY_STATS[enemyType];
    if (!enemyStats) {
        console.error(`Unknown enemy type: ${enemyType}`);
        return false;
    }

    // Get valid spawn areas for current map
    const spawnAreas = getSpawnAreasForCurrentMap();

    // Try to find a valid spawn position
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
        // Generate random position within spawn areas
        let x, y;

        if (spawnAreas.length > 0) {
            // Use specific spawn areas
            const area = spawnAreas[Math.floor(Math.random() * spawnAreas.length)];
            x = area.x + Math.floor(Math.random() * area.width);
            y = area.y + Math.floor(Math.random() * area.height);
        } else {
            // Use entire map (fallback)
            x = Math.floor(Math.random() * CONFIG.MAP_WIDTH);
            y = Math.floor(Math.random() * CONFIG.MAP_HEIGHT);
        }

        // Check if position is valid
        if (isValidSpawnPosition(x, y)) {
            // Create enemy
            const enemy = {
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            };

            gameState.enemies.push(enemy);
            return true;
        }

        attempts++;
    }

    console.warn(`Could not find valid spawn position for ${enemyType}`);
    return false;
}

/**
 * Get spawn areas for the current map
 * @returns {Array} Array of spawn area objects {x, y, width, height}
 */
function getSpawnAreasForCurrentMap() {
    const mapId = gameState.currentMap;
    const staticMap = getStaticMap(mapId);

    if (staticMap && staticMap.enemies && staticMap.enemies.spawnAreas) {
        const spawnAreaType = staticMap.enemies.spawnAreas;

        // For now, return the entire walkable area
        // In a more advanced system, this could define specific zones
        if (spawnAreaType === 'field' || spawnAreaType === 'forest') {
            return [{
                x: 1,
                y: 1,
                width: CONFIG.MAP_WIDTH - 2,
                height: CONFIG.MAP_HEIGHT - 2
            }];
        }
    }

    // Default: entire map
    return [{
        x: 1,
        y: 1,
        width: CONFIG.MAP_WIDTH - 2,
        height: CONFIG.MAP_HEIGHT - 2
    }];
}

/**
 * Check if a position is valid for enemy spawning
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if position is valid for spawning
 */
function isValidSpawnPosition(x, y) {
    // Check bounds
    if (x < 1 || x >= CONFIG.MAP_WIDTH - 1 || y < 1 || y >= CONFIG.MAP_HEIGHT - 1) {
        return false;
    }

    // Check if walkable
    if (!isWalkable(gameState.map, x, y)) {
        return false;
    }

    // Check if position is occupied by player
    if (gameState.player.x === x && gameState.player.y === y) {
        return false;
    }

    // Check if position is occupied by another enemy
    const occupiedByEnemy = gameState.enemies.some(enemy => enemy.x === x && enemy.y === y);
    if (occupiedByEnemy) return false;

    // Check if position is occupied by NPC
    const occupiedByNPC = gameState.npcs.some(npc => npc.x === x && npc.y === y);
    if (occupiedByNPC) return false;

    // Check if position is occupied by object/portal
    const occupiedByObject = gameState.objects.some(obj => obj.x === x && obj.y === y);
    if (occupiedByObject) return false;

    // Minimum distance from player (don't spawn too close)
    const distanceFromPlayer = Math.abs(gameState.player.x - x) + Math.abs(gameState.player.y - y);
    if (distanceFromPlayer < 5) return false;

    return true;
}
