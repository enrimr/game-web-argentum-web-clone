/**
 * Skills.js
 * Sistema de habilidades y profesiones
 * Inspirado en el sistema de skills de Argentum Online
 */

import { getSkillModifier } from './Classes.js';
import { addExp } from './Experience.js';

// Definición de habilidades (como en AO)
export const SKILLS = {
    // Habilidades de combate
    COMBAT: {
        id: 1,
        name: 'Combate con Armas',
        description: 'Mejora tu efectividad en combate cuerpo a cuerpo',
        type: 'combat',
        maxLevel: 100,
        icon: '⚔️'
    },
    DEFENSE: {
        id: 2,
        name: 'Defensa con Escudos',
        description: 'Aumenta tu capacidad de bloquear ataques',
        type: 'combat',
        maxLevel: 100,
        icon: '🛡️'
    },
    RANGED: {
        id: 3,
        name: 'Combate a Distancia',
        description: 'Mejora tu puntería con arcos y proyectiles',
        type: 'combat',
        maxLevel: 100,
        icon: '🏹'
    },
    WRESTLING: {
        id: 4,
        name: 'Combate Cuerpo a Cuerpo',
        description: 'Lucha sin armas con mayor efectividad',
        type: 'combat',
        maxLevel: 100,
        icon: '👊'
    },
    TACTICS: {
        id: 5,
        name: 'Evasión en Combate',
        description: 'Esquiva ataques enemigos',
        type: 'combat',
        maxLevel: 100,
        icon: '🤸'
    },
    
    // Habilidades mágicas
    MAGIC: {
        id: 6,
        name: 'Magia',
        description: 'Aumenta el poder de tus hechizos',
        type: 'magic',
        maxLevel: 100,
        icon: '✨'
    },
    MEDITATE: {
        id: 7,
        name: 'Meditar',
        description: 'Recupera maná más rápido',
        type: 'magic',
        maxLevel: 100,
        icon: '🧘'
    },
    
    // Habilidades de trabajo
    MINING: {
        id: 8,
        name: 'Minería',
        description: 'Extrae minerales de las minas',
        type: 'work',
        maxLevel: 100,
        icon: '⛏️',
        profession: 'minero'
    },
    WOODCUTTING: {
        id: 9,
        name: 'Talar',
        description: 'Corta árboles para obtener madera',
        type: 'work',
        maxLevel: 100,
        icon: '🪓',
        profession: 'leñador'
    },
    FISHING: {
        id: 10,
        name: 'Pesca',
        description: 'Pesca en ríos y lagos',
        type: 'work',
        maxLevel: 100,
        icon: '🎣',
        profession: 'pescador'
    },
    BLACKSMITHING: {
        id: 11,
        name: 'Herrería',
        description: 'Forja armas y armaduras',
        type: 'craft',
        maxLevel: 100,
        icon: '🔨',
        profession: 'herrero'
    },
    CARPENTRY: {
        id: 12,
        name: 'Carpintería',
        description: 'Crea arcos y flechas',
        type: 'craft',
        maxLevel: 100,
        icon: '🪚',
        profession: 'carpintero'
    },
    
    // Habilidades sociales
    TRADING: {
        id: 13,
        name: 'Comercio',
        description: 'Mejores precios al comprar y vender',
        type: 'social',
        maxLevel: 100,
        icon: '💰'
    },
    LEADERSHIP: {
        id: 14,
        name: 'Liderazgo',
        description: 'Comandar grupos de aventureros',
        type: 'social',
        maxLevel: 100,
        icon: '👑'
    },
    
    // Habilidades especiales
    STEALING: {
        id: 15,
        name: 'Robar',
        description: 'Roba items de otros personajes',
        type: 'rogue',
        maxLevel: 100,
        icon: '🦹'
    },
    HIDING: {
        id: 16,
        name: 'Ocultarse',
        description: 'Vuélvete invisible temporalmente',
        type: 'rogue',
        maxLevel: 100,
        icon: '🥷'
    },
    STABBING: {
        id: 17,
        name: 'Apuñalar',
        description: 'Ataque crítico desde las sombras',
        type: 'rogue',
        maxLevel: 100,
        icon: '🗡️'
    },
    TAMING: {
        id: 18,
        name: 'Domar Animales',
        description: 'Domestica criaturas salvajes',
        type: 'special',
        maxLevel: 100,
        icon: '🐺'
    },
    SURVIVAL: {
        id: 19,
        name: 'Supervivencia',
        description: 'Resistencia en ambientes hostiles',
        type: 'special',
        maxLevel: 100,
        icon: '🏕️'
    },
    NAVIGATION: {
        id: 20,
        name: 'Navegación',
        description: 'Maneja barcos y embarcaciones',
        type: 'special',
        maxLevel: 100,
        icon: '⛵'
    }
};

