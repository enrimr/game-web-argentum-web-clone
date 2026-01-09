# Refactorización del Front-End para Implementar Multijugador

Este documento presenta un análisis detallado de los cambios necesarios en el front-end actual para adaptarlo a un modo multijugador. El documento complementa la arquitectura general descrita en `ARQUITECTURA_MULTIJUGADOR.md`.

## Estado Actual del Front-End

Después de analizar la codebase actual, identificamos que el juego sigue un patrón de arquitectura monolítica donde:

1. El estado global (`state.js`) mantiene todo el estado del juego
2. Los sistemas (Combat, Magic, Inventory, etc.) manipulan directamente este estado
3. El bucle de juego (`GameLoop.js`) actualiza el estado y coordina los sistemas
4. El renderizador (`Renderer.js`, recientemente modularizado) visualiza el estado

Esta arquitectura funciona bien para un juego single-player, pero necesita cambios significativos para multijugador.

## Componentes que Requieren Mayor Refactorización

### 1. Sistema de Estado (`state.js`)

**Problemas actuales:**
- El estado se modifica directamente desde múltiples sistemas
- No hay un flujo de datos unidireccional claro
- No existe un sistema de eventos para notificar cambios
- Todo el estado se mantiene en un único objeto global

**Refactorización propuesta:**

```javascript
// Estructura actual simplificada
export const gameState = {
  player: { /* datos del jugador */ },
  npcs: [ /* lista de NPCs */ ],
  enemies: [ /* lista de enemigos */ ],
  // ... otros datos
};

// Estructura propuesta
import { createStore } from './store.js';

// Estado dividido en "slices"
const initialState = {
  localPlayer: { /* datos del jugador local */ },
  remotePlayers: {}, // Objeto indexado por ID de jugador
  npcs: {},
  enemies: {},
  world: { /* datos del mundo */ },
  ui: { /* estado de la interfaz */ },
  network: { 
    connected: false,
    lastPing: 0,
    serverTime: 0
  }
};

export const gameStore = createStore(initialState);

// Ejemplo de uso
import { gameStore } from './state.js';

// Lectura de estado
const player = gameStore.getState().localPlayer;

// Escritura de estado (a través de acciones)
gameStore.dispatch({
  type: 'PLAYER_MOVE',
  payload: { x: 10, y: 20 }
});

// Suscribirse a cambios
gameStore.subscribe('localPlayer', (newValue, oldValue) => {
  console.log('Player state changed:', newValue);
});
```

### 2. Sistema de Eventos

**Implementación propuesta:**

```javascript
// events.js
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return () => this.off(eventName, callback);
  }
  
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName]
      .filter(cb => cb !== callback);
  }
  
  emit(eventName, data) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(cb => cb(data));
  }
  
  once(eventName, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(eventName, onceWrapper);
    };
    this.on(eventName, onceWrapper);
    return () => this.off(eventName, onceWrapper);
  }
}

export const gameEvents = new EventEmitter();

// Ejemplo de uso
import { gameEvents } from './events.js';

// Suscribirse a un evento
gameEvents.on('player-attacked', (data) => {
  console.log(`${data.target} fue atacado por ${data.source}`);
});

// Emitir un evento
gameEvents.emit('player-attacked', { 
  source: 'Player1', 
  target: 'Goblin', 
  damage: 10 
});
```

### 3. Gestor de Conexión WebSocket

**Implementación propuesta:**

