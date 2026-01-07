// Map definitions for complex world system
// Incluye tanto los mapas originales como el nuevo mundo de las Islas Canarias
export const MAP_DEFINITIONS = {
    // MAPA ORIGINAL
    'newbie_city': {
        name: '🏘️ Ciudad de Ullathorpe',
        description: 'Ciudad inicial para aventureros novatos',
        worldX: 200, worldY: 150,
        portals: [
            { x: 25, y: 3, targetMap: 'newbie_field', targetX: 25, targetY: 35, name: 'Campo Norte' }
        ]
    },
    'newbie_field': {
        name: '🏞️ Campos de Ullathorpe',
        description: 'Campos seguros para aventureros novatos',
        worldX: 200, worldY: 220,
        portals: [
            { x: 25, y: 37, targetMap: 'newbie_city', targetX: 25, targetY: 5, name: 'Ciudad' },
            { x: 45, y: 10, targetMap: 'dark_forest', targetX: 5, targetY: 20, name: 'Bosque' }
        ]
    },
    'dark_forest': {
        name: '🌲 Bosque Oscuro',
        description: 'Bosque denso con criaturas peligrosas',
        worldX: 300, worldY: 220,
        portals: [
            { x: 5, y: 20, targetMap: 'newbie_field', targetX: 43, targetY: 10, name: 'Campo' }
        ]
    },
    'field': {
        name: '🏞️ Campo Principal',
        description: 'Campo abierto con caminos hacia otras áreas',
        worldX: 150, worldY: 200,
        portals: [
            { x: 30, y: 20, targetMap: 'city', targetX: 15, targetY: 35, name: 'Ciudad' },
            { x: 45, y: 10, targetMap: 'dungeon', targetX: 5, targetY: 5, name: 'Mazmorra' },
            { x: 5, y: 35, targetMap: 'forest', targetX: 25, targetY: 5, name: 'Bosque' }
        ]
    },
    'city': {
        name: '🏘️ Ciudad Imperial',
        description: 'Ciudad con calles, tiendas y ciudadanos',
        worldX: 250, worldY: 150,
        portals: [
            { x: 15, y: 37, targetMap: 'field', targetX: 30, targetY: 18, name: 'Campo' },
            { x: 45, y: 10, targetMap: 'castle', targetX: 10, targetY: 25, name: 'Castillo' },
            { x: 5, y: 5, targetMap: 'market', targetX: 15, targetY: 20, name: 'Mercado' }
        ]
    },
    'dungeon': {
        name: '🏰 Mazmorra Antigua',
        description: 'Mazmorra con habitaciones conectadas',
        worldX: 300, worldY: 250,
        portals: [
            { x: 5, y: 3, targetMap: 'field', targetX: 45, targetY: 12, name: 'Campo' },
            { x: 20, y: 12, targetMap: 'deep_dungeon', targetX: 5, targetY: 5, name: 'Profundidades' }
        ]
    },
    'forest': {
        name: '🌲 Bosque Encantado',
        description: 'Bosque denso con caminos ocultos',
        worldX: 50, worldY: 120,
        portals: [
            { x: 25, y: 3, targetMap: 'field', targetX: 5, targetY: 37, name: 'Campo' },
            { x: 40, y: 30, targetMap: 'ruins', targetX: 10, targetY: 10, name: 'Ruinas' }
        ]
    },
    'castle': {
        name: '🏰 Castillo Real',
        description: 'Castillo majestuoso con salas importantes',
        worldX: 320, worldY: 80,
        portals: [
            { x: 10, y: 27, targetMap: 'city', targetX: 45, targetY: 8, name: 'Ciudad' },
            { x: 35, y: 5, targetMap: 'throne_room', targetX: 15, targetY: 20, name: 'Sala del Trono' }
        ]
    },
    'market': {
        name: '🏪 Mercado Central',
        description: 'Mercado bullicioso con comerciantes',
        worldX: 200, worldY: 100,
        portals: [
            { x: 15, y: 22, targetMap: 'city', targetX: 5, targetY: 3, name: 'Ciudad' }
        ]
    },
    'deep_dungeon': {
        name: '🕳️ Profundidades',
        description: 'Zonas profundas y peligrosas de la mazmorra',
        worldX: 350, worldY: 280,
        portals: [
            { x: 5, y: 3, targetMap: 'dungeon', targetX: 20, targetY: 14, name: 'Mazmorra' }
        ]
    },
    'ruins': {
        name: '🏛️ Ruinas Antiguas',
        description: 'Ruinas olvidadas con secretos del pasado',
        worldX: 80, worldY: 50,
        portals: [
            { x: 10, y: 8, targetMap: 'forest', targetX: 40, targetY: 32, name: 'Bosque' }
        ]
    },
    'throne_room': {
        name: '👑 Sala del Trono',
        description: 'Sala real con el trono del rey',
        worldX: 350, worldY: 30,
        portals: [
            { x: 15, y: 22, targetMap: 'castle', targetX: 35, targetY: 3, name: 'Castillo' }
        ]
    },
    // MUNDO DE LAS ISLAS CANARIAS (BETA)
    
    // GRAN CANARIA
    'canarias_capital': {
        name: '🏙️ Las Palmas de GC',
        description: 'La capital de Gran Canaria, bulliciosa ciudad portuaria',
        worldX: 500, worldY: 200,
        portals: [
            { x: 25, y: 37, targetMap: 'canarias_playa_canteras', targetX: 25, targetY: 5, name: 'Playa de Las Canteras' },
            { x: 35, y: 20, targetMap: 'canarias_puerto', targetX: 5, targetY: 20, name: 'Puerto' }
        ]
    },
    'canarias_playa_canteras': {
        name: '🏖️ Playa de Las Canteras',
        description: 'Hermosa playa urbana con su característica Barra',
        worldX: 500, worldY: 250,
        portals: [
            { x: 25, y: 3, targetMap: 'canarias_capital', targetX: 25, targetY: 35, name: 'Ciudad' },
            { x: 40, y: 20, targetMap: 'canarias_dunas', targetX: 5, targetY: 20, name: 'Dunas de Maspalomas' }
        ]
    },
    'canarias_dunas': {
        name: '🏜️ Dunas de Maspalomas',
        description: 'Impresionante desierto de dunas junto al mar',
        worldX: 550, worldY: 250,
        portals: [
            { x: 3, y: 20, targetMap: 'canarias_playa_canteras', targetX: 38, targetY: 20, name: 'Las Canteras' },
            { x: 25, y: 5, targetMap: 'canarias_roque', targetX: 25, targetY: 35, name: 'Roque Nublo' }
        ]
    },
    'canarias_roque': {
        name: '🗿 Roque Nublo',
        description: 'Formación rocosa emblemática en las montañas',
        worldX: 550, worldY: 200,
        portals: [
            { x: 25, y: 37, targetMap: 'canarias_dunas', targetX: 25, targetY: 7, name: 'Dunas' },
            { x: 10, y: 20, targetMap: 'canarias_capital', targetX: 33, targetY: 20, name: 'Capital' }
        ]
    },
    'canarias_puerto': {
        name: '🚢 Puerto de la Luz',
        description: 'Puerto principal con conexiones a otras islas',
        worldX: 550, worldY: 150,
        portals: [
            { x: 3, y: 20, targetMap: 'canarias_capital', targetX: 33, targetY: 20, name: 'Capital' },
            // Puertos a otras islas
            { x: 45, y: 10, targetMap: 'canarias_tenerife_puerto', targetX: 5, targetY: 20, name: 'Tenerife' },
            { x: 45, y: 20, targetMap: 'canarias_lanzarote_puerto', targetX: 5, targetY: 20, name: 'Lanzarote' },
            { x: 45, y: 30, targetMap: 'canarias_fuerteventura_puerto', targetX: 5, targetY: 20, name: 'Fuerteventura' }
        ]
    },
    
    // TENERIFE
    'canarias_tenerife_puerto': {
        name: '🚢 Puerto de Santa Cruz',
        description: 'Puerto principal de Tenerife',
        worldX: 600, worldY: 150,
        portals: [
            { x: 3, y: 20, targetMap: 'canarias_puerto', targetX: 43, targetY: 10, name: 'Gran Canaria' },
            { x: 25, y: 3, targetMap: 'canarias_tenerife_ciudad', targetX: 25, targetY: 35, name: 'Santa Cruz' }
        ]
    },
    'canarias_tenerife_ciudad': {
        name: '🏙️ Santa Cruz de Tenerife',
        description: 'Capital de Tenerife, ciudad costera llena de vida',
        worldX: 600, worldY: 100,
        portals: [
            { x: 25, y: 37, targetMap: 'canarias_tenerife_puerto', targetX: 25, targetY: 5, name: 'Puerto' },
            { x: 45, y: 20, targetMap: 'canarias_teide', targetX: 5, targetY: 20, name: 'Teide' }
        ]
    },
    'canarias_teide': {
        name: '🌋 Volcán Teide',
        description: 'Imponente volcán, el pico más alto de España',
        worldX: 650, worldY: 100,
        portals: [
            { x: 3, y: 20, targetMap: 'canarias_tenerife_ciudad', targetX: 43, targetY: 20, name: 'Ciudad' },
            { x: 25, y: 25, targetMap: 'canarias_teide_dungeon', targetX: 5, targetY: 5, name: 'Cueva Volcánica', isDoor: true }
        ]
    },
    'canarias_teide_dungeon': {
        name: '🔥 Cueva Volcánica',
        description: 'Peligrosa mazmorra en el interior del volcán',
        worldX: 650, worldY: 130,
        isDungeon: true,
        portals: [
            { x: 5, y: 3, targetMap: 'canarias_teide', targetX: 25, targetY: 23, name: 'Salida', isDoor: true }
        ]
    },
    
    // LANZAROTE
    'canarias_lanzarote_puerto': {
        name: '🚢 Puerto de Arrecife',
        description: 'Puerto principal de Lanzarote',
        worldX: 650, worldY: 200,
        portals: [
            { x: 3, y: 20, targetMap: 'canarias_puerto', targetX: 43, targetY: 20, name: 'Gran Canaria' },
            { x: 25, y: 3, targetMap: 'canarias_lanzarote_ciudad', targetX: 25, targetY: 35, name: 'Arrecife' }
        ]
    },
    'canarias_lanzarote_ciudad': {
        name: '🏙️ Arrecife',
        description: 'Capital de Lanzarote, ciudad con encanto marinero',
        worldX: 650, worldY: 150,
        portals: [
            { x: 25, y: 37, targetMap: 'canarias_lanzarote_puerto', targetX: 25, targetY: 5, name: 'Puerto' },
            { x: 45, y: 20, targetMap: 'canarias_timanfaya', targetX: 5, targetY: 20, name: 'Timanfaya' }
        ]
    },
    'canarias_timanfaya': {
        name: '🌋 Parque Nacional de Timanfaya',
        description: 'Paisaje volcánico espectacular',
        worldX: 700, worldY: 150,
        portals: [
            { x: 3, y: 20, targetMap: 'canarias_lanzarote_ciudad', targetX: 43, targetY: 20, name: 'Ciudad' }
        ]
    },
    
    // FUERTEVENTURA
    'canarias_fuerteventura_puerto': {
        name: '🚢 Puerto del Rosario',
        description: 'Puerto principal de Fuerteventura',
        worldX: 700, worldY: 250,
        portals: [
            { x: 3, y: 20, targetMap: 'canarias_puerto', targetX: 43, targetY: 30, name: 'Gran Canaria' },
            { x: 25, y: 3, targetMap: 'canarias_fuerteventura_ciudad', targetX: 25, targetY: 35, name: 'Ciudad' }
        ]
    },
    'canarias_fuerteventura_ciudad': {
        name: '🏙️ Puerto del Rosario',
        description: 'Capital de Fuerteventura',
        worldX: 700, worldY: 200,
        portals: [
            { x: 25, y: 37, targetMap: 'canarias_fuerteventura_puerto', targetX: 25, targetY: 5, name: 'Puerto' },
            { x: 45, y: 20, targetMap: 'canarias_corralejo', targetX: 5, targetY: 20, name: 'Playas de Corralejo' }
        ]
    },
    'canarias_corralejo': {
        name: '🏝️ Playas de Corralejo',
        description: 'Extensas playas de arena blanca y dunas',
        worldX: 750, worldY: 200,
        portals: [
            { x: 3, y: 20, targetMap: 'canarias_fuerteventura_ciudad', targetX: 43, targetY: 20, name: 'Ciudad' },
            { x: 25, y: 5, targetMap: 'canarias_lobos', targetX: 25, targetY: 35, name: 'Isla de Lobos' }
        ]
    },
    'canarias_lobos': {
        name: '🏝️ Isla de Lobos',
        description: 'Pequeño islote natural protegido',
        worldX: 750, worldY: 150,
        portals: [
            { x: 25, y: 37, targetMap: 'canarias_corralejo', targetX: 25, targetY: 7, name: 'Corralejo' }
        ]
    }
};

