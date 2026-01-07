# Arquitectura del Sistema de Generación de Mapas

## Introducción

El sistema de generación de mapas de Argentum Demo emplea un enfoque híbrido que combina mapas estáticos predefinidos (a través de archivos JSON) y generación procedural de terreno. Este documento describe detalladamente la arquitectura del sistema, su funcionamiento y la relación entre sus componentes.

## Estructura General

El sistema de generación de mapas está organizado en varias capas de abstracción:

1. **MapGenerator**: Punto de entrada principal que coordina todo el proceso
2. **Cargadores de mapas estáticos**: Para mapas predefinidos en JSON
3. **Generadores procedurales**: Para mapas generados dinámicamente
4. **Sistema de capas**: Para representar diferentes elementos visuales del mapa

## Componentes Principales

### 1. MapGenerator.js

Este módulo actúa como el coordinador central para la generación de mapas:

- Función `generateMap(mapType)`: Punto de entrada principal
- Primero intenta cargar un mapa estático para el tipo especificado
- Si no existe uno estático, recurre a la generación procedural según el tipo
- Extrae capas específicas (como techos) y las procesa

```javascript
export function generateMap(mapType) {
    // Casos especiales para mapas de principiantes
    if (mapType === 'newbie_city') {
        const mapData = generateNewbieCityWithBuildings();
        extractRoofLayer(mapData);
        return mapData;
    }
    
    // Intentar cargar mapa estático
    const staticMapData = loadStaticMap(mapType);
    if (staticMapData) return staticMapData;
    
    // Generación procedural si no hay mapa estático
    let mapData;
    switch (mapType) {
        case 'field': mapData = generateFieldMap(); break;
        case 'city': mapData = generateCityMap(); break;
        // etc...
    }
    
    extractRoofLayer(mapData);
    return mapData;
}
```

### 2. StaticMapLoader.js

Se encarga de cargar mapas estáticos desde archivos JSON:

- `loadStaticMap(mapType)`: Busca y carga un archivo JSON para el mapa especificado
- `combineMapLayers(mapData)`: Procesa las capas del mapa para construir la matriz final

### 3. StaticMapGenerator.js

Define funciones que generan mapas estáticos específicos codificados directamente:

- `generateNewbieCityLayout()`: Crea el mapa de la ciudad inicial
- `generateNewbieFieldLayout()`: Crea el mapa del campo de entrenamiento
- `generateDarkForestLayout()`: Crea el mapa del bosque oscuro

### 4. BasicMapGenerator.js y DungeonGenerator.js

Contienen algoritmos procedurales para generar diferentes tipos de mapas dinámicamente:

- Campos abiertos con obstáculos aleatorios
- Ciudades con calles y edificios
- Mazmorras con salas y pasillos
- Bosques con diferentes densidades de árboles

### 5. BuildingIdentifier.js

Responsable de identificar estructuras de edificios en el mapa:

- `identifyBuildingsFromMap(map)`: Analiza el mapa para detectar edificios
- `extractRoofLayer(map)`: Separa los techos de los edificios en una capa aparte

## Sistema de Capas

El juego utiliza un sistema de capas para representar diferentes elementos del mapa. Estas capas se organizan tanto en los archivos JSON como en el estado del juego:

1. **Capa Base** (`gameState.map`, `layers.base` en JSON): 
   - Terreno básico (hierba, agua, caminos)
   - Forma la estructura fundamental del mapa
   - Define las zonas caminables y no caminables

2. **Capa de Objetos** (`layers.objects` en JSON): 
   - Árboles, piedras y objetos del mundo
   - Estructuras de edificios y paredes
   - Elementos decorativos

3. **Capa de Techos** (`gameState.roofLayer`, `layers.roofs` en JSON): 
   - Techos de edificios que se muestran/ocultan al entrar
   - Se renderizan condicionalmente según la posición del jugador
   - Código `10` representa típicamente un techo

4. **Capa de Puertas** (`gameState.doorLayer`, `layers.doors` en JSON): 
   - Puertas que pueden abrirse o cerrarse
   - Código `12` representa típicamente una puerta cerrada
   - Se puede interactuar con ellas mediante la tecla de acción

5. **Capa de Ventanas** (`gameState.windowLayer`, `layers.windows` en JSON): 
   - Ventanas de edificios
   - Código `14` representa típicamente una ventana
   - Elemento decorativo que mejora la apariencia visual

### Ejemplo de estructura de capas en un archivo JSON:

