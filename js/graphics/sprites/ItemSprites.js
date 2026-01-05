/**
 * ItemSprites.js
 * Sprites para items y objetos de inventario
 */

import { createSprite } from './SpriteCore.js';

export function generateItemSprites(TILE_SIZE) {
    return {
        potion: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-4, h/2-2, 8, 10);
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(w/2-3, h/2+3, 6, 2);
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/2-2, h/2-4, 4, 3);
        }),

        potionBlue: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(w/2-4, h/2-2, 8, 10);
            ctx.fillStyle = '#1e40af';
            ctx.fillRect(w/2-3, h/2+3, 6, 2);
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/2-2, h/2-4, 4, 3);
        }),

        potionGreen: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(w/2-4, h/2-2, 8, 10);
            ctx.fillStyle = '#15803d';
            ctx.fillRect(w/2-3, h/2+3, 6, 2);
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/2-2, h/2-4, 4, 3);
        }),

        arrow: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(w/2-1, h/2-6, 2, 12);
            ctx.fillStyle = '#9ca3af';
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-8);
            ctx.lineTo(w/2-3, h/2-3);
            ctx.lineTo(w/2+3, h/2-3);
            ctx.fill();
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(w/2-2, h/2+4, 4, 2);
        }),

        sword: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/2-2, h/2-8, 4, 12);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-4, h/2-2, 8, 2);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(w/2-2, h/2, 4, 4);
        }),

        shield: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(w/2, h/2, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w/2, h/2, 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/2-1, h/2-6, 2, 12);
            ctx.fillRect(w/2-6, h/2-1, 12, 2);
        }),

        bow: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(w/2, h/2, 8, Math.PI * 0.3, Math.PI * 0.7);
            ctx.stroke();
            ctx.strokeStyle = '#f5f5dc';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w/2 + Math.cos(Math.PI * 0.3) * 8, h/2 + Math.sin(Math.PI * 0.3) * 8);
            ctx.lineTo(w/2 + Math.cos(Math.PI * 0.7) * 8, h/2 + Math.sin(Math.PI * 0.7) * 8);
            ctx.stroke();
            ctx.fillStyle = '#654321';
            ctx.fillRect(w/2-1, h/2+2, 3, 6);
        })
    };
}
