/**
 * Classes.js
 * Sistema de clases de personajes
 * Basado en Argentum Online y RPGs clásicos
 */

/**
 * Definición de clases de personajes
 */
export const CHARACTER_CLASSES = {
    WARRIOR: {
        id: 'warrior',
        name: 'Guerrero',
        description: 'Experto en combate cuerpo a cuerpo con armas y armaduras pesadas',
        icon: '⚔️',
        color: '#dc2626',
        stats: {
            hpMultiplier: 1.3,      // 30% más HP que la media
            manaMultiplier: 0.5,    // 50% menos mana
            strengthBonus: 3,
            dexterityBonus: 1,
            constitutionBonus: 3,
            intelligenceBonus: 0,
            charismaBonus: 0
        },
        skillModifiers: {
            COMBAT: 1.0,            // Sin modificador (experto)
            DEFENSE: 1.0,           // Sin modificador
            RANGED: 1.5,            // 50% más difícil
            WRESTLING: 1.2,
            TACTICS: 1.0,
            MAGIC: 3.0,             // Muy difícil aprender magia
            MEDITATE: 3.0,
            MINING: 2.0,
            WOODCUTTING: 2.0,
            FISHING: 2.0,
            BLACKSMITHING: 1.5,
            CARPENTRY: 2.0,
            TRADING: 1.5,
            LEADERSHIP: 1.2,
            STEALING: 3.0,
            HIDING: 3.0,
            STABBING: 2.0,
            TAMING: 2.0,
            SURVIVAL: 1.5,
            NAVIGATION: 1.8
        },
        startingItems: ['SWORD', 'SHIELD', 'POTION_RED'],
        canUseHeavyArmor: true,
        canUseMagic: false
    },

    MAGE: {
        id: 'mage',
        name: 'Mago',
        description: 'Maestro de las artes arcanas, devastador con hechizos',
        icon: '🔮',
        color: '#3b82f6',
        stats: {
            hpMultiplier: 0.7,      // 30% menos HP
            manaMultiplier: 2.0,    // Doble de mana
            strengthBonus: 0,
            dexterityBonus: 0,
            constitutionBonus: 0,
            intelligenceBonus: 4,
            charismaBonus: 1
        },
        skillModifiers: {
            COMBAT: 2.5,
            DEFENSE: 2.0,
            RANGED: 2.0,
            WRESTLING: 2.5,
            TACTICS: 1.5,
            MAGIC: 1.0,             // Experto en magia
            MEDITATE: 1.0,          // Experto en meditar
            MINING: 2.5,
            WOODCUTTING: 2.5,
            FISHING: 2.0,
            BLACKSMITHING: 3.0,
            CARPENTRY: 3.0,
            TRADING: 1.3,
            LEADERSHIP: 1.5,
            STEALING: 3.0,
            HIDING: 2.0,
            STABBING: 3.0,
            TAMING: 2.0,
            SURVIVAL: 2.0,
            NAVIGATION: 2.5
        },
        startingItems: ['STAFF', 'POTION_BLUE', 'POTION_RED'],
        canUseHeavyArmor: false,
        canUseMagic: true,
        requiredStaffForMagic: true
    },

    CLERIC: {
        id: 'cleric',
        name: 'Clérigo',
        description: 'Sanador sagrado, protector de los justos',
        icon: '✝️',
        color: '#fbbf24',
        stats: {
            hpMultiplier: 1.0,
            manaMultiplier: 1.2,
            strengthBonus: 1,
            dexterityBonus: 0,
            constitutionBonus: 2,
            intelligenceBonus: 2,
            charismaBonus: 2
        },
        skillModifiers: {
            COMBAT: 1.5,
            DEFENSE: 1.2,
            RANGED: 2.0,
            WRESTLING: 1.8,
            TACTICS: 1.3,
            MAGIC: 1.2,
            MEDITATE: 1.2,
            MINING: 2.0,
            WOODCUTTING: 2.0,
            FISHING: 1.8,
            BLACKSMITHING: 2.5,
            CARPENTRY: 2.5,
            TRADING: 1.5,
            LEADERSHIP: 1.0,
            STEALING: 4.0,          // Imposible para clérigos
            HIDING: 3.0,
            STABBING: 3.0,
            TAMING: 1.5,
            SURVIVAL: 1.5,
            NAVIGATION: 2.0
        },
        startingItems: ['MACE', 'POTION_BLUE', 'POTION_RED'],
        canUseHeavyArmor: false,
        canUseMagic: true,
        healingBonus: 1.3
    },

    PALADIN: {
        id: 'paladin',
        name: 'Paladín',
        description: 'Guerrero sagrado, combinación de fuerza y magia divina',
        icon: '🛡️',
        color: '#facc15',
        stats: {
            hpMultiplier: 1.2,
            manaMultiplier: 0.8,
            strengthBonus: 2,
            dexterityBonus: 1,
            constitutionBonus: 2,
            intelligenceBonus: 1,
            charismaBonus: 2
        },
        skillModifiers: {
            COMBAT: 1.1,
            DEFENSE: 1.0,
            RANGED: 1.8,
            WRESTLING: 1.5,
            TACTICS: 1.2,
            MAGIC: 1.5,
            MEDITATE: 1.5,
            MINING: 2.0,
            WOODCUTTING: 2.0,
            FISHING: 2.0,
            BLACKSMITHING: 1.8,
            CARPENTRY: 2.0,
            TRADING: 1.3,
            LEADERSHIP: 1.0,
            STEALING: 4.0,
            HIDING: 3.0,
            STABBING: 2.5,
            TAMING: 1.8,
            SURVIVAL: 1.5,
            NAVIGATION: 1.5
        },
        startingItems: ['SWORD', 'SHIELD', 'POTION_RED', 'POTION_BLUE'],
        canUseHeavyArmor: true,
        canUseMagic: true,
        holyWarrior: true
    },

    ASSASSIN: {
        id: 'assassin',
        name: 'Asesino',
        description: 'Maestro del sigilo y el asesinato, letal desde las sombras',
        icon: '🗡️',
        color: '#6b7280',
        stats: {
            hpMultiplier: 0.9,
            manaMultiplier: 0.7,
            strengthBonus: 2,
            dexterityBonus: 3,
            constitutionBonus: 1,
            intelligenceBonus: 0,
            charismaBonus: 0
        },
        skillModifiers: {
            COMBAT: 1.2,
            DEFENSE: 1.5,
            RANGED: 1.3,
            WRESTLING: 1.3,
            TACTICS: 1.0,
            MAGIC: 2.5,
            MEDITATE: 2.5,
            MINING: 2.5,
            WOODCUTTING: 2.5,
            FISHING: 2.0,
            BLACKSMITHING: 2.5,
            CARPENTRY: 2.5,
            TRADING: 1.8,
            LEADERSHIP: 2.0,
            STEALING: 1.5,
            HIDING: 1.0,            // Experto en ocultarse
            STABBING: 1.0,          // Experto en apuñalar
            TAMING: 2.5,
            SURVIVAL: 1.3,
            NAVIGATION: 2.0
        },
        startingItems: ['DAGGER', 'BOW', 'ARROW'],
        canUseHeavyArmor: false,
        canUseMagic: false,
        stealthBonus: 1.5,
        criticalBonus: 1.4
    },

    THIEF: {
        id: 'thief',
        name: 'Ladrón',
        description: 'Experto en robo, evasión y combate furtivo',
        icon: '🦹',
        color: '#8b5cf6',
        stats: {
            hpMultiplier: 0.85,
            manaMultiplier: 0.6,
            strengthBonus: 1,
            dexterityBonus: 4,
            constitutionBonus: 0,
            intelligenceBonus: 1,
            charismaBonus: 0
        },
        skillModifiers: {
            COMBAT: 1.5,
            DEFENSE: 1.8,
            RANGED: 1.4,
            WRESTLING: 1.4,
            TACTICS: 1.1,
            MAGIC: 3.0,
            MEDITATE: 3.0,
            MINING: 2.5,
            WOODCUTTING: 2.5,
            FISHING: 2.0,
            BLACKSMITHING: 3.0,
            CARPENTRY: 2.5,
            TRADING: 1.2,
            LEADERSHIP: 2.0,
            STEALING: 1.0,          // Experto en robar
            HIDING: 1.2,
            STABBING: 1.3,
            TAMING: 2.5,
            SURVIVAL: 1.5,
            NAVIGATION: 2.0
        },
        startingItems: ['DAGGER', 'LOCKPICK', 'POTION_RED'],
        canUseHeavyArmor: false,
        canUseMagic: false,
        stealBonus: 1.5
    },

    BANDIT: {
        id: 'bandit',
        name: 'Bandido',
        description: 'Guerrero pícaro, combina fuerza bruta con astucia',
        icon: '🏴‍☠️',
        color: '#ea580c',
        stats: {
            hpMultiplier: 1.1,
            manaMultiplier: 0.6,
            strengthBonus: 2,
            dexterityBonus: 2,
            constitutionBonus: 2,
            intelligenceBonus: 0,
            charismaBonus: 0
        },
        skillModifiers: {
            COMBAT: 1.2,
            DEFENSE: 1.3,
            RANGED: 1.3,
            WRESTLING: 1.1,
            TACTICS: 1.1,
            MAGIC: 2.5,
            MEDITATE: 2.5,
            MINING: 2.0,
            WOODCUTTING: 2.0,
            FISHING: 2.0,
            BLACKSMITHING: 2.0,
            CARPENTRY: 2.0,
            TRADING: 1.5,
            LEADERSHIP: 1.8,
            STEALING: 1.3,
            HIDING: 1.5,
            STABBING: 1.5,
            TAMING: 2.5,
            SURVIVAL: 1.2,
            NAVIGATION: 1.5
        },
        startingItems: ['SWORD', 'BOW', 'ARROW'],
        canUseHeavyArmor: true,
        canUseMagic: false,
        criticalBonus: 1.2,
        hiddenBonus: 0.5 // Se oculta por la mitad del tiempo
    },

    HUNTER: {
        id: 'hunter',
        name: 'Cazador',
        description: 'Experto en combate a distancia y supervivencia en la naturaleza',
        icon: '🏹',
        color: '#16a34a',
        stats: {
            hpMultiplier: 1.0,
            manaMultiplier: 0.6,
            strengthBonus: 2,
            dexterityBonus: 3,
            constitutionBonus: 1,
            intelligenceBonus: 0,
            charismaBonus: 1
        },
        skillModifiers: {
            COMBAT: 1.3,
            DEFENSE: 1.4,
            RANGED: 1.0,            // Experto en arco
            WRESTLING: 1.5,
            TACTICS: 1.2,
            MAGIC: 3.0,
            MEDITATE: 3.0,
            MINING: 2.0,
            WOODCUTTING: 1.5,
            FISHING: 1.3,
            BLACKSMITHING: 2.5,
            CARPENTRY: 1.5,
            TRADING: 1.5,
            LEADERSHIP: 1.8,
            STEALING: 2.5,
            HIDING: 1.3,
            STABBING: 2.0,
            TAMING: 1.2,            // Bonificación en domar
            SURVIVAL: 1.0,          // Experto en supervivencia
            NAVIGATION: 1.5
        },
        startingItems: ['BOW', 'ARROW', 'DAGGER'],
        canUseHeavyArmor: false,
        canUseMagic: false,
        rangedBonus: 1.3,
        tamingBonus: 1.2
    },

    DRUID: {
        id: 'druid',
        name: 'Druida',
        description: 'Guardián de la naturaleza, magia natural y transformación',
        icon: '🌿',
        color: '#059669',
        stats: {
            hpMultiplier: 0.9,
            manaMultiplier: 1.5,
            strengthBonus: 1,
            dexterityBonus: 1,
            constitutionBonus: 1,
            intelligenceBonus: 3,
            charismaBonus: 2
        },
        skillModifiers: {
            COMBAT: 2.0,
            DEFENSE: 1.8,
            RANGED: 1.8,
            WRESTLING: 2.0,
            TACTICS: 1.5,
            MAGIC: 1.2,
            MEDITATE: 1.2,
            MINING: 2.5,
            WOODCUTTING: 1.5,
            FISHING: 1.5,
            BLACKSMITHING: 3.0,
            CARPENTRY: 2.0,
            TRADING: 1.5,
            LEADERSHIP: 1.3,
            STEALING: 3.5,
            HIDING: 1.8,
            STABBING: 3.0,
            TAMING: 1.0,            // Experto en domar
            SURVIVAL: 1.0,          // Experto en supervivencia
            NAVIGATION: 2.0
        },
        startingItems: ['STAFF', 'POTION_BLUE', 'POTION_RED'],
        canUseHeavyArmor: false,
        canUseMagic: true,
        natureBonus: 1.5,
        tamingBonus: 1.3
    },

    BARD: {
        id: 'bard',
        name: 'Bardo',
        description: 'Artista versátil, usa música y magia para apoyar aliados',
        icon: '🎵',
        color: '#ec4899',
        stats: {
            hpMultiplier: 0.85,
            manaMultiplier: 1.0,
            strengthBonus: 1,
            dexterityBonus: 2,
            constitutionBonus: 1,
            intelligenceBonus: 1,
            charismaBonus: 4
        },
        skillModifiers: {
            COMBAT: 1.8,
            DEFENSE: 1.8,
            RANGED: 1.5,
            WRESTLING: 1.8,
            TACTICS: 1.4,
            MAGIC: 1.5,
            MEDITATE: 1.5,
            MINING: 2.5,
            WOODCUTTING: 2.0,
            FISHING: 1.8,
            BLACKSMITHING: 2.5,
            CARPENTRY: 2.0,
            TRADING: 1.0,           // Experto en comercio
            LEADERSHIP: 1.0,        // Experto en liderazgo
            STEALING: 2.0,
            HIDING: 1.8,
            STABBING: 2.5,
            TAMING: 1.5,
            SURVIVAL: 1.5,
            NAVIGATION: 1.5
        },
        startingItems: ['LUTE', 'DAGGER', 'POTION_BLUE'],
        canUseHeavyArmor: false,
        canUseMagic: true,
        charismaBonus: 1.5
    },

    WORKER: {
        id: 'worker',
        name: 'Trabajador',
        description: 'Maestro artesano, experto en oficios y recolección',
        icon: '🔨',
        color: '#a16207',
        stats: {
            hpMultiplier: 1.0,
            manaMultiplier: 0.5,
            strengthBonus: 2,
            dexterityBonus: 2,
            constitutionBonus: 2,
            intelligenceBonus: 1,
            charismaBonus: 1
        },
        skillModifiers: {
            COMBAT: 2.0,
            DEFENSE: 2.0,
            RANGED: 2.0,
            WRESTLING: 2.0,
            TACTICS: 1.8,
            MAGIC: 4.0,
            MEDITATE: 4.0,
            MINING: 1.0,            // Experto en minería
            WOODCUTTING: 1.0,       // Experto en talar
            FISHING: 1.0,           // Experto en pesca
            BLACKSMITHING: 1.0,     // Experto en herrería
            CARPENTRY: 1.0,         // Experto en carpintería
            TRADING: 1.2,
            LEADERSHIP: 1.8,
            STEALING: 3.0,
            HIDING: 2.5,
            STABBING: 3.0,
            TAMING: 1.8,
            SURVIVAL: 1.3,
            NAVIGATION: 1.2
        },
        startingItems: ['AXE', 'PICKAXE', 'HAMMER'],
        canUseHeavyArmor: false,
        canUseMagic: false,
        workBonus: 2.0,             // Extrae el doble de recursos
        craftingBonus: 1.5
    },

    PIRATE: {
        id: 'pirate',
        name: 'Pirata',
        description: 'Corsario de los mares, maestro de la navegación y el saqueo',
        icon: '🏴‍☠️',
        color: '#0891b2',
        stats: {
            hpMultiplier: 1.1,
            manaMultiplier: 0.6,
            strengthBonus: 2,
            dexterityBonus: 2,
            constitutionBonus: 2,
            intelligenceBonus: 0,
            charismaBonus: 1
        },
        skillModifiers: {
            COMBAT: 1.3,
            DEFENSE: 1.4,
            RANGED: 1.3,
            WRESTLING: 1.4,
            TACTICS: 1.2,
            MAGIC: 2.5,
            MEDITATE: 2.5,
            MINING: 2.0,
            WOODCUTTING: 1.8,
            FISHING: 1.2,
            BLACKSMITHING: 2.0,
            CARPENTRY: 1.5,
            TRADING: 1.3,
            LEADERSHIP: 1.5,
            STEALING: 1.5,
            HIDING: 1.5,
            STABBING: 1.8,
            TAMING: 2.0,
            SURVIVAL: 1.2,
            NAVIGATION: 1.0         // Experto en navegación
        },
        startingItems: ['CUTLASS', 'PISTOL', 'POTION_RED'],
        canUseHeavyArmor: false,
        canUseMagic: false,
        navalBonus: 1.5,
        canHideInWater: true
    }
};