```javascript
// network.js
import { gameEvents } from './events.js';
import { gameStore } from './state.js';

class NetworkManager {
  constructor() {
    this.socket = null;
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.lastMessageId = 0;
    this.pendingMessages = new Map();
  }
  
  connect(serverUrl) {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(serverUrl);
        
        this.socket.onopen = () => {
          console.log('Conexión establecida con el servidor');
          this.reconnectAttempts = 0;
          this.processPendingMessages();
          
          gameStore.dispatch({ 
            type: 'NETWORK_CONNECTED',
            payload: true
          });
          
          gameEvents.emit('network-connected');
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (e) {
            console.error('Error al procesar mensaje:', e);
          }
        };
        
        this.socket.onclose = () => {
          console.log('Conexión cerrada');
          gameStore.dispatch({ 
            type: 'NETWORK_CONNECTED',
            payload: false
          });
          
          gameEvents.emit('network-disconnected');
          this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('Error de WebSocket:', error);
          reject(error);
        };
      } catch (error) {
        console.error('Error al conectar:', error);
        reject(error);
      }
    });
  }
  
  sendMessage(type, data) {
    const messageId = ++this.lastMessageId;
    const message = {
      id: messageId,
      type,
      timestamp: Date.now(),
      data
    };
    
    return this.sendRawMessage(message);
  }
  
  sendRawMessage(message) {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        try {
          this.socket.send(JSON.stringify(message));
          
          // Para mensajes que requieren respuesta
          if (message.requiresAck) {
            this.pendingMessages.set(message.id, { 
              message, 
              resolve, 
              reject,
              timestamp: Date.now()
            });
            
            // Timeout para respuesta
            setTimeout(() => {
              if (this.pendingMessages.has(message.id)) {
                const pending = this.pendingMessages.get(message.id);
                this.pendingMessages.delete(message.id);
                reject(new Error('Timeout esperando respuesta del servidor'));
              }
            }, 5000); // 5 segundos timeout
          } else {
            resolve();
          }
        } catch (e) {
          this.messageQueue.push({ message, resolve, reject });
          reject(e);
        }
      } else {
        this.messageQueue.push({ message, resolve, reject });
        reject(new Error('No conectado al servidor'));
      }
    });
  }
  
  handleMessage(message) {
    // Manejar ACKs para mensajes pendientes
    if (message.isAck && this.pendingMessages.has(message.ackId)) {
      const { resolve } = this.pendingMessages.get(message.ackId);
      this.pendingMessages.delete(message.ackId);
      resolve(message);
      return;
    }
    
    // Enviar ACK si se requiere
    if (message.requiresAck) {
      this.sendRawMessage({
        isAck: true,
        ackId: message.id,
        timestamp: Date.now()
      });
    }
    
    // Procesar mensaje según su tipo
    switch (message.type) {
      case 'WORLD_STATE_UPDATE':
        this.processWorldUpdate(message.data);
        break;
      case 'PLAYER_JOINED':
        this.addRemotePlayer(message.data);
        break;
      case 'PLAYER_LEFT':
        this.removeRemotePlayer(message.data.id);
        break;
      case 'CHAT_MESSAGE':
        gameEvents.emit('chat-message-received', message.data);
        break;
      // Otros tipos de mensajes...
      default:
        // Emitir evento genérico para que otros sistemas puedan procesarlo
        gameEvents.emit(`network-message-${message.type}`, message.data);
    }
  }
  
  processWorldUpdate(data) {
    // Actualizar el estado local con datos del servidor
    gameStore.dispatch({
      type: 'WORLD_STATE_UPDATE',
      payload: data
    });
    
    // Emitir evento para que los sistemas puedan reaccionar
    gameEvents.emit('world-state-updated', data);
  }
  
  addRemotePlayer(playerData) {
    gameStore.dispatch({
      type: 'ADD_REMOTE_PLAYER',
      payload: playerData
    });
    
    gameEvents.emit('player-joined', playerData);
  }
  
  removeRemotePlayer(playerId) {
    gameStore.dispatch({
      type: 'REMOVE_REMOTE_PLAYER',
      payload: { id: playerId }
    });
    
    gameEvents.emit('player-left', { id: playerId });
  }
  
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
  
  processPendingMessages() {
    if (this.messageQueue.length > 0 && this.isConnected()) {
      const pendingMsgs = [...this.messageQueue];
      this.messageQueue = [];
      
      pendingMsgs.forEach(({ message, resolve, reject }) => {
        this.sendRawMessage(message).then(resolve).catch(reject);
      });
    }
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Número máximo de intentos de reconexión alcanzado');
      gameEvents.emit('network-reconnect-failed');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected()) {
        this.connect(this.serverUrl).catch(e => {
          console.error('Error en reconexión:', e);
        });
      }
    }, delay);
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const networkManager = new NetworkManager();
```

### 4. Sistema de Predicción y Reconciliación

**Implementación propuesta:**

