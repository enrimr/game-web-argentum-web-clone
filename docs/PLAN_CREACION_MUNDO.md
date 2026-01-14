# 🗺️ Plan de Creación del Mundo - Próxima Sesión

## Estado Actual

### Mapas Existentes (2)
- ✅ **newbie_city** - Ciudad de Ullathorpe (generado por código)
- ✅ **training_fields** - Campos de entrenamiento (JSON)

### Transiciones Funcionando
- newbie_city (este) ↔️ training_fields (oeste) ✅

## Objetivo: Crear 30+ Mapas Conectados

### ZONA 1: Ullathorpe Region (Nivel 1-5) - 3 nuevos mapas

**forest_outskirts_1** (Nivel 3-5)
- Ubicación: Norte de training_fields
- Conexiones: Sur→training_fields, Norte→dark_forest_north
- Terreno: Mezcla GRASS + TREE (densidad 15%)
- Enemigos: Slime (5), Wolf (3) nivel 2-4
- Tiles: GRASS, TREE, STONE, PATH

**forest_outskirts_2** (Nivel 3-5)
- Ubicación: Este de training_fields
- Conexiones: Oeste→training_fields, Este→forest_outskirts_3
- Similar a forest_outskirts_1

**forest_outskirts_3** (Nivel 3-5)
- Ubicación: Este de forest_outskirts_2
- Conexiones: Oeste→forest_outskirts_2
- Similar pero más denso de árboles (20%)

### ZONA 2: Dark Forest Region (Nivel 5-10) - 5 mapas

**dark_forest_north** (Nivel 5-8)
- Conexiones: Sur→forest_outskirts_1, Sur→dark_forest_center
- Terreno: TREE (30%), GRASS, STONE
- Enemigos: Wolf (8), Spider (6) nivel 4-7
- Camino central de PATH

**dark_forest_center** (Nivel 6-9)
- Conexiones: Norte→dark_forest_north, Este→dark_forest_east, Sur→dark_forest_south
- Terreno: TREE (35%), más denso
- Enemigos: Wolf (10), Spider (8), Bear (2) nivel 5-8
- Portal a forest_cave

**dark_forest_south** (Nivel 5-8)
- Conexiones: Norte→dark_forest_center
- Similar a north

**dark_forest_east** (Nivel 7-10)
- Conexiones: Oeste→dark_forest_center, Este→mountain_pass_lower
- Transición a montañas: más ROCK, menos TREE

**forest_cave** (Mazmorra, Nivel 8-12)
- Entrada desde dark_forest_center
- Terreno: DUNGEON_WALL, FLOOR
- Corredores: 2-3 celdas de ancho ⚠️
- 6-8 salas conectadas
- Enemigos: Spider (10), Bat (8), Cave Troll (2) nivel 8-12

### ZONA 3: Mountain Region (Nivel 10-20) - 5 mapas

**mountain_pass_lower** (Nivel 10-13)
- Conexiones: Oeste→dark_forest_east, Norte→mountain_pass_middle
- Terreno: MOUNTAIN (20%), ROCK (15%), GRASS, PATH estrecho
- Enemigos: Mountain Goat (5), Orc (4) nivel 10-13

**mountain_pass_middle** (Nivel 12-16)
- Conexiones: Sur→mountain_pass_lower, Norte→mountain_pass_upper
- Terreno: MOUNTAIN (30%), ROCK (20%), STONE, PATH
- Enemigos: Orc (8), Mountain Troll (3) nivel 12-16

**mountain_pass_upper** (Nivel 14-18)
- Conexiones: Sur→mountain_pass_middle, Norte→mountain_peak
- Terreno: MOUNTAIN (40%), ROCK (25%), STONE
- Enemigos: Mountain Troll (6), Ice Elemental (2) nivel 14-18

**mountain_peak** (Nivel 16-20)
- Conexiones: Sur→mountain_pass_upper
- Terreno: MOUNTAIN (50%), ROCK (30%), SNOW en cima
- Enemigos: Ice Elemental (5), Griffin (1) nivel 18-20
- Portal a mountain_dungeon

**mountain_dungeon** (Mazmorra, Nivel 15-20)
- Entrada desde mountain_peak
- Terreno: DUNGEON_WALL, FLOOR, algunos ROCK
- Corredores: 2-3 celdas ⚠️
- 8-10 salas grandes
- Enemigos: Orc (15), Troll (8), Dragon Whelp (2) nivel 15-20

### ZONA 4: Coastal Region (Nivel 8-15) - 5 mapas

**coastal_town** (Nivel 8-12)
- Conexiones: Norte→beach_north, Sur→beach_south
- Terreno: PATH (calles), BUILDING (edificios), GRASS
- NPCs: Merchant (3), Fisher (2), Captain (1)
- Sin enemigos (safe zone)
- 10-15 edificios pequeños

