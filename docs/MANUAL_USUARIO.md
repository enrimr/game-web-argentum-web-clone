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
- **Clase**: Determina tus habilidades y bonificaciones

### **Progresión**
- Mata enemigos para ganar **experiencia** y **oro**
- Realiza trabajos para subir **habilidades (skills)**
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

## 🎭 Sistema de Clases

### **Clases Disponibles**

El juego ofrece **12 clases únicas**, cada una con fortalezas y debilidades:

#### **Clases de Combate**

**⚔️ Guerrero (Warrior)**
- **Especialidad**: Combate cuerpo a cuerpo
- **HP**: +30% | **Mana**: -50%
- **Experto en**: Combate, Defensa
- **Equipamiento**: Armaduras pesadas, armas grandes
- **Rol**: Tanque frontal

**🛡️ Paladín (Paladin)**
- **Especialidad**: Guerrero sagrado
- **HP**: +20% | **Mana**: -20%
- **Experto en**: Combate, Defensa, Liderazgo, Magia divina
- **Equipamiento**: Armaduras pesadas, armas y magia
- **Rol**: Tanque con curación

#### **Clases Mágicas**

**🔮 Mago (Mage)**
- **Especialidad**: Hechicería arcana
- **HP**: -30% | **Mana**: +100%
- **Experto en**: Magia, Meditar
- **Equipamiento**: Túnicas, bastones mágicos
- **Rol**: DPS mágico, requiere bastón para lanzar

**✝️ Clérigo (Cleric)**
- **Especialidad**: Sanación y protección
- **HP**: Normal | **Mana**: +20%
- **Experto en**: Magia divina, Liderazgo
- **Equipamiento**: Túnicas, mazas, escudos
- **Rol**: Sanador y soporte
- **Bonus**: +30% curación

#### **Clases Versátiles**

**🌿 Druida (Druid)**
- **Especialidad**: Magia natural y transformación
- **HP**: -10% | **Mana**: +50%
- **Experto en**: Magia natural, Domar, Supervivencia
- **Equipamiento**: Túnicas naturales, bastones
- **Rol**: Soporte/DPS con habilidades de naturaleza

**🎵 Bardo (Bard)**
- **Especialidad**: Música y apoyo social
- **HP**: -15% | **Mana**: Normal
- **Experto en**: Comercio, Liderazgo, Magia
- **Equipamiento**: Instrumentos, dagas
- **Rol**: Soporte con buffs y comercio

#### **Clases Furtivas**

**🗡️ Asesino (Assassin)**
- **Especialidad**: Asesinato desde las sombras
- **HP**: -10% | **Mana**: -30%
- **Experto en**: Ocultarse, Apuñalar, Sigilo
- **Equipamiento**: Armadura ligera, dagas, arcos
- **Rol**: DPS burst con críticos (+40%)
- **Bonus**: +50% tiempo oculto

**🦹 Ladrón (Thief)**
- **Especialidad**: Robo y evasión
- **HP**: -15% | **Mana**: -40%
- **Experto en**: Robar, Ocultarse, Apuñalar
- **Equipamiento**: Armadura ligera, dagas
- **Rol**: Soporte con robo y evasión
- **Bonus**: +50% efectividad de robo

**🏴‍☠️ Bandido (Bandit)**
- **Especialidad**: Guerrero pícaro
- **HP**: +10% | **Mana**: -40%
- **Experto en**: Combate, Wrestling, Robar
- **Equipamiento**: Armaduras medias, armas variadas
- **Rol**: DPS físico con críticos (+20%)
- **Bonus**: Tiempo de ocultar reducido 50%

#### **Clases Especializadas**

**🏹 Cazador (Hunter)**
- **Especialidad**: Combate a distancia
- **HP**: Normal | **Mana**: -40%
- **Experto en**: Arco, Domar, Supervivencia
- **Equipamiento**: Armadura de cuero, arcos
- **Rol**: DPS a distancia
- **Bonus**: +30% daño con arco, +20% domar

**🔨 Trabajador (Worker)**
- **Especialidad**: Oficios y crafteo
- **HP**: Normal | **Mana**: -50%
- **Experto en**: Minería, Talar, Pesca, Herrería, Carpintería
- **Equipamiento**: Herramientas de trabajo
- **Rol**: Recolección y crafteo
- **Bonus**: +100% recursos extraídos, +50% velocidad crafteo

**🏴‍☠️ Pirata (Pirate)**
- **Especialidad**: Navegación y saqueo
- **HP**: +10% | **Mana**: -40%
- **Experto en**: Navegación, Combate naval
- **Equipamiento**: Sables, pistolas
- **Rol**: DPS naval
- **Bonus**: +50% velocidad en barcos, puede ocultarse en agua

