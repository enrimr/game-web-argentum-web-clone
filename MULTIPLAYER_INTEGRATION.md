# 🌐 Integración Multijugador - Calima Online

Este documento describe la integración del cliente con el servidor backend para funcionalidad multijugador.

## 📋 Estado Actual

### ✅ Completado

1. **Rama feature/multiplayer creada**
2. **Módulos API creados:**
   - `js/api/ApiClient.js` - Cliente REST para autenticación y personajes
   - `js/api/SocketClient.js` - Cliente WebSocket para tiempo real
3. **LoginScreen.js parcialmente adaptado:**
   - Importación de ApiClient y SocketClient
   - Función `handleLogin()` adaptada para usar backend real

### 🔄 Pendiente

Las siguientes funciones en `LoginScreen.js` necesitan ser adaptadas:

#### 1. Función `loadCharactersFromServer()` (Nueva)
```javascript
/**
 * Cargar personajes desde el servidor
 */
async loadCharactersFromServer() {
    try {
        const response = await apiClient.getCharacters();
        
        if (response.success) {
            // Sincronizar personajes del servidor con characterManager local
            // Los personajes del servidor tienen estructura diferente
            const serverCharacters = response.data;
            
            // Limpiar personajes locales
            characterManager.characters = [];
            
            // Convertir y guardar cada personaje
            serverCharacters.forEach(serverChar => {
                const localChar = this.convertServerCharacterToLocal(serverChar);
                characterManager.characters.push(localChar);
            });
            
            // Guardar en localStorage
            characterManager.save();
        }
    } catch (error) {
        console.error('Error al cargar personajes:', error);
        // Usar personajes locales si falla
    }
}

/**
 * Convertir personaje del servidor a formato local
 */
convertServerCharacterToLocal(serverChar) {
    return {
        id: serverChar._id,
        name: serverChar.name,
        class: serverChar.class,
        race: serverChar.race || 'humano', // Valor por defecto si no existe
        level: serverChar.stats.level,
        experience: serverChar.stats.experience,
        gold: serverChar.stats.gold,
        lastPlayed: serverChar.lastPlayed || new Date().toISOString(),
        appearance: {
            tunicColor: serverChar.appearance?.body || 'blue',
            skinColor: serverChar.appearance?.head || 'fair',
            hairColor: 'brown',
            hairStyle: 'short'
        },
        // Mapear otros campos según sea necesario
        stats: serverChar.stats,
        skills: serverChar.skills,
        inventory: serverChar.inventory,
        equipment: serverChar.equipment
    };
}
```

#### 2. Función `handleRegister()` - Usar API real
```javascript
async handleRegister() {
    // ... validaciones existentes ...
    
    try {
        // Reemplazar el mockup con:
        const response = await apiClient.register(username, email, password);
        
        if (response.success) {
            this.showNotification('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');
            document.getElementById('loginUsername').value = username;
            document.getElementById('loginPassword').value = '';
            this.showPanel('login');
        } else {
            this.showError('registerError', response.message || 'Error al registrar');
        }
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        this.showError('registerError', error.message || 'Error al conectar con el servidor');
    } finally {
        spinner.style.display = 'none';
    }
}
```

#### 3. Función `checkServerStatus()` - Verificar servidor real
```javascript
async checkServerStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('serverStatusText');
    
    try {
        // Intentar verificar el servidor usando /health endpoint
        const response = await fetch(apiClient.baseUrl.replace('/api', '') + '/health');
        const data = await response.json();
        
        if (response.ok && data.success) {
            this.isServerOnline = true;
            statusIndicator.className = 'status-indicator status-online';
            statusText.textContent = 'Servidor online - Conectado';
        } else {
            throw new Error('Servidor offline');
        }
    } catch (error) {
        console.error('Error al comprobar estado del servidor:', error);
        this.isServerOnline = false;
        statusIndicator.className = 'status-indicator status-offline';
        statusText.textContent = 'Servidor offline - Modo local disponible';
        document.getElementById('playOnlineButton').disabled = true;
    }
}
```

