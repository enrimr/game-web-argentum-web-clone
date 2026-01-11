/**
 * MapEditor.js
 * Visual Map Editor - Creator for Argentum Online
 * Allows viewing, editing, and creating maps with multiple layers
 */

import { gameState } from '../state.js';
import { TILES, isTileWalkable, isRoof, isOpenDoor, isClosedDoor } from '../world/TileTypes.js';
import { generateTerrainSprites } from '../graphics/sprites/TerrainSprites.js';
import { generateBuildingSprites } from '../graphics/sprites/BuildingSprites.js';
import { generateObjectSprites } from '../graphics/sprites/ObjectSprites.js';
import { generateItemSprites } from '../graphics/sprites/ItemSprites.js';
import { generateNPCSprites } from '../graphics/sprites/NPCSprites.js';
import { generateEnemySprites } from '../graphics/sprites/EnemySprites.js';

// Map Editor variables
let mapEditorVisible = false;
let currentMapData = null;
let currentLayer = 'base';
let selectedTileType = 0;
let selectedTool = 'paint'; // paint, erase, fill
let zoomLevel = 1;
let panOffset = { x: 0, y: 0 };
let isPanning = false;
let lastMousePos = { x: 0, y: 0 };

// Canvas references
let editorCanvas = null;
let editorCtx = null;
let paletteCanvas = null;
let paletteCtx = null;

// Sprite collections
let terrainSprites = {};
let buildingSprites = {};
let objectSprites = {};
let itemSprites = {};
let npcSprites = {};
let enemySprites = {};

// Tile palette data
let tilePalette = [];
let palettePage = 0;
const PALETTE_PAGE_SIZE = 64;

// Layer definitions
const LAYERS = {
    base: { name: 'Base', visible: true, opacity: 1.0 },
    roofs: { name: 'Techos', visible: true, opacity: 1.0 },
    doors: { name: 'Puertas', visible: true, opacity: 1.0 },
    windows: { name: 'Ventanas', visible: true, opacity: 1.0 }
};

/**
 * Initialize the map editor
 */
export function initMapEditor() {
    const TILE_SIZE = gameState.tileSize || 32;

    // Generate all sprite collections
    terrainSprites = generateTerrainSprites(TILE_SIZE);
    buildingSprites = generateBuildingSprites(TILE_SIZE);
    objectSprites = generateObjectSprites(TILE_SIZE);
    itemSprites = generateItemSprites(TILE_SIZE);
    npcSprites = generateNPCSprites(TILE_SIZE);
    enemySprites = generateEnemySprites(TILE_SIZE);

    // Build tile palette
    buildTilePalette();

    // Create canvas elements if they don't exist
    createEditorCanvas();

    // Initialize event listeners
    initEventListeners();
}

/**
 * Build the tile palette from all available sprites
 */
function buildTilePalette() {
    tilePalette = [];

    // Add terrain tiles
    Object.keys(terrainSprites).forEach(key => {
        const tileType = getTileTypeFromSpriteName(key, 'terrain');
        if (tileType !== null) {
            tilePalette.push({
                sprite: terrainSprites[key],
                type: tileType,
                category: 'terrain',
                name: key
            });
        }
    });

    // Add building tiles
    Object.keys(buildingSprites).forEach(key => {
        const tileType = getTileTypeFromSpriteName(key, 'building');
        if (tileType !== null) {
            tilePalette.push({
                sprite: buildingSprites[key],
                type: tileType,
                category: 'building',
                name: key
            });
        }
    });

    // Add object tiles
    Object.keys(objectSprites).forEach(key => {
        tilePalette.push({
            sprite: objectSprites[key],
            type: null, // Objects might not have specific tile types
            category: 'object',
            name: key
        });
    });
}

/**
 * Get tile type from sprite name
 */
