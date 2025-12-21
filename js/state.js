/**
 * Estado centralizado del juego
 * Todos los datos del juego en un solo objeto
 */

import { CONFIG } from './config.js';

export const gameState = {
    player: {
        x: CONFIG.PLAYER.STARTING_X,
        y: CONFIG.PLAYER.STARTING_Y,
        hp: CONFIG.PLAYER.STARTING_HP,
        maxHp: CONFIG.PLAYER.STARTING_HP,
        mana: CONFIG.PLAYER.STARTING_MANA,
        maxMana: CONFIG.PLAYER.STARTING_MANA,
        gold: 0,
        inventory: [],
        level: CONFIG.LEVEL.STARTING_LEVEL,
        exp: CONFIG.LEVEL.STARTING_EXP,
        expToNextLevel: CONFIG.LEVEL.BASE_EXP_TO_LEVEL,
        lastMoveTime: 0,
    },
    
    stats: {
        enemiesKilled: 0,
        chestsOpened: 0,
    },
    
    map: [],
    objects: [],
    enemies: [],
    
    // Canvas reference
    canvas: null,
    ctx: null,
};

/**
 * Resetea el estado del juego a valores iniciales
 */
export function resetGameState() {
    gameState.player.x = CONFIG.PLAYER.STARTING_X;
    gameState.player.y = CONFIG.PLAYER.STARTING_Y;
    gameState.player.hp = CONFIG.PLAYER.STARTING_HP;
    gameState.player.maxHp = CONFIG.PLAYER.STARTING_HP;
    gameState.player.mana = CONFIG.PLAYER.STARTING_MANA;
    gameState.player.maxMana = CONFIG.PLAYER.STARTING_MANA;
    gameState.player.gold = 0;
    gameState.player.inventory = [];
    gameState.player.level = CONFIG.LEVEL.STARTING_LEVEL;
    gameState.player.exp = CONFIG.LEVEL.STARTING_EXP;
    gameState.player.expToNextLevel = CONFIG.LEVEL.BASE_EXP_TO_LEVEL;
    gameState.player.lastMoveTime = 0;
    
    gameState.stats.enemiesKilled = 0;
    gameState.stats.chestsOpened = 0;
    
    gameState.map = [];
    gameState.objects = [];
    gameState.enemies = [];
}
