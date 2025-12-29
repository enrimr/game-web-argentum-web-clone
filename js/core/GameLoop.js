/**
 * GameLoop.js
 * Bucle principal del juego
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { isKeyPressed, clearKey } from './Input.js';
import { isWalkable } from '../world/MapGenerator.js';
import { playerAttack, enemyAttack, shootArrow, updateProjectiles, isPlayerAlive } from '../systems/Combat.js';
import { toggleEquipItem, addItemToInventory } from '../systems/Inventory.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';
import { changeMap } from './Game.js';
import { addChatMessage, updateUI } from '../ui/UI.js';
import { showDialogue, isDialogueOpen } from '../ui/Dialogue.js';

let lastMoveTime = 0;
const MOVE_DELAY = CONFIG.PLAYER.MOVE_DELAY; // milliseconds

/**
 * Main game loop
 * @param {number} timestamp - Current timestamp
 */
export function gameLoop(timestamp) {
    // Only process game logic if player is alive
    if (isPlayerAlive()) {
        handleMovement(timestamp);
        updateProjectiles();
        updateEnemies(timestamp);
        enemyAttacks(timestamp);
    }

    // Render will be called separately
}

/**
 * Handle player movement and interactions
 * @param {number} timestamp - Current timestamp
 */
function handleMovement(timestamp) {
    if (timestamp - lastMoveTime < MOVE_DELAY) return;

    let newX = gameState.player.x;
    let newY = gameState.player.y;
    let moved = false;

    // Update player facing direction
    if (isKeyPressed('ArrowUp') || isKeyPressed('w') || isKeyPressed('W')) {
        newY--;
        gameState.player.facing = 'up';
        moved = true;
    } else if (isKeyPressed('ArrowDown') || isKeyPressed('s') || isKeyPressed('S')) {
        newY++;
        gameState.player.facing = 'down';
        moved = true;
    } else if (isKeyPressed('ArrowLeft') || isKeyPressed('a') || isKeyPressed('A')) {
        newX--;
        gameState.player.facing = 'left';
        moved = true;
    } else if (isKeyPressed('ArrowRight') || isKeyPressed('d') || isKeyPressed('D')) {
        newX++;
        gameState.player.facing = 'right';
        moved = true;
    }

    if (moved && isWalkable(gameState.map, newX, newY)) {
        // Check if there's an enemy in the target position
        const enemyInPosition = gameState.enemies.some(e => e.x === newX && e.y === newY);

        if (!enemyInPosition) {
            gameState.player.x = newX;
            gameState.player.y = newY;
            lastMoveTime = timestamp;
        }
    }

    // Handle interactions
    if (isKeyPressed(' ')) {
        handleInteractions();
        clearKey(' '); // Prevent repeated interactions
    }

    // Ranged attack with X key
    if (isKeyPressed('x') || isKeyPressed('X')) {
        shootArrow();
        clearKey('x');
        clearKey('X'); // Prevent repeated shooting
    }
}

/**
 * Handle player interactions (chests, NPCs, portals, enemies)
 */
function handleInteractions() {
    const px = gameState.player.x;
    const py = gameState.player.y;

    // Check for objects
    let interacted = false;
    for (let i = gameState.objects.length - 1; i >= 0; i--) {
        const obj = gameState.objects[i];
        if (obj.x === px && obj.y === py) {
            if (obj.type === 'chest' && !obj.opened) {
                obj.opened = true;
                gameState.player.gold += obj.contains.gold;
                gameState.stats.chestsOpened++;
                addChatMessage('system', `¡Has abierto un cofre y encontrado ${obj.contains.gold} de oro!`);
                gameState.objects.splice(i, 1);
                interacted = true;
            } else if (obj.type === 'gold') {
                gameState.player.gold += obj.amount;
                addChatMessage('system', `¡Has recogido ${obj.amount} de oro!`);
                gameState.objects.splice(i, 1);
                interacted = true;
            } else if (obj.type === 'item') {
                // Pick up item (AO style)
                const success = addItemToInventory(obj.itemType, obj.quantity);
                if (success) {
                    const itemName = ITEM_TYPES[obj.itemType].name;
                    const quantity = obj.quantity;
                    addChatMessage('system', `¡Has recogido ${quantity}x ${itemName}!`);
                    gameState.objects.splice(i, 1);
                    interacted = true;
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

    // Update UI if any object interaction occurred
    if (interacted) {
        updateUI();
    }

    // Check for NPCs
    for (let npc of gameState.npcs) {
        const dist = Math.abs(npc.x - px) + Math.abs(npc.y - py);
        if (dist === 1 || (npc.x === px && npc.y === py)) {
            // Mostrar diálogo interactivo con NPC
            if (!isDialogueOpen()) {
                showDialogue(npc);
            }
            return;
        }
    }

    // Check for enemies
    for (let enemy of gameState.enemies) {
        const dist = Math.abs(enemy.x - px) + Math.abs(enemy.y - py);
        if (dist === 1) {
            playerAttack(enemy);
            break;
        }
    }
}

/**
 * Update enemy AI (movement)
 * @param {number} timestamp - Current timestamp
 */
function updateEnemies(timestamp) {
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
        if (isWalkable(gameState.map, newX, newY)) {
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

/**
 * Handle enemy attacks
 * @param {number} timestamp - Current timestamp
 */
function enemyAttacks(timestamp) {
    for (let enemy of gameState.enemies) {
        if (timestamp - enemy.lastAttackTime < enemy.attackDelay) continue;

        // Check if player is adjacent
        const dx = Math.abs(gameState.player.x - enemy.x);
        const dy = Math.abs(gameState.player.y - enemy.y);

        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // Enemy attacks player
            enemyAttack(enemy);
            enemy.lastAttackTime = timestamp;
        }
    }
}
