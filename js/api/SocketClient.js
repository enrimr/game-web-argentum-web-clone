/**
 * Cliente WebSocket para comunicación en tiempo real con el servidor
 * Requiere Socket.io client library
 */

class SocketClient {
    constructor() {
        this.socket = null;
        this.serverUrl = 'http://localhost:3000'; // TESTING: Usar servidor local
        //this.serverUrl = 'https://calima-online-server-production.up.railway.app';
        this.isConnected = false;
        this.characterId = null;
        this.eventHandlers = new Map();
        this.mySocketId = null; // Para almacenar el socketId propio
    }

    /**
     * Conectar al servidor WebSocket
     */
    connect(token) {
        if (this.socket && this.socket.connected) {
            console.warn('Socket ya está conectado');
            return;
        }

        this.socket = io(this.serverUrl, {
            auth: {
                token: token
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.setupEventListeners();
    }

    /**
     * Configurar listeners de eventos del socket
     */
    setupEventListeners() {
        // Evento: Conexión exitosa
        this.socket.on('connect', () => {
            console.log('✅ Conectado al servidor WebSocket');
            this.isConnected = true;
            this.mySocketId = this.socket.id; // Guardar socketId propio
            console.log('🔑 Mi socketId:', this.mySocketId);
            this.emit('connected');
        });

        // Evento: Desconexión
        this.socket.on('disconnect', (reason) => {
            console.log('❌ Desconectado del servidor:', reason);
            this.isConnected = false;
            this.emit('disconnected', reason);
        });

        // Evento: Error de conexión
        this.socket.on('connect_error', (error) => {
            console.error('Error de conexión:', error.message);
            this.emit('error', error);
        });

        // Evento: Juego unido exitosamente
        this.socket.on('game_joined', (data) => {
            console.log('🎮 Juego unido:', data);
            // Asegurar que tenemos nuestro socketId
            if (!this.mySocketId) {
                this.mySocketId = this.socket.id;
                console.log('🔑 Mi socketId (desde game_joined):', this.mySocketId);
            }
            this.emit('game_joined', data);
        });

        // Evento: Jugador se unió al mapa
        this.socket.on('player_joined', (data) => {
            // FILTRAR: No procesar si es nuestro propio jugador
            if (data.socketId === this.mySocketId) {
                console.log('🚫 Ignorando player_joined de mi mismo jugador:', data.username);
                return;
            }
            console.log('👤 Jugador se unió:', data.username);
            this.emit('player_joined', data);
        });

        // Evento: Jugador se movió
        this.socket.on('player_moved', (data) => {
            // FILTRAR: No procesar si es nuestro propio movimiento
            if (data.socketId === this.mySocketId) {
                // No hacer nada, es nuestro propio movimiento
                return;
            }
            this.emit('player_moved', data);
        });

        // Evento: Jugador salió
        this.socket.on('player_left', (data) => {
            console.log('👋 Jugador salió:', data.socketId);
            this.emit('player_left', data);
        });

        // Evento: Cambio de mapa (con lista de jugadores en el nuevo mapa)
        this.socket.on('map_changed', (data) => {
            console.log('🗺️ Cambio de mapa:', data.newMap, `(${data.playersInMap.length} jugadores)`);
            this.emit('map_changed', data);
        });

        // Evento: Mensaje de chat
        this.socket.on('chat_message', (data) => {
            console.log('💬 Mensaje de chat recibido:', data);
            this.emit('chat_message', data);
        });

        // Evento: Stats actualizadas
        this.socket.on('stats_updated', (data) => {
            this.emit('stats_updated', data);
        });

        // Evento: Error del servidor
        this.socket.on('error', (data) => {
            console.error('Error del servidor:', data.message);
            this.emit('server_error', data);
        });

        // Evento: Desconexión forzada desde el servidor
        this.socket.on('force_disconnect', (data) => {
            console.warn('⚠️ Desconexión forzada del servidor:', data.message);
            this.emit('force_disconnect', data);
        });

        // Evento: Jugador fue atacado por otro jugador
        this.socket.on('player_attacked', (data) => {
            console.log('⚔️ Fuiste atacado por:', data.attackerUsername, `(${data.damage} daño)`);
            this.emit('player_attacked', data);
        });

        // Evento: Resultado de ataque a otro jugador
        this.socket.on('player_attack_result', (data) => {
            console.log('⚔️ Resultado de ataque:', data);
            this.emit('player_attack_result', data);
        });

        // Evento: Acción de combate visible (para espectadores)
        this.socket.on('combat_action', (data) => {
            console.log('👁️ Acción de combate observada:', data);
            this.emit('combat_action', data);
        });
    }

    /**
     * Unirse al juego con un personaje
     * @param {string} characterId - ID del personaje
     */
    joinGame(characterId) {
        if (!this.socket || !this.socket.connected) {
            console.error('Socket no conectado');
            return;
        }

        this.characterId = characterId;
        console.log('📤 Enviando join_game con characterId:', characterId);
        this.socket.emit('join_game', { characterId });
    }

    /**
     * Enviar mensaje de chat
     * @param {string} message - Contenido del mensaje
     * @param {string} type - Tipo de mensaje (global, local, group, private)
     * @param {string} targetSocketId - Socket ID del destinatario (solo para mensajes privados)
     */
    sendChatMessage(message, type = 'global', targetSocketId = null) {
        if (!this.socket || !this.socket.connected) {
            console.error('Socket no conectado, no se puede enviar mensaje');
            return;
        }

        const chatData = { message, type };
        
        // Añadir destinatario si es mensaje privado
        if (type === 'private' && targetSocketId) {
            chatData.targetSocketId = targetSocketId;
        }

        console.log('💬 Enviando mensaje de chat:', chatData);
        this.socket.emit('chat_message', chatData);
    }

    /**
     * Enviar movimiento del jugador
     */
    sendPlayerMove(x, y, map = null) {
        if (!this.socket || !this.socket.connected) {
            return;
        }

        const data = { x, y };
        if (map) {
            data.map = map;
        }

        this.socket.emit('player_move', data);
    }

    /**
     * Actualizar stats del jugador
     */
    updateStats(stats, inventory = null, equipment = null) {
        if (!this.socket || !this.socket.connected) {
            return;
        }

        const data = {};
        if (stats) data.stats = stats;
        if (inventory) data.inventory = inventory;
        if (equipment) data.equipment = equipment;

        this.socket.emit('update_stats', data);
    }

    /**
     * Desconectar del servidor
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.characterId = null;
            this.mySocketId = null; // Limpiar socketId propio
        }
    }

    /**
     * Registrar un manejador de eventos
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    /**
     * Remover un manejador de eventos
     */
    off(event, handler) {
        if (!this.eventHandlers.has(event)) {
            return;
        }

        const handlers = this.eventHandlers.get(event);
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }

    /**
     * Emitir evento a los manejadores registrados
     */
    emit(event, data) {
        if (!this.eventHandlers.has(event)) {
            return;
        }

        const handlers = this.eventHandlers.get(event);
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error en manejador de evento ${event}:`, error);
            }
        });
    }

    /**
     * Verificar si está conectado
     */
    isSocketConnected() {
        return this.socket && this.socket.connected;
    }

    /**
     * Obtener ID del socket
     */
    getSocketId() {
        return this.mySocketId || (this.socket ? this.socket.id : null);
    }

    /**
     * Verificar si un socketId es el propio
     * @param {string} socketId - Socket ID a verificar
     * @returns {boolean} True si es el propio jugador
     */
    isMySocketId(socketId) {
        return socketId === this.mySocketId;
    }

    /**
     * Cambiar URL del servidor
     */
    setServerUrl(url) {
        this.serverUrl = url;
    }

    /**
     * Obtener URL del servidor
     */
    getServerUrl() {
        return this.serverUrl;
    }
}

// Exportar instancia singleton
const socketClient = new SocketClient();
export default socketClient;