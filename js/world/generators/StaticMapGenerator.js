/**
 * StaticMapGenerator.js
 * Generadores específicos para mapas estáticos como ciudades iniciales,
 * campos de entrenamiento, etc.
 */

import { CONFIG } from '../../config.js';
import { TILES } from '../TileTypes.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Generate newbie city layout (static)
 * @returns {Array} 2D array representing the newbie city
 */
export function generateNewbieCityLayout() {
    const map = [];

    // Create base with walls
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
        }
        map.push(row);
    }

    // Streets in cross pattern
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
        map[20][x] = TILES.PATH;
    }
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        map[y][25] = TILES.PATH;
    }

    // Plaza central
    for (let y = 18; y < 23; y++) {
        for (let x = 23; x < 28; x++) {
            map[y][x] = TILES.PATH;
        }
    }

    // Buildings
    const buildings = [
        { x: 5, y: 5, w: 8, h: 6 },
        { x: 37, y: 5, w: 8, h: 6 },
        { x: 5, y: 28, w: 8, h: 6 },
        { x: 37, y: 28, w: 8, h: 6 },
        { x: 15, y: 10, w: 6, h: 5 },
        { x: 31, y: 10, w: 6, h: 5 }
    ];

    for (const building of buildings) {
        for (let y = building.y; y < building.y + building.h; y++) {
            for (let x = building.x; x < building.x + building.w; x++) {
                if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
                    map[y][x] = TILES.BUILDING;
                }
            }
        }
    }

    return map;
}

/**
 * Generate newbie field layout (static)
 * @returns {Object} Object with map layers
 */
/*export function generateNewbieFieldLayout() {
    console.log("🏞️ Generando mapa newbie_field con estructura multicapa");
    
    // Crear mapas como objetos con capas
    const baseLayer = [];
    const objectsLayer = [];
    const roofsLayer = [];
    const doorLayer = [];
    
    // Inicializar todas las capas
    for (let y = 0; y < MAP_HEIGHT; y++) {
        baseLayer[y] = [];
        objectsLayer[y] = [];
        roofsLayer[y] = [];
        doorLayer[y] = [];
        
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Inicializar con valores por defecto
            objectsLayer[y][x] = 0;
            roofsLayer[y][x] = 0;
            doorLayer[y][x] = 0;
            
            // Generar el terreno base
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                baseLayer[y][x] = TILES.WALL;
            } else {
                baseLayer[y][x] = TILES.GRASS;
            }
        }
    }
    
    // Agregar obstáculos en la capa de objetos
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            const rand = Math.random();
            if (rand < 0.05) {
                // Árboles en la capa de objetos
                objectsLayer[y][x] = TILES.TREE;
            } else if (rand < 0.07) {
                // Piedras en la capa de objetos
                objectsLayer[y][x] = TILES.STONE;
            }
        }
    }
    
    // Agregar camino en la capa base
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x < MAP_WIDTH && 15 < MAP_HEIGHT) {
            baseLayer[15][x] = TILES.PATH;
        }
    }
    
    // Dejar área del portal despejada
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const portalX = 25 + dx;
            const portalY = 37 + dy;
            if (portalX > 0 && portalX < MAP_WIDTH - 1 && portalY > 0 && portalY < MAP_HEIGHT - 1) {
                baseLayer[portalY][portalX] = TILES.GRASS;  // Garantizar que el área del portal es caminable
                objectsLayer[portalY][portalX] = 0;  // Eliminar cualquier objeto en la posición del portal
            }
        }
    }

    console.log(`✅ Generado mapa newbie_field con estructura multicapa: ${baseLayer.length}x${baseLayer[0].length}`);
    
    // Devolver el resultado como un objeto con capas
    return {
        map: baseLayer,
        objectsLayer: objectsLayer,
        roofLayer: roofsLayer,
        doorLayer: doorLayer,
        windowLayer: Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(0))
    };
}
*/
/**
 * Generate dark forest layout (static)
 * @returns {Array} 2D array representing the dark forest
 */
export function generateDarkForestLayout() {
    console.log("🌲 Generando mapa dark_forest directamente como array 2D");
    
    // Crear mapa directamente como array 2D (enfoque simple y seguro)
    const map = [];
    
    // Generar el terreno base
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
        }
        map.push(row);
    }
    
    // Agregar árboles y piedras (más densidad que en newbie_field)
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            const rand = Math.random();
            if (rand < 0.35) {
                map[y][x] = TILES.TREE;
            } else if (rand < 0.38) {
                map[y][x] = TILES.STONE;
            }
        }
    }
    
    // Agregar camino central
    for (let x = 5; x < MAP_WIDTH - 5; x++) {
        if (x < MAP_WIDTH && 20 < MAP_HEIGHT) {
            map[20][x] = TILES.PATH;
            if (21 < MAP_HEIGHT) map[21][x] = TILES.PATH;
        }
    }
    
    // Dejar área del portal despejada
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const portalX = 25 + dx;
            const portalY = 5 + dy;
            if (portalX > 0 && portalX < MAP_WIDTH - 1 && portalY > 0 && portalY < MAP_HEIGHT - 1) {
                map[portalY][portalX] = TILES.GRASS;  // Garantizar que el área del portal es caminable
            }
        }
    }

    console.log(`✅ Generado mapa dark_forest: ${map.length}x${map[0].length}`);
    
    return map;
}
