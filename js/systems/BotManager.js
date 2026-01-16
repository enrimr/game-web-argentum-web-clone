/**
 * BotManager.js
 * Sistema de gestión de jugadores bot
 * Crea, actualiza y gestiona los bots en el juego
 */

import { BotPlayer } from '../entities/BotPlayer.js';
import { CONFIG } from '../config.js';

export class BotManager {
    constructor() {
        this.bots = [];
        this.nextBotId = 1;
        this.maxBotsPerMap = 5; // Máximo de bots por mapa
        this.spawnCooldown = 5000; // 5 segundos entre spawns
        this.lastSpawnTime = 0;
    }
    
    /**
     * Inicializa el sistema de bots
     * @param {object} gameState - Estado del juego
     */
    init(gameState) {
        console.log('🤖 Iniciando sistema de bots...');
        gameState.bots = this.bots;
        
        // Crear algunos bots iniciales
        this.spawnInitialBots(gameState);
    }
    
    /**
     * Genera bots iniciales en el mapa actual
     * @param {object} gameState - Estado del juego
     */
    spawnInitialBots(gameState) {
        const numBots = Math.floor(Math.random() * 3) + 2; // 2-4 bots iniciales
        
        for (let i = 0; i < numBots; i++) {
            this.spawnBot(gameState, gameState.currentMap);
        }
        
        console.log(`✅ ${numBots} bots iniciales creados en ${gameState.currentMap}`);
    }
    
    /**
     * Genera un nuevo bot en un mapa específico
     * @param {object} gameState - Estado del juego
     * @param {string} mapName - Nombre del mapa donde aparecer
     * @returns {BotPlayer|null} El bot creado o null si no se pudo crear
     */
    spawnBot(gameState, mapName) {
        // Buscar una posición caminable aleatoria
        const spawnPos = this.findRandomSpawnPosition(gameState, mapName);
        
        if (!spawnPos) {
            console.warn('⚠️ No se encontró posición de spawn para bot');
            return null;
        }
        
        // Crear el bot
        const botId = `bot_${this.nextBotId++}`;
        const bot = new BotPlayer(botId, spawnPos.x, spawnPos.y, mapName);
        
        this.bots.push(bot);
        console.log(`🤖 Bot creado: ${bot.name} (Nivel ${bot.level}) en ${mapName} (${spawnPos.x}, ${spawnPos.y})`);
        
        return bot;
    }
    
    /**
     * Encuentra una posición de spawn aleatoria caminable
     * @param {object} gameState - Estado del juego
     * @param {string} mapName - Nombre del mapa
     * @returns {object|null} Posición {x, y} o null si no se encontró
     */
    findRandomSpawnPosition(gameState, mapName) {
        const attempts = 50;
        
        for (let i = 0; i < attempts; i++) {
            const x = Math.floor(Math.random() * CONFIG.MAP_WIDTH);
            const y = Math.floor(Math.random() * CONFIG.MAP_HEIGHT);
            
            // Verificar que sea caminable
            const tile = gameState.map[y]?.[x];
            if (tile !== 0 && tile !== 6 && tile !== 8) continue; // GRASS, FLOOR, PATH
            
            // Verificar que no esté ocupado por el jugador
            if (x === gameState.player.x && y === gameState.player.y) continue;
            
            // Verificar que no esté ocupado por otros bots
            let occupied = false;
            for (const bot of this.bots) {
                if (bot.currentMap === mapName && bot.x === x && bot.y === y) {
                    occupied = true;
                    break;
                }
            }
            if (occupied) continue;
            
            // Verificar que no esté ocupado por NPCs
            for (const npc of gameState.npcs) {
                if (npc.x === x && npc.y === y) {
                    occupied = true;
                    break;
                }
            }
            if (occupied) continue;
            
            // Posición válida encontrada
            return { x, y };
        }
        
        return null;
    }
    
