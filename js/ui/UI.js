/**
 * UI.js
 * Sistema de interfaz de usuario
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';
import { toggleEquipItem } from '../systems/Inventory.js';
// Note: We import the Inventory module dynamically when needed to avoid circular dependencies

const { MAX_INVENTORY_SLOTS, INVENTORY_SLOTS_PER_PAGE } = CONFIG;

// Estado del inventario
let currentInventoryPage = 0;
let currentSlotsPerPage = INVENTORY_SLOTS_PER_PAGE;

/**
 * Get slots per page based on screen size
 * @returns {number} Number of slots to display per page
 */
function getSlotsPerPage() {
    const width = window.innerWidth;
    if (width <= 768) return 6;  // Móvil
    if (width <= 1024) return 8; // Tablet/intermedio
    return 9; // Desktop
}

/**
 * Update current slots per page based on screen size
 */
function updateSlotsPerPage() {
    currentSlotsPerPage = getSlotsPerPage();
    return Math.ceil(MAX_INVENTORY_SLOTS / currentSlotsPerPage);
}

/**
 * Update all UI elements
 */
export function updateUI() {
    updatePlayerStats();
    updateInventory();
    updateCurrentMap();
    updateMinimap();
}

/**
 * Update player stats display
 */
function updatePlayerStats() {
    // Update desktop stats
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

    // Update player position
    const playerPosEl = document.getElementById('playerPos');
    if (playerPosEl) {
        playerPosEl.textContent = `${gameState.player.x},${gameState.player.y}`;
    }
    
    // Update faction and criminal status
    import('../systems/Factions.js').then(({ getCriminalStatusText, getFactionColor }) => {
        const factionEl = document.getElementById('playerFaction');
        const criminalStatusEl = document.getElementById('criminalStatus');
        
        if (factionEl) {
            if (gameState.player.faction) {
                const factionColor = getFactionColor(gameState.player.faction);
                factionEl.innerHTML = `<span style="color: ${factionColor}">${gameState.player.faction}</span>`;
            } else {
                factionEl.textContent = 'Sin Facción';
            }
        }
        
        if (criminalStatusEl) {
            const statusText = getCriminalStatusText(gameState.player.criminalStatus);
            const statusColor = gameState.player.criminalStatus >= 50 ? '#ef4444' : 
                               gameState.player.criminalStatus >= 20 ? '#f59e0b' : '#22c55e';
            criminalStatusEl.innerHTML = `<span style="color: ${statusColor}">${statusText}</span> (${gameState.player.criminalStatus})`;
        }
    });

    // Update character stats
    const enemiesKilledEl = document.getElementById('enemiesKilled');
    const chestsOpenedEl = document.getElementById('chestsOpened');

    if (enemiesKilledEl) {
        enemiesKilledEl.textContent = gameState.stats.enemiesKilled;
    }
    if (chestsOpenedEl) {
        chestsOpenedEl.textContent = gameState.stats.chestsOpened;
    }

    // Update mobile HUD
    updateMobileHUD();
}

/**
 * Update mobile floating HUD (Single row version)
 */
function updateMobileHUD() {
    // Update barras con valores (HP, Mana, EXP)
    const miniHp = document.getElementById('miniHp');
    const miniHpMax = document.getElementById('miniHpMax');
    const miniHpBar = document.getElementById('miniHpBar');
    const miniMana = document.getElementById('miniMana');
    const miniManaMax = document.getElementById('miniManaMax');
    const miniManaBar = document.getElementById('miniManaBar');
    const miniExp = document.getElementById('miniExp');
    const miniExpMax = document.getElementById('miniExpMax');
    const miniExpBar = document.getElementById('miniExpBar');

    if (miniHp) miniHp.textContent = gameState.player.hp;
    if (miniHpMax) miniHpMax.textContent = gameState.player.maxHp;
    if (miniMana) miniMana.textContent = gameState.player.mana;
    if (miniManaMax) miniManaMax.textContent = gameState.player.maxMana;
    if (miniExp) miniExp.textContent = gameState.player.exp;
    if (miniExpMax) miniExpMax.textContent = gameState.player.expToNextLevel;

    // Update barras de progreso
    if (miniHpBar) {
        const hpPercent = (gameState.player.hp / gameState.player.maxHp) * 100;
        miniHpBar.style.width = hpPercent + '%';
    }
    if (miniManaBar) {
        const manaPercent = (gameState.player.mana / gameState.player.maxMana) * 100;
        miniManaBar.style.width = manaPercent + '%';
    }
    if (miniExpBar) {
        const expPercent = (gameState.player.exp / gameState.player.expToNextLevel) * 100;
        miniExpBar.style.width = expPercent + '%';
    }

    // Update stats simples (Nivel, Oro, Mapa, Pos)
    const miniLevel = document.getElementById('miniLevel');
    const miniGold = document.getElementById('miniGold');
    const miniMap = document.getElementById('miniMap');
    const miniPos = document.getElementById('miniPos');

    if (miniLevel) miniLevel.textContent = gameState.player.level;
    if (miniGold) miniGold.textContent = gameState.player.gold;

    // Update map name (abreviado para single row)
    const mapNames = {
        'field': 'Campo',
        'city': 'Ciudad',
        'dungeon': 'Maz',
        'newbie_city': 'Nov',
        'newbie_field': 'CNov',
        'dark_forest': 'BOsc',
        'forest': 'Bosq',
        'canarias_capital': 'LP',
        'canarias_playa_canteras': 'Cant'
    };
    if (miniMap) miniMap.textContent = mapNames[gameState.currentMap] || 'Campo';

    // Update position
    if (miniPos) miniPos.textContent = `${gameState.player.x},${gameState.player.y}`;
}

