/**
 * Sistema de gestión de audio del juego
 * Maneja reproducción, volúmenes y pooling de efectos de sonido y música
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
        this.currentMusicKey = null; // Guardar qué música estaba sonando
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
            'world/door': 'resources/audio/effects/world/door.ogg',
            'world/openDoor': 'resources/audio/effects/world/openDoor.ogg',
            'world/closeDoor': 'resources/audio/effects/world/closeDoor.ogg',
            
            // Battle effects
            'battle/death': 'resources/audio/effects/battle/death.ogg',
            
            // Weather
            'weather/rain': 'resources/audio/effects/weather/rain.ogg'
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
        if (!this.enabled || !this.isSfxEnabled()) return;

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
            this.stopMusic(false);
        }
    }

    setMusicEnabled(enabled) {
        CONFIG.AUDIO.MUSIC_ENABLED = enabled;
        if (!enabled) {
            // Solo pausar la música, no detenerla completamente
            if (this.currentMusic && !this.currentMusic.paused) {
                this.currentMusic.pause();
            }
        } else {
            // Reanudar música pausada o reiniciar la última pista
            if (this.currentMusic && this.currentMusic.paused) {
                this.currentMusic.play().catch(err => {
                    console.warn('Failed to resume music:', err);
                });
            } else if (this.currentMusicKey) {
                // Si no hay música actual pero sí teníamos una clave guardada, reproducirla
                this.playMusic(this.currentMusicKey, true);
            }
        }
    }

    setSfxEnabled(enabled) {
        CONFIG.AUDIO.SFX_ENABLED = enabled;
    }

    isMusicEnabled() {
        return CONFIG.AUDIO.MUSIC_ENABLED !== false;
    }

    isSfxEnabled() {
        return CONFIG.AUDIO.SFX_ENABLED !== false;
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
            'forest': 'resources/audio/music/backgroundForest.ogg',
            'mountain': 'resources/audio/music/backgroundMountain.ogg',
            'village': 'resources/audio/music/backgroundVillage.ogg'
        };

        for (const [key, path] of Object.entries(musicPaths)) {
            const audio = new Audio(path);
            audio.preload = CONFIG.AUDIO.MUSIC.PRELOAD;
            audio.loop = CONFIG.AUDIO.MUSIC.LOOP;
            audio.volume = 0; // Empezar en silencio para fade in
            
            // Manejar error si el archivo no existe (la carpeta music está vacía)
            audio.addEventListener('error', () => {
                console.warn(`Music file not found: ${path}`);
            });
            
            this.musicTracks.set(key, audio);
        }
    }

    playMusic(trackKey, fadeIn = true) {
        // Guardar la clave de la música SIEMPRE (incluso si está deshabilitada)
        // para poder reproducirla cuando el usuario la active
        this.currentMusicKey = trackKey;
        
        if (!this.enabled || !this.isMusicEnabled()) {
            console.log(`🎵 Música ${trackKey} guardada pero no reproducida (audio deshabilitado)`);
            return;
        }

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

    /**
     * Obtiene la clave de música apropiada según el tipo de mapa
     * @param {string} mapType - Tipo de mapa (city, forest, mountain, dungeon, etc)
     * @returns {string} Clave de la pista de música
     */
    getMusicForMapType(mapType) {
        const mapping = CONFIG.AUDIO.MAP_MUSIC;
        
        // Mapear tipos específicos
        if (mapType === 'city' || mapType === 'town') {
            return mapping.village || 'village';
        }
        if (mapType === 'forest' || mapType === 'field') {
            return mapping.forest || 'forest';
        }
        if (mapType === 'mountain' || mapType === 'dungeon') {
            return mapping.mountain || 'mountain';
        }
        
        // Por defecto
        return mapping.default || 'forest';
    }
}

// Exportar instancia singleton
export const audioManager = new AudioManager();
