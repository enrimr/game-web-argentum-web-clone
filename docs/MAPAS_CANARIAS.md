# Documentación Técnica: Sistema de Mapas de las Islas Canarias

## Introducción

Este documento detalla la implementación técnica del nuevo sistema de mapas de las Islas Canarias en el proyecto Argentum Demo. Esta expansión representa una mejora significativa en la arquitectura del juego, introduciendo nuevas regiones, mecánicas y optimizaciones en el sistema de carga de mapas.

## Arquitectura del Sistema

### Estructura de Archivos

Los mapas de Canarias están organizados en los siguientes archivos:

- **Definiciones de mapas**: `js/world/StaticWorldMaps.js`
- **Archivos JSON de mapas**: 
  - `js/world/maps/canarias_capital.json`
  - `js/world/maps/canarias_playa_canteras.json`
  - `js/world/maps/canarias_dunas.json`
  - `js/world/maps/canarias_teide_dungeon.json`
- **Sistema de carga**: `js/world/generators/StaticMapLoader.js`
- **Sistema de precarga**: `js/world/PreloadedMaps.js`

### Sistema de Capas

Cada mapa de Canarias utiliza un sistema multicapa que incluye:

1. **Capa base**: Terreno básico (hierba, arena, agua, etc.)
2. **Capa de objetos**: Elementos colisionables como paredes, árboles, rocas
3. **Capa de techos**: Techos de edificios que se muestran/ocultan según la posición del jugador
4. **Capa de puertas**: Puertas interactivas que pueden abrirse/cerrarse
5. **Capa de ventanas**: Detalles visuales adicionales para los edificios

### Formato JSON de Mapas

El formato estándar para los mapas JSON incluye:

```json
{
  "name": "Nombre del mapa",
  "description": "Descripción corta",
  "type": "ciudad|campo|mazmorra|etc",
  "safeZone": true|false,
  "worldPosition": { "x": 0, "y": 0 },
  "layers": {
    "base": [[0,0,0], [0,0,0]],
    "objects": [[0,0,0], [0,0,0]],
    "roofs": [[0,0,0], [0,0,0]],
    "doors": [[0,0,0], [0,0,0]],
    "windows": [[0,0,0], [0,0,0]]
  },
  "npcs": [
    { "type": "tipo_npc", "x": 0, "y": 0, "dialogue": "id_dialogo" }
  ],
  "enemies": {
    "enabled": true|false,
    "spawnAreas": [{ "x": 0, "y": 0, "width": 10, "height": 10 }]
  },
  "objects": {
    "density": 0.05,
    "types": ["tipo1", "tipo2"],
    "spawnAreas": "walkable"|[{ "x": 0, "y": 0, "width": 10, "height": 10 }]
  },
  "portals": [
    { "x": 0, "y": 0, "targetMap": "mapa_destino", "targetX": 0, "targetY": 0, "name": "Nombre Portal" }
  ],
  "connections": {}
}
```

## Sistema de Precarga de Mapas

Una de las mejoras más significativas es la implementación del sistema de precarga de mapas:

```javascript
// PreloadedMaps.js
window.__PRELOADED_MAPS__ = {};

export function loadMapFromJson(mapId, filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error cargando mapa ${mapId}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            window.__PRELOADED_MAPS__[mapId] = data;
            console.log(`✅ Mapa ${mapId} cargado con éxito desde ${filePath}`);
            return data;
        })
        .catch(error => {
            console.error(`❌ Error cargando mapa ${mapId} desde ${filePath}:`, error);
        });
}
```

Este sistema realiza una carga asíncrona de todos los mapas JSON al inicio del juego, almacenándolos en memoria para un acceso instantáneo cuando el jugador necesita viajar entre regiones.

## Integración con Game.js

La carga de mapas se integra en el flujo principal del juego a través de `Game.js`:

```javascript
export async function init() {
    console.log('Initializing game...');
    
    // Precargar todos los mapas JSON antes de inicializar el juego
    try {
        console.log('🗺️ Iniciando precarga de mapas JSON...');
        await preloadAllMaps();
        console.log('✅ Mapas JSON precargados con éxito');
    } catch (error) {
        console.error('❌ Error al precargar mapas JSON:', error);
    }

    // El resto de la inicialización...
}
```

## Descripción de los Mapas de Canarias

### Las Palmas de Gran Canaria (canarias_capital)

**Características principales:**
- Ciudad principal con diseño urbano complejo
- Múltiples edificios con interiores accesibles
- NPCs comerciantes y misiones
- Conexiones a otras regiones de Canarias
- Zona segura sin enemigos hostiles

**Estructura técnica:**
- Tamaño: 80x80 tiles
- Edificios: 15 estructuras principales
- NPCs: 12 interactivos
- Portales: 4 conexiones a otras regiones

