// Game configuration
const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 20;  // Celdas visibles horizontalmente
const VIEWPORT_HEIGHT = 13; // Celdas visibles verticalmente
const MAP_WIDTH = 60;       // Mapa total ancho (3x más grande)
const MAP_HEIGHT = 40;      // Mapa total alto (3x más grande)
const MAX_INVENTORY_SLOTS = 9; // Máximo de tipos diferentes de items

// Map definitions for complex world system
const MAP_DEFINITIONS = {
    'field': {
        name: '🏞️ Campo Principal',
        description: 'Campo abierto con caminos hacia otras áreas',
        worldX: 150, worldY: 200, // Position on world map
        portals: [
            { x: 30, y: 20, targetMap: 'city', targetX: 15, targetY: 35, name: 'Ciudad' }, // Ciudad: grass/path walkable
            { x: 45, y: 10, targetMap: 'dungeon', targetX: 5, targetY: 5, name: 'Mazmorra' }, // Mazmorra: floor walkable
            { x: 5, y: 35, targetMap: 'forest', targetX: 25, targetY: 5, name: 'Bosque' } // Bosque: grass/path walkable
        ]
    },
    'city': {
        name: '🏘️ Ciudad Imperial',
        description: 'Ciudad con calles, tiendas y ciudadanos',
        worldX: 250, worldY: 150,
        portals: [
            { x: 15, y: 37, targetMap: 'field', targetX: 30, targetY: 18, name: 'Campo' }, // Campo: grass walkable
            { x: 45, y: 10, targetMap: 'castle', targetX: 10, targetY: 25, name: 'Castillo' }, // Castillo: floor walkable
            { x: 5, y: 5, targetMap: 'market', targetX: 15, targetY: 20, name: 'Mercado' } // Mercado: grass walkable
        ]
    },
    'dungeon': {
        name: '🏰 Mazmorra Antigua',
        description: 'Mazmorra con habitaciones conectadas',
        worldX: 300, worldY: 250,
        portals: [
            { x: 5, y: 3, targetMap: 'field', targetX: 45, targetY: 12, name: 'Campo' }, // Campo: grass walkable
            { x: 20, y: 12, targetMap: 'deep_dungeon', targetX: 5, targetY: 5, name: 'Profundidades' } // Profundidades: floor walkable
        ]
    },
    'forest': {
        name: '🌲 Bosque Encantado',
        description: 'Bosque denso con caminos ocultos',
        worldX: 50, worldY: 120,
        portals: [
            { x: 25, y: 3, targetMap: 'field', targetX: 5, targetY: 37, name: 'Campo' }, // Campo: grass walkable
            { x: 40, y: 30, targetMap: 'ruins', targetX: 10, targetY: 10, name: 'Ruinas' } // Ruinas: grass/floor walkable
        ]
    },
    'castle': {
        name: '🏰 Castillo Real',
        description: 'Castillo majestuoso con salas importantes',
        worldX: 320, worldY: 80,
        portals: [
            { x: 10, y: 27, targetMap: 'city', targetX: 45, targetY: 8, name: 'Ciudad' }, // Ciudad: path/grass walkable
            { x: 35, y: 5, targetMap: 'throne_room', targetX: 15, targetY: 20, name: 'Sala del Trono' } // Sala del Trono: floor walkable
        ]
    },
    'market': {
        name: '🏪 Mercado Central',
        description: 'Mercado bullicioso con comerciantes',
        worldX: 200, worldY: 100,
        portals: [
            { x: 15, y: 22, targetMap: 'city', targetX: 5, targetY: 3, name: 'Ciudad' } // Ciudad: grass walkable
        ]
    },
    'deep_dungeon': {
        name: '🕳️ Profundidades',
        description: 'Zonas profundas y peligrosas de la mazmorra',
        worldX: 350, worldY: 280,
        portals: [
            { x: 5, y: 3, targetMap: 'dungeon', targetX: 20, targetY: 14, name: 'Mazmorra' } // Mazmorra: floor walkable
        ]
    },
    'ruins': {
        name: '🏛️ Ruinas Antiguas',
        description: 'Ruinas olvidadas con secretos del pasado',
        worldX: 80, worldY: 50,
        portals: [
            { x: 10, y: 8, targetMap: 'forest', targetX: 40, targetY: 32, name: 'Bosque' } // Bosque: grass walkable
        ]
    },
    'throne_room': {
        name: '👑 Sala del Trono',
        description: 'Sala real con el trono del rey',
        worldX: 350, worldY: 30,
        portals: [
            { x: 15, y: 22, targetMap: 'castle', targetX: 35, targetY: 3, name: 'Castillo' } // Castillo: floor walkable
        ]
    }
};

// World map connections (which maps are connected)
const WORLD_CONNECTIONS = [
    ['field', 'city'],
    ['field', 'dungeon'],
    ['field', 'forest'],
    ['city', 'castle'],
    ['city', 'market'],
    ['dungeon', 'deep_dungeon'],
    ['forest', 'ruins'],
    ['castle', 'throne_room']
];

// Game state
const gameState = {
    currentMap: 'field', // Current map type
    player: {
        x: 10,
        y: 7,
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        gold: 0,
        inventory: [], // Array de {type, name, quantity, icon, equipped?}
        equipped: {
            weapon: null, // Item equipado como arma
            shield: null, // Item equipado como escudo
            ammunition: null // Flechas equipadas (requiere arco)
        },
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        facing: 'down' // Dirección a la que mira el jugador
    },
    stats: {
        enemiesKilled: 0,
        chestsOpened: 0
    },
    map: [],
    objects: [],
    enemies: [],
    projectiles: [] // Flechas y otros proyectiles volando
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Generate simple pixel art sprites
function createSprite(width, height, drawFunction) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    const spriteCtx = spriteCanvas.getContext('2d');
    drawFunction(spriteCtx, width, height);
    return spriteCanvas;
}

