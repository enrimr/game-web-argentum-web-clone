/**
 * map-data.js
 * Datos de mapas del mundo
 */

export const mapData = {
    // Zona Inicial
    newbie_city: {
        name: '🏘️ Ciudad de Ullathorpe',
        zone: 'Ciudad',
        level: '1-5',
        description: 'Ciudad inicial para aventureros novatos. Aquí encontrarás todos los servicios básicos: comerciantes, herreros, banco, sacerdotes, y acceso a los campos de entrenamiento. Es una zona segura donde no hay enemigos.',
        enemies: [],
        connections: ['training_fields']
    },
    training_fields: {
        name: '🏞️ Campos de Entrenamiento',
        zone: 'Campos',
        level: '1-10',
        description: 'Campos abiertos perfectos para entrenar habilidades básicas. Enemigos de nivel bajo como slimes, murciélagos y bandidos. Conecta con la ciudad y el bosque exterior.',
        enemies: ['Slime', 'Murciélago', 'Bandido'],
        connections: ['newbie_city', 'forest_outskirts_1']
    },

    // Zona de Bosques
    forest_outskirts_1: {
        name: '🌲 Bosque Exterior Norte',
        zone: 'Bosque',
        level: '5-10',
        description: 'El límite norte de los campos. Los árboles comienzan a densificarse. Enemigos: arañas, lobos y algunos goblins.',
        enemies: ['Araña', 'Lobo', 'Goblin'],
        connections: ['training_fields', 'forest_outskirts_2']
    },
    forest_outskirts_2: {
        name: '🌲 Bosque Exterior Este',
        zone: 'Bosque',
        level: '7-12',
        description: 'Bosque más denso al este. Los árboles se hacen más abundantes y los enemigos más peligrosos.',
        enemies: ['Araña', 'Lobo', 'Goblin', 'Esqueleto'],
        connections: ['forest_outskirts_1', 'forest_outskirts_3']
    },
    forest_outskirts_3: {
        name: '🌲 Bosque Exterior Extremo',
        zone: 'Bosque',
        level: '10-15',
        description: 'La zona más densa del bosque exterior. Los árboles casi bloquean el paso. Enemigos más fuertes.',
        enemies: ['Lobo', 'Goblin', 'Esqueleto'],
        connections: ['forest_outskirts_2', 'dark_forest_north']
    },

    // Zona del Bosque Oscuro
    dark_forest_north: {
        name: '🌲🌑 Bosque Oscuro Norte',
        zone: 'Bosque Oscuro',
        level: '12-18',
        description: 'El bosque se vuelve más oscuro y peligroso. Los lobos acechan entre las sombras.',
        enemies: ['Lobo', 'Orco', 'Esqueleto'],
        connections: ['forest_outskirts_3', 'dark_forest_center']
    },
    dark_forest_center: {
        name: '🌲🌑 Bosque Oscuro Centro',
        zone: 'Bosque Oscuro',
        level: '15-20',
        description: 'El corazón del bosque oscuro. Más denso y peligroso, con entrada a la Cueva del Bosque.',
        enemies: ['Orco', 'Demonio', 'Elemental'],
        connections: ['dark_forest_north', 'dark_forest_south', 'dark_forest_east', 'forest_cave'],
        dungeon: true
    },
    dark_forest_south: {
        name: '🌲🌑 Bosque Oscuro Sur',
        zone: 'Bosque Oscuro',
        level: '18-22',
        description: 'Zona sur del bosque oscuro, más cerca de las montañas. Menos árboles pero mayor peligro con orcos y elementales.',
        enemies: ['Orco', 'Elemental', 'Oso'],
        connections: ['dark_forest_center', 'mountain_pass_lower']
    },
    dark_forest_east: {
        name: '🌲🌑 Bosque Oscuro Este',
        zone: 'Bosque Oscuro',
        level: '16-20',
        description: 'Límite oriental del bosque oscuro. Transición hacia las montañas.',
        enemies: ['Orco', 'Lobo', 'Oso'],
        connections: ['dark_forest_center', 'mountain_pass_lower']
    },

    // Zona de Montañas
    mountain_pass_lower: {
        name: '⛰️ Paso de Montaña Inferior',
        zone: 'Montaña',
        level: '20-25',
        description: 'El inicio de las peligrosas montañas. Caminos estrechos y peligros abundantes. Enemigos: cabras montesas, osos, trolls.',
        enemies: ['Cabra Montesa', 'Oso', 'Troll'],
        connections: ['dark_forest_south', 'dark_forest_east', 'mountain_pass_middle']
    },
    mountain_pass_middle: {
        name: '⛰️ Paso de Montaña Medio',
        zone: 'Montaña',
        level: '22-27',
        description: 'Zona intermedia del paso. Pendientes más pronunciadas y enemigos más fuertes.',
        enemies: ['Troll', 'Troll de Montaña', 'Gigante'],
        connections: ['mountain_pass_lower', 'mountain_pass_upper', 'mountain_city']
    },
    mountain_city: {
        name: '🏔️ Ciudad de Montaña',
        zone: 'Ciudad',
        level: '20-30',
        description: 'Ciudad fortificada en las montañas. Centro comercial avanzado con mejores equipamientos y servicios.',
        enemies: [],
        connections: ['mountain_pass_middle']
    },
    mountain_pass_upper: {
        name: '⛰️ Paso de Montaña Alto',
        zone: 'Montaña',
        level: '25-30',
        description: 'Alturas extremas del paso de montaña. Aire frío y vientos intensos. Solo los más valientes llegan aquí.',
        enemies: ['Troll de Montaña', 'Gigante', 'Gólem'],
        connections: ['mountain_pass_middle', 'mountain_peak', 'mountain_dungeon']
    },
    mountain_peak: {
        name: '⛰️ Cima de la Montaña',
        zone: 'Montaña',
        level: '28-35',
        description: 'La cumbre más alta de las montañas. Desde aquí se divisa todo el mundo. El aire es extremadamente frío y las vistas espectaculares.',
        enemies: ['Gigante', 'Dragón'],
        connections: ['mountain_pass_upper']
    },

    // Mazmorras
    forest_cave: {
        name: '🏔️ Cueva del Bosque Oscuro',
        zone: 'Mazmorra',
        level: '18-25',
        description: 'Una mazmorra subterránea llena de peligros. Corredores estrechos conectan varias salas grandes. Enemigos: trolls de cueva, demonios, gólem.',
        enemies: ['Troll de Cueva', 'Demonio', 'Gólem'],
        connections: ['dark_forest_center'],
        isDungeon: true
    },
    mountain_dungeon: {
        name: '🏔️ Mazmorra de la Montaña',
        zone: 'Mazmorra',
        level: '30-40',
        description: 'Antigua mazmorra excavada en las profundidades de las montañas. Corredores estrechos conectan salas amplias llenas de peligros y tesoros. Enemigos: guardianes ancestrales, gigantes de montaña.',
        enemies: ['Guardián Ancestral', 'Gigante de Montaña', 'Dragón'],
        connections: ['mountain_pass_upper'],
        isDungeon: true
    }
};

// Categorías de zonas
export const zoneCategories = {
    'Zona Inicial': ['newbie_city', 'training_fields'],
    'Zona de Bosques': ['forest_outskirts_1', 'forest_outskirts_2', 'forest_outskirts_3'],
    'Zona del Bosque Oscuro': ['dark_forest_north', 'dark_forest_center', 'dark_forest_south', 'dark_forest_east'],
    'Zona de Montañas': ['mountain_pass_lower', 'mountain_pass_middle', 'mountain_city', 'mountain_pass_upper', 'mountain_peak'],
    'Mazmorras': ['forest_cave', 'mountain_dungeon']
};

// Colores por tipo de zona
export const zoneColors = {
    'Ciudad': '#16a34a',
    'Campos': '#84cc16',
    'Bosque': '#15803d',
    'Bosque Oscuro': '#14532d',
    'Montaña': '#78716c',
    'Mazmorra': '#7c2d12'
};
