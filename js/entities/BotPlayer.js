/**
 * BotPlayer.js
 * Clase para simular jugadores bot que aparecen en los mapas
 * Los bots pueden moverse, atacar, hablar y navegar entre mapas
 */

import { Character } from './Character.js';
import { CONFIG } from '../config.js';
import { createBotEquipment } from '../systems/EquipmentSystem.js';

// Lista de nombres aleatorios para los bots
const BOT_NAMES = [
    'Arthas', 'Gandalf', 'Legolas', 'Aragorn', 'Frodo',
    'Merlin', 'Lancelot', 'Arthur', 'Percival', 'Galahad',
    'Thor', 'Odin', 'Loki', 'Heimdall', 'Baldur',
    'Kratos', 'Athena', 'Zeus', 'Poseidon', 'Hades',
    'Link', 'Zelda', 'Geralt', 'Ciri', 'Yennefer',
    'Raiden', 'Scorpion', 'SubZero', 'Liu Kang', 'Sonya',
    'Cloud', 'Tifa', 'Sephiroth', 'Aerith', 'Barret',
    'Mario', 'Luigi', 'Peach', 'Bowser', 'Yoshi',
    'Sonic', 'Tails', 'Knuckles', 'Shadow', 'Amy',
    'Dante', 'Vergil', 'Nero', 'Lady', 'Trish'
];

// Comportamientos posibles de los bots
const BOT_BEHAVIORS = {
    IDLE: 'idle',                    // Sin hacer nada
    WANDERING: 'wandering',          // Caminando sin rumbo
    HUNTING: 'hunting',              // Cazando enemigos
    CHATTING: 'chatting',            // Hablando en el chat
    TRAVELING: 'traveling',          // Viajando entre mapas
    SEEKING_RESURRECTION: 'seeking_resurrection' // Buscando sacerdote para resucitar
};

// Mensajes aleatorios que pueden decir los bots
const BOT_MESSAGES = [
    '¡Hola a todos!',
    '¿Alguien quiere hacer party?',
    'Voy a cazar goblins',
    '¿Dónde está el banco?',
    'Necesito pociones',
    '¡Cuidado con los enemigos!',
    'Este mapa es genial',
    '¿Alguien vende armas?',
    'Buscando grupo para dungeon',
    '¡Buena suerte!',
    'GG WP',
    'Este juego es increíble',
    '¿Alguien me ayuda?',
    'Voy al bosque',
    'Hay muchos enemigos aquí',
    'Level up!',
    '¡Victoria!',
    'Necesito descansar',
    '¿Qué tal el día?',
    'Adiós, nos vemos'
];

export class BotPlayer extends Character {
    /**
     * Constructor del jugador bot
     * @param {string} id - ID único del bot
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} currentMap - Mapa actual donde aparece el bot
     */
    constructor(id, x, y, currentMap) {
        super();
        
        this.id = id;
        this.x = x;
        this.y = y;
        this.name = this.generateRandomName();
        this.currentMap = currentMap;
        
        // Propiedades visuales
        this.facing = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
        this.moving = false;
        
        // Propiedades de animación
        this.animation = {
            state: 'idle',
            frame: 0,
            frameTime: 0,
            frameDelay: 150
        };
        
        // Propiedades de IA
        this.behavior = BOT_BEHAVIORS.IDLE;
        this.behaviorTimer = 0;
        this.behaviorDuration = this.getRandomBehaviorDuration();
        
        // Movimiento
        this.targetX = null;
        this.targetY = null;
        this.movementSpeed = 400; // ms por tile (más lento que el jugador: 400ms vs 200ms)
        this.lastMoveTime = 0;
        
        // Chat
        this.lastChatTime = 0;
        this.chatCooldown = 5000 + Math.random() * 10000; // 5-15 segundos
        
        // Combate
        this.target = null;
        this.attackCooldown = 1000;
        this.lastAttackTime = 0;
        
        // Estadísticas aleatorias
        this.level = Math.floor(Math.random() * 10) + 1;
        this.maxHp = 100 + (this.level * 10);
        this.hp = this.maxHp;
        
        // Propiedades adicionales para ficha de información
        this.faction = this.getRandomFaction();
        this.class = this.getRandomClass();
        this.guild = null; // Sin guild por defecto, se puede agregar en futuro
        this.status = 'online'; // online, afk, busy, etc.
        this.createdAt = Date.now(); // Timestamp de creación
        
        // Equipamiento visual basado en la clase
        this.equipment = createBotEquipment(this.class);
        
        // Inventario aleatorio con pociones y items básicos
        this.inventory = this.generateRandomInventory();
        
        // Apariencia aleatoria para el sprite
        this.race = this.getRandomRace();
        this.appearance = this.generateRandomAppearance();
    }
    
