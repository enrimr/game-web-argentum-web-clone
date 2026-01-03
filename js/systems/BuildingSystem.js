/**
 * BuildingSystem.js
 * Sistema de manejo de edificios con capas y navegación interior
 */

import { gameState, toggleDoorState, isDoorOpen, setDoorState } from '../state.js';
import { TILES, isDoor, isRoof, isToggleableDoor, isClosedDoor, isOpenDoor, getDoorOpenType, getDoorClosedType } from '../world/TileTypes.js';
import { CONFIG } from '../config.js';
import { addChatMessage } from '../ui/UI.js';

/**
 * Check if player is entering a building through a door
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export function checkDoorEntry(x, y) {
    // Verificar explícitamente que es una puerta
    if (!gameState.map || !gameState.map[y] || gameState.map[y][x] === undefined) {
        return;
    }
    
    // Verificar si es una puerta y está abierta (en cualquier capa)
    let doorTile = null;
    
    // Comprobar primero en la capa de puertas
    if (gameState.doorLayer && gameState.doorLayer[y] && gameState.doorLayer[y][x] !== undefined) {
        doorTile = gameState.doorLayer[y][x];
    }
    
    // Si no hay puerta en la capa superior, comprobar en la capa base (compatibilidad)
    if (doorTile === null || doorTile === 0) {
        doorTile = gameState.map[y][x];
    }
    
    // Si es una puerta cerrada, no podemos entrar
    if (isClosedDoor(doorTile)) {
        addChatMessage('system', '🔒 La puerta está cerrada. Necesitas abrirla primero (pulsa E).');
        return;
    }
    
    if (!isOpenDoor(doorTile)) return;
    
    console.log(`🚪 Entrando por puerta abierta en (${x}, ${y})`);

    // Find building boundaries around the door
    const buildingBounds = findBuildingBounds(x, y);
    if (!buildingBounds) {
        console.log(`❌ No se encontraron límites de edificio alrededor de la puerta en (${x}, ${y})`);
        return;
    }

    console.log(`🏠 Edificio encontrado: ${buildingBounds.x},${buildingBounds.y} [${buildingBounds.width}x${buildingBounds.height}]`);
    
    // Toggle interior/exterior mode
    toggleBuildingInterior(buildingBounds);
}

/**
 * Find building boundaries around a door
 * @param {number} doorX - Door X coordinate
 * @param {number} doorY - Door Y coordinate
 * @returns {Object|null} Building bounds {x, y, width, height}
 */
function findBuildingBounds(doorX, doorY) {
    // Search for building walls around the door
    // Look for a rectangular building containing the door

    let minX = doorX;
    let maxX = doorX;
    let minY = doorY;
    let maxY = doorY;

    // Expand horizontally
    while (minX > 0 && gameState.map[doorY][minX - 1] === TILES.BUILDING) minX--;
    while (maxX < CONFIG.MAP_WIDTH - 1 && gameState.map[doorY][maxX + 1] === TILES.BUILDING) maxX++;

    // Expand vertically
    while (minY > 0 && gameState.map[minY - 1][doorX] === TILES.BUILDING) minY--;
    while (maxY < CONFIG.MAP_HEIGHT - 1 && gameState.map[maxY + 1][doorX] === TILES.BUILDING) maxY++;

    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
}

/**
 * Toggle between interior and exterior building view
 * @param {Object} buildingBounds - Building boundaries
 */
function toggleBuildingInterior(buildingBounds) {
    if (gameState.playerInBuilding) {
        // Exit building
        exitBuilding();
    } else {
        // Enter building
        enterBuilding(buildingBounds);
    }
}

/**
 * Enter a building and show interior
 * @param {Object} buildingBounds - Building boundaries
 */
function enterBuilding(buildingBounds) {
    gameState.playerInBuilding = true;
    gameState.currentBuilding = buildingBounds;
    gameState.buildingLayer = 1; // Interior layer

    console.log(`🏠 Entrando al edificio: ${buildingBounds.width}x${buildingBounds.height}`);

    // Record this building as "visited" using a unique identifier based on its position and size
    const buildingId = `${gameState.currentMap}_${buildingBounds.x}_${buildingBounds.y}_${buildingBounds.width}_${buildingBounds.height}`;
    
    // Solo registramos permanentemente el edificio si la configuración lo permite
    if (CONFIG.BUILDING.PERSISTENT_ROOF_VISIBILITY && !gameState.enteredBuildings.includes(buildingId)) {
        gameState.enteredBuildings.push(buildingId);
        console.log(`✅ Edificio registrado como visitado: ${buildingId}`);
        console.log(`📋 Edificios visitados: ${gameState.enteredBuildings.length}`);
        
        // Mensaje de chat para el usuario que indica que el edificio ha sido descubierto
        import('../ui/UI.js').then(UI => {
            UI.addChatMessage('system', '🏠 ¡Has descubierto un nuevo edificio! Su interior será visible cuando estés fuera.');
        });
    }

    // The renderer will handle the roof occlusion based on player location
    // and whether the building has been visited before
}

