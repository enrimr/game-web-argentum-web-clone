# Sistema de Audio para Argentum Demo

## Análisis de Efectos de Sonido Disponibles

### Estructura de Archivos de Audio

```
resources/audio/effects/
├── battle/
│   ├── attackPunch.ogg      # Ataque cuerpo a cuerpo sin arma
│   └── attackSword.ogg       # Ataque con espada/arma
├── enemies/
│   ├── demon.ogg             # Sonido de demonio
│   ├── general.ogg           # Sonido genérico de enemigo
│   ├── goblin.ogg            # Sonido de goblin
│   ├── slime.ogg             # Sonido de slime
│   └── wolf.ogg              # Sonido de lobo
├── gathering/
│   ├── gatherFish.ogg        # Recolección de pesca
│   ├── gatherMetal.ogg       # Recolección de metal/minerales
│   ├── gatherStone.ogg       # Recolección de piedra
│   └── gatherWood.ogg        # Recolección de madera (talar árboles)
├── inventory/
│   ├── equipArmor.ogg        # Equipar armadura
│   ├── equipTool.ogg         # Equipar herramienta/arma
│   └── useBottleOrPotion.ogg # Usar poción/botella
└── world/
    └── door.ogg              # Abrir/cerrar puerta
```

---

## Propuesta de Integración

### 1. Sistema de Gestión de Audio (AudioManager)

Crear un módulo centralizado para gestionar todo el audio del juego:

**Ubicación:** `js/systems/AudioManager.js`

**Funcionalidades:**
- Precarga de todos los efectos de sonido
- Control de volumen global y por categoría
- Pool de instancias de Audio para evitar cortes
- Sistema de cooldown para evitar spam de sonidos
- Configuración de audio (activar/desactivar, volumen)

**Características técnicas:**
```javascript
class AudioManager {
  constructor() {
    this.enabled = true;
    this.volumes = {
      master: 1.0,
      battle: 0.8,
      enemies: 0.7,
      gathering: 0.6,
      inventory: 0.5,
      world: 0.7
    };
    this.sounds = {}; // Pool de Audio objects
    this.lastPlayed = {}; // Cooldowns
    this.cooldownMs = 100; // Mínimo tiempo entre mismo sonido
  }
}
```

---

### 2. Mapeo de Sonidos a Eventos del Juego

#### **A. Sistema de Combate (Combat.js)**

**Eventos a sonorizar:**

| Evento | Archivo de Audio | Condición |
|--------|-----------------|-----------|
| Ataque del jugador | `attackSword.ogg` | Si tiene arma equipada |
| Ataque del jugador | `attackPunch.ogg` | Si no tiene arma equipada |
| Ataque de enemigo | `enemies/[tipo].ogg` | Según tipo de enemigo |
| Golpe recibido | `general.ogg` | Feedback al recibir daño |

**Integración:**
```javascript
// En Combat.js - método attack()
import { audioManager } from './AudioManager.js';

// Cuando el jugador ataca
if (gameState.player.equipment.weapon) {
  audioManager.play('battle/attackSword');
} else {
  audioManager.play('battle/attackPunch');
}

// Cuando un enemigo ataca
audioManager.play(`enemies/${enemy.type}`);
```

**Mapeo de enemigos a sonidos:**
- `goblin` → `enemies/goblin.ogg`
- `slime` → `enemies/slime.ogg`
- `wolf` → `enemies/wolf.ogg`
- `demon` → `enemies/demon.ogg`
- Otros enemigos → `enemies/general.ogg` (fallback)

---

#### **B. Sistema de Recolección (ResourceGathering.js)**

**Eventos a sonorizar:**

| Recurso | Archivo de Audio | Situación |
|---------|-----------------|-----------|
| Árbol (TREE) | `gathering/gatherWood.ogg` | Al talar con hacha |
| Piedra | `gathering/gatherStone.ogg` | Al picar con pico (futuro) |
| Metal/Mineral | `gathering/gatherMetal.ogg` | Al minar vetas (futuro) |
| Pesca | `gathering/gatherFish.ogg` | Al pescar (futuro) |