function getTileTypeFromSpriteName(name, category) {
    const tileNameMap = {
        terrain: {
            grass: TILES.GRASS,
            water: TILES.WATER,
            stone: TILES.STONE,
            tree: TILES.TREE,
            path: TILES.PATH,
            sand: TILES.SAND,
            dune: TILES.DUNE,
            mountain: TILES.MOUNTAIN,
            rock: TILES.ROCK,
            volcanicRock: TILES.VOLCANIC_ROCK,
            lava: TILES.LAVA,
            palmTree: TILES.PALM_TREE,
            cactus: TILES.CACTUS,
            seashell: TILES.SEASHELL,
            volcano: TILES.VOLCANO
        },
        building: {
            wall: TILES.WALL,
            building: TILES.BUILDING,
            facade: TILES.FACADE,
            window: TILES.WINDOW,
            doorShadow: TILES.DOOR_SHADOW,
            doorOpen: TILES.DOOR_OPEN_LEFT,
            doorOpenLeft: TILES.DOOR_OPEN_LEFT,
            doorClosedLeft: TILES.DOOR_CLOSED_LEFT,
            doorOpenRight: TILES.DOOR_OPEN_RIGHT,
            doorClosedRight: TILES.DOOR_CLOSED_RIGHT,
            doorClosed: TILES.DOOR_CLOSED_LEFT,
            windowWalkable: TILES.WINDOW_WALKABLE,
            roof: TILES.ROOF,
            floorInterior: TILES.FLOOR_INTERIOR,
            floor: TILES.FLOOR,
            dungeonWall: TILES.DUNGEON_WALL,
            wallInterior: TILES.WALL_INTERIOR
        }
    };

    return tileNameMap[category]?.[name] || null;
}

/**
 * Create editor canvas elements
 */
function createEditorCanvas() {
    // Main editor canvas
    if (!editorCanvas) {
        editorCanvas = document.createElement('canvas');
        editorCanvas.id = 'mapEditorCanvas';
        editorCanvas.style.border = '1px solid #333';
        editorCanvas.style.backgroundColor = '#000';
        editorCanvas.style.imageRendering = 'pixelated';
    }

    // Palette canvas
    if (!paletteCanvas) {
        paletteCanvas = document.createElement('canvas');
        paletteCanvas.id = 'mapEditorPalette';
        paletteCanvas.width = 256;
        paletteCanvas.height = 256;
        paletteCanvas.style.border = '1px solid #333';
        paletteCanvas.style.backgroundColor = '#111';
        paletteCanvas.style.imageRendering = 'pixelated';
    }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    if (editorCanvas) {
        editorCanvas.addEventListener('mousedown', handleEditorMouseDown);
        editorCanvas.addEventListener('mousemove', handleEditorMouseMove);
        editorCanvas.addEventListener('mouseup', handleEditorMouseUp);
        editorCanvas.addEventListener('wheel', handleEditorWheel);
    }

    if (paletteCanvas) {
        paletteCanvas.addEventListener('click', handlePaletteClick);
    }
}

/**
 * Toggle map editor visibility
 */
export function toggleMapEditor() {
    const container = document.getElementById('mapEditorContainer');

    if (!container) {
        createMapEditorUI();
        return;
    }

    mapEditorVisible = !mapEditorVisible;

    if (mapEditorVisible) {
        container.style.display = 'flex';
        loadCurrentMap();
        renderEditor();
        renderPalette();
    } else {
        container.style.display = 'none';
    }
}

/**
 * Create the map editor UI
 */