/**
 * Update inventory UI (AO style) - Show total quantity per item type
 */
function updateInventory() {
    // Update slots per page based on current screen size
    const totalPages = updateSlotsPerPage();
    
    // Ajustar página actual si es necesario
    if (currentInventoryPage >= totalPages) {
        currentInventoryPage = Math.max(0, totalPages - 1);
    }

    // Update desktop sidebar inventory
    updateInventorySection('#inventory');

    // Update mobile bottom inventory (if exists)
    updateInventorySection('.inventory-bottom .inventory');
}

/**
 * Update a specific inventory section
 * @param {string} selector - CSS selector for the inventory container
 */
function updateInventorySection(selector) {
    const inventoryContainer = document.querySelector(selector);
    if (!inventoryContainer) return;

    const slotElements = inventoryContainer.querySelectorAll('.item-slot');
    
    // Calculate which items to show based on current page and current slots per page
    const startIndex = currentInventoryPage * currentSlotsPerPage;

    // Iterar sobre TODOS los slots
    for (let i = 0; i < slotElements.length; i++) {
        const slotEl = slotElements[i];
        if (!slotEl) continue;

        // Ocultar slots que exceden currentSlotsPerPage
        if (i >= currentSlotsPerPage) {
            slotEl.style.display = 'none';
            continue;
        } else {
            slotEl.style.display = 'flex';
        }

        const actualIndex = startIndex + i;
        const item = gameState.player.inventory[actualIndex];

        // Clear previous content and classes
        slotEl.textContent = '';
        slotEl.classList.remove('empty', 'equipped');

        if (item) {
            // Get item definition from ITEM_TYPES
            const itemDef = ITEM_TYPES[item.type];
            if (!itemDef) {
                console.error(`Item type not found: ${item.type}`);
                slotEl.textContent = '?';
                slotEl.classList.add('empty');
                slotEl.title = `Item desconocido: ${item.type}`;
                continue;
            }

            slotEl.textContent = itemDef.icon;

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
            const isBodyEquipped = gameState.player.equipped.body === item.type;
            const isHeadEquipped = gameState.player.equipped.head === item.type;

            if (isWeaponEquipped || isShieldEquipped || isBodyEquipped || isHeadEquipped) {
                slotEl.classList.add('equipped');
            }

            // Update title for tooltips
            const equipStatus = (isWeaponEquipped || isShieldEquipped || isBodyEquipped || isHeadEquipped) ? ' [EQUIPADO]' : '';
            slotEl.title = `${itemDef.name} (${totalQuantity} total)${equipStatus}\nSlot: ${actualIndex + 1}`;
        } else {
            slotEl.textContent = '-';
            slotEl.classList.add('empty');
            slotEl.title = `Espacio vacío (Slot ${actualIndex + 1})`;
        }
    }
}

/**
 * Update current map display
 */
function updateCurrentMap() {
    const currentMapEl = document.getElementById('currentMap');
    const currentMapIdEl = document.getElementById('currentMapId');
    const mapNames = {
        'field': '🏞️ Campo',
        'city': '🏘️ Ciudad',
        'dungeon': '🏰 Mazmorra'
    };

    if (currentMapEl) {
        currentMapEl.textContent = mapNames[gameState.currentMap] || '🏞️ Campo';
    }

    if (currentMapIdEl) {
        currentMapIdEl.textContent = gameState.currentMap;
    }
}

/**
 * Update minimap if visible
 */
function updateMinimap() {
    // This will be handled by the Minimap module
}

/**
 * Initialize UI event listeners
 */