    /**
     * Obtiene una raza aleatoria
     * @returns {string} ID de la raza
     */
    getRandomRace() {
        const races = ['human', 'dwarf', 'creature'];
        return races[Math.floor(Math.random() * races.length)];
    }
    
    /**
     * Genera una apariencia aleatoria
     * @returns {object} Objeto con colores aleatorios
     */
    generateRandomAppearance() {
        const tunicColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'];
        const skinColors = ['light', 'medium', 'tan', 'dark', 'gray', 'green'];
        
        return {
            tunicColor: tunicColors[Math.floor(Math.random() * tunicColors.length)],
            skinColor: skinColors[Math.floor(Math.random() * skinColors.length)]
        };
    }
    
    /**
     * Genera un inventario aleatorio para el bot
     * Solo items válidos en ITEM_TYPES
     * @returns {Array} Array de items
     */
    generateRandomInventory() {
        const items = [];
        
        // Pociones rojas (HP) - 1 a 5
        const redPotions = Math.floor(Math.random() * 5) + 1;
        items.push({ type: 'POTION_RED', quantity: redPotions });
        
        // Pociones azules (Mana) - 0 a 3
        const bluePotions = Math.floor(Math.random() * 4);
        if (bluePotions > 0) {
            items.push({ type: 'POTION_BLUE', quantity: bluePotions });
        }
        
        // Pociones verdes (Veneno) - 0 a 2
        const greenPotions = Math.floor(Math.random() * 3);
        if (greenPotions > 0) {
            items.push({ type: 'POTION_GREEN', quantity: greenPotions });
        }
        
        // Flechas (si es arquero) - 10 a 50
        if (this.class === 'Arquero') {
            const arrows = Math.floor(Math.random() * 41) + 10;
            items.push({ type: 'ARROW', quantity: arrows });
        }
        
        // Items de equipamiento extra (formato ITEM_TYPES correcto)
        const extraWeapons = ['SWORD', 'SWORD_IRON', 'BOW'];
        const extraArmor = ['ARMOR_LEATHER', 'ARMOR_PLATE'];
        const extraShields = ['SHIELD', 'SHIELD_IRON'];
        const extraHelmets = ['HELMET_LEATHER', 'HELMET_FULL'];
        
        // 30% probabilidad de arma extra
        if (Math.random() > 0.7) {
            const weapon = extraWeapons[Math.floor(Math.random() * extraWeapons.length)];
            items.push({ type: weapon, quantity: 1 });
        }
        
        // 20% probabilidad de armadura extra
        if (Math.random() > 0.8) {
            const armor = extraArmor[Math.floor(Math.random() * extraArmor.length)];
            items.push({ type: armor, quantity: 1 });
        }
        
        // 20% probabilidad de escudo extra
        if (Math.random() > 0.8) {
            const shield = extraShields[Math.floor(Math.random() * extraShields.length)];
            items.push({ type: shield, quantity: 1 });
        }
        
        // 20% probabilidad de casco extra
        if (Math.random() > 0.8) {
            const helmet = extraHelmets[Math.floor(Math.random() * extraHelmets.length)];
            items.push({ type: helmet, quantity: 1 });
        }
        
        // Objetos aleatorios de crafting (30% probabilidad cada uno)
        const craftingItems = ['WOOD', 'IRON_ORE', 'COAL', 'ROPE'];
        craftingItems.forEach(itemType => {
            if (Math.random() > 0.7) {
                const quantity = Math.floor(Math.random() * 5) + 1;
                items.push({ type: itemType, quantity });
            }
        });
        
        // Oro aleatorio
        this.gold = Math.floor(Math.random() * 1000) + 100;
        
        return items;
    }
    
