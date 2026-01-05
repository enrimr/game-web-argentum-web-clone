/**
 * ObjectSprites.js
 * Sprites para objetos interactivos del juego
 */

import { createSprite } from './SpriteCore.js';

export function generateObjectSprites(TILE_SIZE) {
    return {
        chest: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/4, h/2, w/2, h/3);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-2, h/2+h/6-2, 4, 4);
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.strokeRect(w/4, h/2, w/2, h/3);
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
        
        portal: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#8b5cf6';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2-2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(w/2, h/2, 3, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        arrowProjectile: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#654321';
            ctx.fillRect(w/2-1, h/2-8, 2, 16);
            ctx.fillStyle = '#c0c0c0';
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-10);
            ctx.lineTo(w/2-2, h/2-6);
            ctx.lineTo(w/2+2, h/2-6);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/2-1, h/2+6, 2, 2);
        })
    };
}
