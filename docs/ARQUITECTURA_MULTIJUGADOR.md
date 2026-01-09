# Arquitectura Multijugador para Argentum Online Web

## Introducción

Este documento presenta un análisis y propuesta para transformar el actual juego Argentum Online Web de un juego single-player a un juego multijugador online. La implementación permitirá que múltiples jugadores interactúen en el mismo mundo, vean a otros jugadores, combatan, comercien e interactúen de manera similar al Argentum Online original.

## Estado Actual (Juego Single-Player)

Actualmente, el juego está estructurado como una aplicación de cliente web que maneja toda la lógica del juego localmente:

### Arquitectura Actual:

```
                    +-------------------+
                    |                   |
                    |  Cliente Web      |
                    |  (HTML/CSS/JS)    |
                    |                   |
                    +--------+----------+
                             |
                             v
                    +-------------------+
                    |                   |
                    |  Estado del Juego |
                    |  (state.js)       |
                    |                   |
                    +-------------------+
                             |
                             v
    +-------------+----------+------------+-----------+
    |             |          |            |           |
    v             v          v            v           v
+--------+  +----------+ +--------+  +--------+  +--------+
| Render |  | GameLoop | | Combat |  | Input  |  | Otros  |
| System |  |          | | System |  | System |  | Módulos|
+--------+  +----------+ +--------+  +--------+  +--------+
```

### Principales Componentes:

1. **Estado Global (`state.js`)**: Contiene todo el estado del juego (jugador, NPCs, enemigos, mapas, etc.)
2. **Game Loop (`GameLoop.js`)**: Maneja la actualización del estado del juego y la lógica de juego en cada frame
3. **Renderer (`Renderer.js` y módulos en `js/graphics/renderers/`)**: Maneja la representación visual del juego
4. **Sistemas diversos**:
   - Combat System (`Combat.js`)
   - Inventory System (`Inventory.js`)
   - Magic System (`MagicSystem.js`)
   - Building System (`BuildingSystem.js`)
   - Input System (`Input.js` y `ClickHandler.js`)

## Propuesta de Arquitectura Multijugador

Para convertir el juego a multijugador, necesitamos migrar a una arquitectura cliente-servidor donde el servidor sea la autoridad del estado del juego.

### Nueva Arquitectura Propuesta:

```
+-------------------+           +-------------------+
|                   |  WebSocket|                   |
|  Cliente Web 1    |<--------->|                   |
|  (HTML/CSS/JS)    |    JSON   |                   |
+-------------------+           |                   |
                                |                   |
+-------------------+           |                   |
|                   |  WebSocket|   Servidor del    |
|  Cliente Web 2    |<--------->|   Juego (Node.js) |
|  (HTML/CSS/JS)    |    JSON   |                   |
+-------------------+           |                   |
                                |                   |
       ...                      |                   |
                                |                   |
+-------------------+           |                   |
|                   |  WebSocket|                   |
|  Cliente Web N    |<--------->|                   |
|  (HTML/CSS/JS)    |    JSON   |                   |
+-------------------+           +--------+----------+
                                         |
                                         v
                               +---------+---------+
                               |                   |
                               |  Base de Datos    |
                               |  (MongoDB/Redis)  |
                               |                   |
                               +-------------------+
```

### Componentes del Servidor:

1. **Servidor de WebSocket**: Para mantener conexiones persistentes con los clientes.
2. **Gestor de Estado Global**: Mantiene el estado autoritativo del juego.
3. **Motor de Física/Colisiones**: Verifica movimientos y acciones de los jugadores.
4. **Gestor de Sesiones**: Maneja autenticación y sesiones de jugadores.
5. **Base de Datos**: Almacena datos persistentes (cuentas, personajes, inventarios, etc.).

### Componentes del Cliente:

1. **Gestor de Conexión**: Maneja la comunicación WebSocket con el servidor.
2. **Estado Local**: Mantiene una copia local del estado recibido del servidor.
3. **Predicción del Cliente**: Para movimientos fluidos mientras se espera confirmación del servidor.
4. **Reconciliación**: Corrige el estado local cuando difiere del servidor.
5. **Renderizado**: Muestra el estado actual del juego (ya existente).

## Protocolos y Comunicación

### Protocolo de Comunicación:

Usaremos WebSocket para la comunicación bidireccional en tiempo real:

1. **Mensajes del Cliente al Servidor**:
   - Movimiento del jugador
   - Acciones de combate
   - Interacción con NPCs/objetos
   - Uso de hechizos
   - Comercio con otros jugadores

2. **Mensajes del Servidor al Cliente**:
   - Estado actualizado del mundo
   - Acciones de otros jugadores
   - Eventos del mundo (aparición de enemigos, clima, etc.)
   - Resultados de acciones (daño, curación, etc.)

### Formato de Mensajes:

