/**
 * GameState.js
 * Gestión del estado del juego
 */

import { CONFIG } from './config.js';
import { MAP_DEFINITIONS } from './world/MapDefinitions.js';

export const gameState = {
    currentMap: 'newbie_field', // Current map type (using static map system)
    player: {
        x: CONFIG.PLAYER.STARTING_X,
        y: CONFIG.PLAYER.STARTING_Y,
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        gold: 0,
        facing: 'down', // Dirección del jugador: 'up', 'down', 'left', 'right'
        isGhost: false, // Si el jugador está en modo fantasma (muerto)
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
    // Estado de visibilidad de los edificios (para depuración)
    // Un valor false significa que el edificio está oculto
    buildingVisibility: {},
    // Estado de las puertas: cada puerta se identifica por su mapa y coordenadas
    // Un valor true significa que la puerta está abierta
    doors: {},
    stats: {
        enemiesKilled: 0,
        chestsOpened: 0
    },
    map: [], // Capa base del mapa (terreno, muros, etc.)
    treeLayer: [], // Nueva capa para árboles y elementos intermedios
    roofLayer: [], // Capa para los techos de los edificios
    doorLayer: [], // Capa para las puertas en capa superior
    buildings: [], // Información de los edificios en el mapa
    objects: [],
    enemies: [],
    npcs: [], // NPCs del juego
    projectiles: [], // Flechas y otros proyectiles volando
    deadEnemies: [], // Enemigos muertos esperando respawn (timestamp, enemyType, map)
    droppedItems: [], // Objetos caídos al suelo que persisten entre mapas
    playerInBuilding: false, // Si el jugador está dentro de un edificio
    currentBuilding: null, // Información del edificio actual
    buildingLayer: 0, // Capa del edificio (0=exterior, 1=interior)
    enteredBuildings: [] // Array para almacenar los edificios visitados
};

/**
 * Reinicia el estado del juego
 */
export function resetGameState() {
    gameState.currentMap = 'newbie_field';
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
        isGhost: false,
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
    gameState.treeLayer = [];
    gameState.roofLayer = [];
    gameState.doorLayer = [];
    gameState.buildings = [];
    gameState.objects = [];
    gameState.enemies = [];
    gameState.npcs = [];
    gameState.projectiles = [];
    gameState.deadEnemies = [];
    gameState.droppedItems = [];
    gameState.enteredBuildings = [];
    gameState.doors = {}; // Reiniciar estado de puertas
    gameState.buildingVisibility = {}; // Reiniciar visibilidad de edificios
}

/**
 * Obtener el identificador único para una puerta
 * @param {string} mapName - Nombre del mapa actual
 * @param {number} x - Coordenada X de la puerta
 * @param {number} y - Coordenada Y de la puerta
 * @returns {string} Identificador único de la puerta
 */
export function getDoorId(mapName, x, y) {
    return `${mapName}_door_${x}_${y}`;
}

/**
 * Obtener el identificador único para un edificio
 * @param {string} mapName - Nombre del mapa actual
 * @param {number} x - Coordenada X de la esquina superior izquierda del edificio
 * @param {number} y - Coordenada Y de la esquina superior izquierda del edificio
 * @param {number} width - Ancho del edificio
 * @param {number} height - Alto del edificio
 * @returns {string} Identificador único del edificio
 */
export function getBuildingId(mapName, x, y, width, height) {
    return `${mapName}_building_${x}_${y}_${width}_${height}`;
}

/**
 * Comprobar si un edificio está visible
 * @param {string} buildingId - ID del edificio
 * @returns {boolean} True si el edificio está visible, false si está oculto
 */
export function isBuildingVisible(buildingId) {
    // Por defecto, los edificios son visibles si no tienen un estado definido
    return gameState.buildingVisibility[buildingId] !== false;
}

/**
 * Establecer la visibilidad de un edificio
 * @param {string} buildingId - ID del edificio
 * @param {boolean} isVisible - True para mostrar el edificio, false para ocultarlo
 */
export function setBuildingVisibility(buildingId, isVisible) {
    gameState.buildingVisibility[buildingId] = isVisible;
}

/**
 * Alternar la visibilidad de un edificio
 * @param {string} buildingId - ID del edificio
 * @returns {boolean} Nuevo estado de visibilidad (true = visible, false = oculto)
 */
export function toggleBuildingVisibility(buildingId) {
    const isVisible = isBuildingVisible(buildingId);
    setBuildingVisibility(buildingId, !isVisible);
    return !isVisible;
}

/**
 * Verificar si una puerta está abierta
 * @param {string} mapName - Nombre del mapa actual
 * @param {number} x - Coordenada X de la puerta
 * @param {number} y - Coordenada Y de la puerta
 * @returns {boolean} True si la puerta está abierta, false si está cerrada
 */
export function isDoorOpen(mapName, x, y) {
    const doorId = getDoorId(mapName, x, y);
    // Por defecto, las puertas están abiertas si no tienen un estado definido
    return gameState.doors[doorId] !== false;
}

/**
 * Establecer el estado de una puerta (abierta/cerrada)
 * @param {string} mapName - Nombre del mapa actual
 * @param {number} x - Coordenada X de la puerta
 * @param {number} y - Coordenada Y de la puerta
 * @param {boolean} isOpen - True para abrir la puerta, false para cerrarla
 */
export function setDoorState(mapName, x, y, isOpen) {
    const doorId = getDoorId(mapName, x, y);
    gameState.doors[doorId] = isOpen;
}

/**
 * Alternar el estado de una puerta (abrir si está cerrada, cerrar si está abierta)
 * @param {string} mapName - Nombre del mapa actual
 * @param {number} x - Coordenada X de la puerta
 * @param {number} y - Coordenada Y de la puerta
 * @returns {boolean} Nuevo estado de la puerta (true = abierta, false = cerrada)
 */
export function toggleDoorState(mapName, x, y) {
    const isOpen = isDoorOpen(mapName, x, y);
    setDoorState(mapName, x, y, !isOpen);
    return !isOpen;
}
