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
import { render, updatePlayerAnimation } from './Renderer.js';
import { updateUI, initUI, addChatMessage } from '../ui/UI.js';
import { updateMinimap, isMinimapVisible } from '../ui/Minimap.js';
import { initWorldMap } from '../ui/WorldMap.js';
import { initDialogue } from '../ui/Dialogue.js';
import { initTrading } from '../ui/Trading.js';
import { isPlayerAlive } from '../systems/Combat.js';
import { MAP_DEFINITIONS } from '../world/MapDefinitions.js';
import { getStaticMap } from '../world/StaticWorldMaps.js';
import { initMouseControls } from './MouseControls.js';

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
export async function init() {
    console.log('Initializing game...');

    // Initialize input handling
    initInput();

    // Initialize mouse controls
    initMouseControls();

    // Initialize UI
    initUI();

    // Initialize dialogue system
    initDialogue();

    // Initialize trading system
    initTrading();

    // Initialize world map
    initWorldMap();

    // Generate initial map first
    gameState.map = generateMap(gameState.currentMap);

    // Generate content
    gameState.objects = generateObjects(gameState.currentMap);
    gameState.enemies = generateEnemies(gameState.currentMap);
    gameState.npcs = generateNPCs(gameState.currentMap);

    // Debug: log NPCs generated
    console.log(`🎭 NPCs generados: ${gameState.npcs.length}`);
    gameState.npcs.forEach((npc, index) => {
        console.log(`  NPC ${index + 1}: ${npc.name} en (${npc.x}, ${npc.y}) - Tipo: ${npc.npcType}`);
    });

    // Añadir NPC de prueba cerca del jugador para testing de colisión
    console.log(`🎭 Creando NPC de prueba cerca del jugador (${gameState.player.x}, ${gameState.player.y})`);
    const { NPC } = await import('../entities/NPC.js');
    const testNPC = new NPC('merchant_general', gameState.player.x + 2, gameState.player.y);
    gameState.npcs.push(testNPC);
    console.log(`✅ NPC de prueba: ${testNPC.name} en (${testNPC.x}, ${testNPC.y}) - ¡Prueba caminar hacia él!`);

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
    // Calculate delta time for animations
    const deltaTime = timestamp - (gameLoopWrapper.lastTimestamp || timestamp);
    gameLoopWrapper.lastTimestamp = timestamp;

    // Run game logic
    gameLoop(timestamp);

    // Update player animations
    updatePlayerAnimation(deltaTime);

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
    // Validate target map exists (check both static and procedural maps)
    const targetMapDef = MAP_DEFINITIONS[targetMap];
    const staticMapDef = getStaticMap(targetMap);

    if (!targetMapDef && !staticMapDef) {
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

    // Clear dead enemies from other maps to prevent respawns in wrong maps
    gameState.deadEnemies = gameState.deadEnemies.filter(deadEnemy => deadEnemy.map === targetMap);

    // Regenerate map content
    gameState.map = generateMap(targetMap);
    gameState.objects = generateObjects(targetMap);
    gameState.enemies = generateEnemies(targetMap);
    gameState.npcs = generateNPCs(targetMap);

    // Show transition message
    const mapNames = {
        // Procedural maps
        'field': '🏞️ Campo Principal',
        'city': '🏘️ Ciudad Imperial',
        'dungeon': '🏰 Mazmorra Antigua',
        'forest': '🌲 Bosque Encantado',
        'castle': '🏰 Castillo Real',
        'market': '🏪 Mercado Central',
        'deep_dungeon': '🕳️ Profundidades',
        'ruins': '🏛️ Ruinas Antiguas',
        'throne_room': '👑 Sala del Trono',
        // Static maps
        'newbie_city': '🏘️ Ciudad de Ullathorpe',
        'newbie_field': '🏞️ Campos de Ullathorpe',
        'dark_forest': '🌲 Bosque Oscuro'
    };

    // Use static map name if available, otherwise fallback to procedural name
    const staticMap = getStaticMap(targetMap);
    const displayName = staticMap ? staticMap.name : (mapNames[targetMap] || targetMap);

    addChatMessage('system', `🌟 ¡Viajas a ${displayName}!`);
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
