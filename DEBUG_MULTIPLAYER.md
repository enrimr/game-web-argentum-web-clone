# 🐛 Guía de Debugging Multiplayer

## 🔍 Checklist de Verificación

### 1. Verificar Socket.io Cargado

**Abrir Consola del Navegador (F12)** y ejecutar:
```javascript
typeof io
```
**Resultado esperado:** `"function"`  
**Si sale:** `"undefined"` → Socket.io no se cargó, verificar que index.html tenga el CDN

---

### 2. Verificar Conexión WebSocket

**En la consola, después de hacer login y jugar:**
```javascript
// Ver el objeto socketClient
import('./js/api/SocketClient.js').then(m => console.log(m.default))
```

**Logs esperados en consola:**
```
✅ WebSocket conectado, uniéndose al juego...
🎮 ¡Unido al juego! {...}
```

---

### 3. Verificar Estado del Juego

**En consola:**
```javascript
// Ver si está en modo online
gameState.isOnline

// Ver jugadores online
gameState.onlinePlayers

// Ver contenido del Map
for (const [id, player] of gameState.onlinePlayers) {
    console.log(id, player);
}
```

**Resultado esperado:**
- `gameState.isOnline` → `true`
- `gameState.onlinePlayers` → `Map { ... }` (no null/undefined)
- Debería mostrar otros jugadores si hay

---

### 4. Verificar Logs del Servidor

**En la terminal del servidor buscar:**
```
🔌 Cliente conectado: abc123
✅ NombrePersonaje se unió al mapa newbie_city
```

Si NO ves estos logs → El socket no se está conectando

---

### 5. Test Manual de Eventos

**En consola del navegador:**
```javascript
// Importar socketClient
const { default: socketClient } = await import('./js/api/SocketClient.js');

// Ver si está conectado
socketClient.isSocketConnected()  // debe ser true

// Ver socketId
socketClient.getSocketId()  // debe mostrar un ID

// Forzar envío de movimiento
socketClient.sendPlayerMove(10, 10)
```

---

### 6. Verificar Mismo Mapa

**Los jugadores SOLO se ven si están en el mismo mapa.**

**En consola de cada navegador:**
```javascript
gameState.currentMap
```

**Resultado esperado:** Ambos navegadores deben mostrar el mismo mapa (ej: "newbie_city")

---

### 7. Test de Renderizado

**En consola:**
```javascript
// Verificar que la función existe
typeof renderOnlinePlayers  // NO funcionará porque es privada

// Verificar que gameState tiene jugadores
gameState.onlinePlayers?.size  // debe ser > 0 si hay otros jugadores
```

---

## 🔧 Soluciones a Problemas Comunes:

### Problema 1: "io is not defined"
**Solución:**
```html
<!-- Verificar que index.html tenga antes del cierre de </head>: -->
<script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
```

### Problema 2: WebSocket no conecta
**Consola muestra:** Error de conexión

**Revisar:**
1. Servidor corriendo en puerto 3000
2. URL correcta en ApiClient.js y SocketClient.js
3. Token JWT válido

**Test:**
```javascript
const { default: apiClient } = await import('./js/api/ApiClient.js');
apiClient.getToken()  // debe devolver un token
```

### Problema 3: Jugadores en mapas diferentes
**Solución:** Asegurarse que ambos jugadores están en "newbie_city"

```javascript
// En cada navegador ejecutar:
gameState.currentMap
```

### Problema 4: gameState.onlinePlayers es null
**Solución:** Verificar que el evento 'login-complete' se disparó con modo online

```javascript
// Verificar:
gameState.isOnline  // debe ser true
gameState.onlineUser  // debe tener datos del usuario
```

---

## 🧪 Test Completo Paso a Paso:

### Navegador 1:
```
1. Abrir consola (F12)
2. Login con usuario1
3. Seleccionar personaje
4. En consola ejecutar:
   console.log('Modo online:', gameState.isOnline);
   console.log('Jugadores:', gameState.onlinePlayers?.size);
   console.log('Mapa:', gameState.currentMap);
```

### Navegador 2:
```
1. Abrir consola (F12)
2. Login con usuario2
3. Seleccionar personaje
4. En consola del Navegador 1 ejecutar:
   console.log('Jugadores ahora:', gameState.onlinePlayers?.size);
   
   // Debería aumentar de 0 a 1
```

---

## 📊 Logs Completos Esperados:

### Cliente (Navegador 1):
```
Login completado, iniciando juego...
Iniciando en modo online con usuario: enrique
Personaje seleccionado: Guerrero1
✅ WebSocket conectado, uniéndose al juego...
🎮 ¡Unido al juego! { onlinePlayers: [], characterData: {...} }
🌐 Multiplayer listo! {...}
```

### Cliente (Navegador 2):
```
Login completado, iniciando juego...
Iniciando en modo online con usuario: jugador2
Personaje seleccionado: Mago1
✅ WebSocket conectado, uniéndose al juego...
🎮 ¡Unido al juego! { onlinePlayers: [{...Guerrero1...}], characterData: {...} }
🌐 Multiplayer listo! {...}
👤 Jugador online cargado: Guerrero1
```

### Servidor:
```
🔌 Cliente conectado: socket-id-1
✅ Guerrero1 se unió al mapa newbie_city
🔌 Cliente conectado: socket-id-2
✅ Mago1 se unió al mapa newbie_city
```

---

## 🚨 Si Nada Funciona:

### Reset Completo:
```bash
# 1. Cerrar todos los navegadores
# 2. En terminal del servidor:
mongosh calima-online --eval 'db.characters.updateMany({}, { $set: { "state.isOnline": false } })'

# 3. Reiniciar servidor:
# Ctrl+C
npm run dev

# 4. Abrir navegadores en modo incógnito
# 5. Limpiar localStorage (F12 → Application → Local Storage → Clear)
# 6. Intentar de nuevo
```

---

## 📝 Información para Reportar:

Si sigue sin funcionar, necesito ver:

**De la Consola del Navegador:**
```javascript
// Ejecutar y copiar resultado:
console.log({
    socketioLoaded: typeof io !== 'undefined',
    isOnline: gameState?.isOnline,
    onlinePlayersSize: gameState?.onlinePlayers?.size,
    currentMap: gameState?.currentMap,
    socketConnected: socketClient?.isSocketConnected?.()
});
```

**Del Servidor (Terminal):**
Copiar los últimos 20 líneas de logs

---

**Fecha:** 28/01/2026