# Sistema de Jugadores Bot

## Descripción General

El sistema de jugadores bot simula jugadores AI que aparecen en los mapas del juego. Los bots tienen comportamientos variados como moverse, atacar enemigos, hablar en el chat y viajar entre mapas.

## Arquitectura

### Componentes Principales

1. **BotPlayer.js** (`js/entities/BotPlayer.js`)
   - Clase que representa un jugador bot individual
   - Extiende de `Character.js`
   - Implementa IA con diferentes comportamientos

2. **BotManager.js** (`js/systems/BotManager.js`)
   - Singleton que gestiona todos los bots del juego
   - Controla spawn, actualización y eliminación de bots
   - Maneja transiciones entre mapas

3. **Integración en GameState** (`js/state.js`)
   - Array `gameState.bots` almacena todos los bots activos

## Características de los Bots

### Propiedades
- **ID único**: Identificador único para cada bot
- **Nombre**: Generado aleatoriamente de una lista de nombres
- **Nivel**: Entre 1 y 10
- **Estadísticas**: HP, maxHP basado en nivel
- **Mapa actual**: Cada bot sabe en qué mapa está
- **Animación**: Estados de animación (idle, walking, attacking, talking)

### Comportamientos (IA)

Los bots cambian de comportamiento cada 3-10 segundos aleatoriamente:

1. **IDLE (30% probabilidad)**
   - El bot se queda quieto sin hacer nada
   - Estado de animación: `idle`

2. **WANDERING (40% probabilidad)**
   - El bot camina aleatoriamente por el mapa
   - Selecciona objetivos aleatorios dentro de un radio de 5 tiles
   - Evita colisiones con otros bots, NPCs y el jugador

3. **HUNTING (15% probabilidad)**
   - El bot busca enemigos cercanos (radio de 10 tiles)
   - Se mueve hacia el enemigo más cercano
   - Ataca cuando está adyacente al enemigo
   - Daño: 10 + (nivel * 5) por ataque

4. **CHATTING (10% probabilidad)**
   - El bot dice mensajes aleatorios en el chat
   - Cooldown de 5-15 segundos entre mensajes
   - Muestra animación de "talking"

5. **TRAVELING (5% probabilidad)**
   - El bot busca portales cercanos
   - Se mueve hacia el portal más cercano
   - Usa el portal para cambiar de mapa

### Sistema de Navegación

- **Detección de colisiones**: Los bots no pueden atravesar muros, otros bots, NPCs o el jugador
- **Pathfinding básico**: Movimiento Manhattan hacia objetivos
- **Transición entre mapas**: Los bots pueden usar portales para viajar

## Renderizado