// Sprite definitions
const sprites = {
    grass: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#3a6b1f';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            ctx.fillRect(x, y, 2, 2);
        }
    }),
    
    water: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(4, 4, w-8, h-8);
    }),
    
    stone: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(2, 2, w-4, h-4);
        ctx.fillStyle = '#374151';
        ctx.fillRect(w/2-2, h/2-2, 4, 4);
    }),
    
    tree: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Trunk
        ctx.fillStyle = '#654321';
        ctx.fillRect(w/2-3, h/2, 6, h/2);
        // Leaves
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.arc(w/2, h/3, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#32cd32';
        ctx.beginPath();
        ctx.arc(w/2-3, h/3-2, 8, 0, Math.PI * 2);
        ctx.fill();
    }),

    // Solid wall sprites (for borders and buildings)
    wall: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(2, 2, w-4, h-4);
        ctx.fillStyle = '#374151';
        ctx.fillRect(w/2-2, h/2-2, 4, 4);
    }),

    building: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#a16207';
        ctx.fillRect(2, 2, w-4, h-4);
        // Windows
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(4, 4, 4, 4);
        ctx.fillRect(w-8, 4, 4, 4);
        ctx.fillRect(4, h-8, 4, 4);
        ctx.fillRect(w-8, h-8, 4, 4);
    }),

    floor: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#374151';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(2, 2, w-4, h-4);
        // Stone pattern
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(4, 4, 4, 4);
        ctx.fillRect(w-8, 4, 4, 4);
        ctx.fillRect(4, h-8, 4, 4);
        ctx.fillRect(w-8, h-8, 4, 4);
    }),

    dungeonWall: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#374151';
        ctx.fillRect(2, 2, w-4, h-4);
        ctx.fillStyle = '#111827';
        ctx.fillRect(w/2-2, h/2-2, 4, 4);
    }),

    // Portal and path sprites
    portal: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Magical portal - swirling colors
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/2-2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/4, 0, Math.PI * 2);
        ctx.fill();
        // Center glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(w/2, h/2, 3, 0, Math.PI * 2);
        ctx.fill();
    }),

    dungeonDoor: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Dark dungeon door
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#374151';
        ctx.fillRect(2, 2, w-4, h-4);
        // Door handle
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w-6, h/2, 3, 0, Math.PI * 2);
        ctx.fill();
        // Warning symbol
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-2, 4, 4, 2);
        ctx.fillRect(w/2-1, 6, 2, 6);
    }),

    path: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Dirt path
        ctx.fillStyle = '#a16207';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(2, 2, w-4, h-4);
        // Stones on path
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(4, 4, 3, 3);
        ctx.fillRect(w-7, h-7, 3, 3);
        ctx.fillRect(w/2-1, h/2-1, 3, 3);
    }),
    
    player: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Body
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        // Head
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-4, h/4-2, 2, 2);
        ctx.fillRect(w/2+2, h/4-2, 2, 2);
        // Sword
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(w/4-6, h/2, 3, h/3);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(w/4-7, h/2-3, 5, 3);
    }),
    
    chest: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/4, h/2, w/2, h/3);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2-2, h/2+h/6-2, 4, 4);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.strokeRect(w/4, h/2, w/2, h/3);
    }),
    
    enemy: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Body (goblin)
        ctx.fillStyle = '#15803d';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        // Head
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
        ctx.fill();
        // Eyes (red)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-4, h/4-2, 2, 2);
        ctx.fillRect(w/2+2, h/4-2, 2, 2);
    }),

    enemySkeleton: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Skeleton - bones and skull
        ctx.fillStyle = '#f5f5dc'; // Bone white
        ctx.fillRect(w/2-2, h/2-6, 4, 12); // Spine
        ctx.fillRect(w/2-6, h/2-2, 12, 4); // Ribs
        // Skull
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/6, 0, Math.PI * 2);
        ctx.fill();
        // Eyes (dark)
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-3, h/4-1, 2, 2);
        ctx.fillRect(w/2+1, h/4-1, 2, 2);
    }),

    enemyTroll: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Troll - big and green
        ctx.fillStyle = '#166534'; // Dark green
        ctx.fillRect(w/6, h/4, w*2/3, h/2);
        // Head
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
        ctx.fill();
        // Eyes (yellow)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2-4, h/6-2, 3, 3);
        ctx.fillRect(w/2+1, h/6-2, 3, 3);
        // Tusks
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(w/2-3, h/6+2, 2, 4);
        ctx.fillRect(w/2+1, h/6+2, 2, 4);
    }),

    enemyDragon: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Small dragon - wings and scales
        ctx.fillStyle = '#7c2d12'; // Brown scales
        ctx.fillRect(w/4, h/3, w/2, h/3);
        // Wings
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w/6, h/4, w/3, h/4);
        ctx.fillRect(w/2, h/4, w/3, h/4);
        // Head with horns
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(w/2, h/6, w/5, 0, Math.PI * 2);
        ctx.fill();
        // Eyes (red glow)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-3, h/6-1, 2, 2);
        ctx.fillRect(w/2+1, h/6-1, 2, 2);
        // Horns
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-4, h/6-4, 2, 4);
        ctx.fillRect(w/2+2, h/6-4, 2, 4);
    }),

    enemyElemental: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Fire elemental - flames
        ctx.fillStyle = '#dc2626'; // Red base
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/3, 0, Math.PI * 2);
        ctx.fill();
        // Flame spikes
        ctx.fillStyle = '#ea580c'; // Orange flames
        ctx.beginPath();
        ctx.moveTo(w/2, h/6);
        ctx.lineTo(w/2-3, h/3);
        ctx.lineTo(w/2+3, h/3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w/2-4, h/2);
        ctx.lineTo(w/2-2, h/4);
        ctx.lineTo(w/2, h/2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w/2+4, h/2);
        ctx.lineTo(w/2+2, h/4);
        ctx.lineTo(w/2, h/2);
        ctx.fill();
        // Core
        ctx.fillStyle = '#fbbf24'; // Yellow core
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/6, 0, Math.PI * 2);
        ctx.fill();
    }),

    enemyDemon: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Demon - horns and red skin
        ctx.fillStyle = '#7f1d1d'; // Dark red
        ctx.fillRect(w/4, h/3, w/2, h/2);
        // Head
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(w/2, h/5, w/4, 0, Math.PI * 2);
        ctx.fill();
        // Horns
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-5, h/5-6, 3, 6);
        ctx.fillRect(w/2+2, h/5-6, 3, 6);
        // Eyes (glowing)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(w/2-4, h/5-2, 3, 3);
        ctx.fillRect(w/2+1, h/5-2, 3, 3);
        // Wings outline
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/2-2, Math.PI * 0.7, Math.PI * 0.3);
        ctx.stroke();
    }),
    
    gold: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w/2, h/2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(w/2, h/2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2-2, h/2-1, 4, 2);
    }),
    
    // Items del Argentum Online
    potion: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Botella roja (HP)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-4, h/2-2, 8, 10);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(w/2-3, h/2+3, 6, 2);
        // Corcho
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/2-2, h/2-4, 4, 3);
    }),
    
    potionBlue: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Botella azul (Mana)
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(w/2-4, h/2-2, 8, 10);
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(w/2-3, h/2+3, 6, 2);
        // Corcho
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/2-2, h/2-4, 4, 3);
    }),
    
    potionGreen: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Botella verde (Antídoto)
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(w/2-4, h/2-2, 8, 10);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(w/2-3, h/2+3, 6, 2);
        // Corcho
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/2-2, h/2-4, 4, 3);
    }),
    
    arrow: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Flecha
        ctx.fillStyle = '#78350f';
        ctx.fillRect(w/2-1, h/2-6, 2, 12);
        // Punta
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(w/2, h/2-8);
        ctx.lineTo(w/2-3, h/2-3);
        ctx.lineTo(w/2+3, h/2-3);
        ctx.fill();
        // Plumas
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(w/2-2, h/2+4, 4, 2);
    }),
    
    sword: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Espada
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(w/2-2, h/2-8, 4, 12);
        // Guarda
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2-4, h/2-2, 8, 2);
        // Empuñadura
        ctx.fillStyle = '#78350f';
        ctx.fillRect(w/2-2, h/2, 4, 4);
    }),
    
    shield: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Escudo
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(w/2, h/2, 10, 0, Math.PI * 2);
        ctx.fill();
        // Borde dorado
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 10, 0, Math.PI * 2);
        ctx.stroke();
        // Cruz
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(w/2-1, h/2-6, 2, 12);
        ctx.fillRect(w/2-6, h/2-1, 12, 2);
    }),

    bow: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Arco
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 8, Math.PI * 0.3, Math.PI * 0.7);
        ctx.stroke();
        // Cuerda
        ctx.strokeStyle = '#f5f5dc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w/2 + Math.cos(Math.PI * 0.3) * 8, h/2 + Math.sin(Math.PI * 0.3) * 8);
        ctx.lineTo(w/2 + Math.cos(Math.PI * 0.7) * 8, h/2 + Math.sin(Math.PI * 0.7) * 8);
        ctx.stroke();
        // Empuñadura
        ctx.fillStyle = '#654321';
        ctx.fillRect(w/2-1, h/2+2, 3, 6);
    }),

    arrowProjectile: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        // Flecha volando (proyectil)
        ctx.fillStyle = '#654321';
        ctx.fillRect(w/2-1, h/2-8, 2, 16);
        // Punta
        ctx.fillStyle = '#c0c0c0';
        ctx.beginPath();
        ctx.moveTo(w/2, h/2-10);
        ctx.lineTo(w/2-2, h/2-6);
        ctx.lineTo(w/2+2, h/2-6);
        ctx.fill();
        // Plumas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w/2-1, h/2+6, 2, 2);
    })
};

// Item types (inspirado en Argentum Online)
const ITEM_TYPES = {
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

// Tile types
const TILES = {
    GRASS: 0,
    WATER: 1,
    STONE: 2,
    TREE: 3,
    WALL: 4,      // Solid walls for city/dungeon borders
    BUILDING: 5,  // Buildings in city
    FLOOR: 6,     // Dungeon floor
    DUNGEON_WALL: 7, // Dungeon walls
    PATH: 8       // Dirt paths to other areas
};

// Generate map based on current map type
function generateMap() {
    const mapDefinition = MAP_DEFINITIONS[gameState.currentMap];

    if (!mapDefinition) {
        // Fallback to field if map not found
        return generateFieldMap();
    }

    switch (gameState.currentMap) {
        case 'field':
            return generateFieldMap();
        case 'city':
            return generateCityMap();
        case 'dungeon':
            return generateDungeonMap();
        case 'forest':
            return generateForestMap();
        case 'castle':
            return generateCastleMap();
        case 'market':
            return generateMarketMap();
        case 'deep_dungeon':
            return generateDeepDungeonMap();
        case 'ruins':
            return generateRuinsMap();
        case 'throne_room':
            return generateThroneRoomMap();
        default:
            return generateFieldMap();
    }
}

// Generate field map (outdoor area) - CORRECT ORDER: terrain -> obstacles
function generateFieldMap() {
    const map = [];

    // 1. Create base terrain (borders and ground)
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Base terrain is walkable grass
                row.push(TILES.GRASS);
            }
        }
        map.push(row);
    }

    // 2. Add obstacles (trees, stones) - these block movement AFTER terrain is set
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            if (Math.random() < 0.05) {
                map[y][x] = TILES.TREE;
            } else if (Math.random() < 0.02) {
                map[y][x] = TILES.STONE;
            }
            // Leave some areas as paths for better navigation
        }
    }

    return map;
}

// Generate city map (buildings and streets)
function generateCityMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // City streets every 8 columns and 6 rows
                if (x % 8 === 0 || y % 6 === 0) {
                    row.push(TILES.PATH); // Streets
                } else if (Math.random() < 0.4) {
                    row.push(TILES.BUILDING); // Buildings
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }
    return map;
}

// Generate forest map (dense woods)
function generateForestMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Dense forest with many trees
                if (Math.random() < 0.3) {
                    row.push(TILES.TREE);
                } else if (Math.random() < 0.05) {
                    row.push(TILES.STONE);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }

    // Create a path through the forest
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x >= 0 && x < MAP_WIDTH && 20 >= 0 && 20 < MAP_HEIGHT) {
            map[20][x] = TILES.PATH;
        }
    }

    return map;
}

// Generate castle map (castle interior)
function generateCastleMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else if (x <= 2 || x >= MAP_WIDTH - 3 || y <= 2 || y >= MAP_HEIGHT - 3) {
                // Castle walls
                row.push(TILES.WALL);
            } else {
                row.push(TILES.FLOOR);
            }
        }
        map.push(row);
    }

    // Create castle interior rooms
    // Throne room area
    for (let y = 15; y < 25; y++) {
        for (let x = MAP_WIDTH - 15; x < MAP_WIDTH - 5; x++) {
            if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
                map[y][x] = TILES.FLOOR;
            }
        }
    }

    return map;
}

// Generate market map (open market area)
function generateMarketMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Market stalls (buildings) in a grid
                if ((x % 6 === 3 || y % 4 === 2) && Math.random() < 0.6) {
                    row.push(TILES.BUILDING);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }
    return map;
}

// Generate deep dungeon map (more dangerous dungeon)
function generateDeepDungeonMap() {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = TILES.DUNGEON_WALL;
        }
    }
    generateConnectedDungeon(map, { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT });
    return map;
}

// Generate ruins map (ancient ruins)
function generateRuinsMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else {
                // Ruins with scattered walls and floors
                const rand = Math.random();
                if (rand < 0.1) {
                    row.push(TILES.WALL); // Ruined walls
                } else if (rand < 0.3) {
                    row.push(TILES.FLOOR); // Ruined floors
                } else if (rand < 0.35) {
                    row.push(TILES.STONE);
                } else {
                    row.push(TILES.GRASS);
                }
            }
        }
        map.push(row);
    }

    // Create some paths through the ruins
    for (let x = 10; x < MAP_WIDTH - 10; x++) {
        if (x >= 0 && x < MAP_WIDTH && 15 >= 0 && 15 < MAP_HEIGHT) {
            map[15][x] = TILES.PATH;
        }
    }

    return map;
}

