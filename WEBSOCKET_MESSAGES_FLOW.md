# Flujo de Mensajes WebSocket - Calima Online

## Escenario: Jugador B entra a un mapa donde ya está el Jugador A

### 1️⃣ Jugador A Ya Conectado

**Jugador A** ya recibió su `game_joined` cuando entró:

```javascript
// Mensaje que recibió Jugador A al conectarse
{
  event: 'game_joined',
  data: {
    characterData: {
      _id: "abc123",
      name: "JugadorA",
      class: "guerrero",
      stats: { level: 5, hp: 100, maxHp: 100, ... },
      position: { x: 45, y: 50, map: "newbie_city" },
      appearance: { body: 1, head: 2, heading: 3, ... },
      // ... resto de datos del personaje
    },
    onlinePlayers: [], // Lista vacía - nadie más en el mapa
    startPosition: { x: 45, y: 50, map: "newbie_city" }
  }
}
```

---

### 2️⃣ Jugador B Se Conecta

#### A. Jugador B Recibe `game_joined`

**El servidor envía a Jugador B:**

```javascript
// server.js línea ~90
socket.emit('game_joined', {
  characterData: {
    _id: "xyz789",
    name: "JugadorB",
    class: "mago",
    stats: { level: 3, hp: 80, maxHp: 80, mana: 50, maxMana: 50, ... },
    position: { x: 48, y: 52, map: "newbie_city" },
    appearance: { body: 2, head: 1, heading: 3, ... },
    // ... resto de datos
  },
  onlinePlayers: [
    {
      socketId: "socket-123-abc",  // ← Socket ID de Jugador A
      username: "JugadorA",
      position: { x: 45, y: 50, map: "newbie_city" },
      class: "guerrero",
      level: 5,
      appearance: { body: 1, head: 2, heading: 3, ... },
      equipment: { weapon: {...}, armor: {...}, ... },
      race: "human",
      hp: 100,
      maxHp: 100,
      isAlive: true,
      isGhost: false,
      faction: "ciudadano"
    }
    // ← Lista con TODOS los jugadores YA en el mapa (excepto él mismo)
  ],
  startPosition: { x: 48, y: 52, map: "newbie_city" }
});
```

**Código del servidor (server.js ~línea 90):**
```javascript
socket.emit('game_joined', {
  characterData: character,
  onlinePlayers: getPlayersInMap(playerData.map, socket.id), // ← EXCLUYE el propio
  startPosition: savedPosition
});
```

#### B. Jugador A Recibe `player_joined`

**Simultáneamente, el servidor envía a TODOS los demás jugadores en el mapa (Jugador A):**

```javascript
// server.js línea ~100
socket.to(playerData.map).emit('player_joined', {
  socketId: "socket-456-xyz",  // ← Socket ID de Jugador B (el nuevo)
  username: "JugadorB",
  position: { x: 48, y: 52, map: "newbie_city" },
  class: "mago",
  level: 3,
  appearance: { body: 2, head: 1, heading: 3, ... },
  equipment: { weapon: {...}, armor: {...}, ... },
  race: "human",
  hp: 80,
  maxHp: 80,
  isAlive: true,
  isGhost: false,
  faction: "ciudadano"
});
```

---

### 3️⃣ Resumen de Mensajes

| Jugador | Mensaje Recibido | Contenido |
|---------|-----------------|-----------|
| **Jugador B** (nuevo) | `game_joined` | Su propia info + lista de jugadores existentes |
| **Jugador A** (existente) | `player_joined` | Info del nuevo jugador (Jugador B) |

---

## Estructura Completa de `getPlayersInMap()`

**Función que genera la lista de jugadores (server.js ~línea 350):**

```javascript
function getPlayersInMap(mapName, excludeSocketId = null) {
  const players = [];
  for (const [socketId, player] of connectedPlayers) {
    // EXCLUIR el jugador especificado (el que está consultando)
    if (socketId === excludeSocketId) {
      continue;
    }
    
    // Solo jugadores en el mismo mapa
    if (player.map === mapName) {
      players.push({
        socketId,                    // Socket ID único
        username: player.username,   // Nombre del personaje
        position: player.position,   // { x, y, map }
        class: player.class,         // Clase
        level: player.level,         // Nivel
        appearance: player.appearance, // Apariencia completa
        equipment: player.equipment,   // Equipamiento
        race: player.race,            // Raza (string)
        hp: player.hp,                // HP actual
        maxHp: player.maxHp,          // HP máximo
        isAlive: player.isAlive,      // Vivo/muerto
        isGhost: player.isGhost,      // Modo fantasma
        faction: player.faction       // Facción
      });
    }
  }
  return players;
}
```

---

## Otros Mensajes de Sincronización

### Movimiento de Jugadores

Cuando Jugador A se mueve:

```javascript
// A todos en el mapa EXCEPTO Jugador A
socket.to(player.map).emit('player_moved', {
  socketId: "socket-123-abc",
  position: { x: 46, y: 51, map: "newbie_city" }
});
```

