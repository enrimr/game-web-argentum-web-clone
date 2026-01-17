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
            { type: 'guard_city', x: 25, y: 5, dialogue: 'guard_north' },
            { type: 'healer_city', x: 30, y: 20, dialogue: 'healing' }
        ],
        enemies: { enabled: false },
        objects: {
            density: 0.02,
            types: ['potion', 'gold'],
            spawnAreas: 'walkable'
        },
        portals: [],
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

    // ===== ZONA 1: BOSQUES EXTERIORES =====
    'forest_outskirts_1': {
        name: '🌲 Bosque Exterior Norte',
        description: 'El límite norte de los campos de entrenamiento. Los árboles comienzan a densificarse.',
        type: 'forest',
        safeZone: false,
        worldPosition: { x: 110, y: 90 },
        fileSource: 'js/world/maps/forest_outskirts_1.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'slime', count: 5, minLevel: 2, maxLevel: 4 },
                { type: 'wolf', count: 3, minLevel: 2, maxLevel: 4 }
            ],
            spawnAreas: 'forest',
            respawnTime: 180000
        },
        objects: {
            density: 0.03,
            types: ['potion', 'gold'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    'forest_outskirts_2': {
        name: '🌲 Bosque Exterior Este',
        description: 'Bosque más denso al este de los campos de entrenamiento. Los árboles se hacen más abundantes.',
        type: 'forest',
        safeZone: false,
        worldPosition: { x: 120, y: 100 },
        fileSource: 'js/world/maps/forest_outskirts_2.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'slime', count: 5, minLevel: 2, maxLevel: 4 },
                { type: 'wolf', count: 3, minLevel: 2, maxLevel: 4 }
            ],
            spawnAreas: 'forest',
            respawnTime: 180000
        },
        objects: {
            density: 0.03,
            types: ['potion', 'gold'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    'forest_outskirts_3': {
        name: '🌲 Bosque Exterior Extremo',
        description: 'La zona más densa del bosque exterior. Los árboles casi bloquean el paso en algunas áreas.',
        type: 'forest',
        safeZone: false,
        worldPosition: { x: 130, y: 100 },
        fileSource: 'js/world/maps/forest_outskirts_3.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'slime', count: 5, minLevel: 3, maxLevel: 5 },
                { type: 'wolf', count: 4, minLevel: 3, maxLevel: 5 }
            ],
            spawnAreas: 'forest',
            respawnTime: 180000
        },
        objects: {
            density: 0.03,
            types: ['potion', 'gold'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    // ===== ZONA 2: BOSQUE OSCURO =====
    'dark_forest_north': {
        name: '🌲🌑 Bosque Oscuro Norte',
        description: 'El bosque se vuelve más oscuro y peligroso. Los lobos acechan entre las sombras.',
        type: 'forest',
        safeZone: false,
        worldPosition: { x: 110, y: 80 },
        fileSource: 'js/world/maps/dark_forest_north.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'wolf', count: 8, minLevel: 4, maxLevel: 7 },
                { type: 'spider', count: 6, minLevel: 4, maxLevel: 7 }
            ],
            spawnAreas: 'forest',
            respawnTime: 180000
        },
        objects: {
            density: 0.04,
            types: ['potion', 'gold', 'rare_weapon'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    'dark_forest_center': {
        name: '🌲🌑 Bosque Oscuro Centro',
        description: 'El corazón del bosque oscuro. Más denso y peligroso, con una entrada a una cueva misteriosa.',
        type: 'forest',
        safeZone: false,
        worldPosition: { x: 110, y: 70 },
        fileSource: 'js/world/maps/dark_forest_center.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'wolf', count: 10, minLevel: 5, maxLevel: 8 },
                { type: 'spider', count: 8, minLevel: 5, maxLevel: 8 },
                { type: 'bear', count: 2, minLevel: 6, maxLevel: 9 }
            ],
            spawnAreas: 'forest',
            respawnTime: 180000
        },
        objects: {
            density: 0.04,
            types: ['potion', 'gold', 'rare_weapon'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    'dark_forest_south': {
        name: '🌲🌑 Bosque Oscuro Sur',
        description: 'La zona sur del bosque oscuro. Más cerca de las montañas, con menos árboles pero mayor peligro.',
        type: 'forest',
        safeZone: false,
        worldPosition: { x: 110, y: 60 },
        fileSource: 'js/world/maps/dark_forest_south.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'wolf', count: 8, minLevel: 5, maxLevel: 8 },
                { type: 'spider', count: 6, minLevel: 5, maxLevel: 8 }
            ],
            spawnAreas: 'forest',
            respawnTime: 180000
        },
        objects: {
            density: 0.04,
            types: ['potion', 'gold', 'rare_weapon'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    'dark_forest_east': {
        name: '🌲🌑 Bosque Oscuro Este',
        description: 'El límite oriental del bosque oscuro. La transición a las montañas comienza aquí.',
        type: 'forest',
        safeZone: false,
        worldPosition: { x: 120, y: 70 },
        fileSource: 'js/world/maps/dark_forest_east.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'wolf', count: 8, minLevel: 7, maxLevel: 10 },
                { type: 'spider', count: 6, minLevel: 7, maxLevel: 10 }
            ],
            spawnAreas: 'forest',
            respawnTime: 180000
        },
        objects: {
            density: 0.04,
            types: ['potion', 'gold', 'rare_weapon'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    // ===== ZONA 3: MONTAÑAS =====
    'mountain_pass_lower': {
        name: '⛰️ Paso de Montaña Inferior',
        description: 'El inicio de las peligrosas montañas. Los caminos son estrechos y los peligros abundan.',
        type: 'mountain',
        safeZone: false,
        worldPosition: { x: 110, y: 50 },
        fileSource: 'js/world/maps/mountain_pass_lower.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'mountain_goat', count: 5, minLevel: 10, maxLevel: 13 },
                { type: 'orc', count: 4, minLevel: 10, maxLevel: 13 }
            ],
            spawnAreas: 'mountain',
            respawnTime: 180000
        },
        objects: {
            density: 0.05,
            types: ['potion', 'gold', 'ore', 'rare_armor'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    'mountain_pass_middle': {
        name: '⛰️ Paso de Montaña Medio',
        description: 'La zona intermedia del paso de montaña. Las pendientes se hacen más pronunciadas y los peligros aumentan.',
        type: 'mountain',
        safeZone: false,
        worldPosition: { x: 110, y: 40 },
        fileSource: 'js/world/maps/mountain_pass_middle.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'mountain_goat', count: 8, minLevel: 12, maxLevel: 16 },
                { type: 'orc', count: 6, minLevel: 12, maxLevel: 16 },
                { type: 'troll', count: 2, minLevel: 14, maxLevel: 18 }
            ],
            spawnAreas: 'mountain',
            respawnTime: 180000
        },
        objects: {
            density: 0.06,
            types: ['potion', 'gold', 'ore', 'rare_weapon'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    'mountain_pass_upper': {
        name: '⛰️ Paso de Montaña Alto',
        description: 'Las alturas extremas del paso de montaña. El aire es frío y los vientos son intensos. Solo los más valientes llegan aquí.',
        type: 'mountain',
        safeZone: false,
        worldPosition: { x: 110, y: 30 },
        fileSource: 'js/world/maps/mountain_pass_upper.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'mountain_goat', count: 6, minLevel: 15, maxLevel: 19 },
                { type: 'orc', count: 8, minLevel: 15, maxLevel: 19 },
                { type: 'troll', count: 4, minLevel: 16, maxLevel: 21 },
                { type: 'mountain_giant', count: 1, minLevel: 18, maxLevel: 22 }
            ],
            spawnAreas: 'mountain',
            respawnTime: 180000
        },
        objects: {
            density: 0.07,
            types: ['potion', 'gold', 'ore', 'rare_weapon', 'legendary_armor'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    'mountain_peak': {
        name: '⛰️ Cima de la Montaña',
        description: 'La cumbre más alta de las montañas. Desde aquí se divisa todo el mundo. El aire es extremadamente frío y las vistas son espectaculares.',
        type: 'mountain',
        safeZone: false,
        worldPosition: { x: 110, y: 20 },
        fileSource: 'js/world/maps/mountain_peak.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'mountain_giant', count: 2, minLevel: 20, maxLevel: 25 },
                { type: 'dragon', count: 1, minLevel: 22, maxLevel: 25 }
            ],
            spawnAreas: 'mountain',
            respawnTime: 300000
        },
        objects: {
            density: 0.08,
            types: ['legendary_weapon', 'legendary_armor', 'rare_gem', 'ancient_artifact'],
            spawnAreas: 'walkable'
        },
        portals: [],
        connections: {}
    },

    // ===== MAZMORRAS =====
    'mountain_dungeon': {
        name: '🏔️ Mazmorra de la Montaña',
        description: 'Una antigua mazmorra excavada en las profundidades de las montañas. Corredores estrechos conectan salas amplias llenas de peligros y tesoros.',
        type: 'dungeon',
        safeZone: false,
        worldPosition: null,
        fileSource: 'js/world/maps/mountain_dungeon.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'mountain_troll', count: 6, minLevel: 18, maxLevel: 23 },
                { type: 'cave_golem', count: 4, minLevel: 19, maxLevel: 24 },
                { type: 'ancient_guardian', count: 1, minLevel: 20, maxLevel: 25 }
            ],
            spawnAreas: 'dungeon',
            respawnTime: 180000
        },
        objects: {
            density: 0.08,
            types: ['legendary_weapon', 'legendary_armor', 'rare_gem', 'ancient_artifact'],
            spawnAreas: 'floor'
        },
        portals: [],
        connections: {}
    },

    // ===== MAZMORRAS =====
    'forest_cave': {
        name: '🏔️ Cueva del Bosque Oscuro',
        description: 'Una mazmorra subterránea llena de peligros. Corredores estrechos conectan varias salas grandes.',
        type: 'dungeon',
        safeZone: false,
        worldPosition: null,
        fileSource: 'js/world/maps/forest_cave.json',
        npcs: [],
        enemies: {
            enabled: true,
            types: [
                { type: 'spider', count: 10, minLevel: 8, maxLevel: 12 },
                { type: 'bat', count: 8, minLevel: 8, maxLevel: 12 },
                { type: 'cave_troll', count: 2, minLevel: 10, maxLevel: 12 }
            ],
            spawnAreas: 'dungeon',
            respawnTime: 180000
        },
        objects: {
            density: 0.06,
            types: ['potion', 'gold', 'rare_weapon', 'treasure_chest'],
            spawnAreas: 'floor'
        },
        portals: [],
        connections: {}
    },

    // ===== MAPAS LEGACY (MANTENIDOS PARA COMPATIBILIDAD) =====
    // Estos mapas usan layouts programáticos y no archivos JSON
    'newbie_field': {
        name: '🏞️ Campos de Ullathorpe (Legacy)',
        description: 'Campos abiertos cerca de la ciudad - versión legacy',
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
            { x: 25, y: 37, targetMap: 'newbie_city', targetX: 25, targetY: 5, name: 'Ciudad' }
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
