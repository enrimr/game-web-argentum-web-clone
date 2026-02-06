/**
 * Game.js
 * Orquestador principal del juego - punto de entrada
 */

import { gameState, resetGameState } from '../state.js';
import { loginScreen } from '../ui/LoginScreen.js';
import { CONFIG } from '../config.js';
import { OnlinePlayer } from '../entities/OnlinePlayer.js';
import socketClient from '../api/SocketClient.js';
import multiplayerManager from './MultiplayerManager.js';
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
import { updatePlayerAppearance } from '../graphics/renderers/RendererCore.js';
import { audioManager } from '../systems/AudioManager.js';

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
            
            // Inicializar mapa de jugadores online
            gameState.onlinePlayers = new Map();
            console.log('🗺️ gameState.onlinePlayers inicializado (vacío):', gameState.onlinePlayers.size);
            
            // Inicializar mapa de NPCs sincronizados
            gameState.syncedNPCs = new Map();
            console.log('🗺️ gameState.syncedNPCs inicializado (vacío):', gameState.syncedNPCs.size);
            
            // Si hay un personaje seleccionado, asignar su nombre y apariencia al jugador
            if (event.detail.character) {
                gameState.player.name = event.detail.character.name;
                gameState.player.characterClass = event.detail.character.class;
                gameState.player.race = event.detail.character.race;
                gameState.player.appearance = event.detail.character.appearance;
                console.log('Personaje seleccionado:', event.detail.character.name);
                console.log('Apariencia del personaje:', event.detail.character.appearance);
            }
            
            // NUEVO: Procesar datos de multiplayer si ya están disponibles
            if (window.__MULTIPLAYER_INIT_DATA__) {
                console.log('📦 Datos de multiplayer ya disponibles, procesándolos...');
                await processMultiplayerInitData(window.__MULTIPLAYER_INIT_DATA__);
                console.log('📊 gameState.onlinePlayers después de procesar:', gameState.onlinePlayers.size);
                delete window.__MULTIPLAYER_INIT_DATA__; // Limpiar después de usar
            }
        } else {
            console.log('Iniciando en modo local');
            gameState.isOnline = false;
            gameState.onlinePlayers = null;
        }
        
        // Iniciar el juego después del login
        console.log('🚀 Llamando a initGame()... gameState.onlinePlayers.size:', gameState.onlinePlayers?.size || 'null');
        await initGame();
        console.log('✅ initGame() completado. gameState.onlinePlayers.size:', gameState.onlinePlayers?.size || 'null');
    });

    // Evento cuando el multiplayer está listo (después de join_game)
    window.addEventListener('multiplayer-ready', (event) => {
        console.log('🌐 EVENTO multiplayer-ready recibido!', event.detail);
        console.log('📊 Datos recibidos en multiplayer-ready:', {
            onlinePlayers: event.detail.onlinePlayers?.length || 0,
            hasCharacterData: !!event.detail.characterData,
            hasStartPosition: !!event.detail.startPosition
        });
        console.log('📊 gameState.onlinePlayers ANTES de procesar:', gameState.onlinePlayers?.size || 'null/undefined');
        
        // Verificar que gameState.onlinePlayers esté inicializado
        if (!gameState.onlinePlayers) {
            console.warn('⚠️ gameState.onlinePlayers no está inicializado, creando ahora...');
            gameState.onlinePlayers = new Map();
        }
        
        // Obtener mi socketId para filtrar
        const mySocketId = socketClient.getSocketId();
        console.log('🔑 Mi socketId para filtrado:', mySocketId);
        
        // IMPORTANTE: Cargar estado completo del servidor (HP, Mana, Inventario, etc.)
        if (event.detail.characterData) {
            multiplayerManager.loadFullState(event.detail.characterData, gameState);
        }
        
        // IMPORTANTE: Establecer posición inicial desde el servidor
        if (event.detail.startPosition) {
            gameState.player.x = event.detail.startPosition.x;
            gameState.player.y = event.detail.startPosition.y;
            gameState.currentMap = event.detail.startPosition.map;
            console.log(`🎯 Posición inicial del jugador establecida: (${gameState.player.x}, ${gameState.player.y}) en mapa ${gameState.currentMap}`);
            
            // Regenerar el mapa y contenido para el mapa inicial
            const mapResult = generateMap(gameState.currentMap);
            
            if (mapResult && typeof mapResult === 'object' && mapResult.map && Array.isArray(mapResult.map)) {
                gameState.map = mapResult.map;
                gameState.roofLayer = mapResult.roofLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
                gameState.doorLayer = mapResult.doorLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
                gameState.windowLayer = mapResult.windowLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
                gameState.propLayer = mapResult.propLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            } else if (mapResult && Array.isArray(mapResult)) {
                gameState.map = mapResult;
                gameState.roofLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
                gameState.doorLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
                gameState.windowLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
                gameState.propLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            }
            
            // Regenerar contenido del mapa
            gameState.objects = generateObjects(gameState.currentMap);
            gameState.enemies = generateEnemies(gameState.currentMap);
            gameState.npcs = generateNPCs(gameState.currentMap);
        }
        
        // Cargar jugadores online iniciales (EXCEPTO el propio)
        console.log('🔍 Procesando lista de jugadores online desde multiplayer-ready...');
        if (event.detail.onlinePlayers && Array.isArray(event.detail.onlinePlayers)) {
            console.log(`📋 Lista recibida con ${event.detail.onlinePlayers.length} jugadores`);
            
            event.detail.onlinePlayers.forEach((playerData, index) => {
                console.log(`🔄 Procesando jugador ${index + 1}/${event.detail.onlinePlayers.length}:`, {
                    username: playerData.username,
                    socketId: playerData.socketId,
                    position: playerData.position,
                    mySocketId: mySocketId,
                    isMyself: playerData.socketId === mySocketId
                });
                
                // FILTRAR: No añadir el propio jugador
                if (playerData.socketId === mySocketId) {
                    console.log('🚫 Ignorando jugador propio en lista inicial:', playerData.username);
                    return;
                }
                
                // Verificar que no esté ya en la lista (prevenir duplicados)
                if (gameState.onlinePlayers.has(playerData.socketId)) {
                    console.warn('⚠️ Jugador ya existe en la lista:', playerData.username);
                    return;
                }
                
                console.log('✨ Creando OnlinePlayer para:', playerData.username);
                const onlinePlayer = new OnlinePlayer(playerData);
                gameState.onlinePlayers.set(playerData.socketId, onlinePlayer);
                console.log(`👤 Jugador online cargado: ${playerData.username} en (${playerData.position.x}, ${playerData.position.y})`);
            });
            console.log(`✅ Total jugadores online en gameState.onlinePlayers DESPUÉS: ${gameState.onlinePlayers.size}`);
            console.log(`📊 Jugadores en el Map:`, Array.from(gameState.onlinePlayers.keys()));
        } else {
            console.warn('⚠️ onlinePlayers no es un array o está indefinido:', event.detail.onlinePlayers);
        }
        
        // Cargar NPCs sincronizados iniciales
        console.log('🔍 Procesando lista de NPCs sincronizados desde multiplayer-ready...');
        
        if (event.detail.npcs && Array.isArray(event.detail.npcs)) {
            console.log(`📋 Lista recibida con ${event.detail.npcs.length} NPCs`);
            
            // Verificar que gameState.syncedNPCs esté inicializado
            if (!gameState.syncedNPCs) {
                console.warn('⚠️ gameState.syncedNPCs no está inicializado, creando ahora...');
                gameState.syncedNPCs = new Map();
            }
            
            event.detail.npcs.forEach((npcData, index) => {
                
                const syncedNPC = {
                    instanceId: npcData.instanceId,
                    npcTypeId: npcData.npcTypeId,
                    name: npcData.name,
                    x: npcData.position.x,
                    y: npcData.position.y,
                    map: npcData.position.map,
                    appearance: npcData.appearance,
                    hp: npcData.stats.hp,
                    maxHp: npcData.stats.maxHp,
                    level: npcData.stats.level,
                    behavior: npcData.behavior,
                    isAlive: true
                };
                
                gameState.syncedNPCs.set(npcData.instanceId, syncedNPC);
                console.log(`✨ NPC añadido: ${npcData.name} en (${npcData.position.x}, ${npcData.position.y})`);
            });
            
            console.log(`✅ Total NPCs sincronizados en gameState.syncedNPCs: ${gameState.syncedNPCs.size}`);
            
            if (gameState.syncedNPCs.size > 0) {
                addChatMessage('system', `🎭 Hay ${gameState.syncedNPCs.size} criatura(s) en este mapa`);
            }
        } else {
            console.warn('⚠️ npcs no es un array o está indefinido:', event.detail.npcs);
        }
        
        // Configurar listeners de eventos de jugadores (solo si no se configuraron ya)
        if (!window.__MULTIPLAYER_LISTENERS_SETUP__) {
            setupMultiplayerListeners();
            window.__MULTIPLAYER_LISTENERS_SETUP__ = true;
        }
        
        // Actualizar UI con el estado cargado
        updateUI();
        
        console.log('✅ Evento multiplayer-ready procesado completamente');
    });
}