### **Modificadores de Clase**

Cada clase tiene modificadores que afectan qué tan rápido aprende cada habilidad:

- **1.0** = Normal (experto)
- **1.5** = +50% más difícil
- **2.0** = Doble de difícil
- **3.0+** = Casi imposible

**Ejemplos:**
- **Trabajador** + Talar = 1.0 (experto, aprende rápido)
- **Guerrero** + Talar = 2.0 (tarda el doble)
- **Mago** + Combate = 2.5 (muy difícil)
- **Clérigo** + Robar = 4.0 (imposible)

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

## 🎯 Sistema de Habilidades (Skills)

### **¿Qué son las Habilidades?**

Las **habilidades (skills)** son capacidades que mejoran con la práctica. Cada clase tiene facilidad para aprender diferentes skills.

### **20 Habilidades Disponibles**

#### **⚔️ Combate (Combat Skills)**

**⚔️ Combate con Armas**
- Efectividad en combate cuerpo a cuerpo
- Aumenta daño y precisión con armas
- Se sube: Atacando con armas equipadas

**🛡️ Defensa con Escudos**
- Capacidad de bloquear ataques
- Reduce daño recibido
- Se sube: Recibiendo ataques con escudo

**🏹 Combate a Distancia**
- Puntería con arcos y proyectiles
- Aumenta daño y precisión a distancia
- Se sube: Disparando flechas

**👊 Wrestling (Cuerpo a Cuerpo)**
- Lucha sin armas
- Permite desarmar enemigos
- Se sube: Peleando sin arma

**🤸 Tácticas (Evasión)**
- Esquivar ataques enemigos
- Reduce probabilidad de ser golpeado
- Se sube: Recibiendo ataques

#### **✨ Magia (Magic Skills)**

**✨ Magia**
- Poder de hechizos
- Aumenta daño mágico
- Se sube: Lanzando hechizos

**🧘 Meditar**
- Velocidad de recuperación de mana
- Esencial para magos
- Se sube: Meditando (tecla M)

#### **⛏️ Trabajo (Work Skills)**

**⛏️ Minería**
- Extrae minerales de vetas
- Nivel afecta éxito y cantidad
- Se sube: Picando vetas con pico
- **Requerido**: Pico equipado

**🪓 Talar**
- Corta árboles para madera
- Nivel afecta éxito y cantidad
- Se sube: Talando árboles con hacha
- **Requerido**: Hacha equipada

**🎣 Pesca**
- Pesca en ríos y lagos
- Nivel afecta tipo de peces
- Se sube: Pescando con caña
- **Requerido**: Caña de pescar

#### **🔨 Crafteo (Crafting Skills)**

**🔨 Herrería**
- Forja armas y armaduras de metal
- Requiere lingotes y carbón
- Se sube: Forjando items

**🪚 Carpintería**
- Crea arcos, flechas y objetos de madera
- Requiere madera
- Se sube: Crafteando items de madera

#### **👥 Social (Social Skills)**

**💰 Comercio**
- Mejores precios al comprar/vender
- Descuentos con NPCs
- Se sube: Comerciando

**👑 Liderazgo**
- Comandar grupos
- Bonificación a party members
- Se sube: Liderando grupos

#### **🥷 Sigilo (Rogue Skills)**

**🦹 Robar**
- Roba items de otros jugadores
- Probabilidad según skill
- Se sube: Robando exitosamente

**🥷 Ocultarse**
- Vuélvete invisible temporalmente
- Duración según skill
- Se sube: Ocultándote

**🗡️ Apuñalar**
- Ataque crítico desde las sombras
- Daño +40% (asesino: +50%)
- Se sube: Apuñalando con daga

#### **🐺 Especiales (Special Skills)**

**🐺 Domar Animales**
- Domestica criaturas como mascotas
- Skill afecta qué puedes domar
- Se sube: Domando criaturas

**🏕️ Supervivencia**
- Resistencia en ambientes hostiles
- Hacer fogatas, buscar comida
- Se sube: Sobreviviendo

**⛵ Navegación**
- Manejo de barcos
- Requerido para embarcaciones
- Se sube: Navegando

### **Progresión de Habilidades**

#### **Sistema de Experiencia**

Cada habilidad tiene su propia experiencia:
- **Nivel 1**: Requiere 50 exp
- **Nivel 10**: Requiere 550 exp
- **Nivel 50**: Requiere 3,750 exp
- **Nivel 100**: Máximo (maestro)

#### **Ganar Experiencia**