// World map connections (which maps are connected)
export const WORLD_CONNECTIONS = [
    // Conexiones de mapas originales
    ['newbie_city', 'newbie_field'],
    ['newbie_field', 'dark_forest'],
    ['field', 'city'],
    ['field', 'dungeon'],
    ['field', 'forest'],
    ['city', 'castle'],
    ['city', 'market'],
    ['dungeon', 'deep_dungeon'],
    ['forest', 'ruins'],
    ['castle', 'throne_room'],
    
    // Conexiones de Islas Canarias
    // Gran Canaria
    ['canarias_capital', 'canarias_playa_canteras'],
    ['canarias_capital', 'canarias_puerto'],
    ['canarias_playa_canteras', 'canarias_dunas'],
    ['canarias_dunas', 'canarias_roque'],
    ['canarias_roque', 'canarias_capital'],
    
    // Conexiones entre islas
    ['canarias_puerto', 'canarias_tenerife_puerto'],
    ['canarias_puerto', 'canarias_lanzarote_puerto'],
    ['canarias_puerto', 'canarias_fuerteventura_puerto'],
    
    // Tenerife
    ['canarias_tenerife_puerto', 'canarias_tenerife_ciudad'],
    ['canarias_tenerife_ciudad', 'canarias_teide'],
    ['canarias_teide', 'canarias_teide_dungeon'],
    
    // Lanzarote
    ['canarias_lanzarote_puerto', 'canarias_lanzarote_ciudad'],
    ['canarias_lanzarote_ciudad', 'canarias_timanfaya'],
    
    // Fuerteventura
    ['canarias_fuerteventura_puerto', 'canarias_fuerteventura_ciudad'],
    ['canarias_fuerteventura_ciudad', 'canarias_corralejo'],
    ['canarias_corralejo', 'canarias_lobos']
];
