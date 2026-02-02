# Sistema de Combate PvP - Diseño e Implementación

## Objetivo
Implementar un sistema de combate entre jugadores conectados que sea **reutilizable** para:
- **PvP**: Jugador vs Jugador
- **PvE**: Jugador vs Enemigo/NPC
- **PvBot**: Jugador vs Bot
- **Futuro**: Bot vs Bot, Bot vs NPC

## Arquitectura del Sistema

### 1. Principios de Diseño

#### Reutilización
- Funciones genéricas que acepten `attacker` y `defender` como parámetros
- Separar lógica de cálculo de daño de la aplicación del daño
- Soporte para diferentes tipos de entidades (Player, Enemy, NPC, Bot)

#### Autoridad del Servidor
- El servidor **VALIDA** todos los ataques
- El servidor **CALCULA** el daño (anti-cheat)
- El cliente solo envía intención de ataque y muestra feedback

#### Validaciones
- **Rango**: Verificar distancia máxima de ataque (melee/ranged)
- **Cooldown**: Prevenir spam de ataques
- **Estado**: No atacar si está muerto/fantasma
- **Criminalidad**: Sistema de consecuencias por atacar ciudadanos

### 2. Componentes a Implementar

#### Cliente (`calima-online-client/js/systems/Combat.js`)

**Refactorización:**
```javascript
// ANTES (específico para enemigos)
function playerAttack(enemy) { ... }

// DESPUÉS (genérico para cualquier objetivo)
function attackTarget(attacker, target, targetType) { ... }
```

**Nuevas Funciones:**
- `attackPlayer(targetSocketId, targetPosition)` - Atacar a otro jugador
- `calculateDamageGeneric(attacker, attackerStats, weapon)` - Cálculo genérico
- `applyDamageToTarget(target, damage, damageSource)` - Aplicar daño genérico
- `canAttackTarget(attacker, target)` - Validación pre-ataque

**Gestión de Cooldowns:**
```javascript
const ATTACK_COOLDOWN = 1500; // 1.5 segundos entre ataques
let lastAttackTime = 0;
```

#### Cliente (`calima-online-client/js/api/SocketClient.js`)

**Nuevos Eventos a Enviar:**
- `player_attack` - Solicitar atacar a un jugador
  ```javascript
  {
    targetSocketId: string,
    weaponType: string, // 'melee' | 'ranged'
    position: { x, y } // Posición del atacante
  }
  ```

**Nuevos Eventos a Recibir:**
- `player_attacked` - Otro jugador nos atacó
  ```javascript
  {
    attackerSocketId: string,
    attackerUsername: string,
    damage: number,
    newHp: number,
    died: boolean
  }
  ```

- `player_attack_result` - Resultado de nuestro ataque
  ```javascript
  {
    success: boolean,
    targetSocketId: string,
    targetUsername: string,
    damage: number,
    targetNewHp: number,
    targetDied: boolean,
    criminalityGained: number // Si atacamos ciudadano
  }
  ```

- `combat_action` - Acción de combate visible para espectadores
  ```javascript
  {
    attackerSocketId: string,
    attackerUsername: string,
    targetSocketId: string,
    targetUsername: string,
    damage: number,
    attackType: 'melee' | 'ranged'
  }
  ```

#### Servidor (`calima-online-server/src/server.js`)

**Nuevo Evento Handler:**
```javascript
socket.on('player_attack', async (data) => {
  // 1. Validar que el atacante existe
  // 2. Validar que el objetivo existe y está en el mismo mapa
  // 3. Validar rango de ataque
  // 4. Validar cooldown
  // 5. Validar estado (vivo/muerto)
  // 6. Calcular daño (autoritario)
  // 7. Aplicar daño al defensor
  // 8. Verificar muerte
  // 9. Gestionar criminalidad
  // 10. Broadcast a todos los jugadores en el mapa
});
```

**Funciones de Validación:**
- `isWithinAttackRange(attacker, target, weaponRange)` - Validar rango
- `canPlayerAttack(attacker, cooldownTime)` - Validar cooldown y estado
- `calculateServerDamage(attacker, target)` - Cálculo autoritario de daño
- `applyDamageToPlayer(target, damage)` - Aplicar daño y actualizar BD
- `handlePlayerDeath(victim, killer)` - Gestionar muerte (fantasma, drop items)

### 3. Flujo de Combate PvP

```
1. Cliente A hace clic en Jugador B
   ↓
2. Cliente valida localmente (rango, cooldown)
   ↓
3. Cliente envía 'player_attack' al servidor
   ↓
4. Servidor valida (rango, cooldown, estado)
   ↓
5. Servidor calcula daño (stats, equipamiento, facción)
   ↓
6. Servidor aplica daño a Jugador B
   ↓
7. Servidor actualiza BD (HP, criminalidad)
   ↓
8. Servidor envía resultado a ambos jugadores:
   - 'player_attack_result' → Cliente A
   - 'player_attacked' → Cliente B
   ↓
9. Servidor broadcast 'combat_action' a espectadores
   ↓
10. Clientes muestran animaciones y efectos
```

