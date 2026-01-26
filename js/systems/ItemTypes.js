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
    
    // Herramientas de recolección
    AXE: {
        name: 'Hacha',
        icon: '🪓',
        stackable: false,
        maxStack: 1,
        sprite: 'axe',
        type: 'tool',
        slot: 'weapon',
        damage: 8,
        description: 'Herramienta para talar árboles (+8 daño)'
    },
    AXE_IRON: {
        name: 'Hacha de Hierro',
        icon: '🪓',
        stackable: false,
        maxStack: 1,
        sprite: 'axe',
        type: 'tool',
        slot: 'weapon',
        damage: 12,
        description: 'Hacha mejorada para talar (+12 daño)'
    },
    PICKAXE: {
        name: 'Pico',
        icon: '⛏️',
        stackable: false,
        maxStack: 1,
        sprite: 'pickaxe',
        type: 'tool',
        slot: 'weapon',
        damage: 6,
        description: 'Herramienta para minar (+6 daño)'
    },
    PICKAXE_IRON: {
        name: 'Pico de Hierro',
        icon: '⛏️',
        stackable: false,
        maxStack: 1,
        sprite: 'pickaxe',
        type: 'tool',
        slot: 'weapon',
        damage: 10,
        description: 'Pico mejorado para minar (+10 daño)'
    },
    FISHING_ROD: {
        name: 'Caña de Pescar',
        icon: '🎣',
        stackable: false,
        maxStack: 1,
        sprite: 'fishingRod',
        type: 'tool',
        slot: 'weapon',
        damage: 2,
        description: 'Caña para pescar en ríos y lagos (+2 daño)'
    },
    FISHING_ROD_GOOD: {
        name: 'Caña de Pescar Buena',
        icon: '🎣',
        stackable: false,
        maxStack: 1,
        sprite: 'fishingRod',
        type: 'tool',
        slot: 'weapon',
        damage: 4,
        description: 'Caña mejorada para pescar (+4 daño)'
    },
    
    // Recursos recolectables
    WOOD: {
        name: 'Madera',
        icon: '🪵',
        stackable: true,
        maxStack: 100,
        sprite: 'wood',
        type: 'resource',
        description: 'Madera común para construcción'
    },
    OAK_WOOD: {
        name: 'Madera de Roble',
        icon: '🪵',
        stackable: true,
        maxStack: 100,
        sprite: 'oakWood',
        type: 'resource',
        description: 'Madera de roble de alta calidad'
    },
    ELVEN_WOOD: {
        name: 'Madera Élfica',
        icon: '✨',
        stackable: true,
        maxStack: 100,
        sprite: 'elvenWood',
        type: 'resource',
        description: 'Madera mágica de los bosques élficos'
    },
    IRON_ORE: {
        name: 'Mineral de Hierro',
        icon: '🪨',
        stackable: true,
        maxStack: 100,
        sprite: 'ironOre',
        type: 'resource',
        description: 'Mineral de hierro sin refinar'
    },
    COAL: {
        name: 'Carbón',
        icon: '⚫',
        stackable: true,
        maxStack: 100,
        sprite: 'coal',
        type: 'resource',
        description: 'Carbón para fundición'
    },
    SILVER_ORE: {
        name: 'Mineral de Plata',
        icon: '⚪',
        stackable: true,
        maxStack: 100,
        sprite: 'silverOre',
        type: 'resource',
        description: 'Mineral de plata sin refinar'
    },
    GOLD_ORE: {
        name: 'Mineral de Oro',
        icon: '🟡',
        stackable: true,
        maxStack: 100,
        sprite: 'goldOre',
        type: 'resource',
        description: 'Mineral de oro sin refinar'
    },
    WOOL: {
        name: 'Lana',
        icon: '🧶',
        stackable: true,
        maxStack: 100,
        sprite: 'wool',
        type: 'resource',
        description: 'Lana de oveja'
    },
    
    // Peces (consumibles y vendibles)
    FISH: {
        name: 'Pez',
        icon: '🐟',
        stackable: true,
        maxStack: 100,
        sprite: 'fish',
        type: 'consumable',
        effect: 'heal_hp',
        value: 15,
        sellPrice: 10,
        description: 'Pez común que restaura 15 HP (vende: 10 oro)'
    },
    FISH_BIG: {
        name: 'Pez Grande',
        icon: '🐠',
        stackable: true,
        maxStack: 100,
        sprite: 'fishBig',
        type: 'consumable',
        effect: 'heal_hp',
        value: 30,
        sellPrice: 25,
        description: 'Pez grande que restaura 30 HP (vende: 25 oro)'
    },
    FISH_RARE: {
        name: 'Pez Raro',
        icon: '🐡',
        stackable: true,
        maxStack: 100,
        sprite: 'fishRare',
        type: 'consumable',
        effect: 'heal_hp',
        value: 50,
        sellPrice: 50,
        description: 'Pez raro que restaura 50 HP (vende: 50 oro)'
    },
    FISH_GOLDEN: {
        name: 'Pez Dorado',
        icon: '🐡',
        stackable: true,
        maxStack: 50,
        sprite: 'fishGolden',
        type: 'consumable',
        effect: 'heal_hp',
        value: 75,
        sellPrice: 100,
        description: 'Pez dorado legendario, restaura 75 HP (vende: 100 oro)'
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
    },
    
    // Armaduras corporales
    ARMOR_LEATHER: {
        name: 'Armadura de Cuero',
        icon: '🦺',
        stackable: false,
        maxStack: 1,
        sprite: 'armorLeather',
        visualSprite: 'armorLeather',
        type: 'armor',
        slot: 'body',
        defense: 15,
        description: 'Armadura ligera de cuero (+15 defensa)'
    },
    ARMOR_PLATE: {
        name: 'Armadura de Placas',
        icon: '🛡️',
        stackable: false,
        maxStack: 1,
        sprite: 'armorPlate',
        visualSprite: 'armorPlate',
        type: 'armor',
        slot: 'body',
        defense: 30,
        description: 'Armadura pesada de placas (+30 defensa)'
    },
    ARMOR_PLATE_GOLD: {
        name: 'Armadura Dorada',
        icon: '✨',
        stackable: false,
        maxStack: 1,
        sprite: 'armorPlateGold',
        visualSprite: 'armorPlateGold',
        type: 'armor',
        slot: 'body',
        defense: 40,
        description: 'Armadura élite de placas doradas (+40 defensa)'
    },
    ROBE_MAGE: {
        name: 'Túnica de Mago',
        icon: '👘',
        stackable: false,
        maxStack: 1,
        sprite: 'armorRobeLightBlue',
        visualSprite: 'armorRobeLightBlue',
        type: 'armor',
        slot: 'body',
        defense: 5,
        manaBonus: 20,
        description: 'Túnica mágica (+5 defensa, +20 mana máximo)'
    },
    
    // Cascos
    HELMET_LEATHER: {
        name: 'Casco de Cuero',
        icon: '🪖',
        stackable: false,
        maxStack: 1,
        sprite: 'helmetLight',
        visualSprite: 'helmetLight',
        type: 'armor',
        slot: 'head',
        defense: 8,
        description: 'Casco ligero de cuero (+8 defensa)'
    },
    HELMET_FULL: {
        name: 'Casco Completo',
        icon: '⛑️',
        stackable: false,
        maxStack: 1,
        sprite: 'helmetFull',
        visualSprite: 'helmetFull',
        type: 'armor',
        slot: 'head',
        defense: 15,
        description: 'Casco pesado completo (+15 defensa)'
    },
    HELMET_GOLD: {
        name: 'Casco Dorado',
        icon: '👑',
        stackable: false,
        maxStack: 1,
        sprite: 'helmetFullGold',
        visualSprite: 'helmetFullGold',
        type: 'armor',
        slot: 'head',
        defense: 20,
        description: 'Casco élite dorado (+20 defensa)'
    },
    HOOD_MAGE: {
        name: 'Capucha Mágica',
        icon: '🧙',
        stackable: false,
        maxStack: 1,
        sprite: 'helmetHood',
        visualSprite: 'helmetHood',
        type: 'armor',
        slot: 'head',
        defense: 3,
        manaBonus: 10,
        description: 'Capucha de mago (+3 defensa, +10 mana máximo)'
    }
};