export function initUI() {
    // Create context menu for inventory
    const contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    contextMenu.className = 'context-menu';
    document.body.appendChild(contextMenu);

    // Add click listeners to inventory slots for both desktop and mobile
    initInventoryListeners('#inventory'); // Desktop sidebar
    initInventoryListeners('.inventory-bottom .inventory'); // Mobile bottom

    // Close context menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            hideContextMenu();
        }
    });
    
    // Initialize inventory pagination
    initInventoryPagination();
}

/**
 * Initialize inventory pagination controls
 */
function initInventoryPagination() {
    // Add pagination controls after each inventory container
    const inventoryContainers = [
        document.querySelector('#inventory'),
        document.querySelector('.inventory-bottom .inventory')
    ];
    
    const totalPages = updateSlotsPerPage();
    
    inventoryContainers.forEach(container => {
        if (!container) return;
        
        // Create pagination controls container
        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'inventory-pagination';
        paginationDiv.style.display = 'flex';
        paginationDiv.style.justifyContent = 'space-between';
        paginationDiv.style.alignItems = 'center';
        paginationDiv.style.marginTop = '5px';
        paginationDiv.style.padding = '5px';
        paginationDiv.style.background = 'rgba(0,0,0,0.3)';
        paginationDiv.style.borderRadius = '3px';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '◀️';
        prevBtn.className = 'inv-page-btn';
        prevBtn.style.background = '#4a5568';
        prevBtn.style.color = 'white';
        prevBtn.style.border = 'none';
        prevBtn.style.padding = '5px 10px';
        prevBtn.style.borderRadius = '3px';
        prevBtn.style.cursor = 'pointer';
        prevBtn.onclick = () => changeInventoryPage(-1);
        
        // Page indicator
        const pageIndicator = document.createElement('span');
        pageIndicator.className = 'page-indicator';
        pageIndicator.style.color = '#fbbf24';
        pageIndicator.style.fontSize = '12px';
        pageIndicator.textContent = `Página ${currentInventoryPage + 1}/${totalPages}`;
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '▶️';
        nextBtn.className = 'inv-page-btn';
        nextBtn.style.background = '#4a5568';
        nextBtn.style.color = 'white';
        nextBtn.style.border = 'none';
        nextBtn.style.padding = '5px 10px';
        nextBtn.style.borderRadius = '3px';
        nextBtn.style.cursor = 'pointer';
        nextBtn.onclick = () => changeInventoryPage(1);
        
        paginationDiv.appendChild(prevBtn);
        paginationDiv.appendChild(pageIndicator);
        paginationDiv.appendChild(nextBtn);
        
        // Insert after inventory container
        container.parentNode.insertBefore(paginationDiv, container.nextSibling);
    });
    
    // Añadir listener para resize de ventana
    window.addEventListener('resize', () => {
        updateInventory();
    });
}

/**
 * Change inventory page
 * @param {number} direction - Direction to change page (-1 for previous, 1 for next)
 */
function changeInventoryPage(direction) {
    const totalPages = updateSlotsPerPage();
    currentInventoryPage += direction;
    
    // Clamp to valid range
    if (currentInventoryPage < 0) currentInventoryPage = 0;
    if (currentInventoryPage >= totalPages) currentInventoryPage = totalPages - 1;
    
    // Update inventory display
    updateInventory();
    
    // Update page indicators
    document.querySelectorAll('.page-indicator').forEach(indicator => {
        indicator.textContent = `Página ${currentInventoryPage + 1}/${totalPages}`;
    });
}

/**
 * Initialize event listeners for a specific inventory section
 * @param {string} selector - CSS selector for the inventory container
 */
function initInventoryListeners(selector) {
    const inventoryContainer = document.querySelector(selector);
    if (!inventoryContainer) return;

    const slotElements = inventoryContainer.querySelectorAll('.item-slot');

    for (let i = 0; i < slotElements.length; i++) {
        const slotEl = slotElements[i];
        if (slotEl) {
            // Left click to equip/use
            slotEl.addEventListener('click', () => {
                const actualIndex = currentInventoryPage * currentSlotsPerPage + i;
                toggleEquipItem(actualIndex);
            });

            // Right click to open context menu (desktop only)
            slotEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const actualIndex = currentInventoryPage * currentSlotsPerPage + i;
                const item = gameState.player.inventory[actualIndex];
                if (!item) return; // No menu for empty slots

                showContextMenu(e, actualIndex, item);
            });

            // Touch events for mobile (long press for context menu)
            let touchTimer;
            slotEl.addEventListener('touchstart', (e) => {
                touchTimer = setTimeout(() => {
                    const actualIndex = currentInventoryPage * currentSlotsPerPage + i;
                    const item = gameState.player.inventory[actualIndex];
                    if (item) {
                        // Show mobile context menu or just use item
                        toggleEquipItem(actualIndex);
                    }
                }, 500); // Long press for 500ms
            });

            slotEl.addEventListener('touchend', () => {
                clearTimeout(touchTimer);
            });
        }
    }
}

