# 🗺️ Roadmap Multiplayer - Calima Online

## ✅ Fase 1: Autenticación y Personajes (COMPLETADA)

- [x] Sistema de registro y login con JWT
- [x] Gestión de usuarios en MongoDB
- [x] Creación de personajes (máx 3 por cuenta)
- [x] Lista de personajes sincronizada con servidor
- [x] Eliminación de personajes
- [x] Persistencia completa en base de datos

---

## 🔄 Fase 2: Sincronización en Tiempo Real (SIGUIENTE)

**Objetivo:** Ver otros jugadores moviéndose en el mapa en tiempo real

### Tareas:

#### 2.1 Conectar WebSocket al Entrar al Juego
- [ ] Al seleccionar personaje, conectar Socket.io con token JWT
- [ ] Evento `join_game` con characterId
- [ ] Recibir lista de jugadores online en el mismo mapa

#### 2.2 Integrar en Game.js
- [ ] Detectar modo online vs local
- [ ] Añadir mapa de jugadores online: `Map<socketId, playerData>`
- [ ] Escuchar eventos de WebSocket:
  - `player_joined` - Cuando otro jugador entra
  - `player_moved` - Cuando otro jugador se mueve
  - `player_left` - Cuando otro jugador sale

#### 2.3 Renderizar Jugadores Online
- [ ] Crear clase `OnlinePlayer` similar a `Character`
- [ ] Renderizar jugadores online en el mapa
- [ ] Mostrar nombre sobre cada jugador
- [ ] Diferente color/indicador para jugadores vs NPCs

#### 2.4 Sincronizar Movimiento
- [ ] Al mover el jugador local, emitir `player_move`
- [ ] Actualizar posición de jugadores online cuando se recibe `player_moved`
- [ ] Interpolación suave de movimiento (opcional)

#### 2.5 Transiciones de Mapa
- [ ] Al cambiar de mapa, emitir evento con nuevo mapa
- [ ] Servidor maneja salida/entrada de rooms
- [ ] Cliente actualiza lista de jugadores visibles

**Archivos a modificar:**
- `calima-online-client/js/core/Game.js`
- `calima-online-client/js/core/Renderer.js`
- `calima-online-client/js/entities/OnlinePlayer.js` (nuevo)

---

## 💬 Fase 3: Sistema de Chat en Tiempo Real

**Objetivo:** Comunicación entre jugadores

### Tareas:

#### 3.1 Chat Global
- [ ] Botón/tecla para abrir chat (ej: Enter)
- [ ] Input de texto para escribir mensaje
- [ ] Enviar mensaje vía `chat_message` event
- [ ] Mostrar mensajes de todos los jugadores

#### 3.2 Chat Local/Cercano
- [ ] Mensajes solo para jugadores en el mismo mapa
- [ ] Comando `/g` para global, `/l` para local

#### 3.3 UI de Chat Mejorado
- [ ] Scroll automático a últimos mensajes
- [ ] Colores diferentes según tipo de mensaje
- [ ] Timestamps opcionales
- [ ] Historial de mensajes

**Archivos a modificar:**
- `calima-online-client/js/ui/Chat.js` (ya existe)
- `calima-online-client/js/ui/UI.js`

---

## ⚔️ Fase 4: Sistema de Combate PvE

**Objetivo:** Combate contra NPCs con sincronización

### Tareas:

#### 4.1 NPCs en el Servidor
- [ ] Modelo `NPC` en MongoDB
- [ ] Generación/spawn de NPCs por mapa
- [ ] Estados de NPCs (vivo, muerto, respawn)
- [ ] IA básica de NPCs en servidor

#### 4.2 Combate Sincronizado
- [ ] Evento `attack_npc` del cliente al servidor
- [ ] Servidor calcula daño y actualiza HP del NPC
- [ ] Broadcast `npc_damaged` a todos en el mapa
- [ ] Evento `npc_died` cuando NPC muere
- [ ] Distribución de EXP y loot

#### 4.3 Loot System
- [ ] Generación de items al morir NPC
- [ ] Sistema de roll de items (random)
- [ ] Evento `item_dropped` para mostrar items
- [ ] Evento `pickup_item` para recoger

**Archivos nuevos:**
- `calima-online-server/src/models/NPC.js`
- `calima-online-server/src/systems/NPCManager.js`
- `calima-online-server/src/systems/CombatSystem.js`
- `calima-online-server/src/systems/LootSystem.js`

---

## 📦 Fase 5: Sistema de Items Avanzado

**Objetivo:** Inventario, equipamiento y comercio

### Tareas:

#### 5.1 Items en Base de Datos
- [ ] Modelo `Item` con todos los tipos
- [ ] Catálogo de items (armas, armaduras, pociones)
- [ ] Sistema de rareza y stats de items

