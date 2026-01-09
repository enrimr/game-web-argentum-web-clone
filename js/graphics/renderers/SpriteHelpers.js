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
        case 'goblin': return sprites.enemy;
        case 'skeleton': return sprites.enemySkeleton;
        case 'orc': return sprites.enemy; // Reuse goblin sprite for orcs
        case 'bandit': return sprites.enemy; // Reuse goblin sprite for bandits
        case 'troll': return sprites.enemyTroll;
        case 'dragon': return sprites.enemyDragon;
        case 'elemental': return sprites.enemyElemental;
        case 'demon': return sprites.enemyDemon;
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