### Playa de Las Canteras (canarias_playa_canteras)

**Características principales:**
- Zona costera con agua navegable
- Áreas de pesca
- NPCs turistas e instructores
- Eventos especiales durante "horas" específicas
- Cofres de tesoro submarinos

**Estructura técnica:**
- Tamaño: 70x60 tiles
- Zonas acuáticas: 30% del mapa
- NPCs: 8 interactivos
- Objetos especiales: 5 zonas de pesca, 7 cofres submarinos

### Dunas de Maspalomas (canarias_dunas)

**Características principales:**
- Terreno desértico con visibilidad reducida
- Enemigos específicos del desierto
- Oasis con recursos especiales
- Efectos climáticos dinámicos (tormentas de arena)
- Tesoros ocultos bajo la arena

**Estructura técnica:**
- Tamaño: 100x80 tiles
- Enemigos: 3 tipos específicos
- Zonas de oasis: 3 áreas principales
- Tesoros ocultos: 12 distribuidos por el mapa

### Volcán del Teide (canarias_teide_dungeon)

**Características principales:**
- Mazmorra de alto nivel con múltiples niveles
- Sistemas de flujo de lava dinámicos
- Enemigos especiales resistentes al fuego
- Jefe final en la cámara central
- Equipo y recompensas de élite

**Estructura técnica:**
- Tamaño: 120x120 tiles
- Niveles de profundidad: 3
- Tipos de enemigos: 5 exclusivos
- Sistema de lava: Daño progresivo y cambios de terreno

## Sistema de Conexiones entre Mapas

Los mapas de Canarias están conectados entre sí mediante un sistema de portales definidos en cada archivo JSON:

```json
"portals": [
  { 
    "x": 25, "y": 1, 
    "targetMap": "canarias_playa_canteras", 
    "targetX": 35, "targetY": 48, 
    "name": "Playa de Las Canteras" 
  },
  { 
    "x": 48, "y": 78, 
    "targetMap": "canarias_dunas", 
    "targetX": 50, "targetY": 5, 
    "name": "Dunas de Maspalomas" 
  }
]
```

Además, existe una conexión especial desde la ciudad inicial (Ullathorpe) hacia Las Palmas, permitiendo a los jugadores nuevos acceder rápidamente a la nueva región.

## Optimizaciones y Mejoras Técnicas

### Renderizado Eficiente

Se ha implementado un sistema de renderizado que solo dibuja los elementos visibles en la pantalla:

```javascript
// Pseudocódigo de optimización de renderizado
function renderMap(map, camera) {
    // Calcular tiles visibles basados en la posición de la cámara
    const startX = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 1);
    const startY = Math.max(0, Math.floor(camera.y / TILE_SIZE) - 1);
    const endX = Math.min(MAP_WIDTH, startX + VIEWPORT_TILES_X + 2);
    const endY = Math.min(MAP_HEIGHT, startY + VIEWPORT_TILES_Y + 2);
    
    // Solo renderizar los tiles visibles
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            // Renderizar tile en posición x,y
        }
    }
}
```

### Manejo de Techos

Los techos de los edificios se manejan dinámicamente, ocultándose cuando el jugador está dentro:

```javascript
function updateRoofVisibility(playerX, playerY) {
    // Para cada edificio en el mapa actual
    buildings.forEach(building => {
        // Comprobar si el jugador está dentro del edificio
        if (isPointInside(playerX, playerY, building)) {
            // Ocultar techo
            setRoofVisible(building.id, false);
        } else {
            // Mostrar techo
            setRoofVisible(building.id, true);
        }
    });
}
```

### Precarga de Recursos

Además de precargar los mapas JSON, también precargamos los sprites utilizados en cada región para garantizar un rendimiento óptimo:

```javascript
// Proceso de precarga de sprites
export function preloadRegionSprites(regionName) {
    const spritesToLoad = REGION_SPRITES[regionName] || [];
    
    return Promise.all(spritesToLoad.map(sprite => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = sprite.src;
        });
    }));
}
```

## Conclusiones y Trabajo Futuro

El sistema de mapas de Canarias representa un avance significativo en la estructura del juego, introduciendo una mayor complejidad y opciones para los jugadores. Las mejoras técnicas implementadas establecen una base sólida para futuras expansiones.

### Próximos Pasos

1. **Expansión de contenido**: Añadir más localizaciones de Canarias, como El Hierro y La Palma
2. **Misiones específicas**: Crear líneas de misiones exclusivas para cada región
3. **Eventos dinámicos**: Implementar eventos climáticos y temporales
4. **Sistemas de viaje rápido**: Añadir opciones de teleportación entre regiones ya descubiertas
5. **Mejoras de rendimiento**: Continuar optimizando el sistema para dispositivos menos potentes

---

*Última actualización: 6 de Enero, 2026*