### 4. Sistema de Criminalidad

**Reglas:**
- Atacar a un ciudadano (facción neutral) → +10 puntos criminales
- Atacar a un criminal (status >= 50) → Sin penalización
- Matar a un ciudadano → +20 puntos criminales adicionales
- Criminal (50+ puntos) → Guardias atacan automáticamente
- Muerte por guardias → -30 puntos criminales

**Estados:**
- 0-49: Ciudadano (verde)
- 50-99: Criminal (amarillo)
- 100+: Asesino (rojo)

### 5. Validaciones Anti-Cheat

**Cliente:**
- Validación visual (no obligatoria, solo UX)
- Muestra errores locales si es obvio (fuera de rango)

**Servidor (OBLIGATORIO):**
- ✅ Validar distancia euclidiana < rango máximo
- ✅ Validar tiempo desde último ataque >= cooldown
- ✅ Validar que atacante y defensor están vivos
- ✅ Validar que están en el mismo mapa
- ✅ Validar que el defensor no es un fantasma
- ✅ Recalcular daño en servidor (no confiar en cliente)

### 6. Reutilización del Sistema

El sistema está diseñado para ser reutilizable:

```javascript
// PvP - Jugador ataca a jugador
attackTarget(gameState.player, otherPlayer, 'player');

// PvE - Jugador ataca a enemigo (código existente)
attackTarget(gameState.player, enemy, 'enemy');

// PvBot - Jugador ataca a bot
attackTarget(gameState.player, bot, 'bot');

// Bot ataca a jugador (IA)
attackTarget(bot, gameState.player, 'player');
```

### 7. Feedback Visual

**Animaciones:**
- Atacante → Animación de ataque (swing, shoot)
- Defensor → Animación de daño/herido
- Muerte → Animación de colapso + conversión a fantasma

**Efectos:**
- Números de daño flotantes sobre el objetivo
- Partículas de impacto
- Flash rojo en el objetivo dañado
- Sonidos de golpe/disparo/muerte

**Chat:**
- "⚔️ [Atacante] ataca a [Defensor] causando X de daño"
- "💀 [Atacante] ha matado a [Defensor]"
- "⚖️ Has ganado X puntos criminales"

### 8. Estructura de Datos

**Cliente (connectedPlayers):**
```javascript
{
  socketId: string,
  username: string,
  position: { x, y, map },
  hp: number,
  maxHp: number,
  isAlive: boolean,
  isGhost: boolean,
  faction: string,
  level: number,
  equipment: { weapon, shield, armor, ... },
  lastAttackTime: timestamp // Para cooldown local
}
```

**Servidor (connectedPlayers):**
```javascript
{
  ...playerData,
  lastAttackTime: timestamp, // Para validación autoritaria
  attackCooldown: number // Configurable por arma
}
```

### 9. Plan de Implementación

#### Fase 1: Refactorización (Combat.js)
- [ ] Extraer `calculateDamage()` genérica
- [ ] Extraer `applyDamage()` genérica
- [ ] Crear `attackTarget()` genérica
- [ ] Mantener compatibilidad con código existente

#### Fase 2: Cliente - Eventos y UI
- [ ] Añadir eventos a SocketClient.js
- [ ] Implementar `attackPlayer()` en Combat.js
- [ ] Añadir cooldown visual en UI
- [ ] Implementar animaciones de ataque

#### Fase 3: Servidor - Validación y Lógica
- [ ] Implementar evento `player_attack`
- [ ] Validaciones de seguridad
- [ ] Cálculo de daño autoritario
- [ ] Sistema de criminalidad
- [ ] Broadcast de combate

#### Fase 4: Testing y Balance
- [ ] Probar PvP básico
- [ ] Probar criminalidad
- [ ] Probar rango de ataque
- [ ] Probar muerte y fantasma
- [ ] Balance de daño

#### Fase 5: Feedback Visual
- [ ] Animaciones mejoradas
- [ ] Efectos de partículas
- [ ] Números de daño flotantes
- [ ] Sonidos de combate

### 10. Configuración

```javascript
// config.js
export const COMBAT_CONFIG = {
  ATTACK_COOLDOWN: 1500, // ms
  MELEE_RANGE: 1.5, // tiles
  RANGED_RANGE: 8, // tiles
  CRIMINAL_POINTS_PER_ATTACK: 10,
  CRIMINAL_POINTS_PER_KILL: 20,
  CRIMINAL_THRESHOLD: 50,
  DEATH_PENALTY_CRIMINAL: -30
};
```

## Próximos Pasos

1. ✅ Crear rama feature
2. ⏳ Refactorizar Combat.js para reutilización
3. ⏳ Implementar eventos en SocketClient
4. ⏳ Implementar handler en servidor
5. ⏳ Testing PvP básico
6. ⏳ Implementar feedback visual
7. ⏳ Documentar y merge

---

**Fecha de inicio:** 2/2/2026
**Estado:** En Desarrollo
**Rama:** `feature/sistema-combate-pvp`