/**
 * Exit building and return to exterior view
 */
function exitBuilding() {
    // Si no queremos persistencia de techos visibles, eliminamos el edificio de la lista
    // de edificios visitados para que vuelva a mostrarse el techo
    if (!CONFIG.BUILDING.PERSISTENT_ROOF_VISIBILITY && gameState.currentBuilding) {
        const buildingId = `${gameState.currentMap}_${gameState.currentBuilding.x}_${gameState.currentBuilding.y}_${gameState.currentBuilding.width}_${gameState.currentBuilding.height}`;
        
        // Buscar y eliminar el edificio de la lista de visitados
        const index = gameState.enteredBuildings.indexOf(buildingId);
        if (index !== -1) {
            gameState.enteredBuildings.splice(index, 1);
            console.log(`🔄 Restaurando techo del edificio: ${buildingId}`);
        }
    }

    gameState.playerInBuilding = false;
    gameState.currentBuilding = null;
    gameState.buildingLayer = 0; // Exterior layer

    console.log('🏠 Saliendo del edificio');
}

/**
 * Check if player should exit building (walking through door from inside)
 * @param {number} x - Target X coordinate
 * @param {number} y - Target Y coordinate
 */
export function checkBuildingExit(x, y) {
    if (!gameState.playerInBuilding) return;

    // Comprobar si hay puerta en la posición (en cualquier capa)
    let doorTile = null;
    
    // Comprobar primero en la capa de puertas
    if (gameState.doorLayer && gameState.doorLayer[y] && gameState.doorLayer[y][x] !== undefined) {
        doorTile = gameState.doorLayer[y][x];
    }
    
    // Si no hay puerta en la capa superior, comprobar en la capa base (compatibilidad)
    if (doorTile === null || doorTile === 0) {
        doorTile = gameState.map[y][x];
    }

    // If player walks through an open door while inside, exit
    if (isOpenDoor(doorTile)) {
        exitBuilding();
    } else if (isClosedDoor(doorTile)) {
        // Si la puerta está cerrada, mostrar mensaje
        addChatMessage('system', '🔒 La puerta está cerrada. Necesitas abrirla primero (pulsa E).');
    }
}

/**
 * Interactuar con una puerta (abrir o cerrar)
 * @param {number} x - Coordenada X de la puerta
 * @param {number} y - Coordenada Y de la puerta
 */
export function toggleDoor(x, y) {
    if (!gameState.map || !gameState.map[y] || gameState.map[y][x] === undefined) {
        return false;
    }

    // Verificar si es una puerta que se puede abrir/cerrar (en cualquiera de las capas)
    let currentDoorTile = null;

    // Comprobar si hay una puerta en la capa de puertas
    if (gameState.doorLayer && gameState.doorLayer[y] && gameState.doorLayer[y][x] !== undefined) {
        currentDoorTile = gameState.doorLayer[y][x];
    }
    // O si hay una puerta en la capa base (compatibilidad con código existente)
    else {
        currentDoorTile = gameState.map[y][x];
    }

    if (!isToggleableDoor(currentDoorTile)) {
        return false;
    }

    // Determinar el estado actual de la puerta basado en el tile visual
    const currentlyOpen = isOpenDoor(currentDoorTile);

    // El nuevo estado será el opuesto del estado actual visual
    const shouldBeOpen = !currentlyOpen;

    // Actualizar el estado en gameState para futuras referencias
    setDoorState(gameState.currentMap, x, y, shouldBeOpen);

    // Inicializar la capa de puertas si no existe
    if (!gameState.doorLayer) {
        gameState.doorLayer = [];
    }
    if (!gameState.doorLayer[y]) {
        gameState.doorLayer[y] = [];
    }

    // Asegurarse de que hay un suelo interior en la capa base
    gameState.map[y][x] = TILES.FLOOR_INTERIOR;

    // Determinar el tipo correcto de puerta según el nuevo estado y su dirección
    if (shouldBeOpen) {
        // Si la abrimos, determinar si se abre a la izquierda o derecha
        const doorOpenType = getDoorOpenType(x, y, gameState.doorLayer);
        gameState.doorLayer[y][x] = doorOpenType;
    } else {
        // Si la cerramos, determinar en qué lado debe estar el pomo
        const doorClosedType = getDoorClosedType(x, y, gameState.doorLayer);
        gameState.doorLayer[y][x] = doorClosedType;
    }

    // Mostrar mensaje
    addChatMessage('system', shouldBeOpen ?
        '🔓 Has abierto la puerta.' :
        '🔒 Has cerrado la puerta con llave.');

    console.log(`🚪 Puerta en (${x}, ${y}) ahora está ${shouldBeOpen ? 'abierta' : 'cerrada'}`);

    return true;
}

