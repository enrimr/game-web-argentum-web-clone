// Game configuration
const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

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
        inventory: []
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
    })
};

// Tile types
const TILES = {
    GRASS: 0,
    WATER: 1,
    STONE: 2,
    TREE: 3
};

// Generate map
function generateMap() {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create water border
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WATER);
            }
            // Random trees
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

// Generate objects (chests, gold)
function generateObjects() {
    const objects = [];
    
    // Add chests
    for (let i = 0; i < 3; i++) {
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
    for (let i = 0; i < 5; i++) {
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
    
    return objects;
}

// Generate enemies
function generateEnemies() {
    const enemies = [];
    
    for (let i = 0; i < 4; i++) {
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
            maxHp: 30
        });
    }
    
    return enemies;
}

// Check if tile is walkable
function isWalkable(x, y) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
    const tile = gameState.map[y][x];
    return tile === TILES.GRASS;
}

// Add message to chat
function addChatMessage(type, message) {
    const chatLog = document.getElementById('chatLog');
    const p = document.createElement('p');
    p.innerHTML = `<span class="${type}">${type === 'system' ? 'Sistema' : 'Jugador'}:</span> ${message}`;
    chatLog.appendChild(p);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Update UI
function updateUI() {
    document.getElementById('hp').textContent = gameState.player.hp;
    document.getElementById('mana').textContent = gameState.player.mana;
    document.getElementById('gold').textContent = gameState.player.gold;
    
    // Update character stats
    const enemiesKilledEl = document.getElementById('enemiesKilled');
    const chestsOpenedEl = document.getElementById('chestsOpened');
    
    if (enemiesKilledEl) {
        enemiesKilledEl.textContent = gameState.stats.enemiesKilled;
    }
    if (chestsOpenedEl) {
        chestsOpenedEl.textContent = gameState.stats.chestsOpened;
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
            }
        }
    }
    
    // Check for enemies
    for (let enemy of gameState.enemies) {
        const dist = Math.abs(enemy.x - px) + Math.abs(enemy.y - py);
        if (dist === 1) {
            const damage = Math.floor(Math.random() * 15) + 10;
            enemy.hp -= damage;
            addChatMessage('player', `¡Atacas al goblin causando ${damage} de daño!`);
            
            if (enemy.hp <= 0) {
                const goldDrop = Math.floor(Math.random() * 20) + 10;
                gameState.player.gold += goldDrop;
                gameState.stats.enemiesKilled++;
                addChatMessage('system', `¡Has derrotado al goblin! +${goldDrop} oro`);
                gameState.enemies = gameState.enemies.filter(e => e !== enemy);
                updateUI();
            }
            break;
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
        gameState.player.x = newX;
        gameState.player.y = newY;
        lastMoveTime = timestamp;
    }
    
    if (keys[' ']) {
        interact();
        keys[' '] = false; // Prevent repeated interactions
    }
}

// Render game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw map
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const tile = gameState.map[y][x];
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
            }
            
            ctx.drawImage(sprite, x * TILE_SIZE, y * TILE_SIZE);
        }
    }
    
    // Draw objects
    for (const obj of gameState.objects) {
        if (obj.type === 'chest') {
            ctx.drawImage(sprites.chest, obj.x * TILE_SIZE, obj.y * TILE_SIZE);
        } else if (obj.type === 'gold') {
            ctx.drawImage(sprites.gold, obj.x * TILE_SIZE, obj.y * TILE_SIZE);
        }
    }
    
    // Draw enemies
    for (const enemy of gameState.enemies) {
        ctx.drawImage(sprites.enemy, enemy.x * TILE_SIZE, enemy.y * TILE_SIZE);
        
        // Draw enemy health bar
        const barWidth = TILE_SIZE;
        const barHeight = 4;
        const healthPercent = enemy.hp / enemy.maxHp;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE - 6, barWidth, barHeight);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE - 6, barWidth * healthPercent, barHeight);
    }
    
    // Draw player
    ctx.drawImage(sprites.player, gameState.player.x * TILE_SIZE, gameState.player.y * TILE_SIZE);
}

// Game loop
function gameLoop(timestamp) {
    handleMovement(timestamp);
    render();
    requestAnimationFrame(gameLoop);
}

// Initialize game
function init() {
    gameState.map = generateMap();
    gameState.objects = generateObjects();
    gameState.enemies = generateEnemies();
    updateUI();
    gameLoop(0);
}

// Start game when page loads
window.addEventListener('load', init);