// Generate dungeon map (main dungeon level)
function generateDungeonMap() {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = TILES.DUNGEON_WALL;
        }
    }
    generateConnectedDungeon(map, { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT });
    return map;
}

// Generate throne room map (king's throne room)
function generateThroneRoomMap() {
    const map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            } else if (x <= 3 || x >= MAP_WIDTH - 4 || y <= 3 || y >= MAP_HEIGHT - 4) {
                // Throne room walls
                row.push(TILES.WALL);
            } else {
                row.push(TILES.FLOOR);
            }
        }
        map.push(row);
    }

    // Throne area in the center
    const throneX = Math.floor(MAP_WIDTH / 2);
    const throneY = Math.floor(MAP_HEIGHT / 2);
    if (throneX >= 0 && throneX < MAP_WIDTH && throneY >= 0 && throneY < MAP_HEIGHT) {
        map[throneY][throneX] = TILES.FLOOR; // Throne position
    }

    return map;
}

// Generate connected dungeon with guaranteed accessibility
function generateConnectedDungeon(map, bounds) {
    // Initialize with walls
    for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
        for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
            if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                map[y][x] = TILES.DUNGEON_WALL;
            }
        }
    }

    const rooms = [];
    const minRoomSize = 3;
    const maxRoomSize = 6;

    // Create rooms with guaranteed spacing
    for (let attempts = 0; attempts < 20 && rooms.length < 8; attempts++) {
        const roomW = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
        const roomH = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));

        const roomX = bounds.x + 2 + Math.floor(Math.random() * (bounds.width - roomW - 4));
        const roomY = bounds.y + 2 + Math.floor(Math.random() * (bounds.height - roomH - 4));

        // Check if room fits and doesn't overlap existing rooms
        let canPlace = true;
        for (let y = roomY - 1; y < roomY + roomH + 1 && canPlace; y++) {
            for (let x = roomX - 1; x < roomX + roomW + 1 && canPlace; x++) {
                if (x >= bounds.x && x < bounds.x + bounds.width &&
                    y >= bounds.y && y < bounds.y + bounds.height) {
                    if (map[y][x] === TILES.FLOOR) {
                        canPlace = false;
                    }
                }
            }
        }

        if (canPlace) {
            // Carve the room
            for (let y = roomY; y < roomY + roomH; y++) {
                for (let x = roomX; x < roomX + roomW; x++) {
                    if (x >= bounds.x && x < bounds.x + bounds.width &&
                        y >= bounds.y && y < bounds.y + bounds.height) {
                        map[y][x] = TILES.FLOOR;
                    }
                }
            }

            // Store room center for connecting
            const centerX = Math.floor(roomX + roomW / 2);
            const centerY = Math.floor(roomY + roomH / 2);
            rooms.push({ x: centerX, y: centerY });
        }
    }

    // Ensure we have at least 3 rooms
    if (rooms.length < 3) {
        // Create minimum rooms if needed
        const forcedRooms = [
            { x: bounds.x + 3, y: bounds.y + 3, w: 4, h: 4 },
            { x: bounds.x + bounds.width - 7, y: bounds.y + 3, w: 4, h: 4 },
            { x: bounds.x + Math.floor(bounds.width / 2) - 2, y: bounds.y + bounds.height - 7, w: 4, h: 4 }
        ];

        for (const room of forcedRooms) {
            for (let y = room.y; y < room.y + room.h; y++) {
                for (let x = room.x; x < room.x + room.w; x++) {
                    if (x >= bounds.x && x < bounds.x + bounds.width &&
                        y >= bounds.y && y < bounds.y + bounds.height) {
                        map[y][x] = TILES.FLOOR;
                    }
                }
            }
            rooms.push({ x: room.x + Math.floor(room.w / 2), y: room.y + Math.floor(room.h / 2) });
        }
    }

    // Connect all rooms with corridors (minimum spanning tree approach)
    if (rooms.length > 1) {
        // Start with first room
        const connected = new Set([0]);

        while (connected.size < rooms.length) {
            let bestDistance = Infinity;
            let bestConnection = null;

            // Find closest unconnected room to any connected room
            for (const connectedIdx of connected) {
                for (let i = 0; i < rooms.length; i++) {
                    if (!connected.has(i)) {
                        const dist = Math.abs(rooms[connectedIdx].x - rooms[i].x) +
                                   Math.abs(rooms[connectedIdx].y - rooms[i].y);
                        if (dist < bestDistance) {
                            bestDistance = dist;
                            bestConnection = { from: connectedIdx, to: i };
                        }
                    }
                }
            }

            if (bestConnection) {
                // Connect the rooms
                connectRooms(map, rooms[bestConnection.from], rooms[bestConnection.to], bounds);
                connected.add(bestConnection.to);
            } else {
                break; // No more connections possible
            }
        }
    }

    // Create entrance from main path (bottom of dungeon zone)
    const entranceY = bounds.y + bounds.height - 1;
    const entranceX = Math.floor(bounds.x + bounds.width / 2);

    if (entranceX >= bounds.x && entranceX < bounds.x + bounds.width &&
        entranceY >= bounds.y && entranceY < bounds.y + bounds.height) {

        // Find nearest room to connect to entrance
        let nearestRoom = null;
        let minDistance = Infinity;

        for (const room of rooms) {
            const dist = Math.abs(room.x - entranceX) + Math.abs(room.y - entranceY);
            if (dist < minDistance) {
                minDistance = dist;
                nearestRoom = room;
            }
        }

        if (nearestRoom) {
            // Connect entrance to nearest room
            connectRooms(map, { x: entranceX, y: entranceY }, nearestRoom, bounds);
        }
    }
}

// Connect two points with a corridor (minimum 2 tiles wide for better gameplay)
function connectRooms(map, point1, point2, bounds) {
    const corridorWidth = 2; // Minimum 2 tiles wide

    // Horizontal corridor first (made wider)
    const startX = Math.min(point1.x, point2.x);
    const endX = Math.max(point1.x, point2.x);

    for (let x = startX; x <= endX; x++) {
        for (let w = 0; w < corridorWidth; w++) {
            const corridorY = point1.y + w - Math.floor(corridorWidth / 2);
            if (x >= bounds.x && x < bounds.x + bounds.width &&
                corridorY >= bounds.y && corridorY < bounds.y + bounds.height) {
                map[corridorY][x] = TILES.FLOOR;
            }
        }
    }

    // Vertical corridor (made wider)
    const startY = Math.min(point1.y, point2.y);
    const endY = Math.max(point1.y, point2.y);

    for (let y = startY; y <= endY; y++) {
        for (let w = 0; w < corridorWidth; w++) {
            const corridorX = point2.x + w - Math.floor(corridorWidth / 2);
            if (corridorX >= bounds.x && corridorX < bounds.x + bounds.width &&
                y >= bounds.y && y < bounds.y + bounds.height) {
                map[y][corridorX] = TILES.FLOOR;
            }
        }
    }

    // Ensure the intersection area is fully connected (L-shaped connection)
    const intersectionX = point2.x;
    const intersectionY = point1.y;

    for (let dx = -Math.floor(corridorWidth / 2); dx <= Math.floor(corridorWidth / 2); dx++) {
        for (let dy = -Math.floor(corridorWidth / 2); dy <= Math.floor(corridorWidth / 2); dy++) {
            const ix = intersectionX + dx;
            const iy = intersectionY + dy;
            if (ix >= bounds.x && ix < bounds.x + bounds.width &&
                iy >= bounds.y && iy < bounds.y + bounds.height) {
                map[iy][ix] = TILES.FLOOR;
            }
        }
    }
}

// Create walkable paths connecting the different zones
function createConnectingPaths(map) {
    // Path from field center to city entrance
    const fieldCenterX = Math.floor(ZONE_BOUNDARIES.field.x + ZONE_BOUNDARIES.field.width / 2);
    const fieldCenterY = Math.floor(ZONE_BOUNDARIES.field.y + ZONE_BOUNDARIES.field.height / 2);
    const cityEntranceX = ZONE_BOUNDARIES.city.x;
    const cityEntranceY = Math.floor(ZONE_BOUNDARIES.city.y + ZONE_BOUNDARIES.city.height / 2);

    drawPath(map, fieldCenterX, fieldCenterY, cityEntranceX, cityEntranceY, TILES.PATH);

    // Path from city to dungeon
    const cityCenterX = Math.floor(ZONE_BOUNDARIES.city.x + ZONE_BOUNDARIES.city.width / 2);
    const cityCenterY = Math.floor(ZONE_BOUNDARIES.city.y + ZONE_BOUNDARIES.city.height / 2);
    const dungeonEntranceX = Math.floor(ZONE_BOUNDARIES.dungeon.x + ZONE_BOUNDARIES.dungeon.width / 2);
    const dungeonEntranceY = ZONE_BOUNDARIES.dungeon.y + ZONE_BOUNDARIES.dungeon.height - 1;

    drawPath(map, cityCenterX, cityCenterY, dungeonEntranceX, dungeonEntranceY, TILES.PATH);
}

// Draw a path between two points
function drawPath(map, startX, startY, endX, endY, tileType) {
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = startX < endX ? 1 : -1;
    const sy = startY < endY ? 1 : -1;
    let err = dx - dy;

    let x = startX;
    let y = startY;

    while (true) {
        if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
            // Only draw path if it's not replacing important structures
            if (map[y][x] === TILES.GRASS || map[y][x] === TILES.DUNGEON_WALL) {
                map[y][x] = tileType;
            }
        }

        if (x === endX && y === endY) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}



// Check if point is on line between two points (with some width)
function isOnLine(x, y, x1, y1, x2, y2, width = 1) {
    const distToLine = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
                     Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);

    // Check if point is within width of the line
    if (distToLine <= width) {
        // Check if point is between the two endpoints
        const minX = Math.min(x1, x2) - width;
        const maxX = Math.max(x1, x2) + width;
        const minY = Math.min(y1, y2) - width;
        const maxY = Math.max(y1, y2) + width;

        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }
    return false;
}

