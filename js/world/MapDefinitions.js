// Map definitions for complex world system
export const MAP_DEFINITIONS = {
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
    }
};

// World map connections (which maps are connected)
export const WORLD_CONNECTIONS = [
    ['newbie_city', 'newbie_field'],
    ['newbie_field', 'dark_forest'],
    ['field', 'city'],
    ['field', 'dungeon'],
    ['field', 'forest'],
    ['city', 'castle'],
    ['city', 'market'],
    ['dungeon', 'deep_dungeon'],
    ['forest', 'ruins'],
    ['castle', 'throne_room']
];
