/**
 * Game.js
 * Orquestador principal del juego - punto de entrada
 */

import { gameState, resetGameState } from '../state.js';
import { CONFIG } from '../config.js';
import { initInput } from './Input.js';
import { generateMap, isWalkable } from '../world/MapGenerator.js';
import { generateObjects, generateEnemies, generateNPCs } from '../world/ObjectGenerator.js';
import { addItemToInventory } from '../systems/Inventory.js';
import { gameLoop } from './GameLoop.js';
import { render } from './Renderer.js';
import { updateUI, initUI, addChatMessage } from '../ui/UI.js';
import { updateMinimap, isMinimapVisible } from '../ui/Minimap.js';
import { initWorldMap } from '../ui/WorldMap.js';
import { initDialogue } from '../ui/Dialogue.js';
import { isPlayerAlive } from '../systems/Combat.js';
import { MAP_DEFINITIONS } from '../world/MapDefinitions.js';

// Helper functions (these are defined in ObjectGenerator.js but we need them here)
function isWalkableOnMap(map, x, y) {
    if (x < 0 || x >= CONFIG.MAP_WIDTH || y < 0 || y >= CONFIG.MAP_HEIGHT) return false;
    const tile = map[y][x];
    return tile === 0 || tile === 6 || tile === 8; // grass, floor, path
}

function findNearestWalkableTile(map, startX, startY) {
    // Search in expanding circles around the target position
    for (let radius = 0; radius < 10; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                // Only check perimeter of current radius
                if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                    const x = startX + dx;
                    const y = startY + dy;
                    if (isWalkableOnMap(map, x, y)) {
                        return { x, y };
                    }
                }
            }
        }
    }
    return null; // No walkable tile found nearby
}

/**
 * Initialize the game
 */
export function init() {
    console.log('Initializing game...');

    // Initialize input handling
    initInput();

    // Initialize UI
    initUI();

    // Initialize dialogue system
    initDialogue();

    // Initialize world map
    initWorldMap();

    // Generate initial map first
    gameState.map = generateMap(gameState.currentMap);

    // Generate content
    gameState.objects = generateObjects(gameState.currentMap);
    gameState.enemies = generateEnemies(gameState.currentMap);
    gameState.npcs = generateNPCs(gameState.currentMap);

    // Add some test items for demonstration (AO style)
    addItemToInventory('BOW', 1);      // Arco para combate a distancia
    addItemToInventory('ARROW', 50);   // Flechas para el arco
    addItemToInventory('SWORD', 1);    // Espada para combate cuerpo a cuerpo
    addItemToInventory('SHIELD', 1);   // Escudo para defensa
    addItemToInventory('POTION_RED', 20);   // Pociones HP
    addItemToInventory('POTION_BLUE', 15);  // Pociones Mana
    addItemToInventory('POTION_GREEN', 10); // Pociones Antídoto

    updateUI();

    // Start game loop
    requestAnimationFrame(gameLoopWrapper);
}

/**
 * Game loop wrapper that handles rendering and minimap updates
 * @param {number} timestamp - Current timestamp
 */
function gameLoopWrapper(timestamp) {
    // Run game logic
    gameLoop(timestamp);

    // Render the game
    render();

    // Update minimap in real-time if visible
    if (isMinimapVisible()) {
        updateMinimap();
    }

    // Continue the loop if player is alive
    if (isPlayerAlive()) {
        requestAnimationFrame(gameLoopWrapper);
    }
}

/**
 * Change map function with safety checks
 * @param {string} targetMap - Target map key
 * @param {number} targetX - Target X coordinate
 * @param {number} targetY - Target Y coordinate
 */
export function changeMap(targetMap, targetX, targetY) {
    // Validate target position is walkable
    const targetMapDef = MAP_DEFINITIONS[targetMap];
    if (!targetMapDef) {
        addChatMessage('system', '❌ ¡Error! Mapa destino no encontrado.');
        return;
    }

    // Temporarily switch to target map to generate it and check position
    const originalMap = gameState.currentMap;
    gameState.currentMap = targetMap;
    const targetMapData = generateMap(targetMap);
    gameState.currentMap = originalMap;

    // Ensure target position is walkable
    if (!isWalkableOnMap(targetMapData, targetX, targetY)) {
        console.warn(`Posición destino (${targetX}, ${targetY}) no es walkable, buscando alternativa...`);
        const safePos = findNearestWalkableTile(targetMapData, targetX, targetY);
        if (safePos) {
            targetX = safePos.x;
            targetY = safePos.y;
            console.log(`Ajustado posición destino a (${targetX}, ${targetY})`);
        } else {
            addChatMessage('system', '❌ ¡Error! No se puede acceder al mapa destino.');
            return;
        }
    }

    // Save current map for transition message
    const oldMap = gameState.currentMap;

    // Change map
    gameState.currentMap = targetMap;

    // Teleport player to safe target position
    gameState.player.x = targetX;
    gameState.player.y = targetY;

    // Regenerate map content
    gameState.map = generateMap(targetMap);
    gameState.objects = generateObjects(targetMap);
    gameState.enemies = generateEnemies(targetMap);
    gameState.npcs = generateNPCs(targetMap);

    // Show transition message
    const mapNames = {
        'field': '🏞️ Campo Principal',
        'city': '🏘️ Ciudad Imperial',
        'dungeon': '🏰 Mazmorra Antigua',
        'forest': '🌲 Bosque Encantado',
        'castle': '🏰 Castillo Real',
        'market': '🏪 Mercado Central',
        'deep_dungeon': '🕳️ Profundidades',
        'ruins': '🏛️ Ruinas Antiguas',
        'throne_room': '👑 Sala del Trono'
    };

    addChatMessage('system', `🌟 ¡Viajas a ${mapNames[targetMap] || targetMap}!`);
    updateUI();
}

/**
 * Toggle quests display
 */
export function toggleQuests() {
    const questList = document.getElementById('questList');
    const toggleButton = document.getElementById('toggleQuests');

    if (questList.style.display === 'none') {
        questList.style.display = 'block';
        toggleButton.textContent = 'Ocultar';
    } else {
        questList.style.display = 'none';
        toggleButton.textContent = 'Mostrar';
    }
}
