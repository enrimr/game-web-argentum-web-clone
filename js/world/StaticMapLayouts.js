/**
 * StaticMapLayouts.js
 * Funciones generadoras de layouts para mapas estáticos
 */

import { TILES } from './TileTypes.js';
import { CONFIG } from '../config.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Genera el layout de la ciudad inicial
 */
export function generateNewbieCityLayout() {
    const map = [];
    
    // Crear base con muros perimetrales
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
    
    // Calles principales en forma de cruz
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
    
    // Edificios
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
 * Genera el layout del campo inicial
 */
export function generateNewbieFieldLayout() {
    const map = [];
    
    // Base de hierba con muros perimetrales
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
    
    // Árboles y piedras dispersos
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            const rand = Math.random();
            if (rand < 0.05) {
                map[y][x] = TILES.TREE;
            } else if (rand < 0.07) {
                map[y][x] = TILES.STONE;
            }
        }
    }
    
    // Caminos
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x < MAP_WIDTH && 15 < MAP_HEIGHT) {
            map[15][x] = TILES.PATH;
        }
    }
    
    return map;
}

/**
 * Genera el layout del bosque oscuro
 */
export function generateDarkForestLayout() {
    const map = [];
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                const rand = Math.random();
                if (rand < 0.35) {
                    row.push(TILES.TREE);
                } else if (rand < 0.38) {
                    row.push(TILES.STONE);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }
    
    // Crear camino central
    for (let x = 5; x < MAP_WIDTH - 5; x++) {
        if (x < MAP_WIDTH && 20 < MAP_HEIGHT) {
            map[20][x] = TILES.PATH;
            if (21 < MAP_HEIGHT) map[21][x] = TILES.PATH;
        }
    }
    
    return map;
}

/**
 * Genera el layout de la mazmorra nivel 1
 */
export function generateDungeonLevel1Layout() {
    const map = [];
    
    // Llenar con muros
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            row.push(TILES.DUNGEON_WALL);
        }
        map.push(row);
    }
    
    // Crear salas
    const rooms = [
        { x: 5, y: 5, w: 8, h: 6 },
        { x: 20, y: 5, w: 10, h: 8 },
        { x: 38, y: 5, w: 7, h: 6 },
        { x: 5, y: 20, w: 8, h: 8 },
        { x: 22, y: 22, w: 12, h: 10 },
        { x: 38, y: 25, w: 8, h: 7 }
    ];
    
    for (const room of rooms) {
        for (let y = room.y; y < room.y + room.h && y < MAP_HEIGHT; y++) {
            for (let x = room.x; x < room.x + room.w && x < MAP_WIDTH; x++) {
                map[y][x] = TILES.FLOOR;
            }
        }
    }
    
    // Conectar salas con corredores
    const corridors = [
        { x1: 13, y1: 8, x2: 20, y2: 8 },
        { x1: 30, y1: 8, x2: 38, y2: 8 },
        { x1: 10, y1: 13, x2: 10, y2: 20 },
        { x1: 25, y1: 13, x2: 25, y2: 22 }
    ];
    
    for (const corridor of corridors) {
        if (corridor.x1 === corridor.x2) {
            for (let y = Math.min(corridor.y1, corridor.y2); y <= Math.max(corridor.y1, corridor.y2) && y < MAP_HEIGHT; y++) {
                if (corridor.x1 < MAP_WIDTH) {
                    map[y][corridor.x1] = TILES.FLOOR;
                    if (corridor.x1 + 1 < MAP_WIDTH) map[y][corridor.x1 + 1] = TILES.FLOOR;
                }
            }
        } else {
            for (let x = Math.min(corridor.x1, corridor.x2); x <= Math.max(corridor.x1, corridor.x2) && x < MAP_WIDTH; x++) {
                if (corridor.y1 < MAP_HEIGHT) {
                    map[corridor.y1][x] = TILES.FLOOR;
                    if (corridor.y1 + 1 < MAP_HEIGHT) map[corridor.y1 + 1][x] = TILES.FLOOR;
                }
            }
        }
    }
    
    return map;
}

/**
 * Genera el layout de la isla del tesoro
 */
