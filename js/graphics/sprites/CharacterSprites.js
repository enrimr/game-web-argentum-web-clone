/**
 * CharacterSprites.js
 * Sprites para personajes jugables
 */

import { createSprite } from './SpriteCore.js';

export function generateCharacterSprites(TILE_SIZE) {
    return {
        // Character sprites - Base player (facing down - full face visible)
        player: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Body (blue)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Face (yellow, facing down - full face visible)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Eyes (black, looking straight down)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-3, h/4-1, 2, 2);
            ctx.fillRect(w/2+1, h/4-1, 2, 2);
        }),

        // Facing right - eyes looking right
        playerRight: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Body (blue)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Face (yellow, facing right)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Eyes (black, looking right - positioned to the right)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-1, h/4-1, 2, 2);
            ctx.fillRect(w/2+3, h/4-1, 2, 2);
        }),

        // Facing left - eyes looking left
        playerLeft: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Body (blue)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Face (yellow, facing left)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Eyes (black, looking left - positioned to the left)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-5, h/4-1, 2, 2);
            ctx.fillRect(w/2-1, h/4-1, 2, 2);
        }),

        // Facing up - hair visible from behind
        playerUp: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Hair (brown, visible from behind)
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/2-6, h/4-4, 12, 4);
            ctx.fillRect(w/2-4, h/4-2, 8, 2);
            // Body (blue)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Face (yellow, facing up - only bottom visible)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Eyes (black, looking up - positioned higher)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-3, h/4-3, 2, 2);
            ctx.fillRect(w/2+1, h/4-3, 2, 2);
        }),
        
        // Ghost player sprites for all directions
        playerGhost: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (black, looking straight down)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-6, h/3-2, 3, 3);
            ctx.fillRect(w/2+3, h/3-2, 3, 3);
            
            // Ghost mouth (slight oval)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.ellipse(w/2, h/3+4, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        playerGhostUp: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (looking up)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-6, h/3-4, 3, 3);
            ctx.fillRect(w/2+3, h/3-4, 3, 3);
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        playerGhostDown: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (looking down)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-6, h/3, 3, 3);
            ctx.fillRect(w/2+3, h/3, 3, 3);
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        playerGhostLeft: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (looking left)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-8, h/3-2, 3, 3);
            ctx.fillRect(w/2-1, h/3-2, 3, 3);
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        playerGhostRight: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (looking right)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2+1, h/3-2, 3, 3);
            ctx.fillRect(w/2+8, h/3-2, 3, 3);
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        // Sprite para meditación - posición 1 (ligeramente inclinado)
        playerMeditating1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Piernas cruzadas (posición de loto)
            ctx.fillStyle = '#3b82f6';  // Azul para el traje
            // Pierna izquierda
            ctx.beginPath();
            ctx.ellipse(w/2 - w/8, h*3/4, w/6, h/12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pierna derecha
            ctx.beginPath();
            ctx.ellipse(w/2 + w/8, h*3/4, w/6, h/12, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Torso ligeramente inclinado hacia adelante
            ctx.fillStyle = '#3b82f6';  // Azul
            ctx.fillRect(w/3, h/3, w/3, h/3);
            
            // Brazos en posición de meditación (manos sobre rodillas)
            ctx.fillStyle = '#9ca3af';  // Gris
            // Brazo izquierdo
            ctx.beginPath();
            ctx.moveTo(w/3, h/2);
            ctx.lineTo(w/2 - w/8, h*3/4 - h/12);
            ctx.lineTo(w/2 - w/8 - w/20, h*3/4);
            ctx.fill();
            // Brazo derecho
            ctx.beginPath();
            ctx.moveTo(w*2/3, h/2);
            ctx.lineTo(w/2 + w/8, h*3/4 - h/12);
            ctx.lineTo(w/2 + w/8 + w/20, h*3/4);
            ctx.fill();
            
            // Cabeza
            ctx.fillStyle = '#fbbf24';  // Amarillo
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/5, 0, Math.PI * 2);
            ctx.fill();
            
            // Ojos cerrados (líneas horizontales)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2 - w/8, h/4, w/12, 1);
            ctx.fillRect(w/2 + w/16, h/4, w/12, 1);
            
            // Expresión de paz (ligera sonrisa)
            ctx.beginPath();
            ctx.arc(w/2, h/4 + h/16, w/16, 0, Math.PI);
            ctx.stroke();
        }),
        
        // Sprite para meditación - posición 2 (completamente erguido)
        playerMeditating2: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Piernas cruzadas (posición de loto)
            ctx.fillStyle = '#3b82f6';  // Azul para el traje
            // Pierna izquierda
            ctx.beginPath();
            ctx.ellipse(w/2 - w/8, h*3/4, w/6, h/12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pierna derecha
            ctx.beginPath();
            ctx.ellipse(w/2 + w/8, h*3/4, w/6, h/12, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Torso completamente erguido
            ctx.fillStyle = '#3b82f6';  // Azul
            ctx.fillRect(w/3, h/3 - h/20, w/3, h/3 + h/20);
            
            // Brazos en posición de meditación (mudra - dedos tocándose)
            ctx.fillStyle = '#9ca3af';  // Gris
            // Brazo izquierdo
            ctx.beginPath();
            ctx.moveTo(w/3, h/2 - h/10);
            ctx.lineTo(w/2 - w/6, h*2/3);
            ctx.lineTo(w/2 - w/6 - w/20, h*2/3 + h/20);
            ctx.fill();
            // Brazo derecho
            ctx.beginPath();
            ctx.moveTo(w*2/3, h/2 - h/10);
            ctx.lineTo(w/2 + w/6, h*2/3);
            ctx.lineTo(w/2 + w/6 + w/20, h*2/3 + h/20);
            ctx.fill();
            
            // Manos unidas (mudra)
            ctx.fillStyle = '#fbbf24';  // Color piel
            ctx.beginPath();
            ctx.arc(w/2, h*2/3, w/10, 0, Math.PI * 2);
            ctx.fill();
            
            // Cabeza
            ctx.fillStyle = '#fbbf24';  // Amarillo
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/5, 0, Math.PI * 2);
            ctx.fill();
            
            // Ojos cerrados (líneas horizontales)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2 - w/8, h/4, w/12, 1);
            ctx.fillRect(w/2 + w/16, h/4, w/12, 1);
            
            // Expresión de paz (ligera sonrisa)
            ctx.beginPath();
            ctx.arc(w/2, h/4 + h/16, w/16, 0, Math.PI);
            ctx.stroke();
        })
    };
}
