# Implementación de Filtro de Eventos Propios en Multiplayer

## Fecha: 29/01/2026

## Objetivo
Implementar filtrado de eventos propios del jugador para evitar:
- Ver al propio jugador como otro jugador online
- Procesar eventos de movimiento propios
- Duplicación de jugadores en el mapa
- Procesar eventos redundantes

## Cambios Realizados

### 1. SocketClient.js

#### Almacenamiento del socketId propio
```javascript
constructor() {
    // ...
    this.mySocketId = null; // Para almacenar el socketId propio
}
```

#### Captura del socketId al conectar
```javascript
this.socket.on('connect', () => {
    console.log('✅ Conectado al servidor WebSocket');
    this.isConnected = true;
    this.mySocketId = this.socket.id; // Guardar socketId propio
    console.log('🔑 Mi socketId:', this.mySocketId);
    this.emit('connected');
});
```

#### Filtrado de evento player_joined
```javascript
this.socket.on('player_joined', (data) => {
    // FILTRAR: No procesar si es nuestro propio jugador
    if (data.socketId === this.mySocketId) {
        console.log('🚫 Ignorando player_joined de mi mismo jugador:', data.username);
        return;
    }
    console.log('👤 Jugador se unió:', data.username);
    this.emit('player_joined', data);
});
```

#### Filtrado de evento player_moved
```javascript
this.socket.on('player_moved', (data) => {
    // FILTRAR: No procesar si es nuestro propio movimiento
    if (data.socketId === this.mySocketId) {
        // No hacer nada, es nuestro propio movimiento
        return;
    }
    this.emit('player_moved', data);
});
```

#### Método auxiliar isMySocketId()
```javascript
/**
 * Verificar si un socketId es el propio
 * @param {string} socketId - Socket ID a verificar
 * @returns {boolean} True si es el propio jugador
 */
isMySocketId(socketId) {
    return socketId === this.mySocketId;
}
```

#### Limpieza en disconnect
```javascript
disconnect() {
    if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
        this.characterId = null;
        this.mySocketId = null; // Limpiar socketId propio
    }
}
```

### 2. Game.js

#### Filtrado en evento multiplayer-ready
```javascript
window.addEventListener('multiplayer-ready', (event) => {
    // ...
    
    // Obtener mi socketId para filtrar
    const mySocketId = socketClient.getSocketId();
    console.log('🔑 Mi socketId para filtrado:', mySocketId);
    
    // Cargar jugadores online iniciales (EXCEPTO el propio)
    if (event.detail.onlinePlayers && Array.isArray(event.detail.onlinePlayers)) {
        event.detail.onlinePlayers.forEach(playerData => {
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
            
            const onlinePlayer = new OnlinePlayer(playerData);
            gameState.onlinePlayers.set(playerData.socketId, onlinePlayer);
            console.log(`👤 Jugador online cargado: ${playerData.username} en (${playerData.position.x}, ${playerData.position.y})`);
        });
    }
    // ...
});
```

#### Filtrado en setupMultiplayerListeners
```javascript
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
    // ...
});
```

## Garantías de la Implementación

### ✅ Filtrado en múltiples capas
1. **Capa 0 (Servidor)**: La lista inicial de jugadores YA excluye al propio jugador
2. **Capa 1 (SocketClient)**: Eventos `player_joined` y `player_moved` se filtran antes de emitirse
3. **Capa 2 (Game.js - multiplayer-ready)**: Lista inicial de jugadores se filtra al cargar (redundante pero por seguridad)
4. **Capa 3 (Game.js - player_joined)**: Verificación adicional por seguridad

### ✅ Prevención de duplicados
- Verificación con `gameState.onlinePlayers.has()` antes de añadir jugadores
- Logs de advertencia cuando se detecta un intento de duplicación

### ✅ Identificación robusta
- `mySocketId` se captura al conectar
- Se verifica también en `game_joined` como fallback
- Método `isMySocketId()` para verificaciones consistentes

### ✅ Limpieza apropiada
- `mySocketId` se limpia en `disconnect()`
- Sincronización correcta del ciclo de vida

## Flujo de Eventos

```
1. Jugador se conecta al servidor
   ↓
2. Socket.IO asigna socketId
   ↓
3. SocketClient guarda mySocketId
   ↓
4. Jugador hace join_game
   ↓
5. Servidor envía lista de jugadores online
   ↓
6. Cliente filtra su propio socketId de la lista
   ↓
7. Otros jugadores se cargan en gameState.onlinePlayers
   ↓
8. Eventos futuros (player_joined, player_moved) se filtran automáticamente
```

