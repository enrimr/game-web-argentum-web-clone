/**
 * MapEditor.js
 * Visual Map Editor - Creator for Argentum Online
 * Allows viewing, editing, and creating maps with multiple layers
 */

import { gameState } from '../state.js';
import { TILES, isTileWalkable, isRoof, isOpenDoor, isClosedDoor } from '../world/TileTypes.js';
import { 
    getCurrentMapData, 
    setCurrentMapData, 
    loadCurrentMap as loadCurrentMapCore,
    exportMapData,
    loadMapFromFile as loadMapFromFileCore,
    resizeMap as resizeMapCore,
    LAYERS as EDITOR_LAYERS
} from './editor/MapEditorCore.js';
import { 
    createConnectionsSection, 
    drawConnectionIndicators,
    updateConnectionsUI,
    openConnectedBorders as openBordersHandler
} from './editor/MapEditorConnections.js';
import { generateTerrainSprites } from '../graphics/sprites/TerrainSprites.js';
import { generateBuildingSprites } from '../graphics/sprites/BuildingSprites.js';
import { generateObjectSprites } from '../graphics/sprites/ObjectSprites.js';
import { generateItemSprites } from '../graphics/sprites/ItemSprites.js';
import { generateNPCSprites } from '../graphics/sprites/NPCSprites.js';
import { generateEnemySprites } from '../graphics/sprites/EnemySprites.js';
import { NPC_DEFINITIONS } from '../entities/NPCTypes.js';
import { MAP_DEFINITIONS } from '../world/MapDefinitions.js';
import { ENEMY_STATS } from '../entities/EnemyTypes.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';

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
    props: { name: 'Props', visible: true, opacity: 1.0 },
    roofs: { name: 'Techos', visible: true, opacity: 1.0 },
    doors: { name: 'Puertas', visible: true, opacity: 1.0 },
    windows: { name: 'Ventanas', visible: true, opacity: 1.0 }
};