```json
{
  "layers": {
    "base": [
      [4,4,4,4,4],
      [4,0,0,0,4],
      [4,0,0,0,4],
      [4,4,4,4,4]
    ],
    "objects": [
      [0,0,0,0,0],
      [0,5,5,5,0],
      [0,0,0,0,0],
      [0,0,0,0,0]
    ],
    "roofs": [
      [0,0,0,0,0],
      [0,10,10,10,0],
      [0,0,0,0,0],
      [0,0,0,0,0]
    ],
    "doors": [
      [0,0,0,0,0],
      [0,0,12,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0]
    ],
    "windows": [
      [0,0,0,0,0],
      [0,14,0,14,0],
      [0,0,0,0,0],
      [0,0,0,0,0]
    ]
  }
}
```

### Procesamiento de capas durante la carga:

1. El cargador de mapas lee cada capa del archivo JSON
2. Las capas se procesan y se asignan a sus correspondientes arrays en el estado del juego
3. Se identifican edificios y estructuras especiales con el `BuildingIdentifier`
4. El renderizador dibuja las capas en el orden correcto (base, objetos, entidades, techos)

## Flujo de Datos

```
MapGenerator.js
    ↓
    ┌─────────────────────────┬─────────────────────────┐
    ↓                         ↓                         ↓
StaticMapLoader.js    StaticMapGenerator.js    BasicMapGenerator.js
(JSON files)          (Hardcoded maps)         (Procedural maps)
    ↓                         ↓                         ↓
    └─────────────────────────┴─────────────────────────┘
    ↓
BuildingIdentifier.js
    ↓
gameState (map layers)
```

## Relación entre JSON y Código Fuente

### Archivos JSON

Los mapas estáticos se definen en archivos JSON (ubicados en `/js/world/maps/`):
- `newbie_city.json`
- `newbie_field.json`
- `dark_forest.json`

Estos archivos contienen:
- Metadatos del mapa (nombre, descripción, tipo)
- Matrices numéricas que representan las diferentes capas del mapa
- Definiciones de NPCs, portales y objetos

Ejemplo de estructura JSON:
```json
{
  "name": "🏘️ Ciudad de Ullathorpe",
  "description": "Ciudad inicial para aventureros novatos",
  "type": "city",
  "layers": {
    "base": [...],
    "objects": [...]
  },
  "portals": [...],
  "npcs": [...]
}
```

### Código Generador

El código fuente de JavaScript puede generar mapas de dos maneras:

1. **Cargando archivos JSON** (`StaticMapLoader.js`):
   - Lee la estructura JSON
   - Procesa las capas
   - Las combina según sea necesario

2. **Generando mapas proceduralmente**:
   - `BasicMapGenerator.js`: Genera terrenos naturales usando algoritmos
   - `DungeonGenerator.js`: Genera mazmorras con salas y corredores
   - `StaticMapGenerator.js`: Contiene mapas hardcodeados para ciertos escenarios

## Evolución y Formatos

El sistema ha evolucionado con el tiempo, mostrando dos enfoques diferentes:

1. **Formato Simple (antiguo)**: Mapa como un único array 2D donde cada celda contiene un tipo de tile
   ```javascript
   const map = [
     [4,4,4,4,4,4],
     [4,0,0,0,0,4],
     [4,0,0,0,0,4],
     [4,4,4,4,4,4]
   ];
   ```

2. **Formato Multicapa (actual)**: Objeto con múltiples arrays 2D para diferentes capas
   ```javascript
   const mapData = {
     map: [...],          // Capa base
     objectsLayer: [...], // Objetos
     roofLayer: [...],    // Techos
     doorLayer: [...],    // Puertas
     windowLayer: [...]   // Ventanas
   };
   ```

Este cambio refleja la mayor complejidad y capacidades del sistema a medida que evoluciona.

## Renderizado

Una vez generado el mapa y sus capas, el sistema de renderizado (en `Renderer.js`) dibuja cada capa en orden:
1. La capa base (terreno)
2. Objetos y estructuras
3. Entidades (jugador, NPCs, enemigos)
4. Techos (condicional según posición del jugador)

## Desafíos y Consideraciones

- **Rendimiento**: Mapas grandes pueden afectar el rendimiento
- **Compatibilidad**: Mantener compatibilidad entre formatos antiguos y nuevos
- **Persistencia**: Asegurar que los elementos del mundo (enemigos muertos, cofres abiertos) persistan al cambiar de mapa
- **Navegabilidad**: Garantizar que los mapas generados siempre sean navegables

## Conclusión

El sistema de generación de mapas combina eficientemente mapas predefinidos estáticos y generación procedural para crear un mundo diverso y detallado. La arquitectura por capas permite una representación rica del entorno de juego mientras mantiene un código modular y extensible.

---

*Documento creado: 01/06/2026*