/**
 * Comprobar si hay una puerta frente al jugador
 * @param {number} playerX - Posición X del jugador
 * @param {number} playerY - Posición Y del jugador 
 * @param {string} facing - Dirección hacia la que mira el jugador ('up', 'down', 'left', 'right')
 * @returns {Object|null} Coordenadas de la puerta {x,y} o null
 */
export function getDoorInFrontOfPlayer(playerX, playerY, facing) {
    // Determinar la posición frente al jugador según la dirección
    let doorX = playerX;
    let doorY = playerY;
    
    switch (facing) {
        case 'up':
            doorY = playerY - 1;
            break;
        case 'down':
            doorY = playerY + 1;
            break;
        case 'left':
            doorX = playerX - 1;
            break;
        case 'right':
            doorX = playerX + 1;
            break;
    }
    
    // Verificar si hay una puerta en esa posición (en cualquier capa)
    
    // Comprobar primero en la capa de puertas
    if (gameState.doorLayer && gameState.doorLayer[doorY] && gameState.doorLayer[doorY][doorX] !== undefined) {
        const doorTile = gameState.doorLayer[doorY][doorX];
        if (isToggleableDoor(doorTile)) {
            return {x: doorX, y: doorY};
        }
    }
    
    // Si no hay puerta en la capa superior, comprobar en la capa base (compatibilidad)
    if (!gameState.map || !gameState.map[doorY] || !gameState.map[doorY][doorX]) {
        return null;
    }
    
    const tile = gameState.map[doorY][doorX];
    if (isToggleableDoor(tile)) {
        return {x: doorX, y: doorY};
    }
    
    return null;
}

/**
 * Check if a roof tile should be rendered (based on player position and building visitation history)
 * @param {number} x - Tile X coordinate
 * @param {number} y - Tile Y coordinate
 * @returns {boolean} True if roof should be visible
 */
/**
 * Check if a window tile should be rendered (based on player position and building visitation history)
 * @param {number} x - Tile X coordinate
 * @param {number} y - Tile Y coordinate
 * @returns {boolean} True if window should be visible
 */
export function shouldRenderWindow(x, y) {
    // Check if this is a valid window tile from the window layer
    if (!gameState.windowLayer || !gameState.windowLayer[y] || !gameState.windowLayer[y][x]) {
        return true; // Not a window in the window layer, show normal tile
    }
    
    // Check if player is currently inside this specific building coordinates
    let playerInsideThisBuilding = false;
    const buildingAtWindow = getBuildingAtPosition(x, y);
    
    if (buildingAtWindow) {
        const playerX = gameState.player.x;
        const playerY = gameState.player.y;
        
        // If player coordinates are inside this building's bounds
        playerInsideThisBuilding = 
            playerX >= buildingAtWindow.x && playerX < buildingAtWindow.x + buildingAtWindow.width &&
            playerY >= buildingAtWindow.y && playerY < buildingAtWindow.y + buildingAtWindow.height;
            
        // If player is inside this building, hide the window immediately
        if (playerInsideThisBuilding) {
            return false;
        }
    }
    
    // First check if player is inside a building (normal door entry method)
    if (gameState.playerInBuilding) {
        const building = gameState.currentBuilding;
        if (building) {
            // Check if the coordinate is inside the current building
            const isInThisBuilding = 
                x >= building.x && x < building.x + building.width &&
                y >= building.y && y < building.y + building.height;
                
            if (isInThisBuilding) {
                // Player is inside this building, so hide its windows
                return false;
            }
        }
    }
    
    // Only check previous visits if the configuration is set to maintain roof visibility
    if (CONFIG.BUILDING.PERSISTENT_ROOF_VISIBILITY) {
        // Check if this tile belongs to a building that the player has entered before
        // First try to find the building from the registered buildings list (more efficient)
        let buildingId = null;
        
        for (const building of gameState.buildings) {
            if (x >= building.x && x < building.x + building.width &&
                y >= building.y && y < building.y + building.height) {
                buildingId = `${gameState.currentMap}_${building.x}_${building.y}_${building.width}_${building.height}`;
                break;
            }
        }
        
        // If not found in registered buildings, search for it
        if (!buildingId) {
            const buildingBounds = findBuildingForTile(x, y);
            if (buildingBounds) {
                buildingId = `${gameState.currentMap}_${buildingBounds.x}_${buildingBounds.y}_${buildingBounds.width}_${buildingBounds.height}`;
            }
        }
        
        // If we found a building ID, check if the player has visited it before
        if (buildingId && gameState.enteredBuildings.includes(buildingId)) {
            // Visited building - hide the window just like we hide roofs
            return false;
        }
    }
    
    // Default behavior: show the window
    return true;
}