- **Éxito**: +10 exp base
- **Fallo**: +5 exp base
- **Modificador de clase**: Afecta exp ganada

**Ejemplo (Talar con Hacha):**
- Trabajador: +10 exp por éxito (modificador 1.0)
- Guerrero: +5 exp por éxito (modificador 2.0)
- Mago: +4 exp por éxito (modificador 2.5)

#### **Visualización**

El juego muestra tu progreso:
```
📈 Exp de Talar: 45/50 (90%)
⭐ ¡Tu habilidad de Talar ha mejorado a nivel 2!
```

---

## 🎲 Sistema de Probabilidad y Suerte

### **Fórmula de Éxito**

El juego usa la fórmula cuadrática de Argentum Online:
```
Suerte = -0.00125 × (Skill²) - 0.3 × Skill + 49
```

### **Tabla de Probabilidades**

| Nivel Skill | Suerte | Probabilidad Éxito |
|-------------|--------|-------------------|
| 1           | ~48    | ~2% (1/48)       |
| 10          | ~43    | ~2.3%            |
| 25          | ~31    | ~3.2%            |
| 50          | ~19    | ~5.3%            |
| 75          | ~11    | ~9%              |
| 100         | ~5     | ~20%             |

### **Cómo Funciona**

1. **Cada acción** (talar, minar, pescar) hace un roll de dados
2. **Roll entre 1 y Suerte**
3. **Si roll ≤ 3**: Éxito
4. **Si roll > 3**: Fallo

**Ejemplo con Skill 50 (Suerte 19):**
- Roll 1, 2 o 3 → ✅ Éxito (3/19 = ~16%)
- Roll 4-19 → ❌ Fallo (16/19 = ~84%)

### **Aprender de los Fallos**

- Incluso fallando ganas experiencia (50% de la exp de éxito)
- A nivel bajo, fallarás mucho pero subirás rápido
- A nivel alto, casi siempre tienes éxito pero subes lento

---

## 🌲 Sistema de Recolección de Recursos

### **Recursos Disponibles**

#### **🌲 Árboles**
- **Herramienta**: Hacha 🪓
- **Skill**: Talar
- **Recursos**: 50-10,000 unidades por árbol
- **Extrae por golpe**: 1-5 (según skill)
- **Tiempo**: 2.5 segundos base
- **Productos**: Madera, Madera de Roble, Madera Élfica

#### **⛰️ Vetas de Mineral**

**Veta de Hierro**
- **Herramienta**: Pico ⛏️
- **Skill**: Minería
- **Recursos**: 50-10,000 unidades
- **Extrae**: 1-4 por golpe
- **Productos**: Mineral de Hierro, Carbón

**Veta de Plata**
- **Requiere**: Skill 20+
- **Recursos**: 50-10,000 unidades
- **Productos**: Mineral de Plata

**Veta de Oro**
- **Requiere**: Skill 40+
- **Recursos**: 50-10,000 unidades
- **Productos**: Mineral de Oro

### **Cómo Recolectar**

1. **Equipa la herramienta** (hacha o pico)
2. **Click en el recurso** (árbol o veta)
3. **Espera** a completar la acción
4. **Resultado**:
   - ✅ Éxito: Obtienes recursos
   - ❌ Fallo: No obtienes nada (pero ganas exp)

### **Información en Pantalla**

Cuando recolectas verás:
```
🪓 Comenzaste a talar el Árbol...
📊 Recurso restante: 4950/5000 (99%)
✅ ¡Obtuviste 1x Madera!
📈 Exp de Talar: 10/50 (20%)
```

### **Barra Visual de Recursos**

Cada recurso muestra una barra de progreso:
- **Verde**: >70% recursos restantes
- **Amarillo**: 30-70% recursos
- **Rojo**: <30% recursos
- **Tocón**: Recurso agotado (0%)

### **Agotamiento de Recursos**

- Los árboles y vetas NO desaparecen hasta estar completamente agotados
- Mensaje cuando se agota: `💀 El Árbol se ha agotado completamente`
- Recursos agotados se convierten en tocones (semi-transparentes)

### **Bonificaciones por Clase**

**Trabajador**: Extrae el **doble** de recursos por golpe
```
Skill 50 normal: 3 recursos/golpe
Skill 50 trabajador: 6 recursos/golpe
```

**Otras clases**: Extracción normal pero más lenta para subir skill

### **Velocidad de Recolección**

El tiempo entre golpes mejora con el skill:
- **Skill 1**: 100% del tiempo (2.5-3.5 seg)
- **Skill 50**: 75% del tiempo
- **Skill 100**: 50% del tiempo (1.25-1.75 seg)

---

## 🎒 Sistema de Inventario

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
