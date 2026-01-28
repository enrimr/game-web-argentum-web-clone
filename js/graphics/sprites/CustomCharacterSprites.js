/**
 * CustomCharacterSprites.js
 * Genera sprites personalizados basados en la apariencia del personaje
 */

import { createSprite } from './SpriteCore.js';
import { SKIN_COLORS, TUNIC_COLORS } from '../../systems/CharacterManager.js';

/**
 * Generar sprites personalizados para un personaje
 * @param {Object} appearance - Apariencia del personaje {race, skinColor, tunicColor}
 * @param {number} TILE_SIZE - Tamaño del tile
 * @returns {Object} Sprites personalizados
 */
export function generateCustomCharacterSprites(appearance, TILE_SIZE) {
    const { race, skinColor, tunicColor } = appearance;
    
    // Obtener colores hex
    const skinHex = SKIN_COLORS[skinColor?.toUpperCase()]?.hex || '#fde68a';
    const tunicHex = TUNIC_COLORS[tunicColor?.toUpperCase()]?.hex || '#3b82f6';
    
    // Determinar proporciones según la raza
    const raceId = race?.toLowerCase() || 'human';
    const bodyProportions = getRaceBodyProportions(raceId);
    
    return {
        player: createPlayerSprite(TILE_SIZE, 'down', skinHex, tunicHex, bodyProportions),
        playerRight: createPlayerSprite(TILE_SIZE, 'right', skinHex, tunicHex, bodyProportions),
        playerLeft: createPlayerSprite(TILE_SIZE, 'left', skinHex, tunicHex, bodyProportions),
        playerUp: createPlayerSprite(TILE_SIZE, 'up', skinHex, tunicHex, bodyProportions)
    };
}

/**
 * Obtener proporciones del cuerpo según la raza
 */
function getRaceBodyProportions(race) {
    switch (race) {
        case 'dwarf':
            return {
                headSize: 0.28,
                bodyHeight: 0.35,
                bodyWidth: 0.55,
                bodyY: 0.4,
                isCreature: false
            };
        case 'creature':
            return {
                headSize: 0.30,
                bodyHeight: 0.5,     // Misma altura que humano
                bodyWidth: 0.65,
                bodyY: 0.33,         // Misma posición Y que humano
                isCreature: true
            };
        default: // human
            return {
                headSize: 0.25,
                bodyHeight: 0.5,
                bodyWidth: 0.5,
                bodyY: 0.33,
                isCreature: false
            };
    }
}

/**
 * Crear sprite del jugador en una dirección específica
 */
function createPlayerSprite(TILE_SIZE, direction, skinColor, tunicColor, bodyProportions) {
    return createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        const { headSize, bodyHeight, bodyWidth, bodyY, isCreature } = bodyProportions;
        
        const headRadius = w * headSize;
        const bodyStartY = h * bodyY;
        const bodyW = w * bodyWidth;
        const bodyH = h * bodyHeight;
        const bodyX = (w - bodyW) / 2;
        
        // Dibujar cuerpo/túnica
        if (isCreature) {
            drawRaggedTunic(ctx, bodyX, bodyStartY, bodyW, bodyH, tunicColor);
        } else {
            ctx.fillStyle = tunicColor;
            ctx.fillRect(bodyX, bodyStartY, bodyW, bodyH);
        }
        
        // Dibujar cabeza
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(w/2, h/4, headRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Dibujar ojos
        drawEyes(ctx, w, h, direction);
        
        // Dibujar colmillos si es criatura
        if (isCreature) {
            drawCreatureFangs(ctx, w, h, direction);
        }
    });
}

/**
 * Dibujar ojos según dirección
 */
function drawEyes(ctx, w, h, direction) {
    ctx.fillStyle = '#000';
    switch (direction) {
        case 'down':
            ctx.fillRect(w/2-3, h/4-1, 2, 2);
            ctx.fillRect(w/2+1, h/4-1, 2, 2);
            break;
        case 'up':
            ctx.fillRect(w/2-3, h/4-3, 2, 2);
            ctx.fillRect(w/2+1, h/4-3, 2, 2);
            break;
        case 'left':
            ctx.fillRect(w/2-5, h/4-1, 2, 2);
            ctx.fillRect(w/2-1, h/4-1, 2, 2);
            break;
        case 'right':
            ctx.fillRect(w/2-1, h/4-1, 2, 2);
            ctx.fillRect(w/2+3, h/4-1, 2, 2);
            break;
    }
}

/**
 * Dibujar túnica rasgada (para criaturas)
 */
function drawRaggedTunic(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h * 0.7);
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.7);
    const ragCount = 5;
    const ragWidth = w / ragCount;
    for (let i = 0; i <= ragCount; i++) {
        const ragX = x + i * ragWidth;
        const ragY = i % 2 === 0 ? y + h * 0.8 : y + h * 0.9;
        ctx.lineTo(ragX, ragY);
    }
    ctx.lineTo(x + w, y + h * 0.7);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, y + h * 0.65, w, 2);
}

/**
 * Dibujar colmillos de criatura
 */
function drawCreatureFangs(ctx, w, h, direction) {
    if (direction === 'up') return;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(w/2 - 4, h/4 + 3);
    ctx.lineTo(w/2 - 3, h/4 + 7);
    ctx.lineTo(w/2 - 5, h/4 + 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w/2 + 4, h/4 + 3);
    ctx.lineTo(w/2 + 3, h/4 + 7);
    ctx.lineTo(w/2 + 5, h/4 + 3);
    ctx.fill();
}