// Find a safe walkable position for placing objects/portals
function findSafeWalkablePosition(preferredX, preferredY, maxAttempts = 50) {
    // First, try the preferred position
    if (isWalkable(preferredX, preferredY)) {
        return { x: preferredX, y: preferredY };
    }

    // Search in expanding circles around preferred position
    for (let radius = 1; radius < 10; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                    const x = preferredX + dx;
                    const y = preferredY + dy;

                    if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
                        if (isWalkable(x, y)) {
                            return { x, y };
                        }
                    }
                }
            }
        }
    }

    // Last resort: find ANY walkable position
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
        const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;

        if (isWalkable(x, y)) {
            return { x, y };
        }
    }

    return null; // Failed to find position
}

// Generate objects (chests, gold, items) based on current map
function generateObjects() {
    const objects = [];

    if (gameState.currentMap === 'field') {
        // Field map - outdoor exploration
        // Add chests (AO style)
        for (let i = 0; i < 15; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            objects.push({
                type: 'chest',
                x: x,
                y: y,
                opened: false,
                contains: { gold: Math.floor(Math.random() * 50) + 20 }
            });
        }

        // Add gold coins
        for (let i = 0; i < 25; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            objects.push({
                type: 'gold',
                x: x,
                y: y,
                amount: Math.floor(Math.random() * 20) + 5
            });
        }

    } else if (gameState.currentMap === 'city') {
        // City map - urban area with buildings
        // Add some chests in safe spots
        for (let i = 0; i < 5; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            objects.push({
                type: 'chest',
                x: x,
                y: y,
                opened: false,
                contains: { gold: Math.floor(Math.random() * 30) + 10 }
            });
        }

        // No portals needed - zones are connected by walkable paths



    } else if (gameState.currentMap === 'dungeon') {
        // Dungeon map - dangerous area with better loot
        // Add better chests
        for (let i = 0; i < 10; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] === TILES.FLOOR); // Only on floor tiles

            objects.push({
                type: 'chest',
                x: x,
                y: y,
                opened: false,
                contains: { gold: Math.floor(Math.random() * 100) + 50 }
            });
        }

        // Add gold coins
        for (let i = 0; i < 15; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] === TILES.FLOOR);

            objects.push({
                type: 'gold',
                x: x,
                y: y,
                amount: Math.floor(Math.random() * 30) + 10
            });
        }

        // No portals needed - zones are connected by walkable paths
    }

    // Add portals for current map - PLACE IN SAFE WALKABLE POSITIONS
    const mapDef = MAP_DEFINITIONS[gameState.currentMap];
    if (mapDef && mapDef.portals) {
        for (const portal of mapDef.portals) {
            // Find safe position for portal (starting from preferred position)
            const safePos = findSafeWalkablePosition(portal.x, portal.y);
            
            if (safePos) {
                // Ensure target position is also walkable
                const originalCurrentMap = gameState.currentMap;
                gameState.currentMap = portal.targetMap;
                const targetMapData = generateMap();
                gameState.currentMap = originalCurrentMap;
                
                let targetX = portal.targetX;
                let targetY = portal.targetY;
                
                if (!isWalkableOnMap(targetMapData, targetX, targetY)) {
                    const safeTarget = findNearestWalkableTile(targetMapData, targetX, targetY);
                    if (safeTarget) {
                        targetX = safeTarget.x;
                        targetY = safeTarget.y;
                    }
                }
                
                objects.push({
                    type: 'portal',
                    portalId: `portal_to_${portal.targetMap}`,
                    x: safePos.x,
                    y: safePos.y,
                    targetMap: portal.targetMap,
                    targetX: targetX,
                    targetY: targetY,
                    name: portal.name
                });
            } else {
                console.warn(`No se pudo encontrar posición segura para portal a ${portal.name}`);
            }
        }
    }

    // Add items on ground (different amounts per map)
    const itemTypes = Object.keys(ITEM_TYPES);
    let itemCount = 40; // Default for field

    if (gameState.currentMap === 'city') itemCount = 20; // Fewer in city
    if (gameState.currentMap === 'dungeon') itemCount = 30; // More in dungeon
    if (['forest', 'castle', 'market'].includes(gameState.currentMap)) itemCount = 25;
    if (['deep_dungeon', 'ruins', 'throne_room'].includes(gameState.currentMap)) itemCount = 35;

    const maxAttempts = 50;

    for (let i = 0; i < itemCount; i++) {
        let foundSpot = false;
        let attempts = 0;

        while (!foundSpot && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;

            // Check appropriate walkable tile for each map
            let validTile = false;
            if (['field', 'forest', 'ruins'].includes(gameState.currentMap) && gameState.map[y][x] === TILES.GRASS) {
                validTile = true;
            } else if (['city', 'market'].includes(gameState.currentMap) && gameState.map[y][x] === TILES.GRASS) {
                validTile = true;
            } else if (['castle', 'throne_room'].includes(gameState.currentMap) && gameState.map[y][x] === TILES.FLOOR) {
                validTile = true;
            } else if (['dungeon', 'deep_dungeon'].includes(gameState.currentMap) && gameState.map[y][x] === TILES.FLOOR) {
                validTile = true;
            }

            if (validTile) {
                const hasObject = objects.some(obj => obj.x === x && obj.y === y);
                if (!hasObject) {
                    const randomItemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                    const itemDef = ITEM_TYPES[randomItemType];

                    objects.push({
                        type: 'item',
                        itemType: randomItemType,
                        x: x,
                        y: y,
                        quantity: itemDef.stackable ? Math.floor(Math.random() * 5) + 1 : 1
                    });
                    foundSpot = true;
                }
            }
            attempts++;
        }
    }

    return objects;
}

