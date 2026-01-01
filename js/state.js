/**
 * GameState.js
 * Gestión del estado del juego
 */

import { CONFIG } from './config.js';
import { MAP_DEFINITIONS } from './world/MapDefinitions.js';

export const gameState = {
    currentMap: 'newbie_city', // Current map type (using static map system)
    player: {
        x: 5,
        y: 5,
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        gold: 0,
        facing: 'down', // Dirección del jugador: 'up', 'down', 'left', 'right'
        animation: {
            state: 'idle', // 'idle', 'walking', 'attacking', 'talking'
            frame: 0, // Frame actual de animación
            frameTime: 0, // Tiempo acumulado para el frame
            frameDelay: 150 // Milisegundos entre frames
        },
        inventory: [],
        equipped: {
            weapon: null,
            shield: null,
            ammunition: null
        }
    },
    stats: {
        enemiesKilled: 0,
        chestsOpened: 0
    },
    map: [],
    objects: [],
    enemies: [],
    npcs: [], // NPCs del juego
    projectiles: [], // Flechas y otros proyectiles volando
    deadEnemies: [], // Enemigos muertos esperando respawn (timestamp, enemyType, map)
    playerInBuilding: false, // Si el jugador está dentro de un edificio
    currentBuilding: null, // Información del edificio actual
    buildingLayer: 0 // Capa del edificio (0=exterior, 1=interior)
};

/**
 * Reinicia el estado del juego
 */
export function resetGameState() {
    gameState.currentMap = 'newbie_city';
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
        facing: 'down',
        animation: {
            state: 'idle',
            frame: 0,
            frameTime: 0,
            frameDelay: 150
        }
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
    gameState.deadEnemies = [];
}
