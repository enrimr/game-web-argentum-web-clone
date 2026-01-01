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
            { x: 25, y: 3, targetMap: 'newbie_field', targetX: 25, targetY: 35, name: 'Campo Norte' }
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
