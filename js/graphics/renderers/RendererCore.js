/**
 * RendererCore.js
 * Funciones centrales del sistema de renderizado
 */

import { gameState } from '../../state.js';
import { CONFIG } from '../../config.js';
import { generateAllSprites, updatePlayerSprites } from '../SpriteGenerator.js';
import { generateCustomCharacterSprites } from '../sprites/CustomCharacterSprites.js';
import { renderMap, renderTreeLayer, renderPropLayer, renderDoorLayer, renderWindowLayer, renderRoofLayer } from './LayerRenderers.js';
import { renderPlayer, renderBots, renderNPCs, renderEnemies, renderObjects, renderProjectiles } from './EntityRenderers.js';
import { drawMeditationEffects, drawDBZMeditationEffects } from './EffectRenderers.js';
import { renderOverheadMessages } from '../../ui/Chat.js';

const { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, MAP_WIDTH, MAP_HEIGHT } = CONFIG;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load sprites
export let sprites = generateAllSprites(TILE_SIZE);

/**
 * Actualizar sprites del jugador con apariencia personalizada
 * @param {Object} appearance - Apariencia del personaje
 */
export function updatePlayerAppearance(appearance) {
    if (appearance) {
        console.log('🎨 Actualizando sprites del jugador con apariencia personalizada');
        
        // Construir objeto de apariencia completo con raza
        const fullAppearance = {
            race: gameState.player.race,
            skinColor: appearance.skinColor,
            tunicColor: appearance.tunicColor,
            hairColor: appearance.hairColor,
            hairStyle: appearance.hairStyle
        };
        
        sprites = updatePlayerSprites(sprites, fullAppearance, TILE_SIZE);
        console.log('✅ Sprites del jugador actualizados');
    }
}

// Debug visibility controls for each layer
export const layerVisibility = {
    baseMap: true,
    treeLayer: true,
    propLayer: true, // Nueva capa para objetos decorativos
    doorLayer: true,
    windowLayer: true,
    roofLayer: true,
    objects: true,
    npcs: true,
    enemies: true,
    player: true,
    buildings: true
};

/**
 * Render the entire game
 */
export function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const camera = getCameraPosition();

    // Draw base map (only visible tiles)
    renderMap(camera, ctx);

    // Draw tree layer over the map but under other entities
    renderTreeLayer(camera, ctx);
    
    // Draw prop layer (decorative objects)
    renderPropLayer(camera, ctx);

    // Draw door layer over the map but under entities
    renderDoorLayer(camera, ctx);

    // Draw objects, entities, NPCs, etc.
    renderObjects(camera, ctx);
    renderEnemies(camera, ctx);
    renderNPCs(camera, ctx);
    renderBots(camera, ctx); // Draw bots after NPCs but before player
    renderOnlinePlayers(camera, ctx); // Draw online players
    renderProjectiles(camera, ctx);

    // Draw player at correct position in viewport
    renderPlayer(camera, ctx);

    // Draw window layer, so it appears on top of player but below roofs
    renderWindowLayer(camera, ctx);

    // Draw roof layer last, so it appears on top of everything
    renderRoofLayer(camera, ctx);

    // Draw meditation effects on top of everything else (highest layer)
    // Verificamos tanto el estado de animación como la propiedad meditating
    if (gameState.player.animation.state === 'meditating' || gameState.player.meditating) {
        const playerScreenPos = worldToScreen(gameState.player.x, gameState.player.y);
        // Usar los efectos Dragon Ball Z para el jugador también
        drawDBZMeditationEffects(playerScreenPos, ctx);
    }

    // Draw chat overhead messages above everything
    renderOverheadMessages(ctx);
}

/**
 * Obtener posición de la cámara (centered on player, but allows reaching map edges)
 * @returns {Object} Camera position {x, y}
 */
export function getCameraPosition() {
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;

    // Calculate camera top-left corner (centered on player)
    let cameraX = playerX - Math.floor(VIEWPORT_WIDTH / 2);
    let cameraY = playerY - Math.floor(VIEWPORT_HEIGHT / 2);

    // Clamp camera to map boundaries, but allow player to reach viewport edges
    cameraX = Math.max(0, Math.min(cameraX, MAP_WIDTH - VIEWPORT_WIDTH));
    cameraY = Math.max(0, Math.min(cameraY, MAP_HEIGHT - VIEWPORT_HEIGHT));

    return { x: cameraX, y: cameraY };
}

/**
 * Check if a world position is visible in the current viewport
 * @param {number} worldX - World X coordinate
 * @param {number} worldY - World Y coordinate
 * @param {Object} camera - Camera position {x, y}
 * @returns {boolean} True if position is in viewport
 */
export function isInViewport(worldX, worldY, camera = getCameraPosition()) {
    return worldX >= camera.x &&
           worldX < camera.x + VIEWPORT_WIDTH &&
           worldY >= camera.y &&
           worldY < camera.y + VIEWPORT_HEIGHT;
}