### Visualización
- **Sprite**: Usa el sprite del jugador (TODO: sprites únicos para bots)
- **Nickname**: Nombre en color azul (#60a5fa) encima del sprite
- **Nivel**: "Lv.X" en verde (#22c55e) encima del nickname
- **Barra de vida**: Barra roja mostrando HP actual/máximo

### Orden de renderizado
Los bots se renderizan después de los NPCs pero antes del jugador.

## Sistema de Spawn

### Spawn Inicial
- Al iniciar el juego: 2-4 bots en el mapa actual
- Búsqueda de posiciones válidas (hasta 50 intentos)

### Spawn Dinámico
- Máximo 5 bots por mapa
- Cooldown de 5 segundos entre spawns
- 30% de probabilidad de spawn cuando hay espacio
- Al cambiar de mapa: genera 1-2 bots si hay menos de 2

### Condiciones de Spawn
- Posición debe ser caminable (GRASS, FLOOR, PATH)
- No puede estar ocupada por jugador, NPCs u otros bots
- Debe estar dentro de los límites del mapa

## Uso

### Inicialización

El sistema se inicializa automáticamente en `Game.js`:

```javascript
import { botManager } from '../systems/BotManager.js';

// En initGame()
botManager.init(gameState);
```

### Actualización

El GameLoop actualiza los bots cada frame:

```javascript
// En gameLoop()
botManager.update(deltaTime, gameState);
```

### Gestión Manual

```javascript
// Spawn manual de un bot
botManager.spawnBot(gameState, 'newbie_city');

// Obtener bots en un mapa
const bots = botManager.getBotsInMap('newbie_city');

// Eliminar un bot
botManager.removeBot('bot_1');

// Limpiar todos los bots
botManager.clear();
```

## Configuración

### Parámetros Ajustables

En `BotManager.js`:
- `maxBotsPerMap`: Máximo de bots por mapa (default: 5)
- `spawnCooldown`: Tiempo entre spawns (default: 5000ms)

En `BotPlayer.js`:
- `movementSpeed`: Velocidad de movimiento (default: 200ms por tile)
- `attackCooldown`: Tiempo entre ataques (default: 1000ms)
- `chatCooldown`: Tiempo entre mensajes (default: 5-15s)

### Probabilidades de Comportamiento

```javascript
const weights = [30, 40, 15, 10, 5];
// [idle, wandering, hunting, chatting, traveling]
```

## Nombres de Bots

Lista de 50 nombres inspirados en juegos y fantasía:
- Arthas, Gandalf, Legolas, Aragorn, etc.
- Cada nombre tiene un sufijo numérico aleatorio (0-999)
- Ejemplo: "Gandalf247", "Link582"

## Mensajes de Chat

20 mensajes predefinidos que los bots pueden decir:
- "¡Hola a todos!"
- "¿Alguien quiere hacer party?"
- "Voy a cazar goblins"
- etc.

## Integración con Otros Sistemas

### Sistema de Combate
- Los bots pueden atacar enemigos
- Los enemigos NO atacan a los bots (solo al jugador)
- Los bots causan daño basado en su nivel

### Sistema de Chat
- Los mensajes de bot aparecen con etiqueta "bot"
- Formato: `[bot] NombreBot: mensaje`

### Sistema de Mapas
- Los bots persisten entre mapas (no se borran)
- Cada bot sabe en qué mapa está
- Solo se renderizan/actualizan bots del mapa actual

## Mejoras Futuras

### Corto Plazo
- [ ] Sprites únicos para bots (diferentes colores/equipamiento)
- [ ] Animaciones según dirección de movimiento
- [ ] Animación de ataque

### Medio Plazo
- [ ] Pathfinding A* para navegación inteligente
- [ ] Memoria de enemigos derrotados
- [ ] Formación de grupos de bots
- [ ] Interacción con NPCs

### Largo Plazo
- [ ] Sistema de clases para bots (guerrero, mago, arquero)
- [ ] Inventario y equipamiento para bots
- [ ] Misiones/quests para bots
- [ ] IA más sofisticada (FSM, behavior trees)

## Debugging

### Logs
El sistema genera logs informativos:
- `🤖 Bot creado: NombreBot (Nivel X) en mapa (x, y)`
- `🌀 Bot NombreBot viaja de mapa1 a mapa2`
- `🗺️ Jugador cambió a mapa, verificando bots...`

### Comandos de Consola

```javascript
// Ver todos los bots
console.log(gameState.bots);

// Ver bots en mapa actual
console.log(botManager.getBotsInMap(gameState.currentMap));

// Spawn manual
botManager.spawnBot(gameState, gameState.currentMap);
```

## Limitaciones Conocidas

1. Los bots usan el mismo sprite que el jugador
2. No hay pathfinding sofisticado (pueden quedar bloqueados)
3. Los enemigos ignoran a los bots
4. No hay persistencia entre sesiones
5. Los bots no interactúan entre sí

## Rendimiento

- Cada bot se actualiza cada frame
- Complejidad: O(n) por bot, donde n = número de checks
- Impacto mínimo con 5 bots por mapa
- Sistema escalable hasta ~20 bots sin impacto notable