function createMapEditorUI() {
    const container = document.createElement('div');
    container.id = 'mapEditorContainer';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        z-index: 2000;
        color: white;
        font-family: monospace;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: #333;
        border-bottom: 1px solid #555;
    `;

    const title = document.createElement('h2');
    title.textContent = '🗺️ Editor de Mapas - Argentum Online';
    title.style.margin = '0';

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '10px';

    // Layer selector
    const layerSelect = document.createElement('select');
    layerSelect.id = 'layerSelect';
    Object.keys(LAYERS).forEach(layer => {
        const option = document.createElement('option');
        option.value = layer;
        option.textContent = LAYERS[layer].name;
        layerSelect.appendChild(option);
    });
    layerSelect.value = currentLayer;
    layerSelect.addEventListener('change', (e) => {
        currentLayer = e.target.value;
        renderEditor();
    });

    // Tool selector
    const toolSelect = document.createElement('select');
    toolSelect.id = 'toolSelect';
    ['paint', 'erase', 'fill'].forEach(tool => {
        const option = document.createElement('option');
        option.value = tool;
        option.textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
        toolSelect.appendChild(option);
    });
    toolSelect.value = selectedTool;
    toolSelect.addEventListener('change', (e) => {
        selectedTool = e.target.value;
    });

    // Buttons
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Guardar';
    saveBtn.addEventListener('click', exportMap);

    const loadBtn = document.createElement('button');
    loadBtn.textContent = '📁 Cargar';
    loadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', handleFileLoad);
        input.click();
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Cerrar';
    closeBtn.style.background = '#c00';
    closeBtn.addEventListener('click', toggleMapEditor);

    controls.appendChild(layerSelect);
    controls.appendChild(toolSelect);
    controls.appendChild(saveBtn);
    controls.appendChild(loadBtn);
    controls.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(controls);

    // Main content area
    const content = document.createElement('div');
    content.style.cssText = `
        display: flex;
        flex: 1;
        overflow: hidden;
    `;

    // Editor area
    const editorArea = document.createElement('div');
    editorArea.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 10px;
    `;

    // Canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
        flex: 1;
        overflow: auto;
        border: 1px solid #555;
        background: #000;
    `;

    canvasContainer.appendChild(editorCanvas);
    editorArea.appendChild(canvasContainer);

    // Info panel
    const infoPanel = document.createElement('div');
    infoPanel.id = 'editorInfo';
    infoPanel.style.cssText = `
        height: 30px;
        padding: 5px;
        background: #222;
        border-top: 1px solid #555;
        font-size: 12px;
    `;
    infoPanel.textContent = 'Listo para editar. Usa la rueda del mouse para hacer zoom, arrastra para mover la vista.';

    editorArea.appendChild(infoPanel);

    // Sidebar
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `
        width: 300px;
        background: #222;
        border-left: 1px solid #555;
        display: flex;
        flex-direction: column;
        padding: 10px;
    `;

    // Palette section
    const paletteSection = document.createElement('div');
    paletteSection.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
    `;

    const paletteTitle = document.createElement('h3');
    paletteTitle.textContent = 'Paleta de Tiles';
    paletteTitle.style.margin = '0 0 10px 0';

    const paletteContainer = document.createElement('div');
    paletteContainer.style.cssText = `
        flex: 1;
        overflow: auto;
        border: 1px solid #555;
    `;
    paletteContainer.appendChild(paletteCanvas);

    // Selected tile info
    const selectedInfo = document.createElement('div');
    selectedInfo.id = 'selectedTileInfo';
    selectedInfo.style.cssText = `
        margin-top: 10px;
        padding: 5px;
        background: #333;
        border-radius: 3px;
        font-size: 12px;
    `;
    selectedInfo.textContent = 'Tile seleccionado: Ninguno';

    paletteSection.appendChild(paletteTitle);
    paletteSection.appendChild(paletteContainer);
    paletteSection.appendChild(selectedInfo);

    sidebar.appendChild(paletteSection);

    content.appendChild(editorArea);
    content.appendChild(sidebar);

    container.appendChild(header);
    container.appendChild(content);

    document.body.appendChild(container);

    // Initialize canvas contexts
    editorCtx = editorCanvas.getContext('2d');
    paletteCtx = paletteCanvas.getContext('2d');

    // Load current map and show editor
    loadCurrentMap();
    renderEditor();
    renderPalette();
}

/**
 * Load the current map data
 */
function loadCurrentMap() {
    // For now, create a blank map or load from gameState
    if (!currentMapData) {
        currentMapData = {
            name: "Nuevo Mapa",
            description: "Mapa creado con el editor",
            type: "custom",
            safeZone: false,
            worldPosition: { x: 0, y: 0 },
            layers: {
                base: Array(20).fill().map(() => Array(30).fill(0)),
                roofs: Array(20).fill().map(() => Array(30).fill(0)),
                doors: Array(20).fill().map(() => Array(30).fill(0)),
                windows: Array(20).fill().map(() => Array(30).fill(0))
            },
            portals: [],
            npcs: [],
            playerSpawn: { x: 5, y: 5 }
        };
    }
}

/**
 * Render the map editor
 */
