# 📖 Manual de Usuario - Argentum Demo

## 🎮 Introducción

Bienvenido a **Argentum Demo**, un MMORPG 2D inspirado en Argentum Online. Este manual te guiará a través de todas las funcionalidades del juego.

---

## 🕹️ Controles Básicos

### **Movimiento**
- **Flechas** o **WASD**: Mover el personaje
- **Shift + Dirección**: Cambiar orientación sin moverse

### **Interacción**
- **Espacio**: Interactuar con objetos/NPCs/atacar enemigos
- **E**: Abrir/cerrar puertas
- **Click izquierdo**: Moverse automáticamente a la posición/interactuar
- **Click en entidad**: Auto-movimiento hacia objetivo

### **Combate**
- **X**: Disparar flecha (requiere arco y flechas equipados)
- **M**: Abrir panel de hechizos
- **Click en enemigo**: Atacar (cuerpo a cuerpo o a distancia)

### **Interfaz**
- **I**: Abrir/cerrar inventario
- **🛠️ (esquina superior derecha)**: Panel de depuración

---

## 👤 Tu Personaje

### **Estadísticas Principales**
- **HP (Vida)**: Puntos de salud actual/máxima
- **Mana**: Energía mágica para hechizos
- **Nivel**: Nivel actual del personaje
- **Experiencia**: Progreso hacia el siguiente nivel
- **Oro**: Moneda del juego

### **Progresión**
- Mata enemigos para ganar **experiencia** y **oro**
- Cada nivel aumenta:
  - +20 HP máximo
  - +10 Mana máximo
  - +2 daño base

### **Muerte y Resurrección**
- Al morir, te conviertes en **fantasma** 👻
- Como fantasma:
  - Puedes atravesar enemigos
  - No puedes atacar ni recoger objetos
  - Tus objetos caen al suelo
- **Resucitar**: Visita al Sacerdote Marcos (500 oro)

---

## 🎒 Sistema de Inventario

### **Capacidad**
- **45 slots totales** (5 páginas de 9 slots cada una)
- Navegación con botones **◀️** y **▶️**
- Indicador: "Página X/5"

### **Gestión de Items**
- **Click izquierdo**: Usar/Equipar item
- **Click derecho**: Menú contextual
  - Equipar/Desequipar
  - Tirar al suelo
- **Items stackables**: Pociones, flechas (se apilan automáticamente)
- **Items equipables**: Armas, armaduras, escudos, cascos

### **Items Equipados**
- Se marcan con borde dorado en el inventario
- Se muestran visualmente en el personaje
- Slots de equipamiento:
  - **Weapon**: Arma principal
  - **Shield**: Escudo
  - **Body**: Armadura corporal
  - **Head**: Casco
  - **Ammunition**: Flechas (automático con arco)

---

## ⚔️ Sistema de Combate

### **Combate Cuerpo a Cuerpo**
1. Acércate al enemigo (1 tile de distancia)
2. Oriéntate hacia él (automático con click)
3. Presiona **Espacio** o **Click** para atacar
4. El daño depende de tu nivel y arma equipada

### **Combate a Distancia**
1. Equipa un **arco** (arma)
2. Equipa **flechas** (munición)
3. Click en enemigo a distancia
4. Disparo automático si tienes línea de visión

### **Enemigos**
- **Goblin**: Débil, principiantes
- **Skeleton**: Medio, no-muertos
- **Bandit**: Medio, ladrones
- **Elemental**: Medio, mágicos
- **Orc**: Fuerte, guerreros
- **Troll**: Muy fuerte, tanques
- **Demon**: Élite, peligrosos
- **Dragon**: Jefe, extremadamente peligroso

---

## 🛒 Sistema de Comercio

### **NPCs Comerciantes**

#### **Mercader Andrés** (General)
- **Ubicación**: Ciudad de Ullathorpe
- **Vende**: Pociones (HP, Mana, Antídoto), Flechas
- **Precios**: 5-120 oro

