/**
 * Experience.js
 * Sistema de experiencia y subida de nivel
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { addChatMessage, updateUI } from '../ui/UI.js';

/**
 * Sube de nivel al jugador
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
    
    // Otorgar 10 puntos de habilidad por nivel
    const skillPointsGained = 10;
    gameState.player.skillPoints = (gameState.player.skillPoints || 0) + skillPointsGained;

    addChatMessage('system', `🎉 ¡NIVEL ${gameState.player.level}! +${hpIncrease} HP máx, +${manaIncrease} Maná máx, +${skillPointsGained} puntos de habilidad`);
    updateUI(); // Update UI after leveling up
}

/**
 * Añade experiencia al jugador
 * @param {number} amount - Cantidad de experiencia a añadir
 */
export function addExp(amount) {
    gameState.player.exp = (gameState.player.exp || 0) + amount;

    // Check for level up
    while (gameState.player.exp >= gameState.player.expToNextLevel) {
        levelUp();
    }
}

/**
 * Verifica si el jugador debe subir de nivel
 */
export function checkLevelUp() {
    while (gameState.player.exp >= gameState.player.expToNextLevel) {
        levelUp();
    }
}