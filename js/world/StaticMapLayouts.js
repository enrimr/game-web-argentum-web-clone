/**
 * StaticMapLayouts.js
 * Funciones generadoras de layouts para mapas estáticos
 */

import { TILES } from './TileTypes.js';
import { CONFIG } from '../config.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * Genera el layout del bosque oscuro
 */
export function generateDarkForestLayout() {
    const map = [];
    const roofLayer = []; // Capa para techos (vacía para bosque)
    const doorLayer = []; // Capa para puertas (vacía para bosque)
    const windowLayer = []; // Capa para ventanas (vacía para bosque)
    
    // Base de hierba con muros perimetrales
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        const roofRow = [];
        const doorRow = [];
        const windowRow = [];
        
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
            roofRow.push(0); // No hay techos en el bosque
            doorRow.push(0);  // No hay puertas en el bosque
            windowRow.push(0); // No hay ventanas en el bosque
        }
        map.push(row);
        roofLayer.push(roofRow);
        doorLayer.push(doorRow);
        windowLayer.push(windowRow);
    }
    
    // Muchos árboles (es un bosque denso)
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            const rand = Math.random();
            if (rand < 0.30) {
                map[y][x] = TILES.TREE;
            } else if (rand < 0.35) {
                map[y][x] = TILES.STONE;
            }
        }
    }
    
    // Caminos estrechos
    for (let x = 5; x < MAP_WIDTH - 5; x++) {
        if (x < MAP_WIDTH && 20 < MAP_HEIGHT) {
            map[20][x] = TILES.PATH;
        }
    }
    
    // Pequeña cabaña en el bosque
    const cabinX = Math.floor(MAP_WIDTH / 2) - 2;
    const cabinY = Math.floor(MAP_HEIGHT / 2) - 2;
    
    // Estructura de la cabaña
    for (let y = cabinY; y < cabinY + 5; y++) {
        for (let x = cabinX; x < cabinX + 5; x++) {
            if (y === cabinY || y === cabinY + 4 || x === cabinX || x === cabinX + 4) {
                map[y][x] = TILES.BUILDING;
            } else {
                map[y][x] = TILES.FLOOR_INTERIOR;
            }
        }
    }
    
    // Puerta
    map[cabinY + 4][cabinX + 2] = TILES.FLOOR_INTERIOR;
    doorLayer[cabinY + 4][cabinX + 2] = TILES.DOOR_CLOSED_LEFT;
    
    // Ventana
    windowLayer[cabinY + 2][cabinX] = TILES.WINDOW;
    
    // Techo
    for (let y = cabinY; y < cabinY + 5; y++) {
        for (let x = cabinX; x < cabinX + 5; x++) {
            roofLayer[y][x] = TILES.ROOF;
        }
    }
    
    // Devolver el formato multicapa
    return {
        map: map,
        roofLayer: roofLayer,
        doorLayer: doorLayer,
        windowLayer: windowLayer
    };
}

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
    const roofLayer = []; // Capa para techos (vacía para campo)
    const doorLayer = []; // Capa para puertas (vacía para campo)
    const windowLayer = []; // Capa para ventanas (vacía para campo)
    
    // Base de hierba con muros perimetrales
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        const roofRow = [];
        const doorRow = [];
        const windowRow = [];
        
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                row.push(TILES.GRASS);
            }
            roofRow.push(0); // No hay techos en el campo
            doorRow.push(0);  // No hay puertas en el campo
            windowRow.push(0); // No hay ventanas en el campo
        }
        map.push(row);
        roofLayer.push(roofRow);
        doorLayer.push(doorRow);
        windowLayer.push(windowRow);
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
    
    // Devolver el mismo formato que generateNewbieCityWithBuildings para consistencia
    return {
        map: map,
        roofLayer: roofLayer,
        doorLayer: doorLayer,
        windowLayer: windowLayer
    };
}

/**
 * Crear layout de edificio simple para ciudad
 * @param {Array} map - Mapa para modificar
 * @param {number} buildingX - Posición X del edificio (esquina superior izquierda)
 * @param {number} buildingY - Posición Y del edificio (esquina superior izquierda)
 * @param {number} width - Ancho del edificio
 * @param {number} height - Alto del edificio
 * @param {Object} layers - Capas adicionales (roofLayer, doorLayer, etc.)
 */