```javascript
// prediction.js
import { gameStore } from './state.js';
import { networkManager } from './network.js';
import { gameEvents } from './events.js';

class PredictionSystem {
  constructor() {
    this.inputSequenceNumber = 0;
    this.pendingInputs = [];
    this.lastProcessedInput = 0;
    
    // Suscribirse a actualizaciones del servidor
    gameEvents.on('world-state-updated', (data) => {
      this.reconcile(data);
    });
  }
  
  applyLocalInput(input) {
    // Asignar un número de secuencia al input
    input.seq = ++this.inputSequenceNumber;
    
    // Aplicar el input localmente
    this.applyInput(gameStore.getState().localPlayer, input);
    
    // Guardar el input para posible reconciliación
    this.pendingInputs.push(input);
    
    // Enviar el input al servidor
    networkManager.sendMessage('PLAYER_INPUT', {
      input,
      timestamp: Date.now()
    });
    
    return input.seq;
  }
  
  applyInput(playerState, input) {
    // Esta función simula lo que el servidor haría con el input
    // Debe ser idéntica a la lógica del servidor
    
    const newState = { ...playerState };
    
    switch(input.type) {
      case 'MOVE':
        // Aplicar movimiento
        newState.x += input.dx;
        newState.y += input.dy;
        break;
      case 'ATTACK':
        // Iniciar ataque
        newState.attacking = true;
        break;
      // Otros tipos de inputs...
    }
    
    // Actualizar el estado local del jugador
    gameStore.dispatch({
      type: 'UPDATE_LOCAL_PLAYER',
      payload: newState
    });
    
    return newState;
  }
  
  reconcile(serverState) {
    const localPlayer = gameStore.getState().localPlayer;
    const serverPlayer = serverState.players[localPlayer.id];
    
    if (!serverPlayer) return;
    
    // Actualizar último input procesado por el servidor
    if (serverPlayer.lastProcessedInput > this.lastProcessedInput) {
      this.lastProcessedInput = serverPlayer.lastProcessedInput;
      
      // Eliminar inputs ya procesados por el servidor
      this.pendingInputs = this.pendingInputs.filter(
        input => input.seq > this.lastProcessedInput
      );
    }
    
    // Verificar si necesitamos reconciliar
    const needsReconciliation = 
      localPlayer.x !== serverPlayer.x || 
      localPlayer.y !== serverPlayer.y;
    
    if (needsReconciliation) {
      console.log('Reconciliando estado local con servidor');
      
      // Guardar el estado del servidor como base
      let reconciled = { ...serverPlayer };
      
      // Re-aplicar inputs pendientes
      for (const input of this.pendingInputs) {
        reconciled = this.applyInput(reconciled, input);
      }
      
      // Actualizar el estado del jugador local
      gameStore.dispatch({
        type: 'RECONCILE_LOCAL_PLAYER',
        payload: reconciled
      });
    }
  }
}

export const predictionSystem = new PredictionSystem();

// Ejemplo de uso en el control de input
import { predictionSystem } from './prediction.js';

function handlePlayerMovement(dx, dy) {
  // En lugar de modificar directamente el estado
  // gameState.player.x += dx;
  // gameState.player.y += dy;
  
  // Usamos el sistema de predicción
  predictionSystem.applyLocalInput({
    type: 'MOVE',
    dx,
    dy
  });
}
```

### 5. Sistema de Interpolación

**Implementación propuesta:**

```javascript
// interpolation.js
import { gameStore } from './state.js';
import { gameEvents } from './events.js';

class InterpolationSystem {
  constructor() {
    this.interpolationDelay = 100; // ms
    this.entityBuffer = new Map(); // Para almacenar estados anteriores
    this.lastUpdateTime = 0;
    
    gameEvents.on('world-state-updated', (data) => {
      this.bufferState(data);
    });
  }
  
  bufferState(worldState) {
    const timestamp = worldState.timestamp || Date.now();
    
    // Guardamos el estado en el buffer para cada entidad
    Object.entries(worldState.remotePlayers || {}).forEach(([id, player]) => {
      if (!this.entityBuffer.has(id)) {
        this.entityBuffer.set(id, []);
      }
      
      const buffer = this.entityBuffer.get(id);
      buffer.push({
        timestamp,
        state: { ...player }
      });
      
      // Mantener un buffer limitado
      while (buffer.length > 10) {
        buffer.shift();
      }
    });
    
    this.lastUpdateTime = Date.now();
  }
  
  update() {
    const now = Date.now();
    const renderTimestamp = now - this.interpolationDelay;
    
    // No hacer nada si no hemos recibido actualizaciones
    if (!this.lastUpdateTime) return;
    
    // Para cada entidad en el buffer
    this.entityBuffer.forEach((buffer, id) => {
      if (buffer.length < 2) return;
      
      // Encontrar los dos estados que rodean nuestro tiempo de renderizado
      let beforeIndex = -1;
      let afterIndex = -1;
      
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i].timestamp <= renderTimestamp) {
          beforeIndex = i;
        }
        if (buffer[i].timestamp >= renderTimestamp && afterIndex === -1) {
          afterIndex = i;
        }
      }
      
      // Si no tenemos dos estados, usar el más reciente
      if (beforeIndex === -1 || afterIndex === -1) {
        const mostRecent = buffer[buffer.length - 1];
        gameStore.dispatch({
          type: 'UPDATE_REMOTE_ENTITY',
          payload: {
            id,
            entity: mostRecent.state,
            interpolated: false
          }
        });
        return;
      }
      
      const before = buffer[beforeIndex];
      const after = buffer[afterIndex];
      
      // Calcular factor de interpolación (0 a 1)
      const totalTime = after.timestamp - before.timestamp;
      if (totalTime <= 0) return;
      
      const t = (renderTimestamp - before.timestamp) / totalTime;
      
      // Interpolar las propiedades
      const interpolated = this.interpolateStates(before.state, after.state, t);
      
      // Actualizar el estado en el store
      gameStore.dispatch({
        type: 'UPDATE_REMOTE_ENTITY',
        payload: {
          id,
          entity: interpolated,
          interpolated: true
        }
      });
    });
  }
  
  interpolateStates(a, b, t) {
    // Función básica de interpolación lineal
    const result = { ...a };
    
    // Interpolar posición
    if (a.x !== undefined && b.x !== undefined) {
      result.x = a.x + (b.x - a.x) * t;
    }
    if (a.y !== undefined && b.y !== undefined) {
      result.y = a.y + (b.y - a.y) * t;
    }
    
    // Interpolar otras propiedades numéricas
    Object.keys(a).forEach(key => {
      if (typeof a[key] === 'number' && typeof b[key] === 'number' &&
          key !== 'x' && key !== 'y') {
        result[key] = a[key] + (b[key] - a[key]) * t;
      }
    });
    
    return result;
  }
  
  reset() {
    this.entityBuffer.clear();
    this.lastUpdateTime = 0;
  }
}

export const interpolationSystem = new InterpolationSystem();
```

