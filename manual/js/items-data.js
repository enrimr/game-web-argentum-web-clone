/**
 * items-data.js
 * Datos completos de items, equipamiento y recursos
 */

export const weaponsData = {
    sword: {
        name: 'Espada',
        icon: '⚔️',
        damage: '+15',
        price: '500 oro',
        type: 'Arma',
        description: 'Espada básica para combate cuerpo a cuerpo.'
    },
    ironSword: {
        name: 'Espada de Hierro',
        icon: '🗡️',
        damage: '+25',
        price: '1,000 oro',
        type: 'Arma',
        description: 'Espada mejorada de hierro forjado. Mayor daño en combate.'
    },
    bow: {
        name: 'Arco',
        icon: '🏹',
        damage: '+12',
        range: '8 casillas',
        price: '600 oro',
        type: 'Arma a Distancia',
        description: 'Arco básico para combate a distancia. Requiere flechas.'
    },
    elvenBow: {
        name: 'Arco Élfico',
        icon: '🏹',
        damage: '+18',
        range: '10 casillas',
        price: '1,500 oro',
        type: 'Arma a Distancia',
        description: 'Arco élfico de alta calidad con mayor alcance y daño.'
    }
};

export const armorsData = {
    shield: {
        name: 'Escudo',
        icon: '🛡️',
        defense: '+10',
        price: '400 oro',
        type: 'Escudo',
        description: 'Escudo básico de madera reforzada.'
    },
    ironShield: {
        name: 'Escudo de Hierro',
        icon: '🔰',
        defense: '+20',
        price: '800 oro',
        type: 'Escudo',
        description: 'Escudo de hierro forjado con mayor protección.'
    },
    leatherArmor: {
        name: 'Armadura de Cuero',
        icon: '🦺',
        defense: '+15',
        price: '800 oro',
        type: 'Armadura Corporal',
        description: 'Armadura ligera de cuero curtido.'
    },
    plateArmor: {
        name: 'Armadura de Placas',
        icon: '🛡️',
        defense: '+30',
        price: '1,500 oro',
        type: 'Armadura Corporal',
        description: 'Armadura pesada de placas metálicas.'
    },
    goldenArmor: {
        name: 'Armadura Dorada',
        icon: '✨',
        defense: '+40',
        price: '3,000 oro',
        type: 'Armadura Corporal',
        description: 'Armadura élite de placas doradas, máxima protección.'
    },
    mageRobe: {
        name: 'Túnica de Mago',
        icon: '👘',
        defense: '+5',
        mana: '+20',
        price: 'N/D',
        type: 'Armadura Corporal',
        tags: ['Mágico'],
        description: 'Túnica mágica que aumenta el mana máximo.'
    }
};

export const helmetsData = {
    leatherHelmet: {
        name: 'Casco de Cuero',
        icon: '🪖',
        defense: '+8',
        price: '400 oro',
        type: 'Casco',
        description: 'Casco ligero de cuero para protección básica.'
    },
    fullHelmet: {
        name: 'Casco Completo',
        icon: '⛑️',
        defense: '+15',
        price: '750 oro',
        type: 'Casco',
        description: 'Casco pesado de metal con protección completa.'
    },
    goldenHelmet: {
        name: 'Casco Dorado',
        icon: '👑',
        defense: '+20',
        price: '1,500 oro',
        type: 'Casco',
        description: 'Casco élite dorado de máxima protección.'
    },
    magicHood: {
        name: 'Capucha Mágica',
        icon: '🧙',
        defense: '+3',
        mana: '+10',
        price: 'N/D',
        type: 'Casco',
        tags: ['Mágico'],
        description: 'Capucha de mago que aumenta el mana máximo.'
    }
};

