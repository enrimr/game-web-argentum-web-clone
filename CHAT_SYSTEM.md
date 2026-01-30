# Sistema de Chat Multiplayer - Calima Online

## Descripción General

Sistema de chat completo implementado para el modo multiplayer de Calima Online con 4 tipos de mensajes:

1. **Global** - Mensajes que llegan a todos los jugadores online en el servidor
2. **Local/Cercanos** - Mensajes que solo ven los jugadores en el mismo mapa
3. **Grupo** - Mensajes para el grupo/party (futuro, pendiente de implementación)
4. **Privado** - Mensajes directos a un jugador específico

## Arquitectura del Sistema

### Cliente (calima-online-client)

#### Archivos Modificados/Creados

1. **js/ui/Chat.js** - Sistema principal de chat
   - Manejo de tipos de mensajes
   - Envío y recepción de mensajes
   - Mensajes sobre la cabeza de jugadores (overhead messages)
   - Selector de jugadores para mensajes privados

2. **js/api/SocketClient.js** - Cliente WebSocket
   - Listener para mensajes de chat del servidor
   - Método `sendChatMessage()` actualizado con soporte para mensajes privados

3. **js/core/Game.js** - Integración del sistema
   - Listener que conecta eventos de socket con Chat.js
   - Importación dinámica de `receiveChatMessage()`

4. **index.html** - UI del chat
   - Selector de tipo de mensaje actualizado con valores correctos
   - Selector de jugador para mensajes privados

### Servidor (calima-online-server)

#### Archivos Modificados

1. **src/server.js** - Lógica del servidor
   - Handler completo de `chat_message` con switch para cada tipo
   - Validación de destinatarios
   - Broadcast según tipo de mensaje
   - Mensajes de error al cliente

## Tipos de Mensajes Detallados

### 1. Global

**Cliente → Servidor:**
```javascript
{
  message: "Hola a todos!",
  type: "global"
}
```

**Servidor → Clientes:**
```javascript
{
  socketId: "socket-123",
  username: "JugadorA",
  message: "Hola a todos!",
  type: "global",
  timestamp: 1706626800000
}
```