// Generate enemies based on current map
function generateEnemies() {
    const enemies = [];

    if (gameState.currentMap === 'field') {
        // Field - mix of goblins and skeletons
        const enemyTypes = ['goblin', 'skeleton'];
        for (let i = 0; i < 25; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = getEnemyStats(enemyType);

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (gameState.currentMap === 'city') {
        // City - bandits and elementals
        const enemyTypes = ['bandit', 'elemental'];
        for (let i = 0; i < 8; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] === TILES.GRASS); // Avoid buildings

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = getEnemyStats(enemyType);

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (gameState.currentMap === 'dungeon') {
        // Dungeon - orcs and trolls
        const enemyTypes = ['orc', 'troll'];
        for (let i = 0; i < 20; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = getEnemyStats(enemyType);

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (gameState.currentMap === 'forest') {
        // Forest - goblins, skeletons, and elementals
        const enemyTypes = ['goblin', 'skeleton', 'elemental'];
        for (let i = 0; i < 18; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.GRASS);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = getEnemyStats(enemyType);

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (gameState.currentMap === 'castle') {
        // Castle - bandits and demons
        const enemyTypes = ['bandit', 'demon'];
        for (let i = 0; i < 12; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = getEnemyStats(enemyType);

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (gameState.currentMap === 'deep_dungeon') {
        // Deep dungeon - trolls, demons, and dragons
        const enemyTypes = ['troll', 'demon', 'dragon'];
        for (let i = 0; i < 15; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = getEnemyStats(enemyType);

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (gameState.currentMap === 'ruins') {
        // Ruins - skeletons, demons, and elementals
        const enemyTypes = ['skeleton', 'demon', 'elemental'];
        for (let i = 0; i < 16; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] === TILES.GRASS || gameState.map[y][x] === TILES.FLOOR);

            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyStats = getEnemyStats(enemyType);

            enemies.push({
                type: enemyType,
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    } else if (gameState.currentMap === 'throne_room') {
        // Throne room - only dragons as bosses
        for (let i = 0; i < 3; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (gameState.map[y][x] !== TILES.FLOOR);

            const enemyStats = getEnemyStats('dragon');

            enemies.push({
                type: 'dragon',
                x: x,
                y: y,
                hp: enemyStats.hp,
                maxHp: enemyStats.hp,
                lastMoveTime: 0,
                moveDelay: enemyStats.moveDelay,
                lastAttackTime: 0,
                attackDelay: enemyStats.attackDelay,
                damage: enemyStats.damage,
                goldDrop: enemyStats.goldDrop,
                expReward: enemyStats.expReward
            });
        }
    }

    return enemies;
}

// Get enemy stats by type
function getEnemyStats(enemyType) {
    const enemyStats = {
        goblin: {
            hp: 30,
            moveDelay: 800 + Math.random() * 400,
            attackDelay: 2000,
            damage: { min: 5, max: 10 },
            goldDrop: { min: 10, max: 20 },
            expReward: 40
        },
        skeleton: {
            hp: 25,
            moveDelay: 900 + Math.random() * 300,
            attackDelay: 1800,
            damage: { min: 4, max: 9 },
            goldDrop: { min: 8, max: 18 },
            expReward: 35
        },
        bandit: {
            hp: 20,
            moveDelay: 1000 + Math.random() * 500,
            attackDelay: 2500,
            damage: { min: 3, max: 8 },
            goldDrop: { min: 15, max: 25 },
            expReward: 25
        },
        orc: {
            hp: 50,
            moveDelay: 600 + Math.random() * 300,
            attackDelay: 1500,
            damage: { min: 8, max: 15 },
            goldDrop: { min: 20, max: 40 },
            expReward: 80
        },
        troll: {
            hp: 120,
            moveDelay: 500 + Math.random() * 200,
            attackDelay: 1200,
            damage: { min: 15, max: 25 },
            goldDrop: { min: 50, max: 100 },
            expReward: 200
        },
        dragon: {
            hp: 200,
            moveDelay: 400 + Math.random() * 100,
            attackDelay: 1000,
            damage: { min: 20, max: 35 },
            goldDrop: { min: 100, max: 200 },
            expReward: 500
        },
        elemental: {
            hp: 60,
            moveDelay: 700 + Math.random() * 300,
            attackDelay: 1600,
            damage: { min: 12, max: 20 },
            goldDrop: { min: 25, max: 45 },
            expReward: 100
        },
        demon: {
            hp: 80,
            moveDelay: 550 + Math.random() * 200,
            attackDelay: 1300,
            damage: { min: 18, max: 28 },
            goldDrop: { min: 30, max: 60 },
            expReward: 150
        }
    };

    return enemyStats[enemyType] || enemyStats.goblin;
}

// Check if tile is walkable
function isWalkable(x, y) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;

    const tile = gameState.map[y][x];

    // Solid walls are not walkable
    if (tile === TILES.WALL || tile === TILES.BUILDING || tile === TILES.DUNGEON_WALL) {
        return false;
    }

    // Walkable tiles: grass, floor, and paths
    return tile === TILES.GRASS || tile === TILES.FLOOR || tile === TILES.PATH;
}

// Add message to chat
function addChatMessage(type, message) {
    const chatLog = document.getElementById('chatLog');
    const p = document.createElement('p');
    p.innerHTML = `<span class="${type}">${type === 'system' ? 'Sistema' : 'Jugador'}:</span> ${message}`;
    chatLog.appendChild(p);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Level up system
function levelUp() {
    gameState.player.level++;
    gameState.player.exp = 0;
    gameState.player.expToNextLevel = Math.floor(gameState.player.expToNextLevel * 1.5);
    
    // Increase stats on level up
    const hpIncrease = 20;
    const manaIncrease = 10;
    
    gameState.player.maxHp += hpIncrease;
    gameState.player.hp = gameState.player.maxHp; // Full heal on level up
    gameState.player.maxMana += manaIncrease;
    gameState.player.mana = gameState.player.maxMana;
    
    addChatMessage('system', `🎉 ¡NIVEL ${gameState.player.level}! +${hpIncrease} HP máx, +${manaIncrease} Maná máx`);
    updateUI();
}

// Add experience
function addExp(amount) {
    gameState.player.exp += amount;
    
    // Check for level up
    while (gameState.player.exp >= gameState.player.expToNextLevel) {
        levelUp();
    }
    
    updateUI();
}

// Use or equip item (AO style)
function toggleEquipItem(slotIndex) {
    const item = gameState.player.inventory[slotIndex];
    if (!item) return;

    const itemDef = ITEM_TYPES[item.type];
    if (!itemDef) return;

    // Handle consumables (potions, etc.)
    if (itemDef.type === 'consumable') {
        useConsumable(slotIndex);
        return;
    }

    // Handle equipment (weapons, armor)
    if (itemDef.type === 'weapon' || itemDef.type === 'armor') {
        equipItem(slotIndex);
        return;
    }

    // Other item types
    addChatMessage('system', '❌ No puedes usar este item.');
}

// Use consumable item
function useConsumable(slotIndex) {
    const item = gameState.player.inventory[slotIndex];
    if (!item) return;

    const itemDef = ITEM_TYPES[item.type];
    if (!itemDef || itemDef.type !== 'consumable') return;

    // Apply consumable effect
    switch (itemDef.effect) {
        case 'heal_hp':
            const hpBefore = gameState.player.hp;
            gameState.player.hp = Math.min(gameState.player.hp + itemDef.value, gameState.player.maxHp);
            const hpHealed = gameState.player.hp - hpBefore;
            addChatMessage('system', `💚 Has usado ${item.name}! +${hpHealed} HP`);
            break;

        case 'heal_mana':
            const manaBefore = gameState.player.mana;
            gameState.player.mana = Math.min(gameState.player.mana + itemDef.value, gameState.player.maxMana);
            const manaRestored = gameState.player.mana - manaBefore;
            addChatMessage('system', `💙 Has usado ${item.name}! +${manaRestored} Mana`);
            break;

        case 'cure_poison':
            addChatMessage('system', `💚 Has usado ${item.name}! Veneno curado`);
            // En el futuro: gameState.player.poisoned = false;
            break;

        default:
            addChatMessage('system', `✨ Has usado ${item.name}!`);
    }

    // Consume one item
    item.quantity--;

    // Remove from inventory if quantity reaches 0
    if (item.quantity <= 0) {
        gameState.player.inventory.splice(slotIndex, 1);
    }

    updateUI();
}

// Equip/unequip weapon or armor
function equipItem(slotIndex) {
    const item = gameState.player.inventory[slotIndex];
    if (!item) return;

    const itemDef = ITEM_TYPES[item.type];
    if (!itemDef) return;

    // Determine equipment slot
    const equipSlot = itemDef.slot;
    if (!equipSlot) {
        addChatMessage('system', '❌ Este item no se puede equipar.');
        return;
    }

    // Check if already equipped
    const currentlyEquipped = gameState.player.equipped[equipSlot];

    if (currentlyEquipped === item.type) {
        // Unequip
        gameState.player.equipped[equipSlot] = null;
        addChatMessage('system', `📤 Has desequipado: ${item.name}`);
    } else {
        // Equip (replace if something else was equipped)
        if (currentlyEquipped) {
            const oldItemDef = ITEM_TYPES[currentlyEquipped];
            addChatMessage('system', `📤 ${oldItemDef.name} reemplazado por ${item.name}`);
        } else {
            addChatMessage('system', `⚔️ Has equipado: ${item.name}`);
        }
        gameState.player.equipped[equipSlot] = item.type;
    }

    updateUI();
}

// Add item to inventory (AO style stacking)
function addItemToInventory(itemType, quantity = 1) {
    const itemDef = ITEM_TYPES[itemType];
    if (!itemDef) return false;

    // Check if item already exists in inventory (for stackable items)
    if (itemDef.stackable) {
        const existingItem = gameState.player.inventory.find(item => item.type === itemType);
        if (existingItem) {
            existingItem.quantity = Math.min(existingItem.quantity + quantity, itemDef.maxStack);
            return true;
        }
    }

    // Check inventory space
    if (gameState.player.inventory.length >= MAX_INVENTORY_SLOTS) {
        addChatMessage('system', '❌ ¡Inventario lleno! No puedes recoger más items.');
        return false;
    }

    // Add new item
    gameState.player.inventory.push({
        type: itemType,
        name: itemDef.name,
        quantity: quantity,
        icon: itemDef.icon,
        stackable: itemDef.stackable
    });

    return true;
}

// Detect current zone based on player position
function updateCurrentZone() {
    const px = gameState.player.x;
    const py = gameState.player.y;

    let newZone = 'field'; // Default

    // Check which zone the player is in
    for (const [zoneKey, bounds] of Object.entries(ZONE_BOUNDARIES)) {
        if (px >= bounds.x && px < bounds.x + bounds.width &&
            py >= bounds.y && py < bounds.y + bounds.height) {
            newZone = zoneKey;
            break;
        }
    }

    // Update zone if changed
    if (newZone !== gameState.currentMap) {
        const oldZone = gameState.currentMap;
        gameState.currentMap = newZone;

        // Regenerate content for new zone
        gameState.objects = generateObjects();
        gameState.enemies = generateEnemies();

        const zoneNames = {
            'field': 'Campo',
            'city': 'Ciudad',
            'dungeon': 'Mazmorra'
        };

        addChatMessage('system', `🏞️ ¡Entras en ${zoneNames[newZone]}!`);
        updateUI();
        updateMinimap();
    }
}

// Update UI
function updateUI() {
    document.getElementById('hp').textContent = gameState.player.hp;
    document.getElementById('hpMax').textContent = gameState.player.maxHp;
    document.getElementById('mana').textContent = gameState.player.mana;
    document.getElementById('manaMax').textContent = gameState.player.maxMana;
    document.getElementById('gold').textContent = gameState.player.gold;

    // Update current map display
    const currentMapEl = document.getElementById('currentMap');
    const mapNames = {
        'field': '🏞️ Campo',
        'city': '🏘️ Ciudad',
        'dungeon': '🏰 Mazmorra'
    };

    if (currentMapEl) {
        currentMapEl.textContent = mapNames[gameState.currentMap] || '🏞️ Campo';
    }

    // Update level and experience
    const levelEl = document.getElementById('level');
    const expEl = document.getElementById('exp');
    const expBarEl = document.getElementById('expBar');

    if (levelEl) {
        levelEl.textContent = gameState.player.level;
    }
    if (expEl) {
        expEl.textContent = `${gameState.player.exp}/${gameState.player.expToNextLevel}`;
    }
    if (expBarEl) {
        const expPercent = (gameState.player.exp / gameState.player.expToNextLevel) * 100;
        expBarEl.style.width = expPercent + '%';
    }

    // Update character stats
    const enemiesKilledEl = document.getElementById('enemiesKilled');
    const chestsOpenedEl = document.getElementById('chestsOpened');

    if (enemiesKilledEl) {
        enemiesKilledEl.textContent = gameState.stats.enemiesKilled;
    }
    if (chestsOpenedEl) {
        chestsOpenedEl.textContent = gameState.stats.chestsOpened;
    }

    // Update inventory UI (AO style) - Show total quantity per item type
    for (let i = 0; i < MAX_INVENTORY_SLOTS; i++) {
        const slotEl = document.querySelector(`.item-slot:nth-child(${i + 1})`);
        if (!slotEl) continue;

        const item = gameState.player.inventory[i];

        // Remove previous classes
        slotEl.classList.remove('empty', 'equipped');

        if (item) {
            slotEl.textContent = item.icon;

            // Calculate total quantity of this item type in inventory
            let totalQuantity = 0;
            for (const invItem of gameState.player.inventory) {
                if (invItem.type === item.type) {
                    totalQuantity += invItem.quantity;
                }
            }

            // Always show total quantity for this item type
            const quantityEl = document.createElement('span');
            quantityEl.className = 'item-quantity';
            quantityEl.textContent = totalQuantity;
            slotEl.appendChild(quantityEl);

            // Check if this item is equipped
            const isWeaponEquipped = gameState.player.equipped.weapon === item.type;
            const isShieldEquipped = gameState.player.equipped.shield === item.type;

            if (isWeaponEquipped || isShieldEquipped) {
                slotEl.classList.add('equipped');
            }

            // Update title for tooltips
            const equipStatus = (isWeaponEquipped || isShieldEquipped) ? ' [EQUIPADO]' : '';
            slotEl.title = `${item.name} (${totalQuantity} total)${equipStatus}`;
        } else {
            slotEl.textContent = '-';
            slotEl.classList.add('empty');
            slotEl.title = 'Espacio vacío';
        }
    }
}

// Handle interactions
function interact() {
    const px = gameState.player.x;
    const py = gameState.player.y;

    // Check for objects
    for (let i = gameState.objects.length - 1; i >= 0; i--) {
        const obj = gameState.objects[i];
        // Safety check for object coordinates
        if (obj.x !== undefined && obj.y !== undefined && obj.x === px && obj.y === py) {
            if (obj.type === 'chest' && !obj.opened) {
                obj.opened = true;
                gameState.player.gold += obj.contains.gold;
                gameState.stats.chestsOpened++;
                addChatMessage('system', `¡Has abierto un cofre y encontrado ${obj.contains.gold} de oro!`);
                gameState.objects.splice(i, 1);
                updateUI();
            } else if (obj.type === 'gold') {
                gameState.player.gold += obj.amount;
                addChatMessage('system', `¡Has recogido ${obj.amount} de oro!`);
                gameState.objects.splice(i, 1);
                updateUI();
            } else if (obj.type === 'item') {
                // Pick up item (AO style)
                const success = addItemToInventory(obj.itemType, obj.quantity);
                if (success) {
                    const itemName = ITEM_TYPES[obj.itemType].name;
                    const quantity = obj.quantity;
                    addChatMessage('system', `¡Has recogido ${quantity}x ${itemName}!`);
                    gameState.objects.splice(i, 1);
                    updateUI();
                } else {
                    addChatMessage('system', '❌ ¡Inventario lleno! No puedes recoger el item.');
                }
            } else if (obj.type === 'portal') {
                // Portal interaction - change map
                changeMap(obj.targetMap, obj.targetX, obj.targetY);
                return; // Exit immediately after map change
            }
        }
    }
    
    // Check for enemies
    for (let enemy of gameState.enemies) {
        const dist = Math.abs(enemy.x - px) + Math.abs(enemy.y - py);
        if (dist === 1) {
            const damage = Math.floor(Math.random() * 15) + 10 + (gameState.player.level * 2);
            enemy.hp -= damage;
            addChatMessage('player', `¡Atacas al ${enemy.type} causando ${damage} de daño!`);

            if (enemy.hp <= 0) {
                const goldDrop = Math.floor(Math.random() * (enemy.goldDrop.max - enemy.goldDrop.min + 1)) + enemy.goldDrop.min;
                const expGain = enemy.expReward;

                gameState.player.gold += goldDrop;
                gameState.stats.enemiesKilled++;

                addChatMessage('system', `¡Has derrotado al ${enemy.type}! +${goldDrop} oro, +${expGain} EXP`);
                addExp(expGain);

                gameState.enemies = gameState.enemies.filter(e => e !== enemy);
                updateUI();
            }
            break;
        }
    }
}

// Enemy AI - Movement
function moveEnemies(timestamp) {
    for (let enemy of gameState.enemies) {
        if (timestamp - enemy.lastMoveTime < enemy.moveDelay) continue;
        
        const dx = gameState.player.x - enemy.x;
        const dy = gameState.player.y - enemy.y;
        const distance = Math.abs(dx) + Math.abs(dy);
        
        // Only move if player is within range (8 tiles)
        if (distance > 8) continue;
        
        // Try to move towards player
        let newX = enemy.x;
        let newY = enemy.y;
        
        // Prioritize moving on the axis with greater distance
        if (Math.abs(dx) > Math.abs(dy)) {
            newX += dx > 0 ? 1 : -1;
        } else if (dy !== 0) {
            newY += dy > 0 ? 1 : -1;
        } else if (dx !== 0) {
            newX += dx > 0 ? 1 : -1;
        }
        
        // Check if new position is valid and not occupied by another enemy
        if (isWalkable(newX, newY)) {
            const occupied = gameState.enemies.some(e => 
                e !== enemy && e.x === newX && e.y === newY
            );
            
            if (!occupied && (newX !== gameState.player.x || newY !== gameState.player.y)) {
                enemy.x = newX;
                enemy.y = newY;
                enemy.lastMoveTime = timestamp;
            }
        }
    }
}

// Enemy AI - Attack
function enemyAttacks(timestamp) {
    for (let enemy of gameState.enemies) {
        if (timestamp - enemy.lastAttackTime < enemy.attackDelay) continue;
        
        // Check if player is adjacent
        const dx = Math.abs(gameState.player.x - enemy.x);
        const dy = Math.abs(gameState.player.y - enemy.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // Enemy attacks player
            const baseDamage = Math.floor(Math.random() * (enemy.damage.max - enemy.damage.min + 1)) + enemy.damage.min;

            // Calculate shield defense bonus
            let shieldDefense = 0;
            if (gameState.player.equipped.shield) {
                const shieldDef = ITEM_TYPES[gameState.player.equipped.shield];
                if (shieldDef && shieldDef.defense) {
                    shieldDefense = shieldDef.defense;
                }
            }

            const totalDamage = Math.max(0, baseDamage - shieldDefense);

            gameState.player.hp -= totalDamage;

            if (gameState.player.hp < 0) gameState.player.hp = 0;

            const defenseText = shieldDefense > 0 ? ` (${shieldDefense} defendido)` : '';
            addChatMessage('system', `¡Un ${enemy.type} te ataca causando ${totalDamage} de daño!${defenseText}`);
            enemy.lastAttackTime = timestamp;
            updateUI();

            // Check if player died
            if (gameState.player.hp === 0) {
                addChatMessage('system', '💀 ¡Has muerto! Recarga la página para jugar de nuevo.');
            }
        }
    }
}

// Player movement
let lastMoveTime = 0;
const MOVE_DELAY = 150; // milliseconds

function handleMovement(timestamp) {
    if (timestamp - lastMoveTime < MOVE_DELAY) return;

    let newX = gameState.player.x;
    let newY = gameState.player.y;
    let moved = false;

    // Update player facing direction
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        newY--;
        gameState.player.facing = 'up';
        moved = true;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        newY++;
        gameState.player.facing = 'down';
        moved = true;
    } else if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        newX--;
        gameState.player.facing = 'left';
        moved = true;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        newX++;
        gameState.player.facing = 'right';
        moved = true;
    }

    if (moved && isWalkable(newX, newY)) {
        // Check if there's an enemy in the target position
        const enemyInPosition = gameState.enemies.some(e => e.x === newX && e.y === newY);

        if (!enemyInPosition) {
            gameState.player.x = newX;
            gameState.player.y = newY;
            lastMoveTime = timestamp;
        }
    }

    if (keys[' ']) {
        interact();
        keys[' '] = false; // Prevent repeated interactions
    }

    // Ranged attack with X key
    if (keys['x'] || keys['X']) {
        shootArrow();
        keys['x'] = false;
        keys['X'] = false; // Prevent repeated shooting
    }
}

// Shoot arrow if player has bow and arrows equipped
function shootArrow() {
    // Check if player has a ranged weapon equipped
    const equippedWeapon = gameState.player.equipped.weapon;
    if (!equippedWeapon) return;

    const weaponDef = ITEM_TYPES[equippedWeapon];
    if (!weaponDef || !weaponDef.ranged) return;

    // Check if player has arrows equipped in ammunition slot
    const equippedAmmunition = gameState.player.equipped.ammunition;
    if (equippedAmmunition !== 'ARROW') {
        addChatMessage('system', '❌ ¡No tienes flechas equipadas!');
        return;
    }

    // Find the arrow item in inventory to consume
    const arrowItem = gameState.player.inventory.find(item => item.type === 'ARROW');
    if (!arrowItem || arrowItem.quantity <= 0) {
        // Should not happen if equipped, but safety check
        gameState.player.equipped.ammunition = null; // Unequip empty arrows
        addChatMessage('system', '❌ ¡Flechas agotadas!');
        updateUI();
        return;
    }

    // Determine shooting direction based on facing
    let dx = 0, dy = 0;
    switch (gameState.player.facing) {
        case 'up': dy = -1; break;
        case 'down': dy = 1; break;
        case 'left': dx = -1; break;
        case 'right': dx = 1; break;
    }

    // Create projectile
    const projectile = {
        type: 'arrow',
        x: gameState.player.x + dx,
        y: gameState.player.y + dy,
        dx: dx,
        dy: dy,
        range: weaponDef.range,
        damage: weaponDef.damage,
        distanceTravelled: 0
    };

    gameState.projectiles.push(projectile);

    // Consume one arrow from equipped slot
    arrowItem.quantity--;

    // Check if arrows are depleted
    if (arrowItem.quantity <= 0) {
        // Remove from inventory and unequip
        gameState.player.inventory = gameState.player.inventory.filter(item => item !== arrowItem);
        gameState.player.equipped.ammunition = null;
        addChatMessage('system', '🏹 ¡Flechas agotadas! Desequipando munición');
    }

    addChatMessage('system', '🏹 ¡Disparas una flecha!');
    updateUI();
}

// Get camera position (centered on player, but allows reaching map edges)
function getCameraPosition() {
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;

    // Calculate camera top-left corner (centered on player)
    let cameraX = playerX - Math.floor(VIEWPORT_WIDTH / 2);
    let cameraY = playerY - Math.floor(VIEWPORT_HEIGHT / 2);

    // Clamp camera to map boundaries, but allow player to reach viewport edges
    // When camera reaches map boundary, player can still move to viewport edge
    cameraX = Math.max(0, Math.min(cameraX, MAP_WIDTH - VIEWPORT_WIDTH));
    cameraY = Math.max(0, Math.min(cameraY, MAP_HEIGHT - VIEWPORT_HEIGHT));

    return { x: cameraX, y: cameraY };
}

// Check if a world position is visible in the current viewport
function isInViewport(worldX, worldY) {
    const camera = getCameraPosition();
    return worldX >= camera.x &&
           worldX < camera.x + VIEWPORT_WIDTH &&
           worldY >= camera.y &&
           worldY < camera.y + VIEWPORT_HEIGHT;
}

// Convert world coordinates to screen coordinates
function worldToScreen(worldX, worldY) {
    const camera = getCameraPosition();
    const screenX = (worldX - camera.x) * TILE_SIZE;
    const screenY = (worldY - camera.y) * TILE_SIZE;
    return { x: screenX, y: screenY };
}

// Render game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const camera = getCameraPosition();

    // Draw map (only visible tiles)
    for (let vy = 0; vy < VIEWPORT_HEIGHT; vy++) {
        for (let vx = 0; vx < VIEWPORT_WIDTH; vx++) {
            const worldX = camera.x + vx;
            const worldY = camera.y + vy;

            // Check bounds
            if (worldX >= 0 && worldX < MAP_WIDTH && worldY >= 0 && worldY < MAP_HEIGHT) {
                const tile = gameState.map[worldY][worldX];
                let sprite;

                switch (tile) {
                    case TILES.GRASS:
                        sprite = sprites.grass;
                        break;
                    case TILES.WATER:
                        sprite = sprites.water;
                        break;
                    case TILES.STONE:
                        sprite = sprites.stone;
                        break;
                    case TILES.TREE:
                        sprite = sprites.tree;
                        break;
                    case TILES.WALL:
                        sprite = sprites.wall;
                        break;
                    case TILES.BUILDING:
                        sprite = sprites.building;
                        break;
                    case TILES.FLOOR:
                        sprite = sprites.floor;
                        break;
                    case TILES.DUNGEON_WALL:
                        sprite = sprites.dungeonWall;
                        break;
                    case TILES.PATH:
                        sprite = sprites.path;
                        break;
                }

                const screenPos = worldToScreen(worldX, worldY);
                ctx.drawImage(sprite, screenPos.x, screenPos.y);
            }
        }
    }

    // Draw objects (only visible ones)
    for (const obj of gameState.objects) {
        if (isInViewport(obj.x, obj.y)) {
            const screenPos = worldToScreen(obj.x, obj.y);

            if (obj.type === 'chest') {
                ctx.drawImage(sprites.chest, screenPos.x, screenPos.y);
            } else if (obj.type === 'gold') {
                ctx.drawImage(sprites.gold, screenPos.x, screenPos.y);
            } else if (obj.type === 'item') {
                // Draw item on ground (AO style)
                const itemSprite = sprites[ITEM_TYPES[obj.itemType].sprite];
                if (itemSprite) {
                    ctx.drawImage(itemSprite, screenPos.x, screenPos.y);
                }
            } else if (obj.type === 'portal') {
                // Draw portal (magical gateway)
                // Different sprites for different types of destinations
                if (obj.targetMap === 'city' || obj.targetMap === 'market' || obj.targetMap === 'castle') {
                    ctx.drawImage(sprites.portal, screenPos.x, screenPos.y);
                } else if (obj.targetMap === 'dungeon' || obj.targetMap === 'deep_dungeon') {
                    ctx.drawImage(sprites.dungeonDoor, screenPos.x, screenPos.y);
                } else {
                    // Default portal sprite for other destinations
                    ctx.drawImage(sprites.portal, screenPos.x, screenPos.y);
                }
            }
        }
    }

    // Draw enemies (only visible ones)
    for (const enemy of gameState.enemies) {
        if (isInViewport(enemy.x, enemy.y)) {
            const screenPos = worldToScreen(enemy.x, enemy.y);

            // Choose sprite based on enemy type
            let enemySprite = sprites.enemy; // Default goblin sprite
            switch (enemy.type) {
                case 'goblin': enemySprite = sprites.enemy; break;
                case 'skeleton': enemySprite = sprites.enemySkeleton; break;
                case 'orc': enemySprite = sprites.enemy; break; // Reuse goblin sprite for orcs
                case 'bandit': enemySprite = sprites.enemy; break; // Reuse goblin sprite for bandits
                case 'troll': enemySprite = sprites.enemyTroll; break;
                case 'dragon': enemySprite = sprites.enemyDragon; break;
                case 'elemental': enemySprite = sprites.enemyElemental; break;
                case 'demon': enemySprite = sprites.enemyDemon; break;
            }

            ctx.drawImage(enemySprite, screenPos.x, screenPos.y);

            // Draw enemy health bar
            const barWidth = TILE_SIZE;
            const barHeight = 4;
            const healthPercent = enemy.hp / enemy.maxHp;

            ctx.fillStyle = '#000';
            ctx.fillRect(screenPos.x, screenPos.y - 6, barWidth, barHeight);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(screenPos.x, screenPos.y - 6, barWidth * healthPercent, barHeight);
        }
    }

    // Draw projectiles (arrows, etc.) - only visible ones
    for (const projectile of gameState.projectiles) {
        if (isInViewport(projectile.x, projectile.y)) {
            const screenPos = worldToScreen(projectile.x, projectile.y);
            ctx.drawImage(sprites.arrowProjectile, screenPos.x, screenPos.y);
        }
    }

    // Draw player at correct position in viewport
    const playerScreenPos = worldToScreen(gameState.player.x, gameState.player.y);
    ctx.drawImage(sprites.player, playerScreenPos.x, playerScreenPos.y);
}

// Update projectiles (arrows, etc.)
function updateProjectiles() {
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const projectile = gameState.projectiles[i];

        // Move projectile
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;
        projectile.distanceTravelled++;

        // Check if projectile has exceeded range
        if (projectile.distanceTravelled >= projectile.range) {
            gameState.projectiles.splice(i, 1);
            continue;
        }

        // Check bounds
        if (projectile.x < 0 || projectile.x >= MAP_WIDTH ||
            projectile.y < 0 || projectile.y >= MAP_HEIGHT) {
            gameState.projectiles.splice(i, 1);
            continue;
        }

        // Check collision with walls/obstacles
        if (!isWalkable(projectile.x, projectile.y)) {
            gameState.projectiles.splice(i, 1);
            continue;
        }

        // Check collision with enemies
        let hitEnemy = false;
        for (let enemy of gameState.enemies) {
            if (enemy.x === projectile.x && enemy.y === projectile.y) {
                // Calculate weapon damage bonus
                let weaponDamage = projectile.damage;

                // Apply damage
                enemy.hp -= weaponDamage;

                // Show damage message
                addChatMessage('system', `🏹 ¡Flecha impacta al ${enemy.type} causando ${weaponDamage} de daño!`);

                // Check if enemy died
                if (enemy.hp <= 0) {
                    const goldDrop = Math.floor(Math.random() * (enemy.goldDrop.max - enemy.goldDrop.min + 1)) + enemy.goldDrop.min;
                    const expGain = enemy.expReward;

                    gameState.player.gold += goldDrop;
                    gameState.stats.enemiesKilled++;

                    addChatMessage('system', `💀 ¡Has derrotado al ${enemy.type} con flecha! +${goldDrop} oro, +${expGain} EXP`);
                    addExp(expGain);

                    gameState.enemies = gameState.enemies.filter(e => e !== enemy);
                    updateUI();
                }

                // Remove projectile
                gameState.projectiles.splice(i, 1);
                hitEnemy = true;
                break;
            }
        }

        if (hitEnemy) continue;
    }
}

// Game loop
function gameLoop(timestamp) {
    // Only process game logic if player is alive
    if (gameState.player.hp > 0) {
        handleMovement(timestamp);
        updateProjectiles();
        moveEnemies(timestamp);
        enemyAttacks(timestamp);
    }
    render();

    // Update minimap in real-time if visible
    if (minimapVisible) {
        renderMinimap();
    }

    requestAnimationFrame(gameLoop);
}

// Initialize game
function init() {
    // Generate initial map first
    gameState.map = generateMap();

    // Then validate all portal positions (after map is generated)
    validatePortalPositions();

    // Generate content
    gameState.objects = generateObjects();
    gameState.enemies = generateEnemies();

    // Add some test items for demonstration (AO style)
    addItemToInventory('BOW', 1);      // Arco para combate a distancia
    addItemToInventory('ARROW', 50);   // Flechas para el arco
    addItemToInventory('SWORD', 1);    // Espada para combate cuerpo a cuerpo
    addItemToInventory('SHIELD', 1);   // Escudo para defensa
    addItemToInventory('POTION_RED', 20);   // Pociones HP
    addItemToInventory('POTION_BLUE', 15);  // Pociones Mana
    addItemToInventory('POTION_GREEN', 10); // Pociones Antídoto

    // Add click listeners to inventory slots
    for (let i = 0; i < MAX_INVENTORY_SLOTS; i++) {
        const slotEl = document.querySelector(`.item-slot:nth-child(${i + 1})`);
        if (slotEl) {
            slotEl.addEventListener('click', () => toggleEquipItem(i));
        }
    }

    updateUI();
    gameLoop(0);
}

// Validate portal positions to ensure they are on walkable tiles
function validatePortalPositions() {
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        if (mapDef.portals) {
            // Generate the map to check portal positions
            const tempGameState = { currentMap: mapKey };
            const originalGameState = gameState.currentMap;
            gameState.currentMap = mapKey;

            const tempMap = generateMap();
            gameState.currentMap = originalGameState; // Restore

            for (const portal of mapDef.portals) {
                const px = portal.x;
                const py = portal.y;

                // Check if portal position is walkable
                if (!isWalkableOnMap(tempMap, px, py)) {
                    console.warn(`Portal ${portal.name} en ${mapKey} está en posición no walkable (${px}, ${py})`);
                    // Could auto-adjust portal position here if needed
                }

                // Validate target position exists and is walkable
                const targetMapDef = MAP_DEFINITIONS[portal.targetMap];
                if (targetMapDef) {
                    const targetGameState = { currentMap: portal.targetMap };
                    gameState.currentMap = portal.targetMap;
                    const targetMap = generateMap();
                    gameState.currentMap = originalGameState; // Restore

                    const tx = portal.targetX;
                    const ty = portal.targetY;

                    if (!isWalkableOnMap(targetMap, tx, ty)) {
                        console.error(`Destino del portal ${portal.name} (${portal.targetMap}) está en posición no walkable (${tx}, ${ty})`);
                        // Auto-adjust target position to nearest walkable tile
                        const adjusted = findNearestWalkableTile(targetMap, tx, ty);
                        if (adjusted) {
                            portal.targetX = adjusted.x;
                            portal.targetY = adjusted.y;
                            console.log(`Auto-ajustado destino del portal ${portal.name} a (${adjusted.x}, ${adjusted.y})`);
                        }
                    }
                }
            }
        }
    }
}

// Helper function to check if a position is walkable on a specific map
function isWalkableOnMap(map, x, y) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;

    const tile = map[y][x];
    return tile === TILES.GRASS || tile === TILES.FLOOR || tile === TILES.PATH;
}

// Find nearest walkable tile to a given position
function findNearestWalkableTile(map, startX, startY) {
    // Search in expanding circles around the target position
    for (let radius = 0; radius < 10; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                // Only check perimeter of current radius
                if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                    const x = startX + dx;
                    const y = startY + dy;

                    if (isWalkableOnMap(map, x, y)) {
                        return { x, y };
                    }
                }
            }
        }
    }
    return null; // No walkable tile found nearby
}

// Change map function with safety checks
function changeMap(targetMap, targetX, targetY) {
    // Validate target position is walkable
    const targetMapDef = MAP_DEFINITIONS[targetMap];
    if (!targetMapDef) {
        addChatMessage('system', '❌ ¡Error! Mapa destino no encontrado.');
        return;
    }

    // Temporarily switch to target map to generate it and check position
    const originalMap = gameState.currentMap;
    gameState.currentMap = targetMap;
    const targetMapData = generateMap();
    gameState.currentMap = originalMap;

    // Ensure target position is walkable
    if (!isWalkableOnMap(targetMapData, targetX, targetY)) {
        console.warn(`Posición destino (${targetX}, ${targetY}) no es walkable, buscando alternativa...`);
        const safePos = findNearestWalkableTile(targetMapData, targetX, targetY);
        if (safePos) {
            targetX = safePos.x;
            targetY = safePos.y;
            console.log(`Ajustado posición destino a (${targetX}, ${targetY})`);
        } else {
            addChatMessage('system', '❌ ¡Error! No se puede acceder al mapa destino.');
            return;
        }
    }

    // Save current map for transition message
    const oldMap = gameState.currentMap;

    // Change map
    gameState.currentMap = targetMap;

    // Teleport player to safe target position
    gameState.player.x = targetX;
    gameState.player.y = targetY;

    // Regenerate map content
    gameState.map = generateMap();
    gameState.objects = generateObjects();
    gameState.enemies = generateEnemies();

    // Show transition message
    const mapNames = {
        'field': '🏞️ Campo Principal',
        'city': '🏘️ Ciudad Imperial',
        'dungeon': '🏰 Mazmorra Antigua',
        'forest': '🌲 Bosque Encantado',
        'castle': '🏰 Castillo Real',
        'market': '🏪 Mercado Central',
        'deep_dungeon': '🕳️ Profundidades',
        'ruins': '🏛️ Ruinas Antiguas',
        'throne_room': '👑 Sala del Trono'
    };

    addChatMessage('system', `🌟 ¡Viajas a ${mapNames[targetMap] || targetMap}!`);
    updateUI();
    updateMinimap(); // Update minimap after map change
}

// Minimap functionality
const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas.getContext('2d');
let minimapVisible = false;

function toggleMinimap() {
    const container = document.getElementById('minimapContainer');
    const button = document.getElementById('toggleMinimap');

    minimapVisible = !minimapVisible;

    if (minimapVisible) {
        container.style.display = 'block';
        button.textContent = 'Ocultar Minimap';
        renderMinimap();
    } else {
        container.style.display = 'none';
        button.textContent = 'Mostrar Minimap';
    }
}

function renderMinimap() {
    if (!minimapVisible) return;

    const scaleX = minimapCanvas.width / MAP_WIDTH;
    const scaleY = minimapCanvas.height / MAP_HEIGHT;

    // Clear minimap
    minimapCtx.fillStyle = '#000';
    minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

    // Draw map tiles
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const tile = gameState.map[y][x];
            let color = '#2d5016'; // Default grass

            if (tile === TILES.WALL) color = '#4b5563';
            else if (tile === TILES.WATER) color = '#1e40af';
            else if (tile === TILES.STONE) color = '#6b7280';
            else if (tile === TILES.TREE) color = '#228b22';
            else if (tile === TILES.BUILDING) color = '#92400e';
            else if (tile === TILES.FLOOR) color = '#374151';
            else if (tile === TILES.DUNGEON_WALL) color = '#1f2937';
            else if (tile === TILES.PATH) color = '#a16207';

            minimapCtx.fillStyle = color;
            minimapCtx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
        }
    }

    // Draw portals
    for (const obj of gameState.objects) {
        if (obj.type === 'portal') {
            let color = '#8b5cf6'; // Default purple for city
            if (obj.targetMap === 'dungeon') color = '#dc2626'; // Red for dungeon

            minimapCtx.fillStyle = color;
            minimapCtx.fillRect(obj.x * scaleX, obj.y * scaleY, scaleX * 2, scaleY * 2);
        }
    }

    // Draw player position
    minimapCtx.fillStyle = '#3b82f6';
    minimapCtx.fillRect(
        gameState.player.x * scaleX - 1,
        gameState.player.y * scaleY - 1,
        scaleX * 3,
        scaleY * 3
    );
}