function createSimpleBuilding(map, buildingX, buildingY, width, height, layers) {
    console.log(`🏠 Creando edificio simple en (${buildingX}, ${buildingY}) con dimensiones ${width}x${height}`);
    
    // Paredes del edificio
    for (let y = buildingY; y < buildingY + height; y++) {
        for (let x = buildingX; x < buildingX + width; x++) {
            if (y === buildingY || y === buildingY + height - 1 || 
                x === buildingX || x === buildingX + width - 1) {
                // Pared exterior
                map[y][x] = TILES.BUILDING;
            } else {
                // Suelo interior
                map[y][x] = TILES.FLOOR_INTERIOR;
            }
            
            // Techo para todo el edificio en la capa de techos
            if (layers.roofLayer) {
                layers.roofLayer[y][x] = TILES.ROOF;
            }
        }
    }
    
    // Puerta central en la pared inferior
    const doorX = buildingX + Math.floor(width / 2);
    const doorY = buildingY + height - 1;
    
    // IMPORTANTE: Usar los tipos DOOR_CLOSED_LEFT y WINDOW específicos
    map[doorY][doorX] = TILES.DOOR_CLOSED_LEFT; // Tile de puerta en el mapa base
    
    // Agregar puerta a la capa de puertas si existe
    if (layers.doorLayer) {
        layers.doorLayer[doorY][doorX] = TILES.DOOR_CLOSED_LEFT;
        console.log(`🚪 Puerta agregada en (${doorX}, ${doorY}) con tipo ${TILES.DOOR_CLOSED_LEFT}`);
    }
    
    // Añadir ventana en el centro del muro frontal
    const windowY = doorY - 1;
    if (windowY > buildingY && layers.windowLayer) {
        layers.windowLayer[windowY][doorX] = TILES.WINDOW;
        console.log(`🪟 Ventana agregada en (${doorX}, ${windowY}) con tipo ${TILES.WINDOW}`);
    }
    
    // Agregar "sombra" frente a la puerta
    if (doorY + 1 < map.length) {
        map[doorY + 1][doorX] = TILES.DOOR_SHADOW;
    }
    
    // Verificar valores de techos en esta ubicación
    if (layers.roofLayer) {
        const roofValue = layers.roofLayer[buildingY + 1][buildingX + 1];
        console.log(`🏠 Valor de techo en interior (${buildingX+1}, ${buildingY+1}): ${roofValue}`);
    }
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
 * Genera el layout de la ciudad inicial con edificios navegables (fachadas de 2 filas, puertas, sombras)
 * Si no existe, exporta el mapa a un archivo JSON la primera vez que se ejecuta
 */
export function generateNewbieCityWithBuildings() {
    const map = [];
    const roofLayer = []; // Capa para los techos
    const doorLayer = []; // Capa para las puertas
    const windowLayer = []; // Nueva capa para las ventanas

    // Crear base con paredes (excepto el borde este que conecta con training_fields)
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        const roofRow = [];
        const doorRow = [];
        const windowRow = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Dejar el borde este (x = MAP_WIDTH - 1) abierto para transición a training_fields
            if (x === 0 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else if (x === MAP_WIDTH - 1) {
                row.push(TILES.PATH); // Path para indicar salida al este
            } else {
                row.push(TILES.GRASS);
            }
            roofRow.push(0); // 0 = no hay techo
            doorRow.push(0);  // 0 = no hay puerta
            windowRow.push(0); // 0 = no hay ventana
        }
        map.push(row);
        roofLayer.push(roofRow);
        doorLayer.push(doorRow);
        windowLayer.push(windowRow);
    }

    // Calles en cruz
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
        map[20][x] = TILES.PATH;
    }
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        map[y][25] = TILES.PATH;
    }

    // Plaza central grande
    for (let y = 15; y < 25; y++) {
        for (let x = 20; x < 31; x++) {
            map[y][x] = TILES.PATH;
        }
    }
    
    // Detalles decorativos en la plaza (fuente o estatua en el centro)
    map[20][25] = TILES.STONE; // Piedra central como estatua o fuente

    // Edificios con fachadas de 2 filas (ventanas arriba, puerta abajo)
    const buildings = [
        // Casa norte-izquierda (fachada sur)
        { x: 5, y: 5, w: 8, h: 6, facadeSide: 'south' },
        // Casa norte-derecha (fachada sur)
        { x: 37, y: 5, w: 8, h: 6, facadeSide: 'south' },
        // Casa sur-izquierda (fachada sur)
        { x: 5, y: 28, w: 8, h: 6, facadeSide: 'south' },
        // Casa sur-derecha (fachada sur)
        { x: 37, y: 28, w: 8, h: 6, facadeSide: 'south' },
        // Casa central-izquierda (fachada sur)
        { x: 15, y: 10, w: 6, h: 5, facadeSide: 'south' },
        // Casa central-derecha (fachada sur)
        { x: 31, y: 10, w: 6, h: 5, facadeSide: 'south' }
    ];

    for (const building of buildings) {
        // 1. TECHOS (arriba de todo, pero no sobre fachada ni ventanas) - ahora en la capa de techos
        // Determinar las filas de fachada y ventanas
        const facadeY = building.y + building.h - 1; // Fila inferior de fachada
        const windowY = building.y + building.h - 2; // Fila superior de fachada (ventanas)
        
        // Colocar techos solo en el interior, excluyendo fachada y ventanas
        for (let y = building.y; y < building.y + building.h - 2; y++) {
            for (let x = building.x; x < building.x + building.w; x++) {
                if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                    roofLayer[y][x] = TILES.ROOF;
                }
            }
        }

        // 2. INTERIOR (suelos)
        for (let y = building.y + 1; y < building.y + building.h - 1; y++) {
            for (let x = building.x + 1; x < building.x + building.w - 1; x++) {
                if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                    map[y][x] = TILES.FLOOR_INTERIOR;
                }
            }
        }

        // 3. PAREDES EXTERIORES
        // Paredes laterales y traseras siguen siendo BUILDING
        for (let y = building.y; y < building.y + building.h; y++) {
            // Pared izquierda
            if (building.x >= 0 && building.x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                map[y][building.x] = TILES.BUILDING;
            }
            // Pared derecha
            if (building.x + building.w - 1 >= 0 && building.x + building.w - 1 < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                map[y][building.x + building.w - 1] = TILES.BUILDING;
            }
        }
        // Pared superior
        for (let x = building.x; x < building.x + building.w; x++) {
            if (x >= 0 && x < MAP_WIDTH && building.y >= 0 && building.y < MAP_HEIGHT) {
                map[building.y][x] = TILES.BUILDING;
            }
        }

        // 4. FACHADA DE 2 FILAS (ventanas arriba, puerta abajo)
        // Variables facadeY y windowY ya declaradas arriba
        const doorX1 = building.x + Math.floor(building.w / 2) - 1; // Puerta izquierda
        const doorX2 = building.x + Math.floor(building.w / 2); // Puerta derecha
        const shadowY = facadeY + 1; // Sombra frente a puerta
        
        // Debug log para verificar la creación de fachadas
        console.log(`🏠 Creando fachada para edificio en (${building.x}, ${building.y})`);
        console.log(`  - Fila de ventanas en Y=${windowY} [TILE=${TILES.WINDOW}]`);
        console.log(`  - Fila de puertas en Y=${facadeY}, puertas en X=${doorX1},${doorX2} [TILE=${TILES.DOOR}]`);
        console.log(`  - Sombras de entrada en Y=${shadowY}, X=${doorX1},${doorX2} [TILE=${TILES.DOOR_SHADOW}]`);
        
        // Muestra información detallada en la consola para verificación
        console.log(`  * ESTRUCTURA DETALLADA EDIFICIO:
           - Techo (ROOF): ${TILES.ROOF}
           - Ventanas (WINDOW): ${TILES.WINDOW}
           - Puertas (DOOR): ${TILES.DOOR}
           - Fachada (FACADE): ${TILES.FACADE}
           - Paredes (BUILDING): ${TILES.BUILDING}
           - Sombras (DOOR_SHADOW): ${TILES.DOOR_SHADOW}
           - Interior (FLOOR_INTERIOR): ${TILES.FLOOR_INTERIOR}`);

        // Fila superior: VENTANAS (ahora en capa separada) con SUELO_INTERIOR en la capa base
        for (let x = building.x; x < building.x + building.w; x++) {
            if (x >= 0 && x < MAP_WIDTH && windowY >= 0 && windowY < MAP_HEIGHT) {
                // Corregir las esquinas en la capa base - deben ser paredes (BUILDING), no suelo interior
                if (x === building.x || x === building.x + building.w - 1) {
                    map[windowY][x] = TILES.BUILDING;
                } else {
                    // El resto del interior es suelo
                    map[windowY][x] = TILES.FLOOR_INTERIOR;
                }
                
                // Si la ventana está justo encima de una puerta, hacerla caminable
                if (x === doorX1 || x === doorX2) {
                    windowLayer[windowY][x] = TILES.WINDOW_WALKABLE;
                } else {
                    windowLayer[windowY][x] = TILES.WINDOW;
                }
            }
        }

        // Fila inferior: FACHADAS + PUERTAS en el centro (toda la fila es fachada)
        for (let x = building.x; x < building.x + building.w; x++) {
            if (x >= 0 && x < MAP_WIDTH && facadeY >= 0 && facadeY < MAP_HEIGHT) {
                if (x === doorX1 || x === doorX2) {
                    // Colocar FLOOR_INTERIOR en la capa base bajo las puertas
                    map[facadeY][x] = TILES.FLOOR_INTERIOR;
                    
                    // Aleatoriamente algunas puertas estarán cerradas por defecto
                    const doorIsClosed = Math.random() > 0.5;
                    
                    if (doorIsClosed) {
                        // Si la puerta está cerrada, determinar qué tipo según su posición
                        if (doorX1 === x && doorX2 === x + 1) {
                            // Primera puerta de un par doble - pomo a la derecha
                            doorLayer[facadeY][x] = TILES.DOOR_CLOSED_LEFT;
                        } else if (doorX2 === x && doorX1 === x - 1) {
                            // Segunda puerta de un par doble - pomo a la izquierda
                            doorLayer[facadeY][x] = TILES.DOOR_CLOSED_RIGHT;
                        } else {
                            // Puerta individual o caso no previsto - pomo a la derecha por defecto
                            doorLayer[facadeY][x] = TILES.DOOR_CLOSED_LEFT;
                        }
                    } else {
                        // Si está abierta, determinar dirección de apertura
                        if (doorX1 === x && doorX2 === x + 1) {
                            // Primera puerta de un par doble - abre hacia la izquierda
                            doorLayer[facadeY][x] = TILES.DOOR_OPEN_LEFT;
                        } else if (doorX2 === x && doorX1 === x - 1) {
                            // Segunda puerta de un par doble - abre hacia la derecha
                            doorLayer[facadeY][x] = TILES.DOOR_OPEN_RIGHT;
                        } else {
                            // Puerta individual o caso no previsto - abre hacia la izquierda por defecto
                            doorLayer[facadeY][x] = TILES.DOOR_OPEN_LEFT;
                        }
                    }
                } else {
                    map[facadeY][x] = TILES.FACADE; // Fachada en lugar de paredes para mejor visualización
                }
            }
        }

        // SOMBRAS frente a las puertas
        if (doorX1 >= 0 && doorX1 < MAP_WIDTH && shadowY >= 0 && shadowY < MAP_HEIGHT) {
            map[shadowY][doorX1] = TILES.DOOR_SHADOW;
        }
        if (doorX2 >= 0 && doorX2 < MAP_WIDTH && shadowY >= 0 && shadowY < MAP_HEIGHT) {
            map[shadowY][doorX2] = TILES.DOOR_SHADOW;
        }
    }

    // Preparar el resultado para devolver
    const mapData = {
        map: map,
        roofLayer: roofLayer,
        doorLayer: doorLayer,
        windowLayer: windowLayer
    };
    
    // Registrar el mapa para exportación en el panel de depuración (sin descarga automática)
    try {
        import('../world/MapExporter.js').then(({ addExportButton }) => {
            // Solo registrar para el panel de depuración, sin descarga automática
            console.log('📝 Registrando mapa Newbie City con edificios para exportación manual...');
            
            // Añadir un botón al panel de depuración para exportar manualmente
            addExportButton('newbie_city_detailed', mapData);
        }).catch(err => {
            console.error('❌ Error al importar MapExporter:', err);
        });
    } catch (error) {
        console.error('❌ Error al intentar registrar el mapa para exportación:', error);
    }
    
    return mapData;
}
