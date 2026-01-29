# Sistema de Sincronización de Jugadores por Mapa

## Descripción General

Este documento describe el sistema mejorado de sincronización de jugadores en modo multijugador, específicamente cómo se manejan los jugadores cuando entran a un mapa (ya sea por login inicial o por cambio de mapa).

## Problema Resuelto

**Problema anterior:** Cuando un jugador cambiaba de mapa, no recibía información sobre los jugadores que ya estaban en ese mapa. Solo veía jugadores que se unían después de él.

**Solución implementada:** Sistema que envía la lista completa de jugadores en el mapa objetivo cuando un jugador:
- Hace login inicial (evento `game_joined`)
- Cambia de mapa (evento `map_changed`)

## Arquitectura del Sistema

### 1. Flujo de Login Inicial

```
Cliente                    Servidor
  |                           |
  |------ join_game --------->|
  |                           |
  |                           | - Marca personaje online
  |                           | - Guarda datos del jugador
  |                           | - Une al socket a sala del mapa
  |                           | - Obtiene lista de jugadores (excluyendo al propio)
  |                           |
  |<----- game_joined --------|
  |    {                      |
  |      characterData,       |
  |      onlinePlayers: [...],|
  |      startPosition        |
  |    }                      |
  |                           |
  | - Carga estado completo   |
  | - Renderiza jugadores     |
```

**Código clave en servidor (`server.js`):**
```javascript
socket.emit('game_joined', {
  characterData: character,
  onlinePlayers: getPlayersInMap(playerData.map, socket.id), // Excluye propio
  startPosition: savedPosition
});
```

**Código clave en cliente (`Game.js`):**
```javascript
event.detail.onlinePlayers.forEach(playerData => {
  if (playerData.socketId === mySocketId) return; // Filtrar propio
  
  const onlinePlayer = new OnlinePlayer(playerData);
  gameState.onlinePlayers.set(playerData.socketId, onlinePlayer);
});
```

### 2. Flujo de Cambio de Mapa

```
Cliente                    Servidor                    Otros Clientes
  |                           |                              |
  |---- player_move --------->|                              |
  |    (con nuevo mapa)       |                              |
  |                           |                              |
  |                           | - Cambia sala del socket     |
  |                           | - Notifica salida al mapa anterior
  |                           |                              |
  |                           |-------- player_left -------->|
  |                           |                              |
  |                           | - Notifica entrada al nuevo mapa
  |                           |                              |
  |                           |-------- player_joined ------>|
  |                           |                              |
  |                           | - Obtiene lista de jugadores |
  |<----- map_changed --------|                              |
  |    {                      |                              |
  |      newMap,              |                              |
  |      playersInMap: [...]  |                              |
  |    }                      |                              |
  |                           |                              |
  | - Limpia jugadores viejos |                              |
  | - Carga jugadores nuevos  |                              |
```

**Código clave en servidor (`server.js`):**
```javascript
if (map && map !== player.map) {
  const oldMap = player.map;
  
  socket.leave(oldMap);
  socket.join(map);
  
  socket.to(oldMap).emit('player_left', { socketId: socket.id });
  
  player.map = map;
  
  socket.to(map).emit('player_joined', { ...playerData });
  
  // NUEVO: Enviar lista de jugadores en el nuevo mapa
  socket.emit('map_changed', {
    newMap: map,
    playersInMap: getPlayersInMap(map, socket.id)
  });
}
```

**Código clave en cliente (`Game.js`):**
```javascript
socketClient.on('map_changed', (data) => {
  // Limpiar jugadores del mapa anterior
  gameState.onlinePlayers.clear();
  
  // Cargar jugadores del nuevo mapa
  data.playersInMap.forEach(playerData => {
    if (playerData.socketId === mySocketId) return; // Filtrar propio
    
    const onlinePlayer = new OnlinePlayer(playerData);
    gameState.onlinePlayers.set(playerData.socketId, onlinePlayer);
  });
});
```

## Archivos Modificados

### 1. Servidor (`calima-online-server/src/server.js`)

**Cambios:**
- Evento `player_move`: Añadido envío de `map_changed` con lista de jugadores
- Función `getPlayersInMap`: Ya existente, reutilizada para ambos casos

### 2. Cliente WebSocket (`calima-online-client/js/api/SocketClient.js`)

**Cambios:**
- Añadido listener para evento `map_changed`
- Emite el evento a los handlers registrados

### 3. Game Manager (`calima-online-client/js/core/Game.js`)

**Cambios:**
- Añadido handler para evento `map_changed`
- Implementa lógica de limpieza y recarga de jugadores
- Muestra mensaje informativo en chat

## Características Clave

### 1. Filtrado del Jugador Propio

**Problema:** Sin filtrado, el jugador se vería a sí mismo como otro jugador online.

**Solución:** Triple capa de filtrado:

1. **Servidor:** `getPlayersInMap(map, socket.id)` excluye el socketId proporcionado
2. **SocketClient:** Verifica `data.socketId === this.mySocketId` en eventos
3. **Game.js:** Verifica adicional por seguridad

