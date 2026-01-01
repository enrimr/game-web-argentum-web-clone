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

/**
 * Handle player attack interaction
 * @param {Object} enemy - Enemy being attacked
 */
export function playerAttack(enemy) {
    // Set attacking animation
    setPlayerAnimationState('attacking');

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
    const damage = calculateEnemyDamage(enemy);
    gameState.player.hp -= damage;

    if (gameState.player.hp < 0) gameState.player.hp = 0;

    addChatMessage('system', `¡Un ${enemy.type} te ataca causando ${damage} de daño!`);
    updateUI(); // Update UI after taking damage

    // Check if player died
    if (gameState.player.hp === 0) {
        addChatMessage('system', '💀 ¡Has muerto! Recarga la página para jugar de nuevo.');
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
 * @returns {number} Damage dealt by player
 */
export function calculatePlayerDamage() {
    let baseDamage = Math.floor(Math.random() * (CONFIG.PLAYER.BASE_DAMAGE_MAX - CONFIG.PLAYER.BASE_DAMAGE_MIN + 1)) + CONFIG.PLAYER.BASE_DAMAGE_MIN;
    baseDamage += CONFIG.PLAYER.DAMAGE_PER_LEVEL * (gameState.player.level - 1);

    // Add weapon damage bonus
    const weaponDamage = getEquippedWeaponDamage();
    if (weaponDamage > CONFIG.PLAYER.BASE_DAMAGE_MIN) {
        baseDamage = weaponDamage; // Replace base damage with weapon damage
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
 * Level up system
 */
export function levelUp() {
    gameState.player.level++;
    gameState.player.exp = 0;
    gameState.player.expToNextLevel = Math.floor(gameState.player.expToNextLevel * CONFIG.LEVEL.EXP_MULTIPLIER);

    // Increase stats on level up
    const hpIncrease = CONFIG.LEVEL.HP_GAIN_PER_LEVEL;
    const manaIncrease = CONFIG.LEVEL.MANA_GAIN_PER_LEVEL;

    gameState.player.maxHp += hpIncrease;
    gameState.player.hp = gameState.player.maxHp; // Full heal on level up
    gameState.player.maxMana += manaIncrease;
    gameState.player.mana = gameState.player.maxMana;

    addChatMessage('system', `🎉 ¡NIVEL ${gameState.player.level}! +${hpIncrease} HP máx, +${manaIncrease} Maná máx`);
    updateUI(); // Update UI after leveling up
}

/**
 * Add experience
 * @param {number} amount - Amount of experience to add
 */
export function addExp(amount) {
    gameState.player.exp += amount;

    // Check for level up
    while (gameState.player.exp >= gameState.player.expToNextLevel) {
        levelUp();
    }
}

/**
 * Check if player is alive
 * @returns {boolean} True if player has HP > 0
 */
export function isPlayerAlive() {
    return gameState.player.hp > 0;
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