function renderEditor() {
    if (!editorCanvas || !editorCtx || !currentMapData) return;

    const TILE_SIZE = gameState.tileSize || 32;
    const mapWidth = currentMapData.layers.base[0].length;
    const mapHeight = currentMapData.layers.base.length;

    // Set canvas size
    editorCanvas.width = mapWidth * TILE_SIZE * zoomLevel;
    editorCanvas.height = mapHeight * TILE_SIZE * zoomLevel;

    // Clear canvas
    editorCtx.fillStyle = '#000';
    editorCtx.fillRect(0, 0, editorCanvas.width, editorCanvas.height);

    // Apply pan and zoom transform
    editorCtx.save();
    editorCtx.translate(panOffset.x, panOffset.y);
    editorCtx.scale(zoomLevel, zoomLevel);

    // Render layers in order
    const layersToRender = ['base', 'doors', 'windows', 'roofs'];

    layersToRender.forEach(layerName => {
        if (!LAYERS[layerName].visible) return;

        const layerData = currentMapData.layers[layerName];
        if (!layerData) return;

        editorCtx.globalAlpha = LAYERS[layerName].opacity;

        for (let y = 0; y < layerData.length; y++) {
            for (let x = 0; x < layerData[y].length; x++) {
                const tileType = layerData[y][x];

                const sprite = getSpriteForTile(tileType, layerName);
                if (sprite) {
                    editorCtx.drawImage(sprite, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
                // Note: tileType 0 (GRASS) is rendered above, other empty tiles (null/undefined) are skipped
            }
        }
    });

    // Render grid
    editorCtx.globalAlpha = 0.3;
    editorCtx.strokeStyle = '#666';
    editorCtx.lineWidth = 1 / zoomLevel;

    for (let x = 0; x <= mapWidth; x++) {
        editorCtx.beginPath();
        editorCtx.moveTo(x * TILE_SIZE, 0);
        editorCtx.lineTo(x * TILE_SIZE, mapHeight * TILE_SIZE);
        editorCtx.stroke();
    }

    for (let y = 0; y <= mapHeight; y++) {
        editorCtx.beginPath();
        editorCtx.moveTo(0, y * TILE_SIZE);
        editorCtx.lineTo(mapWidth * TILE_SIZE, y * TILE_SIZE);
        editorCtx.stroke();
    }

    // Highlight current layer
    if (currentLayer !== 'base') {
        editorCtx.strokeStyle = '#ff0';
        editorCtx.lineWidth = 2 / zoomLevel;
        editorCtx.strokeRect(0, 0, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE);
    }

    editorCtx.restore();
}

/**
 * Get sprite for a tile type
 */
function getSpriteForTile(tileType, layerName) {
    // Map tile types to sprite collections
    const spriteMap = {
        [TILES.GRASS]: terrainSprites.grass,
        [TILES.WATER]: terrainSprites.water,
        [TILES.STONE]: terrainSprites.stone,
        [TILES.TREE]: terrainSprites.tree,
        [TILES.PATH]: terrainSprites.path,
        [TILES.SAND]: terrainSprites.sand,
        [TILES.DUNE]: terrainSprites.dune,
        [TILES.MOUNTAIN]: terrainSprites.mountain,
        [TILES.ROCK]: terrainSprites.rock,
        [TILES.VOLCANIC_ROCK]: terrainSprites.volcanicRock,
        [TILES.LAVA]: terrainSprites.lava,
        [TILES.PALM_TREE]: terrainSprites.palmTree,
        [TILES.CACTUS]: terrainSprites.cactus,
        [TILES.SEASHELL]: terrainSprites.seashell,
        [TILES.VOLCANO]: terrainSprites.volcano,

        [TILES.WALL]: buildingSprites.wall,
        [TILES.BUILDING]: buildingSprites.building,
        [TILES.FACADE]: buildingSprites.facade,
        [TILES.WINDOW]: buildingSprites.window,
        [TILES.DOOR_SHADOW]: buildingSprites.doorShadow,
        [TILES.DOOR_OPEN_LEFT]: buildingSprites.doorOpenLeft,
        [TILES.DOOR_CLOSED_LEFT]: buildingSprites.doorClosedLeft,
        [TILES.DOOR_OPEN_RIGHT]: buildingSprites.doorOpenRight,
        [TILES.DOOR_CLOSED_RIGHT]: buildingSprites.doorClosedRight,
        [TILES.WINDOW_WALKABLE]: buildingSprites.windowWalkable,
        [TILES.ROOF]: buildingSprites.roof,
        [TILES.FLOOR_INTERIOR]: buildingSprites.floorInterior,
        [TILES.FLOOR]: buildingSprites.floor,
        [TILES.DUNGEON_WALL]: buildingSprites.dungeonWall,
        [TILES.WALL_INTERIOR]: buildingSprites.wallInterior
    };

    return spriteMap[tileType] || null;
}

/**
 * Render the tile palette
 */
function renderPalette() {
    if (!paletteCanvas || !paletteCtx) return;

    const TILE_SIZE = gameState.tileSize || 32;
    const tilesPerRow = 8;
    const tilesPerCol = 8;
    const startIndex = palettePage * PALETTE_PAGE_SIZE;

    paletteCtx.fillStyle = '#111';
    paletteCtx.fillRect(0, 0, paletteCanvas.width, paletteCanvas.height);

    let rendered = 0;
    for (let i = 0; i < tilesPerCol && rendered < PALETTE_PAGE_SIZE; i++) {
        for (let j = 0; j < tilesPerRow && rendered < PALETTE_PAGE_SIZE; j++) {
            const paletteIndex = startIndex + rendered;
            if (paletteIndex >= tilePalette.length) break;

            const tile = tilePalette[paletteIndex];
            const x = j * TILE_SIZE;
            const y = i * TILE_SIZE;

            // Draw tile background
            paletteCtx.fillStyle = selectedTileType === tile.type ? '#444' : '#222';
            paletteCtx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

            // Draw tile sprite
            if (tile.sprite) {
                paletteCtx.drawImage(tile.sprite, x, y);
            }

            // Draw border
            paletteCtx.strokeStyle = selectedTileType === tile.type ? '#ff0' : '#666';
            paletteCtx.lineWidth = 1;
            paletteCtx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            // Draw tile type number
            paletteCtx.fillStyle = '#fff';
            paletteCtx.font = '8px monospace';
            paletteCtx.textAlign = 'left';
            paletteCtx.fillText(tile.type?.toString() || '?', x + 2, y + 10);

            rendered++;
        }
    }

    // Update selected tile info
    const selectedInfo = document.getElementById('selectedTileInfo');
    if (selectedInfo) {
        const selectedTile = tilePalette.find(t => t.type === selectedTileType);
        selectedInfo.textContent = selectedTile ?
            `Tile: ${selectedTile.name} (${selectedTile.type})` :
            'Tile seleccionado: Ninguno';
    }
}

/**
 * Handle palette click
 */
function handlePaletteClick(event) {
    const TILE_SIZE = gameState.tileSize || 32;
    const rect = paletteCanvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);

    const tilesPerRow = 8;
    const tileIndex = y * tilesPerRow + x + palettePage * PALETTE_PAGE_SIZE;

    if (tileIndex < tilePalette.length) {
        selectedTileType = tilePalette[tileIndex].type;
        renderPalette();
    }
}

/**
 * Handle editor mouse down
 */
function handleEditorMouseDown(event) {
    const rect = editorCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left - panOffset.x;
    const y = event.clientY - rect.top - panOffset.y;

    if (event.button === 0) { // Left click - paint/erase
        applyTool(x, y);
    } else if (event.button === 1 || event.ctrlKey) { // Middle click or Ctrl+click - pan
        isPanning = true;
        lastMousePos = { x: event.clientX, y: event.clientY };
        editorCanvas.style.cursor = 'grabbing';
    }
}

/**
 * Handle editor mouse move
 */
function handleEditorMouseMove(event) {
    if (isPanning) {
        const deltaX = event.clientX - lastMousePos.x;
        const deltaY = event.clientY - lastMousePos.y;

        panOffset.x += deltaX;
        panOffset.y += deltaY;

        lastMousePos = { x: event.clientX, y: event.clientY };
        renderEditor();
    } else if (event.buttons === 1) { // Left mouse button held
        const rect = editorCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left - panOffset.x;
        const y = event.clientY - rect.top - panOffset.y;
        applyTool(x, y);
    }
}

/**
 * Handle editor mouse up
 */
function handleEditorMouseUp(event) {
    if (event.button === 1 || event.ctrlKey) {
        isPanning = false;
        editorCanvas.style.cursor = 'default';
    }
}

/**
 * Handle editor wheel (zoom)
 */
function handleEditorWheel(event) {
    event.preventDefault();

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = zoomLevel * zoomFactor;

    // Limit zoom levels
    if (newZoom >= 0.25 && newZoom <= 4) {
        zoomLevel = newZoom;
        renderEditor();
    }
}

/**
 * Apply the selected tool at the given position
 */
function applyTool(screenX, screenY) {
    if (!currentMapData) return;

    const TILE_SIZE = gameState.tileSize || 32;
    const worldX = screenX / zoomLevel;
    const worldY = screenY / zoomLevel;

    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);

    const layerData = currentMapData.layers[currentLayer];
    if (!layerData || tileY < 0 || tileY >= layerData.length ||
        tileX < 0 || tileX >= layerData[0].length) return;

    if (selectedTool === 'paint') {
        layerData[tileY][tileX] = selectedTileType;
    } else if (selectedTool === 'erase') {
        layerData[tileY][tileX] = 0;
    } else if (selectedTool === 'fill') {
        // Simple flood fill (could be optimized)
        const oldType = layerData[tileY][tileX];
        if (oldType !== selectedTileType) {
            floodFill(layerData, tileX, tileY, oldType, selectedTileType);
        }
    }

    renderEditor();
}

