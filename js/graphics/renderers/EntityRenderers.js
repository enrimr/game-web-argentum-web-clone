/**
 * EntityRenderers.js
 * Renderiza entidades del juego (jugador, NPCs, enemigos, objetos, etc.)
 */

import { gameState } from '../../state.js';
import { CONFIG } from '../../config.js';
import { ITEM_TYPES } from '../../systems/ItemTypes.js';
import { isInsideCurrentBuilding } from '../../systems/BuildingSystem.js';
import { isInViewport, worldToScreen, renderHealthBar } from './RendererCore.js';
import { getEnemySprite } from './SpriteHelpers.js';
import { getAnimatedPlayerSprite } from './AnimationHelpers.js';
import { layerVisibility, sprites, TILE_SIZE } from './RendererCore.js';
import { drawDBZMeditationEffects } from './EffectRenderers.js';
import { renderEquipmentLayers, getPlayerVisualEquipment } from '../../systems/EquipmentSystem.js';

/**
 * Render player with animations
 * @param {Object} camera - Camera position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderPlayer(camera, ctx) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.player) return;

    const playerScreenPos = worldToScreen(gameState.player.x, gameState.player.y);

    // Get animated player sprite based on direction and animation state
    const playerSprite = getAnimatedPlayerSprite();

    // Draw the base sprite
    ctx.drawImage(playerSprite, playerScreenPos.x, playerScreenPos.y);
    
    // Draw equipment layers (armor, helmet, weapon, shield)
    const playerEquipment = getPlayerVisualEquipment(gameState.player);
    renderEquipmentLayers(ctx, playerScreenPos, playerEquipment, sprites);
    
    // Si el jugador está meditando, mostrar el efecto de DBZ
    if (gameState.player.meditating) {
        drawDBZMeditationEffects(playerScreenPos, ctx);
    }
}

/**
 * Render bot players
 * @param {Object} camera - Camera position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderBots(camera, ctx) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.player) return;
    
    // Only render bots in the current map
    const currentMapBots = gameState.bots.filter(bot => bot.currentMap === gameState.currentMap);
    
    for (const bot of currentMapBots) {
        // Si estamos dentro de un edificio, solo mostrar bots dentro del mismo
        if (gameState.playerInBuilding && !isInsideCurrentBuilding(bot.x, bot.y)) {
            continue;
        }
        
        if (isInViewport(bot.x, bot.y, camera)) {
            const screenPos = worldToScreen(bot.x, bot.y);
            
            // Get player sprite based on bot's animation state and facing direction
            // For now, we'll use a simple player sprite
            // TODO: Could make bots look different from player
            const playerSprite = sprites.player || sprites.playerDown;
            
            if (playerSprite) {
                // Draw base character sprite
                ctx.drawImage(playerSprite, screenPos.x, screenPos.y);
                
                // Draw equipment layers (armor, helmet, weapon, shield)
                if (bot.equipment) {
                    renderEquipmentLayers(ctx, screenPos, bot.equipment, sprites);
                }
                
                // Draw bot nickname below sprite with different color
                ctx.fillStyle = '#60a5fa'; // Blue color for bots
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(bot.name, screenPos.x + TILE_SIZE/2, screenPos.y + TILE_SIZE + 10);
                
                // Draw level indicator below the name
                ctx.fillStyle = '#22c55e'; // Green for level
                ctx.font = '8px monospace';
                ctx.fillText(`Lv.${bot.level}`, screenPos.x + TILE_SIZE/2, screenPos.y + TILE_SIZE + 20);
            }
        }
    }
}

/**
 * Render NPCs
 * @param {Object} camera - Camera position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderNPCs(camera, ctx) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.npcs) return;
    
    for (const npc of gameState.npcs) {
        // Si estamos dentro de un edificio, solo mostrar NPCs dentro del mismo
        if (gameState.playerInBuilding && !isInsideCurrentBuilding(npc.x, npc.y)) {
            continue;
        }
        
        if (isInViewport(npc.x, npc.y, camera)) {
            const screenPos = worldToScreen(npc.x, npc.y);
            const npcSprite = sprites[npc.sprite];
            if (npcSprite) {
                ctx.drawImage(npcSprite, screenPos.x, screenPos.y);

                // Draw NPC name below sprite
                ctx.fillStyle = '#fbbf24';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name, screenPos.x + TILE_SIZE/2, screenPos.y + TILE_SIZE + 10);
                
                // Si el NPC está meditando, mostrar el efecto de meditación
                if (npc.meditating) {
                    drawDBZMeditationEffects(screenPos, ctx);
                }
            }
        }
    }
}

/**
 * Render enemies
 * @param {Object} camera - Camera position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderEnemies(camera, ctx) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.enemies) return;
    
    for (const enemy of gameState.enemies) {
        // Si estamos dentro de un edificio, solo mostrar enemigos dentro del mismo
        if (gameState.playerInBuilding && !isInsideCurrentBuilding(enemy.x, enemy.y)) {
            continue;
        }
        
        if (isInViewport(enemy.x, enemy.y, camera)) {
            const screenPos = worldToScreen(enemy.x, enemy.y);

            // Choose sprite based on enemy type
            const enemySprite = getEnemySprite(enemy.type);

            ctx.drawImage(enemySprite, screenPos.x, screenPos.y);

            // Draw enemy health bar
            renderHealthBar(screenPos.x, screenPos.y, enemy.hp, enemy.maxHp, ctx);
        }
    }
}

/**
 * Render objects (chests, gold, items, portals)
 * @param {Object} camera - Camera position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderObjects(camera, ctx) {
    // Skip rendering if layer is disabled in debug mode
    if (!layerVisibility.objects) return;
    
    for (const obj of gameState.objects) {
        // Si estamos dentro de un edificio, solo mostrar objetos dentro del mismo
        if (gameState.playerInBuilding && !isInsideCurrentBuilding(obj.x, obj.y)) {
            continue;
        }
        
        if (isInViewport(obj.x, obj.y, camera)) {
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
            } else if (obj.type === 'dropped_item') {
                // Draw dropped item (only visible to ghosts or all players?)
                const itemSprite = sprites[ITEM_TYPES[obj.droppedItem.type]?.sprite];
                if (itemSprite) {
                    // Add a ghostly effect for dropped items
                    ctx.globalAlpha = 0.8;
                    ctx.drawImage(itemSprite, screenPos.x, screenPos.y);

                    // Draw a small indicator that it's a dropped item
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
                    ctx.fillRect(screenPos.x + TILE_SIZE - 4, screenPos.y, 4, 4);
                }
            }
        }
    }
}

/**
 * Render projectiles
 * @param {Object} camera - Camera position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderProjectiles(camera, ctx) {
    for (const projectile of gameState.projectiles) {
        // Si estamos dentro de un edificio, solo mostrar proyectiles dentro del mismo
        if (gameState.playerInBuilding && !isInsideCurrentBuilding(projectile.x, projectile.y)) {
            continue;
        }
        
        if (isInViewport(projectile.x, projectile.y, camera)) {
            const screenPos = worldToScreen(projectile.x, projectile.y);
            ctx.drawImage(sprites.arrowProjectile, screenPos.x, screenPos.y);
        }
    }
}