**Comportamiento:**
- El servidor usa `io.emit()` para enviar a TODOS los jugadores
- Llega a jugadores en cualquier mapa
- Color: Blanco (#ffffff)

### 2. Local/Cercanos

**Cliente → Servidor:**
```javascript
{
  message: "Alguien para boss?",
  type: "local"
}
```

**Servidor → Clientes:**
```javascript
{
  socketId: "socket-123",
  username: "JugadorA",
  message: "Alguien para boss?",
  type: "local",
  timestamp: 1706626800000
}
```

**Comportamiento:**
- El servidor usa `io.to(player.map).emit()` 
- Solo jugadores en el mismo mapa lo reciben
- Color: Verde (#00ff00)

### 3. Grupo (Futuro)

**Cliente → Servidor:**
```javascript
{
  message: "Vamos al norte",
  type: "group"
}
```

**Servidor → Cliente (Error):**
```javascript
{
  socketId: "system",
  username: "Sistema",
  message: "Los grupos/parties aún no están implementados. Usa Global o Cercanos.",
  type: "system",
  timestamp: 1706626800000
}
```

**Comportamiento:**
- El servidor envía mensaje de error al remitente
- Funcionalidad pendiente de implementar
- Color previsto: Azul (#0080ff)

### 4. Privado

**Cliente → Servidor:**
```javascript
{
  message: "Hola!",
  type: "private",
  targetSocketId: "socket-456"
}
```

**Servidor → Destinatario:**
```javascript
{
  socketId: "socket-123",
  username: "JugadorA",
  message: "Hola!",
  type: "private",
  timestamp: 1706626800000,
  targetUsername: "JugadorA"  // Quién envió el mensaje
}
```

**Servidor → Remitente (Echo/Confirmación):**
```javascript
{
  socketId: "socket-123",
  username: "JugadorB",  // A quién se envió
  message: "Hola!",
  type: "private",
  timestamp: 1706626800000
}
```

**Comportamiento:**
- El servidor usa `io.to(targetSocketId).emit()` para el destinatario
- Envía confirmación al remitente con `socket.emit()`
- Validación: verifica que el destinatario exista y esté online
- Color: Amarillo (#ffff00)

## Flujo de Mensajes

### Envío de Mensaje

1. **Usuario escribe mensaje** en el input del chat
2. **Selecciona tipo** (Global/Local/Grupo/Privado)
3. **Si es privado**, selecciona jugador del dropdown
4. **Presiona Enter** o click en "Enviar"
5. **Chat.js** llama a `sendChatMessage(message, type, targetSocketId)`
6. **SocketClient** envía por WebSocket al servidor
7. **Servidor** procesa y distribuye según tipo

### Recepción de Mensaje

1. **Servidor envía** evento `chat_message`
2. **SocketClient** recibe en listener
3. **Game.js** captura evento y llama a `receiveChatMessage()`
4. **Chat.js** procesa el mensaje:
   - Genera prefijo según tipo
   - Añade al chat log con CSS apropiado
   - Añade mensaje overhead si el jugador es visible
5. **Usuario ve** mensaje en el chat y/o sobre la cabeza del jugador

## Mensajes Overhead (Sobre la Cabeza)

Los mensajes aparecen sobre la cabeza de los jugadores durante 5 segundos:

```javascript
const MESSAGE_DISPLAY_TIME = 5000; // 5 segundos
```

**Características:**
- Fadeout en el último segundo
- Colores según tipo de mensaje
- Múltiples mensajes se apilan verticalmente
- Se limpian automáticamente al expirar

**Renderizado:**
- Se renderizan en `RendererCore.js` mediante `renderOverheadMessages()`
- Llamado desde el game loop
- Usa canvas 2D context para dibujar

## Interfaz de Usuario

### Selector de Tipo de Mensaje

```html
<select id="chatTargetSelector" class="chat-target-selector">
    <option value="global">Global</option>
    <option value="local">Cercanos</option>
    <option value="group">Grupo</option>
    <option value="private">Jugador</option>
</select>
```

### Selector de Jugador (Mensajes Privados)

```html
<div id="chatPlayerSelectorContainer" style="display: none;">
    <select id="chatPlayerSelector" class="chat-player-selector"></select>
</div>
```

**Actualización dinámica:**
- Se actualiza cuando cambia el tipo a "Privado"
- Lista todos los jugadores online del mapa
- Usa `gameState.onlinePlayers` para obtener la lista

## Validaciones y Manejo de Errores

### Cliente

- Verifica que el socket esté conectado antes de enviar
- Valida que haya jugadores disponibles para mensajes privados
- No permite enviar mensajes vacíos

### Servidor

1. **Validación de Jugador:**
```javascript
const player = connectedPlayers.get(socket.id);
if (!player) return;
```

2. **Validación de Destinatario (Privado):**
```javascript
if (!targetSocketId) {
  // Enviar error: falta destinatario
}

const targetPlayer = connectedPlayers.get(targetSocketId);
if (!targetPlayer) {
  // Enviar error: jugador no online
}
```

3. **Validación de Tipo:**
```javascript
switch (type) {
  case 'global':
  case 'local':
  case 'group':
  case 'private':
    // Procesar
    break;
  default:
    // Enviar error: tipo inválido
}
```

## Estilos CSS

Los mensajes usan clases CSS para diferentes tipos:

```css
.player-global { color: #ffffff; }
.player-local { color: #00ff00; }
.player-group { color: #0080ff; }
.player-private { color: #ffff00; }
.system { color: #ffa500; }
```

## Integración con Modo Offline

El sistema también funciona en modo offline (single player):

- Simula respuestas de "bot players"
- Solo para mensajes Global y Local
- Útil para testing y desarrollo

## Testing

### Probar Chat Global

1. Conectar 2 clientes en diferentes mapas
2. Enviar mensaje global desde cliente A
3. Verificar que cliente B lo recibe

### Probar Chat Local

1. Conectar 2 clientes en el mismo mapa
2. Enviar mensaje local desde cliente A
3. Verificar que cliente B lo recibe
4. Mover cliente B a otro mapa
5. Enviar otro mensaje local
6. Verificar que cliente B NO lo recibe

### Probar Chat Privado

1. Conectar 2 clientes
2. Desde cliente A, seleccionar "Jugador" en el tipo
3. Seleccionar cliente B del dropdown
4. Enviar mensaje
5. Verificar que solo cliente B lo recibe
6. Verificar que cliente A recibe confirmación

### Probar Mensajes Overhead

1. Enviar mensaje de cualquier tipo
2. Verificar que aparece sobre la cabeza del emisor
3. Verificar fadeout después de 5 segundos

## Logs de Debugging

El sistema genera logs detallados:

**Cliente:**
```
💬 Mensaje enviado: [global] Hola!
💬 Mensaje de chat recibido del servidor: {username: "JugadorA", ...}
```

**Servidor:**
```
💬 [JugadorA] Mensaje tipo global: Hola!
📢 [Global] JugadorA: Hola!
```

## Futuras Mejoras

### Sistema de Grupos/Parties

Pendiente de implementar:
- Crear/unirse a grupos
- Lista de miembros del grupo
- Mensajes solo al grupo
- Comandos de grupo (/invite, /kick, /leave)

### Comandos de Chat

Implementar comandos especiales:
```
/w JugadorB Mensaje privado
/g Mensaje al grupo
/l Mensaje local
/s Mensaje global (grito)
```

### Filtros y Moderación

- Lista de palabras prohibidas
- Reportar jugadores
- Silenciar temporalmente
- Historial de chat guardado

### Emotes y Acciones

```
/laugh - El jugador se ríe
/wave - El jugador saluda
/dance - El jugador baila
```

### Canal de Comercio

- Canal dedicado para compra/venta
- Filtrado automático de spam
- Cooldown entre mensajes

## Notas Técnicas

### Performance

- Los mensajes overhead se limpian automáticamente
- Se usa `Map` para gestión eficiente de jugadores
- Los listeners se configuran una sola vez

### Seguridad

- Validación server-side de todos los mensajes
- No se permite HTML/scripts en mensajes
- Rate limiting para prevenir spam (futuro)

### Compatibilidad

- Compatible con modo online y offline
- Funciona en desktop y mobile
- Responsive design del chat UI

## Conclusión

El sistema de chat está completamente funcional para mensajes Global, Local y Privados. El sistema de Grupos está preparado para futura implementación. La arquitectura es escalable y permite añadir nuevas funcionalidades fácilmente.