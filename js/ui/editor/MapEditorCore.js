/**
 * MapEditorCore.js
 * Core state and data management for Map Editor
 */

import { gameState } from '../../state.js';
import { CONFIG } from '../../config.js';
import { updateConnectionsUI } from './MapEditorConnections.js';

// Editor state
export let currentMapData = null;
export let currentLayer = 'base';
export let selectedTileType = 0;
export let selectedTool = 'paint';
export let zoomLevel = 1;
export let panOffset = { x: 0, y: 0 };
export let isPanning = false;
export let lastMousePos = { x: 0, y: 0 };
export let palettePage = 0;

// Layer definitions
export const LAYERS = {
    base: { name: 'Base', visible: true, opacity: 1.0 },
    props: { name: 'Props', visible: true, opacity: 1.0 },
    roofs: { name: 'Techos', visible: true, opacity: 1.0 },
    doors: { name: 'Puertas', visible: true, opacity: 1.0 },
    windows: { name: 'Ventanas', visible: true, opacity: 1.0 }
};

// Entity visibility
export let showNPCs = true;
export let showEnemies = true;
export let showPortals = true;
export let showTreasures = true;

// Constants
export const PALETTE_PAGE_SIZE = 64;

/**
 * Set current map data
 */
export function setCurrentMapData(data) {
    currentMapData = data;
}

/**
 * Get current map data
 */
export function getCurrentMapData() {
    return currentMapData;
}

/**
 * Set current layer
 */
export function setCurrentLayer(layer) {
    currentLayer = layer;
}

/**
 * Set selected tile type
 */
export function setSelectedTileType(type) {
    selectedTileType = type;
}

/**
 * Set selected tool
 */
export function setSelectedTool(tool) {
    selectedTool = tool;
}

/**
 * Set zoom level
 */
export function setZoomLevel(zoom) {
    zoomLevel = zoom;
}

/**
 * Set pan offset
 */
export function setPanOffset(offset) {
    panOffset = offset;
}

/**
 * Set panning state
 */
export function setPanning(panning) {
    isPanning = panning;
}

/**
 * Set last mouse position
 */
export function setLastMousePos(pos) {
    lastMousePos = pos;
}

/**
 * Set palette page
 */
export function setPalettePage(page) {
    palettePage = page;
}

/**
 * Toggle entity visibility
 */
export function toggleNPCVisibility() {
    showNPCs = !showNPCs;
    return showNPCs;
}

export function toggleEnemyVisibility() {
    showEnemies = !showEnemies;
    return showEnemies;
}

export function togglePortalVisibility() {
    showPortals = !showPortals;
    return showPortals;
}

export function toggleTreasureVisibility() {
    showTreasures = !showTreasures;
    return showTreasures;
}

/**
 * Load current map from gameState
 */
export function loadCurrentMap() {
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
            playerSpawn: { x: 5, y: 5 },
            adjacentMaps: {
                north: null,
                south: null,
                east: null,
                west: null
            }
        };
    }
}

/**
 * Resize the current map
 */
export function resizeMap(newWidth, newHeight) {
    if (!currentMapData) return false;

    console.log(`Redimensionando mapa de ${currentMapData.layers.base.length}x${currentMapData.layers.base[0].length} a ${newHeight}x${newWidth}`);

    const newLayers = {};

    Object.keys(LAYERS).forEach(layerName => {
        const oldLayer = currentMapData.layers[layerName] || [];
        const newLayer = Array(newHeight).fill().map(() => Array(newWidth).fill(0));

        const copyHeight = Math.min(oldLayer.length || 0, newHeight);
        const copyWidth = Math.min((oldLayer[0] && oldLayer[0].length) || 0, newWidth);

        for (let y = 0; y < copyHeight; y++) {
            for (let x = 0; x < copyWidth; x++) {
                newLayer[y][x] = oldLayer[y][x] || 0;
            }
        }

        newLayers[layerName] = newLayer;
    });

    currentMapData.layers = newLayers;
    console.log('Mapa redimensionado exitosamente');
    return true;
}

/**
 * Export current map to JSON
 */
export function exportMapData() {
    if (!currentMapData) return null;

    const dataStr = JSON.stringify(currentMapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${currentMapData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
}

/**
 * Load map from file
 */
export function loadMapFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedMap = JSON.parse(e.target.result);

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
                    playerSpawn: loadedMap.playerSpawn || { x: 5, y: 5 },
                    adjacentMaps: loadedMap.adjacentMaps || {
                        north: null,
                        south: null,
                        east: null,
                        west: null
                    }
                };

                console.log('Mapa cargado:', currentMapData);
                resolve(currentMapData);
            } catch (error) {
                console.error('Error loading map file:', error);
                reject(error);
            }
        };
        reader.readAsText(file);
    });
}

/**
 * Get all entity visibility states
 */
export function getEntityVisibility() {
    return {
        npcs: showNPCs,
        enemies: showEnemies,
        portals: showPortals,
        treasures: showTreasures
    };
}