#### **Herrero Goliath**
- **Ubicación**: Ciudad de Ullathorpe
- **Vende**: 
  - Armas (espadas): 500-1,000 oro
  - Escudos: 400-800 oro
  - **Armaduras**: 800-3,000 oro
  - **Cascos**: 400-1,500 oro
- **Servicios**: Reparar equipo (50 oro), Mejorar armas (100 oro)
- **Diálogo**: Selecciona "1. Ver tienda" para comprar

#### **Carpintero Eleuterio**
- **Ubicación**: Banderbill
- **Vende**: Arcos (600-1,500 oro), Flechas (3 oro/u)
- **Servicios**: Crafteo de arcos y flechas

#### **Alquimista Morgana**
- **Ubicación**: Mercado
- **Vende**: Pociones (HP, Mana, Antídoto)
- **Servicios**: Crafteo de pociones

#### **Mago Nemesius**
- **Ubicación**: Ciudad
- **Vende**: Libros de hechizos, Pergaminos mágicos

### **Cómo Comprar**
1. Acércate al NPC
2. Presiona **Espacio** o **Click**
3. Selecciona "Comerciar" o "Ver tienda"
4. Click en item para comprar
5. Confirma la compra

---

## 🎨 Sistema de Equipamiento

### **Tipos de Equipamiento**

#### **Armaduras Corporales** (Slot: Body)
- **Armadura de Cuero**: +15 defensa (800 oro)
- **Armadura de Placas**: +30 defensa (1,500 oro)
- **Armadura Dorada**: +40 defensa (3,000 oro)
- **Túnica de Mago**: +5 defensa, +20 mana (N/D)

#### **Cascos** (Slot: Head)
- **Casco de Cuero**: +8 defensa (400 oro)
- **Casco Completo**: +15 defensa (750 oro)
- **Casco Dorado**: +20 defensa (1,500 oro)
- **Capucha Mágica**: +3 defensa, +10 mana (N/D)

#### **Armas** (Slot: Weapon)
- **Espada**: +15 daño (500 oro)
- **Espada de Hierro**: +25 daño (1,000 oro)
- **Arco**: +12 daño, rango 8 (600 oro)
- **Arco Élfico**: +18 daño, rango 10 (1,500 oro)

#### **Escudos** (Slot: Shield)
- **Escudo**: +10 defensa (400 oro)
- **Escudo de Hierro**: +20 defensa (800 oro)

### **Sistema de Capas Visuales**
El equipamiento se renderiza en capas sobre el personaje:
```
Capa 1: Cuerpo base
Capa 2: Armadura/Túnica
Capa 3: Casco
Capa 4: Arma
Capa 5: Escudo
```

---

## 🤖 Jugadores Bot

### **¿Qué son los Bots?**
Jugadores AI que pueblan el mundo, simulando otros jugadores.

### **Características de los Bots**
- **Nombre único**: Ej. "Gandalf247", "Sonya580"
- **Nivel**: 1-10 aleatorio
- **Clase**: Guerrero, Mago, Arquero, Clérigo, Asesino, Paladín
- **Facción**: Reino, Legión, Caos, Armada, Neutral
- **Equipamiento**: Según su clase

### **Comportamientos**
- **IDLE (50%)**: Parados observando
- **WANDERING (25%)**: Explorando el mapa
- **HUNTING (10%)**: Cazando enemigos
- **CHATTING (10%)**: Escribiendo en chat
- **TRAVELING (5%)**: Usando portales

### **Interacción con Bots**
- **Click en bot**: Ver ficha de información
- Información mostrada:
  ```
  Gandalf247 (150/150) ║ Lvl. 5 ║ Mago ║ Reino | Online: 5 min
  ```

### **Visualización**
- **Nombre**: Azul debajo del sprite
- **Nivel**: Verde debajo del nombre
- **En minimapa**: Puntos azul claro (controlable desde debug panel)

