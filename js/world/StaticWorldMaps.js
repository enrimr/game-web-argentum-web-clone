/**
 * StaticWorldMaps.js
 * Pre-diseñados mapas estáticos para el mundo principal del juego
 */

import { TILES } from './TileTypes.js';
import { CONFIG } from '../config.js';
import {
    generateNewbieCityLayout,
    generateNewbieFieldLayout,
    generateDarkForestLayout,
    generateDungeonLevel1Layout,
    generateTreasureIslandLayout,
    generateMountainPassLayout,
    generateNewbieCityWithBuildings
} from './StaticMapLayouts.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Definición de mapas estáticos del mundo
 */
export const STATIC_WORLD_MAPS = {
    // ===== MAPAS DE ISLAS CANARIAS =====
    'canarias_capital': {
        name: '🏙️ Las Palmas de GC',
        description: 'La capital de Gran Canaria, bulliciosa ciudad portuaria',
        type: 'city',
        safeZone: true,
        worldPosition: { x: 500, y: 200 },
        fileSource: 'js/world/maps/canarias_capital.json',
        npcs: [],
        enemies: { enabled: false },
        portals: [
            { x: 6, y: 11, targetMap: 'canarias_playa_canteras', targetX: 8, targetY: 1, name: 'Playa de Las Canteras' },
            { x: 10, y: 1, targetMap: 'newbie_city', targetX: 35, targetY: 15, name: 'Ullathorpe' }
        ],
        connections: {}
    },
    
    'canarias_playa_canteras': {
        name: '🏖️ Playa de Las Canteras',
        description: 'Hermosa playa urbana con su característica Barra',
        type: 'beach',
        safeZone: true,
        worldPosition: { x: 500, y: 250 },
        fileSource: 'js/world/maps/canarias_playa_canteras.json',
        npcs: [],
        enemies: { enabled: false },
        portals: [
            { x: 8, y: 1, targetMap: 'canarias_capital', targetX: 6, targetY: 11, name: 'Las Palmas' },
            { x: 16, y: 6, targetMap: 'canarias_dunas', targetX: 1, targetY: 6, name: 'Dunas de Maspalomas' }
        ],
        connections: {}
    },
    
    'canarias_dunas': {
        name: '🏜️ Dunas de Maspalomas',
        description: 'Impresionante paisaje desértico junto al mar',
        type: 'desert',
        safeZone: true,
        worldPosition: { x: 530, y: 250 },
        fileSource: 'js/world/maps/canarias_dunas.json',
        npcs: [],
        enemies: { enabled: false },
        portals: [
            { x: 1, y: 6, targetMap: 'canarias_playa_canteras', targetX: 16, targetY: 6, name: 'Playa de Las Canteras' },
            { x: 18, y: 10, targetMap: 'canarias_teide_dungeon', targetX: 1, targetY: 13, name: 'Volcán del Teide' }
        ],
        connections: {}
    },
    
    'canarias_teide_dungeon': {
        name: '🌋 Volcán del Teide',
        description: 'Peligrosa mazmorra en el interior del volcán',
        type: 'dungeon',
        safeZone: false,
        isDungeon: true,
        worldPosition: { x: 650, y: 130 },
        fileSource: 'js/world/maps/canarias_teide_dungeon.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'elemental', count: 1, minLevel: 10, maxLevel: 10 },
                { type: 'orc', count: 1, minLevel: 8, maxLevel: 8 },
                { type: 'goblin', count: 3, minLevel: 6, maxLevel: 6 }
            ],
            spawnAreas: 'dungeon'
        },
        portals: [
            { x: 1, y: 13, targetMap: 'canarias_dunas', targetX: 18, targetY: 10, name: 'Salida hacia Dunas', isDoor: true }
        ],
        connections: {}
    },
    
    // ===== CIUDAD PRINCIPAL =====
    'newbie_city': {
        name: '🏘️ Ciudad de Ullathorpe',
        description: 'Ciudad inicial para aventureros novatos',
        type: 'city',
        safeZone: true,
        worldPosition: { x: 200, y: 150 },
        layout: generateNewbieCityWithBuildings,
        npcs: [
            { type: 'banker_city', x: 25, y: 10, dialogue: 'welcome_king' },
            { type: 'blacksmith_ullathorpe', x: 15, y: 15, dialogue: 'shop_weapons' },
            { type: 'merchant_general', x: 35, y: 15, dialogue: 'shop_armor' },
            { type: 'alchemist_market', x: 25, y: 25, dialogue: 'healing' },
            { type: 'trainer_skills', x: 10, y: 30, dialogue: 'training' },
            { type: 'guard_city', x: 25, y: 5, dialogue: 'guard_north' }
        ],
        enemies: { enabled: false },
        objects: {
            density: 0.02,
            types: ['potion', 'gold'],
            spawnAreas: 'walkable'
        },
        portals: [
            { x: 25, y: 3, targetMap: 'newbie_field', targetX: 25, targetY: 35, name: 'Campo Norte' },
            { x: 35, y: 15, targetMap: 'canarias_capital', targetX: 10, targetY: 10, name: '🏙️ Islas Canarias' }
        ],
        connections: {}
    },

    // ===== CAMPOS DE ENTRENAMIENTO =====
    'training_fields': {
        name: '🏞️ Campos de Entrenamiento',
        description: 'Campos abiertos perfectos para entrenar habilidades básicas',
        type: 'field',
        safeZone: false,
        worldPosition: { x: 210, y: 150 },
        fileSource: 'js/world/maps/training_fields.json',
        npcs: [
            { type: 'banker_city', x: 25, y: 10, dialogue: 'welcome_king' },
            { type: 'blacksmith_ullathorpe', x: 15, y: 15, dialogue: 'shop_weapons' },
            { type: 'merchant_general', x: 35, y: 15, dialogue: 'shop_armor' },
            { type: 'alchemist_market', x: 25, y: 25, dialogue: 'healing' },
            { type: 'trainer_skills', x: 10, y: 30, dialogue: 'training' },
            { type: 'guard_city', x: 25, y: 5, dialogue: 'guard_north' }
        ],
        enemies: { enabled: false },
        objects: {
            density: 0.02,
            types: ['potion', 'gold'],
            spawnAreas: 'walkable'
        },
        portals: [
            { x: 25, y: 3, targetMap: 'newbie_field', targetX: 25, targetY: 35, name: 'Campo Norte' },
            { x: 35, y: 15, targetMap: 'canarias_capital', targetX: 10, targetY: 10, name: '🏙️ Islas Canarias' }
        ],
        connections: {}
    },

    // ===== CAMPO INICIAL =====
    'newbie_field': {
        name: '🏞️ Campos de Ullathorpe',
        description: 'Campos abiertos cerca de la ciudad',
        type: 'field',
        safeZone: false,
        worldPosition: { x: 200, y: 220 },
        layout: generateNewbieFieldLayout,
        npcs: [
            { type: 'trainer_skills', x: 10, y: 10, dialogue: 'farmer_tips' },
            { type: 'merchant_general', x: 40, y: 30, dialogue: 'traveling_merchant' }
        ],
        enemies: {
            enabled: true,
            types: [
                { type: 'goblin', count: 5, minLevel: 1, maxLevel: 3 },
                { type: 'rat', count: 8, minLevel: 1, maxLevel: 2 }
            ],
            spawnAreas: 'field',
            respawnTime: 300000
        },
        objects: {
            density: 0.05,
            types: ['potion', 'gold', 'sword', 'shield'],
            spawnAreas: 'all'
        },
        portals: [
            { x: 25, y: 37, targetMap: 'newbie_city', targetX: 25, targetY: 5, name: 'Ciudad' },
            { x: 45, y: 10, targetMap: 'dark_forest', targetX: 5, targetY: 20, name: 'Bosque' }
        ],
        connections: {}
    },

    // ===== BOSQUE OSCURO =====
    'dark_forest': {
        name: '🌲 Bosque Oscuro',
        description: 'Bosque denso con criaturas peligrosas',
        type: 'forest',
        safeZone: false,
        worldPosition: { x: 300, y: 220 },
        layout: generateDarkForestLayout,
        npcs: [], // No NPCs for now
        enemies: {
            enabled: true,
            types: [
                { type: 'wolf', count: 6, minLevel: 3, maxLevel: 5 },
                { type: 'spider', count: 8, minLevel: 2, maxLevel: 4 }
            ],
            spawnAreas: 'forest'
        },
        objects: {
            density: 0.06,
            types: ['potion', 'gold', 'armor', 'sword'],
            spawnAreas: 'ground'
        },
        portals: [
            { x: 5, y: 20, targetMap: 'newbie_field', targetX: 43, targetY: 10, name: 'Campo' }
        ],
        connections: {}
    },

    // ===== MAZMORRA NIVEL 1 =====
    'dungeon_level_1': {
        name: '🏰 Mazmorra Abandonada',
        description: 'Primera planta de una antigua mazmorra',
        type: 'dungeon',
        safeZone: false,
        worldPosition: { x: 280, y: 280 },
        layout: generateDungeonLevel1Layout,
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'skeleton', count: 10, minLevel: 5, maxLevel: 8 },
                { type: 'zombie', count: 6, minLevel: 6, maxLevel: 9 }
            ],
            spawnAreas: 'dungeon'
        },
        objects: {
            density: 0.08,
            types: ['potion', 'gold', 'armor', 'sword'],
            spawnAreas: 'floor'
        },
        portals: [
            { x: 5, y: 5, targetMap: 'newbie_field', targetX: 30, targetY: 30, name: 'Salida' }
        ],
        connections: {}
    },

    // ===== ISLA DEL TESORO =====
    'treasure_island': {
        name: '�️ Isla del Tesoro',
        description: 'Isla misteriosa rodeada de agua',
        type: 'island',
        safeZone: false,
        worldPosition: { x: 100, y: 100 },
        layout: generateTreasureIslandLayout,
        npcs: [], // No NPCs for now
        enemies: {
            enabled: true,
            types: [
                { type: 'pirate_warrior', count: 5, minLevel: 8, maxLevel: 12 }
            ],
            spawnAreas: 'island'
        },
        objects: {
            density: 0.10,
            types: ['gold', 'treasure_chest', 'rare_armor'],
            spawnAreas: 'beach'
        },
        portals: [],
        connections: {}
    },

    // ===== MONTAÑAS =====
    'mountain_pass': {
        name: '⛰️ Paso de Montaña',
        description: 'Paso montañoso con clima hostil',
        type: 'mountain',
        safeZone: false,
        worldPosition: { x: 350, y: 180 },
        layout: generateMountainPassLayout,
        npcs: [], // No NPCs for now
        enemies: {
            enabled: true,
            types: [
                { type: 'mountain_troll', count: 4, minLevel: 10, maxLevel: 15 }
            ],
            spawnAreas: 'mountain'
        },
        objects: {
            density: 0.07,
            types: ['ore', 'gold', 'rare_weapon'],
            spawnAreas: 'rocks'
        },
        portals: [
            { x: 25, y: 38, targetMap: 'newbie_field', targetX: 25, targetY: 5, name: 'Campos' }
        ],
        connections: {}
    }
};

/**
 * Get static map configuration
 */
export function getStaticMap(mapId) {
    return STATIC_WORLD_MAPS[mapId] || null;
}

/**
 * Check if map is static
 */
export function isStaticMap(mapId) {
    return mapId in STATIC_WORLD_MAPS;
}

/**
 * Get all static map IDs
 */
export function getAllStaticMapIds() {
    return Object.keys(STATIC_WORLD_MAPS);
}
