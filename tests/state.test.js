/**
 * Tests para js/state.js
 */

import { gameState, resetGameState } from '../js/state.js';
import { CONFIG } from '../js/config.js';

export function runStateTests(runner, assert) {
    
    runner.test('gameState existe y tiene estructura correcta', () => {
        assert.exists(gameState, 'gameState debería existir');
        assert.isObject(gameState, 'gameState debería ser un objeto');
        assert.exists(gameState.player, 'gameState.player debería existir');
        assert.exists(gameState.stats, 'gameState.stats debería existir');
        assert.exists(gameState.map, 'gameState.map debería existir');
        assert.exists(gameState.objects, 'gameState.objects debería existir');
        assert.exists(gameState.enemies, 'gameState.enemies debería existir');
    });
    
    runner.test('Player tiene propiedades iniciales correctas', () => {
        assert.equals(gameState.player.x, CONFIG.PLAYER.STARTING_X, 'X inicial correcta');
        assert.equals(gameState.player.y, CONFIG.PLAYER.STARTING_Y, 'Y inicial correcta');
        assert.equals(gameState.player.hp, CONFIG.PLAYER.STARTING_HP, 'HP inicial correcta');
        assert.equals(gameState.player.maxHp, CONFIG.PLAYER.STARTING_HP, 'HP máxima inicial correcta');
        assert.equals(gameState.player.mana, CONFIG.PLAYER.STARTING_MANA, 'Mana inicial correcta');
        assert.equals(gameState.player.level, CONFIG.LEVEL.STARTING_LEVEL, 'Nivel inicial correcto');
        assert.equals(gameState.player.exp, CONFIG.LEVEL.STARTING_EXP, 'EXP inicial correcta');
    });
    
    runner.test('Player inventory es un array vacío', () => {
        assert.isArray(gameState.player.inventory, 'Inventory debe ser array');
        assert.equals(gameState.player.inventory.length, 0, 'Inventory debe estar vacío');
    });
    
    runner.test('Stats iniciales son cero', () => {
        assert.equals(gameState.stats.enemiesKilled, 0, 'Enemigos derrotados debe ser 0');
        assert.equals(gameState.stats.chestsOpened, 0, 'Cofres abiertos debe ser 0');
    });
    
    runner.test('Arrays de entidades están vacíos al inicio', () => {
        assert.isArray(gameState.map, 'map debe ser array');
        assert.isArray(gameState.objects, 'objects debe ser array');
        assert.isArray(gameState.enemies, 'enemies debe ser array');
    });
    
    runner.test('resetGameState restaura valores iniciales', () => {
        // Modificar el estado
        gameState.player.hp = 50;
        gameState.player.gold = 100;
        gameState.player.level = 5;
        gameState.stats.enemiesKilled = 10;
        
        // Resetear
        resetGameState();
        
        // Verificar que se restauró
        assert.equals(gameState.player.hp, CONFIG.PLAYER.STARTING_HP, 'HP reseteada');
        assert.equals(gameState.player.gold, 0, 'Oro reseteado');
        assert.equals(gameState.player.level, CONFIG.LEVEL.STARTING_LEVEL, 'Nivel reseteado');
        assert.equals(gameState.stats.enemiesKilled, 0, 'Stats reseteadas');
    });
    
    runner.test('resetGameState limpia arrays', () => {
        // Agregar datos
        gameState.map.push([1, 2, 3]);
        gameState.objects.push({ type: 'chest' });
        gameState.enemies.push({ type: 'goblin' });
        
        // Resetear
        resetGameState();
        
        // Verificar que están vacíos
        assert.equals(gameState.map.length, 0, 'map limpio');
        assert.equals(gameState.objects.length, 0, 'objects limpio');
        assert.equals(gameState.enemies.length, 0, 'enemies limpio');
    });
}