/**
 * Obtiene el modificador de una skill para una clase específica
 * @param {string} className - ID de la clase
 * @param {string} skillName - Nombre de la skill
 * @returns {number} Modificador (1.0 = normal, >1.0 = más difícil, <1.0 = más fácil)
 */
export function getSkillModifier(className, skillName) {
    const classData = CHARACTER_CLASSES[className?.toUpperCase()];
    if (!classData) return 1.0;
    
    return classData.skillModifiers[skillName] || 1.0;
}

/**
 * Obtiene información de una clase
 * @param {string} className - ID de la clase
 * @returns {Object} Datos de la clase
 */
export function getClassData(className) {
    return CHARACTER_CLASSES[className?.toUpperCase()];
}

/**
 * Calcula HP máximo basado en clase y nivel
 * @param {string} className - ID de la clase
 * @param {number} level - Nivel del personaje
 * @param {number} constitution - Atributo de constitución
 * @returns {number} HP máximo
 */
export function calculateMaxHP(className, level, constitution) {
    const classData = CHARACTER_CLASSES[className?.toUpperCase()];
    const baseHP = 100 + (level * 5) + (constitution * 2);
    const multiplier = classData?.stats.hpMultiplier || 1.0;
    
    return Math.floor(baseHP * multiplier);
}

/**
 * Calcula Mana máximo basado en clase y nivel
 * @param {string} className - ID de la clase
 * @param {number} level - Nivel del personaje
 * @param {number} intelligence - Atributo de inteligencia
 * @returns {number} Mana máximo
 */
export function calculateMaxMana(className, level, intelligence) {
    const classData = CHARACTER_CLASSES[className?.toUpperCase()];
    const baseMana = 50 + (level * 2) + (intelligence * 3);
    const multiplier = classData?.stats.manaMultiplier || 1.0;
    
    return Math.floor(baseMana * multiplier);
}

/**
 * Lista de clases disponibles para selección
 */
export const AVAILABLE_CLASSES = [
    'WARRIOR',
    'MAGE',
    'CLERIC',
    'PALADIN',
    'ASSASSIN',
    'THIEF',
    'BANDIT',
    'HUNTER',
    'DRUID',
    'BARD',
    'WORKER',
    'PIRATE'
];