export const consumablesData = {
    redPotion: {
        name: 'Poción Roja',
        icon: '🧪',
        effect: 'Restaura 50 HP',
        stackable: 'Hasta 100',
        price: '100 oro',
        type: 'Consumible',
        tags: ['Curación'],
        description: 'Poción de curación que restaura puntos de vida.'
    },
    bluePotion: {
        name: 'Poción Azul',
        icon: '💧',
        effect: 'Restaura 30 Mana',
        stackable: 'Hasta 100',
        price: '80 oro',
        type: 'Consumible',
        tags: ['Mana'],
        description: 'Poción mágica que restaura puntos de mana.'
    },
    greenPotion: {
        name: 'Poción Verde',
        icon: '🍀',
        effect: 'Cura veneno',
        stackable: 'Hasta 100',
        price: '50 oro',
        type: 'Consumible',
        tags: ['Antídoto'],
        description: 'Antídoto que cura el envenenamiento.'
    },
    arrows: {
        name: 'Flechas',
        icon: '🏹',
        use: 'Arcos',
        stackable: 'Hasta 500',
        price: '5 oro c/u',
        type: 'Munición',
        description: 'Munición necesaria para usar arcos.'
    }
};

export const spellBooksData = {
    magicArrow: {
        name: 'Libro: Flecha Mágica',
        icon: '📖',
        type: 'Libro de Hechizo',
        description: 'Te enseña el hechizo "Flecha Mágica" permanentemente.'
    },
    fireball: {
        name: 'Libro: Bola de Fuego',
        icon: '📕',
        type: 'Libro de Hechizo',
        description: 'Te enseña el hechizo "Bola de Fuego" permanentemente.'
    },
    heal: {
        name: 'Libro: Curar Heridas',
        icon: '📗',
        type: 'Libro de Hechizo',
        description: 'Te enseña el hechizo "Curar Heridas" permanentemente.'
    },
    paralyze: {
        name: 'Libro: Paralizar',
        icon: '📘',
        type: 'Libro de Hechizo',
        description: 'Te enseña el hechizo "Paralizar" permanentemente.'
    },
    strength: {
        name: 'Libro: Fuerza',
        icon: '📙',
        type: 'Libro de Hechizo',
        description: 'Te enseña el hechizo "Fuerza" permanentemente.'
    },
    lightningScroll: {
        name: 'Pergamino: Relámpago',
        icon: '📜',
        type: 'Pergamino',
        tags: ['Un uso'],
        description: 'Lanza el hechizo "Relámpago" una vez y se consume.'
    },
    poisonScroll: {
        name: 'Pergamino: Envenenar',
        icon: '🧾',
        type: 'Pergamino',
        tags: ['Un uso'],
        description: 'Lanza el hechizo "Envenenar" una vez y se consume.'
    }
};

export const resourcesData = {
    tree: {
        name: 'Árbol',
        icon: '🌲',
        type: 'Recurso Renovable',
        tool: 'Hacha 🪓',
        skill: 'Talar',
        resources: '50-10,000 unidades',
        perHit: '1-5 (según skill)',
        time: '2.5 seg base',
        products: [
            'Madera (nivel 1+)',
            'Madera de Roble (nivel 15+, 30% chance)',
            'Madera Élfica (nivel 50+, 10% chance)'
        ],
        bonus: 'Trabajador: Extrae el doble de recursos'
    },
    ironVein: {
        name: 'Veta de Hierro',
        icon: '⛰️',
        type: 'Recurso Mineral',
        tool: 'Pico ⛏️',
        skill: 'Minería',
        resources: '50-10,000 unidades',
        perHit: '1-4 (según skill)',
        products: [
            'Mineral de Hierro (nivel 1+, 80% chance)',
            'Carbón (nivel 5+, 40% chance)'
        ]
    },
    silverVein: {
        name: 'Veta de Plata',
        icon: '🗻',
        type: 'Recurso Mineral',
        tool: 'Pico ⛏️',
        skill: 'Minería 20+',
        resources: '50-10,000 unidades',
        products: ['Mineral de Plata (60% chance)'],
        note: 'Más valioso que el hierro.'
    },
    goldVein: {
        name: 'Veta de Oro',
        icon: '🏔️',
        type: 'Recurso Mineral',
        tool: 'Pico ⛏️',
        skill: 'Minería 40+',
        resources: '50-10,000 unidades',
        products: ['Mineral de Oro (50% chance)'],
        note: 'El mineral más valioso.'
    }
};