**Integración:**
```javascript
// En ResourceGathering.js - método handleResourceGathering()
import { audioManager } from './AudioManager.js';

switch(resource.type) {
  case 'TREE':
    audioManager.play('gathering/gatherWood');
    break;
  case 'IRON_VEIN':
  case 'GOLD_VEIN':
    audioManager.play('gathering/gatherMetal');
    break;
  case 'STONE':
    audioManager.play('gathering/gatherStone');
    break;
  case 'FISH':
    audioManager.play('gathering/gatherFish');
    break;
}
```

---

#### **C. Sistema de Inventario (Inventory.js y EquipmentSystem.js)**

**Eventos a sonorizar:**

| Acción | Archivo de Audio | Situación |
|--------|-----------------|-----------|
| Equipar armadura | `inventory/equipArmor.ogg` | Al equipar casco, peto, escudo |
| Equipar herramienta | `inventory/equipTool.ogg` | Al equipar hacha, pico, espada |
| Usar poción | `inventory/useBottleOrPotion.ogg` | Al consumir poción de HP/Mana |
| Recoger item | `inventory/equipTool.ogg` | Al recoger item del suelo |

**Integración:**
```javascript
// En EquipmentSystem.js - método equipItem()
import { audioManager } from './AudioManager.js';

if (item.slot === 'helmet' || item.slot === 'chest' || item.slot === 'shield') {
  audioManager.play('inventory/equipArmor');
} else {
  audioManager.play('inventory/equipTool');
}

// En Inventory.js - método useItem()
if (item.type === 'POTION' || item.type === 'CONSUMABLE') {
  audioManager.play('inventory/useBottleOrPotion');
}
```

---

#### **D. Sistema de Mundo (MapTransitions.js, ObjectInteraction.js)**

**Eventos a sonorizar:**

| Acción | Archivo de Audio | Situación |
|--------|-----------------|-----------|
| Atravesar puerta | `world/door.ogg` | Al entrar/salir de edificios |
| Transición de mapa | `world/door.ogg` | Al cambiar de zona (opcional) |
| Interactuar con objeto | `world/door.ogg` | Cofres, NPCs (temporal) |

**Integración:**
```javascript
// En MapTransitions.js o BuildingSystem.js
import { audioManager } from './AudioManager.js';

// Al entrar a un edificio
audioManager.play('world/door');
```

---

### 3. Configuración de Audio (config.js)

Añadir al archivo `js/config.js`:

```javascript
// Configuración de audio
AUDIO: {
    ENABLED: true,
    VOLUMES: {
        MASTER: 1.0,
        MUSIC: 0.4,      // Volumen de música de fondo
        BATTLE: 0.8,
        ENEMIES: 0.7,
        GATHERING: 0.6,
        INVENTORY: 0.5,
        WORLD: 0.7
    },
    COOLDOWN_MS: 100, // Tiempo mínimo entre reproducción del mismo sonido
    POOL_SIZE: 3, // Cantidad de instancias por sonido para overlapping
    FALLBACK_ENEMY_SOUND: 'general', // Sonido por defecto para enemigos
    MUSIC: {
        FADE_DURATION: 2000, // Duración del crossfade en ms
        LOOP: true,          // Música en loop
        PRELOAD: 'auto'      // Precarga de música
    }
},
```

---

### 4. Sistema de Música de Fondo

El AudioManager incluye un sistema completo para gestionar música de fondo con las siguientes características:

#### **Características de Música:**
- **Crossfade automático**: Transiciones suaves entre pistas (2 segundos configurable)
- **Loop automático**: Música en bucle continuo
- **Control de volumen independiente**: Volumen separado para música vs efectos
- **Gestión inteligente**: No reproduce la misma pista si ya está sonando
- **Fade in/out**: Inicio y fin suaves de las pistas

#### **Métodos disponibles:**

```javascript
// Reproducir música con fade in (por defecto)
audioManager.playMusic('exploration');

// Reproducir música sin fade in
audioManager.playMusic('combat', false);

// Detener música con fade out
audioManager.stopMusic();

// Detener música sin fade out
audioManager.stopMusic(false);

// Pausar música (mantiene posición)
audioManager.pauseMusic();

// Reanudar música pausada
audioManager.resumeMusic();

// Cambiar volumen de música (0.0 - 1.0)
audioManager.setMusicVolume(0.5);
```

#### **Pistas de música propuestas:**
- `menu` - Tema de menú principal
- `exploration` - Exploración de mundo abierto
- `combat` - Música de combate
- `city` - Tema de ciudad/pueblo
- `dungeon` - Música de mazmorras
- `boss` - Música de jefes finales