#### 5.2 Inventario Sincronizado
- [ ] Actualizar inventario en servidor al recoger items
- [ ] Validaciones server-side (no hacks)
- [ ] Sincronización en tiempo real

#### 5.3 Equipamiento
- [ ] Equipar/desequipar items vía servidor
- [ ] Recalcular stats al equipar
- [ ] Broadcast de apariencia actualizada

#### 5.4 Comercio (Opcional)
- [ ] Trade entre jugadores
- [ ] Sistema de oferta/aceptación
- [ ] Validación en servidor

---

## ⚡ Fase 6: Sistema de Habilidades y Magia

**Objetivo:** Hechizos y habilidades especiales

### Tareas:

- [ ] Modelo de hechizos en servidor
- [ ] Sistema de cooldowns
- [ ] Efectos de área (AoE)
- [ ] Buffs y debuffs sincronizados
- [ ] Animaciones de hechizos para todos los jugadores

---

## 👥 Fase 7: Sistema Social

**Objetivo:** Interacciones sociales entre jugadores

### Tareas:

#### 7.1 Sistema de Amigos
- [ ] Añadir/eliminar amigos
- [ ] Lista de amigos online
- [ ] Invitaciones

#### 7.2 Guilds/Clanes
- [ ] Crear/unirse/salir de guild
- [ ] Roles en guild (líder, oficial, miembro)
- [ ] Chat de guild
- [ ] Banco de guild

#### 7.3 Party System
- [ ] Crear/unirse a party
- [ ] Compartir EXP en party
- [ ] Indicadores visuales de party members

---

## 🎯 Fase 8: PvP (Combate Entre Jugadores)

**Objetivo:** Combate jugador contra jugador

### Tareas:

- [ ] Sistema de flags (atacable/no atacable)
- [ ] Zonas PvP y zonas seguras
- [ ] Sistema de criminalidad
- [ ] Penalizaciones por muerte
- [ ] Rankings PvP

---

## 🏰 Fase 9: Contenido Avanzado

**Objetivo:** Contenido endgame

### Tareas:

- [ ] Dungeons instanciadas (solo para tu party)
- [ ] Bosses de raid (requieren coordinación)
- [ ] Eventos mundiales programados
- [ ] Sistema de crafteo avanzado
- [ ] Mascotas y monturas
- [ ] Housing (casas personales)

---

## 🎮 Fase 10: Optimización y Steam

**Objetivo:** Preparar para lanzamiento en Steam

### Tareas:

#### 10.1 Optimización
- [ ] Optimización de renderizado
- [ ] Reducir payload de WebSocket
- [ ] Caching inteligente
- [ ] Lazy loading de recursos

#### 10.2 Integración con Steam
- [ ] Steam Authentication
- [ ] Steam Achievements
- [ ] Steam Trading Cards
- [ ] Steam Workshop (contenido comunitario)
- [ ] Steam Overlay compatible

#### 10.3 Seguridad y Anti-Cheat
- [ ] Validación server-side de todas las acciones
- [ ] Rate limiting por jugador
- [ ] Sistema de reportes
- [ ] Logs de auditoría
- [ ] Detección de comportamiento anómalo

#### 10.4 Infraestructura
- [ ] Despliegue en producción (AWS/GCP/Azure)
- [ ] Load balancing para múltiples servidores
- [ ] Sistema de regiones/shards
- [ ] Backups automáticos
- [ ] Monitoreo y alertas

---

## 🎯 Próximo Paso Recomendado

**Empezar con Fase 2: Sincronización en Tiempo Real**

Es el siguiente paso lógico porque:
1. ✅ Ya tienes WebSockets configurado
2. ✅ Ya tienes el sistema de autenticación
3. ✅ Es la base para todas las demás funcionalidades multijugador
4. 🎮 Verás resultados inmediatos (otros jugadores moviéndose)

### Comenzar con:

```javascript
// 1. Modificar playWithCharacter() en LoginScreen.js
async playWithCharacter(characterId) {
    // ... código existente ...
    
    // Conectar WebSocket
    socketClient.connect(this.token);
    
    // Configurar listener
    socketClient.on('connected', () => {
        socketClient.joinGame(characterId);
    });
    
    // Iniciar juego
    this.startOnlineGame();
}

// 2. Modificar Game.js para recibir modo online
constructor() {
    this.isOnlineMode = false;
    this.onlinePlayers = new Map();
    
    window.addEventListener('login-complete', (e) => {
        if (e.detail?.online) {
            this.isOnlineMode = true;
            this.setupOnlineMode();
        }
    });
}
```

¿Te gustaría que implemente la Fase 2 (sincronización en tiempo real)?

---

**Última actualización:** 28/01/2026