**beach_north** (Nivel 10-13)
- Conexiones: Sur→coastal_town, Este→fishing_docks
- Terreno: SAND (60%), WATER (30%), SEASHELL dispersas
- Enemigos: Crab (10), Seagull (5) nivel 10-13

**beach_south** (Nivel 10-13)
- Conexiones: Norte→coastal_town, Este→coral_reef
- Similar a beach_north pero con más DUNE

**fishing_docks** (Nivel 9-12)
- Conexiones: Oeste→beach_north
- Terreno: BRIDGE (muelles), WATER, SAND
- NPCs: Fishermen (5)
- Enemigos: Crab (8) nivel 9-12

**coral_reef** (Nivel 12-15)
- Conexiones: Oeste→beach_south
- Terreno: WATER (mayoría), SAND (bordes), CORAL (decoración)
- Enemigos: Sea Serpent (3), Shark (2) nivel 12-15

### ZONA 5: Desert Region (Nivel 15-23) - 5 mapas

**desert_dunes_west** (Nivel 15-18)
- Conexiones: Este→desert_dunes_center
- Terreno: SAND (40%), DUNE (40%), STONE (10%), DEAD_TREE dispersos
- Enemigos: Scorpion (10), Sand Elemental (4) nivel 15-18

**desert_dunes_center** (Nivel 16-20)
- Conexiones: Oeste→desert_dunes_west, Este→desert_dunes_east, Norte→desert_oasis
- Terreno: DUNE (50%), SAND (35%), CACTUS (5%)
- Enemigos: Scorpion (12), Sand Elemental (6), Mummy (2) nivel 16-20
- Tormenta de arena visual con ASH

**desert_dunes_east** (Nivel 17-21)
- Conexiones: Oeste→desert_dunes_center, Sur→sand_temple
- Similar a center pero más CACTUS

**desert_oasis** (Nivel 14-17)
- Conexiones: Sur→desert_dunes_center
- Terreno: WATER (centro), GRASS (alrededor), PALM_TREE, SAND
- NPCs: Nomad Merchant (1)
- Enemigos: menos agresivos, Scorpion (5) nivel 14-17

**sand_temple** (Mazmorra, Nivel 18-23)
- Entrada desde desert_dunes_east
- Terreno: STONE (paredes), FLOOR, SAND (acumulado)
- Corredores: 2-3 celdas ⚠️
- Decoración: COLUMN, RUINS_WALL
- 10-12 salas tipo templo
- Enemigos: Mummy (15), Anubis Guard (8), Pharaoh (1 boss) nivel 18-23

### ZONA 6: Volcanic Region (Nivel 20-28) - 4 mapas

**volcanic_foothills** (Nivel 20-23)
- Conexiones: Norte→volcanic_slopes
- Terreno: ASH (40%), VOLCANIC_ROCK (30%), GRASS (20%), PUMICE
- Enemigos: Fire Lizard (10), Lava Elemental (4) nivel 20-23

**volcanic_slopes** (Nivel 22-25)
- Conexiones: Sur→volcanic_foothills, Norte→volcanic_peak
- Terreno: ASH (50%), VOLCANIC_ROCK (35%), OBSIDIAN (5%)
- GEYSER dispersos
- Enemigos: Lava Elemental (8), Fire Drake (3) nivel 22-25

**volcanic_peak** (Nivel 24-28)
- Conexiones: Sur→volcanic_slopes
- Terreno: VOLCANIC_ROCK (40%), OBSIDIAN (20%), LAVA (10%), ASH
- VOLCANO (cráter activo)
- Enemigos: Fire Drake (6), Magma Golem (2) nivel 24-28
- Portal a lava_cavern

**lava_cavern** (Mazmorra, Nivel 25-28)
- Entrada desde volcanic_peak
- Terreno: DUNGEON_WALL (negro), FLOOR, LAVA (ríos), OBSIDIAN
- Corredores: 2-3 celdas, algunos con BRIDGE sobre LAVA ⚠️
- 8-10 salas
- Calor extremo (daño periódico)
- Enemigos: Magma Golem (10), Fire Elemental (12), Lava Dragon (1 boss) nivel 25-28

### ZONA 7: Ancient Ruins (Nivel 25-30) - 3 mapas

**ancient_ruins_entrance** (Nivel 25-27)
- Conexiones: Norte→ancient_ruins_courtyard
- Terreno: GRASS, RUINS_WALL (estructuras), COLUMN, STONE
- Enemigos: Ancient Guardian (8), Stone Golem (4) nivel 25-27

**ancient_ruins_courtyard** (Nivel 26-29)
- Conexiones: Sur→ancient_ruins_entrance, Centro→ancient_catacombs
- Terreno: STONE (suelo), RUINS_WALL, COLUMN (muchos), GRASS (creciendo)
- Enemigos: Ancient Guardian (12), Lich (2) nivel 26-29
- Plaza central con altar