---

## 🗺️ Sistema de Mapas

### **Mapas Disponibles**

#### **Ciudad de Ullathorpe** (newbie_city)
- Mapa inicial
- NPCs: Mercader, Herrero, Banquero, Sacerdote, Mago
- Enemigos: Pocos o ninguno
- Portales: A Campos de Ullathorpe

#### **Campos de Ullathorpe** (newbie_field)
- Mapa de entrenamiento
- Enemigos: Goblins, Skeletons (niveles bajos)
- Objetos: Cofres, oro, items
- Portales: A Ciudad, Bosque Oscuro

#### **Bosque Oscuro** (dark_forest)
- Mapa peligroso
- Enemigos: Todos los tipos (más fuertes)
- Subdivisiones: Norte, Sur, Este, Centro
- Portales: A campos y cuevas

### **Navegación**
- **Portales**: Objetos brillantes en el mapa
- **Transiciones automáticas**: Al llegar al borde del mapa
- **Teletransporte (Debug)**: Panel de depuración → Selector de mapas

---

## ✨ Sistema de Magia

### **Hechizos Disponibles**
- **Flecha Mágica**: Proyectil mágico
- **Bola de Fuego**: Daño de área
- **Curar Heridas**: Restaura HP
- **Paralizar**: Inmoviliza enemigo
- **Fortalecer**: Aumenta stats

### **Aprender Hechizos**
1. Compra **Libro de Hechizos** al Mago Nemesius
2. Usa el libro desde tu inventario
3. El hechizo se aprende permanentemente
4. Accede con tecla **M** o panel de hechizos

### **Lanzar Hechizos**
1. Abre panel de hechizos (**M**)
2. Selecciona hechizo
3. Click en objetivo (enemigo, aliado, o posición)
4. Consume mana según el hechizo

### **Meditación**
- **Tecla M** o botón "Meditar"
- Recupera mana más rápido
- Te quedas quieto mientras meditas
- Cualquier movimiento cancela la meditación
- **Maestro Zennin** te enseña sobre meditación

---

## 🏪 Servicios de NPCs

### **Sacerdote Marcos** (Healer)
- **Curación**: 50 oro (HP completo)
- **Resurrección**: 500 oro (solo para fantasmas)
- Recupera objetos caídos al resucitar

### **Banquero Martín**
- Depósito de oro (próximamente)
- Retiro de oro (próximamente)
- Consulta de balance

### **Maestro Karim** (Trainer)
- **Entrenamiento físico**: 200 oro (+10 HP máximo)
- **Técnicas de combate**: 300 oro (+daño)
- Mejora tus habilidades

### **Maestro Zennin** (Meditation Master)
- **Siempre meditando** (ejemplo visual)
- Enseña sobre la meditación
- Vende pociones de mana baratas (50 oro)

---

## 🎯 Sistema de Misiones

### **Misiones Iniciales**
- 🗺️ Explora todo el mapa
- 💰 Encuentra y abre los cofres
- ⚔️ Derrota a los goblins
- 🏆 Acumula 500 de oro

### **Progreso**
- Visible en panel lateral derecho
- Toggle con botón "Mostrar/Ocultar"

---

## 🛠️ Panel de Depuración

### **Acceso**
- Click en **🛠️** (esquina superior derecha)
- Panel completo de herramientas para testing

### **Herramientas Disponibles**

#### **Capas del Mapa**
- Mostrar/ocultar diferentes capas
- Útil para debug de renderizado
- Capas: Base, Árboles, Puertas, Ventanas, Tejados, Edificios, Objetos, NPCs, Enemigos, Jugador

#### **Minimapa**
- 🤖 **Mostrar bots en minimapa**: Toggle para ver/ocultar bots

#### **Edificios Individuales**
- Control de visibilidad por edificio
- Toggle de techos individual

#### **Habilidades**
- Panel de habilidades del personaje
- Gestión de skills

