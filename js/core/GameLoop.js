/**
 * GameLoop.js
 * Bucle principal del juego
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';
import { isKeyPressed, clearKey } from './Input.js';
import { isWalkable } from '../world/MapGenerator.js';
import { playerAttack, enemyAttack, shootArrow, updateProjectiles, isPlayerAlive, checkEnemyRespawns } from '../systems/Combat.js';
import { checkDoorEntry, checkBuildingExit, toggleDoor, getDoorInFrontOfPlayer } from '../systems/BuildingSystem.js';
import { toggleEquipItem, addItemToInventory } from '../systems/Inventory.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';
import { changeMap } from './Game.js';
import { addChatMessage, updateUI } from '../ui/UI.js';
import { showDialogue, isDialogueOpen } from '../ui/Dialogue.js';
import { updatePlayerAnimation, setPlayerAnimationState, setPlayerFacing } from './Renderer.js';
import { updateAutoMovement, isPlayerAutoMoving, getAutoMoveTarget } from './MouseControls.js';

let lastMoveTime = 0;
const MOVE_DELAY = CONFIG.PLAYER.MOVE_DELAY; // milliseconds

/**
 * Main game loop
 * @param {number} timestamp - Current timestamp
 */
export function gameLoop(timestamp) {
    // Only process game logic if player is alive
    if (isPlayerAlive()) {
        // Handle automatic movement from mouse clicks first
        const autoMoving = updateAutoMovement(timestamp);

        // Only handle manual movement if not auto-moving
        if (!autoMoving) {
            handleMovement(timestamp);
        }

        // Update UI after movement (both manual and automatic)
        updateUI();

        updateProjectiles();
        updateEnemies(timestamp);
        enemyAttacks(timestamp);

        // Check for enemy respawns (every 5 seconds)
        if (timestamp - (gameLoop.lastRespawnCheck || 0) > 5000) {
            checkEnemyRespawns();
            gameLoop.lastRespawnCheck = timestamp;
        }
    }

    // Render will be called separately
}

/**
 * Handle player movement and interactions
 * @param {number} timestamp - Current timestamp
 */
function handleMovement(timestamp) {
    let newX = gameState.player.x;
    let newY = gameState.player.y;
    let moved = false;
    let newDirection = gameState.player.facing;
    let isShiftPressed = isKeyPressed('Shift');

    // Update player facing direction and movement
    if (isKeyPressed('ArrowUp') || isKeyPressed('w') || isKeyPressed('W')) {
        newY--;
        newDirection = 'up';
        moved = true;
    } else if (isKeyPressed('ArrowDown') || isKeyPressed('s') || isKeyPressed('S')) {
        newY++;
        newDirection = 'down';
        moved = true;
    } else if (isKeyPressed('ArrowLeft') || isKeyPressed('a') || isKeyPressed('A')) {
        newX--;
        newDirection = 'left';
        moved = true;
    } else if (isKeyPressed('ArrowRight') || isKeyPressed('d') || isKeyPressed('D')) {
        newX++;
        newDirection = 'right';
        moved = true;
    }

    // Update player direction
    setPlayerFacing(newDirection);

    // If Shift is pressed, only change direction without moving
    if (isShiftPressed) {
        // Set idle animation when just orienting
        setPlayerAnimationState('idle');
        return; // Don't move the player physically
    }

    // Set animation state based on movement
    if (moved) {
        setPlayerAnimationState('walking');
    } else {
        setPlayerAnimationState('idle');
    }

    // Only move if not on cooldown and position is valid
    if (moved && timestamp - lastMoveTime >= MOVE_DELAY && isWalkable(gameState.map, newX, newY)) {
        // Check if there's an enemy in the target position
        const enemyInPosition = gameState.enemies.some(e => e.x === newX && e.y === newY);

        // Check if there's an NPC in the target position
        const npcInPosition = gameState.npcs.some(npc => npc.x === newX && npc.y === newY);

        // Debug logging
        if (npcInPosition) {
            console.log(`🚫 Bloqueado por NPC en posición (${newX}, ${newY})`);
        }

        if (!enemyInPosition && !npcInPosition) {
            gameState.player.x = newX;
            gameState.player.y = newY;
            lastMoveTime = timestamp;

            // Check if player is entering or exiting a building through a door
            checkDoorEntry(newX, newY);
            checkBuildingExit(newX, newY);
        }
    }

    // Handle interactions
    if (isKeyPressed(' ')) {
        handleInteractions();
        clearKey(' '); // Prevent repeated interactions
    }

    // Abrir/cerrar puertas con tecla E
    if (isKeyPressed('e') || isKeyPressed('E')) {
        handleDoorToggle();
        clearKey('e');
        clearKey('E'); // Prevent repeated interactions
    }

    // Ranged attack with X key
    if (isKeyPressed('x') || isKeyPressed('X')) {
        shootArrow();
        clearKey('x');
        clearKey('X'); // Prevent repeated shooting
    }
}

