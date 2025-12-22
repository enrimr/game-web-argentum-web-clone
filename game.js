// Game configuration
const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 13;
const MAX_INVENTORY_SLOTS = 12; // Máximo de tipos diferentes de items

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

// Generate objects (chests, gold, items)
function generateObjects() {
    const objects = [];

    // Add chests (AO style)
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

    // Add gold coins (AO style)
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

    // Add items on ground (AO style) - máximo 1 item por celda
    const itemTypes = Object.keys(ITEM_TYPES);
    const maxAttempts = 50; // Máximo de intentos para encontrar celda libre

    for (let i = 0; i < 8; i++) {
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
        } else if (obj.type === 'item') {
            // Draw item on ground (AO style)
            const itemSprite = sprites[ITEM_TYPES[obj.itemType].sprite];
            if (itemSprite) {
                ctx.drawImage(itemSprite, obj.x * TILE_SIZE, obj.y * TILE_SIZE);
            }
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
