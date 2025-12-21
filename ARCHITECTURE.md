# 🏗️ Arquitectura del Motor de Juego - Argentum Demo

## 📋 Índice
1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Módulos del Sistema](#módulos-del-sistema)
4. [Flujo de Datos](#flujo-de-datos)
5. [Patrones de Diseño](#patrones-de-diseño)

---

## 🎯 Visión General

El motor del juego está organizado en una arquitectura modular basada en componentes independientes que se comunican a través de un sistema de estado centralizado.

### Principios de Diseño:
- **Separación de responsabilidades**: Cada módulo tiene una única responsabilidad
- **Bajo acoplamiento**: Los módulos se comunican a través de interfaces definidas
- **Alta cohesión**: Código relacionado está agrupado
- **Escalabilidad**: Fácil añadir nuevas funcionalidades

---

## 📁 Estructura de Archivos

```
argentum-demo/
├── index.html              # Punto de entrada HTML
├── styles.css              # Estilos globales
├── README.md              # Documentación del proyecto
├── ARCHITECTURE.md        # Este archivo
│
└── js/
    ├── main.js            # Punto de entrada, inicialización
    ├── config.js          # Configuración global del juego
    ├── state.js           # Estado centralizado del juego
    │
    ├── core/
    │   ├── Game.js        # Loop principal del juego
    │   └── Input.js       # Manejo de entrada del usuario
    │
    ├── entities/
    │   ├── Player.js      # Lógica del jugador
    │   └── Enemy.js       # Lógica de enemigos (IA)
    │
    ├── systems/
    │   ├── Renderer.js    # Sistema de renderizado
    │   ├── Collision.js   # Detección de colisiones
    │   ├── Level.js       # Sistema de niveles/experiencia
    │   └── Combat.js      # Sistema de combate
    │
    ├── world/
    │   ├── Map.js         # Generación y gestión del mapa
    │   └── Objects.js     # Objetos del mundo (cofres, oro)
    │
    ├── graphics/
    │   └── Sprites.js     # Generación de sprites
    │
    └── ui/
        └── UI.js          # Actualización de interfaz
```

---

## 🔧 Módulos del Sistema

### 1. **main.js** - Punto de Entrada
```javascript
// Responsabilidades:
- Inicializar todos los módulos
- Crear instancia del juego
- Manejar carga de recursos
```

### 2. **config.js** - Configuración
```javascript
// Constantes globales:
- Tamaños de tiles
- Dimensiones del mapa
- Valores de balance (daño, EXP, etc)
```

### 3. **state.js** - Estado del Juego
```javascript
// Estado centralizado:
- Datos del jugador
- Lista de enemigos
- Objetos del mundo
- Mapa actual
- Estadísticas
```

### 4. **core/Game.js** - Loop Principal
```javascript
// Game Loop:
- update(deltaTime)
- render()
- Coordina todos los sistemas
```

### 5. **core/Input.js** - Entrada
```javascript
// Manejo de input:
- Teclas presionadas
- Eventos de teclado
- Convertir input a acciones
```

### 6. **entities/Player.js** - Jugador
```javascript
// Lógica del jugador:
- Movimiento
- Interacciones
- Ataque
- Inventario
```

### 7. **entities/Enemy.js** - Enemigos
```javascript
// IA de enemigos:
- Pathfinding
- Comportamiento de ataque
- Estados (patrullar, perseguir, atacar)
```

### 8. **systems/Renderer.js** - Renderizado
```javascript
// Dibujado en canvas:
- Renderizar mapa
- Renderizar entidades
- Renderizar efectos
- Optimización de draw calls
```

### 9. **systems/Collision.js** - Colisiones
```javascript
// Detección:
- Colisiones con tiles
- Colisiones entre entidades
- Utilidades de distancia
```

### 10. **systems/Level.js** - Niveles
```javascript
// Progresión:
- Cálculo de EXP
- Level up
- Escalado de stats
```

### 11. **systems/Combat.js** - Combate
```javascript
// Sistema de combate:
- Cálculo de daño
- Aplicar daño
- Muerte de entidades
```

### 12. **world/Map.js** - Mapa
```javascript
// Mundo:
- Generación procedural
- Tiles walkable/unwalkable
- Consultas de tile
```

### 13. **world/Objects.js** - Objetos
```javascript
// Items del mundo:
- Generación de cofres
- Generación de oro
- Lógica de recogida
```

### 14. **graphics/Sprites.js** - Sprites
```javascript
// Gráficos:
- Generación procedural de sprites
- Cache de sprites
- Utilidades de dibujo
```

### 15. **ui/UI.js** - Interfaz
```javascript
// UI:
- Actualizar stats
- Actualizar barras
- Mensajes de chat
```

---

## 🔄 Flujo de Datos

```
┌─────────────┐
│   main.js   │ Inicializa todo
└──────┬──────┘
       │
       v
┌─────────────┐
│   Game.js   │ ◄── Coordina todos los sistemas
└──────┬──────┘
       │
       ├──► Input.js ──► Player.js ──┐
       │                              │
       ├──► Enemy.js ─────────────────┤
       │                              │
       ├──► Combat.js ────────────────┤
       │                              v
       ├──► Level.js ────────► state.js (Estado Central)
       │                              │
       ├──► Collision.js ◄────────────┤
       │                              │
       ├──► Map.js ◄──────────────────┤
       │                              │
       ├──► Objects.js ◄──────────────┘
       │
       └──► Renderer.js ──► Canvas
                │
                └──► UI.js ──► DOM
```

---

## 🎨 Patrones de Diseño Utilizados

### 1. **Singleton**
- `state.js`: Un único estado global del juego

### 2. **Module Pattern**
- Cada archivo exporta una clase o módulo independiente

### 3. **Observer Pattern**
- UI se actualiza reactivamente a cambios en el estado

### 4. **Component Pattern**
- Entidades (Player, Enemy) son componentes reutilizables

### 5. **Game Loop Pattern**
- Loop separado de update/render en Game.js

---

## 📊 Diagrama de Clases Principal

```
┌──────────────┐
│     Game     │
├──────────────┤
│ - state      │
│ - renderer   │
│ - input      │
├──────────────┤
│ + init()     │
│ + update()   │
│ + render()   │
└──────┬───────┘
       │ manages
       │
       ├──► ┌────────────┐
       │    │   Player   │
       │    ├────────────┤
       │    │ - x, y     │
       │    │ - hp, exp  │
       │    ├────────────┤
       │    │ + move()   │
       │    │ + attack() │
       │    └────────────┘
       │
       └──► ┌────────────┐
            │   Enemy    │
            ├────────────┤
            │ - x, y     │
            │ - hp       │
            ├────────────┤
            │ + update() │
            │ + attack() │
            └────────────┘
```

---

## 🔧 Cómo Añadir Nuevas Funcionalidades

### Ejemplo: Añadir un nuevo tipo de enemigo

1. **Crear archivo**: `js/entities/NewEnemy.js`
2. **Extender Enemy**: Heredar comportamiento base
3. **Registrar en state**: Añadir a la lista de enemigos
4. **Actualizar Renderer**: Añadir sprite si es necesario
5. **Documentar**: Actualizar este archivo

### Ejemplo: Añadir un nuevo sistema

1. **Crear archivo**: `js/systems/NewSystem.js`
2. **Integrar en Game**: Llamar desde el loop
3. **Conectar con state**: Leer/escribir estado necesario
4. **Testing**: Verificar integración
5. **Documentar**: Actualizar este archivo

---

## 📝 Historial de Cambios

### Versión 2.0 - Refactorización Modular
**Fecha**: 21/12/2025
**Cambios**:
- Separación del código en módulos independientes
- Creación de sistema de carpetas organizado
- Implementación de arquitectura escalable
- Documentación de arquitectura

### Versión 1.0 - Implementación Inicial
**Fecha**: 21/12/2025
**Funcionalidades**:
- Motor de juego básico en un solo archivo
- Sistema de combate
- IA de enemigos
- Sistema de niveles

---

## 🎯 Próximas Mejoras Sugeridas

1. **Sistema de Items**: Crear módulo `systems/Inventory.js`
2. **Sistema de Habilidades**: Crear `systems/Skills.js`
3. **Múltiples Mapas**: Expandir `world/Map.js`
4. **Guardar/Cargar**: Crear `systems/SaveLoad.js`
5. **Audio**: Crear `audio/SoundManager.js`
6. **Partículas**: Crear `graphics/Particles.js`

---

## 📚 Referencias y Recursos

- **Game Programming Patterns**: https://gameprogrammingpatterns.com/
- **JavaScript Modules**: https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules
- **Canvas API**: https://developer.mozilla.org/es/docs/Web/API/Canvas_API

---

*Última actualización: 21/12/2025*
