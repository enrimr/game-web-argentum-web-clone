# Estado Actual del Proyecto Argentum Demo

## Descripción General

Argentum Demo es un juego web 2D inspirado en Argentum Online, desarrollado utilizando tecnologías web modernas (JavaScript, HTML5 Canvas, CSS3). El juego se encuentra en fase de desarrollo y actualmente implementa varios sistemas fundamentales de un MMORPG 2D, incluyendo navegación por mapas, combate básico, interacción con NPCs, inventario y más.

## Arquitectura del Sistema

El juego está organizado en una arquitectura modular con los siguientes componentes principales:

### Componentes Core
- **Game.js**: Punto de entrada y orquestador principal del juego
- **GameLoop.js**: Maneja el bucle principal del juego y la actualización de estados
- **Renderer.js**: Responsable de renderizar todos los elementos gráficos del juego
- **Input.js**: Maneja la entrada de usuario (teclado y ratón)
- **EntityDetection.js**: Sistema de detección de colisiones y entidades
- **ObjectInteraction.js**: Gestiona las interacciones con objetos del mundo

### Sistema de Mundo
- **MapGenerator.js**: Genera y gestiona los diferentes tipos de mapas del juego
- **StaticMapLoader.js**: Carga mapas predefinidos desde archivos JSON
- **StaticWorldMaps.js**: Registro central de mapas estáticos disponibles
- **PreloadedMaps.js**: Sistema de precarga de mapas para optimizar rendimiento
- **TileTypes.js**: Define los tipos de tiles utilizados en los mapas

### Entidades y Objetos
- **NPC.js**: Implementación de NPCs con comportamientos e interacciones
- **NPCTypes.js**: Definiciones de tipos de NPCs y sus propiedades
- **Character.js**: Sistema de personajes jugadores
- **ObjectGenerator.js**: Genera objetos interactivos en el mundo

### Sistemas de Juego
- **Combat.js**: Sistema de combate
- **Inventory.js**: Sistema de inventario
- **Skills.js**: Sistema de habilidades (en desarrollo)
- **BuildingSystem.js**: Sistema de edificios y estructuras en el mundo
- **ItemTypes.js**: Definición de objetos y items del juego

### Interfaz de Usuario
- **UI.js**: Sistema general de interfaz
- **Dialogue.js**: Sistema de diálogos con NPCs
- **WorldMap.js**: Mapa del mundo interactivo
- **Minimap.js**: Mini mapa para navegación
- **DebugPanel.js**: Panel de herramientas para desarrollo

## Estado Actual de Mapas

El juego actualmente cuenta con varios tipos de mapas:

### Mapas Básicos (Iniciales)
- **newbie_city**: Ciudad inicial para nuevos jugadores (Ullathorpe)
- **newbie_field**: Campos seguros alrededor de la ciudad inicial
- **dark_forest**: Bosque con enemigos más peligrosos

### Mapas de Canarias (Recién Implementados)
- **canarias_capital**: Las Palmas de Gran Canaria, ciudad principal
- **canarias_playa_canteras**: Zona de playa recreativa
- **canarias_dunas**: Dunas de Maspalomas, zona desértica
- **canarias_teide_dungeon**: Mazmorra volcánica del Teide (área de alto nivel)

### Sistema de Generación de Mapas

El juego soporta tres tipos de mapas:

1. **Mapas Procedurales**: Generados dinámicamente mediante algoritmos
2. **Mapas Estáticos**: Predefinidos en código para garantizar consistencia
3. **Mapas JSON**: Cargados desde archivos JSON para mayor flexibilidad

Los mapas tienen múltiples capas que incluyen:
- Base (terreno)
- Objetos (paredes, árboles, etc.)
- Techos (construcciones)
- Puertas
- Ventanas

## Mejoras Recientes

### Sistema de Precarga de Mapas
Se ha implementado un sistema de precarga de mapas JSON que mejora significativamente el rendimiento y la experiencia de usuario:

- Carga asíncrona de mapas en segundo plano
- Indicador visual de progreso (barra de carga)
- Almacenamiento en caché de mapas para acceso rápido
- Manejo elegante de errores de carga

### Sistema de Mapas Multicapa
Se ha mejorado el sistema de mapas para soportar múltiples capas, lo que permite:

- Mayor realismo visual (edificios con techos)
- Interacción más compleja (puertas funcionales)
- Mejor separación de elementos visuales

### Nuevas Regiones
Se han añadido los mapas de las Islas Canarias con características únicas:

- Las Palmas: Ciudad con diseño urbano complejo
- Playa de Las Canteras: Área recreativa con agua navegable
- Dunas de Maspalomas: Zona desértica con enemigos específicos
- Volcán del Teide: Mazmorra de alto nivel con mecánicas únicas

## Próximos Pasos

El desarrollo continuará en las siguientes áreas:

1. **Mejora del Sistema de Combate**: Implementación de efectos visuales y mayor variedad de ataques
2. **Expansión de Contenido**: Nuevos mapas, misiones y NPCs
3. **Sistema de Progresión**: Mejora del sistema de niveles y habilidades
4. **Optimización**: Mejoras de rendimiento para dispositivos móviles
5. **Multijugador**: Implementación de características básicas multijugador

## Capturas de Pantalla

*[Las capturas de pantalla se añadirían aquí al exportar la documentación]*

## Cómo Probar

1. Abre el archivo `index.html` en un navegador web moderno
2. Utiliza WASD o las flechas del teclado para moverte
3. Presiona ESPACIO para interactuar con objetos o atacar
4. Utiliza el botón "Mostrar Mapa del Mundo" para ver todos los destinos disponibles

## Créditos

Este proyecto es una reimplementación educativa inspirada en Argentum Online, con fines de aprendizaje y experimentación con tecnologías web modernas.