// Update minimap when needed
function updateMinimap() {
    if (minimapVisible) {
        renderMinimap();
    }
}

// World map functionality
const worldMapCanvas = document.getElementById('worldMapCanvas');
const worldMapCtx = worldMapCanvas.getContext('2d');
let worldMapVisible = false;

function toggleWorldMap() {
    const container = document.getElementById('worldMapContainer');
    const button = document.getElementById('toggleWorldMap');

    worldMapVisible = !worldMapVisible;

    if (worldMapVisible) {
        container.style.display = 'block';
        button.textContent = 'Ocultar Mapa del Mundo';
        renderWorldMap();
    } else {
        container.style.display = 'none';
        button.textContent = 'Mostrar Mapa del Mundo';
        document.getElementById('worldMapDetails').innerHTML = '';
    }
}

function renderWorldMap() {
    if (!worldMapVisible) return;

    const canvas = worldMapCanvas;
    const ctx = worldMapCtx;

    // Clear canvas
    ctx.fillStyle = '#1e3c72';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections first (behind maps)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    for (const connection of WORLD_CONNECTIONS) {
        const map1 = MAP_DEFINITIONS[connection[0]];
        const map2 = MAP_DEFINITIONS[connection[1]];

        if (map1 && map2) {
            ctx.beginPath();
            ctx.moveTo(map1.worldX, map1.worldY);
            ctx.lineTo(map2.worldX, map2.worldY);
            ctx.stroke();
        }
    }

    ctx.setLineDash([]); // Reset line dash

    // Draw each map as a rectangle
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        const isCurrentMap = mapKey === gameState.currentMap;
        const canAccess = true; // For now, all maps are accessible

        // Draw map rectangle
        ctx.fillStyle = isCurrentMap ? '#4ade80' : canAccess ? '#60a5fa' : '#6b7280';
        ctx.fillRect(mapDef.worldX - 20, mapDef.worldY - 15, 40, 30);

        // Draw border
        ctx.strokeStyle = isCurrentMap ? '#22c55e' : canAccess ? '#3b82f6' : '#4b5563';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapDef.worldX - 20, mapDef.worldY - 15, 40, 30);

        // Draw map name
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(mapDef.name.split(' ')[0], mapDef.worldX, mapDef.worldY + 2);
    }

    // Draw player position indicator
    const currentMapDef = MAP_DEFINITIONS[gameState.currentMap];
    if (currentMapDef) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(currentMapDef.worldX, currentMapDef.worldY - 8, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText('★', currentMapDef.worldX - 3, currentMapDef.worldY - 5);
    }
}