/**
 * Convert world coordinates to screen coordinates
 * @param {number} worldX - World X coordinate
 * @param {number} worldY - World Y coordinate
 * @returns {Object} Screen position {x, y}
 */
export function worldToScreen(worldX, worldY) {
    const camera = getCameraPosition();
    const screenX = (worldX - camera.x) * TILE_SIZE;
    const screenY = (worldY - camera.y) * TILE_SIZE;
    return { x: screenX, y: screenY };
}

/**
 * Render debug coordinates for each tile
 * @param {number} screenX - Screen X position
 * @param {number} screenY - Screen Y position
 * @param {number} worldX - World X coordinate
 * @param {number} worldY - World Y coordinate
 */
export function renderDebugCoordinates(screenX, screenY, worldX, worldY) {
    ctx.save();

    // Fondo semi-transparente para el texto
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(screenX, screenY, TILE_SIZE, 20);

    // Texto de coordenadas
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${worldX},${worldY}`, screenX + TILE_SIZE/2, screenY + 14);

    ctx.restore();
}

/**
 * Render a health bar
 * @param {number} x - Screen X position
 * @param {number} y - Screen Y position
 * @param {number} currentHp - Current HP
 * @param {number} maxHp - Maximum HP
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderHealthBar(x, y, currentHp, maxHp, ctx) {
    const barWidth = TILE_SIZE;
    const barHeight = 4;
    const healthPercent = currentHp / maxHp;

    ctx.fillStyle = '#000';
    ctx.fillRect(x, y - 6, barWidth, barHeight);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x, y - 6, barWidth * healthPercent, barHeight);
}

/**
 * Helper function to get the building containing a specific tile
 * @param {number} x - Tile X coordinate
 * @param {number} y - Tile Y coordinate
 * @returns {Object|null} Building object or null if not in a building
 */
export function getBuildingForTile(x, y) {
    for (const building of gameState.buildings) {
        if (x >= building.x && x < building.x + building.width &&
            y >= building.y && y < building.y + building.height) {
            return building;
        }
    }
    return null;
}

/**
 * Renderizar jugadores online
 * @param {Object} camera - Posición de la cámara
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 */
function renderOnlinePlayers(camera, ctx) {
    // Solo renderizar si estamos en modo online
    if (!gameState.isOnline || !gameState.onlinePlayers) {
        return;
    }

    // Renderizar cada jugador online
    for (const [socketId, player] of gameState.onlinePlayers) {
        // Solo renderizar si está en el mismo mapa
        if (player.map !== gameState.currentMap) {
            continue;
        }

        // Solo renderizar si está en el viewport
        if (!isInViewport(player.x, player.y, camera)) {
            continue;
        }

        // Calcular posición en pantalla
        const screenPos = worldToScreen(player.x, player.y);

        ctx.save();
        
        // Generar sprite personalizado si hay apariencia
        if (player.appearance && player.race) {
            try {
                // Preparar datos de apariencia
                const appearanceData = {
                    race: player.race,
                    skinColor: player.appearance.skinColor || 'light',
                    tunicColor: player.appearance.tunicColor || 'blue'
                };
                
                // Generar sprites (ya importado al inicio)
                const playerSprites = generateCustomCharacterSprites(appearanceData, TILE_SIZE);
                
                // Dibujar sprite del jugador
                ctx.drawImage(playerSprites.player, screenPos.x, screenPos.y);
            } catch (error) {
                console.warn('Error generando sprite personalizado, usando fallback:', error);
                // Fallback a círculo si falla
                renderPlayerFallback(ctx, screenPos);
            }
        } else {
            // Si no hay datos de apariencia, usar círculo
            renderPlayerFallback(ctx, screenPos);
        }

        // Dibujar nombre sobre el jugador
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const nameX = screenPos.x + TILE_SIZE / 2;
        const nameY = screenPos.y - 5;
        
        // Sombra del texto
        ctx.strokeText(player.username, nameX, nameY);
        ctx.fillText(player.username, nameX, nameY);

        // Mostrar nivel
        if (player.level) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#fbbf24';
            const levelText = `Nv.${player.level}`;
            ctx.strokeText(levelText, nameX, nameY + 12);
            ctx.fillText(levelText, nameX, nameY + 12);
        }

        ctx.restore();
    }
}

/**
 * Renderizar jugador con fallback (círculo azul)
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {Object} screenPos - Posición en pantalla
 */
function renderPlayerFallback(ctx, screenPos) {
    // Círculo para el cuerpo
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(
        screenPos.x + TILE_SIZE / 2,
        screenPos.y + TILE_SIZE / 2,
        TILE_SIZE / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Borde para distinguir
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();
}

export { TILE_SIZE, ctx };
