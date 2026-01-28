/**
 * Cliente WebSocket para comunicación en tiempo real con el servidor
 * Requiere Socket.io client library
 */

class SocketClient {
    constructor() {
        this.socket = null;
        this.serverUrl = 'http://localhost:3000';
        this.isConnected = false;
        this.characterId = null;
        this.eventHandlers = new Map();
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
            this.emit('game_joined', data);
        });

        // Evento: Jugador se unió al mapa
        this.socket.on('player_joined', (data) => {
            console.log('👤 Jugador se unió:', data.username);
            this.emit('player_joined', data);
        });

        // Evento: Jugador se movió
        this.socket.on('player_moved', (data) => {
            this.emit('player_moved', data);
        });

        // Evento: Jugador salió
        this.socket.on('player_left', (data) => {
            console.log('👋 Jugador salió:', data.socketId);
            this.emit('player_left', data);
        });

        // Evento: Mensaje de chat
        this.socket.on('chat_message', (data) => {
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
    }

    /**
     * Unirse al juego con un personaje
     */
    joinGame(characterId) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('Socket no está conectado');
        }

        this.characterId = characterId;
        this.socket.emit('join_game', { characterId });
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
     * Enviar mensaje de chat
     */
    sendChatMessage(message, type = 'global') {
        if (!this.socket || !this.socket.connected) {
            return;
        }

        this.socket.emit('chat_message', { message, type });
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
        return this.socket ? this.socket.id : null;
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