// Profesiones (trabajos) como en AO
export const PROFESSIONS = {
    MINER: {
        id: 'minero',
        name: 'Minero',
        description: 'Extrae minerales preciosos de las profundidades',
        mainSkill: 'MINING',
        icon: '⛏️',
        workInterval: 3000, // ms entre acciones
        resources: [
            { id: 'IRON_ORE', name: 'Mineral de Hierro', minLevel: 1, chance: 0.7 },
            { id: 'COAL', name: 'Carbón', minLevel: 5, chance: 0.6 },
            { id: 'SILVER_ORE', name: 'Mineral de Plata', minLevel: 20, chance: 0.4 },
            { id: 'GOLD_ORE', name: 'Mineral de Oro', minLevel: 40, chance: 0.2 },
            { id: 'DIAMOND', name: 'Diamante', minLevel: 70, chance: 0.05 }
        ]
    },
    
    LUMBERJACK: {
        id: 'leñador',
        name: 'Leñador',
        description: 'Tala árboles para obtener madera',
        mainSkill: 'WOODCUTTING',
        icon: '🪓',
        workInterval: 2500,
        resources: [
            { id: 'WOOD', name: 'Madera', minLevel: 1, chance: 0.8 },
            { id: 'OAK_WOOD', name: 'Madera de Roble', minLevel: 15, chance: 0.5 },
            { id: 'ELVEN_WOOD', name: 'Madera Élfica', minLevel: 50, chance: 0.2 }
        ]
    },
    
    FISHERMAN: {
        id: 'pescador',
        name: 'Pescador',
        description: 'Pesca en ríos, lagos y mares',
        mainSkill: 'FISHING',
        icon: '🎣',
        workInterval: 4000,
        resources: [
            { id: 'FISH', name: 'Pez', minLevel: 1, chance: 0.7 },
            { id: 'BIG_FISH', name: 'Pez Grande', minLevel: 20, chance: 0.3 },
            { id: 'RARE_FISH', name: 'Pez Raro', minLevel: 50, chance: 0.1 }
        ]
    },
    
    BLACKSMITH: {
        id: 'herrero',
        name: 'Herrero',
        description: 'Forja armas y armaduras poderosas',
        mainSkill: 'BLACKSMITHING',
        icon: '🔨',
        workInterval: 5000,
        craftingRecipes: [
            {
                result: 'SWORD',
                materials: [
                    { itemType: 'IRON_ORE', quantity: 5 },
                    { itemType: 'COAL', quantity: 2 }
                ],
                minLevel: 10,
                expGained: 50
            },
            {
                result: 'SWORD_IRON',
                materials: [
                    { itemType: 'IRON_ORE', quantity: 10 },
                    { itemType: 'COAL', quantity: 5 }
                ],
                minLevel: 25,
                expGained: 100
            },
            {
                result: 'SHIELD',
                materials: [
                    { itemType: 'IRON_ORE', quantity: 8 },
                    { itemType: 'WOOD', quantity: 5 }
                ],
                minLevel: 15,
                expGained: 60
            }
        ]
    },
    
    CARPENTER: {
        id: 'carpintero',
        name: 'Carpintero',
        description: 'Crea arcos, flechas y estructuras de madera',
        mainSkill: 'CARPENTRY',
        icon: '🪚',
        workInterval: 4000,
        craftingRecipes: [
            {
                result: 'ARROW',
                materials: [
                    { itemType: 'WOOD', quantity: 1 },
                    { itemType: 'FEATHER', quantity: 1 }
                ],
                minLevel: 5,
                quantity: 10,
                expGained: 20
            },
            {
                result: 'BOW',
                materials: [
                    { itemType: 'WOOD', quantity: 15 },
                    { itemType: 'STRING', quantity: 2 }
                ],
                minLevel: 20,
                expGained: 80
            },
            {
                result: 'BOW_ELVEN',
                materials: [
                    { itemType: 'ELVEN_WOOD', quantity: 20 },
                    { itemType: 'STRING', quantity: 3 }
                ],
                minLevel: 60,
                expGained: 200
            }
        ]
    }
};

