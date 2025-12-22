// Game configuration
const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 20;  // Celdas visibles horizontalmente
const VIEWPORT_HEIGHT = 13; // Celdas visibles verticalmente
const MAP_WIDTH = 60;       // Mapa total ancho (3x más grande)
const MAP_HEIGHT = 40;      // Mapa total alto (3x más grande)
const MAX_INVENTORY_SLOTS = 12; // Máximo de tipos diferentes de items

// Map types and transitions
const MAP_TYPES = {
    FIELD: 'field',
    CITY: 'city',
    DUNGEON: 'dungeon'
};

// Portal system for map transitions
const PORTALS = {
    // From field to city
    'field_to_city': { x: 30, y: 20, targetMap: 'city', targetX: 15, targetY: 35 },
    // From city to field
    'city_to_field': { x: 15, y: 37, targetMap: 'field', targetX: 30, targetY: 18 },
    // From city to dungeon
    'city_to_dungeon': { x: 45, y: 10, targetMap: 'dungeon', targetX: 5, targetY: 5 },
    // From dungeon to city
    'dungeon_to_city': { x: 5, y: 3, targetMap: 'city', targetX: 45, targetY: 12 }
};

// Game state
const gameState = {
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
            shield: null  // Item equipado como escudo
        },
        level: 1,
        exp: 0,
        expToNextLevel: 100
    },
    stats: {
        enemiesKilled: 0,
        chestsOpened: 0
    },
    map: [],
    objects: [],
    enemies: []
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
        // Botella roja
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-4, h/2-2, 8, 10);
        ctx.fillStyle = '#991b1b';
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
    })
};

// Item types (inspirado en Argentum Online)
const ITEM_TYPES = {
    POTION_RED: { name: 'Poción Roja', icon: '🧪', stackable: true, maxStack: 100, sprite: 'potion' },
    ARROW: { name: 'Flecha', icon: '🏹', stackable: true, maxStack: 500, sprite: 'arrow' },
    SWORD: { name: 'Espada', icon: '⚔️', stackable: false, maxStack: 1, sprite: 'sword' },
    SHIELD: { name: 'Escudo', icon: '🛡️', stackable: false, maxStack: 1, sprite: 'shield' }
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

// Generate map
function generateMap() {
    const map = [];
    const centerX = Math.floor(MAP_WIDTH / 2);
    const centerY = Math.floor(MAP_HEIGHT / 2);

    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create solid wall border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WALL);
            }
            // Create paths to portals
            else if (isOnPathToPortal(x, y, centerX, centerY)) {
                row.push(TILES.PATH);
            }
            // Random trees (avoiding paths)
            else if (Math.random() < 0.1) {
                row.push(TILES.TREE);
            }
            // Random stones
            else if (Math.random() < 0.05) {
                row.push(TILES.STONE);
            }
            // Default grass
            else {
                row.push(TILES.GRASS);
            }
        }
        map.push(row);
    }
    return map;
}

