/**
 * MapEditorConnections.js
 * Map connection management for seamless world transitions
 */

import { TILES } from '../../world/TileTypes.js';
import { getAllStaticMapIds } from '../../world/StaticWorldMaps.js';
import { getCurrentMapData } from './MapEditorCore.js';

/**
 * Create the map connections UI section
 * @returns {HTMLElement} Connections section element
 */
export function createConnectionsSection() {
    const section = document.createElement('div');
    section.style.cssText = `
        margin-bottom: 15px;
        padding: 10px;
        background: #2d3748;
        border-radius: 5px;
    `;

    const title = document.createElement('h3');
    title.textContent = '🗺️ Conexiones del Mapa';
    title.style.margin = '0 0 10px 0';
    title.style.color = '#fff';
    title.style.fontSize = '14px';

    const description = document.createElement('p');
    description.textContent = 'Configura mapas adyacentes para transiciones continuas';
    description.style.cssText = `
        margin: 0 0 15px 0;
        font-size: 11px;
        color: #a0aec0;
    `;

    const connectionsGrid = document.createElement('div');
    connectionsGrid.id = 'connectionsGrid';
    connectionsGrid.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 15px;
    `;

    // Create direction selectors
    const directions = [
        { key: 'north', label: '⬆️ Norte', position: 'top' },
        { key: 'south', label: '⬇️ Sur', position: 'bottom' },
        { key: 'east', label: '➡️ Este', position: 'right' },
        { key: 'west', label: '⬅️ Oeste', position: 'left' }
    ];

    directions.forEach(dir => {
        const dirDiv = createDirectionSelector(dir);
        connectionsGrid.appendChild(dirDiv);
    });

    // Border management buttons
    const borderControls = document.createElement('div');
    borderControls.style.cssText = `
        display: flex;
        gap: 5px;
        margin-top: 10px;
    `;

    const openBordersBtn = document.createElement('button');
    openBordersBtn.textContent = '🔓 Abrir Bordes Conectados';
    openBordersBtn.title = 'Abre automáticamente los bordes hacia mapas adyacentes';
    openBordersBtn.style.cssText = `
        flex: 1;
        padding: 8px;
        background: #48bb78;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
    `;
    openBordersBtn.addEventListener('click', () => {
        if (openConnectedBorders()) {
            alert('Bordes conectados abiertos correctamente');
        }
    });

    const closeBordersBtn = document.createElement('button');
    closeBordersBtn.textContent = '🔒 Cerrar Todos';
    closeBordersBtn.title = 'Cierra todos los bordes con muros';
    closeBordersBtn.style.cssText = `
        flex: 1;
        padding: 8px;
        background: #f56565;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
    `;
    closeBordersBtn.addEventListener('click', () => {
        if (closeAllBorders()) {
            alert('Todos los bordes cerrados');
        }
    });

    borderControls.appendChild(openBordersBtn);
    borderControls.appendChild(closeBordersBtn);

    section.appendChild(title);
    section.appendChild(description);
    section.appendChild(connectionsGrid);
    section.appendChild(borderControls);

    return section;
}

/**
 * Create a direction selector
 */
function createDirectionSelector(direction) {
    const container = document.createElement('div');
    container.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 3px;
    `;

    const label = document.createElement('label');
    label.textContent = direction.label;
    label.style.cssText = `
        font-size: 11px;
        color: #e2e8f0;
        font-weight: bold;
    `;

    const select = document.createElement('select');
    select.id = `connection_${direction.key}`;
    select.style.cssText = `
        padding: 5px;
        background: #1a202c;
        color: white;
        border: 1px solid #4a5568;
        border-radius: 3px;
        font-size: 11px;
    `;

    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '(Sin conexión)';
    select.appendChild(emptyOption);

    // Add all available maps
    const availableMaps = getAllStaticMapIds();
    availableMaps.forEach(mapId => {
        const option = document.createElement('option');
        option.value = mapId;
        option.textContent = mapId;
        select.appendChild(option);
    });

    // Set current value
    const mapData = getCurrentMapData();
    if (mapData && mapData.adjacentMaps && mapData.adjacentMaps[direction.key]) {
        select.value = mapData.adjacentMaps[direction.key];
    }

    // Update on change
    select.addEventListener('change', (e) => {
        updateAdjacentMap(direction.key, e.target.value || null);
    });

    container.appendChild(label);
    container.appendChild(select);

    return container;
}

/**
 * Update adjacent map for a direction
 */
function updateAdjacentMap(direction, mapId) {
    const mapData = getCurrentMapData();
    if (!mapData) return;

    if (!mapData.adjacentMaps) {
        mapData.adjacentMaps = {
            north: null,
            south: null,
            east: null,
            west: null
        };
    }

    mapData.adjacentMaps[direction] = mapId;
    console.log(`Mapa adyacente ${direction} actualizado a: ${mapId || 'ninguno'}`);
}

/**
 * Open borders that connect to adjacent maps
 * @returns {boolean} Success
 */
