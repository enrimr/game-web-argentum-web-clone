/**
 * skills-data.js
 * Sistema completo de habilidades
 */

export const skillsData = {
    // Habilidades de Combate
    combat: {
        name: '⚔️ Combate con Armas',
        category: 'Combate',
        description: 'Efectividad en combate cuerpo a cuerpo',
        improves: 'Aumenta daño y precisión con armas',
        howToLevel: 'Atacando con armas equipadas'
    },
    shield: {
        name: '🛡️ Defensa con Escudos',
        category: 'Combate',
        description: 'Capacidad de bloquear ataques',
        improves: 'Reduce daño recibido',
        howToLevel: 'Recibiendo ataques con escudo equipado'
    },
    ranged: {
        name: '🏹 Combate a Distancia',
        category: 'Combate',
        description: 'Puntería con arcos y proyectiles',
        improves: 'Aumenta daño y precisión a distancia',
        howToLevel: 'Disparando flechas con arco'
    },
    wrestling: {
        name: '👊 Wrestling',
        category: 'Combate',
        description: 'Lucha sin armas',
        improves: 'Permite desarmar enemigos',
        howToLevel: 'Peleando sin arma equipada'
    },
    tactics: {
        name: '🤸 Tácticas',
        category: 'Combate',
        description: 'Esquivar ataques enemigos',
        improves: 'Reduce probabilidad de ser golpeado',
        howToLevel: 'Recibiendo ataques'
    },
    
    // Habilidades de Trabajo
    mining: {
        name: '⛏️ Minería',
        category: 'Trabajo',
        description: 'Extrae minerales de vetas',
        improves: 'Nivel afecta éxito y cantidad extraída',
        howToLevel: 'Picando vetas con pico equipado',
        required: 'Pico',
        products: ['Hierro', 'Plata', 'Oro', 'Carbón']
    },
    lumberjacking: {
        name: '🪓 Talar',
        category: 'Trabajo',
        description: 'Corta árboles para madera',
        improves: 'Nivel afecta éxito y cantidad extraída',
        howToLevel: 'Talando árboles con hacha equipada',
        required: 'Hacha',
        products: ['Madera', 'Roble', 'Madera Élfica']
    },
    fishing: {
        name: '🎣 Pesca',
        category: 'Trabajo',
        description: 'Pesca en ríos y lagos',
        improves: 'Nivel afecta tipo de peces',
        howToLevel: 'Pescando con caña',
        required: 'Caña de pescar',
        products: ['Peces variados']
    },
    
    // Habilidades de Crafteo
    blacksmithing: {
        name: '🔨 Herrería',
        category: 'Crafteo',
        description: 'Forja armas y armaduras de metal',
        improves: 'Crea items de mejor calidad',
        howToLevel: 'Forjando items en forja',
        required: 'Martillo, lingotes, carbón',
        products: ['Espadas', 'Armaduras', 'Escudos']
    },
    carpentry: {
        name: '🪚 Carpintería',
        category: 'Crafteo',
        description: 'Crea arcos, flechas y objetos de madera',
        improves: 'Crea items de mejor calidad',
        howToLevel: 'Crafteando items de madera',
        required: 'Serrucho, madera',
        products: ['Arcos', 'Flechas', 'Barcos']
    },
    
    // Habilidades Mágicas
    magic: {
        name: '✨ Magia',
        category: 'Magia',
        description: 'Poder de hechizos',
        improves: 'Aumenta daño mágico y efectividad',
        howToLevel: 'Lanzando hechizos'
    },
    meditation: {
        name: '🧘 Meditar',
        category: 'Magia',
        description: 'Velocidad de recuperación de mana',
        improves: 'Recupera mana más rápido',
        howToLevel: 'Meditando (tecla M)',
        note: 'Esencial para magos'
    },
    
    // Habilidades Sociales
    trading: {
        name: '💰 Comercio',
        category: 'Social',
        description: 'Mejores precios al comprar/vender',
        improves: 'Descuentos con NPCs',
        howToLevel: 'Comerciando con NPCs'
    },
    leadership: {
        name: '👑 Liderazgo',
        category: 'Social',
        description: 'Comandar grupos',
        improves: 'Bonificación a party members',
        howToLevel: 'Liderando grupos'
    },
    
    // Habilidades Furtivas
    stealing: {
        name: '🦹 Robar',
        category: 'Sigilo',
        description: 'Roba items de otros jugadores',
        improves: 'Probabilidad de éxito aumenta',
        howToLevel: 'Robando exitosamente'
    },
    hiding: {
        name: '🥷 Ocultarse',
        category: 'Sigilo',
        description: 'Vuélvete invisible temporalmente',
        improves: 'Duración y efectividad aumentan',
        howToLevel: 'Ocultándote'
    },
    backstab: {
        name: '🗡️ Apuñalar',
        category: 'Sigilo',
        description: 'Ataque crítico desde las sombras',
        improves: 'Daño +40% (asesino: +50%)',
        howToLevel: 'Apuñalando con daga mientras oculto'
    },
    
    // Habilidades Especiales
    taming: {
        name: '🐺 Domar Animales',
        category: 'Especial',
        description: 'Domestica criaturas como mascotas',
        improves: 'Puedes domar criaturas más fuertes',
        howToLevel: 'Domando criaturas'
    },
    survival: {
        name: '🏕️ Supervivencia',
        category: 'Especial',
        description: 'Resistencia en ambientes hostiles',
        improves: 'Hacer fogatas, buscar comida',
        howToLevel: 'Sobreviviendo en zonas peligrosas'
    },
    sailing: {
        name: '⛵ Navegación',
        category: 'Especial',
        description: 'Manejo de barcos',
        improves: 'Velocidad y control de embarcaciones',
        howToLevel: 'Navegando en barcos',
        note: 'Requerido para embarcaciones'
    }
};

export const skillCategories = {
    'Combate': ['combat', 'shield', 'ranged', 'wrestling', 'tactics'],
    'Trabajo': ['mining', 'lumberjacking', 'fishing'],
    'Crafteo': ['blacksmithing', 'carpentry'],
    'Magia': ['magic', 'meditation'],
    'Social': ['trading', 'leadership'],
    'Sigilo': ['stealing', 'hiding', 'backstab'],
    'Especial': ['taming', 'survival', 'sailing']
};

// Tabla de probabilidades
export const probabilityTable = [
    { level: 1, luck: 48, success: '~2%', example: 'Fallas 48 de cada 50 intentos' },
    { level: 10, luck: 43, success: '~7%', example: '1 éxito cada 15 intentos' },
    { level: 25, luck: 31, success: '~10%', example: '1 éxito cada 10 intentos' },
    { level: 50, luck: 19, success: '~16%', example: '1 éxito cada 6 intentos' },
    { level: 75, luck: 11, success: '~27%', example: '1 éxito cada 4 intentos' },
    { level: 100, luck: 5, success: '~60%', example: '3 éxitos cada 5 intentos' }
];

// Experiencia requerida por nivel
export const expRequirements = [
    { fromLevel: 1, toLevel: 2, exp: 50 },
    { fromLevel: 10, toLevel: 11, exp: 550 },
    { fromLevel: 50, toLevel: 51, exp: 3750 },
    { fromLevel: 99, toLevel: 100, exp: 14850 }
];