/**
 * Simple flood fill algorithm
 */
function floodFill(layerData, x, y, oldType, newType) {
    if (x < 0 || x >= layerData[0].length || y < 0 || y >= layerData.length) return;
    if (layerData[y][x] !== oldType || layerData[y][x] === newType) return;

    layerData[y][x] = newType;

    // Recursively fill adjacent tiles
    floodFill(layerData, x + 1, y, oldType, newType);
    floodFill(layerData, x - 1, y, oldType, newType);
    floodFill(layerData, x, y + 1, oldType, newType);
    floodFill(layerData, x, y - 1, oldType, newType);
}

/**
 * Export map to JSON
 */
function exportMap() {
    if (!currentMapData) return;

    const dataStr = JSON.stringify(currentMapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${currentMapData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Handle file load
 */
function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedMap = JSON.parse(e.target.result);

            // Ensure the loaded map has the correct structure
            currentMapData = {
                name: loadedMap.name || "Mapa cargado",
                description: loadedMap.description || "Mapa cargado desde archivo",
                type: loadedMap.type || "custom",
                safeZone: loadedMap.safeZone || false,
                worldPosition: loadedMap.worldPosition || { x: 0, y: 0 },
                layers: {
                    base: loadedMap.layers?.base || loadedMap.map || Array(20).fill().map(() => Array(30).fill(0)),
                    roofs: loadedMap.layers?.roofs || Array(20).fill().map(() => Array(30).fill(0)),
                    doors: loadedMap.layers?.doors || Array(20).fill().map(() => Array(30).fill(0)),
                    windows: loadedMap.layers?.windows || Array(20).fill().map(() => Array(30).fill(0))
                },
                portals: loadedMap.portals || [],
                npcs: loadedMap.npcs || [],
                playerSpawn: loadedMap.playerSpawn || { x: 5, y: 5 }
            };

            // If the loaded map uses the old format (direct map array), convert it
            if (!loadedMap.layers && loadedMap.map) {
                console.log('Convirtiendo mapa del formato antiguo al nuevo...');
                currentMapData.layers.base = loadedMap.map;
            }

            console.log('Mapa cargado:', currentMapData);
            renderEditor();
            renderPalette();
        } catch (error) {
            console.error('Error loading map file:', error);
            alert('Error al cargar el archivo de mapa: ' + error.message);
        }
    };
    reader.readAsText(file);
}

/**
 * Check if map editor is visible
 */
export function isMapEditorVisible() {
    return mapEditorVisible;
}

// Initialize when module loads
initMapEditor();