    /**
     * Obtiene una facción aleatoria
     * @returns {string} Nombre de la facción
     */
    getRandomFaction() {
        const factions = ['Neutral', 'Reino', 'Legión', 'Caos', 'Armada'];
        return factions[Math.floor(Math.random() * factions.length)];
    }
    
    /**
     * Obtiene una clase aleatoria
     * @returns {string} Nombre de la clase
     */
    getRandomClass() {
        const classes = ['Guerrero', 'Mago', 'Arquero', 'Clérigo', 'Asesino', 'Paladín'];
        return classes[Math.floor(Math.random() * classes.length)];
    }
    
    /**
     * Genera un nombre aleatorio para el bot
     * @returns {string} Nombre del bot
     */
    generateRandomName() {
        const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        const suffix = Math.floor(Math.random() * 999);
        return `${name}${suffix}`;
    }
    
    /**
     * Obtiene una duración aleatoria para un comportamiento
     * @returns {number} Duración en ms
     */
    getRandomBehaviorDuration() {
        return 5000 + Math.random() * 10000; // 5-15 segundos (más tiempo en cada comportamiento)
    }
    
    /**
     * Actualiza el estado del bot
     * @param {number} deltaTime - Tiempo transcurrido desde la última actualización
     * @param {object} gameState - Estado actual del juego
     */
    update(deltaTime, gameState) {
        // Si el bot es fantasma, solo busca resurrección
        if (this.isGhost) {
            this.behavior = BOT_BEHAVIORS.SEEKING_RESURRECTION;
            this.updateSeekingResurrection(deltaTime, gameState);
            this.updateAnimation(deltaTime);
            return;
        }
        
        // Actualizar temporizador de comportamiento
        this.behaviorTimer += deltaTime;
        
        // Cambiar de comportamiento si el tiempo se acabó
        if (this.behaviorTimer >= this.behaviorDuration) {
            this.changeBehavior();
        }
        
        // Ejecutar comportamiento actual
        switch (this.behavior) {
            case BOT_BEHAVIORS.IDLE:
                this.updateIdle(deltaTime, gameState);
                break;
            case BOT_BEHAVIORS.WANDERING:
                this.updateWandering(deltaTime, gameState);
                break;
            case BOT_BEHAVIORS.HUNTING:
                this.updateHunting(deltaTime, gameState);
                break;
            case BOT_BEHAVIORS.CHATTING:
                this.updateChatting(deltaTime, gameState);
                break;
            case BOT_BEHAVIORS.TRAVELING:
                this.updateTraveling(deltaTime, gameState);
                break;
        }
        
        // Actualizar animación
        this.updateAnimation(deltaTime);
    }
    
    /**
     * Cambia el comportamiento del bot aleatoriamente
     */
    changeBehavior() {
        const behaviors = Object.values(BOT_BEHAVIORS);
        const weights = [50, 25, 10, 10, 5]; // Probabilidades: idle(50%), wandering(25%), hunting(10%), chatting(10%), traveling(5%)
        
        const random = Math.random() * 100;
        let accumulated = 0;
        
        for (let i = 0; i < behaviors.length; i++) {
            accumulated += weights[i];
            if (random <= accumulated) {
                this.behavior = behaviors[i];
                break;
            }
        }
        
        this.behaviorTimer = 0;
        this.behaviorDuration = this.getRandomBehaviorDuration();
        
        // Reiniciar objetivos
        this.targetX = null;
        this.targetY = null;
        this.target = null;
    }
    
    /**
     * Actualiza el comportamiento idle (sin hacer nada)
     */
    updateIdle(deltaTime, gameState) {
        this.moving = false;
        this.animation.state = 'idle';
    }
    