#### **Ejemplo de uso en el juego:**

```javascript
// Al entrar al mapa
if (mapType === 'city') {
    audioManager.playMusic('city');
} else if (mapType === 'dungeon') {
    audioManager.playMusic('dungeon');
}

// Al iniciar combate
if (enemyIsBoss) {
    audioManager.playMusic('boss');
} else {
    audioManager.playMusic('combat');
}

// Al salir del combate
audioManager.playMusic('exploration');
```

**NOTA:** Actualmente la carpeta `resources/audio/music/` está vacía. El sistema está preparado para recibir archivos de música en formato OGG cuando estén disponibles.

---

### 5. Interfaz de Usuario para Audio

Añadir controles de audio en el panel de configuración/opciones:

- **Toggle general**: Activar/desactivar audio completo
- **Volumen maestro**: Control deslizante 0-100%
- **Volumen música**: Control deslizante independiente 0-100%
- **Volúmenes por categoría de efectos**: 
  - Combate
  - Enemigos
  - Recolección
  - Inventario
  - Mundo

---

### 6. Priorización de Implementación

#### **Fase 1: Base del Sistema (CRÍTICO)**
1. Crear `AudioManager.js` con funcionalidades básicas
2. Integrar en sistema de combate (ataques)
3. Integrar en sistema de recolección (talar árboles)
4. Añadir configuración en `config.js`

#### **Fase 2: Expansión (IMPORTANTE)**
5. Integrar sonidos de enemigos
6. Integrar sonidos de inventario/equipamiento
7. Añadir controles de volumen en UI
8. Sistema de cooldown y pool de audio

#### **Fase 3: Sistema de Música (IMPORTANTE)**
9. Implementar sistema de música de fondo
10. Añadir pistas de música a `resources/audio/music/`
11. Integrar cambios de música por contexto (mapas, combate)
12. Añadir controles de música en UI

#### **Fase 4: Refinamiento (OPCIONAL)**
13. Sonidos de mundo (puertas, transiciones)
14. Efectos espaciales (volumen según distancia)
15. Fade in/out en transiciones de mapa
16. Sistema de playlists dinámicas

---

### 7. Ejemplo de Implementación: AudioManager.js

