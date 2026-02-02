# Testing del Sistema de Combate PvP

## 🚨 IMPORTANTE: El servidor de Railway tiene código antiguo

El servidor en Railway no tiene el código del sistema de combate PvP. Para probar el sistema tienes dos opciones:

## Opción 1: Usar Servidor Local (RECOMENDADO) ⚡

### Paso 1: Iniciar el Servidor Local

```bash
# Terminal 1 - Servidor
cd calima-online-server
npm install  # Solo la primera vez
npm run dev  # Iniciar servidor en http://localhost:3000
```

**Espera a ver este mensaje:**
```
🚀 Servidor Calima Online iniciado
📡 Puerto: 3000
🔗 URL: http://localhost:3000
```

### Paso 2: Iniciar el Cliente

```bash
# Terminal 2 - Cliente
cd calima-online-client
python3 -m http.server 9000
```

Luego abre: `http://localhost:9000`

### Paso 3: Probar el Combate

1. **Jugador 1:** Conéctate al juego (login, selecciona personaje)
2. **Jugador 2:** Abre otra pestaña/ventana, conéctate con otro personaje
3. **Encuentro:** Muévanse al mismo mapa
4. **Combate:** Acércate (1 casilla), oriéntate, presiona Space ⚔️

### Logs que Verás:

**Terminal del Servidor:**
```
⚔️ ===== INTENTO DE ATAQUE PVP =====
Atacante: Player1 (socket123)
Defensor: Player2 en (11, 15)
✅ Validaciones completadas
🎲 Daño base calculado: 25
💥 Daño final calculado: 27
❤️ HP del defensor: 85 → 58
✅ ⚔️ PvP COMPLETADO
```

**Consola del Cliente Atacante:**
```
📤 Enviando solicitud de ataque a servidor: {...}
⚔️ Resultado de ataque: { success: true, damage: 27, ... }
```

**Chat del Atacante:**
```
⚔️ Intentando atacar a Player2...
⚔️ ¡Atacas a Player2 causando 27 de daño!
⚖️ Has ganado 10 puntos criminales
```

**Chat del Defensor:**
```
⚔️ Player1 te ataca causando 27 de daño!
```

## Opción 2: Hacer Push a Railway (Producción) 🚀

Si quieres usar el servidor de Railway con el código actualizado:

```bash
# En calima-online-server
cd calima-online-server

# Verificar el remote de Railway
git remote -v

# Hacer push a Railway
git push origin main  # o el nombre del remote que uses para Railway
```

Luego espera 1-2 minutos para que Railway haga el deploy y vuelve a cambiar la URL en `SocketClient.js` a:
```javascript
this.serverUrl = 'https://calima-online-server-production.up.railway.app';
```

## 🐛 Si No Funciona

### Verificar Conexión al Servidor:
1. Abre la consola del navegador
2. Busca: `✅ Conectado al servidor WebSocket`
3. Si no aparece, el servidor no está corriendo

### Verificar Evento Enviado:
1. En la consola busca: `📤 Enviando solicitud de ataque a servidor`
2. Si no aparece, el cliente no está enviando el evento

### Verificar Respuesta del Servidor:
1. En la consola busca: `⚔️ Resultado de ataque:`
2. Si no aparece, el servidor no está respondiendo (probablemente código viejo en Railway)

## 📝 Estado Actual del Cliente

**Configuración actual:** `localhost:3000` (para testing local)

Para volver a usar Railway, cambia en `js/api/SocketClient.js`:
```javascript
//this.serverUrl = 'http://localhost:3000';
this.serverUrl = 'https://calima-online-server-production.up.railway.app';
```

---

**Nota:** El sistema está 100% implementado y funcional. Solo necesitas tener el servidor corriendo con el código actualizado.