    /**
     * Actualiza el comportamiento wandering (caminar sin rumbo)
     */
    updateWandering(deltaTime, gameState) {
        const currentTime = Date.now();
        
        // Si no hay objetivo, elegir uno aleatorio
        if (this.targetX === null || this.targetY === null) {
            this.selectRandomTarget(gameState);
        }
        
        // Mover hacia el objetivo
        if (this.targetX !== null && this.targetY !== null) {
            if (currentTime - this.lastMoveTime >= this.movementSpeed) {
                this.moveTowardsTarget(gameState);
                this.lastMoveTime = currentTime;
            }
        }
    }
    
    /**
     * Actualiza el comportamiento hunting (cazando enemigos)
     */
    updateHunting(deltaTime, gameState) {
        const currentTime = Date.now();
        
        // Buscar enemigo cercano si no hay objetivo
        if (!this.target || this.target.hp <= 0) {
            this.target = this.findNearestEnemy(gameState);
        }
        
        // Si hay enemigo, moverse hacia él y atacar
        if (this.target) {
            const distance = this.getDistance(this.target.x, this.target.y);
            
            if (distance <= 1) {
                // Atacar si está al lado
                if (currentTime - this.lastAttackTime >= this.attackCooldown) {
                    this.attackEnemy(this.target, gameState);
                    this.lastAttackTime = currentTime;
                }
                this.moving = false;
                this.animation.state = 'attacking';
            } else {
                // Moverse hacia el enemigo
                if (currentTime - this.lastMoveTime >= this.movementSpeed) {
                    this.targetX = this.target.x;
                    this.targetY = this.target.y;
                    this.moveTowardsTarget(gameState);
                    this.lastMoveTime = currentTime;
                }
            }
        } else {
            // No hay enemigos, cambiar a wandering
            this.behavior = BOT_BEHAVIORS.WANDERING;
        }
    }
    
    /**
     * Actualiza el comportamiento chatting (hablando)
     */
    updateChatting(deltaTime, gameState) {
        const currentTime = Date.now();
        
        if (currentTime - this.lastChatTime >= this.chatCooldown) {
            this.say(gameState);
            this.lastChatTime = currentTime;
            this.chatCooldown = 5000 + Math.random() * 10000;
        }
    }
    
    /**
     * Actualiza el comportamiento traveling (viajando entre mapas)
     */
    updateTraveling(deltaTime, gameState) {
        const currentTime = Date.now();
        
        // Buscar portal cercano
        const nearestPortal = this.findNearestPortal(gameState);
        
        if (nearestPortal) {
            const distance = this.getDistance(nearestPortal.x, nearestPortal.y);
            
            if (distance === 0) {
                // Usar el portal (esto se manejará en el sistema principal)
                this.behavior = BOT_BEHAVIORS.IDLE;
            } else {
                // Moverse hacia el portal
                if (currentTime - this.lastMoveTime >= this.movementSpeed) {
                    this.targetX = nearestPortal.x;
                    this.targetY = nearestPortal.y;
                    this.moveTowardsTarget(gameState);
                    this.lastMoveTime = currentTime;
                }
            }
        } else {
            // No hay portales, cambiar a wandering
            this.behavior = BOT_BEHAVIORS.WANDERING;
        }
    }
    
    /**
     * Actualiza el comportamiento seeking_resurrection (buscando sacerdote)
     */
    updateSeekingResurrection(deltaTime, gameState) {
        const currentTime = Date.now();
        
        // Buscar sacerdote más cercano
        const healer = this.findNearestHealer(gameState);
        
        if (!healer) {
            console.log(`👻 ${this.name} no encuentra sacerdote para resucitar`);
            return;
        }
        
        const distance = this.getDistance(healer.x, healer.y);
        
        // Si está al lado del sacerdote, resucitar
        if (distance <= 1) {
            this.resurrectWithHealer(healer);
        } else {
            // Moverse hacia el sacerdote
            if (currentTime - this.lastMoveTime >= this.movementSpeed) {
                this.targetX = healer.x;
                this.targetY = healer.y;
                this.moveTowardsTarget(gameState);
                this.lastMoveTime = currentTime;
            }
        }
    }
    
