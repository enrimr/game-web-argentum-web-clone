// Item types (inspirado en Argentum Online)
export const ITEM_TYPES = {
    // Hechizos (libros y pergaminos)
    SPELLBOOK_MAGIC_ARROW: { 
        name: 'Libro: Flecha Mágica', 
        icon: '📖', 
        stackable: false, 
        maxStack: 1, 
        sprite: 'spellBook',
        type: 'spell',
        spellKey: 'MAGIC_ARROW',
        description: 'Te enseña el hechizo "Flecha Mágica"'
    },
    SPELLBOOK_FIREBALL: { 
        name: 'Libro: Bola de Fuego', 
        icon: '📕', 
        stackable: false, 
        maxStack: 1, 
        sprite: 'spellBook',
        type: 'spell',
        spellKey: 'FIREBALL',
        description: 'Te enseña el hechizo "Bola de Fuego"'
    },
    SPELLBOOK_HEAL_WOUNDS: { 
        name: 'Libro: Curar Heridas', 
        icon: '📗', 
        stackable: false, 
        maxStack: 1, 
        sprite: 'spellBook',
        type: 'spell',
        spellKey: 'HEAL_WOUNDS',
        description: 'Te enseña el hechizo "Curar Heridas"'
    },
    SPELLBOOK_PARALYZE: { 
        name: 'Libro: Paralizar', 
        icon: '📘', 
        stackable: false, 
        maxStack: 1, 
        sprite: 'spellBook',
        type: 'spell',
        spellKey: 'PARALYZE',
        description: 'Te enseña el hechizo "Paralizar"'
    },
    SPELLBOOK_STRENGTHEN: { 
        name: 'Libro: Fuerza', 
        icon: '📙', 
        stackable: false, 
        maxStack: 1, 
        sprite: 'spellBook',
        type: 'spell',
        spellKey: 'STRENGTHEN',
        description: 'Te enseña el hechizo "Fuerza"'
    },
    SCROLL_LIGHTNING: { 
        name: 'Pergamino: Relámpago', 
        icon: '📜', 
        stackable: true, 
        maxStack: 10, 
        sprite: 'scroll',
        type: 'consumable',
        effect: 'cast_spell',
        spellKey: 'LIGHTNING',
        description: 'Lanza el hechizo "Relámpago" una vez'
    },
    SCROLL_POISON: { 
        name: 'Pergamino: Envenenar', 
        icon: '🧾', 
        stackable: true, 
        maxStack: 10, 
        sprite: 'scroll',
        type: 'consumable',
        effect: 'cast_spell',
        spellKey: 'POISON',
        description: 'Lanza el hechizo "Envenenar" una vez'
    },
    // Pociones consumibles
    POTION_RED: { 
        name: 'Poción Roja', 
        icon: '🧪', 
        stackable: true, 
        maxStack: 100, 
        sprite: 'potion',
        type: 'consumable',
        effect: 'heal_hp',
        value: 50,
        description: 'Restaura 50 HP'
    },
    POTION_BLUE: { 
        name: 'Poción Azul', 
        icon: '💧', 
        stackable: true, 
        maxStack: 100, 
        sprite: 'potionBlue',
        type: 'consumable',
        effect: 'heal_mana',
        value: 30,
        description: 'Restaura 30 Mana'
    },
    POTION_GREEN: { 
        name: 'Poción Verde', 
        icon: '🍀', 
        stackable: true, 
        maxStack: 100, 
        sprite: 'potionGreen',
        type: 'consumable',
        effect: 'cure_poison',
        value: 1,
        description: 'Cura el veneno'
    },
    
    // Munición
    ARROW: { 
        name: 'Flecha', 
        icon: '🏹', 
        stackable: true, 
        maxStack: 500, 
        sprite: 'arrow',
        type: 'ammunition',
        description: 'Munición para arcos'
    },
    
    // Armas (aumentan daño)
    SWORD: {
        name: 'Espada',
        icon: '⚔️',
        stackable: false,
        maxStack: 1,
        sprite: 'sword',
        type: 'weapon',
        slot: 'weapon',
        damage: 15,
        description: '+15 daño de ataque'
    },
    SWORD_IRON: {
        name: 'Espada de Hierro',
        icon: '🗡️',
        stackable: false,
        maxStack: 1,
        sprite: 'sword',
        type: 'weapon',
        slot: 'weapon',
        damage: 25,
        description: '+25 daño de ataque'
    },

    // Arcos (arma a distancia)
    BOW: {
        name: 'Arco',
        icon: '🏹',
        stackable: false,
        maxStack: 1,
        sprite: 'bow',
        type: 'weapon',
        slot: 'weapon',
        ranged: true,
        range: 8,
        damage: 12,
        description: 'Arco (+12 daño, rango 8)'
    },
    BOW_ELVEN: {
        name: 'Arco Élfico',
        icon: '🏹',
        stackable: false,
        maxStack: 1,
        sprite: 'bow',
        type: 'weapon',
        slot: 'weapon',
        ranged: true,
        range: 10,
        damage: 18,
        description: 'Arco Élfico (+18 daño, rango 10)'
    },
    
    // Escudos (aumentan defensa)
    SHIELD: { 
        name: 'Escudo', 
        icon: '🛡️', 
        stackable: false, 
        maxStack: 1, 
        sprite: 'shield',
        type: 'armor',
        slot: 'shield',
        defense: 10,
        description: '+10 defensa'
    },
    SHIELD_IRON: { 
        name: 'Escudo de Hierro', 
        icon: '🔰', 
        stackable: false, 
        maxStack: 1, 
        sprite: 'shield',
        type: 'armor',
        slot: 'shield',
        defense: 20,
        description: '+20 defensa'
    }
};