#### 4. Función `handleCreateCharacter()` - Crear en servidor
```javascript
async handleCreateCharacter() {
    // ... validaciones existentes ...
    
    try {
        // Verificar nombre disponible en servidor
        const nameCheck = await apiClient.checkNameAvailability(data.name);
        if (!nameCheck.available) {
            this.showError('createCharacterError', 'El nombre no está disponible');
            return;
        }
        
        // Crear personaje en servidor
        const appearance = {
            body: parseInt(data.tunicColor) || 1,
            head: parseInt(data.skinColor) || 1,
            heading: 3
        };
        
        const response = await apiClient.createCharacter(
            data.name,
            data.class,
            appearance
        );
        
        if (response.success) {
            // Añadir a characterManager local
            const localChar = this.convertServerCharacterToLocal(response.data);
            characterManager.characters.push(localChar);
            characterManager.save();
            
            this.showNotification(`¡Personaje ${response.data.name} creado exitosamente!`, 'success');
            this.showCharacterSelection();
        } else {
            this.showError('createCharacterError', response.message || 'Error al crear personaje');
        }
    } catch (error) {
        this.showError('createCharacterError', error.message);
    } finally {
        spinner.style.display = 'none';
    }
}
```

#### 5. Función `playWithCharacter()` - Conectar WebSocket
```javascript
async playWithCharacter(characterId) {
    const character = characterManager.getCharacterById(characterId);
    
    if (!character) {
        this.showNotification('Error: Personaje no encontrado', 'error');
        return;
    }

    try {
        // Seleccionar personaje en el servidor
        const response = await apiClient.selectCharacter(character.id);
        
        if (response.success) {
            // Establecer como personaje activo localmente
            characterManager.setActiveCharacter(character);
            
            // Conectar WebSocket
            socketClient.connect(this.token);
            
            // Configurar listeners de eventos
            this.setupSocketListeners(character.id);
            
            // Iniciar juego online
            this.startOnlineGame();
        } else {
            this.showNotification('Error al seleccionar personaje', 'error');
        }
    } catch (error) {
        console.error('Error al seleccionar personaje:', error);
        this.showNotification('Error al conectar con el servidor', 'error');
    }
}

/**
 * Configurar listeners de WebSocket
 */
setupSocketListeners(characterId) {
    // Cuando se conecte exitosamente
    socketClient.on('connected', () => {
        console.log('WebSocket conectado, uniéndose al juego...');
        socketClient.joinGame(characterId);
    });
    
    // Cuando se una al juego exitosamente
    socketClient.on('game_joined', (data) => {
        console.log('¡Unido al juego!', data);
        // El juego ya debe estar iniciado en este punto
    });
    
    // Cuando otro jugador se una
    socketClient.on('player_joined', (data) => {
        console.log('Jugador se unió:', data.username);
        // Aquí el Game.js debe manejar añadir el jugador al mapa
    });
    
    // Cuando otro jugador se mueva
    socketClient.on('player_moved', (data) => {
        // Actualizar posición del jugador en el juego
    });
    
    // Cuando otro jugador salga
    socketClient.on('player_left', (data) => {
        console.log('Jugador salió:', data.socketId);
        // Remover jugador del mapa
    });
    
    // Mensajes de chat
    socketClient.on('chat_message', (data) => {
        // Mostrar mensaje en el chat del juego
    });
    
    // Errores del servidor
    socketClient.on('server_error', (data) => {
        console.error('Error del servidor:', data.message);
        this.showNotification(data.message, 'error');
    });
}
```

#### 6. Función `deleteCharacter()` - Eliminar del servidor
```javascript
async deleteCharacter(characterId) {
    const character = characterManager.getCharacterById(characterId);
    
    if (!character) {
        this.showNotification('Error: Personaje no encontrado', 'error');
        return;
    }

    const confirmed = await this.showConfirm(`¿Estás seguro de que quieres eliminar a <strong>${character.name}</strong>?<br><small>Esta acción no se puede deshacer.</small>`);
    
    if (confirmed) {
        try {
            // Eliminar del servidor
            const response = await apiClient.deleteCharacter(character.id);
            
            if (response.success) {
                // Eliminar localmente
                characterManager.deleteCharacter(characterId);
                this.showNotification(`Personaje ${character.name} eliminado`, 'info');
                this.renderCharactersList();
            } else {
                this.showNotification('Error al eliminar personaje', 'error');
            }
        } catch (error) {
            console.error('Error al eliminar personaje:', error);
            this.showNotification('Error al conectar con el servidor', 'error');
        }
    }
}
```

