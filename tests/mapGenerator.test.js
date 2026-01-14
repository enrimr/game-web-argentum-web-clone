/**
 * Tests para MapGenerator refactorizado con patrón Factory + Strategy
 */

import { generateMap, isWalkable } from '../js/world/MapGenerator.js';
import { createFallbackMap } from '../js/world/generators/BaseGenerator.js';

// Tests para verificar que el patrón Factory + Strategy funciona correctamente
const mapGeneratorTests = [
    {
        name: 'generateMap devuelve array válido para field',
        test: () => {
            const map = generateMap('field');
            assert.isArray(map, 'Map debería ser un array');
            assert.greaterThan(map.length, 0, 'Map debería tener filas');
            assert.isArray(map[0], 'Primera fila debería ser un array');
            assert.greaterThan(map[0].length, 0, 'Primera fila debería tener columnas');
        }
    },
    {
        name: 'generateMap devuelve array válido para city',
        test: () => {
            const map = generateMap('city');
            assert.isArray(map, 'Map debería ser un array');
            assert.greaterThan(map.length, 0, 'Map debería tener filas');
        }
    },
    {
        name: 'generateMap maneja tipos de mapa desconocidos',
        test: () => {
            const map = generateMap('unknown_map_type');
            assert.isArray(map, 'Debería devolver fallback para tipo desconocido');
            assert.greaterThan(map.length, 0, 'Fallback debería tener filas');
        }
    },
    {
        name: 'generateMap devuelve mapa válido para newbie_city',
        test: () => {
            const map = generateMap('newbie_city');
            assert.isArray(map, 'Newbie city debería ser un array');
            assert.greaterThan(map.length, 0, 'Newbie city debería tener filas');
        }
    },
    {
        name: 'generateMap devuelve mapa válido para newbie_field',
        test: () => {
            const map = generateMap('newbie_field');
            assert.isArray(map, 'Newbie field debería ser un array');
            assert.greaterThan(map.length, 0, 'Newbie field debería tener filas');
        }
    },
    {
        name: 'isWalkable funciona correctamente',
        test: () => {
            const map = generateMap('field');
            // Probar una posición que debería ser caminable (dentro del mapa)
            const walkable = isWalkable(map, 5, 5);
            assert.exists(walkable, 'isWalkable debería devolver un booleano');
            // Probar posición fuera del mapa
            const notWalkable = isWalkable(map, -1, -1);
            assert.isFalse(notWalkable, 'Posición fuera del mapa no debería ser caminable');
        }
    },
    {
        name: 'MapGeneratorFactory devuelve estrategia correcta',
        test: () => {
            // Importar factory para testear
            const { MapGeneratorFactory } = require('../js/world/MapGenerator.js');

            // Verificar que existe
            assert.exists(MapGeneratorFactory, 'MapGeneratorFactory debería existir');
            assert.isFunction(MapGeneratorFactory.getStrategy, 'getStrategy debería ser una función');

            // Probar diferentes tipos
            const fieldStrategy = MapGeneratorFactory.getStrategy('field');
            assert.exists(fieldStrategy, 'Debería devolver estrategia para field');
            assert.isFunction(fieldStrategy.generate, 'Estrategia debería tener método generate');

            const newbieStrategy = MapGeneratorFactory.getStrategy('newbie_city');
            assert.exists(newbieStrategy, 'Debería devolver estrategia para newbie_city');
        }
    },
    {
        name: 'createFallbackMap funciona correctamente',
        test: () => {
            const fallback = createFallbackMap();
            assert.isArray(fallback, 'Fallback debería ser un array');
            assert.greaterThan(fallback.length, 0, 'Fallback debería tener filas');
            assert.isArray(fallback[0], 'Primera fila debería ser un array');
        }
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = mapGeneratorTests;
}
