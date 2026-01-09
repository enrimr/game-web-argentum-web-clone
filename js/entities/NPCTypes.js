/**
 * NPCTypes.js
 * Definiciones de NPCs y sus tipos
 * Inspirado en NPCs.dat de Argentum Online
 */

// Tipos de NPCs
export const NPC_TYPE = {
    MERCHANT: 'merchant',           // Comerciante
    BLACKSMITH: 'blacksmith',       // Herrero
    CARPENTER: 'carpenter',         // Carpintero
    BANKER: 'banker',               // Banquero
    GUARD: 'guard',                 // Guardia
    TRAINER: 'trainer',             // Entrenador
    QUEST_GIVER: 'quest_giver',     // Dador de misiones
    INNKEEPER: 'innkeeper',         // Posadero
    ALCHEMIST: 'alchemist',         // Alquimista
    HEALER: 'healer',               // Sacerdote/Curandero
    MAGE: 'mage'                    // Mago/Vendedor de hechizos
};

// Definiciones de NPCs específicos
export const NPC_DEFINITIONS = {
    // Comerciantes
    merchant_general: {
        name: 'Mercader Andrés',
        type: NPC_TYPE.MERCHANT,
        sprite: 'npc_merchant',
        dialogue: {
            greeting: '¡Bienvenido a mi tienda! ¿Qué deseas comprar?',
            trade: 'Aquí están mis productos.',
            farewell: '¡Vuelve pronto!'
        },
        inventory: [
            { itemType: 'POTION_RED', quantity: 50, price: 100 },
            { itemType: 'POTION_BLUE', quantity: 50, price: 80 },
            { itemType: 'POTION_GREEN', quantity: 30, price: 50 },
            { itemType: 'ARROW', quantity: 500, price: 5 }
        ]
    },
    
    // Herrero
    blacksmith_ullathorpe: {
        name: 'Herrero Goliath',
        type: NPC_TYPE.BLACKSMITH,
        sprite: 'npc_blacksmith',
        dialogue: {
            greeting: 'Bienvenido a mi herrería. ¿Necesitas armas o armaduras?',
            craft: 'Puedo forjar eso por ti, pero necesitarás los materiales.',
            trade: 'Mira lo que tengo disponible.',
            farewell: '¡Que tu espada nunca se rompa!'
        },
        inventory: [
            { itemType: 'SWORD', quantity: 5, price: 500 },
            { itemType: 'SWORD_IRON', quantity: 3, price: 1000 },
            { itemType: 'SHIELD', quantity: 5, price: 400 },
            { itemType: 'SHIELD_IRON', quantity: 3, price: 800 }
        ],
        crafting: {
            canCraft: true,
            recipes: [
                {
                    result: 'SWORD_IRON',
                    materials: [
                        { itemType: 'IRON_ORE', quantity: 10 },
                        { itemType: 'COAL', quantity: 5 }
                    ],
                    skillRequired: { skill: 'herreria', level: 15 },
                    cost: 200
                }
            ]
        }
    },
    
    // Carpintero
    carpenter_banderbill: {
        name: 'Carpintero Eleuterio',
        type: NPC_TYPE.CARPENTER,
        sprite: 'npc_carpenter',
        dialogue: {
            greeting: '¡Ah, un aventurero! ¿Necesitas arcos o flechas?',
            craft: 'Con buena madera, puedo hacer maravillas.',
            trade: 'Aquí tienes mis creaciones.',
            farewell: '¡Que tus flechas vuelen certeras!'
        },
        inventory: [
            { itemType: 'BOW', quantity: 5, price: 600 },
            { itemType: 'BOW_ELVEN', quantity: 2, price: 1500 },
            { itemType: 'ARROW', quantity: 1000, price: 3 }
        ],
        crafting: {
            canCraft: true,
            recipes: [
                {
                    result: 'BOW',
                    materials: [
                        { itemType: 'WOOD', quantity: 15 },
                        { itemType: 'STRING', quantity: 2 }
                    ],
                    skillRequired: { skill: 'carpinteria', level: 10 },
                    cost: 100
                },
                {
                    result: 'ARROW',
                    materials: [
                        { itemType: 'WOOD', quantity: 1 },
                        { itemType: 'FEATHER', quantity: 1 }
                    ],
                    skillRequired: { skill: 'carpinteria', level: 5 },
                    quantity: 10,
                    cost: 10
                }
            ]
        }
    },
    
    // Banquero
    banker_city: {
        name: 'Banquero Martín',
        type: NPC_TYPE.BANKER,
        sprite: 'npc_banker',
        dialogue: {
            greeting: 'Bienvenido al Banco Imperial. ¿En qué puedo ayudarte?',
            deposit: 'Tu oro está seguro conmigo.',
            withdraw: 'Aquí tienes tu oro.',
            farewell: '¡Cuida bien tu dinero!'
        },
        services: ['deposit', 'withdraw', 'balance']
    },
    
    // Guardia
    guard_city: {
        name: 'Guardia Real',
        type: NPC_TYPE.GUARD,
        sprite: 'npc_guard',
        dialogue: {
            greeting: 'Mantén la paz en la ciudad.',
            warning: '¡No causes problemas aquí!',
            attack: '¡Enfrentarás la justicia!'
        },
        combat: {
            hp: 150,
            damage: { min: 15, max: 25 },
            defense: 20,
            attacksOnCriminal: true
        }
    },
    
    // Entrenador
    trainer_skills: {
        name: 'Maestro Karim',
        type: NPC_TYPE.TRAINER,
        sprite: 'npc_trainer',
        dialogue: {
            greeting: 'Busco aventureros con potencial. ¿Quieres entrenar?',
            train: 'Te enseñaré todo lo que sé.',
            farewell: 'La práctica hace al maestro.'
        },
        training: {
            skills: ['Magia', 'Combate', 'Defensa'],
            costPerLevel: 500
        }
    },
    
    // Alquimista
    alchemist_market: {
        name: 'Alquimista Morgana',
        type: NPC_TYPE.ALCHEMIST,
        sprite: 'npc_alchemist',
        dialogue: {
            greeting: 'Bienvenido a mi laboratorio. Las pociones son mi especialidad.',
            craft: 'Con los ingredientes correctos, puedo crear maravillas.',
            trade: 'Mira mis creaciones.',
            farewell: '¡Usa mis pociones sabiamente!'
        },
        inventory: [
            { itemType: 'POTION_RED', quantity: 100, price: 120 },
            { itemType: 'POTION_BLUE', quantity: 100, price: 100 },
            { itemType: 'POTION_GREEN', quantity: 50, price: 60 }
        ],
        crafting: {
            canCraft: true,
            recipes: [
                {
                    result: 'POTION_RED',
                    materials: [
                        { itemType: 'RED_HERB', quantity: 3 },
                        { itemType: 'WATER_FLASK', quantity: 1 }
                    ],
                    skillRequired: { skill: 'alquimia', level: 5 },
                    quantity: 5,
                    cost: 50
                }
            ]
        }
    },
    
    // Sacerdote/Curandero
    healer_city: {
        name: 'Sacerdote Marcos',
        type: NPC_TYPE.HEALER,
        sprite: 'npc_healer',
        dialogue: {
            greeting: 'La paz sea contigo, viajero.',
            heal: 'Deja que cure tus heridas.',
            resurrect: 'Te devolveré a la vida, pero ten más cuidado en adelante.',
            farewell: 'Ve con la bendición de los dioses.'
        },
        services: {
            canHeal: true,
            canResurrect: true,
            resurrectCost: 100, // Costo en oro para resucitar
            healCost: 50        // Costo en oro para curar
        }
    },
    
    // Mago vendedor de hechizos
    mage_city: {
        name: 'Mago Nemesius',
        type: NPC_TYPE.MAGE,
        sprite: 'npc_mage',
        dialogue: {
            greeting: '¡Saludos, buscador de conocimientos arcanos! Mis libros de hechizos contienen gran poder.',
            trade: 'Estos son los hechizos que puedo ofrecerte. Úsalos con sabiduría.',
            teach: 'Aprender magia requiere disciplina y mana, pero sus recompensas son inigualables.',
            farewell: 'Que la magia te acompañe en tu camino.'
        },
        inventory: [
            { itemType: 'SPELLBOOK_MAGIC_ARROW', quantity: 5, price: 500 },
            { itemType: 'SPELLBOOK_FIREBALL', quantity: 3, price: 1000 },
            { itemType: 'SPELLBOOK_HEAL_WOUNDS', quantity: 5, price: 800 },
            { itemType: 'SPELLBOOK_PARALYZE', quantity: 2, price: 1200 },
            { itemType: 'SPELLBOOK_STRENGTHEN', quantity: 3, price: 900 },
            { itemType: 'SCROLL_LIGHTNING', quantity: 10, price: 300 },
            { itemType: 'SCROLL_POISON', quantity: 10, price: 250 },
            { itemType: 'POTION_BLUE', quantity: 100, price: 75 }  // Poción de maná más barata
        ]
    },
    
    // Maestro meditador - NPC especial que siempre está meditando
    meditation_master: {
        name: 'Maestro Zennin',
        type: NPC_TYPE.MAGE,
        sprite: 'npc_mage',
        meditating: true, // Este NPC siempre está meditando
        dialogue: {
            greeting: '¡Bienvenido joven aprendiz! *No abre los ojos* Como puedes ver, estoy reuniendo mi ki a través de la meditación.',
            teach: 'La meditación es una técnica poderosa que te permite recuperar tu maná rápidamente mientras estás quieto.',
            farewell: 'Continúa tu camino... y recuerda que puedes meditar presionando la tecla "M".'
        },
        inventory: [
            { itemType: 'POTION_BLUE', quantity: 100, price: 50 }  // Vende pociones de maná a buen precio
        ]
    }
};

// Posiciones por defecto de NPCs en mapas
export const NPC_SPAWN_POSITIONS = {
    city: [
        { npcType: 'merchant_general', x: 25, y: 15 },
        { npcType: 'banker_city', x: 20, y: 20 },
        { npcType: 'guard_city', x: 15, y: 10 },
        { npcType: 'guard_city', x: 35, y: 25 },
        { npcType: 'healer_city', x: 30, y: 10 },
        { npcType: 'mage_city', x: 10, y: 15 },
        { npcType: 'meditation_master', x: 20, y: 25 } // Añadimos al maestro de meditación
    ],
    market: [
        { npcType: 'merchant_general', x: 10, y: 10 },
        { npcType: 'alchemist_market', x: 25, y: 15 }
    ],
    field: [
        { npcType: 'trainer_skills', x: 30, y: 30 },
        { npcType: 'healer_city', x: 15, y: 20 },
        { npcType: 'meditation_master', x: 20, y: 25 } // Añadimos al maestro de meditación
    ]
};