// Entity layer visibility
let showNPCs = true;
let showEnemies = true;
let showPortals = true;
let showTreasures = true;

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
            volcano: TILES.VOLCANO,
            // New volcanic/mountain tiles
            obsidian: TILES.OBSIDIAN,
            ash: TILES.ASH,
            pumice: TILES.PUMICE,
            geyser: TILES.GEYSER,
            // New decoration tiles
            deadTree: TILES.DEAD_TREE,
            coral: TILES.CORAL,
            ruinsWall: TILES.RUINS_WALL,
            column: TILES.COLUMN,
            bridge: TILES.BRIDGE
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
    controls.style.alignItems = 'center';

    // Map size controls
    const sizeControls = document.createElement('div');
    sizeControls.style.display = 'flex';
    sizeControls.style.gap = '5px';
    sizeControls.style.alignItems = 'center';

    const sizeLabel = document.createElement('span');
    sizeLabel.textContent = 'Tamaño:';
    sizeLabel.style.fontSize = '12px';
    sizeLabel.style.color = '#fff';

    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.id = 'mapWidth';
    widthInput.value = currentMapData ? currentMapData.layers.base[0].length : 30;
    widthInput.min = '5';
    widthInput.max = '100';
    widthInput.style.width = '50px';
    widthInput.style.fontSize = '11px';

    const xLabel = document.createElement('span');
    xLabel.textContent = '×';
    xLabel.style.color = '#fff';

    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.id = 'mapHeight';
    heightInput.value = currentMapData ? currentMapData.layers.base.length : 20;
    heightInput.min = '5';
    heightInput.max = '100';
    heightInput.style.width = '50px';
    heightInput.style.fontSize = '11px';

    const resizeBtn = document.createElement('button');
    resizeBtn.textContent = '📏';
    resizeBtn.title = 'Cambiar tamaño del mapa';
    resizeBtn.addEventListener('click', () => {
        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);
        if (newWidth >= 5 && newWidth <= 100 && newHeight >= 5 && newHeight <= 100) {
            resizeMap(newWidth, newHeight);
        } else {
            alert('El tamaño debe estar entre 5x5 y 100x100');
        }
    });

    sizeControls.appendChild(sizeLabel);
    sizeControls.appendChild(widthInput);
    sizeControls.appendChild(xLabel);
    sizeControls.appendChild(heightInput);
    sizeControls.appendChild(resizeBtn);

    // Layer controls
    const layerControls = document.createElement('div');
    layerControls.style.display = 'flex';
    layerControls.style.gap = '5px';
    layerControls.style.alignItems = 'center';

    const layerLabel = document.createElement('span');
    layerLabel.textContent = 'Capa:';
    layerLabel.style.fontSize = '12px';
    layerLabel.style.color = '#fff';

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

    // Layer visibility toggles
    const visibilityControls = document.createElement('div');
    visibilityControls.style.display = 'flex';
    visibilityControls.style.gap = '2px';

    Object.keys(LAYERS).forEach(layer => {
        const toggle = document.createElement('button');
        toggle.textContent = LAYERS[layer].name[0]; // First letter
        toggle.title = `Toggle ${LAYERS[layer].name} visibility`;
        toggle.style.fontSize = '10px';
        toggle.style.padding = '2px 4px';
        toggle.style.minWidth = '20px';
        toggle.style.background = LAYERS[layer].visible ? '#4a5568' : '#2d3748';
        toggle.addEventListener('click', () => {
            LAYERS[layer].visible = !LAYERS[layer].visible;
            toggle.style.background = LAYERS[layer].visible ? '#4a5568' : '#2d3748';
            renderEditor();
        });
        visibilityControls.appendChild(toggle);
    });

    // Entity layer visibility toggles
    const entityControls = document.createElement('div');
    entityControls.style.display = 'flex';
    entityControls.style.gap = '2px';
    entityControls.style.marginLeft = '10px';

    // NPCs toggle
    const npcToggle = document.createElement('button');
    npcToggle.textContent = '👥';
    npcToggle.title = 'Toggle NPCs visibility';
    npcToggle.style.fontSize = '10px';
    npcToggle.style.padding = '2px 4px';
    npcToggle.style.minWidth = '20px';
    npcToggle.style.background = showNPCs ? '#4a5568' : '#2d3748';
    npcToggle.addEventListener('click', () => {
        showNPCs = !showNPCs;
        npcToggle.style.background = showNPCs ? '#4a5568' : '#2d3748';
        renderEditor();
    });
    entityControls.appendChild(npcToggle);

    // Portals toggle
    const portalToggle = document.createElement('button');
    portalToggle.textContent = '🏞️';
    portalToggle.title = 'Toggle Portals visibility';
    portalToggle.style.fontSize = '10px';
    portalToggle.style.padding = '2px 4px';
    portalToggle.style.minWidth = '20px';
    portalToggle.style.background = showPortals ? '#4a5568' : '#2d3748';
    portalToggle.addEventListener('click', () => {
        showPortals = !showPortals;
        portalToggle.style.background = showPortals ? '#4a5568' : '#2d3748';
        renderEditor();
    });
    entityControls.appendChild(portalToggle);

    // Enemies toggle
    const enemyToggle = document.createElement('button');
    enemyToggle.textContent = '👹';
    enemyToggle.title = 'Toggle Enemies visibility';
    enemyToggle.style.fontSize = '10px';
    enemyToggle.style.padding = '2px 4px';
    enemyToggle.style.minWidth = '20px';
    enemyToggle.style.background = showEnemies ? '#4a5568' : '#2d3748';
    enemyToggle.addEventListener('click', () => {
        showEnemies = !showEnemies;
        enemyToggle.style.background = showEnemies ? '#4a5568' : '#2d3748';
        renderEditor();
    });
    entityControls.appendChild(enemyToggle);

    // Treasures toggle
    const treasureToggle = document.createElement('button');
    treasureToggle.textContent = '💰';
    treasureToggle.title = 'Toggle Treasures visibility';
    treasureToggle.style.fontSize = '10px';
    treasureToggle.style.padding = '2px 4px';
    treasureToggle.style.minWidth = '20px';
    treasureToggle.style.background = showTreasures ? '#4a5568' : '#2d3748';
    treasureToggle.addEventListener('click', () => {
        showTreasures = !showTreasures;
        treasureToggle.style.background = showTreasures ? '#4a5568' : '#2d3748';
        renderEditor();
    });
    entityControls.appendChild(treasureToggle);

    layerControls.appendChild(layerLabel);
    layerControls.appendChild(layerSelect);
    layerControls.appendChild(visibilityControls);
    layerControls.appendChild(entityControls);

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

    controls.appendChild(sizeControls);
    controls.appendChild(layerControls);
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

    // NPC management section
    const npcSection = document.createElement('div');
    npcSection.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    `;

    const npcTitle = document.createElement('h3');
    npcTitle.textContent = 'NPCs en el Mapa';
    npcTitle.style.margin = '0 0 10px 0';

    const npcList = document.createElement('div');
    npcList.id = 'npcList';
    npcList.style.cssText = `
        flex: 1;
        overflow: auto;
        border: 1px solid #555;
        background: #111;
        padding: 5px;
        font-size: 11px;
    `;

    const npcControls = document.createElement('div');
    npcControls.style.cssText = `
        margin-top: 10px;
        display: flex;
        gap: 5px;
    `;

    const addNpcBtn = document.createElement('button');
    addNpcBtn.textContent = '+ NPC';
    addNpcBtn.title = 'Añadir nuevo NPC';
    addNpcBtn.addEventListener('click', showAddNpcDialog);

    const clearNpcsBtn = document.createElement('button');
    clearNpcsBtn.textContent = '🗑️';
    clearNpcsBtn.title = 'Eliminar todos los NPCs';
    clearNpcsBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar todos los NPCs del mapa?')) {
            currentMapData.npcs = [];
            updateNpcList();
            renderEditor();
        }
    });

    npcControls.appendChild(addNpcBtn);
    npcControls.appendChild(clearNpcsBtn);

    npcSection.appendChild(npcTitle);
    npcSection.appendChild(npcList);
    npcSection.appendChild(npcControls);

    // Portal management section
    const portalSection = document.createElement('div');
    portalSection.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    `;

    const portalTitle = document.createElement('h3');
    portalTitle.textContent = 'Portales en el Mapa';
    portalTitle.style.margin = '0 0 10px 0';

    const portalList = document.createElement('div');
    portalList.id = 'portalList';
    portalList.style.cssText = `
        flex: 1;
        overflow: auto;
        border: 1px solid #555;
        background: #111;
        padding: 5px;
        font-size: 11px;
    `;

    const portalControls = document.createElement('div');
    portalControls.style.cssText = `
        margin-top: 10px;
        display: flex;
        gap: 5px;
    `;

    const addPortalBtn = document.createElement('button');
    addPortalBtn.textContent = '+ Portal';
    addPortalBtn.title = 'Añadir nuevo portal';
    addPortalBtn.addEventListener('click', showAddPortalDialog);

    const clearPortalsBtn = document.createElement('button');
    clearPortalsBtn.textContent = '🗑️';
    clearPortalsBtn.title = 'Eliminar todos los portales';
    clearPortalsBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar todos los portales del mapa?')) {
            currentMapData.portals = [];
            updatePortalList();
            renderEditor();
        }
    });

    portalControls.appendChild(addPortalBtn);
    portalControls.appendChild(clearPortalsBtn);

    portalSection.appendChild(portalTitle);
    portalSection.appendChild(portalList);
    portalSection.appendChild(portalControls);

    // Enemy management section
    const enemySection = document.createElement('div');
    enemySection.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    `;

    const enemyTitle = document.createElement('h3');
    enemyTitle.textContent = '👹 Enemigos en el Mapa';
    enemyTitle.style.margin = '0 0 10px 0';

    const enemyList = document.createElement('div');
    enemyList.id = 'enemyList';
    enemyList.style.cssText = `
        flex: 1;
        overflow: auto;
        border: 1px solid #555;
        background: #111;
        padding: 5px;
        font-size: 11px;
    `;

    const enemyControls = document.createElement('div');
    enemyControls.style.cssText = `
        margin-top: 10px;
        display: flex;
        gap: 5px;
    `;

    const addSpawnBtn = document.createElement('button');
    addSpawnBtn.textContent = '+ Spawn';
    addSpawnBtn.title = 'Añadir tipo de spawn automático';
    addSpawnBtn.addEventListener('click', showAddSpawnDialog);

    const addSpecificBtn = document.createElement('button');
    addSpecificBtn.textContent = '+ Específico';
    addSpecificBtn.title = 'Añadir enemigo en posición específica';
    addSpecificBtn.addEventListener('click', showAddSpecificEnemyDialog);

    const clearEnemiesBtn = document.createElement('button');
    clearEnemiesBtn.textContent = '🗑️';
    clearEnemiesBtn.title = 'Eliminar todos los enemigos';
    clearEnemiesBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar todos los enemigos del mapa?')) {
            if (currentMapData.enemies) {
                currentMapData.enemies.types = [];
                // Note: Specific enemies are in the types array with x,y,level
                currentMapData.enemies.types = currentMapData.enemies.types.filter(e => !e.x && !e.y);
            }
            updateEnemyList();
            renderEditor();
        }
    });

    enemyControls.appendChild(addSpawnBtn);
    enemyControls.appendChild(addSpecificBtn);
    enemyControls.appendChild(clearEnemiesBtn);

    enemySection.appendChild(enemyTitle);
    enemySection.appendChild(enemyList);
    enemySection.appendChild(enemyControls);

    // Treasure management section
    const treasureSection = document.createElement('div');
    treasureSection.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    `;

    const treasureTitle = document.createElement('h3');
    treasureTitle.textContent = '💰 Tesoros en el Mapa';
    treasureTitle.style.margin = '0 0 10px 0';

    const treasureList = document.createElement('div');
    treasureList.id = 'treasureList';
    treasureList.style.cssText = `
        flex: 1;
        overflow: auto;
        border: 1px solid #555;
        background: #111;
        padding: 5px;
        font-size: 11px;
    `;

    const treasureControls = document.createElement('div');
    treasureControls.style.cssText = `
        margin-top: 10px;
        display: flex;
        gap: 5px;
    `;

    const addTreasureBtn = document.createElement('button');
    addTreasureBtn.textContent = '+ Cofre';
    addTreasureBtn.title = 'Añadir cofre con tesoro';
    addTreasureBtn.addEventListener('click', showAddTreasureDialog);

    const clearTreasuresBtn = document.createElement('button');
    clearTreasuresBtn.textContent = '🗑️';
    clearTreasuresBtn.title = 'Eliminar todos los tesoros';
    clearTreasuresBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar todos los tesoros del mapa?')) {
            currentMapData.treasures = [];
            updateTreasureList();
            renderEditor();
        }
    });

    treasureControls.appendChild(addTreasureBtn);
    treasureControls.appendChild(clearTreasuresBtn);

    treasureSection.appendChild(treasureTitle);
    treasureSection.appendChild(treasureList);
    treasureSection.appendChild(treasureControls);

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

    // Add connections section before other sections
    const connectionsSection = createConnectionsSection();
    sidebar.appendChild(connectionsSection);
    
    sidebar.appendChild(npcSection);
    sidebar.appendChild(portalSection);
    sidebar.appendChild(enemySection);
    sidebar.appendChild(treasureSection);
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
    updateNpcList();
    updatePortalList();
    updateEnemyList();
    updateTreasureList();
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
                props: Array(20).fill().map(() => Array(30).fill(0)),
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
    
    // Expose to global scope for module access
    window.mapEditorRenderEditor = renderEditor;

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
    const layersToRender = ['base', 'props', 'doors', 'windows', 'roofs'];

    layersToRender.forEach(layerName => {
        if (!LAYERS[layerName].visible) return;

        const layerData = currentMapData.layers[layerName];
        if (!layerData) return;

        editorCtx.globalAlpha = LAYERS[layerName].opacity;

        for (let y = 0; y < layerData.length; y++) {
            for (let x = 0; x < layerData[y].length; x++) {
                const tileType = layerData[y][x];
                if (tileType === 0) continue; // Skip empty tiles

                const sprite = getSpriteForTile(tileType, layerName);
                if (sprite) {
                    editorCtx.drawImage(sprite, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
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

    // Render NPCs (if visibility is enabled)
    if (showNPCs && currentMapData.npcs) {
        currentMapData.npcs.forEach(npc => {
            const npcDefinition = NPC_DEFINITIONS[npc.type];
            if (npcDefinition && npcSprites[npcDefinition.sprite]) {
                const sprite = npcSprites[npcDefinition.sprite];
                if (sprite) {
                    // Draw NPC shadow
                    editorCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    editorCtx.fillRect(npc.x * TILE_SIZE + 2, (npc.y + 1) * TILE_SIZE - 2, TILE_SIZE - 4, 4);

                    // Draw NPC sprite
                    editorCtx.drawImage(sprite, npc.x * TILE_SIZE, npc.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                    // Draw NPC name
                    editorCtx.fillStyle = '#fff';
                    editorCtx.font = `${12 / zoomLevel}px monospace`;
                    editorCtx.textAlign = 'center';
                    editorCtx.strokeStyle = '#000';
                    editorCtx.lineWidth = 2 / zoomLevel;
                    editorCtx.strokeText(npc.name, (npc.x + 0.5) * TILE_SIZE, npc.y * TILE_SIZE - 5);
                    editorCtx.fillText(npc.name, (npc.x + 0.5) * TILE_SIZE, npc.y * TILE_SIZE - 5);
                }
            }
        });
    }

    // Render portals (if visibility is enabled)
    if (showPortals && currentMapData.portals) {
        currentMapData.portals.forEach(portal => {
            // Draw portal circle
            editorCtx.fillStyle = 'rgba(59, 130, 246, 0.7)'; // Blue with transparency
            editorCtx.beginPath();
            editorCtx.arc((portal.x + 0.5) * TILE_SIZE, (portal.y + 0.5) * TILE_SIZE, TILE_SIZE * 0.6, 0, Math.PI * 2);
            editorCtx.fill();

            // Draw portal border
            editorCtx.strokeStyle = '#3b82f6';
            editorCtx.lineWidth = 2 / zoomLevel;
            editorCtx.stroke();

            // Draw portal inner effect
            editorCtx.fillStyle = 'rgba(147, 197, 253, 0.8)'; // Lighter blue
            editorCtx.beginPath();
            editorCtx.arc((portal.x + 0.5) * TILE_SIZE, (portal.y + 0.5) * TILE_SIZE, TILE_SIZE * 0.4, 0, Math.PI * 2);
            editorCtx.fill();

            // Draw portal name
            editorCtx.fillStyle = '#fff';
            editorCtx.font = `${10 / zoomLevel}px monospace`;
            editorCtx.textAlign = 'center';
            editorCtx.strokeStyle = '#000';
            editorCtx.lineWidth = 1 / zoomLevel;
            const mapDef = MAP_DEFINITIONS[portal.targetMap];
            const displayName = mapDef ? mapDef.name.split(' ')[1] || portal.targetMap : portal.targetMap;
            editorCtx.strokeText(displayName, (portal.x + 0.5) * TILE_SIZE, portal.y * TILE_SIZE - 3);
            editorCtx.fillText(displayName, (portal.x + 0.5) * TILE_SIZE, portal.y * TILE_SIZE - 3);

            // Draw direction arrow if target coordinates are available
            if (portal.targetX !== undefined && portal.targetY !== undefined) {
                const arrowLength = TILE_SIZE * 0.3;
                const arrowX = (portal.x + 0.5) * TILE_SIZE;
                const arrowY = (portal.y + 0.5) * TILE_SIZE;

                editorCtx.strokeStyle = '#fff';
                editorCtx.lineWidth = 2 / zoomLevel;
                editorCtx.beginPath();
                editorCtx.moveTo(arrowX - arrowLength, arrowY);
                editorCtx.lineTo(arrowX + arrowLength, arrowY);
                editorCtx.moveTo(arrowX + arrowLength * 0.7, arrowY - arrowLength * 0.3);
                editorCtx.lineTo(arrowX + arrowLength, arrowY);
                editorCtx.lineTo(arrowX + arrowLength * 0.7, arrowY + arrowLength * 0.3);
                editorCtx.stroke();
            }
        });
    }

    // Render enemies (if visibility is enabled and only specific enemies with fixed positions)
    if (showEnemies && currentMapData.enemies && currentMapData.enemies.types) {
        currentMapData.enemies.types.forEach(enemy => {
            // Only render enemies with specific positions (x, y coordinates)
            if (enemy.x !== undefined && enemy.y !== undefined) {
                const enemySprite = enemySprites[enemy.type];
                if (enemySprite) {
                    // Draw enemy shadow
                    editorCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    editorCtx.fillRect(enemy.x * TILE_SIZE + 2, (enemy.y + 1) * TILE_SIZE - 2, TILE_SIZE - 4, 4);

                    // Draw enemy sprite
                    editorCtx.drawImage(enemySprite, enemy.x * TILE_SIZE, enemy.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                    // Draw enemy name and level
                    editorCtx.fillStyle = '#ff0000';
                    editorCtx.font = `${10 / zoomLevel}px monospace`;
                    editorCtx.textAlign = 'center';
                    editorCtx.strokeStyle = '#000';
                    editorCtx.lineWidth = 1 / zoomLevel;
                    const enemyName = `${enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1)} L${enemy.level}`;
                    editorCtx.strokeText(enemyName, (enemy.x + 0.5) * TILE_SIZE, enemy.y * TILE_SIZE - 3);
                    editorCtx.fillText(enemyName, (enemy.x + 0.5) * TILE_SIZE, enemy.y * TILE_SIZE - 3);
                } else {
                    // Fallback: draw a red square if sprite not found
                    editorCtx.fillStyle = '#dc2626';
                    editorCtx.fillRect(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    editorCtx.fillStyle = '#fff';
                    editorCtx.font = `${8 / zoomLevel}px monospace`;
                    editorCtx.textAlign = 'center';
                    editorCtx.fillText('?', (enemy.x + 0.5) * TILE_SIZE, (enemy.y + 0.5) * TILE_SIZE);
                }
            }
        });
    }

    // Render treasures (if visibility is enabled)
    if (showTreasures && currentMapData.treasures) {
        currentMapData.treasures.forEach(treasure => {
            // Draw treasure chest
            // Chest body
            editorCtx.fillStyle = '#92400e'; // Brown
            editorCtx.fillRect(treasure.x * TILE_SIZE + 2, treasure.y * TILE_SIZE + 8, TILE_SIZE - 4, TILE_SIZE - 12);

            // Chest lid
            editorCtx.fillStyle = '#a16207'; // Darker brown
            editorCtx.fillRect(treasure.x * TILE_SIZE + 1, treasure.y * TILE_SIZE + 4, TILE_SIZE - 2, 6);

            // Chest lock (gold)
            editorCtx.fillStyle = '#fbbf24';
            editorCtx.fillRect((treasure.x + 0.45) * TILE_SIZE, (treasure.y + 0.35) * TILE_SIZE, 4, 4);

            // Chest shadow
            editorCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            editorCtx.fillRect(treasure.x * TILE_SIZE + 4, (treasure.y + 1) * TILE_SIZE - 2, TILE_SIZE - 8, 4);

            // Draw treasure name and contents count
            editorCtx.fillStyle = '#fbbf24';
            editorCtx.font = `${9 / zoomLevel}px monospace`;
            editorCtx.textAlign = 'center';
            editorCtx.strokeStyle = '#000';
            editorCtx.lineWidth = 1 / zoomLevel;
            const contentCount = treasure.contents ? treasure.contents.length : 0;
            const treasureName = `Cofre (${contentCount} items)`;
            editorCtx.strokeText(treasureName, (treasure.x + 0.5) * TILE_SIZE, treasure.y * TILE_SIZE - 2);
            editorCtx.fillText(treasureName, (treasure.x + 0.5) * TILE_SIZE, treasure.y * TILE_SIZE - 2);
        });
    }

    // Draw connection indicators
    drawConnectionIndicators(editorCtx, mapWidth, mapHeight, TILE_SIZE);

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
        // New volcanic/mountain sprites
        [TILES.OBSIDIAN]: terrainSprites.obsidian,
        [TILES.ASH]: terrainSprites.ash,
        [TILES.PUMICE]: terrainSprites.pumice,
        [TILES.GEYSER]: terrainSprites.geyser,
        // New decoration sprites
        [TILES.DEAD_TREE]: terrainSprites.deadTree,
        [TILES.CORAL]: terrainSprites.coral,
        [TILES.RUINS_WALL]: terrainSprites.ruinsWall,
        [TILES.COLUMN]: terrainSprites.column,
        [TILES.BRIDGE]: terrainSprites.bridge,

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
 * Export map to JSON with compact layer format
 */
function exportMap() {
    if (!currentMapData) return;

    // Custom formatter for compact layer arrays
    let jsonStr = '{\n';
    
    // Export non-layer properties first
    const nonLayerProps = Object.keys(currentMapData).filter(k => k !== 'layers');
    nonLayerProps.forEach((key, i) => {
        jsonStr += `  "${key}": ${JSON.stringify(currentMapData[key], null, 2).replace(/\n/g, '\n  ')}`;
        jsonStr += ',\n';
    });
    
    // Export layers with compact format (each row on one line)
    jsonStr += '  "layers": {\n';
    const layerKeys = Object.keys(currentMapData.layers);
    layerKeys.forEach((layerKey, layerIndex) => {
        jsonStr += `    "${layerKey}": [\n`;
        const layer = currentMapData.layers[layerKey];
        layer.forEach((row, rowIndex) => {
            jsonStr += `      [${row.join(',')}]`;
            if (rowIndex < layer.length - 1) jsonStr += ',';
            jsonStr += '\n';
        });
        jsonStr += '    ]';
        if (layerIndex < layerKeys.length - 1) jsonStr += ',';
        jsonStr += '\n';
    });
    jsonStr += '  }\n';
    jsonStr += '}';

    const dataBlob = new Blob([jsonStr], { type: 'application/json' });

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
                    props: loadedMap.layers?.props || Array(20).fill().map(() => Array(30).fill(0)),
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
            updateNpcList();
            updatePortalList();
            updateEnemyList();
            updateTreasureList();
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
 * Resize the current map to new dimensions
 * @param {number} newWidth - New width in tiles
 * @param {number} newHeight - New height in tiles
 */
function resizeMap(newWidth, newHeight) {
    if (!currentMapData) return;

    console.log(`Redimensionando mapa de ${currentMapData.layers.base.length}x${currentMapData.layers.base[0].length} a ${newHeight}x${newWidth}`);

    // Create new layer arrays with the new dimensions
    const newLayers = {};

    Object.keys(LAYERS).forEach(layerName => {
        const oldLayer = currentMapData.layers[layerName] || [];
        const newLayer = Array(newHeight).fill().map(() => Array(newWidth).fill(0));

        // Copy existing data where possible
        const copyHeight = Math.min(oldLayer.length || 0, newHeight);
        const copyWidth = Math.min((oldLayer[0] && oldLayer[0].length) || 0, newWidth);

        for (let y = 0; y < copyHeight; y++) {
            for (let x = 0; x < copyWidth; x++) {
                newLayer[y][x] = oldLayer[y][x] || 0;
            }
        }

        newLayers[layerName] = newLayer;
    });

    // Update the map data with new dimensions
    currentMapData.layers = newLayers;

    // Update input fields to reflect new size
    const widthInput = document.getElementById('mapWidth');
    const heightInput = document.getElementById('mapHeight');
    if (widthInput) widthInput.value = newWidth;
    if (heightInput) heightInput.value = newHeight;

    // Re-render the editor
    renderEditor();

    console.log('Mapa redimensionado exitosamente');
}

/**
 * Show dialog to add new NPC
 */
function showAddNpcDialog() {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 400px;
        color: white;
        font-family: monospace;
    `;

    const title = document.createElement('h3');
    title.textContent = '🧙‍♂️ Añadir NPC al Mapa';
    title.style.margin = '0 0 15px 0';

    // NPC Type selector
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Tipo de NPC:';
    typeLabel.style.display = 'block';
    typeLabel.style.marginBottom = '5px';

    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    Object.keys(NPC_DEFINITIONS).forEach(npcType => {
        const option = document.createElement('option');
        option.value = npcType;
        option.textContent = `${NPC_DEFINITIONS[npcType].name} (${npcType})`;
        typeSelect.appendChild(option);
    });

    // Position inputs
    const posContainer = document.createElement('div');
    posContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    `;

    const xLabel = document.createElement('label');
    xLabel.textContent = 'X:';
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.min = '0';
    xInput.max = currentMapData.layers.base[0].length - 1;
    xInput.value = '5';
    xInput.style.cssText = `
        width: 60px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    const yLabel = document.createElement('label');
    yLabel.textContent = 'Y:';
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.min = '0';
    yInput.max = currentMapData.layers.base.length - 1;
    yInput.value = '5';
    yInput.style.cssText = `
        width: 60px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    posContainer.appendChild(xLabel);
    posContainer.appendChild(xInput);
    posContainer.appendChild(yLabel);
    posContainer.appendChild(yInput);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Añadir NPC';
    addBtn.style.background = '#4a5568';
    addBtn.addEventListener('click', () => {
        const npcType = typeSelect.value;
        const x = parseInt(xInput.value);
        const y = parseInt(yInput.value);

        if (x >= 0 && x < currentMapData.layers.base[0].length &&
            y >= 0 && y < currentMapData.layers.base.length) {
            addNpc(npcType, x, y);
            document.body.removeChild(modal);
        } else {
            alert('Posición fuera de los límites del mapa');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(addBtn);

    dialog.appendChild(title);
    dialog.appendChild(typeLabel);
    dialog.appendChild(typeSelect);
    dialog.appendChild(posContainer);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Add NPC to the map
 * @param {string} npcType - NPC type key
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
function addNpc(npcType, x, y) {
    const npcDefinition = NPC_DEFINITIONS[npcType];
    if (!npcDefinition) return;

    const npc = {
        type: npcType,
        x: x,
        y: y,
        name: npcDefinition.name
    };

    currentMapData.npcs.push(npc);
    updateNpcList();
    renderEditor();

    console.log(`NPC añadido: ${npc.name} en (${x}, ${y})`);
}

/**
 * Update the NPC list display
 */
function updateNpcList() {
    const npcList = document.getElementById('npcList');
    if (!npcList) return;

    npcList.innerHTML = '';

    if (!currentMapData.npcs || currentMapData.npcs.length === 0) {
        npcList.textContent = 'No hay NPCs en el mapa';
        return;
    }

    currentMapData.npcs.forEach((npc, index) => {
        const npcItem = document.createElement('div');
        npcItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3px 5px;
            margin: 2px 0;
            background: #444;
            border-radius: 3px;
            font-size: 10px;
        `;

        const npcInfo = document.createElement('span');
        npcInfo.textContent = `${npc.name} (${npc.x},${npc.y})`;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 2px;
        `;

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.title = 'Editar NPC';
        editBtn.style.cssText = `
            background: #4a5568;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 8px;
        `;
        editBtn.addEventListener('click', () => showEditNpcDialog(index));

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.title = 'Eliminar NPC';
        removeBtn.style.cssText = `
            background: #c00;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 8px;
        `;
        removeBtn.addEventListener('click', () => {
            currentMapData.npcs.splice(index, 1);
            updateNpcList();
            renderEditor();
        });

        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(removeBtn);
        npcItem.appendChild(npcInfo);
        npcItem.appendChild(buttonContainer);
        npcList.appendChild(npcItem);
    });
}

/**
 * Show dialog to add new portal
 */
function showAddPortalDialog() {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 450px;
        color: white;
        font-family: monospace;
    `;

    const title = document.createElement('h3');
    title.textContent = '🏞️ Añadir Portal al Mapa';
    title.style.margin = '0 0 15px 0';

    // Target map selector
    const mapLabel = document.createElement('label');
    mapLabel.textContent = 'Mapa destino:';
    mapLabel.style.display = 'block';
    mapLabel.style.marginBottom = '5px';

    const mapSelect = document.createElement('select');
    mapSelect.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    Object.keys(MAP_DEFINITIONS).forEach(mapKey => {
        const mapDef = MAP_DEFINITIONS[mapKey];
        const option = document.createElement('option');
        option.value = mapKey;
        option.textContent = mapDef.name;
        mapSelect.appendChild(option);
    });

    // Portal position inputs
    const portalPosContainer = document.createElement('div');
    portalPosContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    `;

    const portalXLabel = document.createElement('label');
    portalXLabel.textContent = 'Portal X:';
    const portalXInput = document.createElement('input');
    portalXInput.type = 'number';
    portalXInput.min = '0';
    portalXInput.max = currentMapData.layers.base[0].length - 1;
    portalXInput.value = '5';
    portalXInput.style.cssText = `
        width: 70px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    const portalYLabel = document.createElement('label');
    portalYLabel.textContent = 'Portal Y:';
    const portalYInput = document.createElement('input');
    portalYInput.type = 'number';
    portalYInput.min = '0';
    portalYInput.max = currentMapData.layers.base.length - 1;
    portalYInput.value = '5';
    portalYInput.style.cssText = `
        width: 70px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    portalPosContainer.appendChild(portalXLabel);
    portalPosContainer.appendChild(portalXInput);
    portalPosContainer.appendChild(portalYLabel);
    portalPosContainer.appendChild(portalYInput);

    // Target position inputs (optional)
    const targetPosContainer = document.createElement('div');
    targetPosContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        align-items: center;
    `;

    const targetLabel = document.createElement('span');
    targetLabel.textContent = 'Posición destino (opcional):';
    targetLabel.style.fontSize = '12px';
    targetLabel.style.marginRight = '10px';

    const targetXLabel = document.createElement('label');
    targetXLabel.textContent = 'Destino X:';
    const targetXInput = document.createElement('input');
    targetXInput.type = 'number';
    targetXInput.placeholder = 'auto';
    targetXInput.style.cssText = `
        width: 70px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    const targetYLabel = document.createElement('label');
    targetYLabel.textContent = 'Destino Y:';
    const targetYInput = document.createElement('input');
    targetYInput.type = 'number';
    targetYInput.placeholder = 'auto';
    targetYInput.style.cssText = `
        width: 70px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    targetPosContainer.appendChild(targetLabel);
    targetPosContainer.appendChild(targetXLabel);
    targetPosContainer.appendChild(targetXInput);
    targetPosContainer.appendChild(targetYLabel);
    targetPosContainer.appendChild(targetYInput);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Añadir Portal';
    addBtn.style.background = '#3b82f6';
    addBtn.addEventListener('click', () => {
        const targetMap = mapSelect.value;
        const x = parseInt(portalXInput.value);
        const y = parseInt(portalYInput.value);
        const targetX = targetXInput.value ? parseInt(targetXInput.value) : undefined;
        const targetY = targetYInput.value ? parseInt(targetYInput.value) : undefined;

        if (x >= 0 && x < currentMapData.layers.base[0].length &&
            y >= 0 && y < currentMapData.layers.base.length) {
            addPortal(targetMap, x, y, targetX, targetY);
            document.body.removeChild(modal);
        } else {
            alert('Posición del portal fuera de los límites del mapa');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(addBtn);

    dialog.appendChild(title);
    dialog.appendChild(mapLabel);
    dialog.appendChild(mapSelect);
    dialog.appendChild(portalPosContainer);
    dialog.appendChild(targetPosContainer);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Add portal to the map
 * @param {string} targetMap - Target map key
 * @param {number} x - Portal X coordinate
 * @param {number} y - Portal Y coordinate
 * @param {number} targetX - Target X coordinate (optional)
 * @param {number} targetY - Target Y coordinate (optional)
 */
function addPortal(targetMap, x, y, targetX, targetY) {
    const mapDef = MAP_DEFINITIONS[targetMap];
    if (!mapDef) return;

    const portal = {
        x: x,
        y: y,
        targetMap: targetMap,
        targetX: targetX,
        targetY: targetY,
        name: mapDef.name.split(' ')[1] || targetMap // Extract short name
    };

    currentMapData.portals.push(portal);
    updatePortalList();
    renderEditor();

    console.log(`Portal añadido hacia ${mapDef.name} en (${x}, ${y})`);
}

/**
 * Update the portal list display
 */
function updatePortalList() {
    const portalList = document.getElementById('portalList');
    if (!portalList) return;

    portalList.innerHTML = '';

    if (!currentMapData.portals || currentMapData.portals.length === 0) {
        portalList.textContent = 'No hay portales en el mapa';
        return;
    }

    currentMapData.portals.forEach((portal, index) => {
        const portalItem = document.createElement('div');
        portalItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3px 5px;
            margin: 2px 0;
            background: #1e40af;
            border-radius: 3px;
            font-size: 10px;
        `;

        const portalInfo = document.createElement('span');
        const mapDef = MAP_DEFINITIONS[portal.targetMap];
        const displayName = mapDef ? mapDef.name.split(' ')[1] || portal.targetMap : portal.targetMap;
        portalInfo.textContent = `${displayName} (${portal.x},${portal.y})`;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 2px;
        `;

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.title = 'Editar portal';
        editBtn.style.cssText = `
            background: #4a5568;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 8px;
        `;
        editBtn.addEventListener('click', () => showEditPortalDialog(index));

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.title = 'Eliminar portal';
        removeBtn.style.cssText = `
            background: #c00;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 8px;
        `;
        removeBtn.addEventListener('click', () => {
            currentMapData.portals.splice(index, 1);
            updatePortalList();
            renderEditor();
        });

        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(removeBtn);
        portalItem.appendChild(portalInfo);
        portalItem.appendChild(buttonContainer);
        portalList.appendChild(portalItem);
    });
}

/**
 * Show dialog to add spawn type
 */
function showAddSpawnDialog() {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 500px;
        color: white;
        font-family: monospace;
    `;

    const title = document.createElement('h3');
    title.textContent = '⚔️ Añadir Tipo de Spawn Automático';
    title.style.margin = '0 0 15px 0';

    // Enemy type selector
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Tipo de enemigo:';
    typeLabel.style.display = 'block';
    typeLabel.style.marginBottom = '5px';

    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    Object.keys(ENEMY_STATS).forEach(enemyType => {
        const option = document.createElement('option');
        option.value = enemyType;
        option.textContent = `${enemyType.charAt(0).toUpperCase() + enemyType.slice(1)} (HP: ${ENEMY_STATS[enemyType].hp}, Dmg: ${ENEMY_STATS[enemyType].damage.min}-${ENEMY_STATS[enemyType].damage.max})`;
        typeSelect.appendChild(option);
    });

    // Spawn parameters
    const paramsContainer = document.createElement('div');
    paramsContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 15px;
    `;

    // Count
    const countLabel = document.createElement('label');
    countLabel.textContent = 'Cantidad:';
    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.min = '1';
    countInput.max = '50';
    countInput.value = '5';
    countInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    // Min level
    const minLevelLabel = document.createElement('label');
    minLevelLabel.textContent = 'Nivel mínimo:';
    const minLevelInput = document.createElement('input');
    minLevelInput.type = 'number';
    minLevelInput.min = '1';
    minLevelInput.max = '100';
    minLevelInput.value = '1';
    minLevelInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    // Max level
    const maxLevelLabel = document.createElement('label');
    maxLevelLabel.textContent = 'Nivel máximo:';
    const maxLevelInput = document.createElement('input');
    maxLevelInput.type = 'number';
    maxLevelInput.min = '1';
    maxLevelInput.max = '100';
    maxLevelInput.value = '3';
    maxLevelInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    paramsContainer.appendChild(countLabel);
    paramsContainer.appendChild(countInput);
    paramsContainer.appendChild(minLevelLabel);
    paramsContainer.appendChild(minLevelInput);
    paramsContainer.appendChild(maxLevelLabel);
    paramsContainer.appendChild(maxLevelInput);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Añadir Spawn';
    addBtn.style.background = '#dc2626';
    addBtn.addEventListener('click', () => {
        const enemyType = typeSelect.value;
        const count = parseInt(countInput.value);
        const minLevel = parseInt(minLevelInput.value);
        const maxLevel = parseInt(maxLevelInput.value);

        if (minLevel <= maxLevel && count > 0) {
            addEnemySpawn(enemyType, count, minLevel, maxLevel);
            document.body.removeChild(modal);
        } else {
            alert('Configuración inválida');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(addBtn);

    dialog.appendChild(title);
    dialog.appendChild(typeLabel);
    dialog.appendChild(typeSelect);
    dialog.appendChild(paramsContainer);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Show dialog to add specific enemy
 */
function showAddSpecificEnemyDialog() {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 450px;
        color: white;
        font-family: monospace;
    `;

    const title = document.createElement('h3');
    title.textContent = '👹 Añadir Enemigo Específico';
    title.style.margin = '0 0 15px 0';

    // Enemy type selector
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Tipo de enemigo:';
    typeLabel.style.display = 'block';
    typeLabel.style.marginBottom = '5px';

    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    Object.keys(ENEMY_STATS).forEach(enemyType => {
        const option = document.createElement('option');
        option.value = enemyType;
        option.textContent = `${enemyType.charAt(0).toUpperCase() + enemyType.slice(1)} (HP: ${ENEMY_STATS[enemyType].hp})`;
        typeSelect.appendChild(option);
    });

    // Position and level inputs
    const paramsContainer = document.createElement('div');
    paramsContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        margin-bottom: 15px;
    `;

    // X position
    const xLabel = document.createElement('label');
    xLabel.textContent = 'Posición X:';
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.min = '0';
    xInput.max = currentMapData.layers.base[0].length - 1;
    xInput.value = '5';
    xInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    // Y position
    const yLabel = document.createElement('label');
    yLabel.textContent = 'Posición Y:';
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.min = '0';
    yInput.max = currentMapData.layers.base.length - 1;
    yInput.value = '5';
    yInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    // Level
    const levelLabel = document.createElement('label');
    levelLabel.textContent = 'Nivel:';
    const levelInput = document.createElement('input');
    levelInput.type = 'number';
    levelInput.min = '1';
    levelInput.max = '100';
    levelInput.value = '5';
    levelInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    paramsContainer.appendChild(xLabel);
    paramsContainer.appendChild(xInput);
    paramsContainer.appendChild(yLabel);
    paramsContainer.appendChild(yInput);
    paramsContainer.appendChild(levelLabel);
    paramsContainer.appendChild(levelInput);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Añadir Enemigo';
    addBtn.style.background = '#dc2626';
    addBtn.addEventListener('click', () => {
        const enemyType = typeSelect.value;
        const x = parseInt(xInput.value);
        const y = parseInt(yInput.value);
        const level = parseInt(levelInput.value);

        if (x >= 0 && x < currentMapData.layers.base[0].length &&
            y >= 0 && y < currentMapData.layers.base.length &&
            level > 0) {
            addSpecificEnemy(enemyType, x, y, level);
            document.body.removeChild(modal);
        } else {
            alert('Posición fuera de los límites del mapa o nivel inválido');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(addBtn);

    dialog.appendChild(title);
    dialog.appendChild(typeLabel);
    dialog.appendChild(typeSelect);
    dialog.appendChild(paramsContainer);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Add enemy spawn type to the map
 * @param {string} enemyType - Enemy type
 * @param {number} count - Number of enemies to spawn
 * @param {number} minLevel - Minimum level
 * @param {number} maxLevel - Maximum level
 */
function addEnemySpawn(enemyType, count, minLevel, maxLevel) {
    // Initialize enemies object if it doesn't exist
    if (!currentMapData.enemies) {
        currentMapData.enemies = {
            enabled: true,
            types: [],
            spawnAreas: "field",
            respawnTime: 300000
        };
    }

    // Ensure types array exists
    if (!currentMapData.enemies.types) {
        currentMapData.enemies.types = [];
    }

    const spawnType = {
        type: enemyType,
        count: count,
        minLevel: minLevel,
        maxLevel: maxLevel
    };

    currentMapData.enemies.types.push(spawnType);
    updateEnemyList();
    renderEditor();

    console.log(`Spawn type añadido: ${count}x ${enemyType} (lvl ${minLevel}-${maxLevel})`);
}

/**
 * Add specific enemy to the map
 * @param {string} enemyType - Enemy type
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} level - Enemy level
 */
function addSpecificEnemy(enemyType, x, y, level) {
    // Initialize enemies object if it doesn't exist
    if (!currentMapData.enemies) {
        currentMapData.enemies = {
            enabled: true,
            types: [],
            spawnAreas: "field",
            respawnTime: 300000
        };
    }

    // Ensure types array exists
    if (!currentMapData.enemies.types) {
        currentMapData.enemies.types = [];
    }

    const specificEnemy = {
        type: enemyType,
        x: x,
        y: y,
        level: level
    };

    currentMapData.enemies.types.push(specificEnemy);
    updateEnemyList();
    renderEditor();

    console.log(`Enemigo específico añadido: ${enemyType} en (${x}, ${y}) nivel ${level}`);
}

/**
 * Update the enemy list display
 */
function updateEnemyList() {
    const enemyList = document.getElementById('enemyList');
    if (!enemyList) return;

    enemyList.innerHTML = '';

    if (!currentMapData.enemies || !currentMapData.enemies.types || currentMapData.enemies.types.length === 0) {
        enemyList.textContent = 'No hay enemigos configurados';
        return;
    }

    currentMapData.enemies.types.forEach((enemy, index) => {
        const enemyItem = document.createElement('div');
        enemyItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3px 5px;
            margin: 2px 0;
            background: #7f1d1d;
            border-radius: 3px;
            font-size: 10px;
        `;

        let enemyInfo;
        if (enemy.x !== undefined && enemy.y !== undefined) {
            // Specific enemy
            enemyInfo = document.createElement('span');
            enemyInfo.textContent = `${enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1)} (${enemy.x},${enemy.y}) Lvl:${enemy.level}`;
        } else {
            // Spawn type
            enemyInfo = document.createElement('span');
            enemyInfo.textContent = `${enemy.count}x ${enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1)} (Lvl:${enemy.minLevel}-${enemy.maxLevel})`;
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 2px;
        `;

        // Only show edit button for specific enemies (not spawn types)
        if (enemy.x !== undefined && enemy.y !== undefined) {
            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️';
            editBtn.title = 'Editar enemigo';
            editBtn.style.cssText = `
                background: #4a5568;
                border: none;
                color: white;
                cursor: pointer;
                padding: 2px 4px;
                border-radius: 2px;
                font-size: 8px;
            `;
            editBtn.addEventListener('click', () => showEditSpecificEnemyDialog(index));

            buttonContainer.appendChild(editBtn);
        }

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.title = 'Eliminar enemigo';
        removeBtn.style.cssText = `
            background: #c00;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 8px;
        `;
        removeBtn.addEventListener('click', () => {
            currentMapData.enemies.types.splice(index, 1);
            updateEnemyList();
            renderEditor();
        });

        buttonContainer.appendChild(removeBtn);
        enemyItem.appendChild(enemyInfo);
        enemyItem.appendChild(buttonContainer);
        enemyList.appendChild(enemyItem);
    });
}

/**
 * Show dialog to add treasure chest
 */
function showAddTreasureDialog() {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 500px;
        max-width: 600px;
        color: white;
        font-family: monospace;
        max-height: 80vh;
        overflow-y: auto;
    `;

    const title = document.createElement('h3');
    title.textContent = '💰 Añadir Cofre con Tesoro';
    title.style.margin = '0 0 15px 0';

    // Chest position inputs
    const posContainer = document.createElement('div');
    posContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    `;

    const xLabel = document.createElement('label');
    xLabel.textContent = 'Posición X:';
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.min = '0';
    xInput.max = currentMapData.layers.base[0].length - 1;
    xInput.value = '5';
    xInput.style.cssText = `
        width: 80px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    const yLabel = document.createElement('label');
    yLabel.textContent = 'Posición Y:';
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.min = '0';
    yInput.max = currentMapData.layers.base.length - 1;
    yInput.value = '5';
    yInput.style.cssText = `
        width: 80px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    posContainer.appendChild(xLabel);
    posContainer.appendChild(xInput);
    posContainer.appendChild(yLabel);
    posContainer.appendChild(yInput);

    // Treasure contents
    const contentsLabel = document.createElement('label');
    contentsLabel.textContent = 'Contenido del cofre:';
    contentsLabel.style.display = 'block';
    contentsLabel.style.marginBottom = '10px';

    const contentsList = document.createElement('div');
    contentsList.id = 'treasureContents';
    contentsList.style.cssText = `
        border: 1px solid #555;
        background: #111;
        padding: 10px;
        margin-bottom: 15px;
        min-height: 100px;
        max-height: 200px;
        overflow-y: auto;
    `;
    contentsList.textContent = 'No hay items añadidos';

    const addItemBtn = document.createElement('button');
    addItemBtn.textContent = '+ Añadir Item';
    addItemBtn.style.cssText = `
        margin-bottom: 15px;
        background: #fbbf24;
        color: #000;
    `;
    addItemBtn.addEventListener('click', () => showAddItemDialog(contentsList));

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Añadir Cofre';
    addBtn.style.background = '#fbbf24';
    addBtn.style.color = '#000';
    addBtn.addEventListener('click', () => {
        const x = parseInt(xInput.value);
        const y = parseInt(yInput.value);

        if (x >= 0 && x < currentMapData.layers.base[0].length &&
            y >= 0 && y < currentMapData.layers.base.length) {
            // Get contents from the contents list
            const contents = getTreasureContents(contentsList);
            addTreasure(x, y, contents);
            document.body.removeChild(modal);
        } else {
            alert('Posición del cofre fuera de los límites del mapa');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(addBtn);

    dialog.appendChild(title);
    dialog.appendChild(posContainer);
    dialog.appendChild(contentsLabel);
    dialog.appendChild(addItemBtn);
    dialog.appendChild(contentsList);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Show dialog to add item to treasure
 */
function showAddItemDialog(contentsList) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3100;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 400px;
        color: white;
        font-family: monospace;
    `;

    const title = document.createElement('h4');
    title.textContent = '📦 Añadir Item al Cofre';
    title.style.margin = '0 0 15px 0';

    // Item type selector
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Tipo de item:';
    typeLabel.style.display = 'block';
    typeLabel.style.marginBottom = '5px';

    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    // Add item types
    const itemTypes = [
        { value: 'weapon', label: '⚔️ Arma' },
        { value: 'armor', label: '🛡️ Armadura' },
        { value: 'consumable', label: '🧪 Consumible' },
        { value: 'gold', label: '💰 Oro' }
    ];

    itemTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        typeSelect.appendChild(option);
    });

    // Item selector (dynamically populated)
    const itemLabel = document.createElement('label');
    itemLabel.textContent = 'Item específico:';
    itemLabel.style.display = 'block';
    itemLabel.style.marginBottom = '5px';

    const itemSelect = document.createElement('select');
    itemSelect.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    // Quantity input
    const quantityLabel = document.createElement('label');
    quantityLabel.textContent = 'Cantidad:';
    quantityLabel.style.display = 'block';
    quantityLabel.style.marginBottom = '5px';

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = '1';
    quantityInput.max = '1000';
    quantityInput.value = '1';
    quantityInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    // Update item selector when type changes
    typeSelect.addEventListener('change', () => {
        updateItemSelector(itemSelect, typeSelect.value);
    });

    // Initialize with weapon items
    updateItemSelector(itemSelect, 'weapon');

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Añadir Item';
    addBtn.style.background = '#4a5568';
    addBtn.addEventListener('click', () => {
        const itemType = typeSelect.value;
        const itemId = itemSelect.value;
        const quantity = parseInt(quantityInput.value);

        if (quantity > 0) {
            addItemToTreasure(contentsList, itemType, itemId, quantity);
            document.body.removeChild(modal);
        } else {
            alert('Cantidad inválida');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(addBtn);

    dialog.appendChild(title);
    dialog.appendChild(typeLabel);
    dialog.appendChild(typeSelect);
    dialog.appendChild(itemLabel);
    dialog.appendChild(itemSelect);
    dialog.appendChild(quantityLabel);
    dialog.appendChild(quantityInput);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Update item selector based on type
 */
function updateItemSelector(itemSelect, type) {
    itemSelect.innerHTML = '';

    if (type === 'gold') {
        const option = document.createElement('option');
        option.value = 'gold';
        option.textContent = '💰 Oro';
        itemSelect.appendChild(option);
        return;
    }

    Object.keys(ITEM_TYPES).forEach(itemKey => {
        const item = ITEM_TYPES[itemKey];
        if (item.type === type) {
            const option = document.createElement('option');
            option.value = itemKey;
            option.textContent = `${item.icon} ${item.name}`;
            itemSelect.appendChild(option);
        }
    });
}

/**
 * Add item to treasure contents list
 */
function addItemToTreasure(contentsList, itemType, itemId, quantity) {
    const itemDiv = document.createElement('div');
    itemDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 3px 5px;
        margin: 2px 0;
        background: #444;
        border-radius: 3px;
        font-size: 10px;
    `;

    let itemName = '';
    if (itemType === 'gold') {
        itemName = '💰 Oro';
    } else {
        const item = ITEM_TYPES[itemId];
        itemName = item ? `${item.icon} ${item.name}` : itemId;
    }

    const itemInfo = document.createElement('span');
    itemInfo.textContent = `${itemName} x${quantity}`;

    // Store data for later retrieval
    itemDiv.dataset.itemType = itemType;
    itemDiv.dataset.itemId = itemId;
    itemDiv.dataset.quantity = quantity;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '❌';
    removeBtn.title = 'Eliminar item';
    removeBtn.style.cssText = `
        background: #c00;
        border: none;
        color: white;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 8px;
    `;
    removeBtn.addEventListener('click', () => {
        contentsList.removeChild(itemDiv);
        updateTreasureContentsDisplay(contentsList);
    });

    itemDiv.appendChild(itemInfo);
    itemDiv.appendChild(removeBtn);
    contentsList.appendChild(itemDiv);

    updateTreasureContentsDisplay(contentsList);
}

/**
 * Update treasure contents display
 */
function updateTreasureContentsDisplay(contentsList) {
    const items = contentsList.querySelectorAll('div[data-item-type]');
    if (items.length === 0) {
        contentsList.textContent = 'No hay items añadidos';
    } else {
        // Clear any text content and keep only item divs
        const textNodes = Array.from(contentsList.childNodes).filter(node =>
            node.nodeType === Node.TEXT_NODE
        );
        textNodes.forEach(node => contentsList.removeChild(node));
    }
}

/**
 * Get treasure contents from the contents list
 */
function getTreasureContents(contentsList) {
    const contents = [];
    const items = contentsList.querySelectorAll('div[data-item-type]');

    items.forEach(item => {
        const itemType = item.dataset.itemType;
        const itemId = item.dataset.itemId;
        const quantity = parseInt(item.dataset.quantity);

        if (itemType === 'gold') {
            contents.push({
                type: 'gold',
                quantity: quantity
            });
        } else {
            contents.push({
                type: itemType,
                id: itemId,
                quantity: quantity
            });
        }
    });

    return contents;
}

/**
 * Add treasure chest to the map
 */
function addTreasure(x, y, contents) {
    // Initialize treasures array if it doesn't exist
    if (!currentMapData.treasures) {
        currentMapData.treasures = [];
    }

    const treasure = {
        x: x,
        y: y,
        type: 'chest',
        contents: contents
    };

    currentMapData.treasures.push(treasure);
    updateTreasureList();
    renderEditor();

    console.log(`Cofre añadido en (${x}, ${y}) con ${contents.length} items`);
}

/**
 * Update the treasure list display
 */
function updateTreasureList() {
    const treasureList = document.getElementById('treasureList');
    if (!treasureList) return;

    treasureList.innerHTML = '';

    if (!currentMapData.treasures || currentMapData.treasures.length === 0) {
        treasureList.textContent = 'No hay tesoros en el mapa';
        return;
    }

    currentMapData.treasures.forEach((treasure, index) => {
        const treasureItem = document.createElement('div');
        treasureItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3px 5px;
            margin: 2px 0;
            background: #92400e;
            border-radius: 3px;
            font-size: 10px;
        `;

        const contentCount = treasure.contents ? treasure.contents.length : 0;
        const treasureInfo = document.createElement('span');
        treasureInfo.textContent = `Cofre (${treasure.x},${treasure.y}) - ${contentCount} items`;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 2px;
        `;

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.title = 'Editar cofre';
        editBtn.style.cssText = `
            background: #4a5568;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 8px;
        `;
        editBtn.addEventListener('click', () => showEditTreasureDialog(index));

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.title = 'Eliminar cofre';
        removeBtn.style.cssText = `
            background: #c00;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 8px;
        `;
        removeBtn.addEventListener('click', () => {
            currentMapData.treasures.splice(index, 1);
            updateTreasureList();
            renderEditor();
        });

        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(removeBtn);
        treasureItem.appendChild(treasureInfo);
        treasureItem.appendChild(buttonContainer);
        treasureList.appendChild(treasureItem);
    });
}

/**
 * Show dialog to edit existing NPC
 */
function showEditNpcDialog(index) {
    const npc = currentMapData.npcs[index];
    if (!npc) return;

    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 400px;
        color: white;
        font-family: monospace;
    `;

    const title = document.createElement('h3');
    title.textContent = '✏️ Editar NPC';
    title.style.margin = '0 0 15px 0';

    // NPC Type selector
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Tipo de NPC:';
    typeLabel.style.display = 'block';
    typeLabel.style.marginBottom = '5px';

    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    Object.keys(NPC_DEFINITIONS).forEach(npcType => {
        const option = document.createElement('option');
        option.value = npcType;
        option.textContent = `${NPC_DEFINITIONS[npcType].name} (${npcType})`;
        if (npcType === npc.type) option.selected = true;
        typeSelect.appendChild(option);
    });

    // Position inputs
    const posContainer = document.createElement('div');
    posContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    `;

    const xLabel = document.createElement('label');
    xLabel.textContent = 'X:';
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.min = '0';
    xInput.max = currentMapData.layers.base[0].length - 1;
    xInput.value = npc.x;
    xInput.style.cssText = `
        width: 60px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    const yLabel = document.createElement('label');
    yLabel.textContent = 'Y:';
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.min = '0';
    yInput.max = currentMapData.layers.base.length - 1;
    yInput.value = npc.y;
    yInput.style.cssText = `
        width: 60px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    posContainer.appendChild(xLabel);
    posContainer.appendChild(xInput);
    posContainer.appendChild(yLabel);
    posContainer.appendChild(yInput);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar Cambios';
    saveBtn.style.background = '#4a5568';
    saveBtn.addEventListener('click', () => {
        const npcType = typeSelect.value;
        const x = parseInt(xInput.value);
        const y = parseInt(yInput.value);

        if (x >= 0 && x < currentMapData.layers.base[0].length &&
            y >= 0 && y < currentMapData.layers.base.length) {
            // Update existing NPC
            const npcDefinition = NPC_DEFINITIONS[npcType];
            if (npcDefinition) {
                currentMapData.npcs[index] = {
                    type: npcType,
                    x: x,
                    y: y,
                    name: npcDefinition.name
                };
                updateNpcList();
                renderEditor();
                document.body.removeChild(modal);
            }
        } else {
            alert('Posición fuera de los límites del mapa');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(saveBtn);

    dialog.appendChild(title);
    dialog.appendChild(typeLabel);
    dialog.appendChild(typeSelect);
    dialog.appendChild(posContainer);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Show dialog to edit existing portal
 */
function showEditPortalDialog(index) {
    const portal = currentMapData.portals[index];
    if (!portal) return;

    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 450px;
        color: white;
        font-family: monospace;
    `;

    const title = document.createElement('h3');
    title.textContent = '✏️ Editar Portal';
    title.style.margin = '0 0 15px 0';

    // Target map selector
    const mapLabel = document.createElement('label');
    mapLabel.textContent = 'Mapa destino:';
    mapLabel.style.display = 'block';
    mapLabel.style.marginBottom = '5px';

    const mapSelect = document.createElement('select');
    mapSelect.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    Object.keys(MAP_DEFINITIONS).forEach(mapKey => {
        const mapDef = MAP_DEFINITIONS[mapKey];
        const option = document.createElement('option');
        option.value = mapKey;
        option.textContent = mapDef.name;
        if (mapKey === portal.targetMap) option.selected = true;
        mapSelect.appendChild(option);
    });

    // Portal position inputs
    const portalPosContainer = document.createElement('div');
    portalPosContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    `;

    const portalXLabel = document.createElement('label');
    portalXLabel.textContent = 'Portal X:';
    const portalXInput = document.createElement('input');
    portalXInput.type = 'number';
    portalXInput.min = '0';
    portalXInput.max = currentMapData.layers.base[0].length - 1;
    portalXInput.value = portal.x;
    portalXInput.style.cssText = `
        width: 70px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    const portalYLabel = document.createElement('label');
    portalYLabel.textContent = 'Portal Y:';
    const portalYInput = document.createElement('input');
    portalYInput.type = 'number';
    portalYInput.min = '0';
    portalYInput.max = currentMapData.layers.base.length - 1;
    portalYInput.value = portal.y;
    portalYInput.style.cssText = `
        width: 70px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    portalPosContainer.appendChild(portalXLabel);
    portalPosContainer.appendChild(portalXInput);
    portalPosContainer.appendChild(portalYLabel);
    portalPosContainer.appendChild(portalYInput);

    // Target position inputs (optional)
    const targetPosContainer = document.createElement('div');
    targetPosContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        align-items: center;
    `;

    const targetLabel = document.createElement('span');
    targetLabel.textContent = 'Posición destino (opcional):';
    targetLabel.style.fontSize = '12px';
    targetLabel.style.marginRight = '10px';

    const targetXLabel = document.createElement('label');
    targetXLabel.textContent = 'Destino X:';
    const targetXInput = document.createElement('input');
    targetXInput.type = 'number';
    targetXInput.placeholder = 'auto';
    targetXInput.value = portal.targetX || '';
    targetXInput.style.cssText = `
        width: 70px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    const targetYLabel = document.createElement('label');
    targetYLabel.textContent = 'Destino Y:';
    const targetYInput = document.createElement('input');
    targetYInput.type = 'number';
    targetYInput.placeholder = 'auto';
    targetYInput.value = portal.targetY || '';
    targetYInput.style.cssText = `
        width: 70px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    targetPosContainer.appendChild(targetLabel);
    targetPosContainer.appendChild(targetXLabel);
    targetPosContainer.appendChild(targetXInput);
    targetPosContainer.appendChild(targetYLabel);
    targetPosContainer.appendChild(targetYInput);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar Cambios';
    saveBtn.style.background = '#3b82f6';
    saveBtn.addEventListener('click', () => {
        const targetMap = mapSelect.value;
        const x = parseInt(portalXInput.value);
        const y = parseInt(portalYInput.value);
        const targetX = targetXInput.value ? parseInt(targetXInput.value) : undefined;
        const targetY = targetYInput.value ? parseInt(targetYInput.value) : undefined;

        if (x >= 0 && x < currentMapData.layers.base[0].length &&
            y >= 0 && y < currentMapData.layers.base.length) {
            // Update existing portal
            const mapDef = MAP_DEFINITIONS[targetMap];
            if (mapDef) {
                currentMapData.portals[index] = {
                    x: x,
                    y: y,
                    targetMap: targetMap,
                    targetX: targetX,
                    targetY: targetY,
                    name: mapDef.name.split(' ')[1] || targetMap
                };
                updatePortalList();
                renderEditor();
                document.body.removeChild(modal);
            }
        } else {
            alert('Posición del portal fuera de los límites del mapa');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(saveBtn);

    dialog.appendChild(title);
    dialog.appendChild(mapLabel);
    dialog.appendChild(mapSelect);
    dialog.appendChild(portalPosContainer);
    dialog.appendChild(targetPosContainer);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Show dialog to edit existing treasure chest
 */
function showEditTreasureDialog(index) {
    const treasure = currentMapData.treasures[index];
    if (!treasure) return;

    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 500px;
        max-width: 600px;
        color: white;
        font-family: monospace;
        max-height: 80vh;
        overflow-y: auto;
    `;

    const title = document.createElement('h3');
    title.textContent = '✏️ Editar Cofre con Tesoro';
    title.style.margin = '0 0 15px 0';

    // Chest position inputs
    const posContainer = document.createElement('div');
    posContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    `;

    const xLabel = document.createElement('label');
    xLabel.textContent = 'Posición X:';
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.min = '0';
    xInput.max = currentMapData.layers.base[0].length - 1;
    xInput.value = treasure.x;
    xInput.style.cssText = `
        width: 80px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    const yLabel = document.createElement('label');
    yLabel.textContent = 'Posición Y:';
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.min = '0';
    yInput.max = currentMapData.layers.base.length - 1;
    yInput.value = treasure.y;
    yInput.style.cssText = `
        width: 80px;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    posContainer.appendChild(xLabel);
    posContainer.appendChild(xInput);
    posContainer.appendChild(yLabel);
    posContainer.appendChild(yInput);

    // Treasure contents
    const contentsLabel = document.createElement('label');
    contentsLabel.textContent = 'Contenido del cofre:';
    contentsLabel.style.display = 'block';
    contentsLabel.style.marginBottom = '10px';

    const contentsList = document.createElement('div');
    contentsList.id = 'editTreasureContents';
    contentsList.style.cssText = `
        border: 1px solid #555;
        background: #111;
        padding: 10px;
        margin-bottom: 15px;
        min-height: 100px;
        max-height: 200px;
        overflow-y: auto;
    `;

    // Pre-populate with existing contents
    if (treasure.contents && treasure.contents.length > 0) {
        treasure.contents.forEach(content => {
            addItemToTreasure(contentsList, content.type, content.id || content.type, content.quantity);
        });
    } else {
        contentsList.textContent = 'No hay items añadidos';
    }

    const addItemBtn = document.createElement('button');
    addItemBtn.textContent = '+ Añadir Item';
    addItemBtn.style.cssText = `
        margin-bottom: 15px;
        background: #fbbf24;
        color: #000;
    `;
    addItemBtn.addEventListener('click', () => showAddItemDialog(contentsList));

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar Cambios';
    saveBtn.style.background = '#fbbf24';
    saveBtn.style.color = '#000';
    saveBtn.addEventListener('click', () => {
        const x = parseInt(xInput.value);
        const y = parseInt(yInput.value);

        if (x >= 0 && x < currentMapData.layers.base[0].length &&
            y >= 0 && y < currentMapData.layers.base.length) {
            // Get contents from the contents list
            const contents = getTreasureContents(contentsList);

            // Update existing treasure
            currentMapData.treasures[index] = {
                x: x,
                y: y,
                type: 'chest',
                contents: contents
            };

            updateTreasureList();
            renderEditor();
            document.body.removeChild(modal);
        } else {
            alert('Posición del cofre fuera de los límites del mapa');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(saveBtn);

    dialog.appendChild(title);
    dialog.appendChild(posContainer);
    dialog.appendChild(contentsLabel);
    dialog.appendChild(addItemBtn);
    dialog.appendChild(contentsList);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Show dialog to edit existing specific enemy
 */
function showEditSpecificEnemyDialog(index) {
    const enemy = currentMapData.enemies.types[index];
    if (!enemy || !enemy.x || !enemy.y) return;

    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #555;
        min-width: 450px;
        color: white;
        font-family: monospace;
    `;

    const title = document.createElement('h3');
    title.textContent = '✏️ Editar Enemigo Específico';
    title.style.margin = '0 0 15px 0';

    // Enemy type selector
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Tipo de enemigo:';
    typeLabel.style.display = 'block';
    typeLabel.style.marginBottom = '5px';

    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-bottom: 15px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    Object.keys(ENEMY_STATS).forEach(enemyType => {
        const option = document.createElement('option');
        option.value = enemyType;
        option.textContent = `${enemyType.charAt(0).toUpperCase() + enemyType.slice(1)} (HP: ${ENEMY_STATS[enemyType].hp})`;
        if (enemyType === enemy.type) option.selected = true;
        typeSelect.appendChild(option);
    });

    // Position and level inputs
    const paramsContainer = document.createElement('div');
    paramsContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        margin-bottom: 15px;
    `;

    // X position
    const xLabel = document.createElement('label');
    xLabel.textContent = 'Posición X:';
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.min = '0';
    xInput.max = currentMapData.layers.base[0].length - 1;
    xInput.value = enemy.x;
    xInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    // Y position
    const yLabel = document.createElement('label');
    yLabel.textContent = 'Posición Y:';
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.min = '0';
    yInput.max = currentMapData.layers.base.length - 1;
    yInput.value = enemy.y;
    yInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    // Level
    const levelLabel = document.createElement('label');
    levelLabel.textContent = 'Nivel:';
    const levelInput = document.createElement('input');
    levelInput.type = 'number';
    levelInput.min = '1';
    levelInput.max = '100';
    levelInput.value = enemy.level;
    levelInput.style.cssText = `
        width: 100%;
        padding: 5px;
        background: #222;
        color: white;
        border: 1px solid #555;
    `;

    paramsContainer.appendChild(xLabel);
    paramsContainer.appendChild(xInput);
    paramsContainer.appendChild(yLabel);
    paramsContainer.appendChild(yInput);
    paramsContainer.appendChild(levelLabel);
    paramsContainer.appendChild(levelInput);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar Cambios';
    saveBtn.style.background = '#dc2626';
    saveBtn.addEventListener('click', () => {
        const enemyType = typeSelect.value;
        const x = parseInt(xInput.value);
        const y = parseInt(yInput.value);
        const level = parseInt(levelInput.value);

        if (x >= 0 && x < currentMapData.layers.base[0].length &&
            y >= 0 && y < currentMapData.layers.base.length &&
            level > 0) {
            // Update existing specific enemy
            currentMapData.enemies.types[index] = {
                type: enemyType,
                x: x,
                y: y,
                level: level
            };
            updateEnemyList();
            renderEditor();
            document.body.removeChild(modal);
        } else {
            alert('Posición fuera de los límites del mapa o nivel inválido');
        }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(saveBtn);

    dialog.appendChild(title);
    dialog.appendChild(typeLabel);
    dialog.appendChild(typeSelect);
    dialog.appendChild(paramsContainer);
    dialog.appendChild(buttonContainer);

    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

/**
 * Check if map editor is visible
 */
export function isMapEditorVisible() {
    return mapEditorVisible;
}

// Initialize when module loads
initMapEditor();