export function generateTreasureIslandLayout() {
    const map = [];
    
    // Llenar con agua
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            row.push(TILES.WATER);
        }
        map.push(row);
    }
    
    // Crear isla central (forma ovalada)
    const centerX = Math.floor(MAP_WIDTH / 2);
    const centerY = Math.floor(MAP_HEIGHT / 2);
    const radiusX = 15;
    const radiusY = 12;
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const dx = (x - centerX) / radiusX;
            const dy = (y - centerY) / radiusY;
            if (dx * dx + dy * dy < 1) {
                map[y][x] = TILES.GRASS;
            }
        }
    }
    
    // Añadir árboles y piedras en la isla
    for (let y = centerY - radiusY; y < centerY + radiusY && y < MAP_HEIGHT; y++) {
        for (let x = centerX - radiusX; x < centerX + radiusX && x < MAP_WIDTH; x++) {
            if (y >= 0 && x >= 0 && y < MAP_HEIGHT && x < MAP_WIDTH && map[y][x] === TILES.GRASS) {
                const rand = Math.random();
                if (rand < 0.15) {
                    map[y][x] = TILES.TREE;
                } else if (rand < 0.18) {
                    map[y][x] = TILES.STONE;
                }
            }
        }
    }
    
    return map;
}

/**
 * Genera el layout del paso de montaña
 */
export function generateMountainPassLayout() {
    const map = [];

    // Base de hierba
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

    // Añadir montañas (muros) a los lados
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            // Crear paso estrecho en el centro
            if (x < 15 || x > 35) {
                if (Math.random() < 0.4) {
                    map[y][x] = TILES.WALL;
                } else if (Math.random() < 0.2) {
                    map[y][x] = TILES.STONE;
                }
            }
        }
    }

    // Crear camino central despejado
    for (let y = 5; y < MAP_HEIGHT - 5; y++) {
        for (let x = 20; x < 30; x++) {
            if (x < MAP_WIDTH && y < MAP_HEIGHT) {
                map[y][x] = TILES.PATH;
            }
        }
    }

    return map;
}

/**
 * Genera el layout de la ciudad inicial con edificios navegables (puertas, techos, interiores)
 */
export function generateNewbieCityWithBuildings() {
    const map = [];

    // Crear base con paredes
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

    // Calles en cruz
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

    // Edificios con techos y puertas
    const buildings = [
        // Casa norte-izquierda
        {
            x: 5, y: 5, w: 8, h: 6,
            doorX: 8, doorY: 10, // Puerta en fachada sur
            hasInterior: true
        },
        // Casa norte-derecha
        {
            x: 37, y: 5, w: 8, h: 6,
            doorX: 40, doorY: 10,
            hasInterior: true
        },
        // Casa sur-izquierda
        {
            x: 5, y: 28, w: 8, h: 6,
            doorX: 8, doorY: 33,
            hasInterior: true
        },
        // Casa sur-derecha
        {
            x: 37, y: 28, w: 8, h: 6,
            doorX: 40, doorY: 33,
            hasInterior: true
        },
        // Casa central-izquierda
        {
            x: 15, y: 10, w: 6, h: 5,
            doorX: 17, doorY: 14,
            hasInterior: true
        },
        // Casa central-derecha
        {
            x: 31, y: 10, w: 6, h: 5,
            doorX: 33, doorY: 14,
            hasInterior: true
        }
    ];

    // Crear edificios con techos
    for (const building of buildings) {
        // Exterior (paredes)
        for (let y = building.y; y < building.y + building.h; y++) {
            for (let x = building.x; x < building.x + building.w; x++) {
                if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
                    map[y][x] = TILES.BUILDING;
                }
            }
        }

        // Puerta (walkable)
        if (building.doorX >= 0 && building.doorX < MAP_WIDTH &&
            building.doorY >= 0 && building.doorY < MAP_HEIGHT) {
            map[building.doorY][building.doorX] = TILES.DOOR;
        }

        // Techos (arriba del edificio)
        for (let y = building.y - 1; y >= building.y - 2 && y >= 0; y--) {
            for (let x = building.x; x < building.x + building.w; x++) {
                if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                    map[y][x] = TILES.ROOF;
                }
            }
        }

        // Interior (si tiene)
        if (building.hasInterior) {
            for (let y = building.y + 1; y < building.y + building.h - 1; y++) {
                for (let x = building.x + 1; x < building.x + building.w - 1; x++) {
                    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                        map[y][x] = TILES.FLOOR_INTERIOR;
                    }
                }
            }

            // Pared interior (divisor de habitaciones)
            const centerX = building.x + Math.floor(building.w / 2);
            const centerY = building.y + Math.floor(building.h / 2);

            if (centerX >= 0 && centerX < MAP_WIDTH && centerY >= 0 && centerY < MAP_HEIGHT) {
                map[centerY][centerX] = TILES.WALL_INTERIOR;
            }
        }
    }

    return map;
}
