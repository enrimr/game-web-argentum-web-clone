# Exportación Automática de Mapas a JSON

Este documento explica cómo funciona el sistema de exportación automática de mapas procedurales a archivos JSON.

## Funcionamiento

El sistema permite exportar automáticamente los mapas generados proceduralmente a archivos JSON con un formato específico. Esto facilita:
- La depuración y visualización de los mapas generados
- La reutilización de mapas procedurales como mapas estáticos
- La edición manual de mapas generados automáticamente

## Características principales

1. **Integración con panel de depuración**: Los botones de exportación se integran directamente en el panel de depuración del juego, accesible mediante el botón 🛠️ en la esquina superior derecha.

3. **Botón de exportación del mapa actual**: Se añade un botón naranja destacado que permite exportar el mapa en el que el jugador se encuentra actualmente, con todos sus elementos y estado actual.

4. **Botones de exportación específicos**: Se añaden botones verdes para exportar mapas específicos que se hayan generado proceduralmente.

5. **Formato optimizado**: Las matrices del mapa se generan en un formato compacto con cada fila en una sola línea, según la especificación requerida:
   ```json
   "base": [
     [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
     [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
     [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4]
   ]
   ```

## Uso

1. **Acceso a las opciones de exportación**:
   - Hacer clic en el botón de herramientas 🛠️ en la esquina superior derecha
   - El panel de depuración se abrirá mostrando varias secciones
   - Desplazarse hacia abajo hasta encontrar la sección "Exportación de mapas"

3. **Exportación del mapa actual**: 
   - Hacer clic en el botón naranja "📍 Exportar Mapa Actual" dentro del panel de depuración
   - Esta opción exporta el mapa donde se encuentra el jugador, incluyendo:
     * Todas las capas del mapa (base, techos, puertas, ventanas)
     * Todos los objetos interactivos presentes (cofres, portales, etc.)
     * Todos los enemigos actuales con sus posiciones y niveles
     * Todos los NPCs con sus datos (posición, nombre, diálogos)
     * La posición actual del jugador
   - El archivo se guarda con el formato `nombre_mapa_exported.json`.

4. **Exportación de mapas específicos**: 
   - Hacer clic en el botón verde correspondiente (ej: "Exportar newbie_city_detailed")
   - Esta opción exporta la versión original generada del mapa.

4. **Uso de los archivos exportados**: Los archivos JSON generados pueden usarse como mapas estáticos añadiéndolos a la carpeta `js/world/maps/` y referenciándolos desde `StaticWorldMaps.js`.

## Implementación técnica

El sistema se compone de dos archivos principales:

### MapExporter.js

Este módulo proporciona las funciones necesarias para exportar mapas:

- `exportMapToJSON(mapName, mapData, forceOverwrite, useProvidedEntities)`: Exporta un mapa a un archivo JSON
  * El parámetro `useProvidedEntities` indica si se deben usar los objetos, enemigos y NPCs proporcionados en `mapData`
- `exportCurrentMap()`: Exporta el mapa actual donde se encuentra el jugador con todos sus elementos
- `addExportButton(mapName, mapData)`: Añade un botón a la UI para exportar manualmente
- `addCurrentMapExportButton(container)`: Añade el botón para exportar el mapa actual
- `formatMapJSON(mapObject)`: Formatea el JSON con el formato de matriz especificado
- `getMapDisplayName(mapName)`: Genera nombres descriptivos para los mapas
- `extractPortalsFromObjects(objects)`: Extrae información de portales de la lista de objetos

### Integración con StaticMapLayouts.js

La función `generateNewbieCityWithBuildings()` ha sido modificada para:
1. Generar el mapa normalmente
2. Exportar automáticamente el mapa a JSON 
3. Añadir un botón a la UI para permitir exportaciones manuales

## Expansión del sistema

Este sistema puede extenderse fácilmente a otros mapas procedurales:

```javascript
// Ejemplo de uso para otros mapas procedurales
import { exportMapToJSON, addExportButton } from '../world/MapExporter.js';

function generateCustomMap() {
    // Generar el mapa...
    const mapData = { /* datos del mapa */ };
    
    // Exportar automáticamente
    exportMapToJSON('custom_map', mapData);
    
    // Añadir botón de exportación al panel de depuración
    addExportButton('custom_map', mapData, true);
    
    return mapData;
}
```

El parámetro `addToDebugPanel` (por defecto es `true`) determina si el botón se añade al panel de depuración o directamente a la interfaz principal. Para uso normal, se recomienda mantenerlo en `true`.

### Ventajas de la exportación del mapa actual

La función de exportar el mapa actual es particularmente útil para:

1. **Capturar el estado exacto del juego**: Permite guardar un mapa tal como se ve en un momento específico, incluyendo:
   - Todas las capas del mapa
   - Todos los objetos interactivos (cofres, portales, etc.)
   - Todos los enemigos con sus posiciones y niveles
   - Todos los NPCs con sus diálogos
   - La posición actual del jugador

2. **Depurar interacciones dinámicas**: Si algo cambia inesperadamente en el mapa, se puede exportar para analizar qué ha ocurrido exactamente con cada elemento.

3. **Crear variaciones de mapas**: Explorar un mapa, mover elementos o cambiar características, matar enemigos, abrir cofres, y luego exportarlo como una nueva variante lista para usar.

4. **Preservar experiencias de juego únicas**: Guardar momentos específicos o configuraciones interesantes que surjan durante el juego, con todos sus detalles.

5. **Compartir estados del juego**: Facilitar compartir con otros desarrolladores configuraciones específicas del juego para pruebas o depuración.

### Formato del archivo JSON generado

El JSON generado por el exportador sigue este formato:

```json
{
  "name": "🏘️ Ciudad de Ullathorpe (Exportado)",
  "description": "Estado del mapa newbie_city en momento de exportación",
  "type": "city",
  "safeZone": true,
  "worldPosition": { "x": 100, "y": 100 },
  "layers": {
    "base": [
      [4,4,4,4,4,4,4,4],
      [4,0,0,0,0,0,0,4]
    ],
    "roofs": [...],
    "doors": [...],
    "windows": [...]
  },
  "portals": [
    { "x": 10, "y": 5, "targetMap": "newbie_field", "targetX": 25, "targetY": 30, "name": "Campo" }
  ],
  "npcs": [
    { "type": "merchant", "x": 15, "y": 20, "name": "Vendedor", "dialogue": {...} }
  ],
  "enemies": [
    { "type": "goblin", "x": 8, "y": 12, "level": 3 }
  ],
  "objects": [
    { "type": "chest", "x": 5, "y": 5, "contents": {...} }
  ],
  "playerSpawn": { "x": 10, "y": 10 }
}
```

---

Con este sistema, los desarrolladores pueden convertir fácilmente mapas procedurales en archivos JSON estáticos, facilitando el desarrollo y la depuración.
