# Sistema de NPCs Sincronizados - Cliente

## Descripción General

El cliente de Calima Online ahora soporta NPCs sincronizados del servidor, permitiendo que todos los jugadores vean los mismos NPCs en tiempo real, puedan atacarlos, y reciban recompensas compartidas.

## Características Implementadas

### ✅ Recepción de NPCs del Servidor
- Los NPCs se reciben automáticamente al unirse al juego en el evento `game_joined`
- Se almacenan en `gameState.syncedNPCs` (Map con instanceId como clave)
- Contienen: nombre, posición, apariencia, HP, nivel, comportamiento

### ✅ Sincronización en Tiempo Real
- **Spawn:** Los NPCs aparecen cuando el servidor los crea
- **Movimiento:** Los movimientos se sincronizan automáticamente
- **Daño:** El HP se actualiza cuando cualquier jugador ataca
- **Muerte:** Los NPCs desaparecen 1 segundo después de morir
- **Respawn:** Los NPCs reaparecen después del tiempo configurado (15 segundos)

### ✅ Sistema de Combate
- **Click en NPC:** Detecta NPCs sincronizados mediante `EntityDetection`
- **Ataque Melee:** Al hacer click en un NPC adyacente se ataca con arma equipada
- **Ataque Ranged:** Con arco y flechas se puede atacar a distancia
- **Movimiento Automático:** Se mueve automáticamente hacia el NPC si no está adyacente
- **Validaciones:** 
  - No atacar si eres fantasma
  - No atacar NPCs muertos
  - No atacar NPCs no atacables (sacerdotes, comerciantes, etc.)

### ✅ Sistema de Recompensas
- Las recompensas llegan automáticamente cuando un NPC muere
- Mensaje en chat indicando EXP y oro recibido
- Indicador especial "(¡Golpe final!)" si fuiste quien lo mató
- Stats del jugador se actualizan automáticamente

## Estructura de Datos

### gameState.syncedNPCs

```javascript
Map {
  'npc_1_uuid' => {
    instanceId: 'npc_1_uuid',
    npcTypeId: 1,
    name: 'Goblin',
    x: 45,
    y: 45,
    map: 'newbie_city',
    appearance: {
      body: 301,
      head: 0,
      heading: 3
    },
    hp: 50,
    maxHp: 50,
    level: 1,
    behavior: {
      hostile: true,
      attackable: true,
      movement: 'random',
      // ... más propiedades
    },
    isAlive: true
  }
}
```

## Flujo de Eventos

### 1. Al Unirse al Juego
```javascript
// Evento: game_joined
{
  characterData: {...},
  onlinePlayers: [...],
  npcs: [
    {
      instanceId: 'npc_1_uuid',
      npcTypeId: 1,
      name: 'Goblin',
      position: { x: 45, y: 45, map: 'newbie_city' },
      appearance: { body: 301, head: 0 },
      stats: { hp: 50, maxHp: 50, level: 1 },
      behavior: { hostile: true, ... }
    }
  ]
}
```

Los NPCs se procesan en:
- `multiplayer-ready` event handler en `Game.js`
- `processMultiplayerInitData()` si ya están disponibles

### 2. Durante el Juego

**NPC Spawneado:**
```javascript
socketClient.on('npc_spawned', (data) => {
  // Añadir NPC a gameState.syncedNPCs
});
```

**NPC Movido:**
```javascript
socketClient.on('npc_moved', (data) => {
  // Actualizar posición del NPC
});
```

**NPC Recibe Daño:**
```javascript
socketClient.on('npc_hp_changed', (data) => {
  // Actualizar HP del NPC
});
```

**NPC Muere:**
```javascript
socketClient.on('npc_died', (data) => {
  // Marcar como muerto y eliminar después de 1 segundo
});
```

**NPC Respawnea:**
```javascript
socketClient.on('npc_respawned', (data) => {
  // Añadir NPC de nuevo a gameState.syncedNPCs
});
```

### 3. Al Atacar un NPC

**Jugador hace click en NPC:**
1. `EntityDetection.getEntityAtPosition()` detecta el NPC (tipo: 'syncedNPC')
2. `ClickHandler.handleSyncedNPCClick()` procesa el click
3. Si está adyacente: envía ataque inmediatamente
4. Si no: inicia movimiento automático hacia el NPC
5. Al llegar: `AutoMovement.executeTargetAction()` ejecuta el ataque

**Ataque enviado:**
```javascript
socketClient.attackNPC(instanceId, weaponType, { x, y });
```

**Respuesta del servidor:**
```javascript
socketClient.on('attack_npc_result', (data) => {
  // Mostrar mensaje de daño en chat
  // Si murió, mostrar mensaje especial
});
```

**Recompensa recibida:**
```javascript
socketClient.on('npc_reward', (data) => {
  // Mostrar EXP y oro recibido
  // Actualizar stats del jugador
});
```