Utilizaremos JSON para los mensajes, con una estructura estandarizada:

```json
{
  "type": "tipo_mensaje",
  "timestamp": 1630000000,
  "data": {
    // Datos específicos según el tipo de mensaje
  }
}
```

## Mejoras Necesarias en el Front-End Antes de Implementar Multijugador

Antes de comenzar la implementación del sistema multijugador, hay algunas optimizaciones y refactorizaciones que deberíamos hacer en el cliente actual:

### 1. Separación de Estado y Lógica

Actualmente, el estado del juego (`state.js`) y la lógica están estrechamente acoplados. Necesitamos:

- Separar claramente el estado del juego de la lógica de actualizaciones
- Implementar un sistema de eventos para reaccionar a cambios de estado
- Crear un sistema de interpolación para movimientos suaves entre estados

### 2. Sistema de Predicción y Reconciliación

Para un multijugador fluido necesitamos:

- Implementar predicción del cliente para movimientos
- Sistema de reconciliación cuando el servidor corrige predicciones incorrectas
- Buffer de entradas para replicar comandos en caso de desincronización

### 3. Optimización del Renderizado

El sistema de renderizado ya ha sido refactorizado recientemente, pero para multijugador necesitamos:

- Optimizar el dibujado de múltiples entidades dinámicas
- Implementar culling más eficiente (no renderizar jugadores fuera de pantalla)
- Sistema de niveles de detalle (LOD) para jugadores distantes

### 4. Sistema de Autenticación

Actualmente no existe autenticación, por lo que necesitamos:

- Crear pantalla de inicio de sesión/registro
- Sistema de gestión de sesiones
- Persistencia de personajes

### 5. Interfaz de Usuario Mejorada

Para multijugador necesitamos nuevas interfaces:

- Lista de jugadores conectados
- Sistema de chat (global, cercano, privado, grupo)
- Sistema de clanes/grupos
- Indicadores de ping y conexión

## Arquitectura del Servidor

### Tecnologías Recomendadas:

1. **Node.js** con Express para la API REST
2. **Socket.IO** o **ws** para WebSockets
3. **MongoDB** para almacenamiento persistente
4. **Redis** para caché y estado temporal
5. **JWT** para autenticación

### Estructura del Servidor:

```
server/
├── src/
│   ├── config/           # Configuración del servidor
│   ├── controllers/      # Controladores HTTP
│   ├── models/           # Modelos de datos
│   ├── services/         # Servicios de lógica de negocio
│   ├── websocket/        # Gestión de WebSockets
│   │   ├── handlers/     # Manejadores de mensajes
│   │   └── rooms.js      # Gestión de salas/mapas
│   ├── game/             # Lógica del juego
│   │   ├── entities/     # Entidades del juego
│   │   ├── systems/      # Sistemas del juego
│   │   ├── world.js      # Gestión del mundo
│   │   └── gameLoop.js   # Bucle del juego
│   ├── utils/            # Utilidades
│   └── index.js          # Punto de entrada
├── package.json
└── .env                  # Variables de entorno
```

## Plan de Implementación

### Fase 1: Preparación del Front-End (Refactorización)

1. Separar claramente estado y lógica
2. Implementar sistema de eventos
3. Adaptar el GameLoop para modo online
4. Crear sistema de autenticación

### Fase 2: Implementación del Servidor Básico

1. Configurar servidor Node.js con WebSocket
2. Implementar autenticación
3. Crear estructura básica de datos en MongoDB
4. Desarrollar un GameLoop en el servidor

### Fase 3: Sincronización Cliente-Servidor

1. Implementar protocolo de comunicación
2. Desarrollar sistema de predicción y reconciliación
3. Sincronizar movimientos de jugadores
4. Gestionar conexiones/desconexiones

### Fase 4: Funcionalidades Multijugador

1. Implementar chat
2. Añadir combate PvP
3. Desarrollar comercio entre jugadores
4. Crear sistema de grupos/clanes

### Fase 5: Optimización y Escalabilidad

1. Optimizar rendimiento del servidor
2. Implementar sharding para diferentes mapas
3. Mejorar seguridad contra trampas
4. Implementar sistema de equilibrio de carga

## Conclusiones

La transformación a un juego multijugador es factible, pero requiere cambios significativos tanto en el cliente como la creación de una infraestructura de servidor. La arquitectura propuesta separa claramente las responsabilidades entre cliente y servidor, lo que permite un desarrollo más modular y mantenible.

Antes de comenzar con la implementación del servidor, es crucial realizar las refactorizaciones mencionadas en el cliente para facilitar la transición. Con una base sólida, podremos desarrollar incrementalmente las funcionalidades multijugador.

Esta arquitectura no solo permitirá una experiencia multijugador similar a Argentum Online, sino que también sentará las bases para futuras expansiones y características del juego.
