/**
 * MultiplayerManager.js
 * Gestiona la lógica de sincronización multijugador
 */

import socketClient from '../api/SocketClient.js';

class MultiplayerManager {
    constructor() {
        this.lastSyncTime = 0;
        this.syncInterval = 100; // Sincronizar posición cada 100ms
        this.lastPosition = { x: null, y: null, map: null };
        this.lastStateSyncTime = 0;
        this.stateSyncInterval = 5000; // Guardar estado completo cada 5 segundos
    }

    /**
     * Actualizar jugadores online (llamar en el game loop)
     * @param {Object} gameState - Estado del juego
     */
    update(gameState, currentTime) {
        if (!gameState.isOnline || !gameState.onlinePlayers) {
            return;
        }

        // Actualizar interpolación de todos los jugadores online
        for (const [socketId, player] of gameState.onlinePlayers) {
            player.update();
        }

        // Sincronizar estado completo periódicamente
        if (currentTime - this.lastStateSyncTime >= this.stateSyncInterval) {
            this.syncFullState(gameState);
            this.lastStateSyncTime = currentTime;
        }
    }

    /**
     * Sincronizar posición del jugador local con el servidor
     * @param {Object} player - Jugador local
     * @param {string} currentMap - Mapa actual
     * @param {number} currentTime - Timestamp actual
     */
    syncPlayerPosition(player, currentMap, currentTime) {
        // Solo sincronizar si ha pasado suficiente tiempo
        if (currentTime - this.lastSyncTime < this.syncInterval) {
            return;
        }

        // Solo sincronizar si la posición ha cambiado
        if (this.lastPosition.x === player.x && 
            this.lastPosition.y === player.y && 
            this.lastPosition.map === currentMap) {
            return;
        }

        // Enviar posición al servidor
        if (socketClient.isSocketConnected()) {
            socketClient.sendPlayerMove(player.x, player.y, currentMap);
            
            // Actualizar última posición sincronizada
            this.lastPosition = { x: player.x, y: player.y, map: currentMap };
            this.lastSyncTime = currentTime;
        }
    }

    /**
     * Notificar cambio de mapa al servidor
     * @param {string} newMap - Nuevo mapa
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    notifyMapChange(newMap, x, y) {
        if (socketClient.isSocketConnected()) {
            socketClient.sendPlayerMove(x, y, newMap);
            console.log(`🗺️ Notificando cambio de mapa a servidor: ${newMap}`);
        }
    }

    /**
     * Sincronizar estado completo del jugador
     * @param {Object} gameState - Estado del juego
     */
    syncFullState(gameState) {
        if (!socketClient.isSocketConnected()) {
            return;
        }

        const player = gameState.player;

        // Preparar estado completo para enviar
        const fullState = {
            stats: {
                hp: player.hp,
                maxHp: player.maxHp,
                mana: player.mana,
                maxMana: player.maxMana,
                stamina: player.stamina,
                maxStamina: player.maxStamina,
                level: player.level,
                experience: player.experience,
                gold: player.gold,
                strength: player.strength,
                dexterity: player.dexterity,
                intelligence: player.intelligence,
                constitution: player.constitution,
                charisma: player.charisma
            },
            state: {
                isAlive: player.isAlive,
                isMeditating: player.isMeditating,
                isParalyzed: player.isParalyzed || false,
                isPoisoned: player.isPoisoned || false,
                isInvisible: player.isInvisible || false
            },
            position: {
                x: player.x,
                y: player.y,
                map: gameState.currentMap
            },
            inventory: gameState.inventory || [],
            equipment: gameState.equipment || {},
            spells: gameState.spells || []
        };

        socketClient.socket.emit('update_stats', fullState);
        console.log(`💾 Estado completo sincronizado: HP=${player.hp}/${player.maxHp}, Mana=${player.mana}/${player.maxMana}, Pos=(${player.x},${player.y})`);
    }

    /**
     * Cargar estado completo del servidor
     * @param {Object} characterData - Datos del personaje del servidor
     * @param {Object} gameState - Estado del juego
     */
    loadFullState(characterData, gameState) {
        console.log('📥 Cargando estado completo del servidor...');

        const player = gameState.player;

        // Cargar stats - IMPORTANTE: No usar valores por defecto, usar lo que viene del servidor
        if (characterData.stats) {
            // Cargar maxHp y maxMana primero
            player.maxHp = characterData.stats.maxHp || 100;
            player.maxMana = characterData.stats.maxMana || 50;
            player.maxStamina = characterData.stats.maxStamina || 100;
            
            // Cargar HP, Mana, Stamina actuales - USAR VALORES REALES, incluso si son 0
            player.hp = characterData.stats.hp !== undefined ? characterData.stats.hp : player.maxHp;
            player.mana = characterData.stats.mana !== undefined ? characterData.stats.mana : player.maxMana;
            player.stamina = characterData.stats.stamina !== undefined ? characterData.stats.stamina : player.maxStamina;
            
            // Otros stats
            player.level = characterData.stats.level || 1;
            player.experience = characterData.stats.experience || 0;
            player.gold = characterData.stats.gold || 0;
            player.strength = characterData.stats.strength || 18;
            player.dexterity = characterData.stats.dexterity || 18;
            player.intelligence = characterData.stats.intelligence || 18;
            player.constitution = characterData.stats.constitution || 18;
            player.charisma = characterData.stats.charisma || 18;

            console.log(`✅ Stats cargados: HP=${player.hp}/${player.maxHp}, Mana=${player.mana}/${player.maxMana}, Level=${player.level}`);
        }

        // Cargar estado
        if (characterData.state) {
            player.isAlive = characterData.state.isAlive !== false;
            player.isMeditating = characterData.state.isMeditating || false;
            player.isParalyzed = characterData.state.isParalyzed || false;
            player.isPoisoned = characterData.state.isPoisoned || false;
            player.isInvisible = characterData.state.isInvisible || false;

            console.log(`✅ Estado cargado: isAlive=${player.isAlive}, isMeditating=${player.isMeditating}`);
            
            // Si el jugador está muerto, asegurarse de que HP sea 0
            if (!player.isAlive && player.hp > 0) {
                player.hp = 0;
                console.log('⚰️ Jugador muerto detectado, estableciendo HP a 0');
            }
        }

        // Cargar inventario
        if (characterData.inventory) {
            gameState.inventory = characterData.inventory;
            console.log(`✅ Inventario cargado: ${characterData.inventory.length} items`);
        }

        // Cargar equipamiento
        if (characterData.equipment) {
            gameState.equipment = characterData.equipment;
            console.log(`✅ Equipamiento cargado`);
        }

        // Cargar hechizos
        if (characterData.spells) {
            gameState.spells = characterData.spells;
            console.log(`✅ Hechizos cargados: ${characterData.spells.length} hechizos`);
        }

        console.log('✅ Estado completo cargado desde el servidor');
    }

    /**
     * Limpiar estado multiplayer
     */
    cleanup() {
        this.lastPosition = { x: null, y: null, map: null };
        this.lastSyncTime = 0;
        this.lastStateSyncTime = 0;
    }
}

// Exportar instancia singleton
const multiplayerManager = new MultiplayerManager();
export default multiplayerManager;