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
        console.log('📥 Cargando estado completo del servidor...', characterData);

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
            
            // Calcular experiencia necesaria para el siguiente nivel
            // Tabla sincronizada con calima-online-server/src/config/experienceTable.js
            const EXP_TABLE = {
                1: 0, 2: 100, 3: 250, 4: 500, 5: 900,
                6: 1500, 7: 2300, 8: 3400, 9: 4800, 10: 6500,
                11: 8500, 12: 11000, 13: 14000, 14: 17500, 15: 21500,
                16: 26000, 17: 31000, 18: 36500, 19: 42500, 20: 49000,
                21: 56000, 22: 63500, 23: 71500, 24: 80000, 25: 89000,
                26: 98500, 27: 108500, 28: 119000, 29: 130000, 30: 142000,
                31: 155000, 32: 169000, 33: 184000, 34: 200000, 35: 217000,
                36: 235000, 37: 254000, 38: 274000, 39: 295000, 40: 317000,
                41: 340000, 42: 364000, 43: 389000, 44: 415000, 45: 442000,
                46: 470000, 47: 499000, 48: 529000, 49: 560000, 50: 592000
            };
            const nextLevel = Math.min(player.level + 1, 50);
            player.expToNextLevel = EXP_TABLE[nextLevel] || EXP_TABLE[50];
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
            
            // Si el jugador está muerto (por isAlive=false O hp=0), asegurarse de que HP sea 0 Y activar modo fantasma
            if (!player.isAlive || player.hp === 0) {
                player.hp = 0;
                player.isAlive = false; // Asegurar consistencia
                player.isGhost = true;
                console.log('👻 Jugador muerto detectado (HP=0 o isAlive=false), activando modo fantasma');
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

        // IMPORTANTE: Asegurar que race y appearance estén establecidos en el jugador
        // Esto es necesario para que updatePlayerAppearance funcione correctamente
        if (!player.race && characterData.appearance?.race) {
            // Mapear race de número a string
            const raceMap = { 1: 'human', 2: 'dwarf', 3: 'creature' };
            player.race = raceMap[characterData.appearance.race] || 'human';
            console.log(`✅ Race asignado al jugador: ${player.race}`);
        }
        
        console.log('✅ Estado completo cargado desde el servidor');
        console.log('📊 Estado final del jugador:', {
            race: player.race,
            appearance: player.appearance,
            hp: player.hp,
            maxHp: player.maxHp,
            isAlive: player.isAlive
        });
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