    /**
     * Encuentra el sacerdote (healer) más cercano
     * @param {object} gameState - Estado del juego
     * @returns {object|null} NPC sacerdote más cercano
     */
    findNearestHealer(gameState) {
        if (!gameState.npcs || gameState.npcs.length === 0) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        for (const npc of gameState.npcs) {
            // Verificar que sea un healer y esté en el mismo mapa
            if (npc.type === 'healer' && npc.services && npc.services.canResurrect) {
                if (!npc.currentMap || npc.currentMap === this.currentMap) {
                    const distance = this.getDistance(npc.x, npc.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearest = npc;
                    }
                }
            }
        }
        
        return nearest;
    }
    
    /**
     * Resucita al bot mediante un sacerdote
     * @param {object} healer - NPC sacerdote
     */
    resurrectWithHealer(healer) {
        console.log(`⛪ ${this.name} resucita con ${healer.name}`);
        
        // Resucitar
        this.isGhost = false;
        this.hp = this.maxHp;
        
        // Limpiar estado de combate previo
        this.attackedByGuard = false;
        this.hostile = false;
        
        // Volver a comportamiento normal
        this.behavior = BOT_BEHAVIORS.IDLE;
        this.behaviorTimer = 0;
        this.behaviorDuration = this.getRandomBehaviorDuration();
        
        // NO regenerar inventario - perdió todo al morir permanentemente
        // this.inventory permanece vacío []
        console.log(`💀 ${this.name} resucita sin items (perdió todo al morir)`);
        
        // Mensaje de chat
        if (typeof window !== 'undefined' && window.addChatMessage) {
            window.addChatMessage('system', `⛪ ${this.name} ha resucitado sin items (perdió todo al morir)`);
        }
    }
    
    /**
     * Selecciona un objetivo aleatorio caminable
     */
    selectRandomTarget(gameState) {
        const attempts = 20;
        
        for (let i = 0; i < attempts; i++) {
            const tx = this.x + Math.floor(Math.random() * 10) - 5;
            const ty = this.y + Math.floor(Math.random() * 10) - 5;
            
            if (this.isWalkable(tx, ty, gameState)) {
                this.targetX = tx;
                this.targetY = ty;
                return;
            }
        }
    }
    
    /**
     * Mueve el bot hacia su objetivo
     */
    moveTowardsTarget(gameState) {
        if (this.targetX === null || this.targetY === null) return;
        
        const dx = Math.sign(this.targetX - this.x);
        const dy = Math.sign(this.targetY - this.y);
        
        let moved = false;
        
        // Intentar mover en X
        if (dx !== 0) {
            const newX = this.x + dx;
            if (this.isWalkable(newX, this.y, gameState)) {
                this.x = newX;
                this.facing = dx > 0 ? 'right' : 'left';
                moved = true;
            }
        }
        
        // Si no se movió en X, intentar en Y
        if (!moved && dy !== 0) {
            const newY = this.y + dy;
            if (this.isWalkable(this.x, newY, gameState)) {
                this.y = newY;
                this.facing = dy > 0 ? 'down' : 'up';
                moved = true;
            }
        }
        
        if (moved) {
            this.moving = true;
            this.animation.state = 'walking';
        } else {
            // Bloqueado, elegir nuevo objetivo
            this.targetX = null;
            this.targetY = null;
        }
        
        // Si llegamos al objetivo
        if (this.x === this.targetX && this.y === this.targetY) {
            this.targetX = null;
            this.targetY = null;
            this.moving = false;
            this.animation.state = 'idle';
        }
    }
    