### 6. Adaptación del Game Loop

**Implementación propuesta:**

```javascript
// gameLoop.js
import { gameStore } from './state.js';
import { gameEvents } from './events.js';
import { interpolationSystem } from './interpolation.js';

class GameLoop {
  constructor() {
    this.lastTime = 0;
    this.running = false;
    this.fps = 60;
    this.frameTime = 1000 / this.fps;
    this.accumulator = 0;
  }
  
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
    gameEvents.emit('game-loop-started');
  }
  
  stop() {
    this.running = false;
    gameEvents.emit('game-loop-stopped');
  }
  
  loop(timestamp) {
    if (!this.running) return;
    
    // Calcular delta time
    const now = timestamp;
    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    
    // Actualizar acumulador
    this.accumulator += deltaTime;
    
    // Procesamos la física a paso fijo
    while (this.accumulator >= this.frameTime) {
      this.update(this.frameTime);
      this.accumulator -= this.frameTime;
    }
    
    // Interpolar entidades para renderizado suave
    interpolationSystem.update();
    
    // Renderizar el juego
    this.render();
    
    // Programar siguiente frame
    requestAnimationFrame(this.loop.bind(this));
  }
  
  update(deltaTime) {
    // Emitir evento para que los sistemas se actualicen
    gameEvents.emit('update', deltaTime);
    
    // Ejemplo de sistemas que se actualizarían
    // animationSystem.update(deltaTime);
    // aiSystem.update(deltaTime);
    // combatSystem.update(deltaTime);
  }
  
  render() {
    // Emitir evento para sistemas de renderizado
    gameEvents.emit('render');
    
    // No llamamos directamente a render(), en su lugar
    // los sistemas de renderizado deberían suscribirse al evento 'render'
  }
}

export const gameLoop = new GameLoop();
```

### 7. Sistema de UI para Multijugador

Las principales adiciones necesarias a la interfaz de usuario incluyen:

1. **Pantalla de Login y Registro**

```html
<!-- login.html -->
<div id="login-screen" class="fullscreen-overlay">
  <div class="login-panel">
    <h2>Argentum Online Web</h2>
    
    <div class="tabs">
      <button id="tab-login" class="tab active">Iniciar Sesión</button>
      <button id="tab-register" class="tab">Registrarse</button>
    </div>
    
    <div id="login-form" class="tab-content active">
      <input type="text" id="login-username" placeholder="Usuario">
      <input type="password" id="login-password" placeholder="Contraseña">
      <button id="login-button">Entrar</button>
      <div id="login-error" class="error-message"></div>
    </div>
    
    <div id="register-form" class="tab-content">
      <input type="text" id="register-username" placeholder="Usuario">
      <input type="password" id="register-password" placeholder="Contraseña">
      <input type="password" id="register-confirm" placeholder="Confirmar Contraseña">
      <button id="register-button">Registrarse</button>
      <div id="register-error" class="error-message"></div>
    </div>
  </div>
</div>

<script>
  // Login/Register Controller
  document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
  });
  
  document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-register').classList.add('active');
  });
  
  // Implementar lógica de login/registro conectada con AuthService
</script>
```