```javascript
// En servidor
function getPlayersInMap(mapName, excludeSocketId = null) {
  const players = [];
  for (const [socketId, player] of connectedPlayers) {
    if (socketId === excludeSocketId) continue; // EXCLUIR
    if (player.map === mapName) {
      players.push({...});
    }
  }
  return players;
}

// En cliente
if (playerData.socketId === mySocketId) {
  console.log('🚫 Ignorando jugador propio');
  return;
}
```

### 2. Información Completa del Jugador

Cada jugador en la lista incluye:
- `socketId`: Identificador único
- `username`: Nombre del personaje
- `position`: {x, y, map}
- `class`: Clase del personaje
- `level`: Nivel
- `appearance`: Apariencia personalizada
- `equipment`: Equipamiento
- `race`: Raza (human, dwarf, creature)
- `hp`, `maxHp`: Puntos de vida
- `isAlive`, `isGhost`: Estado vital
- `faction`: Facción

### 3. Limpieza de Jugadores Anteriores

Cuando se cambia de mapa:
```javascript
gameState.onlinePlayers.clear(); // Limpiar todos los jugadores
```

Esto evita que jugadores del mapa anterior se queden "fantasma" en el nuevo mapa.

### 4. Mensajes de Chat Informativos

```javascript
if (gameState.onlinePlayers.size > 0) {
  addChatMessage('system', `🗺️ Hay ${gameState.onlinePlayers.size} jugador(es) en este mapa`);
}
```

## Casos de Uso

### Caso 1: Jugador A hace login en un mapa con Jugadores B y C
1. Jugador A envía `join_game`
2. Servidor responde con `game_joined` incluyendo lista [B, C]
3. Jugador A renderiza a B y C
4. Jugadores B y C reciben `player_joined` con datos de A
5. Jugadores B y C renderizan a A

### Caso 2: Jugador A cambia del Mapa 1 al Mapa 2 donde está Jugador D
1. Jugador A envía `player_move` con nuevo mapa
2. Servidor notifica a Mapa 1 con `player_left`
3. Servidor notifica a Mapa 2 con `player_joined`
4. Servidor envía a A `map_changed` con lista [D]
5. Jugador A limpia su lista y añade a D
6. Jugador D ya tiene a A por `player_joined`

### Caso 3: Dos jugadores cambian de mapa casi simultáneamente
1. Ambos reciben `map_changed` con la lista actualizada
2. Ambos reciben `player_joined` del otro
3. El sistema de filtrado previene duplicados

## Debugging

### Mensajes de Consola

**Servidor:**
```
✅ PlayerName se unió al mapa newbie_city en posición (25, 15)
🗺️ PlayerName cambió de field a newbie_city, enviando lista de 2 jugadores
```

**Cliente:**
```
🔑 Mi socketId: abc123
👤 Jugador online cargado: OtherPlayer en (30, 20)
✅ Total jugadores online cargados: 2
🗺️ EVENTO map_changed recibido: { newMap: 'city', playersInMap: [...] }
🧹 Jugadores del mapa anterior limpiados
👤 Jugador cargado en nuevo mapa: ThirdPlayer en (50, 50)
✅ Total jugadores en nuevo mapa: 1
```

## Configuración

Las posiciones iniciales de spawn se configuran en `calima-online-server/src/config/gameConfig.js`:

```javascript
spawn: {
  defaultMap: 'newbie_city',
  defaultX: 25,  // Posición X inicial
  defaultY: 15,  // Posición Y inicial
  safeZoneRadius: 10
}
```

## Mejoras Futuras

1. **Caché de Jugadores:** Mantener caché de jugadores vistos recientemente
2. **Predicción de Movimiento:** Interpolar movimientos entre actualizaciones
3. **Optimización de Ancho de Banda:** Enviar solo deltas en lugar de estado completo
4. **Zonas de Interés:** Enviar solo jugadores en radio visible
5. **Priorización:** Actualizar jugadores cercanos con mayor frecuencia

## Notas Técnicas

- El sistema usa Socket.io rooms para agrupar jugadores por mapa
- Los eventos son filtrados en múltiples capas para garantizar corrección
- La lista de jugadores se actualiza inmediatamente al cambiar de mapa
- No se requiere polling, todo es event-driven
- Compatible con reconexiones automáticas de Socket.io

## Testing

Para probar el sistema:

1. **Login simultáneo:** Dos clientes hacen login, verificar que se ven
2. **Cambio de mapa:** Un jugador cambia de mapa, verificar lista actualizada
3. **Desconexión:** Un jugador se desconecta, verificar que desaparece
4. **Reconexión:** Un jugador se reconecta, verificar que vuelve a aparecer
5. **Múltiples mapas:** Jugadores en diferentes mapas no deben verse

---

**Última actualización:** 29/01/2026
**Autor:** Sistema de Sincronización Multijugador Calima Online