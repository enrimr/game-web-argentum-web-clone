/**
 * Configuración global del juego
 * Todas las constantes y valores de balance en un solo lugar
 */

export const CONFIG = {
    // Dimensiones del juego
    TILE_SIZE: 32,
    MAP_WIDTH: 20,
    MAP_HEIGHT: 13,
    
    // Canvas
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 416,
    
    // Jugador
    PLAYER: {
        STARTING_X: 10,
        STARTING_Y: 7,
        STARTING_HP: 100,
        STARTING_MANA: 50,
        MOVE_DELAY: 150, // milliseconds
        BASE_DAMAGE_MIN: 10,
        BASE_DAMAGE_MAX: 15,
        DAMAGE_PER_LEVEL: 2,
    },
    
    // Sistema de niveles
    LEVEL: {
        STARTING_LEVEL: 1,
        STARTING_EXP: 0,
        BASE_EXP_TO_LEVEL: 100,
        EXP_MULTIPLIER: 1.5, // Cada nivel requiere 1.5x más EXP
        HP_GAIN_PER_LEVEL: 20,
        MANA_GAIN_PER_LEVEL: 10,
    },
    
    // Enemigos
    ENEMY: {
        COUNT: 4,
        HP: 30,
        BASE_MOVE_DELAY: 800,
        MOVE_DELAY_VARIANCE: 400,
        ATTACK_DELAY: 2000,
        ATTACK_RANGE: 1, // tiles
        DETECTION_RANGE: 8, // tiles
        DAMAGE_MIN: 5,
        DAMAGE_MAX: 10,
        EXP_REWARD: 40,
        GOLD_DROP_MIN: 10,
        GOLD_DROP_MAX: 20,
    },
    
    // Objetos del mundo
    WORLD: {
        CHEST_COUNT: 3,
        CHEST_GOLD_MIN: 20,
        CHEST_GOLD_MAX: 50,
        COIN_COUNT: 5,
        COIN_VALUE_MIN: 5,
        COIN_VALUE_MAX: 20,
    },
    
    // Generación del mapa
    MAP: {
        TREE_PROBABILITY: 0.1,
        STONE_PROBABILITY: 0.05,
    },
    
    // Tiles
    TILES: {
        GRASS: 0,
        WATER: 1,
        STONE: 2,
        TREE: 3,
    },
};