```javascript
/**
 * Sistema de gestión de audio del juego
 * Maneja reproducción, volúmenes y pooling de efectos de sonido
 */

import { CONFIG } from '../config.js';

class AudioManager {
    constructor() {
        this.enabled = CONFIG.AUDIO.ENABLED;
        this.volumes = CONFIG.AUDIO.VOLUMES;
        this.sounds = new Map();
        this.lastPlayed = new Map();
        this.cooldownMs = CONFIG.AUDIO.COOLDOWN_MS;
        
        // Música de fondo
        this.currentMusic = null;
        this.nextMusic = null;
        this.musicTracks = new Map();
        this.isFading = false;
        
        // Precargar todos los efectos de sonido
        this.preloadSounds();
        this.preloadMusic();
    }

    preloadSounds() {
        const soundPaths = {
            // Battle
            'battle/attackPunch': 'resources/audio/effects/battle/attackPunch.ogg',
            'battle/attackSword': 'resources/audio/effects/battle/attackSword.ogg',
            
            // Enemies
            'enemies/demon': 'resources/audio/effects/enemies/demon.ogg',
            'enemies/general': 'resources/audio/effects/enemies/general.ogg',
            'enemies/goblin': 'resources/audio/effects/enemies/goblin.ogg',
            'enemies/slime': 'resources/audio/effects/enemies/slime.ogg',
            'enemies/wolf': 'resources/audio/effects/enemies/wolf.ogg',
            
            // Gathering
            'gathering/gatherFish': 'resources/audio/effects/gathering/gatherFish.ogg',
            'gathering/gatherMetal': 'resources/audio/effects/gathering/gatherMetal.ogg',
            'gathering/gatherStone': 'resources/audio/effects/gathering/gatherStone.ogg',
            'gathering/gatherWood': 'resources/audio/effects/gathering/gatherWood.ogg',
            
            // Inventory
            'inventory/equipArmor': 'resources/audio/effects/inventory/equipArmor.ogg',
            'inventory/equipTool': 'resources/audio/effects/inventory/equipTool.ogg',
            'inventory/useBottleOrPotion': 'resources/audio/effects/inventory/useBottleOrPotion.ogg',
            
            // World
            'world/door': 'resources/audio/effects/world/door.ogg'
        };

        for (const [key, path] of Object.entries(soundPaths)) {
            this.loadSound(key, path);
        }
    }

    loadSound(key, path) {
        // Crear pool de instancias para permitir overlapping
        const pool = [];
        for (let i = 0; i < CONFIG.AUDIO.POOL_SIZE; i++) {
            const audio = new Audio(path);
            audio.preload = 'auto';
            pool.push(audio);
        }
        this.sounds.set(key, pool);
    }

    play(soundKey, category = null) {
        if (!this.enabled) return;

        // Verificar cooldown
        const now = Date.now();
        const lastTime = this.lastPlayed.get(soundKey) || 0;
        if (now - lastTime < this.cooldownMs) {
            return;
        }

        const pool = this.sounds.get(soundKey);
        if (!pool) {
            console.warn(`Sound not found: ${soundKey}`);
            return;
        }

        // Buscar instancia disponible en el pool
        const audio = pool.find(a => a.paused || a.ended);
        if (!audio) {
            console.warn(`All audio instances busy for: ${soundKey}`);
            return;
        }

        // Calcular volumen
        const categoryVolume = category ? this.volumes[category.toUpperCase()] || 1.0 : 1.0;
        audio.volume = this.volumes.MASTER * categoryVolume;

        // Reproducir
        audio.currentTime = 0;
        audio.play().catch(err => {
            console.warn(`Failed to play ${soundKey}:`, err);
        });

        this.lastPlayed.set(soundKey, now);
    }

    setVolume(category, volume) {
        category = category.toUpperCase();
        if (this.volumes.hasOwnProperty(category)) {
            this.volumes[category] = Math.max(0, Math.min(1, volume));
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopAll();
        }
    }

    stopAll() {
        for (const pool of this.sounds.values()) {
            pool.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        }
    }

    getEnemySound(enemyType) {
        const soundKey = `enemies/${enemyType}`;
        if (this.sounds.has(soundKey)) {
            return soundKey;
        }
        return `enemies/${CONFIG.AUDIO.FALLBACK_ENEMY_SOUND}`;
    }

    // ==================== SISTEMA DE MÚSICA ====================

    preloadMusic() {
        const musicPaths = {
            'menu': 'resources/audio/music/menu_theme.ogg',
            'exploration': 'resources/audio/music/exploration_theme.ogg',
            'combat': 'resources/audio/music/combat_theme.ogg',
            'city': 'resources/audio/music/city_theme.ogg',
            'dungeon': 'resources/audio/music/dungeon_theme.ogg',
            'boss': 'resources/audio/music/boss_theme.ogg'
        };

        for (const [key, path] of Object.entries(musicPaths)) {
            const audio = new Audio(path);
            audio.preload = CONFIG.AUDIO.MUSIC.PRELOAD;
            audio.loop = CONFIG.AUDIO.MUSIC.LOOP;
            audio.volume = 0; // Empezar en silencio para fade in
            this.musicTracks.set(key, audio);
        }
    }

    playMusic(trackKey, fadeIn = true) {
        if (!this.enabled) return;

        const track = this.musicTracks.get(trackKey);
        if (!track) {
            console.warn(`Music track not found: ${trackKey}`);
            return;
        }

        // Si ya está sonando esta pista, no hacer nada
        if (this.currentMusic === track && !track.paused) {
            return;
        }

        if (this.currentMusic && !this.currentMusic.paused) {
            // Hay música sonando, hacer crossfade
            this.crossfade(track, fadeIn);
        } else {
            // No hay música, reproducir directamente
            this.startMusic(track, fadeIn);
        }
    }

    startMusic(track, fadeIn) {
        this.currentMusic = track;
        track.currentTime = 0;
        
        if (fadeIn) {
            track.volume = 0;
            track.play().catch(err => {
                console.warn('Failed to play music:', err);
            });
            this.fadeVolume(track, this.volumes.MUSIC, CONFIG.AUDIO.MUSIC.FADE_DURATION);
        } else {
            track.volume = this.volumes.MASTER * this.volumes.MUSIC;
            track.play().catch(err => {
                console.warn('Failed to play music:', err);
            });
        }
    }

    crossfade(newTrack, fadeIn = true) {
        if (this.isFading) return;
        
        this.isFading = true;
        const oldTrack = this.currentMusic;
        const duration = CONFIG.AUDIO.MUSIC.FADE_DURATION;
        
        // Fade out de la música actual
        this.fadeVolume(oldTrack, 0, duration, () => {
            oldTrack.pause();
            oldTrack.currentTime = 0;
        });

        // Fade in de la nueva música
        newTrack.currentTime = 0;
        newTrack.volume = 0;
        newTrack.play().catch(err => {
            console.warn('Failed to play music:', err);
        });
        
        if (fadeIn) {
            this.fadeVolume(newTrack, this.volumes.MUSIC, duration, () => {
                this.isFading = false;
            });
        } else {
            newTrack.volume = this.volumes.MASTER * this.volumes.MUSIC;
            this.isFading = false;
        }

        this.currentMusic = newTrack;
    }

    fadeVolume(audio, targetVolume, duration, callback = null) {
        const startVolume = audio.volume;
        const volumeDelta = targetVolume - startVolume;
        const startTime = Date.now();

        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            audio.volume = startVolume + (volumeDelta * progress);

            if (progress < 1) {
                requestAnimationFrame(fade);
            } else if (callback) {
                callback();
            }
        };

        requestAnimationFrame(fade);
    }

    stopMusic(fadeOut = true) {
        if (!this.currentMusic) return;

        if (fadeOut) {
            this.fadeVolume(this.currentMusic, 0, CONFIG.AUDIO.MUSIC.FADE_DURATION, () => {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
                this.currentMusic = null;
            });
        } else {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }

    pauseMusic() {
        if (this.currentMusic && !this.currentMusic.paused) {
            this.currentMusic.pause();
        }
    }

    resumeMusic() {
        if (this.currentMusic && this.currentMusic.paused) {
            this.currentMusic.play().catch(err => {
                console.warn('Failed to resume music:', err);
            });
        }
    }

    setMusicVolume(volume) {
        this.volumes.MUSIC = Math.max(0, Math.min(1, volume));
        if (this.currentMusic && !this.currentMusic.paused) {
            this.currentMusic.volume = this.volumes.MASTER * this.volumes.MUSIC;
        }
    }
}

// Exportar instancia singleton
export const audioManager = new AudioManager();
```

