# 🗡️ Argentum Demo - MMORPG 2D

Una pequeña demo inspirada en el clásico juego argentino **Argentum Online**, un MMORPG 2D de rol.

## 🎮 Características

- **Movimiento del personaje**: Usa las flechas del teclado o WASD para moverte por el mapa
- **Mapa procedural**: Cada vez que cargas el juego, el mapa se genera aleatoriamente con:
  - Césped (terreno caminable)
  - Agua (bordes del mapa)
  - Árboles (obstáculos)
  - Piedras (obstáculos)
- **Sistema de objetos**:
  - Cofres con oro (presiona ESPACIO para abrir)
  - Monedas de oro (recógelas automáticamente al pasar por encima)
  - **Items en el suelo**: Pociones, flechas, armas y escudos
- **Sistema de inventario completo**:
  - **12 slots** para tipos diferentes de items
  - **Stacking inteligente**: Pociones (máx 100) y flechas (máx 500) se apilan
  - **Items únicos**: Armas y escudos ocupan slot individual
  - **Cantidades siempre visibles**: No necesitas hover para ver números
  - **Click para equipar**: Sistema de equipamiento completo
- **Sistema de equipamiento**:
  - **Equipables**: Espadas y escudos (click en inventario)
  - **Visuales únicos**: Borde dorado y glow para items equipados
  - **Reemplazo automático**: Equipar sobre item existente lo reemplaza
  - **Feedback completo**: Mensajes en chat y tooltips actualizados
- **Sistema de combate**:
  - Enemigos (goblins) con IA avanzada que te persiguen
  - Acércate a un enemigo y presiona ESPACIO para atacar
  - Derrota enemigos para ganar oro y experiencia
  - Sistema de daño dinámico (escala con nivel)
- **Sistema de niveles y experiencia**:
  - Gana EXP derrotando enemigos
  - Level up automático con mejoras de stats
  - Barra de experiencia visual animada
  - Curación completa al subir de nivel
- **Interfaz RPG completa**:
  - Barras de vida, maná y experiencia
  - Sistema de chat con mensajes del juego
  - Panel de estadísticas detallado
  - Diseño responsive que se adapta a cualquier pantalla

## 🚀 Cómo jugar

1. **Importante**: Este juego debe ser ejecutado bajo un servidor web para evitar errores CORS. [Ver instrucciones de ejecución](EJECUCION.md)
2. Usa las **flechas del teclado** o **WASD** para mover tu personaje
3. Presiona **ESPACIO** para interactuar con objetos o atacar enemigos
4. Recoge todo el oro que puedas explorando el mapa
5. Derrota a los goblins para obtener más recompensas

## 🎨 Assets

Los sprites están generados proceduralmente usando Canvas 2D, creando un estilo pixel art retro:
- **Personaje**: Guerrero con espada dorada
- **Enemigos**: Goblins verdes con ojos rojos
- **Objetos**: Cofres de madera, monedas de oro
- **Terreno**: Césped, agua, piedras y árboles

## 🛠️ Tecnologías utilizadas

- HTML5 Canvas para renderizado 2D
- JavaScript vanilla (sin frameworks)
- CSS3 para la interfaz de usuario
- Sprites generados proceduralmente (sin necesidad de descargar imágenes externas)

## 📝 Controles

| Tecla | Acción |
|-------|--------|
| ⬆️ / W | Mover arriba |
| ⬇️ / S | Mover abajo |
| ⬅️ / A | Mover izquierda |
| ➡️ / D | Mover derecha |
| ESPACIO | Interactuar / Atacar |

## 🎯 Objetivos del juego

- Explora todo el mapa
- Encuentra y abre todos los cofres
- Recoge todas las monedas de oro
- Derrota a todos los goblins
- Acumula la mayor cantidad de oro posible

## 📚 Documentación Técnica

El proyecto incluye documentación técnica detallada sobre su arquitectura y sistemas:

- [Arquitectura del Motor de Juego](ARCHITECTURE.md) - Visión general de la estructura del motor
- [Instrucciones de Ejecución](EJECUCION.md) - Cómo lanzar el juego correctamente usando un servidor web
- [Documentación de Sistemas](docs/README.md) - Documentación detallada de los subsistemas
  - [Sistema de Generación de Mapas](docs/sistema-generacion-mapas.md) - Arquitectura de generación de mapas estáticos y procedurales
  - [Estado Actual del Juego](docs/ESTADO_ACTUAL.md) - Descripción del estado actual del proyecto
  - [Mapas de Canarias](docs/MAPAS_CANARIAS.md) - Documentación técnica sobre los mapas de las Islas Canarias

## 🔮 Posibles mejoras futuras

- Más tipos de enemigos
- Sistema de misiones complejo
- Sistema de gremios/clanes
- Sistema de comercio entre jugadores
- Sistema de hechizos avanzado
- Editor de mapas en el navegador
- Multijugador online

---

¡Disfruta de esta pequeña aventura inspirada en el legendario Argentum Online! 🎮✨
