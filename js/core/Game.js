/**
 * Game.js
 * Orquestador principal del juego - punto de entrada
 */

import { gameState, resetGameState } from '../state.js';
import { loginScreen } from '../ui/LoginScreen.js';
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
import { initMapEditor, toggleMapEditor, isMapEditorVisible } from '../ui/MapEditor.js';
import { initDialogue } from '../ui/Dialogue.js';
import { initTrading } from '../ui/Trading.js';
import { initChat } from '../ui/Chat.js';
import { initSpellsUI, updateSpellsList, handleTargetSelection } from '../ui/SpellsUI.js';
import { initMagicSystem, updateSpellEffects, recoverMana, toggleMeditation } from '../systems/MagicSystem.js';
import { isPlayerAlive } from '../systems/Combat.js';
import { MAP_DEFINITIONS } from '../world/MapDefinitions.js';
import { getStaticMap } from '../world/StaticWorldMaps.js';
import { initMouseControls } from './MouseControls.js';
import { initDebugPanel } from '../ui/DebugPanel.js';
import { preloadAllMaps, getPreloadedMap } from '../world/PreloadedMaps.js';
import { botManager } from '../systems/BotManager.js';

// Helper functions (these are defined in ObjectGenerator.js but we need them here)
function isWalkableOnMap(map, x, y) {
    // Boundary check
    if (x < 0 || x >= CONFIG.MAP_WIDTH || y < 0 || y >= CONFIG.MAP_HEIGHT) return false;
    
    // Map validity check
    if (!map || !Array.isArray(map)) {
        console.error("isWalkableOnMap: map is not an array", map);
        return false;
    }
    
    // Row validity check
    if (!map[y] || !Array.isArray(map[y])) {
        console.error(`isWalkableOnMap: map[${y}] is not an array`, map[y]);
        return false;
    }
    
    // Manejo de diferentes tipos de tiles que son caminables
    const tile = map[y][x];
    
    // Tiles walkable: GRASS (0), FLOOR (6), PATH (8)
    return tile === 0 || tile === 6 || tile === 8;
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
    
    // Configurar eventos para cuando se complete el login (primero, para evitar problemas de timing)
    setupLoginEvents();
    
    // Mostrar la pantalla de login/inicio antes de cargar el juego
    await loginScreen.init();
    
    // Si se detectó parámetro de URL para saltar la pantalla de login
    if (loginScreen.skipLoginScreen) {
        console.log('Starting game directly in local mode due to URL parameter');
        // Simular el evento login-complete para iniciar el juego directamente
        window.dispatchEvent(new Event('login-complete'));
    }
}

/**
 * Configurar eventos de la pantalla de login
 */
function setupLoginEvents() {
    // Evento que se dispara cuando el login está completo (ya sea modo local o online)
    window.addEventListener('login-complete', async (event) => {
        console.log('Login completado, iniciando juego...');
        
        // Comprobar si hay datos de usuario en el evento (modo online)
        if (event.detail && event.detail.online) {
            console.log('Iniciando en modo online con usuario:', event.detail.user.username);
            gameState.isOnline = true;
            gameState.onlineUser = event.detail.user;
        } else {
            console.log('Iniciando en modo local');
            gameState.isOnline = false;
        }
        
        // Iniciar el juego después del login
        await initGame();
    });
}

/**
 * Inicializa el juego después de la pantalla de login
 */