### Cambio de Mapa

Cuando Jugador B cambia de mapa:

```javascript
// A Jugador B: Lista de jugadores en el NUEVO mapa
socket.emit('map_changed', {
  newMap: "dark_forest",
  playersInMap: [/* jugadores en dark_forest */]
});

// Al mapa ANTERIOR: Notificar salida
socket.to(oldMap).emit('player_left', {
  socketId: "socket-456-xyz"
});

// Al mapa NUEVO: Notificar entrada
socket.to(newMap).emit('player_joined', {
  socketId: "socket-456-xyz",
  username: "JugadorB",
  // ... datos completos
});
```

### Desconexión

Cuando Jugador A se desconecta:

```javascript
// A todos en el mapa
socket.to(player.map).emit('player_left', {
  socketId: "socket-123-abc"
});
```

---

## Filtrado en el Cliente

### SocketClient.js

```javascript
socket.on('player_joined', (data) => {
  // FILTRADO NIVEL 1: SocketClient
  if (data.socketId === this.mySocketId) {
    console.log('🚫 Ignorando player_joined de mi mismo jugador');
    return; // NO emite el evento local
  }
  
  // Solo si NO es el propio jugador, emite a los listeners
  this.emit('player_joined', data);
});
```

### Game.js

```javascript
socketClient.on('player_joined', (data) => {
  // FILTRADO NIVEL 2: Game.js (por seguridad)
  if (socketClient.isMySocketId(data.socketId)) {
    return;
  }
  
  // Crear y añadir jugador
  const onlinePlayer = new OnlinePlayer(data);
  gameState.onlinePlayers.set(data.socketId, onlinePlayer);
});
```

---

## Ejemplo Completo: 3 Jugadores

### Estado Inicial: Mapa vacío

| Jugador | Estado |
|---------|--------|
| Ninguno | - |

### 1. Jugador A entra

**Jugador A recibe:**
```javascript
game_joined: {
  characterData: { name: "JugadorA", ... },
  onlinePlayers: [],  // ← Lista vacía
  startPosition: { x: 45, y: 50 }
}
```

### 2. Jugador B entra

**Jugador B recibe:**
```javascript
game_joined: {
  characterData: { name: "JugadorB", ... },
  onlinePlayers: [
    { socketId: "A", username: "JugadorA", ... }  // ← Ve a Jugador A
  ],
  startPosition: { x: 48, y: 52 }
}
```

**Jugador A recibe:**
```javascript
player_joined: {
  socketId: "B",
  username: "JugadorB",
  position: { x: 48, y: 52 },
  ...
}
```

### 3. Jugador C entra

**Jugador C recibe:**
```javascript
game_joined: {
  characterData: { name: "JugadorC", ... },
  onlinePlayers: [
    { socketId: "A", username: "JugadorA", ... },  // ← Ve a Jugador A
    { socketId: "B", username: "JugadorB", ... }   // ← Ve a Jugador B
  ],
  startPosition: { x: 50, y: 48 }
}
```

**Jugador A y B reciben:**
```javascript
player_joined: {
  socketId: "C",
  username: "JugadorC",
  position: { x: 50, y: 48 },
  ...
}
```

---

## Logs de Debugging

Con los cambios implementados, verás en la consola:

### Jugador B (nuevo entrante)

```
✅ WebSocket conectado, uniéndose al juego...
🎮 ¡Unido al juego! Recibidos datos del servidor
📊 Jugadores online recibidos del servidor: 1
👥 Lista de jugadores existentes en el mapa:
  - JugadorA (socket-123-abc) en (45, 50)
💾 Guardando datos del servidor antes de iniciar el juego...
🚀 Iniciando juego con datos precargados...
📦 Datos de multiplayer ya disponibles, procesándolos...
🔄 Procesando datos precargados de multiplayer...
📋 Lista precargada con 1 jugadores
🔄 Procesando jugador precargado 1/1: { username: "JugadorA", ... }
✨ Creando OnlinePlayer para: JugadorA
👤 Jugador online cargado: JugadorA en (45, 50)
✅ Total jugadores online precargados: 1
```

### Jugador A (ya conectado)

```
🔵 EVENTO player_joined recibido: { username: "JugadorB", ... }
🔵 gameState.onlinePlayers antes: 0
✨ Creando OnlinePlayer para: JugadorB
🔵 gameState.onlinePlayers después: 1
👤 Nuevo jugador: JugadorB en (48, 52)
```

---

## Puntos Clave

1. ✅ **`game_joined`** solo se envía AL JUGADOR que entra
2. ✅ **`onlinePlayers`** en `game_joined` contiene TODOS los jugadores YA en el mapa
3. ✅ **`player_joined`** se envía a TODOS los demás (broadcast)
4. ✅ El servidor EXCLUYE al propio jugador en `getPlayersInMap()`
5. ✅ El cliente FILTRA por socketId en múltiples niveles
6. ✅ Ahora los datos se cargan ANTES de iniciar la interfaz