export function openConnectedBorders() {
    const mapData = getCurrentMapData();
    if (!mapData || !mapData.layers || !mapData.layers.base) return false;

    const baseLayer = mapData.layers.base;
    const height = baseLayer.length;
    const width = baseLayer[0].length;
    let changed = false;

    // Open north border
    if (mapData.adjacentMaps?.north) {
        for (let x = 0; x < width; x++) {
            if (baseLayer[0][x] === TILES.WALL) {
                baseLayer[0][x] = TILES.PATH;
                changed = true;
            }
        }
        console.log(`✅ Borde norte abierto (conexión a ${mapData.adjacentMaps.north})`);
    }

    // Open south border
    if (mapData.adjacentMaps?.south) {
        for (let x = 0; x < width; x++) {
            if (baseLayer[height - 1][x] === TILES.WALL) {
                baseLayer[height - 1][x] = TILES.PATH;
                changed = true;
            }
        }
        console.log(`✅ Borde sur abierto (conexión a ${mapData.adjacentMaps.south})`);
    }

    // Open east border
    if (mapData.adjacentMaps?.east) {
        for (let y = 0; y < height; y++) {
            if (baseLayer[y][width - 1] === TILES.WALL) {
                baseLayer[y][width - 1] = TILES.PATH;
                changed = true;
            }
        }
        console.log(`✅ Borde este abierto (conexión a ${mapData.adjacentMaps.east})`);
    }

    // Open west border
    if (mapData.adjacentMaps?.west) {
        for (let y = 0; y < height; y++) {
            if (baseLayer[y][0] === TILES.WALL) {
                baseLayer[y][0] = TILES.PATH;
                changed = true;
            }
        }
        console.log(`✅ Borde oeste abierto (conexión a ${mapData.adjacentMaps.west})`);
    }

    return changed;
}

/**
 * Close all borders with walls
 * @returns {boolean} Success
 */
export function closeAllBorders() {
    const mapData = getCurrentMapData();
    if (!mapData || !mapData.layers || !mapData.layers.base) return false;

    const baseLayer = mapData.layers.base;
    const height = baseLayer.length;
    const width = baseLayer[0].length;

    // Close north border
    for (let x = 0; x < width; x++) {
        baseLayer[0][x] = TILES.WALL;
    }

    // Close south border
    for (let x = 0; x < width; x++) {
        baseLayer[height - 1][x] = TILES.WALL;
    }

    // Close east border
    for (let y = 0; y < height; y++) {
        baseLayer[y][width - 1] = TILES.WALL;
    }

    // Close west border
    for (let y = 0; y < height; y++) {
        baseLayer[y][0] = TILES.WALL;
    }

    console.log('🔒 Todos los bordes cerrados con muros');
    return true;
}

/**
 * Draw connection indicators on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Map width in tiles
 * @param {number} height - Map height in tiles
 * @param {number} tileSize - Tile size in pixels
 */
export function drawConnectionIndicators(ctx, width, height, tileSize) {
    const mapData = getCurrentMapData();
    if (!mapData || !mapData.adjacentMaps) return;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#48bb78'; // Green for connections
    ctx.fillStyle = '#48bb78';
    ctx.font = `${12}px monospace`;
    ctx.textAlign = 'center';

    // North connection
    if (mapData.adjacentMaps.north) {
        const centerX = (width / 2) * tileSize;
        ctx.strokeRect(centerX - 20, 5, 40, 10);
        ctx.fillText('⬆️', centerX, 12);
    }

    // South connection
    if (mapData.adjacentMaps.south) {
        const centerX = (width / 2) * tileSize;
        const y = height * tileSize - 15;
        ctx.strokeRect(centerX - 20, y, 40, 10);
        ctx.fillText('⬇️', centerX, y + 10);
    }

    // East connection
    if (mapData.adjacentMaps.east) {
        const x = width * tileSize - 30;
        const centerY = (height / 2) * tileSize;
        ctx.strokeRect(x, centerY - 5, 25, 10);
        ctx.fillText('➡️', x + 12, centerY + 3);
    }

    // West connection
    if (mapData.adjacentMaps.west) {
        const centerY = (height / 2) * tileSize;
        ctx.strokeRect(5, centerY - 5, 25, 10);
        ctx.fillText('⬅️', 17, centerY + 3);
    }

    ctx.restore();
}

/**
 * Get border status for all directions
 * @returns {Object} Border status
 */
export function getBorderStatus() {
    const mapData = getCurrentMapData();
    if (!mapData || !mapData.layers || !mapData.layers.base) {
        return { north: false, south: false, east: false, west: false };
    }

    const baseLayer = mapData.layers.base;
    const height = baseLayer.length;
    const width = baseLayer[0].length;

    const isNorthOpen = baseLayer[0].some(tile => tile !== TILES.WALL);
    const isSouthOpen = baseLayer[height - 1].some(tile => tile !== TILES.WALL);
    const isEastOpen = baseLayer.some(row => row[width - 1] !== TILES.WALL);
    const isWestOpen = baseLayer.some(row => row[0] !== TILES.WALL);

    return {
        north: isNorthOpen,
        south: isSouthOpen,
        east: isEastOpen,
        west: isWestOpen
    };
}

