// Map definitions for complex world system
// Mundo principal de Calima Online - Zonas Ullathorpe
export const MAP_DEFINITIONS = {
    // ===== ZONA 0: CIUDAD INICIAL =====
    'newbie_city': {
        name: '🏘️ Ciudad de Ullathorpe',
        description: 'Ciudad inicial para aventureros novatos',
        worldX: 200, worldY: 750,
        zone: 'city',
        portals: [
            { x: 57, y: 20, targetMap: 'training_fields', targetX: 1, targetY: 20, name: 'Campos de Entrenamiento' }
        ]
    },

    // ===== ZONA 1: CAMPOS DE ENTRENAMIENTO =====
    'training_fields': {
        name: '🏞️ Campos de Entrenamiento',
        description: 'Campos abiertos perfectos para entrenar habilidades básicas',
        worldX: 350, worldY: 750,
        zone: 'fields',
        portals: [
            { x: 59, y: 20, targetMap: 'newbie_city', targetX: 57, targetY: 20, name: 'Ciudad' },
            { x: 1, y: 20, targetMap: 'forest_outskirts_2', targetX: 59, targetY: 20, name: 'Bosque Exterior Este' }
        ]
    },

    // ===== ZONA 2: BOSQUES EXTERIORES =====
    'forest_outskirts_1': {
        name: '🌲 Bosque Exterior Norte',
        description: 'El límite norte de los campos de entrenamiento. Los árboles comienzan a densificarse.',
        worldX: 350, worldY: 650,
        zone: 'forest',
        portals: [
            { x: 30, y: 39, targetMap: 'training_fields', targetX: 30, targetY: 1, name: 'Campos Sur' },
            { x: 30, y: 1, targetMap: 'dark_forest_north', targetX: 30, targetY: 39, name: 'Bosque Oscuro Norte' }
        ]
    },

    'forest_outskirts_2': {
        name: '🌲 Bosque Exterior Este',
        description: 'Bosque más denso al este de los campos de entrenamiento. Los árboles se hacen más abundantes.',
        worldX: 450, worldY: 750,
        zone: 'forest',
        portals: [
            { x: 1, y: 20, targetMap: 'training_fields', targetX: 59, targetY: 20, name: 'Campos Oeste' },
            { x: 59, y: 20, targetMap: 'forest_outskirts_3', targetX: 1, targetY: 20, name: 'Bosque Exterior Extremo' }
        ]
    },

    'forest_outskirts_3': {
        name: '🌲 Bosque Exterior Extremo',
        description: 'La zona más densa del bosque exterior. Los árboles casi bloquean el paso en algunas áreas.',
        worldX: 550, worldY: 750,
        zone: 'forest',
        portals: [
            { x: 1, y: 20, targetMap: 'forest_outskirts_2', targetX: 59, targetY: 20, name: 'Bosque Exterior Oeste' }
        ]
    },

    // ===== ZONA 3: BOSQUE OSCURO =====
    'dark_forest_north': {
        name: '🌲🌑 Bosque Oscuro Norte',
        description: 'El bosque se vuelve más oscuro y peligroso. Los lobos acechan entre las sombras.',
        worldX: 350, worldY: 550,
        zone: 'dark_forest',
        portals: [
            { x: 30, y: 39, targetMap: 'forest_outskirts_1', targetX: 30, targetY: 1, name: 'Bosque Exterior Sur' },
            { x: 30, y: 1, targetMap: 'dark_forest_center', targetX: 30, targetY: 39, name: 'Bosque Oscuro Centro' }
        ]
    },

    'dark_forest_center': {
        name: '🌲🌑 Bosque Oscuro Centro',
        description: 'El corazón del bosque oscuro. Más denso y peligroso, con una entrada a una cueva misteriosa.',
        worldX: 350, worldY: 450,
        zone: 'dark_forest',
        portals: [
            { x: 30, y: 39, targetMap: 'dark_forest_north', targetX: 30, targetY: 1, name: 'Bosque Oscuro Norte' },
            { x: 30, y: 1, targetMap: 'dark_forest_south', targetX: 30, targetY: 39, name: 'Bosque Oscuro Sur' },
            { x: 59, y: 20, targetMap: 'dark_forest_east', targetX: 1, targetY: 20, name: 'Bosque Oscuro Este' }
        ]
    },

    'dark_forest_south': {
        name: '🌲🌑 Bosque Oscuro Sur',
        description: 'La zona sur del bosque oscuro. Más cerca de las montañas, con menos árboles pero mayor peligro.',
        worldX: 350, worldY: 350,
        zone: 'dark_forest',
        portals: [
            { x: 30, y: 39, targetMap: 'dark_forest_center', targetX: 30, targetY: 1, name: 'Bosque Oscuro Centro' },
            { x: 30, y: 1, targetMap: 'mountain_pass_lower', targetX: 30, targetY: 39, name: 'Paso de Montaña Inferior' }
        ]
    },

    'dark_forest_east': {
        name: '🌲🌑 Bosque Oscuro Este',
        description: 'El límite oriental del bosque oscuro. La transición a las montañas comienza aquí.',
        worldX: 450, worldY: 450,
        zone: 'dark_forest',
        portals: [
            { x: 1, y: 20, targetMap: 'dark_forest_center', targetX: 59, targetY: 20, name: 'Bosque Oscuro Oeste' }
        ]
    },

    // ===== ZONA 4: MONTAÑAS =====
    'mountain_pass_lower': {
        name: '⛰️ Paso de Montaña Inferior',
        description: 'El inicio de las peligrosas montañas. Los caminos son estrechos y los peligros abundan.',
        worldX: 350, worldY: 250,
        zone: 'mountain',
        portals: [
            { x: 30, y: 39, targetMap: 'dark_forest_south', targetX: 30, targetY: 1, name: 'Bosque Oscuro Norte' },
            { x: 30, y: 1, targetMap: 'mountain_pass_middle', targetX: 30, targetY: 39, name: 'Paso de Montaña Medio' }
        ]
    },

    'mountain_pass_middle': {
        name: '⛰️ Paso de Montaña Medio',
        description: 'La zona intermedia del paso de montaña. Las pendientes se hacen más pronunciadas y los peligros aumentan.',
        worldX: 350, worldY: 190,
        zone: 'mountain',
        portals: [
            { x: 30, y: 39, targetMap: 'mountain_pass_lower', targetX: 30, targetY: 1, name: 'Paso Inferior' },
            { x: 30, y: 1, targetMap: 'mountain_pass_upper', targetX: 30, targetY: 39, name: 'Paso Superior' }
        ]
    },

    'mountain_pass_upper': {
        name: '⛰️ Paso de Montaña Alto',
        description: 'Las alturas extremas del paso de montaña. El aire es frío y los vientos son intensos. Solo los más valientes llegan aquí.',
        worldX: 350, worldY: 130,
        zone: 'mountain',
        portals: [
            { x: 30, y: 39, targetMap: 'mountain_pass_middle', targetX: 30, targetY: 1, name: 'Paso Medio' },
            { x: 30, y: 1, targetMap: 'mountain_peak', targetX: 30, targetY: 39, name: 'Cima de la Montaña' }
        ]
    },

    'mountain_peak': {
        name: '⛰️ Cima de la Montaña',
        description: 'La cumbre más alta de las montañas. Desde aquí se divisa todo el mundo. El aire es extremadamente frío y las vistas son espectaculares.',
        worldX: 350, worldY: 70,
        zone: 'mountain',
        portals: [
            { x: 30, y: 39, targetMap: 'mountain_pass_upper', targetX: 30, targetY: 1, name: 'Paso Alto' }
        ]
    },

    // ===== MAZMORRAS =====
    'forest_cave': {
        name: '🏔️ Cueva del Bosque Oscuro',
        description: 'Una mazmorra subterránea llena de peligros. Corredores estrechos conectan varias salas grandes.',
        worldX: 650, worldY: 450,
        zone: 'dungeon',
        isDungeon: true,
        portals: [
            { x: 30, y: 30, targetMap: 'dark_forest_center', targetX: 30, targetY: 30, name: 'Salida' }
        ]
    },

    'mountain_dungeon': {
        name: '🏔️ Mazmorra de la Montaña',
        description: 'Una antigua mazmorra excavada en las profundidades de las montañas. Corredores estrechos conectan salas amplias llenas de peligros y tesoros.',
        worldX: 650, worldY: 130,
        zone: 'dungeon',
        isDungeon: true,
        portals: [
            { x: 30, y: 30, targetMap: 'mountain_pass_upper', targetX: 30, targetY: 30, name: 'Salida' }
        ]
    }
};

// World map connections (which maps are connected)
export const WORLD_CONNECTIONS = [
    // ===== ZONA INICIAL =====
    ['newbie_city', 'training_fields'],

    // ===== CAMPOS DE ENTRENAMIENTO =====
    ['training_fields', 'forest_outskirts_1'],
    ['training_fields', 'forest_outskirts_2'],

    // ===== BOSQUES EXTERIORES =====
    ['forest_outskirts_1', 'dark_forest_north'],
    ['forest_outskirts_2', 'forest_outskirts_3'],

    // ===== BOSQUE OSCURO =====
    ['dark_forest_north', 'dark_forest_center'],
    ['dark_forest_center', 'dark_forest_south'],
    ['dark_forest_center', 'dark_forest_east'],

    // ===== MONTAÑAS =====
    ['dark_forest_south', 'mountain_pass_lower'],
    ['mountain_pass_lower', 'mountain_pass_middle'],
    ['mountain_pass_middle', 'mountain_pass_upper'],
    ['mountain_pass_upper', 'mountain_peak'],

    // ===== MAZMORRAS =====
    ['dark_forest_center', 'forest_cave'],
    ['mountain_pass_upper', 'mountain_dungeon']
];
