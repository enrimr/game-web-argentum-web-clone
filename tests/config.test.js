/**
 * Tests para js/config.js
 */

import { CONFIG } from '../js/config.js';

export function runConfigTests(runner, assert) {
    
    runner.test('CONFIG existe y es un objeto', () => {
        assert.exists(CONFIG, 'CONFIG debería existir');
        assert.isObject(CONFIG, 'CONFIG debería ser un objeto');
    });
    
    runner.test('Dimensiones del tile están definidas', () => {
        assert.exists(CONFIG.TILE_SIZE, 'TILE_SIZE debería existir');
        assert.equals(CONFIG.TILE_SIZE, 32, 'TILE_SIZE debería ser 32');
    });
    
    runner.test('Dimensiones del mapa están definidas', () => {
        assert.exists(CONFIG.MAP_WIDTH, 'MAP_WIDTH debería existir');
        assert.exists(CONFIG.MAP_HEIGHT, 'MAP_HEIGHT debería existir');
        assert.equals(CONFIG.MAP_WIDTH, 20, 'MAP_WIDTH debería ser 20');
        assert.equals(CONFIG.MAP_HEIGHT, 13, 'MAP_HEIGHT debería ser 13');
    });
    
    runner.test('Canvas tiene dimensiones correctas', () => {
        assert.equals(CONFIG.CANVAS_WIDTH, 640, 'CANVAS_WIDTH debería ser 640');
        assert.equals(CONFIG.CANVAS_HEIGHT, 416, 'CANVAS_HEIGHT debería ser 416');
        assert.equals(CONFIG.CANVAS_WIDTH, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE, 
            'Canvas width debe ser MAP_WIDTH * TILE_SIZE');
        assert.equals(CONFIG.CANVAS_HEIGHT, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE,
            'Canvas height debe ser MAP_HEIGHT * TILE_SIZE');
    });
    
    runner.test('Configuración del jugador existe', () => {
        assert.exists(CONFIG.PLAYER, 'PLAYER config debería existir');
        assert.isObject(CONFIG.PLAYER, 'PLAYER debería ser un objeto');
        assert.greaterThan(CONFIG.PLAYER.STARTING_HP, 0, 'HP inicial debe ser positivo');
        assert.greaterThan(CONFIG.PLAYER.STARTING_MANA, 0, 'Mana inicial debe ser positivo');
    });
    
    runner.test('Sistema de niveles configurado correctamente', () => {
        assert.exists(CONFIG.LEVEL, 'LEVEL config debería existir');
        assert.equals(CONFIG.LEVEL.STARTING_LEVEL, 1, 'Nivel inicial debe ser 1');
        assert.greaterThan(CONFIG.LEVEL.BASE_EXP_TO_LEVEL, 0, 'EXP base debe ser positivo');
        assert.equals(CONFIG.LEVEL.EXP_MULTIPLIER, 1.5, 'Multiplicador de EXP debe ser 1.5');
    });
    
    runner.test('Configuración de enemigos es válida', () => {
        assert.exists(CONFIG.ENEMY, 'ENEMY config debería existir');
        assert.greaterThan(CONFIG.ENEMY.COUNT, 0, 'Debe haber al menos 1 enemigo');
        assert.greaterThan(CONFIG.ENEMY.HP, 0, 'HP de enemigo debe ser positivo');
        assert.greaterThan(CONFIG.ENEMY.DETECTION_RANGE, 0, 'Rango de detección debe ser positivo');
    });
    
    runner.test('Tiles están definidos correctamente', () => {
        assert.exists(CONFIG.TILES, 'TILES debería existir');
        assert.equals(CONFIG.TILES.GRASS, 0, 'GRASS debe ser 0');
        assert.equals(CONFIG.TILES.WATER, 1, 'WATER debe ser 1');
        assert.equals(CONFIG.TILES.STONE, 2, 'STONE debe ser 2');
        assert.equals(CONFIG.TILES.TREE, 3, 'TREE debe ser 3');
    });
    
    runner.test('Balance del juego es coherente', () => {
        // El daño mínimo debe ser menor que el máximo
        assert.lessThan(CONFIG.PLAYER.BASE_DAMAGE_MIN, CONFIG.PLAYER.BASE_DAMAGE_MAX,
            'Daño mínimo debe ser menor que daño máximo');
        
        assert.lessThan(CONFIG.ENEMY.DAMAGE_MIN, CONFIG.ENEMY.DAMAGE_MAX,
            'Daño enemigo mínimo debe ser menor que máximo');
        
        // El oro mínimo debe ser menor que el máximo
        assert.lessThan(CONFIG.WORLD.CHEST_GOLD_MIN, CONFIG.WORLD.CHEST_GOLD_MAX,
            'Oro mínimo de cofre debe ser menor que máximo');
    });
}