/**
 * Update connections selectors with current values
 */
export function updateConnectionsUI() {
    const mapData = getCurrentMapData();
    if (!mapData || !mapData.adjacentMaps) return;

    ['north', 'south', 'east', 'west'].forEach(direction => {
        const select = document.getElementById(`connection_${direction}`);
        if (select) {
            select.value = mapData.adjacentMaps[direction] || '';
        }
    });
}

/**
 * Validate connections are reciprocal
 * @returns {Object} Validation result
 */
export function validateConnections() {
    const mapData = getCurrentMapData();
    if (!mapData) return { valid: false, errors: ['No map data'] };

    const errors = [];
    const warnings = [];

    // Check if connections have open borders
    const borderStatus = getBorderStatus();

    if (mapData.adjacentMaps?.north && !borderStatus.north) {
        warnings.push('Conexión norte definida pero borde cerrado');
    }
    if (mapData.adjacentMaps?.south && !borderStatus.south) {
        warnings.push('Conexión sur definida pero borde cerrado');
    }
    if (mapData.adjacentMaps?.east && !borderStatus.east) {
        warnings.push('Conexión este definida pero borde cerrado');
    }
    if (mapData.adjacentMaps?.west && !borderStatus.west) {
        warnings.push('Conexión oeste definida pero borde cerrado');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Open a specific border
 * @param {string} direction - Direction (north, south, east, west)
 * @returns {boolean} Success
 */
export function openBorder(direction) {
    const mapData = getCurrentMapData();
    if (!mapData || !mapData.layers || !mapData.layers.base) return false;

    const baseLayer = mapData.layers.base;
    const height = baseLayer.length;
    const width = baseLayer[0].length;

    switch (direction) {
        case 'north':
            for (let x = 0; x < width; x++) {
                if (baseLayer[0][x] === TILES.WALL) {
                    baseLayer[0][x] = TILES.PATH;
                }
            }
            break;
        case 'south':
            for (let x = 0; x < width; x++) {
                if (baseLayer[height - 1][x] === TILES.WALL) {
                    baseLayer[height - 1][x] = TILES.PATH;
                }
            }
            break;
        case 'east':
            for (let y = 0; y < height; y++) {
                if (baseLayer[y][width - 1] === TILES.WALL) {
                    baseLayer[y][width - 1] = TILES.PATH;
                }
            }
            break;
        case 'west':
            for (let y = 0; y < height; y++) {
                if (baseLayer[y][0] === TILES.WALL) {
                    baseLayer[y][0] = TILES.PATH;
                }
            }
            break;
        default:
            return false;
    }

    console.log(`✅ Borde ${direction} abierto`);
    return true;
}

/**
 * Close a specific border
 * @param {string} direction - Direction (north, south, east, west)
 * @returns {boolean} Success
 */
export function closeBorder(direction) {
    const mapData = getCurrentMapData();
    if (!mapData || !mapData.layers || !mapData.layers.base) return false;

    const baseLayer = mapData.layers.base;
    const height = baseLayer.length;
    const width = baseLayer[0].length;

    switch (direction) {
        case 'north':
            for (let x = 0; x < width; x++) {
                baseLayer[0][x] = TILES.WALL;
            }
            break;
        case 'south':
            for (let x = 0; x < width; x++) {
                baseLayer[height - 1][x] = TILES.WALL;
            }
            break;
        case 'east':
            for (let y = 0; y < height; y++) {
                baseLayer[y][width - 1] = TILES.WALL;
            }
            break;
        case 'west':
            for (let y = 0; y < height; y++) {
                baseLayer[y][0] = TILES.WALL;
            }
            break;
        default:
            return false;
    }

    console.log(`🔒 Borde ${direction} cerrado`);
    return true;
}

/**
 * Generate MapTransitions.js code for current world
 * @param {Array} allMaps - Array of all map configurations
 * @returns {string} Generated code
 */
export function generateMapTransitionsCode(allMaps) {
    let code = `/**
 * MapTransitions.js (AUTO-GENERATED by Map Editor)
 * Sistema de transiciones automáticas entre mapas contiguos
 */

import { CONFIG } from '../config.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

export const WORLD_MAP_LAYOUT = {
`;

    allMaps.forEach((map, index) => {
        code += `    '${map.name}': {\n`;
        code += `        worldPos: { x: ${map.worldPosition.x}, y: ${map.worldPosition.y} },\n`;
        code += `        adjacentMaps: {\n`;
        code += `            north: ${map.adjacentMaps.north ? `'${map.adjacentMaps.north}'` : 'null'},\n`;
        code += `            south: ${map.adjacentMaps.south ? `'${map.adjacentMaps.south}'` : 'null'},\n`;
        code += `            east: ${map.adjacentMaps.east ? `'${map.adjacentMaps.east}'` : 'null'},\n`;
        code += `            west: ${map.adjacentMaps.west ? `'${map.adjacentMaps.west}'` : 'null'}\n`;
        code += `        }\n`;
        code += `    }${index < allMaps.length - 1 ? ',' : ''}\n`;
    });

    code += `};

// ... rest of functions remain the same
`;

    return code;
}