/**
 * Calcula la experiencia necesaria para el siguiente nivel de skill
 * Fórmula similar a AO - progresión exponencial
 */
export function calculateSkillExpRequired(currentLevel) {
    // Formula exponencial: cada nivel requiere más exp
    return Math.floor(currentLevel * 50 * (1 + currentLevel / 100));
}

/**
 * Calcula la probabilidad de éxito basada en el nivel de skill
 * Usa la fórmula cuadrática de Argentum Online
 * @param {number} skillLevel - Nivel actual de la skill (1-100)
 * @returns {number} Probabilidad de éxito (menor número = más fácil)
 */
export function calculateSuccessChance(skillLevel) {
    // Formula cuadrática de AO: -0.00125*x^2 - 0.3*x + 49
    // Skill 1: ~48 (difícil, 1/48 = 2% chance)
    // Skill 50: ~19 (medio, 1/19 = 5% chance)
    // Skill 100: ~5 (fácil, 1/5 = 20% chance)
    return Math.floor(-0.00125 * skillLevel * skillLevel - 0.3 * skillLevel + 49);
}

/**
 * Gana experiencia en una skill y sube de nivel si corresponde
 * @param {Object} player - Objeto del jugador
 * @param {string} skillName - Nombre de la skill (ej: 'WOODCUTTING')
 * @param {boolean} success - Si la acción fue exitosa
 * @returns {boolean} True si subió de nivel
 */
export function gainSkillExperience(player, skillName, success) {
    // Obtener el modificador de clase
    const classModifier = getSkillModifier(player.class, skillName);
    
    // Exp ganada: 10 si éxito, 5 si fallo
    // El modificador de clase afecta la exp ganada (más difícil = menos exp efectiva)
    const baseExp = success ? 10 : 5;
    const expGained = Math.max(1, Math.floor(baseExp / classModifier));
    
    // Añadir experiencia
    player.skillExp[skillName] = (player.skillExp[skillName] || 0) + expGained;
    
    // Calcular exp necesaria para siguiente nivel (multiplicada por modificador de clase)
    const currentLevel = player.skills[skillName] || 1;
    const baseExpNeeded = calculateSkillExpRequired(currentLevel);
    const expNeeded = Math.floor(baseExpNeeded * classModifier);
    
    // ¿Subió de nivel?
    if (player.skillExp[skillName] >= expNeeded) {
        // Subir nivel de skill
        player.skills[skillName] = Math.min(100, currentLevel + 1);
        player.skillExp[skillName] = 0; // Resetear experiencia de skill
        
        // Ganar experiencia de personaje (como en Argentum Online)
        const EXP_POR_SKILL = 50;
        addExp(EXP_POR_SKILL);
        
        return true; // Indicar que subió de nivel de skill
    }
    
    return false; // No subió de nivel
}

/**
 * Calcula el multiplicador de éxito basado en el nivel de skill
 */
export function getSkillSuccessRate(skillLevel, taskDifficulty) {
    const baseRate = 0.5;
    const levelBonus = (skillLevel / 100) * 0.4;
    const difficultyPenalty = (taskDifficulty / 100) * 0.3;
    
    return Math.min(0.95, Math.max(0.05, baseRate + levelBonus - difficultyPenalty));
}

/**
 * Obtiene la experiencia ganada por realizar una acción
 */
export function calculateSkillExpGain(skillLevel, taskDifficulty, success) {
    const baseExp = 10;
    const difficultyMultiplier = 1 + (taskDifficulty / 100);
    const successMultiplier = success ? 1 : 0.5;
    
    return Math.floor(baseExp * difficultyMultiplier * successMultiplier);
}
