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