    /**
     * Actualiza todos los bots
     * @param {number} deltaTime - Tiempo transcurrido desde la última actualización
     * @param {object} gameState - Estado del juego
     */
    update(deltaTime, gameState) {
        // Actualizar cada bot en el mapa actual
        const currentMapBots = this.bots.filter(bot => bot.currentMap === gameState.currentMap);
        
        for (const bot of currentMapBots) {
            bot.update(deltaTime, gameState);
            
            // Verificar si el bot debe cambiar de mapa
            this.checkBotMapTransition(bot, gameState);
        }
        
        // Verificar si necesitamos generar más bots
        this.checkSpawnNewBots(gameState);
    }
    
    /**
     * Verifica si un bot debe cambiar de mapa
     * @param {BotPlayer} bot - El bot a verificar
     * @param {object} gameState - Estado del juego
     */
    checkBotMapTransition(bot, gameState) {
        // Verificar si el bot está sobre un portal
        for (const obj of gameState.objects) {
            if ((obj.type === 'PORTAL' || obj.type === 'portal') && 
                obj.x === bot.x && obj.y === bot.y && 
                obj.targetMap) {
                
                // Cambiar al bot de mapa
                console.log(`🌀 Bot ${bot.name} viaja de ${bot.currentMap} a ${obj.targetMap}`);
                bot.changeMap(obj.targetMap, obj.targetX || 10, obj.targetY || 10);
                
                // Si el bot cambió al mapa actual del jugador, anunciarlo
                if (obj.targetMap === gameState.currentMap) {
                    if (typeof window !== 'undefined' && window.addChatMessage) {
                        window.addChatMessage('system', `🤖 ${bot.name} ha llegado al mapa`);
                    }
                }
            }
        }
    }
    
    /**
     * Verifica si se deben generar nuevos bots
     * @param {object} gameState - Estado del juego
     */
    checkSpawnNewBots(gameState) {
        const currentTime = Date.now();
        
        // Solo generar si ha pasado el cooldown
        if (currentTime - this.lastSpawnTime < this.spawnCooldown) {
            return;
        }
        
        // Contar bots en el mapa actual
        const currentMapBots = this.bots.filter(bot => bot.currentMap === gameState.currentMap);
        
        // Si hay menos del máximo, intentar generar uno nuevo
        if (currentMapBots.length < this.maxBotsPerMap) {
            const shouldSpawn = Math.random() < 0.3; // 30% de probabilidad
            
            if (shouldSpawn) {
                this.spawnBot(gameState, gameState.currentMap);
                this.lastSpawnTime = currentTime;
            }
        }
    }
    
    /**
     * Obtiene los bots del mapa actual
     * @param {string} mapName - Nombre del mapa
     * @returns {BotPlayer[]} Array de bots en el mapa
     */
    getBotsInMap(mapName) {
        return this.bots.filter(bot => bot.currentMap === mapName);
    }
    
    /**
     * Elimina un bot por ID
     * @param {string} botId - ID del bot a eliminar
     */
    removeBot(botId) {
        const index = this.bots.findIndex(bot => bot.id === botId);
        if (index !== -1) {
            const bot = this.bots[index];
            console.log(`🗑️ Bot eliminado: ${bot.name}`);
            this.bots.splice(index, 1);
        }
    }
    
    /**
     * Limpia todos los bots
     */
    clear() {
        console.log('🧹 Limpiando todos los bots...');
        this.bots = [];
        this.nextBotId = 1;
    }
    
    /**
     * Maneja el cambio de mapa del jugador
     * @param {string} newMap - Nuevo mapa
     * @param {object} gameState - Estado del juego
     */
    onPlayerMapChange(newMap, gameState) {
        console.log(`🗺️ Jugador cambió a ${newMap}, verificando bots...`);
        
        // Si hay pocos bots en el nuevo mapa, generar algunos
        const currentMapBots = this.bots.filter(bot => bot.currentMap === newMap);
        
        if (currentMapBots.length < 2) {
            const numToSpawn = Math.floor(Math.random() * 2) + 1; // 1-2 bots
            for (let i = 0; i < numToSpawn; i++) {
                this.spawnBot(gameState, newMap);
            }
        }
    }
}

// Instancia singleton del gestor de bots
export const botManager = new BotManager();