#### **Oro (Debug)**
- **+100**: Agregar 100 oro
- **+1000**: Agregar 1,000 oro
- **+10000**: Agregar 10,000 oro
- Indicador de oro actual en tiempo real

#### **Super Velocidad**
- Activa velocidad 5x más rápida
- Útil para testing
- Toggle on/off

#### **Teletransporte**
- Selector de mapas disponibles
- Teletransporte instantáneo
- Útil para exploración rápida

---

## 🗺️ Minimapa y Navegación

### **Minimapa**
- **Toggle**: Botón "Mostrar Minimap"
- **Colores**:
  - Verde oscuro: Terreno
  - Azul: Jugador
  - Dorado: NPCs
  - Azul claro: Bots (opcional)
  - Morado: Portales a ciudad
  - Rojo: Portales a mazmorras

### **Mapa del Mundo**
- Vista general de todos los mapas
- Click en mapa para viajar (si tienes acceso)
- Muestra conexiones entre mapas

### **Editor de Mapas**
- Herramienta avanzada para crear/editar mapas
- Modo especial accesible desde panel

---

## 🤖 Interacción con Bots

### **Identificar Bots**
- **Nombre en azul** debajo del sprite
- **Nivel en verde** debajo del nombre
- **Equipamiento visible** según clase

### **Ver Información**
- **Click en bot** para ver ficha completa
- Información mostrada:
  - Nombre
  - Vida actual/máxima
  - Nivel
  - Clase
  - Facción
  - Tiempo online

### **Comportamiento de Bots**
- Se mueven lentamente (2x más lentos que tú)
- Pasan 50% del tiempo parados
- Pueden hablar en el chat
- Atacan enemigos
- Usan portales para cambiar de mapa
- Tienen colisión (no puedes atravesarlos)

---

## 💬 Sistema de Chat

### **Canales**
- **Global**: Visible para todos
- **Cercanos**: Solo jugadores cerca
- **Grupo**: Tu party (próximamente)
- **Jugador**: Mensaje privado

### **Usar el Chat**
1. Selecciona canal en dropdown
2. Escribe mensaje
3. Click "Enviar" o **Enter**

### **Tipos de Mensajes**
- Sistema: Mensajes del juego (blanco)
- NPC: Diálogos de NPCs (amarillo)
- Bot: Mensajes de bots (azul)
- Jugador: Tus mensajes

### **Toggle Chat**
- Botón **💬** para mostrar/ocultar
- Notificación (●) cuando hay mensajes nuevos

---

## 🏰 Edificios e Interiores

### **Entrar a Edificios**
- Camina hacia la **puerta**
- Entras automáticamente
- El techo se vuelve transparente

### **Salir de Edificios**
- Camina hacia la **salida**
- Sales automáticamente

### **Puertas**
- **Tecla E**: Abrir/cerrar puertas
- Puertas abiertas: Puedes pasar
- Puertas cerradas: Bloqueadas

---

## 🎨 Clases y Equipamiento

### **Guerrero**
- **Estilo**: Tanque pesado
- **Equipamiento**: Armadura de placas, casco completo, espada larga, escudo grande
- **Colores**: Gris metálico
- **Rol**: Combate cuerpo a cuerpo

### **Mago**
- **Estilo**: Lanzador de hechizos
- **Equipamiento**: Túnica morada, capucha, bastón mágico
- **Colores**: Morado y azul
- **Rol**: Daño mágico a distancia

### **Arquero**
- **Estilo**: Ataque a distancia
- **Equipamiento**: Armadura de cuero, casco ligero, arco
- **Colores**: Marrón
- **Rol**: DPS a distancia

### **Clérigo**
- **Estilo**: Sanador y soporte
- **Equipamiento**: Túnica blanca, corona dorada, martillo, escudo pequeño
- **Colores**: Blanco y dorado
- **Rol**: Curación y buffs