/**
 * Check if target is in the direction the player is facing
 * @param {number} targetX - Target X position
 * @param {number} targetY - Target Y position
 * @param {string} playerFacing - Direction player is facing
 * @returns {boolean} True if target is in facing direction
 */
function isTargetInFacingDirection(targetX, targetY, playerFacing) {
    const px = gameState.player.x;
    const py = gameState.player.y;

    switch (playerFacing) {
        case 'up':
            return targetY < py && targetX === px; // Directly above
        case 'down':
            return targetY > py && targetX === px; // Directly below
        case 'left':
            return targetX < px && targetY === py; // Directly left
        case 'right':
            return targetX > px && targetY === py; // Directly right
        default:
            return false;
    }
}

/**
 * Manejar interacción para abrir/cerrar puertas
 */
function handleDoorToggle() {
    const px = gameState.player.x;
    const py = gameState.player.y;
    const playerFacing = gameState.player.facing;
    
    // Comprobar si hay una puerta frente al jugador
    const doorPos = getDoorInFrontOfPlayer(px, py, playerFacing);
    if (doorPos) {
        // Alternar estado de la puerta
        toggleDoor(doorPos.x, doorPos.y);
    } else {
        addChatMessage('system', '❓ No hay ninguna puerta frente a ti para abrir o cerrar.');
    }
}

/**
 * Handle player interactions (chests, NPCs, portals, enemies)
 */
function handleInteractions() {
    const px = gameState.player.x;
    const py = gameState.player.y;
    const playerFacing = gameState.player.facing;

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

    // Check for NPCs - only if facing the NPC
    for (let npc of gameState.npcs) {
        const dist = Math.abs(npc.x - px) + Math.abs(npc.y - py);
        if (dist === 1 || (npc.x === px && npc.y === py)) {
            // Check if player is facing the NPC
            if (isTargetInFacingDirection(npc.x, npc.y, playerFacing)) {
                // Mostrar diálogo interactivo con NPC
                if (!isDialogueOpen()) {
                    showDialogue(npc);
                }
                return;
            }
        }
    }

    // Check for enemies - only attack if facing the enemy
    for (let enemy of gameState.enemies) {
        const dist = Math.abs(enemy.x - px) + Math.abs(enemy.y - py);
        if (dist === 1) {
            // Check if player is facing the enemy
            if (isTargetInFacingDirection(enemy.x, enemy.y, playerFacing)) {
                playerAttack(enemy);
                break;
            }
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

        // Check if new position is valid and not occupied by another enemy or NPC
        if (isWalkable(gameState.map, newX, newY)) {
            const occupiedByEnemy = gameState.enemies.some(e =>
                e !== enemy && e.x === newX && e.y === newY
            );
            
            const occupiedByNPC = gameState.npcs.some(npc =>
                npc.x === newX && npc.y === newY
            );

            if (!occupiedByEnemy && !occupiedByNPC && (newX !== gameState.player.x || newY !== gameState.player.y)) {
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