---

### 8. Ventajas del Sistema Propuesto

✅ **Modular**: Sistema independiente y fácil de mantener
✅ **Eficiente**: Pool de audio para evitar cortes y overlapping
✅ **Configurable**: Control de volúmenes por categoría
✅ **Escalable**: Fácil añadir nuevos sonidos
✅ **Optimizado**: Sistema de cooldown evita spam
✅ **Robusto**: Fallbacks para sonidos no encontrados

---

### 9. Sonidos Adicionales Recomendados (Futuro)

Para expandir el sistema de audio en el futuro:

#### **Combate:**
- Sonido de bloqueo con escudo
- Sonido de esquive
- Sonido de muerte del enemigo
- Sonido de victoria

#### **Magia:**
- Lanzamiento de hechizos
- Impacto de hechizos
- Buff/Debuff aplicado

#### **Mundo:**
- Pasos del jugador (variaciones por terreno)
- Ambiente (pájaros, viento, agua)
- Sonidos de NPCs

#### **UI:**
- Click de botones
- Apertura/cierre de ventanas
- Notificaciones
- Nivel subido

---

### 10. Notas de Implementación

**Formato de Audio:**
- Archivos OGG Opus: Excelente compresión y calidad
- Compatible con todos los navegadores modernos
- Tamaño optimizado para web

**Consideraciones de Rendimiento:**
- Precarga todos los sonidos al inicio
- Pool de 3 instancias por sonido (configurable)
- Cooldown de 100ms entre mismos sonidos
- No más de 10-15 sonidos simultáneos

**Compatibilidad:**
- Funciona en Chrome, Firefox, Safari, Edge
- Fallback silencioso si el navegador no soporta audio
- Sistema desactivable por el usuario

---

## Conclusión

El sistema de audio propuesto integra perfectamente los efectos de sonido disponibles en las mecánicas existentes del juego. La implementación por fases permite añadir funcionalidad gradualmente sin romper el código existente.

**Recomendación:** Comenzar con la Fase 1 (combate y recolección) para validar el sistema, luego expandir a las demás categorías.