/**
 * Procesar datos de multiplayer que fueron precargados antes de iniciar el juego
 */
async function processMultiplayerInitData(data) {
    console.log('🔄 Procesando datos precargados de multiplayer...', data);
    
    // Verificar que gameState.onlinePlayers esté inicializado
    if (!gameState.onlinePlayers) {
        console.warn('⚠️ gameState.onlinePlayers no está inicializado, creando ahora...');
        gameState.onlinePlayers = new Map();
    }
    
    // Obtener mi socketId para filtrar
    const mySocketId = socketClient.getSocketId();
    console.log('🔑 Mi socketId para filtrado:', mySocketId);
    
    // IMPORTANTE: Cargar estado completo del servidor (HP, Mana, Inventario, etc.)
    if (data.characterData) {
        multiplayerManager.loadFullState(data.characterData, gameState);
    }
    
    // IMPORTANTE: Establecer posición inicial desde el servidor
    if (data.startPosition) {
        gameState.player.x = data.startPosition.x;
        gameState.player.y = data.startPosition.y;
        gameState.currentMap = data.startPosition.map;
        console.log(`🎯 Posición inicial del jugador establecida: (${gameState.player.x}, ${gameState.player.y}) en mapa ${gameState.currentMap}`);
    }
    
    // Cargar jugadores online iniciales (EXCEPTO el propio)
    console.log('🔍 Procesando lista de jugadores online precargados...');
    if (data.onlinePlayers && Array.isArray(data.onlinePlayers)) {
        console.log(`📋 Lista precargada con ${data.onlinePlayers.length} jugadores`);
        
        data.onlinePlayers.forEach((playerData, index) => {
            console.log(`🔄 Procesando jugador precargado ${index + 1}/${data.onlinePlayers.length}:`, {
                username: playerData.username,
                socketId: playerData.socketId,
                position: playerData.position,
                mySocketId: mySocketId,
                isMyself: playerData.socketId === mySocketId
            });
            
            // FILTRAR: No añadir el propio jugador
            if (playerData.socketId === mySocketId) {
                console.log('🚫 Ignorando jugador propio en lista precargada:', playerData.username);
                return;
            }
            
            // Verificar que no esté ya en la lista (prevenir duplicados)
            if (gameState.onlinePlayers.has(playerData.socketId)) {
                console.warn('⚠️ Jugador ya existe en la lista:', playerData.username);
                return;
            }
            
            console.log('✨ Creando OnlinePlayer para:', playerData.username);
            const onlinePlayer = new OnlinePlayer(playerData);
            gameState.onlinePlayers.set(playerData.socketId, onlinePlayer);
            console.log(`👤 Jugador online cargado: ${playerData.username} en (${playerData.position.x}, ${playerData.position.y})`);
        });
        console.log(`✅ Total jugadores online precargados en gameState.onlinePlayers: ${gameState.onlinePlayers.size}`);
        console.log(`📊 Jugadores en el Map:`, Array.from(gameState.onlinePlayers.keys()));
    } else {
        console.warn('⚠️ onlinePlayers no es un array o está indefinido en datos precargados');
    }
    
    // Cargar NPCs sincronizados precargados
    console.log('🔍 Procesando lista de NPCs sincronizados precargados...');
    if (data.npcs && Array.isArray(data.npcs)) {
        console.log(`📋 Lista precargada con ${data.npcs.length} NPCs`);
        
        // Verificar que gameState.syncedNPCs esté inicializado
        if (!gameState.syncedNPCs) {
            console.warn('⚠️ gameState.syncedNPCs no está inicializado, creando ahora...');
            gameState.syncedNPCs = new Map();
        }
        
        data.npcs.forEach((npcData, index) => {
            console.log(`🔄 Procesando NPC precargado ${index + 1}/${data.npcs.length}:`, {
                name: npcData.name,
                instanceId: npcData.instanceId,
                position: npcData.position
            });
            
            const syncedNPC = {
                instanceId: npcData.instanceId,
                npcTypeId: npcData.npcTypeId,
                name: npcData.name,
                x: npcData.position.x,
                y: npcData.position.y,
                map: npcData.position.map,
                appearance: npcData.appearance,
                hp: npcData.stats.hp,
                maxHp: npcData.stats.maxHp,
                level: npcData.stats.level,
                behavior: npcData.behavior,
                isAlive: true
            };
            
            gameState.syncedNPCs.set(npcData.instanceId, syncedNPC);
            console.log(`✨ NPC precargado añadido: ${npcData.name} en (${npcData.position.x}, ${npcData.position.y})`);
        });
        
        console.log(`✅ Total NPCs sincronizados precargados en gameState.syncedNPCs: ${gameState.syncedNPCs.size}`);
    } else {
        console.warn('⚠️ npcs no es un array o está indefinido en datos precargados');
    }
    
    // Configurar listeners de eventos de jugadores (solo si no se configuraron ya)
    if (!window.__MULTIPLAYER_LISTENERS_SETUP__) {
        setupMultiplayerListeners();
        window.__MULTIPLAYER_LISTENERS_SETUP__ = true;
    }
    
    console.log('✅ Datos de multiplayer precargados procesados exitosamente');
}