**ancient_catacombs** (Mazmorra, Nivel 28-30)
- Entrada desde ancient_ruins_courtyard
- Terreno: DUNGEON_WALL, FLOOR, COLUMN (decoración)
- Corredores: 2-3 celdas, laberíntico ⚠️
- 12-15 salas tipo cripta
- Oscuridad total
- Enemigos: Skeleton Warrior (20), Lich (6), Ancient King (1 boss) nivel 28-30

## Especificaciones Técnicas

### Formato de Cada Mapa
```json
{
  "name": "🌳 Nombre del Mapa",
  "description": "Descripción",
  "type": "forest/city/dungeon/etc",
  "safeZone": false,
  "worldPosition": { "x": 100, "y": 100 },
  "layers": {
    "base": [[...]],  // 40x60 array
    "props": [[]],
    "roofs": [[]],
    "doors": [[]],
    "windows": [[]]
  },
  "adjacentMaps": {
    "north": "map_id",
    "south": "map_id",
    "east": "map_id",
    "west": "map_id"
  },
  "portals": [
    { "x": 10, "y": 10, "targetMap": "other_map", "targetX": 20, "targetY": 20 }
  ],
  "npcs": [],
  "enemies": {
    "enabled": true,
    "types": [
      { "type": "enemy_type", "count": 5, "minLevel": 10, "maxLevel": 15 }
    ]
  }
}
```

### Tiles Disponibles por Zona

**Bosque:** GRASS (0), TREE (3), STONE (2), PATH (8)

**Montaña:** MOUNTAIN (22), ROCK (23), STONE (2), PATH (8), GRASS (0)

**Costa:** SAND (20), WATER (1), SEASHELL (28), BRIDGE (38), PALM_TREE (26)

**Desierto:** SAND (20), DUNE (21), CACTUS (27), DEAD_TREE (34), STONE (2)

**Volcánico:** VOLCANIC_ROCK (24), LAVA (25), OBSIDIAN (30), ASH (31), PUMICE (32), GEYSER (33), VOLCANO (29)

**Ruinas:** RUINS_WALL (36), COLUMN (37), STONE (2), GRASS (0)

**Mazmorras:** DUNGEON_WALL (7), FLOOR (6), corredores 2+ celdas

### Dimensiones Estándar
- Mapas superficie: 40 alto x 60 ancho
- Mazmorras: 40 alto x 60 ancho
- Corredores mazmorras: Mínimo 2 celdas de ancho

## Tareas de la Próxima Sesión

### 1. Crear 31 Archivos JSON (1-2 horas)
- 3 forest_outskirts
- 5 dark_forest + forest_cave
- 5 mountain + mountain_dungeon
- 5 coastal + coral_reef
- 5 desert + sand_temple
- 4 volcanic + lava_cavern
- 3 ruins + catacombs

### 2. Actualizar MapTransitions.js
- Añadir 31 entradas al WORLD_MAP_LAYOUT
- Configurar todas las conexiones adjacentMaps

### 3. Actualizar Registros
- StaticWorldMaps.js: Añadir 31 mapas
- MapConfig.js: Añadir 31 configuraciones
- PreloadedMaps.js: Añadir 31 paths

### 4. Testing
- Probar transiciones entre todos los mapas conectados
- Verificar que los bordes están abiertos donde corresponde
- Probar entrada/salida de mazmorras

## Notas Importantes

⚠️ **Mazmorras:** Corredores MÍNIMO 2 celdas de ancho
⚠️ **Bordes:** Usar PATH (8) para bordes conectados, WALL (4) para cerrados
⚠️ **Coordinación:** Worldposition debe ser coherente con adyacencia
⚠️ **JSON Format:** Usar formato compacto (una fila por línea)

## Archivos a Modificar

1. `js/world/maps/*.json` - 31 nuevos archivos
2. `js/world/MapTransitions.js` - Actualizar WORLD_MAP_LAYOUT
3. `js/world/StaticWorldMaps.js` - Registrar 31 mapas
4. `js/world/MapConfig.js` - Configurar 31 mapas
5. `js/world/PreloadedMaps.js` - Precargar 31 mapas

## Progresión de Dificultad

- **Zona 1 (1-5):** Slime, Goblin, Rat
- **Zona 2 (5-10):** Wolf, Spider, Bear
- **Zona 3 (10-20):** Orc, Troll, Ice Elemental, Griffin
- **Zona 4 (8-15):** Crab, Seagull, Sea Serpent, Shark
- **Zona 5 (15-23):** Scorpion, Sand Elemental, Mummy, Pharaoh
- **Zona 6 (20-28):** Fire Lizard, Lava Elemental, Fire Drake, Lava Dragon
- **Zona 7 (25-30):** Ancient Guardian, Lich, Ancient King

## Herramientas Disponibles

✅ Editor visual (`?mapgenerator`)
✅ 38 tipos de tiles
✅ Sistema de conexiones automático
✅ Exportación JSON optimizada
✅ Sistema de transiciones probado

**Todo listo para la creación masiva en la próxima sesión.** 🚀
