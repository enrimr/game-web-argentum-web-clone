/**
 * SpellTypes.js
 * Sistema de hechizos y magias
 * Basado en el sistema de hechizos de Argentum Online
 */

// Tipos de hechizos
export const SPELL_TYPES = {
    DAMAGE: 'damage',         // Daño directo (ej: rayo)
    HEAL: 'heal',             // Curación (ej: curar heridas)
    BUFF: 'buff',             // Mejora temporal (ej: fuerza)
    DEBUFF: 'debuff',         // Desventaja al objetivo (ej: paralizar)
    SUMMON: 'summon',         // Invocar criaturas
    AREA_EFFECT: 'area',      // Efectos en área
    TELEPORT: 'teleport',     // Teletransporte
    TRANSFORM: 'transform'    // Transformación
};

// Objetivos válidos para hechizos
export const SPELL_TARGETS = {
    SELF: 'self',             // Solo el jugador puede ser objetivo
    FRIENDLY: 'friendly',     // Jugador o aliados
    ENEMY: 'enemy',           // Solo enemigos
    ANY: 'any',               // Cualquier personaje
    TERRAIN: 'terrain'        // Posición en el terreno
};

// Hechizos disponibles en el juego
export const SPELLS = {
    // Hechizos ofensivos
    MAGIC_ARROW: {
        id: 1,
        name: 'Flecha Mágica',
        icon: '🔮',
        sprite: 'magicArrow',
        type: SPELL_TYPES.DAMAGE,
        target: SPELL_TARGETS.ENEMY,
        manaRequired: 10,
        minSkillRequired: 5,
        range: 5,
        damage: {
            min: 8,
            max: 15
        },
        cooldown: 2000, // ms
        words: 'FUEG FLAM',
        description: 'Lanza un proyectil mágico que causa daño a un enemigo.',
        casterMessage: 'Has lanzado Flecha Mágica a',
        targetMessage: 'te ha lanzado Flecha Mágica causando',
        effects: {
            visual: 'magic_arrow_effect',
            sound: 'magic_arrow_sound'
        }
    },

    FIREBALL: {
        id: 2,
        name: 'Bola de Fuego',
        icon: '🔥',
        sprite: 'fireball',
        type: SPELL_TYPES.DAMAGE,
        target: SPELL_TARGETS.ENEMY,
        manaRequired: 20,
        minSkillRequired: 15,
        range: 4,
        damage: {
            min: 15,
            max: 25
        },
        cooldown: 3000, // ms
        words: 'EN FLAMUS',
        description: 'Lanza una bola de fuego que causa un daño moderado a un enemigo.',
        casterMessage: 'Has lanzado Bola de Fuego a',
        targetMessage: 'te ha lanzado Bola de Fuego causando',
        effects: {
            visual: 'fireball_effect',
            sound: 'fireball_sound'
        }
    },

    LIGHTNING: {
        id: 3,
        name: 'Relámpago',
        icon: '⚡',
        sprite: 'lightning',
        type: SPELL_TYPES.DAMAGE,
        target: SPELL_TARGETS.ENEMY,
        manaRequired: 35,
        minSkillRequired: 25,
        range: 6,
        damage: {
            min: 25,
            max: 40
        },
        cooldown: 4000, // ms
        words: 'RELAMP XEN',
        description: 'Invoca un relámpago que causa un gran daño a un enemigo.',
        casterMessage: 'Has invocado un Relámpago sobre',
        targetMessage: 'te ha impactado con un Relámpago causando',
        effects: {
            visual: 'lightning_effect',
            sound: 'lightning_sound'
        }
    },

    // Hechizos curativos
    HEAL_WOUNDS: {
        id: 4,
        name: 'Curar Heridas',
        icon: '💚',
        sprite: 'healWounds',
        type: SPELL_TYPES.HEAL,
        target: SPELL_TARGETS.FRIENDLY,
        manaRequired: 15,
        minSkillRequired: 10,
        healing: {
            min: 15,
            max: 25
        },
        cooldown: 3000, // ms
        words: 'SANCTIS',
        description: 'Cura las heridas del objetivo.',
        casterMessage: 'Has curado a',
        targetMessage: 'te ha curado',
        selfMessage: 'Te has curado',
        effects: {
            visual: 'heal_effect',
            sound: 'heal_sound'
        }
    },

    // Hechizos de estado
    PARALYZE: {
        id: 5,
        name: 'Paralizar',
        icon: '🧊',
        sprite: 'paralyze',
        type: SPELL_TYPES.DEBUFF,
        target: SPELL_TARGETS.ENEMY,
        manaRequired: 25,
        minSkillRequired: 20,
        duration: 5000, // ms
        cooldown: 10000, // ms
        words: 'PARALIX',
        description: 'Paraliza al objetivo temporalmente.',
        casterMessage: 'Has paralizado a',
        targetMessage: 'te ha paralizado',
        effects: {
            visual: 'paralyze_effect',
            sound: 'paralyze_sound'
        }
    },

    POISON: {
        id: 6,
        name: 'Envenenar',
        icon: '☠️',
        sprite: 'poison',
        type: SPELL_TYPES.DEBUFF,
        target: SPELL_TARGETS.ENEMY,
        manaRequired: 22,
        minSkillRequired: 18,
        damage: {
            min: 3,
            max: 5,
            ticks: 5,
            interval: 2000 // ms between ticks
        },
        cooldown: 8000, // ms
        words: 'TOXIS VEN',
        description: 'Envenena al objetivo, causando daño gradualmente.',
        casterMessage: 'Has envenenado a',
        targetMessage: 'te ha envenenado',
        effects: {
            visual: 'poison_effect',
            sound: 'poison_sound'
        }
    },

    // Hechizos de mejora
    STRENGTHEN: {
        id: 7,
        name: 'Fuerza',
        icon: '💪',
        sprite: 'strengthen',
        type: SPELL_TYPES.BUFF,
        target: SPELL_TARGETS.FRIENDLY,
        manaRequired: 18,
        minSkillRequired: 15,
        duration: 30000, // ms
        effect: {
            damageBuff: 5
        },
        cooldown: 15000, // ms
        words: 'FORTIS',
        description: 'Aumenta la fuerza del objetivo temporalmente.',
        casterMessage: 'Has aumentado la fuerza de',
        targetMessage: 'te ha aumentado la fuerza',
        selfMessage: 'Has aumentado tu fuerza',
        effects: {
            visual: 'strengthen_effect',
            sound: 'strengthen_sound'
        }
    },

    // Hechizos de utilidad
    ANTIDOTE: {
        id: 8,
        name: 'Antídoto',
        icon: '💉',
        sprite: 'antidote',
        type: SPELL_TYPES.BUFF,
        target: SPELL_TARGETS.FRIENDLY,
        manaRequired: 12,
        minSkillRequired: 10,
        cooldown: 5000, // ms
        words: 'NIHIL VED',
        description: 'Cura el veneno del objetivo.',
        casterMessage: 'Has curado el veneno de',
        targetMessage: 'te ha curado el veneno',
        selfMessage: 'Te has curado el veneno',
        effects: {
            visual: 'antidote_effect',
            sound: 'antidote_sound'
        }
    }
};

/**
 * Obtiene todos los hechizos disponibles como un array
 * @returns {Array} Array de objetos de hechizos
 */
export function getAllSpells() {
    return Object.values(SPELLS);
}

/**
 * Obtiene un hechizo por su ID
 * @param {number} id - ID del hechizo
 * @returns {Object|null} Objeto del hechizo o null si no existe
 */
export function getSpellById(id) {
    return Object.values(SPELLS).find(spell => spell.id === id) || null;
}
