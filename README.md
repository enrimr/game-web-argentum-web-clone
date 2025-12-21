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

1. Abre el archivo `index.html` en tu navegador web
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

## 🔮 Posibles mejoras futuras

- Sistema de niveles y experiencia
- Más tipos de enemigos
- Items equipables (armas, armaduras)
- Sistema de hechizos usando maná
- Mapas múltiples conectados
- NPCs con diálogos
- Sistema de misiones más complejo
- Multijugador online

---

¡Disfruta de esta pequeña aventura inspirada en el legendario Argentum Online! 🎮✨