### **Asesino**
- **Estilo**: Sigilo y críticos
- **Equipamiento**: Cuero negro, capucha, daga
- **Colores**: Negro y marrón oscuro
- **Rol**: Daño burst

### **Paladín**
- **Estilo**: Tanque sagrado
- **Equipamiento**: Armadura dorada completa, casco dorado, espada/martillo, escudo grande
- **Colores**: Dorado brillante
- **Rol**: Tanque con curación

---

## 💡 Consejos y Trucos

### **Para Principiantes**
1. **Habla con todos los NPCs** para conocer sus servicios
2. **Explora el mapa** para encontrar cofres
3. **Comienza cazando goblins** (enemigos débiles)
4. **Guarda oro** para comprar equipamiento mejor
5. **Equipa armadura y casco** para más defensa

### **Ganar Oro Rápido**
- Mata enemigos (10-20 oro/enemigo)
- Abre cofres (20-100 oro/cofre)
- Recoge monedas doradas del suelo (5-20 oro)
- **Debug**: Usa panel de depuración (+10000 oro)

### **Supervivencia**
- **Lleva pociones rojas** (restauran HP)
- **Evita grupos de enemigos** hasta tener mejor equipo
- **Usa portales** para escapar si estás en peligro
- **Medita** para recuperar mana rápido

### **Combate Efectivo**
- **Equipa arco** para atacar desde lejos
- **Usa escudo** para más defensa
- **Ataca primero** a enemigos débiles
- **Observa los bots cazando** para aprender

---

## 🎮 Modos de Juego

### **Modo Local**
- Juego sin conexión
- Bots simulan otros jugadores
- Progreso no se guarda entre sesiones

### **Modo Online** (Próximamente)
- Multijugador real
- Progreso guardado en servidor
- Interacción con jugadores reales

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| ↑↓←→ / WASD | Movimiento |
| Shift + Dirección | Cambiar orientación |
| Espacio | Interactuar/Atacar |
| E | Abrir/Cerrar puerta |
| X | Disparar flecha |
| M | Panel de hechizos / Meditar |
| I | Inventario |
| Q / ESC | Cerrar diálogos |
| 1-9 | Seleccionar opción de diálogo |

---

## 📱 Interfaz Móvil

### **HUD Flotante**
- Botón **ℹ️** para mostrar/ocultar stats
- Información compacta de HP, Mana, Nivel, Oro

### **Menú Móvil**
- Botón **☰** para abrir menú
- Acceso rápido a:
  - Minimapa
  - Mapa del mundo
  - Misiones
  - Estadísticas
  - Hechizos

### **Controles Táctiles**
- **Tap**: Moverse/Interactuar
- **Long press**: Menú contextual de item
- Inventario inferior para acceso rápido

---

## 🐛 Debugging y Testing

### **Comandos de Consola** (F12)

```javascript
// Ver estado del juego
console.log(gameState);

// Ver todos los bots
console.log(gameState.bots);

// Ver bots en mapa actual
console.log(botManager.getBotsInMap(gameState.currentMap));

// Spawn manual de bot
botManager.spawnBot(gameState, gameState.currentMap);

// Agregar oro
gameState.player.gold += 10000;

// Agregar nivel
gameState.player.level += 10;

// Curación completa
gameState.player.hp = gameState.player.maxHp;
gameState.player.mana = gameState.player.maxMana;
```

### **Herramientas de Debug**
- **Panel de depuración** (🛠️): Acceso a todas las herramientas
- **Super velocidad**: Acelera el tiempo del juego
- **Oro infinito**: Botones de cheat
- **Teletransporte**: Viaja a cualquier mapa

---

## 📊 Estadísticas del Personaje

### **Visibles en Panel**
- Nivel actual
- Clase (fijo: Guerrero por defecto)
- Enemigos eliminados
- Cofres abiertos

### **Barra de Experiencia**
- Muestra progreso hacia siguiente nivel
- Aparece debajo de las stats principales
- Se llena al ganar experiencia