// Check if a position is on a path to any portal
function isOnPathToPortal(x, y, centerX, centerY) {
    // Path to city (field_to_city portal)
    if (isOnLine(x, y, centerX, centerY, PORTALS.field_to_city.x, PORTALS.field_to_city.y, 2)) {
        return true;
    }
    // Path to dungeon (city_to_dungeon portal, but from field perspective)
    if (isOnLine(x, y, centerX, centerY, PORTALS.city_to_dungeon.x, PORTALS.city_to_dungeon.y, 2)) {
        return true;
    }
    return false;
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

// Generate objects (chests, gold, items)
function generateObjects() {
    const objects = [];

    // Add chests (AO style) - more for larger map
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

    // Add gold coins (AO style) - more for larger map
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

    // Add portals (visible gateways to other maps)
    // City portal
    objects.push({
        type: 'portal',
        portalId: 'field_to_city',
        x: PORTALS.field_to_city.x,
        y: PORTALS.field_to_city.y,
        targetMap: PORTALS.field_to_city.targetMap
    });

    // Dungeon portal
    objects.push({
        type: 'portal',
        portalId: 'city_to_dungeon',
        x: PORTALS.city_to_dungeon.x,
        y: PORTALS.city_to_dungeon.y,
        targetMap: PORTALS.city_to_dungeon.targetMap
    });

    // Add items on ground (AO style) - máximo 1 item por celda
    const itemTypes = Object.keys(ITEM_TYPES);
    const maxAttempts = 50; // Máximo de intentos para encontrar celda libre

    for (let i = 0; i < 40; i++) {
        let foundSpot = false;
        let attempts = 0;

        while (!foundSpot && attempts < maxAttempts) {
            const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;

            // Verificar que la celda esté libre (césped) y no tenga otros objetos
            if (gameState.map[y][x] === TILES.GRASS) {
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

        // Si no encontró spot después de maxAttempts, simplemente no genera ese item
    }

    return objects;
}

// Generate enemies
function generateEnemies() {
    const enemies = [];

    // More enemies for larger map
    for (let i = 0; i < 20; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
        } while (gameState.map[y][x] !== TILES.GRASS);

        enemies.push({
            type: 'goblin',
            x: x,
            y: y,
            hp: 30,
            maxHp: 30,
            lastMoveTime: 0,
            moveDelay: 800 + Math.random() * 400, // Random delay between 800-1200ms
            lastAttackTime: 0,
            attackDelay: 2000 // Attack every 2 seconds
        });
    }

    return enemies;
}

// Check if tile is walkable
function isWalkable(x, y) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;

    const tile = gameState.map[y][x];

    // Solid walls are not walkable
    if (tile === TILES.WALL || tile === TILES.BUILDING || tile === TILES.DUNGEON_WALL) {
        return false;
    }

    return tile === TILES.GRASS || tile === TILES.FLOOR;
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

// Equip/unequip item (AO style)
function toggleEquipItem(slotIndex) {
    const item = gameState.player.inventory[slotIndex];
    if (!item) return;

    const itemDef = ITEM_TYPES[item.type];
    if (!itemDef) return;

    // Check if item is equippable
    if (itemDef.stackable) {
        addChatMessage('system', '❌ Este item no se puede equipar.');
        return;
    }

    // Determine equipment slot
    let equipSlot = null;
    if (item.type === 'SWORD') {
        equipSlot = 'weapon';
    } else if (item.type === 'SHIELD') {
        equipSlot = 'shield';
    }

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

// Update UI
function updateUI() {
    document.getElementById('hp').textContent = gameState.player.hp;
    document.getElementById('hpMax').textContent = gameState.player.maxHp;
    document.getElementById('mana').textContent = gameState.player.mana;
    document.getElementById('manaMax').textContent = gameState.player.maxMana;
    document.getElementById('gold').textContent = gameState.player.gold;

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
        if (obj.x === px && obj.y === py) {
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
                // Portal interaction (future map transitions)
                if (obj.targetMap === 'city') {
                    addChatMessage('system', '🌆 ¡Puerta a la Ciudad! (Próximamente: múltiples mapas)');
                } else if (obj.targetMap === 'dungeon') {
                    addChatMessage('system', '🏰 ¡Puerta a la Mazmorra! (Próximamente: múltiples mapas)');
                }
            }
        }
    }
    
    // Check for enemies
    for (let enemy of gameState.enemies) {
        const dist = Math.abs(enemy.x - px) + Math.abs(enemy.y - py);
        if (dist === 1) {
            const damage = Math.floor(Math.random() * 15) + 10 + (gameState.player.level * 2);
            enemy.hp -= damage;
            addChatMessage('player', `¡Atacas al goblin causando ${damage} de daño!`);
            
            if (enemy.hp <= 0) {
                const goldDrop = Math.floor(Math.random() * 20) + 10;
                const expGain = 25 + (enemy.maxHp / 2); // Base exp based on enemy difficulty
                
                gameState.player.gold += goldDrop;
                gameState.stats.enemiesKilled++;
                
                addChatMessage('system', `¡Has derrotado al goblin! +${goldDrop} oro, +${Math.floor(expGain)} EXP`);
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
            const damage = Math.floor(Math.random() * 10) + 5;
            gameState.player.hp -= damage;
            
            if (gameState.player.hp < 0) gameState.player.hp = 0;
            
            addChatMessage('system', `¡Un goblin te ataca causando ${damage} de daño!`);
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
    
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        newY--;
        moved = true;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        newY++;
        moved = true;
    } else if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        newX--;
        moved = true;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        newX++;
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
                if (obj.targetMap === 'city') {
                    ctx.drawImage(sprites.portal, screenPos.x, screenPos.y);
                } else if (obj.targetMap === 'dungeon') {
                    ctx.drawImage(sprites.dungeonDoor, screenPos.x, screenPos.y);
                }
            }
        }
    }

    // Draw enemies (only visible ones)
    for (const enemy of gameState.enemies) {
        if (isInViewport(enemy.x, enemy.y)) {
            const screenPos = worldToScreen(enemy.x, enemy.y);
            ctx.drawImage(sprites.enemy, screenPos.x, screenPos.y);

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

    // Draw player at correct position in viewport
    const playerScreenPos = worldToScreen(gameState.player.x, gameState.player.y);
    ctx.drawImage(sprites.player, playerScreenPos.x, playerScreenPos.y);
}

// Game loop
function gameLoop(timestamp) {
    // Only process game logic if player is alive
    if (gameState.player.hp > 0) {
        handleMovement(timestamp);
        moveEnemies(timestamp);
        enemyAttacks(timestamp);
    }
    render();
    requestAnimationFrame(gameLoop);
}

// Initialize game
function init() {
    gameState.map = generateMap();
    gameState.objects = generateObjects();
    gameState.enemies = generateEnemies();

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

// Start game when page loads
window.addEventListener('load', init);
