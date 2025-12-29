/**
 * GameState.js
 * Gestión del estado del juego
 */

import { CONFIG } from './config.js';
import { MAP_DEFINITIONS } from './world/MapDefinitions.js';

export const gameState = {
    currentMap: 'field', // Current map type
    player: {
        x: CONFIG.PLAYER.STARTING_X,
        y: CONFIG.PLAYER.STARTING_Y,
        hp: CONFIG.PLAYER.STARTING_HP,
        maxHp: CONFIG.PLAYER.STARTING_HP,
        mana: CONFIG.PLAYER.STARTING_MANA,
        maxMana: CONFIG.PLAYER.STARTING_MANA,
        gold: 0,
        inventory: [], // Array de {type, name, quantity, icon, equipped?}
        equipped: {
            weapon: null, // Item equipado como arma
            shield: null, // Item equipado como escudo
            ammunition: null // Flechas equipadas (requiere arco)
        },
        level: CONFIG.LEVEL.STARTING_LEVEL,
        exp: CONFIG.LEVEL.STARTING_EXP,
        expToNextLevel: CONFIG.LEVEL.BASE_EXP_TO_LEVEL,
        facing: 'down' // Dirección a la que mira el jugador
    },
    stats: {
        enemiesKilled: 0,
        chestsOpened: 0
    },
    map: [],
    objects: [],
    enemies: [],
    npcs: [], // NPCs del juego
    projectiles: [] // Flechas y otros proyectiles volando
};

/**
 * Reinicia el estado del juego
 */
export function resetGameState() {
    gameState.currentMap = 'field';
    gameState.player = {
        x: CONFIG.PLAYER.STARTING_X,
        y: CONFIG.PLAYER.STARTING_Y,
        hp: CONFIG.PLAYER.STARTING_HP,
        maxHp: CONFIG.PLAYER.STARTING_HP,
        mana: CONFIG.PLAYER.STARTING_MANA,
        maxMana: CONFIG.PLAYER.STARTING_MANA,
        gold: 0,
        inventory: [],
        equipped: {
            weapon: null,
            shield: null,
            ammunition: null
        },
        level: CONFIG.LEVEL.STARTING_LEVEL,
        exp: CONFIG.LEVEL.STARTING_EXP,
        expToNextLevel: CONFIG.LEVEL.BASE_EXP_TO_LEVEL,
        facing: 'down'
    };
    gameState.stats = {
        enemiesKilled: 0,
        chestsOpened: 0
    };
    gameState.map = [];
    gameState.objects = [];
    gameState.enemies = [];
    gameState.npcs = [];
    gameState.projectiles = [];
}