// World map click handler
worldMapCanvas.addEventListener('click', (event) => {
    if (!worldMapVisible) return;

    const rect = worldMapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicked on a map
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        if (x >= mapDef.worldX - 20 && x <= mapDef.worldX + 20 &&
            y >= mapDef.worldY - 15 && y <= mapDef.worldY + 15) {

            const detailsDiv = document.getElementById('worldMapDetails');
            detailsDiv.innerHTML = `
                <strong>${mapDef.name}</strong><br>
                ${mapDef.description}<br>
                <em>Estado: ${mapKey === gameState.currentMap ? 'Estás aquí' : 'Disponible'}</em>
            `;

            // If it's not the current map, offer to travel
            if (mapKey !== gameState.currentMap) {
                // For now, just show info. In a full implementation, we could check if player can travel
                detailsDiv.innerHTML += '<br><em>Viaja usando portales en el mapa</em>';
            }

            break;
        }
    }
});

// World map hover handler
worldMapCanvas.addEventListener('mousemove', (event) => {
    if (!worldMapVisible) return;

    const rect = worldMapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let hoveredMap = null;

    // Check if hovering over a map
    for (const [mapKey, mapDef] of Object.entries(MAP_DEFINITIONS)) {
        if (x >= mapDef.worldX - 20 && x <= mapDef.worldX + 20 &&
            y >= mapDef.worldY - 15 && y <= mapDef.worldY + 15) {
            hoveredMap = mapDef;
            break;
        }
    }

    worldMapCanvas.style.cursor = hoveredMap ? 'pointer' : 'default';
});

// Quest list toggle functionality
function toggleQuests() {
    const questList = document.getElementById('questList');
    const toggleButton = document.getElementById('toggleQuests');

    if (questList.style.display === 'none') {
        questList.style.display = 'block';
        toggleButton.textContent = 'Ocultar';
    } else {
        questList.style.display = 'none';
        toggleButton.textContent = 'Mostrar';
    }
}

// Add minimap toggle event listener
document.getElementById('toggleMinimap').addEventListener('click', toggleMinimap);

// Add world map toggle event listener
document.getElementById('toggleWorldMap').addEventListener('click', toggleWorldMap);

// Add quest toggle event listener
document.getElementById('toggleQuests').addEventListener('click', toggleQuests);

// Start game when page loads
window.addEventListener('load', init);
