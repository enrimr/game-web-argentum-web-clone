/**
 * SpriteHelpers.js
 * Funciones auxiliares para la gestión de sprites
 */

import { TILES } from '../../world/TileTypes.js';
import { sprites } from './RendererCore.js';

/**
 * Get sprite for a tile type
 * @param {number} tileType - Tile type number
 * @returns {Image} Sprite image or null
 */
export function getTileSprite(tileType) {
    switch (tileType) {
        case TILES.GRASS: return sprites.grass;
        case TILES.WATER: return sprites.water;
        case TILES.STONE: return sprites.stone;
        case TILES.TREE: return sprites.tree;
        case TILES.WALL: return sprites.wall;
        case TILES.BUILDING: return sprites.building;
        case TILES.FLOOR: return sprites.floor;
        case TILES.DUNGEON_WALL: return sprites.dungeonWall;
        case TILES.PATH: return sprites.path;
        // Interior building tiles
        case TILES.DOOR_OPEN_LEFT: return sprites.doorOpenLeft;
        case TILES.DOOR_OPEN_RIGHT: return sprites.doorOpenRight;
        case TILES.DOOR_CLOSED_LEFT: return sprites.doorClosedLeft;
        case TILES.DOOR_CLOSED_RIGHT: return sprites.doorClosedRight;
        case TILES.WALL_INTERIOR: return sprites.wallInterior;
        case TILES.FLOOR_INTERIOR: return sprites.floorInterior;
        case TILES.ROOF: return sprites.roof;
        case TILES.WINDOW: return sprites.window;
        case TILES.WINDOW_WALKABLE: return sprites.window; // Usar el mismo sprite de ventana normal
        case TILES.DOOR_SHADOW: return sprites.doorShadow;
        case TILES.FACADE: return sprites.facade;
        
        // Nuevos tipos de tiles para las Islas Canarias
        case TILES.SAND: return sprites.sand;
        case TILES.DUNE: return sprites.dune;
        case TILES.MOUNTAIN: return sprites.mountain;
        case TILES.ROCK: return sprites.rock;
        case TILES.VOLCANIC_ROCK: return sprites.volcanicRock;
        case TILES.LAVA: return sprites.lava;
        case TILES.PALM_TREE: return sprites.palmTree;
        case TILES.CACTUS: return sprites.cactus;
        case TILES.SEASHELL: return sprites.seashell;
        case TILES.VOLCANO: return sprites.volcano;
        
        // Volcanic/Mountain tiles (Canarias style)
        case TILES.OBSIDIAN: return sprites.obsidian;
        case TILES.ASH: return sprites.ash;
        case TILES.PUMICE: return sprites.pumice;
        case TILES.GEYSER: return sprites.geyser;
        
        // Decoration and ruins
        case TILES.DEAD_TREE: return sprites.deadTree;
        case TILES.CORAL: return sprites.coral;
        case TILES.RUINS_WALL: return sprites.ruinsWall;
        case TILES.COLUMN: return sprites.column;
        case TILES.BRIDGE: return sprites.bridge;
        
        default: return sprites.grass;
    }
}

/**
 * Get sprite for enemy type
 * @param {string} enemyType - Enemy type
 * @returns {Image} Enemy sprite
 */
export function getEnemySprite(enemyType) {
    switch (enemyType) {
        case 'goblin': return sprites.goblin || sprites.enemy;
        case 'skeleton': return sprites.skeleton || sprites.enemy;
        case 'orc': return sprites.orc || sprites.enemy;
        case 'bandit': return sprites.bandit || sprites.enemy;
        case 'troll': return sprites.troll || sprites.enemy;
        case 'dragon': return sprites.dragon || sprites.enemy;
        case 'elemental': return sprites.elemental || sprites.enemy;
        case 'demon': return sprites.demon || sprites.enemy;
        
        // New enemy types
        case 'slime': return sprites.slime || sprites.enemy;
        case 'wolf': return sprites.wolf || sprites.enemy;
        case 'spider': return sprites.spider || sprites.enemy;
        case 'bear': return sprites.bear || sprites.enemy;
        case 'mountain_goat': return sprites.mountain_goat || sprites.enemy;
        case 'cave_golem': return sprites.cave_golem || sprites.enemy;
        case 'ancient_guardian': return sprites.ancient_guardian || sprites.enemy;
        case 'mountain_troll': return sprites.mountain_troll || sprites.enemy;
        case 'bat': return sprites.bat || sprites.enemy;
        case 'cave_troll': return sprites.cave_troll || sprites.enemy;
        case 'mountain_giant': return sprites.mountain_giant || sprites.enemy;
        
        default: return sprites.enemy;
    }
}

/**
 * Get sprite for item type
 * @param {string} itemType - Item type
 * @returns {Image} Item sprite or undefined if no sprite exists
 */
export function getItemSprite(itemType) {
    return sprites[itemType] || undefined;
}

/**
 * Get sprite for projectile type
 * @param {string} projectileType - Projectile type
 * @returns {Image} Projectile sprite
 */
export function getProjectileSprite(projectileType) {
    switch (projectileType) {
        case 'arrow': return sprites.arrowProjectile;
        case 'fireball': return sprites.fireballProjectile || sprites.arrowProjectile;
        case 'magic': return sprites.magicProjectile || sprites.arrowProjectile;
        default: return sprites.arrowProjectile;
    }
}