### 4. Al Ser Atacado por un NPC

```javascript
socketClient.on('npc_attacked_player', (data) => {
  // Mostrar mensaje de ataque
  // Reducir HP del jugador
  // Verificar muerte
});
```

## Integración con Sistemas Existentes

### EntityDetection
- `getEntityAtPosition()` ahora detecta NPCs sincronizados
- Prioridad: Jugadores Online > Bots > NPCs Sincronizados > NPCs Locales > Enemigos

### ClickHandler
- Nuevo handler `handleSyncedNPCClick()` para NPCs del servidor
- Soporte para ataque melee y ranged
- Validaciones de estado (fantasma, NPC muerto, no atacable)

### AutoMovement
- Colisión con NPCs sincronizados
- Caso `syncedNPC` para ejecutar ataque al llegar
- Verificación de NPC actualizado antes de atacar

### RendererCore
- Nueva función `renderSyncedNPCs()` 
- Renderiza NPCs con:
  - Color rojo para hostiles, naranja para neutrales
  - Nombre y nivel debajo
  - Barra de HP si está herido
  - Solo renderiza NPCs vivos en el mapa actual

## Cómo Usar

### 1. Ver NPCs en el Juego
Los NPCs aparecerán automáticamente cuando entres al juego en modo online. Verás:
- Círculos rojos para enemigos hostiles
- Círculos naranjas para NPCs neutrales
- Nombre del NPC debajo
- Nivel del NPC
- Barra de HP cuando están heridos

### 2. Atacar NPCs
**Con Click:**
1. Haz click en un NPC rojo (hostil)
2. Si no estás adyacente, tu personaje se moverá automáticamente
3. Al llegar, atacará automáticamente
4. Verás mensajes de daño en el chat

**Con Arco y Flechas:**
1. Equipa arco y ten flechas
2. Haz click en un NPC a distancia
3. Atacarás sin moverte

### 3. Recibir Recompensas
Cuando un NPC muere, recibirás:
- 💰 Experiencia y oro (mensaje en chat)
- 50% proporcional al daño que hiciste
- 50% extra si fuiste quien lo mató
- El mensaje indicará si fuiste el killer

### 4. Ataques de NPCs
Si un NPC te ataca:
- ⚠️ Verás mensaje en chat: "X te ataca y te causa Y de daño!"
- Tu HP se reducirá automáticamente
- Si mueres, entrarás en modo fantasma

## Debugging

Para ver qué está pasando con los NPCs, abre la consola del navegador y busca:

```
✨ NPC añadido: [nombre] en (x, y)
🔄 NPC [nombre] movido a (x, y)
💔 NPC recibió X de daño (HP: X/Y)
💀 NPC [nombre] ha muerto
🔄 NPC respawneado: [nombre]
💰 Recompensa de NPC: [detalles]
⚔️ Atacando NPC...
```

## Limitaciones Actuales

- Los NPCs se renderizan como círculos de colores (sprites propios pendientes)
- No se muestran animaciones de ataque de NPCs
- El loot dropeado se muestra en chat pero no como objetos en el mapa aún
- La IA de persecución solo funciona en el servidor (el cliente solo ve los resultados)

## Próximas Mejoras

- [ ] Sprites propios para cada tipo de NPC
- [ ] Animaciones de ataque de NPCs
- [ ] Mostrar objetos dropeados en el mapa
- [ ] Efectos visuales de combate con NPCs
- [ ] Sonidos de NPCs (idle, ataque, muerte)
- [ ] Indicador visual de NPC en combate
- [ ] Diálogos con NPCs no hostiles

## Ejemplo de Uso

```javascript
// El sistema está completamente automático, solo necesitas:

// 1. Iniciar sesión en modo online
// 2. Los NPCs aparecerán automáticamente en el mapa
// 3. Haz click en un NPC para atacarlo
// 4. El sistema maneja todo lo demás

// Para debugging en consola:
console.log('NPCs en el mapa:', gameState.syncedNPCs.size);
for (const [id, npc] of gameState.syncedNPCs) {
    console.log(`- ${npc.name} en (${npc.x}, ${npc.y}) HP:${npc.hp}/${npc.maxHp}`);
}
```

## Notas Importantes

- Los NPCs sincronizados solo funcionan en **modo online**
- En modo local, los NPCs locales antiguos siguen funcionando normalmente
- Los NPCs del servidor tienen nombres como "Goblin", "Araña Gigante", "Lobo Salvaje"
- El Sacerdote (NPC tipo 100) no es atacable y está estático en (50, 50)

## Soporte

Si encuentras bugs con los NPCs sincronizados:
1. Verifica que el servidor esté corriendo
2. Revisa la consola del navegador para errores
3. Asegúrate de estar en modo online
4. Verifica que `gameState.syncedNPCs` esté inicializado

Para más información sobre el servidor, consulta: `calima-online-server/SISTEMA_NPCS.md`