export function shouldRenderRoof(x, y) {
    // Check if this is a valid roof tile from the roof layer
    if (!gameState.roofLayer || !gameState.roofLayer[y] || gameState.roofLayer[y][x] !== TILES.ROOF) {
        return true; // Not a roof in the roof layer, show normal tile
    }
    
    // Check if player is currently inside this specific building coordinates
    // This ensures the roof is hidden even if the player appears inside without triggering door entry
    let playerInsideThisBuilding = false;
    const buildingAtRoof = getBuildingAtPosition(x, y);
    if (buildingAtRoof) {
        const playerX = gameState.player.x;
        const playerY = gameState.player.y;
        
        // If player coordinates are inside this building's bounds
        playerInsideThisBuilding = 
            playerX >= buildingAtRoof.x && playerX < buildingAtRoof.x + buildingAtRoof.width &&
            playerY >= buildingAtRoof.y && playerY < buildingAtRoof.y + buildingAtRoof.height;
            
        // If player is inside this building, hide the roof immediately
        if (playerInsideThisBuilding) {
            // Add the building to visited list if it's not already there
            // Solo agregamos a la lista permanentemente si está activada la persistencia de techos
            const buildingId = `${gameState.currentMap}_${buildingAtRoof.x}_${buildingAtRoof.y}_${buildingAtRoof.width}_${buildingAtRoof.height}`;
            if (CONFIG.BUILDING.PERSISTENT_ROOF_VISIBILITY && !gameState.enteredBuildings.includes(buildingId)) {
                gameState.enteredBuildings.push(buildingId);
                console.log(`✅ Edificio registrado automáticamente al detectar jugador dentro: ${buildingId}`);
                
                // Mensaje de chat para el usuario que indica que el edificio ha sido descubierto
                import('../ui/UI.js').then(UI => {
                    UI.addChatMessage('system', '🏠 ¡Has descubierto un nuevo edificio! Su interior será visible cuando estés fuera.');
                });
            }
            return false;
        }
    }

    // First check if player is inside a building (normal door entry method)
    if (gameState.playerInBuilding) {
        const building = gameState.currentBuilding;
        if (building) {
            // Check if the coordinate is inside the current building
            const isInThisBuilding = 
                x >= building.x && x < building.x + building.width &&
                y >= building.y && y < building.y + building.height;
                
            if (isInThisBuilding) {
                // Player is inside this building, so hide its roof
                return false;
            }
        }
    }

    // Only check previous visits if the configuration is set to maintain roof visibility
    if (CONFIG.BUILDING.PERSISTENT_ROOF_VISIBILITY) {
        // Check if this tile belongs to a building that the player has entered before
        // First try to find the building from the registered buildings list (more efficient)
        let buildingId = null;
        
        for (const building of gameState.buildings) {
            if (x >= building.x && x < building.x + building.width &&
                y >= building.y && y < building.y + building.height) {
                buildingId = `${gameState.currentMap}_${building.x}_${building.y}_${building.width}_${building.height}`;
                break;
            }
        }
        
        // If not found in registered buildings, search for it
        if (!buildingId) {
            const buildingBounds = findBuildingForTile(x, y);
            if (buildingBounds) {
                buildingId = `${gameState.currentMap}_${buildingBounds.x}_${buildingBounds.y}_${buildingBounds.width}_${buildingBounds.height}`;
            }
        }

        // If we found a building ID, check if the player has visited it before
        if (buildingId && gameState.enteredBuildings.includes(buildingId)) {
            // Visited building - hide the roof
            // Add debug message the first time we hide a roof
            if (!window.debuggedRoofs) {
                window.debuggedRoofs = true;
                console.log(`🏠 Ocultando techo en (${x},${y}) para edificio visitado: ${buildingId}`);
            }
            return false;
        }
    }

    // Default behavior: show the roof
    return true;
}