## Logs para Debugging

### Logs de filtrado exitoso:
```
🔑 Mi socketId: abc123
🚫 Ignorando jugador propio en lista inicial: NombreJugador
🚫 Ignorando player_joined de mi mismo jugador: NombreJugador
```

### Logs de verificación de duplicados:
```
⚠️ Jugador ya existe en la lista: NombreJugador
```

### Logs de carga de jugadores:
```
👤 Jugador online cargado: OtroJugador en (15, 20)
✅ Total jugadores online cargados: 3
```

## Cambios en el Servidor

### 3. server.js

#### Función getPlayersInMap modificada
```javascript
function getPlayersInMap(mapName, excludeSocketId = null) {
  const players = [];
  for (const [socketId, player] of connectedPlayers) {
    // Excluir el jugador especificado (típicamente el que está consultando)
    if (socketId === excludeSocketId) {
      continue;
    }
    
    if (player.map === mapName) {
      players.push({
        socketId,
        username: player.username,
        position: player.position,
        class: player.class,
        level: player.level,
        appearance: player.appearance,
        equipment: player.equipment,
        race: player.race
      });
    }
  }
  return players;
}
```

#### Uso en join_game
```javascript
// Notificar al jugador que se unió exitosamente
// IMPORTANTE: Excluir el propio jugador de la lista
socket.emit('game_joined', {
  characterData: character,
  onlinePlayers: getPlayersInMap(playerData.map, socket.id)
});
```

## Próximos Pasos

- ✅ Filtrado de eventos propios implementado (cliente)
- ✅ Filtrado en servidor para lista inicial
- ✅ Prevención de duplicados implementada
- ⏳ Pruebas con múltiples jugadores
- ⏳ Verificar sincronización de cambios de mapa
- ⏳ Pruebas de reconexión y manejo de desconexión

## Notas Técnicas

### Por qué múltiples capas de filtrado:
- **Defensa en profundidad**: Si falla una capa, las otras previenen problemas
- **Claridad en logs**: Podemos identificar dónde se detecta un problema
- **Facilita debugging**: Múltiples puntos de verificación

### Rendimiento:
- Las verificaciones son O(1) (comparación de strings y Map.has())
- Impacto mínimo en el rendimiento
- Los logs pueden deshabilitarse en producción

## Conclusión

La implementación garantiza que:
1. **Un jugador nunca se ve a sí mismo como otro jugador online**
   - El servidor excluye al jugador de la lista inicial
   - El cliente filtra eventos propios en múltiples capas
2. **Los eventos propios no se procesan redundantemente**
   - Filtrado en SocketClient antes de emitir eventos
3. **No puede haber jugadores duplicados en el mapa**
   - Verificación con `gameState.onlinePlayers.has()` antes de añadir
4. **El sistema es robusto con defensa en profundidad**
   - 4 capas de filtrado (servidor + 3 en cliente)
   - Cada capa es independiente, si una falla las otras protegen

## Arquitectura de Filtrado Completa

```
┌─────────────────────────────────────────────────────────┐
│ SERVIDOR (server.js)                                    │
│                                                         │
│ 1. join_game recibe solicitud                          │
│ 2. Añade jugador a connectedPlayers                    │
│ 3. getPlayersInMap(map, socket.id) ← EXCLUYE PROPIO   │
│ 4. Envía lista SIN el jugador propio                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ CLIENTE - SocketClient.js                              │
│                                                         │
│ 1. Recibe game_joined con lista filtrada              │
│ 2. Guarda mySocketId = socket.id                      │
│ 3. Filtra player_joined si socketId === mySocketId    │
│ 4. Filtra player_moved si socketId === mySocketId     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ CLIENTE - Game.js (multiplayer-ready)                  │
│                                                         │
│ 1. Recibe lista de jugadores                           │
│ 2. Verifica mySocketId de cada jugador                │
│ 3. Ignora si socketId === mySocketId (redundante)     │
│ 4. Verifica que no exista ya en gameState             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ CLIENTE - Game.js (player_joined)                      │
│                                                         │
│ 1. Verificación final por seguridad                    │
│ 2. isMySocketId() check                               │
│ 3. Verificación de duplicados                         │
└─────────────────────────────────────────────────────────┘
```
