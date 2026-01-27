/**
 * CustomCharacterSprites.js
 * Genera sprites personalizados basados en la apariencia del personaje
 */

import { createSprite } from './SpriteCore.js';
import { SKIN_COLORS, TUNIC_COLORS, HAIR_COLORS } from '../../systems/CharacterManager.js';

/**
 * Generar sprites personalizados para un personaje
 * @param {Object} appearance - Apariencia del personaje {race, skinColor, tunicColor, hairColor, hairStyle}
 * @param {number} TILE_SIZE - Tamaño del tile
 * @returns {Object} Sprites personalizados
 */
export function generateCustomCharacterSprites(appearance, TILE_SIZE) {
    const { race, skinColor, tunicColor, hairColor, hairStyle } = appearance;
    
    // Obtener colores hex
    const skinHex = SKIN_COLORS[skinColor?.toUpperCase()]?.hex || '#fde68a';
    const tunicHex = TUNIC_COLORS[tunicColor?.toUpperCase()]?.hex || '#3b82f6';
    const hairHex = HAIR_COLORS[hairColor?.toUpperCase()]?.hex || '#1f2937';
    
    // Determinar proporciones según la raza
    const raceId = race?.toLowerCase() || 'human';
    const bodyProportions = getRaceBodyProportions(raceId);
    
    return {
        player: createPlayerSprite(TILE_SIZE, 'down', skinHex, tunicHex, hairHex, hairStyle, bodyProportions),
        playerRight: createPlayerSprite(TILE_SIZE, 'right', skinHex, tunicHex, hairHex, hairStyle, bodyProportions),
        playerLeft: createPlayerSprite(TILE_SIZE, 'left', skinHex, tunicHex, hairHex, hairStyle, bodyProportions),
        playerUp: createPlayerSprite(TILE_SIZE, 'up', skinHex, tunicHex, hairHex, hairStyle, bodyProportions)
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
                bodyHeight: 0.45,
                bodyWidth: 0.65,
                bodyY: 0.35,
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
function createPlayerSprite(TILE_SIZE, direction, skinColor, tunicColor, hairColor, hairStyle, bodyProportions) {
    return createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        const { headSize, bodyHeight, bodyWidth, bodyY, isCreature } = bodyProportions;
        
        const headRadius = w * headSize;
        const bodyStartY = h * bodyY;
        const bodyW = w * bodyWidth;
        const bodyH = h * bodyHeight;
        const bodyX = (w - bodyW) / 2;
        
        // Cabello atrás (UP)
        if (direction === 'up' && hairStyle !== 'bald') {
            ctx.fillStyle = hairColor;
            drawHair(ctx, w/2, h/4, headRadius, hairColor, hairStyle, direction);
        }
        
        // Cuerpo/túnica
        if (isCreature) {
            drawRaggedTunic(ctx, bodyX, bodyStartY, bodyW, bodyH, tunicColor);
        } else {
            ctx.fillStyle = tunicColor;
            ctx.fillRect(bodyX, bodyStartY, bodyW, bodyH);
        }
        
        // Cabeza
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(w/2, h/4, headRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojos
        drawEyes(ctx, w, h, direction);
        
        // Colmillos si es criatura
        if (isCreature) {
            drawCreatureFangs(ctx, w, h, direction);
        }
        
        // Cabello adelante (no UP)
        if (direction !== 'up' && hairStyle !== 'bald') {
            ctx.fillStyle = hairColor;
            drawHair(ctx, w/2, h/4, headRadius, hairColor, hairStyle, direction);
        }
    });
}

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

function drawHair(ctx, x, y, radius, color, style, direction) {
    ctx.fillStyle = color;
    const hairStyle = style?.toLowerCase() || 'short';
    switch (hairStyle) {
        case 'short':
            drawShortHair(ctx, x, y, radius, direction);
            break;
        case 'long':
            drawLongHair(ctx, x, y, radius, direction);
            break;
        case 'ponytail':
            drawPonytail(ctx, x, y, radius, direction);
            break;
        case 'braids':
            drawBraids(ctx, x, y, radius, direction);
            break;
    }
}

function drawShortHair(ctx, x, y, radius, direction) {
    if (direction === 'up') {
        ctx.fillRect(x - radius * 0.8, y - radius * 1.1, radius * 1.6, radius * 0.6);
    } else {
        ctx.fillRect(x - radius * 0.9, y - radius * 1.2, radius * 1.8, radius * 0.5);
    }
}

function drawLongHair(ctx, x, y, radius, direction) {
    if (direction === 'up') {
        ctx.fillRect(x - radius * 0.9, y - radius * 1.1, radius * 1.8, radius * 2.5);
    } else {
        ctx.fillRect(x - radius * 1.0, y - radius * 1.2, radius * 2.0, radius * 2.2);
    }
}

function drawPonytail(ctx, x, y, radius, direction) {
    if (direction === 'up') {
        ctx.fillRect(x - radius * 0.6, y - radius * 1.1, radius * 1.2, radius * 0.5);
        ctx.fillRect(x - radius * 0.3, y - radius * 0.6, radius * 0.6, radius * 2.0);
    } else {
        ctx.fillRect(x - radius * 0.8, y - radius * 1.2, radius * 1.6, radius * 0.5);
        if (direction === 'right') {
            ctx.fillRect(x + radius * 0.4, y - radius * 0.3, radius * 0.5, radius * 1.5);
        } else if (direction === 'left') {
            ctx.fillRect(x - radius * 0.9, y - radius * 0.3, radius * 0.5, radius * 1.5);
        }
    }
}

function drawBraids(ctx, x, y, radius, direction) {
    if (direction === 'up') {
        ctx.fillRect(x - radius * 0.9, y - radius * 1.1, radius * 1.8, radius * 0.5);
        ctx.fillRect(x - radius * 0.7, y - radius * 0.6, radius * 0.4, radius * 2.0);
        ctx.fillRect(x + radius * 0.3, y - radius * 0.6, radius * 0.4, radius * 2.0);
    } else {
        ctx.fillRect(x - radius * 0.9, y - radius * 1.2, radius * 1.8, radius * 0.5);
        ctx.fillRect(x - radius * 1.0, y - radius * 0.3, radius * 0.4, radius * 1.5);
        ctx.fillRect(x + radius * 0.6, y - radius * 0.3, radius * 0.4, radius * 1.5);
    }
}