---

## 🎁 Items y Consumibles

### **Pociones**
- **Roja** 🧪: +50 HP (100 oro)
- **Azul** 💧: +30 Mana (80 oro)
- **Verde** 🍀: Cura veneno (50 oro)

### **Munición**
- **Flechas** 🏹: Munición para arcos (5 oro/u)

### **Hechizos**
- **Libros**: Aprendes el hechizo permanentemente
- **Pergaminos**: Uso único del hechizo

---

## 🔮 Consejos Avanzados

### **Optimización de Inventario**
- **Página 1**: Items de uso frecuente
- **Página 2**: Equipamiento alternativo
- **Páginas 3-5**: Almacenamiento
- Apila pociones y flechas para ahorrar espacio

### **Estrategia de Combate**
1. **Equipamiento adecuado** antes de pelear
2. **Distancia** si tienes arco
3. **Pociones preparadas** en inventario
4. **Medita** después de combates para recuperar mana

### **Gestión de Oro**
- **Prioridad**: Armadura > Arma > Escudo > Casco
- **Ahorra** para equipamiento dorado (end-game)
- **Vende** items innecesarios a NPCs

### **Exploración Eficiente**
- **Usa minimapa** para orientarte
- **Marca mentalmente** ubicación de NPCs importantes
- **Explora sistemáticamente** cada mapa
- **Usa portales** para movimiento rápido

---

## 📈 Desarrollo Futuro

### **Próximas Características**
- Sistema bancario completo
- Más hechizos y skills
- Crafteo de items
- Sistema de clanes/guilds
- PvP (Player vs Player)
- Mazmorras instanciadas
- Raids y jefes mundiales
- Sistema de mascotas
- Monturas
- Modo multijugador online real

---

## ❓ Preguntas Frecuentes

### **¿Cómo gano oro rápido?**
Mata enemigos, abre cofres, recoge monedas del suelo. Para testing, usa el panel de depuración.

### **¿Por qué no veo mi armadura equipada?**
Asegúrate de hacer click en el item en tu inventario después de comprarlo. Debe aparecer con borde dorado.

### **¿Los bots pueden atacarme?**
No, los bots son aliados. Solo atacan a enemigos.

### **¿Cómo resucito?**
Visita al Sacerdote Marcos en la ciudad (necesitas 500 oro como fantasma).

### **¿Puedo tener más espacio en el inventario?**
El inventario tiene 45 slots en 5 páginas. Usa las flechas ◀️ ▶️ para navegar.

### **¿Por qué algunos bots son diferentes?**
Cada bot tiene una clase diferente (Guerrero, Mago, Arquero, etc.) con equipamiento único.

### **¿Los NPCs se mueven?**
No, los NPCs permanecen en posiciones fijas. Solo los bots y enemigos se mueven.

---

## 🎮 Controles Avanzados

### **Interacción Inteligente**
- El juego detecta automáticamente la mejor acción
- Click en enemigo → Ataca
- Click en NPC → Habla
- Click en puerta → Abre/Cierra
- Click en objeto → Recoge
- Click en portal → Viaja

### **Auto-Movimiento**
- Click en posición lejana
- El personaje se mueve automáticamente
- Se detiene al llegar o encontrar obstáculo

---

## 📝 Créditos

- **Inspirado en**: Argentum Online
- **Desarrollado por**: [Tu nombre/equipo]
- **Versión**: 1.0
- **Última actualización**: Enero 2026

---

## 📞 Soporte

Para reportar bugs o sugerir mejoras, contacta a través de:
- GitHub Issues
- Discord (próximamente)
- Email (próximamente)

---

## 🎉 ¡Disfruta del Juego!

Este es un proyecto en constante evolución. Nuevas características y mejoras se añaden regularmente. ¡Explora, lucha y conquista el mundo de Argentum!

**¡Buena suerte, aventurero!** ⚔️🛡️✨