2. **Sistema de Chat**

```html
<!-- chat.html -->
<div id="chat-container" class="ui-panel">
  <div id="chat-messages" class="scrollable"></div>
  
  <div id="chat-input-container">
    <select id="chat-channel">
      <option value="global">Global</option>
      <option value="local">Cercano</option>
      <option value="party">Grupo</option>
      <option value="private">Privado</option>
    </select>
    
    <input type="text" id="chat-input" placeholder="Escribe un mensaje...">
    <button id="chat-send">Enviar</button>
  </div>
  
  <div id="chat-tabs">
    <button data-tab="all" class="chat-tab active">Todos</button>
    <button data-tab="global" class="chat-tab">Global</button>
    <button data-tab="local" class="chat-tab">Cercano</button>
    <button data-tab="party" class="chat-tab">Grupo</button>
    <button data-tab="private" class="chat-tab">Privado</button>
  </div>
</div>

<script>
  // ChatController.js
  import { gameEvents } from './events.js';
  import { networkManager } from './network.js';
  
  class ChatController {
    constructor() {
      this.activeTab = 'all';
      this.messages = [];
      this.privateTarget = null;
      
      this.initElements();
      this.initEventListeners();
      
      // Suscribirse a mensajes entrantes
      gameEvents.on('chat-message-received', this.handleIncomingMessage.bind(this));
    }
    
    initElements() {
      this.messagesContainer = document.getElementById('chat-messages');
      this.inputField = document.getElementById('chat-input');
      this.sendButton = document.getElementById('chat-send');
      this.channelSelect = document.getElementById('chat-channel');
      this.tabButtons = document.querySelectorAll('.chat-tab');
    }
    
    initEventListeners() {
      this.sendButton.addEventListener('click', this.sendMessage.bind(this));
      this.inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
      
      this.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.activeTab = button.dataset.tab;
          this.tabButtons.forEach(b => b.classList.remove('active'));
          button.classList.add('active');
          this.renderMessages();
        });
      });
    }
    
    sendMessage() {
      const message = this.inputField.value.trim();
      if (!message) return;
      
      const channel = this.channelSelect.value;
      
      networkManager.sendMessage('CHAT_MESSAGE', {
        channel,
        message,
        targetId: channel === 'private' ? this.privateTarget : null
      });
      
      this.inputField.value = '';
    }
    
    handleIncomingMessage(data) {
      this.messages.push({
        ...data,
        timestamp: Date.now()
      });
      
      // Limitar cantidad de mensajes guardados
      if (this.messages.length > 100) {
        this.messages.shift();
      }
      
      this.renderMessages();
    }
    
    renderMessages() {
      const filteredMessages = this.activeTab === 'all'
        ? this.messages
        : this.messages.filter(msg => msg.channel === this.activeTab);
      
      this.messagesContainer.innerHTML = '';
      
      filteredMessages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.classList.add('chat-message', `channel-${msg.channel}`);
        
        const time = new Date(msg.timestamp).toLocaleTimeString();
        
        messageEl.innerHTML = `
          <span class="time">[${time}]</span>
          <span class="sender">${msg.sender}:</span>
          <span class="text">${this.escapeHtml(msg.message)}</span>
        `;
        
        this.messagesContainer.appendChild(messageEl);
      });
      
      // Scroll al final
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    setPrivateTarget(playerId, playerName) {
      this.privateTarget = playerId;
      this.channelSelect.value = 'private';
      this.inputField.placeholder = `Mensaje a ${playerName}...`;
    }
    
    escapeHtml(text) {
      return text
        .replace(/&/g, "&")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/"/g, """)
        .replace(/'/g, "&#039;");
    }
  }
  
  export const chatController = new ChatController();
</script>
```

3. **Lista de Jugadores**

```html
<!-- playerList.html -->
<div id="players-panel" class="ui-panel">
  <h3>Jugadores Online (<span id="player-count">0</span>)</h3>
  
  <div id="players-list" class="scrollable"></div>
</div>

<script>
  // PlayerListController.js
  import { gameStore } from './state.js';
  import { gameEvents } from './events.js';
  import { chatController } from './chat.js';
  
  class PlayerListController {
    constructor() {
      this.playersContainer = document.getElementById('players-list');
      this.playerCount = document.getElementById('player-count');
      
      // Suscribirse a cambios en jugadores remotos
      gameStore.subscribe('remotePlayers', this.renderPlayerList.bind(this));
      
      // Suscribirse a eventos de jugadores