/**
 * Get the building at a specific position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object|null} Building object or null if no building found
 */
function getBuildingAtPosition(x, y) {
    // First check registered buildings
    for (const building of gameState.buildings) {
        if (x >= building.x && x < building.x + building.width &&
            y >= building.y && y < building.y + building.height) {
            return building;
        }
    }
    
    // If not found in registered buildings, try to find it
    return findBuildingForTile(x, y);
}

/**
 * Get building interior NPCs for current building
 * @returns {Array} Array of NPCs inside the building
 */
export function getBuildingInteriorNPCs() {
    // This would return NPCs that are inside buildings
    // For example, shopkeepers, bankers, etc.

    const interiorNPCs = [];

    if (gameState.playerInBuilding && gameState.currentBuilding) {
        // Add building-specific NPCs based on building type/location
        // This would be configured in the map definitions

        // Example: Add a shopkeeper NPC inside a building
        // interiorNPCs.push(new NPC('merchant_general', interiorX, interiorY));
    }

    return interiorNPCs;
}

/**
 * Check if coordinates are inside the current building
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if inside current building
 */
export function isInsideCurrentBuilding(x, y) {
    if (!gameState.playerInBuilding || !gameState.currentBuilding) return false;

    const building = gameState.currentBuilding;
    return x >= building.x && x < building.x + building.width &&
           y >= building.y && y < building.y + building.height;
}

/**
 * Find the building bounds for a specific tile coordinate
 * @param {number} tileX - X coordinate of the tile
 * @param {number} tileY - Y coordinate of the tile
 * @returns {Object|null} Building bounds {x, y, width, height} or null if not in a building
 */
function findBuildingForTile(tileX, tileY) {
    // First check if this coordinate is within any of the registered buildings
    for (const building of gameState.buildings) {
        if (tileX >= building.x && tileX < building.x + building.width &&
            tileY >= building.y && tileY < building.y + building.height) {
            return building;
        }
    }
    
    // If not found in registered buildings, check if it's a roof tile in the roof layer
    if (!gameState.roofLayer || !gameState.roofLayer[tileY] || 
        gameState.roofLayer[tileY][tileX] !== TILES.ROOF) {
        return null;
    }
    
    // Find the entire roof area this tile belongs to
    let minX = tileX;
    let maxX = tileX;
    let minY = tileY;
    let maxY = tileY;
    
    // Expand horizontally to find roof edges
    while (minX > 0 && gameState.roofLayer[tileY][minX - 1] === TILES.ROOF) {
        minX--;
    }
    
    while (maxX < CONFIG.MAP_WIDTH - 1 && gameState.roofLayer[tileY][maxX + 1] === TILES.ROOF) {
        maxX++;
    }
    
    // Expand vertically to find roof edges
    while (minY > 0 && gameState.roofLayer[minY - 1][tileX] === TILES.ROOF) {
        minY--;
    }
    
    while (maxY < CONFIG.MAP_HEIGHT - 1 && gameState.roofLayer[maxY + 1][tileX] === TILES.ROOF) {
        maxY++;
    }
    
    // Verificar que hay paredes de edificio o puerta asociada
    let doorX = null;
    let doorY = null;
    
    // Check the perimeter for walls or doors
    for (let y = minY - 1; y <= maxY + 1; y++) {
        for (let x = minX - 1; x <= maxX + 1; x++) {
            if (y >= 0 && y < CONFIG.MAP_HEIGHT && x >= 0 && x < CONFIG.MAP_WIDTH) {
                if (gameState.map[y][x] === TILES.BUILDING) {
                    // Found a wall
                    return {
                        x: minX,
                        y: minY,
                        width: maxX - minX + 1,
                        height: maxY - minY + 1,
                        doorX: null,
                        doorY: null
                    };
                } else if (gameState.map[y][x] === TILES.DOOR) {
                    // Found a door
                    doorX = x;
                    doorY = y;
                }
            }
        }
    }
    
    // If we found a door but no walls, use it
    if (doorX !== null && doorY !== null) {
        return {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
            doorX: doorX,
            doorY: doorY
        };
    }
    
    // No building structure found
    return null;
}