#### 7. Actualizar `logout()` - Desconectar WebSocket
```javascript
logout() {
    // Desconectar WebSocket si está conectado
    if (socketClient.isSocketConnected()) {
        socketClient.disconnect();
    }
    
    // Cerrar sesión en API
    apiClient.logout();
    
    this.token = null;
    this.user = null;
    
    // Mostrar las tabs de login y registro de nuevo
    const loginTabs = document.querySelector('.login-tabs');
    if (loginTabs) {
        loginTabs.style.display = 'flex';
    }
    
    // Volver al panel de inicio
    this.showPanel('home');
}
```

## 🔌 Integración con Game.js

El `Game.js` necesita ser actualizado para:

### 1. Detectar Modo Online
```javascript
constructor() {
    // ...
    this.isOnlineMode = false;
    this.onlinePlayers = new Map(); // socketId -> player data
    
    // Escuchar evento de login-complete con datos de online
    window.addEventListener('login-complete', (e) => {
        if (e.detail && e.detail.online) {
            this.isOnlineMode = true;
            this.onlineToken = e.detail.token;
            this.onlineUser = e.detail.user;
            // WebSocket ya debe estar conectado en este punto
        }
    });
}
```

### 2. Sincronizar Movimiento
```javascript
movePlayer(newX, newY) {
    // ... movimiento local existente ...
    
    // Si está en modo online, enviar movimiento al servidor
    if (this.isOnlineMode && socketClient.isSocketConnected()) {
        socketClient.sendPlayerMove(newX, newY);
    }
}
```

### 3. Renderizar Jugadores Online
```javascript
render() {
    // ... renderizado existente ...
    
    // Renderizar jugadores online
    if (this.isOnlineMode) {
        this.renderOnlinePlayers();
    }
}

renderOnlinePlayers() {
    for (const [socketId, playerData] of this.onlinePlayers) {
        if (socketId !== socketClient.getSocketId()) { // No renderizar a sí mismo
            // Renderizar sprite del jugador en su posición
            const screenX = (playerData.position.x - this.camera.x) * this.TILE_SIZE;
            const screenY = (playerData.position.y - this.camera.y) * this.TILE_SIZE;
            
            // Renderizar jugador
            // ... código de renderizado ...
        }
    }
}
```

### 4. Actualizar Stats Periódicamente
```javascript
// En el update loop, cada 5 segundos aproximadamente
if (this.isOnlineMode && this.updateCounter % 300 === 0) {
    socketClient.updateStats(
        this.player.stats,
        this.player.inventory,
        this.player.equipment
    );
}
```

## 📦 Dependencias del Cliente

Añadir Socket.io client al `index.html`:

```html
<!-- Antes de cargar el juego -->
<script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
```

## 🚀 Configuración

1. **Configurar URL del servidor en `ApiClient.js`:**
```javascript
this.baseUrl = 'http://localhost:3000/api'; // Desarrollo local
// o
this.baseUrl = 'https://tu-servidor.com/api'; // Producción
```

2. **Configurar URL de WebSocket en `SocketClient.js`:**
```javascript
this.serverUrl = 'http://localhost:3000'; // Desarrollo
// o
this.serverUrl = 'https://tu-servidor.com'; // Producción
```

## 🧪 Testing

### Test de Login/Registro
1. Iniciar servidor backend: `cd calima-online-server && npm run dev`
2. Abrir cliente: `http://localhost:8080`
3. Intentar registrar usuario nuevo
4. Iniciar sesión con usuario creado

### Test de Personajes
1. Crear personaje nuevo
2. Verificar que aparece en la lista
3. Seleccionar personaje y jugar
4. Verificar conexión WebSocket en consola del navegador

### Test de Multijugador
1. Abrir dos navegadores/pestañas
2. Iniciar sesión con diferentes usuarios
3. Crear personajes y jugar
4. Verificar que los jugadores se ven entre sí en el mapa
5. Mover personajes y verificar sincronización

## 📝 Notas Adicionales

- El sistema actual guarda personajes localmente en localStorage
- Para modo online, se sincronizan con el servidor pero se mantiene caché local
- Si el servidor no está disponible, el juego puede funcionar en modo local
- Los mapas compartidos entre jugadores deben sincronizarse por el nombre del mapa

## 🐛 Debugging

Activar logs detallados:
```javascript
// En ApiClient.js
console.log('API Request:', endpoint, options);
console.log('API Response:', data);

// En SocketClient.js  
console.log('Socket Event:', event, data);
```

---

**Última actualización:** 28/01/2026