async function initGame() {
    // Precargar todos los mapas JSON antes de inicializar el juego
    try {
        console.log('🗺️ Iniciando precarga de mapas JSON...');
        await preloadAllMaps();
        console.log('✅ Mapas JSON precargados con éxito');
    } catch (error) {
        console.error('❌ Error al precargar mapas JSON:', error);
    }

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

    // Initialize map editor
    initMapEditor();

    // Initialize chat system FIRST (needs to be before other systems that might interfere)
    console.log("🎯 Inicializando chat system antes que otros sistemas...");
    initChat();
    
    // Initialize magic system
    initMagicSystem();
    
    // Initialize spells UI
    initSpellsUI();
    
    // Initialize debug panel
    initDebugPanel();

    // Initialize bot system
    botManager.init(gameState);

    // Generate initial map first
    const mapResult = generateMap(gameState.currentMap);
    
    // Verificación de seguridad para el resultado de generateMap
    console.log(`🗺️ Resultado de generateMap para ${gameState.currentMap}: ` + 
               (mapResult ? "✓ (existe)" : "✗ (null/undefined)") + " - " +
               (Array.isArray(mapResult) ? `Array 2D ${mapResult.length}x${mapResult[0]?.length}` : 
                (mapResult?.map ? `Objeto con .map ${mapResult.map.length}x${mapResult.map[0]?.length}` : "Formato inválido")));
    
    // Manejar tanto mapas simples como objetos con múltiples capas
    if (mapResult && typeof mapResult === 'object' && mapResult.map && Array.isArray(mapResult.map)) {
        // Es un objeto con múltiples capas - USAR LAS CAPAS DEL GENERADOR
        console.log(`🗺️ Asignando mapa con formato multicapa: ${mapResult.map.length}x${mapResult.map[0]?.length}`);

        // Asignar la capa base del mapa
        gameState.map = mapResult.map;

        // IMPORTANTE: Usar las capas del generador, no crear vacías
        gameState.roofLayer = mapResult.roofLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.doorLayer = mapResult.doorLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.windowLayer = mapResult.windowLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));

        // Verificación adicional de asignación
        console.log(`✅ Mapa cargado con estructura multicapa. Capas: base(${gameState.map.length}x${gameState.map[0]?.length}), techos(${gameState.roofLayer.length}x${gameState.roofLayer[0]?.length}), puertas(${gameState.doorLayer.length}x${gameState.doorLayer[0]?.length}), ventanas(${gameState.windowLayer.length}x${gameState.windowLayer[0]?.length})`);
    } else if (mapResult && Array.isArray(mapResult)) {
        // Es un mapa simple (array 2D directo)
        console.log(`🗺️ Asignando mapa con formato simple: ${mapResult.length}x${mapResult[0]?.length}`);
        gameState.map = mapResult;

        // Crear capas vacías para mapas simples
        gameState.roofLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.doorLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.windowLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));

        console.log(`✅ Mapa cargado con estructura simple. Generadas capas vacías adicionales.`);
    } else {
        // Resultado inválido - crear mapa por defecto
        console.error(`❌ Resultado de generateMap inválido para ${gameState.currentMap}. Creando mapa fallback.`);
        console.error(`Tipo de resultado: ${typeof mapResult}, Es array: ${Array.isArray(mapResult)}, Tiene propiedad .map: ${mapResult?.map ? "Sí" : "No"}`);
        
        gameState.map = [];
        
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            const row = [];
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                if (x === 0 || x === CONFIG.MAP_WIDTH - 1 || y === 0 || y === CONFIG.MAP_HEIGHT - 1) {
                    row.push(4); // WALL
                } else {
                    row.push(0); // GRASS
                }
            }
            gameState.map.push(row);
        }
        
        // Crear capas vacías
        gameState.roofLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.doorLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.windowLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        
        console.log(`⚠️ Creado mapa fallback ${gameState.map.length}x${gameState.map[0]?.length} con bordes sólidos`);
    }

    // Generate content
    gameState.objects = generateObjects(gameState.currentMap);
    gameState.enemies = generateEnemies(gameState.currentMap);
    gameState.npcs = generateNPCs(gameState.currentMap);

    // Debug: log NPCs generated
    console.log(`🎭 NPCs generados: ${gameState.npcs.length}`);
    gameState.npcs.forEach((npc, index) => {
        console.log(`  NPC ${index + 1}: ${npc.name} en (${npc.x}, ${npc.y}) - Tipo: ${npc.npcType}`);
    });

    // Debug: log objects (portals) generated
    console.log(`🏠 Objetos generados: ${gameState.objects.length}`);
    gameState.objects.forEach((obj, index) => {
        console.log(`  Objeto ${index + 1}: ${obj.type} en (${obj.x}, ${obj.y})`);
    });

    // Añadir NPC de prueba cerca del jugador para testing de colisión
    console.log(`🎭 Creando NPC de prueba cerca del jugador (${gameState.player.x}, ${gameState.player.y})`);
    const { NPC } = await import('../entities/NPC.js');
    const testNPC = new NPC('merchant_general', gameState.player.x + 2, gameState.player.y + 4);
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

    // Continue the loop always (even for ghosts)
    // isPlayerAlive() retorna true tanto para jugadores vivos como fantasmas
    if (isPlayerAlive()) {
        requestAnimationFrame(gameLoopWrapper);
    } else {
        // Caso especial: si el jugador acaba de morir pero aún no es fantasma,
        // continuar el loop para que se active el modo fantasma
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

    // Extract the base map array for validation
    const targetMapArray = (targetMapData && typeof targetMapData === 'object' && targetMapData.map) ? 
        targetMapData.map : targetMapData;

    // Ensure target position is walkable
    if (!isWalkableOnMap(targetMapArray, targetX, targetY)) {
        console.warn(`Posición destino (${targetX}, ${targetY}) no es walkable, buscando alternativa...`);
        const safePos = findNearestWalkableTile(targetMapArray, targetX, targetY);
        if (safePos) {
            targetX = safePos.x;
            targetY = safePos.y;
            console.log(`Ajustado posición destino a (${targetX}, ${targetY})`);
        } else {
            addChatMessage('system', '❌ ¡Error! No se puede acceder al mapa destino.');
            return;
        }
    }
    
    // Cargar previamente el mapa si es uno de las Islas Canarias
    if (targetMap.startsWith('canarias_')) {
        const preloadedMap = getPreloadedMap(targetMap);
        if (preloadedMap) {
            console.log(`📦 Mapa precargado encontrado para ${targetMap}`);
            window.__PRELOADED_MAPS__[targetMap] = preloadedMap;
        } else {
            console.warn(`⚠️ No se encontró mapa precargado para ${targetMap}`);
        }
    }

    // Save current map for transition message
    const oldMap = gameState.currentMap;

    // Cambiamos el mapa actual
    gameState.currentMap = targetMap;
    
    // Notificar al botManager sobre el cambio de mapa
    botManager.onPlayerMapChange(targetMap, gameState);

    // Clear dead enemies from other maps to prevent respawns in wrong maps
    gameState.deadEnemies = gameState.deadEnemies.filter(deadEnemy => deadEnemy.map === targetMap);

    // Regeneramos el contenido del mapa primero para asegurarnos de que gameState.map esté disponible
    const mapResult = generateMap(targetMap);

    // Verificación de seguridad para el nuevo mapa
    console.log(`🗺️ Regenerando mapa ${targetMap}: ` + 
               (mapResult ? "✓" : "✗") + " " +
               (Array.isArray(mapResult) ? "Array" : (mapResult?.map ? "Object with map" : "Invalid")));

    // Manejar tanto mapas simples como objetos con múltiples capas
    if (mapResult && typeof mapResult === 'object' && mapResult.map && Array.isArray(mapResult.map)) {
        // Es un objeto con múltiples capas - USAR LAS CAPAS DEL GENERADOR
        console.log(`🗺️ Asignando mapa con formato multicapa: ${mapResult.map.length}x${mapResult.map[0]?.length}`);

        // Asignar la capa base del mapa
        gameState.map = mapResult.map;

        // IMPORTANTE: Usar las capas del generador, no crear vacías
        gameState.roofLayer = mapResult.roofLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.doorLayer = mapResult.doorLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.windowLayer = mapResult.windowLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));

        // Verificación adicional de asignación
        console.log(`✅ Mapa cargado con estructura multicapa. Capas: base(${gameState.map.length}x${gameState.map[0]?.length}), techos(${gameState.roofLayer.length}x${gameState.roofLayer[0]?.length}), puertas(${gameState.doorLayer.length}x${gameState.doorLayer[0]?.length}), ventanas(${gameState.windowLayer.length}x${gameState.windowLayer[0]?.length})`);
    } else if (mapResult && Array.isArray(mapResult)) {
        // Es un mapa simple
        console.log(`🗺️ Asignando mapa con formato simple: ${mapResult.length}x${mapResult[0]?.length}`);
        gameState.map = mapResult;

        // Crear capas vacías para mapas simples
        gameState.roofLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.doorLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.windowLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));

        console.log(`✅ Mapa cargado con estructura simple. Generadas capas vacías adicionales.`);
    } else {
        console.error(`❌ Error al generar mapa ${targetMap} - resultado inválido o formato no reconocido`);
        console.error(`Tipo de resultado: ${typeof mapResult}, Es array: ${Array.isArray(mapResult)}, Tiene propiedad .map: ${mapResult?.map ? "Sí" : "No"}`);
        addChatMessage('system', '❌ ¡Error! No se pudo generar el mapa de destino.');
        return;
    }

    // AHORA que tenemos el mapa, generamos los objetos (que necesitan gameState.map)
    console.log(`🎮 Generando contenido para mapa ${targetMap}`);
    gameState.objects = generateObjects(targetMap);
    gameState.enemies = generateEnemies(targetMap);
    gameState.npcs = generateNPCs(targetMap);

    // Teleport player to safe target position DESPUÉS de tener el mapa
    console.log(`🧙‍♂️ Teletransportando jugador a (${targetX}, ${targetY}) - isWalkable: ${isWalkable(gameState.map, targetX, targetY)}`);
    gameState.player.x = targetX;
    gameState.player.y = targetY;

    // Agregar objetos caídos del mapa actual como objetos interactivos
    addDroppedItemsToMap(targetMap);

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
        'dark_forest': '🌲 Bosque Oscuro',
        // Mapas Canarias
        'canarias_capital': '🏙️ Las Palmas de GC',
        'canarias_playa_canteras': '🏖️ Playa de Las Canteras',
        'canarias_dunas': '🏜️ Dunas de Maspalomas',
        'canarias_teide_dungeon': '🌋 Volcán del Teide'
    };

    // Use static map name if available, otherwise fallback to procedural name
    const staticMap = getStaticMap(targetMap);
    const displayName = staticMap ? staticMap.name : (mapNames[targetMap] || targetMap);

    addChatMessage('system', `🌟 ¡Viajas a ${displayName}!`);
    updateUI();

    // Forzar actualización del minimapa después del cambio de mapa
    updateMinimap();
}

/**
 * Agregar objetos caídos del mapa actual como objetos interactivos
 * @param {string} mapName - Nombre del mapa actual
 */
function addDroppedItemsToMap(mapName) {
    // Filtrar objetos caídos que pertenecen a este mapa
    const mapDroppedItems = gameState.droppedItems.filter(item => item.map === mapName);

    // Convertir objetos caídos a objetos interactivos
    mapDroppedItems.forEach(droppedItem => {
        const interactiveObject = {
            type: 'dropped_item',
            x: droppedItem.x,
            y: droppedItem.y,
            droppedItem: droppedItem // Referencia al objeto caído original
        };
        gameState.objects.push(interactiveObject);
    });
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