/**
 * Configurar listeners de eventos multijugador
 */
function setupMultiplayerListeners() {
    // Cuando un jugador se une
    socketClient.on('player_joined', (data) => {
        console.log('🔵 EVENTO player_joined recibido:', data);
        console.log('🔵 gameState.onlinePlayers antes:', gameState.onlinePlayers?.size);
        
        // Verificación adicional: nunca debería llegar aquí porque SocketClient ya filtra,
        // pero por seguridad verificamos de nuevo
        if (socketClient.isMySocketId(data.socketId)) {
            console.log('🚫 Jugador propio detectado en player_joined (no debería pasar), ignorando');
            return;
        }
        
        // Verificar que no esté ya en la lista (prevenir duplicados)
        if (gameState.onlinePlayers.has(data.socketId)) {
            console.warn('⚠️ Jugador ya existe en la lista:', data.username);
            return;
        }
        
        const onlinePlayer = new OnlinePlayer(data);
        gameState.onlinePlayers.set(data.socketId, onlinePlayer);
        
        console.log('🔵 gameState.onlinePlayers después:', gameState.onlinePlayers?.size);
        console.log('🔵 Jugador añadido:', onlinePlayer);
        
        addChatMessage('system', `👋 ${data.username} se ha unido al juego`);
        console.log(`👤 Nuevo jugador: ${data.username} en (${data.position.x}, ${data.position.y})`);
    });

    // Cuando un jugador se mueve
    socketClient.on('player_moved', (data) => {
        const player = gameState.onlinePlayers.get(data.socketId);
        if (player) {
            player.updatePosition(data.position.x, data.position.y);
            console.log(`🔄 Jugador ${player.username} movido a (${data.position.x}, ${data.position.y})`);
        } else {
            console.warn('⚠️ player_moved recibido para jugador desconocido:', data.socketId);
        }
    });

    // Cuando un jugador sale
    socketClient.on('player_left', (data) => {
        const player = gameState.onlinePlayers.get(data.socketId);
        if (player) {
            addChatMessage('system', `👋 ${player.username} ha salido del juego`);
            gameState.onlinePlayers.delete(data.socketId);
            console.log(`👋 Jugador ${player.username} eliminado. Quedan: ${gameState.onlinePlayers.size}`);
        }
    });

    // Cuando el jugador local cambia de mapa (recibe lista de jugadores en el nuevo mapa)
    socketClient.on('map_changed', (data) => {
        console.log('🗺️ EVENTO map_changed recibido:', data);
        console.log(`🗺️ Nuevo mapa: ${data.newMap}, jugadores: ${data.playersInMap?.length || 0}, NPCs: ${data.npcs?.length || 0}`);
        
        // IMPORTANTE: Actualizar el mapa actual PRIMERO
        gameState.currentMap = data.newMap;
        console.log(`✅ gameState.currentMap actualizado a: ${gameState.currentMap}`);
        
        // IMPORTANTE: Limpiar jugadores del mapa anterior
        gameState.onlinePlayers.clear();
        console.log('🧹 Jugadores del mapa anterior limpiados');
        
        // IMPORTANTE: Limpiar NPCs del mapa anterior
        if (gameState.syncedNPCs) {
            gameState.syncedNPCs.clear();
            console.log('🧹 NPCs del mapa anterior limpiados');
        }
        
        // Regenerar el mapa visual y sus capas
        const mapResult = generateMap(data.newMap);
        if (mapResult && typeof mapResult === 'object' && mapResult.map && Array.isArray(mapResult.map)) {
            gameState.map = mapResult.map;
            gameState.roofLayer = mapResult.roofLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            gameState.doorLayer = mapResult.doorLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            gameState.windowLayer = mapResult.windowLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            gameState.propLayer = mapResult.propLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            console.log('✅ Capas del mapa regeneradas');
        } else if (mapResult && Array.isArray(mapResult)) {
            gameState.map = mapResult;
            gameState.roofLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            gameState.doorLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            gameState.windowLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            gameState.propLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
            console.log('✅ Mapa simple regenerado');
        }
        
        // Regenerar contenido del mapa (objetos locales, enemigos locales)
        gameState.objects = generateObjects(data.newMap);
        gameState.enemies = generateEnemies(data.newMap);
        gameState.npcs = generateNPCs(data.newMap);
        console.log('✅ Contenido del mapa regenerado');
        
        // Obtener mi socketId para filtrar
        const mySocketId = socketClient.getSocketId();
        
        // Cargar jugadores del nuevo mapa (EXCEPTO el propio)
        if (data.playersInMap && Array.isArray(data.playersInMap)) {
            data.playersInMap.forEach(playerData => {
                // FILTRAR: No añadir el propio jugador
                if (playerData.socketId === mySocketId) {
                    console.log('🚫 Ignorando jugador propio en lista de nuevo mapa:', playerData.username);
                    return;
                }
                
                const onlinePlayer = new OnlinePlayer(playerData);
                gameState.onlinePlayers.set(playerData.socketId, onlinePlayer);
                console.log(`👤 Jugador cargado en nuevo mapa: ${playerData.username} en (${playerData.position.x}, ${playerData.position.y})`);
            });
            console.log(`✅ Total jugadores en nuevo mapa: ${gameState.onlinePlayers.size}`);
            
            if (gameState.onlinePlayers.size > 0) {
                addChatMessage('system', `🗺️ Hay ${gameState.onlinePlayers.size} jugador(es) en este mapa`);
            }
        }
        
        // Cargar NPCs del nuevo mapa
        if (data.npcs && Array.isArray(data.npcs)) {
            console.log(`🔍 Procesando ${data.npcs.length} NPCs del nuevo mapa...`);
            
            data.npcs.forEach(npcData => {
                const syncedNPC = {
                    instanceId: npcData.instanceId,
                    npcTypeId: npcData.npcTypeId,
                    name: npcData.name,
                    x: npcData.position.x,
                    y: npcData.position.y,
                    map: npcData.position.map,
                    appearance: npcData.appearance,
                    hp: npcData.stats.hp,
                    maxHp: npcData.stats.maxHp,
                    level: npcData.stats.level,
                    behavior: npcData.behavior,
                    isAlive: true
                };
                
                gameState.syncedNPCs.set(npcData.instanceId, syncedNPC);
                console.log(`✨ NPC cargado en nuevo mapa: ${npcData.name} en (${npcData.position.x}, ${npcData.position.y})`);
            });
            
            console.log(`✅ Total NPCs en nuevo mapa: ${gameState.syncedNPCs.size}`);
            
            if (gameState.syncedNPCs.size > 0) {
                addChatMessage('system', `🎭 Hay ${gameState.syncedNPCs.size} criatura(s) en este mapa`);
            }
        }
    });

    // Mensajes de chat del servidor
    socketClient.on('chat_message', (data) => {
        console.log('💬 Mensaje de chat recibido del servidor:', data);
        
        // Importar la función receiveChatMessage de Chat.js
        import('../ui/Chat.js').then(({ receiveChatMessage }) => {
            receiveChatMessage(data);
        });
    });

    // Cuando el servidor fuerza la desconexión
    socketClient.on('force_disconnect', (data) => {
        console.warn('⚠️ DESCONEXIÓN FORZADA:', data.message);
        
        // Desconectar el socket
        socketClient.disconnect();
        
        // Limpiar estado del juego
        gameState.isOnline = false;
        if (gameState.onlinePlayers) {
            gameState.onlinePlayers.clear();
        }
        
        // Recargar la página para volver a la pantalla de login
        // con un mensaje informativo
        alert(data.message || 'Has sido desconectado del juego');
        window.location.reload();
    });

    // ===== COMBAT PVP EVENTS =====
    
    // Cuando somos atacados por otro jugador
    socketClient.on('player_attacked', (data) => {
        console.log('⚔️ EVENTO player_attacked recibido:', data);
        
        // Importar y llamar handler de Combat.js
        import('../systems/Combat.js').then(({ handlePlayerAttacked }) => {
            handlePlayerAttacked(data);
        });
    });

    // Cuando atacamos a otro jugador (resultado del ataque)
    socketClient.on('player_attack_result', (data) => {
        console.log('⚔️ EVENTO player_attack_result recibido:', data);
        
        // Importar y llamar handler de Combat.js
        import('../systems/Combat.js').then(({ handlePlayerAttackResult }) => {
            handlePlayerAttackResult(data);
        });
    });

    // Cuando observamos un combate entre otros jugadores
    socketClient.on('combat_action', (data) => {
        console.log('👁️ EVENTO combat_action recibido:', data);
        
        // Importar y llamar handler de Combat.js
        import('../systems/Combat.js').then(({ handleCombatAction }) => {
            handleCombatAction(data);
        });
    });

    // Cuando cambia el estado de un jugador (muerte/resurrección)
    socketClient.on('player_state_changed', (data) => {
        console.log('👻 EVENTO player_state_changed recibido:', data);
        
        const player = gameState.onlinePlayers.get(data.socketId);
        if (player) {
            // Actualizar estado del jugador
            player.isGhost = data.isGhost;
            player.isAlive = data.isAlive;
            player.hp = data.hp || 0;
            
            if (data.maxHp) {
                player.maxHp = data.maxHp;
            }
            
            console.log(`👻 Estado actualizado para ${data.username}: isGhost=${data.isGhost}, hp=${player.hp}`);
            
            // Mostrar mensaje según el motivo
            if (data.reason === 'death') {
                import('../ui/UI.js').then(({ addChatMessage }) => {
                    addChatMessage('system', `💀 ${data.username} ha muerto${data.killedBy ? ` a manos de ${data.killedBy}` : ''}`);
                });
            } else if (data.reason === 'resurrection') {
                import('../ui/UI.js').then(({ addChatMessage }) => {
                    addChatMessage('system', `⛪ ${data.username} ha resucitado`);
                });
            }
        } else {
            console.warn('⚠️ player_state_changed recibido para jugador desconocido:', data.socketId);
        }
    });

    // ===== EVENTOS DE NPCs SINCRONIZADOS =====

    // Cuando un NPC es spawneado
    socketClient.on('npc_spawned', (data) => {
        console.log('✨ EVENTO npc_spawned recibido:', data);
        
        const syncedNPC = {
            instanceId: data.instanceId,
            npcTypeId: data.npcTypeId,
            name: data.name,
            x: data.position.x,
            y: data.position.y,
            map: data.position.map,
            appearance: data.appearance,
            hp: data.stats.hp,
            maxHp: data.stats.maxHp,
            level: data.stats.level,
            behavior: data.behavior,
            isAlive: true
        };
        
        gameState.syncedNPCs.set(data.instanceId, syncedNPC);
        console.log(`✨ NPC añadido: ${data.name} en (${data.position.x}, ${data.position.y})`);
    });

    // Cuando un NPC se mueve
    socketClient.on('npc_moved', (data) => {
        const npc = gameState.syncedNPCs.get(data.instanceId);
        if (npc) {
            npc.x = data.position.x;
            npc.y = data.position.y;
            npc.heading = data.position.heading;
            console.log(`🔄 NPC ${npc.name} movido a (${data.position.x}, ${data.position.y})`);
        }
    });

    // Cuando cambia el HP de un NPC
    socketClient.on('npc_hp_changed', (data) => {
        const npc = gameState.syncedNPCs.get(data.instanceId);
        if (npc) {
            npc.hp = data.hp;
            npc.maxHp = data.maxHp;
            console.log(`💔 NPC recibió ${data.damage} de daño (HP: ${data.hp}/${data.maxHp})`);
        }
    });

    // Cuando un NPC muere
    socketClient.on('npc_died', (data) => {
        console.log('💀 EVENTO npc_died recibido:', data);
        
        const npc = gameState.syncedNPCs.get(data.instanceId);
        if (npc) {
            npc.isAlive = false;
            npc.hp = 0;
            console.log(`💀 NPC ${data.npcName} ha muerto`);
            
            // Eliminar NPC después de un breve delay para mostrar animación de muerte
            setTimeout(() => {
                gameState.syncedNPCs.delete(data.instanceId);
                console.log(`🗑️ NPC ${data.npcName} eliminado del mapa`);
            }, 1000);
        }
    });

    // Cuando un NPC respawnea
    socketClient.on('npc_respawned', (data) => {
        console.log('🔄 EVENTO npc_respawned recibido:', data);
        
        const syncedNPC = {
            instanceId: data.instanceId,
            npcTypeId: data.npcTypeId,
            name: data.name,
            x: data.position.x,
            y: data.position.y,
            map: data.position.map,
            appearance: data.appearance,
            hp: data.stats.hp,
            maxHp: data.stats.maxHp,
            level: data.stats.level,
            behavior: data.behavior,
            isAlive: true
        };
        
        gameState.syncedNPCs.set(data.instanceId, syncedNPC);
        console.log(`🔄 NPC respawneado: ${data.name} en (${data.position.x}, ${data.position.y})`);
    });

    // Cuando recibimos recompensa de un NPC
    socketClient.on('npc_reward', (data) => {
        console.log('💰 EVENTO npc_reward recibido:', data);
        
        let rewardMessage = `💰 Has recibido `;
        const rewards = [];
        
        if (data.experience > 0) {
            rewards.push(`${data.experience} EXP`);
        }
        
        if (data.gold > 0) {
            rewards.push(`${data.gold} oro`);
        }
        
        rewardMessage += rewards.join(' y ');
        
        if (data.wasKiller) {
            rewardMessage += ` (¡Golpe final!)`;
        }
        
        addChatMessage('system', rewardMessage);
        
        // Actualizar stats del jugador (si están disponibles en gameState)
        if (data.experience > 0 && gameState.player) {
            gameState.player.experience = (gameState.player.experience || 0) + data.experience;
        }
        
        if (data.gold > 0 && gameState.player) {
            gameState.player.gold = (gameState.player.gold || 0) + data.gold;
        }
        
        // Actualizar UI
        updateUI();
    });

    // Cuando un NPC dropea loot
    socketClient.on('npc_loot_dropped', (data) => {
        console.log('📦 EVENTO npc_loot_dropped recibido:', data);
        
        const itemNames = data.items.map(item => `${item.amount}x Item#${item.itemId}`).join(', ');
        addChatMessage('system', `📦 Items dropeados: ${itemNames}`);
    });

    // Cuando vemos acción de combate de un NPC
    socketClient.on('npc_combat_action', (data) => {
        console.log('⚔️ EVENTO npc_combat_action recibido:', data);
        // Mostrar efecto visual de combate si está en la pantalla
    });

    // Cuando somos atacados por un NPC
    socketClient.on('npc_attacked_player', (data) => {
        console.log('⚠️ EVENTO npc_attacked_player recibido:', data);
        
        addChatMessage('combat', `⚠️ ${data.npcName} te ataca y te causa ${data.damage} de daño!`);
        
        // Actualizar HP del jugador local
        if (gameState.player) {
            gameState.player.hp = Math.max(0, gameState.player.hp - data.damage);
            updateUI();
            
            // Verificar muerte
            if (gameState.player.hp <= 0) {
                import('../systems/Combat.js').then(({ enterGhostMode }) => {
                    enterGhostMode(data.npcName);
                });
            }
        }
    });

    // Resultado de atacar a un NPC
    socketClient.on('attack_npc_result', (data) => {
        console.log('⚔️ EVENTO attack_npc_result recibido:', data);
        
        if (data.success) {
            // Obtener nombre del NPC desde gameState.syncedNPCs
            const npc = gameState.syncedNPCs.get(data.instanceId);
            const npcName = npc ? npc.name : 'NPC';
            
            addChatMessage('combat', `⚔️ Atacas a ${npcName} y causas ${data.damage} de daño!`);
            
            if (data.npcDied) {
                addChatMessage('combat', `💀 ¡Has matado a ${npcName}!`);
            }
        } else {
            addChatMessage('combat', `❌ ${data.reason}`);
        }
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
        gameState.propLayer = mapResult.propLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));

        // Verificación adicional de asignación
        console.log(`✅ Mapa cargado con estructura multicapa. Capas: base(${gameState.map.length}x${gameState.map[0]?.length}), techos(${gameState.roofLayer.length}x${gameState.roofLayer[0]?.length}), puertas(${gameState.doorLayer.length}x${gameState.doorLayer[0]?.length}), ventanas(${gameState.windowLayer.length}x${gameState.windowLayer[0]?.length}), props(${gameState.propLayer.length}x${gameState.propLayer[0]?.length})`);
    } else if (mapResult && Array.isArray(mapResult)) {
        // Es un mapa simple (array 2D directo)
        console.log(`🗺️ Asignando mapa con formato simple: ${mapResult.length}x${mapResult[0]?.length}`);
        gameState.map = mapResult;

        // Crear capas vacías para mapas simples
        gameState.roofLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.doorLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.windowLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.propLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));

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
        gameState.propLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        
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

    // Actualizar apariencia del jugador si hay datos de personalización
    if (gameState.player.appearance && gameState.player.race) {
        console.log('🎨 Actualizando apariencia del jugador:', {
            race: gameState.player.race,
            appearance: gameState.player.appearance
        });
        updatePlayerAppearance(gameState.player.appearance);
    } else {
        console.warn('⚠️ No se puede actualizar apariencia del jugador:', {
            hasAppearance: !!gameState.player.appearance,
            hasRace: !!gameState.player.race,
            race: gameState.player.race,
            appearance: gameState.player.appearance
        });
    }

    updateUI();

    // Iniciar música de fondo según tipo de mapa
    const currentMapDef = getStaticMap(gameState.currentMap);
    if (currentMapDef && currentMapDef.type) {
        const musicTrack = audioManager.getMusicForMapType(currentMapDef.type);
        audioManager.playMusic(musicTrack);
        console.log(`🎵 Iniciando música: ${musicTrack} para mapa tipo ${currentMapDef.type}`);
    }

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

    // Si está en modo online, actualizar jugadores online y sincronizar posición
    if (gameState.isOnline) {
        // Actualizar jugadores online (interpolación de movimiento) y sincronizar estado completo
        multiplayerManager.update(gameState, timestamp);
        
        // Sincronizar posición del jugador local con el servidor
        multiplayerManager.syncPlayerPosition(gameState.player, gameState.currentMap, timestamp);
    }

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
        gameState.propLayer = mapResult.propLayer || Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));

        // Verificación adicional de asignación
        console.log(`✅ Mapa cargado con estructura multicapa. Capas: base(${gameState.map.length}x${gameState.map[0]?.length}), techos(${gameState.roofLayer.length}x${gameState.roofLayer[0]?.length}), puertas(${gameState.doorLayer.length}x${gameState.doorLayer[0]?.length}), ventanas(${gameState.windowLayer.length}x${gameState.windowLayer[0]?.length}), props(${gameState.propLayer.length}x${gameState.propLayer[0]?.length})`);
    } else if (mapResult && Array.isArray(mapResult)) {
        // Es un mapa simple
        console.log(`🗺️ Asignando mapa con formato simple: ${mapResult.length}x${mapResult[0]?.length}`);
        gameState.map = mapResult;

        // Crear capas vacías para mapas simples
        gameState.roofLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.doorLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.windowLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));
        gameState.propLayer = Array(CONFIG.MAP_HEIGHT).fill().map(() => Array(CONFIG.MAP_WIDTH).fill(0));

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

    // Si está en modo online, notificar cambio de mapa al servidor
    if (gameState.isOnline) {
        multiplayerManager.notifyMapChange(targetMap, targetX, targetY);
    }

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

    // Cambiar música según tipo de mapa
    const newMapDef = getStaticMap(targetMap);
    if (newMapDef && newMapDef.type) {
        const musicTrack = audioManager.getMusicForMapType(newMapDef.type);
        audioManager.playMusic(musicTrack);
        console.log(`🎵 Cambiando música: ${musicTrack} para mapa tipo ${newMapDef.type}`);
    }

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