export const npcsData = {
    merchant: {
        name: 'Mercader Andrés',
        icon: '🏪',
        type: 'Comerciante General',
        location: 'Ciudad de Ullathorpe',
        products: 'Pociones, flechas',
        prices: '5-120 oro'
    },
    blacksmith: {
        name: 'Herrero Goliath',
        icon: '🔨',
        type: 'Herrero',
        location: 'Ciudad de Ullathorpe',
        specialty: 'Armas y armaduras',
        products: ['Espadas y escudos', 'Armaduras de cuero, placas y doradas', 'Cascos de todos los tipos'],
        services: 'También puede forjar items especiales'
    },
    carpenter: {
        name: 'Carpintero Eleuterio',
        icon: '🪓',
        type: 'Carpintero',
        location: 'Ciudad',
        specialty: 'Arcos y flechas',
        products: ['Arco básico (600 oro)', 'Arco Élfico (1500 oro)', 'Flechas (3 oro c/u)'],
        services: 'Puede fabricar arcos personalizados'
    },
    alchemist: {
        name: 'Alquimista Morgana',
        icon: '🧪',
        type: 'Alquimista',
        location: 'Mercado',
        specialty: 'Pociones y elixires',
        products: ['Pociones de salud premium', 'Pociones de mana', 'Antídotos'],
        services: 'Puede crear pociones especiales'
    },
    mage: {
        name: 'Mago Nemesius',
        icon: '🧙',
        type: 'Vendedor de Hechizos',
        location: 'Ciudad de Ullathorpe',
        specialty: 'Libros de hechizos y pergaminos',
        products: ['Libros de hechizos permanentes', 'Pergaminos de un solo uso', 'Pociones de mana (75 oro)'],
        dialogue: '"¡Saludos, buscador de conocimientos arcanos!"'
    },
    meditationMaster: {
        name: 'Maestro Zennin',
        icon: '🧘',
        type: 'Maestro de Meditación',
        location: 'Ciudad / Campos',
        specialty: 'Enseñanza de meditación',
        note: 'Siempre está meditando, mostrando el ejemplo.',
        teaching: 'Te enseña a meditar presionando la tecla "M" para recuperar mana rápidamente.',
        products: 'Vende pociones de mana a buen precio (50 oro).'
    },
    banker: {
        name: 'Banquero Martín',
        icon: '🏦',
        type: 'Banquero',
        location: 'Ciudad de Ullathorpe',
        services: ['Depositar oro', 'Retirar oro', 'Consultar balance'],
        note: 'Tu oro estará seguro en el banco.'
    },
    priest: {
        name: 'Sacerdote Marcos',
        icon: '⚕️',
        type: 'Sacerdote',
        location: 'Ciudad / Campos',
        services: ['Curación completa (50 oro)', 'Resurrección (100 oro)', 'Bendiciones'],
        dialogue: '"La paz sea contigo, viajero."'
    },
    guard: {
        name: 'Guardia Real',
        icon: '🛡️',
        type: 'Guardia',
        location: 'Ciudad de Ullathorpe',
        function: 'Mantener el orden',
        stats: ['HP: 150', 'Daño: 15-25', 'Defensa: 20'],
        warning: '⚠️ Atacará a criminales'
    },
    trainer: {
        name: 'Maestro Karim',
        icon: '🎯',
        type: 'Entrenador',
        location: 'Campos de Entrenamiento',
        services: ['Entrenamiento de Magia', 'Entrenamiento de Combate', 'Entrenamiento de Defensa'],
        cost: '500 oro por nivel',
        dialogue: '"La práctica hace al maestro."'
    }
};

export const itemCategories = {
    'Armas': Object.keys(weaponsData),
    'Armaduras': Object.keys(armorsData),
    'Cascos': Object.keys(helmetsData),
    'Pociones y Consumibles': Object.keys(consumablesData),
    'Libros de Hechizos': Object.keys(spellBooksData)
};