/**
 * Show context menu for inventory item
 * @param {Event} e - Mouse event
 * @param {number} slotIndex - Inventory slot index
 * @param {Object} item - Item data
 */
function showContextMenu(e, slotIndex, item) {
    const contextMenu = document.getElementById('context-menu');
    if (!contextMenu) return;

    // Clear previous items
    contextMenu.innerHTML = '';

    // Add actions based on item type
    const itemDef = ITEM_TYPES[item.type];
    
    // Use/Equip option
    const useOption = document.createElement('div');
    useOption.className = 'context-menu-item';
    
    if (itemDef.type === 'weapon' || itemDef.type === 'armor' || itemDef.type === 'tool') {
        const isEquipped = gameState.player.equipped.weapon === item.type || 
                          gameState.player.equipped.shield === item.type ||
                          gameState.player.equipped.body === item.type ||
                          gameState.player.equipped.head === item.type;
        
        useOption.innerHTML = isEquipped ? 
            '<span class="icon">📤</span> Desequipar' : 
            '<span class="icon">⚔️</span> Equipar';
    } else {
        useOption.innerHTML = '<span class="icon">✨</span> Usar';
    }
    
    useOption.addEventListener('click', () => {
        toggleEquipItem(slotIndex);
        hideContextMenu();
    });
    
    contextMenu.appendChild(useOption);
    
    // Drop option
    const dropOption = document.createElement('div');
    dropOption.className = 'context-menu-item';
    dropOption.innerHTML = '<span class="icon">🗑️</span> Tirar al suelo';
    dropOption.addEventListener('click', () => {
        if (item.quantity > 1) {
            showQuantityPrompt(slotIndex, item);
        } else {
            // Import dropItem dynamically to avoid circular dependencies
            import('../systems/Inventory.js').then(({ dropItem }) => {
                dropItem(slotIndex);
            });
        }
        hideContextMenu();
    });
    
    contextMenu.appendChild(dropOption);

    // Position and show menu
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.display = 'block';
}

/**
 * Hide context menu
 */
function hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

/**
 * Show prompt for quantity selection
 * @param {number} slotIndex - Inventory slot index
 * @param {Object} item - Item data
 */
function showQuantityPrompt(slotIndex, item) {
    // Create modal elements if they don't exist
    let modal = document.getElementById('quantity-modal');
    let backdrop = document.getElementById('modal-backdrop');
    
    if (!modal) {
        backdrop = document.createElement('div');
        backdrop.id = 'modal-backdrop';
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);
        
        modal = document.createElement('div');
        modal.id = 'quantity-modal';
        modal.className = 'quantity-modal';
        modal.innerHTML = `
            <h3 class="quantity-modal-title">¿Cuántos items quieres tirar?</h3>
            <div class="quantity-modal-input">
                <input type="number" id="quantity-input" min="1" value="1">
            </div>
            <div class="quantity-modal-buttons">
                <button class="quantity-modal-btn cancel">Cancelar</button>
                <button class="quantity-modal-btn confirm">Confirmar</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        const cancelBtn = modal.querySelector('.cancel');
        cancelBtn.addEventListener('click', hideQuantityPrompt);
        
        backdrop.addEventListener('click', hideQuantityPrompt);
    }
    
    // Set up the quantity input
    const quantityInput = document.getElementById('quantity-input');
    quantityInput.max = item.quantity;
    quantityInput.value = 1;
    
    // Set up confirm button
    const confirmBtn = modal.querySelector('.confirm');
    confirmBtn.onclick = null; // Remove previous listeners
    confirmBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        if (quantity > 0 && quantity <= item.quantity) {
            // Import dropItem dynamically to avoid circular dependencies
            import('../systems/Inventory.js').then(({ dropItem }) => {
                dropItem(slotIndex, quantity);
                hideQuantityPrompt();
            });
        }
    });
    
    // Show the modal
    backdrop.style.display = 'block';
    modal.style.display = 'flex';
}

/**
 * Hide quantity prompt
 */
function hideQuantityPrompt() {
    const modal = document.getElementById('quantity-modal');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
}

/**
 * Add message to chat
 * @param {string} type - Message type ('system', 'player', or 'npc')
 * @param {string} message - Message content
 */
export function addChatMessage(type, message) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;

    let prefix = 'Sistema';
    if (type === 'player') prefix = 'Jugador';
    else if (type === 'npc') prefix = 'NPC';

    const p = document.createElement('p');
    p.innerHTML = `<span class="${type}">${prefix}:</span> ${message}`;
    chatLog.appendChild(p);
    chatLog.scrollTop = chatLog.scrollHeight;
}