    /**
     * Verifica si una posición es caminable
     */
    isWalkable(x, y, gameState) {
        // Límites del mapa
        if (x < 0 || x >= CONFIG.MAP_WIDTH || y < 0 || y >= CONFIG.MAP_HEIGHT) {
            return false;
        }
        
        // Verificar tile base
        const tile = gameState.map[y]?.[x];
        if (tile !== 0 && tile !== 6 && tile !== 8) { // GRASS, FLOOR, PATH
            return false;
        }
        
        // Verificar colisión con jugador
        if (x === gameState.player.x && y === gameState.player.y) {
            return false;
        }
        
        // Verificar colisión con otros bots
        if (gameState.bots) {
            for (const bot of gameState.bots) {
                if (bot.id !== this.id && bot.x === x && bot.y === y && bot.currentMap === this.currentMap) {
                    return false;
                }
            }
        }
        
        // Verificar colisión con NPCs
        if (gameState.npcs) {
            for (const npc of gameState.npcs) {
                if (npc.x === x && npc.y === y) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Encuentra el enemigo más cercano
     */
    findNearestEnemy(gameState) {
        if (!gameState.enemies || gameState.enemies.length === 0) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        for (const enemy of gameState.enemies) {
            if (enemy.hp > 0) {
                const distance = this.getDistance(enemy.x, enemy.y);
                if (distance < minDistance && distance <= 10) { // Rango de detección
                    minDistance = distance;
                    nearest = enemy;
                }
            }
        }
        
        return nearest;
    }
    
    /**
     * Encuentra el portal más cercano
     */
    findNearestPortal(gameState) {
        if (!gameState.objects) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        for (const obj of gameState.objects) {
            if (obj.type === 'PORTAL' || obj.type === 'portal') {
                const distance = this.getDistance(obj.x, obj.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = obj;
                }
            }
        }
        
        return nearest;
    }
    
    /**
     * Calcula la distancia Manhattan a un punto
     */
    getDistance(x, y) {
        return Math.abs(this.x - x) + Math.abs(this.y - y);
    }
    
    /**
     * Ataca a un enemigo
     */
    attackEnemy(enemy, gameState) {
        const damage = 10 + Math.floor(Math.random() * this.level * 5);
        
        // Reducir HP del enemigo directamente (los enemigos no tienen método takeDamage)
        enemy.hp -= damage;
        
        // Verificar si el enemigo murió
        if (enemy.hp <= 0) {
            // Remover enemigo y dar recompensas al bot
            const goldDrop = Math.floor(Math.random() * (enemy.goldDrop.max - enemy.goldDrop.min + 1)) + enemy.goldDrop.min;
            
            // Remover enemigo del juego
            const enemyIndex = gameState.enemies.indexOf(enemy);
            if (enemyIndex !== -1) {
                gameState.enemies.splice(enemyIndex, 1);
            }
            
            // Añadir a lista de enemigos muertos para respawn
            gameState.deadEnemies.push({
                type: enemy.type,
                map: this.currentMap,
                deathTime: Date.now(),
                originalEnemy: enemy
            });
            
            // Limpiar objetivo
            this.target = null;
        }
        
        // Orientarse hacia el enemigo
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.facing = dx > 0 ? 'right' : 'left';
        } else {
            this.facing = dy > 0 ? 'down' : 'up';
        }
    }
    
    /**
     * Hace que el bot diga algo en el chat
     */
    say(gameState) {
        const message = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
        
        // Agregar mensaje al chat del juego (si existe addChatMessage)
        if (typeof window !== 'undefined' && window.addChatMessage) {
            window.addChatMessage('bot', `${this.name}: ${message}`);
        }
        
        // Mostrar animación de hablar
        this.animation.state = 'talking';
        setTimeout(() => {
            if (this.animation.state === 'talking') {
                this.animation.state = 'idle';
            }
        }, 2000);
    }
    
    /**
     * Actualiza la animación del bot
     */
    updateAnimation(deltaTime) {
        this.animation.frameTime += deltaTime;
        
        if (this.animation.frameTime >= this.animation.frameDelay) {
            this.animation.frame = (this.animation.frame + 1) % 4; // 4 frames por animación
            this.animation.frameTime = 0;
        }
    }
    
    /**
     * Cambia el bot a otro mapa
     */
    changeMap(newMap, x, y) {
        this.currentMap = newMap;
        this.x = x;
        this.y = y;
        this.targetX = null;
        this.targetY = null;
        this.target = null;
        this.behavior = BOT_BEHAVIORS.IDLE;
    }
}
