/**
 * GameState.js
 * Gestión del estado del juego
 */

import { CONFIG } from './config.js';
import { MAP_DEFINITIONS } from './world/MapDefinitions.js';

// Estados de conexión para modo multijugador
export const CONNECTION_STATUS = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    RECONNECTING: 'reconnecting',
    ERROR: 'error'
};

export const gameState = {
    // Propiedades para modo multijugador
    isOnline: false, // Indica si el juego está en modo online
    onlineUser: null, // Información del usuario online (si está en ese modo)
    connectionStatus: CONNECTION_STATUS.DISCONNECTED, // Estado de la conexión
    otherPlayers: {}, // Mapa de otros jugadores en el mundo por ID
    serverTime: 0, // Tiempo del servidor para sincronización
    ping: 0, // Ping actual con el servidor
    pendingInputs: [], // Inputs pendientes de confirmación por el servidor
    lastProcessedInputId: 0, // ID del último input procesado por el servidor
    chatMessages: [], // Mensajes de chat (global, cercano, grupo, privado)
    
    currentMap: 'newbie_city', // Current map type (using static map system)
    player: {
        x: CONFIG.PLAYER.STARTING_X,
        y: CONFIG.PLAYER.STARTING_Y,
        class: 'WORKER', // Clase del personaje (por defecto: WORKER)
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
        meditating: false, // Si el jugador está meditando
        animation: {
            state: 'idle', // 'idle', 'walking', 'attacking', 'talking', 'meditating'
            frame: 0, // Frame actual de animación
            frameTime: 0, // Tiempo acumulado para el frame
            frameDelay: 150 // Milisegundos entre frames
        },
        inventory: [
            { type: 'AXE', quantity: 1 },
            { type: 'PICKAXE', quantity: 1 },
            { type: 'FISHING_ROD', quantity: 1 },
            { type: 'POTION_RED', quantity: 5 }
        ],
        equipped: {
            weapon: null,
            shield: null,
            ammunition: null,
            body: null,      // Armadura corporal
            head: null       // Casco
        },
        skills: {
            COMBAT: 1,
            DEFENSE: 1,
            RANGED: 1,
            WRESTLING: 1,
            TACTICS: 1,
            MAGIC: 1,
            MEDITATE: 1,
            MINING: 1,
            WOODCUTTING: 1,
            FISHING: 1,
            BLACKSMITHING: 1,
            CARPENTRY: 1,
            TRADING: 1,
            LEADERSHIP: 1,
            STEALING: 1,
            HIDING: 1,
            STABBING: 1,
            TAMING: 1,
            SURVIVAL: 1,
            NAVIGATION: 1
        },
        skillExp: {
            COMBAT: 0,
            DEFENSE: 0,
            RANGED: 0,
            WRESTLING: 0,
            TACTICS: 0,
            MAGIC: 0,
            MEDITATE: 0,
            MINING: 0,
            WOODCUTTING: 0,
            FISHING: 0,
            BLACKSMITHING: 0,
            CARPENTRY: 0,
            TRADING: 0,
            LEADERSHIP: 0,
            STEALING: 0,
            HIDING: 0,
            STABBING: 0,
            TAMING: 0,
            SURVIVAL: 0,
            NAVIGATION: 0
        },
        // Propiedades exclusivas para jugador online
        id: null, // ID único del jugador en el servidor
        username: null, // Nombre de usuario
        clan: null, // Clan al que pertenece
        lastSyncTime: 0 // Último tiempo de sincronización
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
    propLayer: [], // Capa para objetos decorativos y elementos interactivos
    roofLayer: [], // Capa para los techos de los edificios
    doorLayer: [], // Capa para las puertas en capa superior
    buildings: [], // Información de los edificios en el mapa
    objects: [],
    enemies: [],
    npcs: [], // NPCs del juego
    bots: [], // Jugadores bot simulados
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
    gameState.currentMap = 'newbie_city';
    gameState.player = {
        x: CONFIG.PLAYER.STARTING_X,
        y: CONFIG.PLAYER.STARTING_Y,
        class: 'WORKER', // Clase por defecto
        hp: CONFIG.PLAYER.STARTING_HP,
        maxHp: CONFIG.PLAYER.STARTING_HP,
        mana: CONFIG.PLAYER.STARTING_MANA,
        maxMana: CONFIG.PLAYER.STARTING_MANA,
        gold: 0,
        inventory: [],
        equipped: {
            weapon: null,
            shield: null,
            ammunition: null,
            body: null,      // Armadura corporal
            head: null       // Casco
        },
        level: CONFIG.LEVEL.STARTING_LEVEL,
        exp: CONFIG.LEVEL.STARTING_EXP,
        expToNextLevel: CONFIG.LEVEL.BASE_EXP_TO_LEVEL,
        isGhost: false,
        meditating: false,
        facing: 'down',
        animation: {
            state: 'idle',
            frame: 0,
            frameTime: 0,
            frameDelay: 150
        },
        skills: {
            COMBAT: 1,
            DEFENSE: 1,
            RANGED: 1,
            WRESTLING: 1,
            TACTICS: 1,
            MAGIC: 1,
            MEDITATE: 1,
            MINING: 1,
            WOODCUTTING: 1,
            FISHING: 1,
            BLACKSMITHING: 1,
            CARPENTRY: 1,
            TRADING: 1,
            LEADERSHIP: 1,
            STEALING: 1,
            HIDING: 1,
            STABBING: 1,
            TAMING: 1,
            SURVIVAL: 1,
            NAVIGATION: 1
        },
        skillExp: {
            COMBAT: 0,
            DEFENSE: 0,
            RANGED: 0,
            WRESTLING: 0,
            TACTICS: 0,
            MAGIC: 0,
            MEDITATE: 0,
            MINING: 0,
            WOODCUTTING: 0,
            FISHING: 0,
            BLACKSMITHING: 0,
            CARPENTRY: 0,
            TRADING: 0,
            LEADERSHIP: 0,
            STEALING: 0,
            HIDING: 0,
            STABBING: 0,
            TAMING: 0,
            SURVIVAL: 0,
            NAVIGATION: 0
        }
    };
    gameState.stats = {
        enemiesKilled: 0,
        chestsOpened: 0
    };
    gameState.map = [];
    gameState.treeLayer = [];
    gameState.propLayer = []; // Reset the prop layer too
    gameState.roofLayer = [];
    gameState.doorLayer = [];
    gameState.buildings = [];
    gameState.objects = [];
    gameState.enemies = [];
    gameState.npcs = [];
    gameState.bots = [];
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
