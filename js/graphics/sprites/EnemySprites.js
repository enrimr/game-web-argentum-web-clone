/**
 * EnemySprites.js
 * Sprites para enemigos del juego
 */

import { createSprite } from './SpriteCore.js';

export function generateEnemySprites(TILE_SIZE) {
    return {
        enemy: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#15803d';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
        }),

        enemySkeleton: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#f5f5dc';
            ctx.fillRect(w/2-2, h/2-6, 4, 12);
            ctx.fillRect(w/2-6, h/2-2, 12, 4);
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-3, h/4-1, 2, 2);
            ctx.fillRect(w/2+1, h/4-1, 2, 2);
        }),

        enemyTroll: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#166534';
            ctx.fillRect(w/6, h/4, w*2/3, h/2);
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-4, h/6-2, 3, 3);
            ctx.fillRect(w/2+1, h/6-2, 3, 3);
            ctx.fillStyle = '#f5f5dc';
            ctx.fillRect(w/2-3, h/6+2, 2, 4);
            ctx.fillRect(w/2+1, h/6+2, 2, 4);
        }),
        
        enemyDragon: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#7c2d12';
            ctx.fillRect(w/4, h/3, w/2, h/3);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(w/6, h/4, w/3, h/4);
            ctx.fillRect(w/2, h/4, w/3, h/4);
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.arc(w/2, h/6, w/5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-3, h/6-1, 2, 2);
            ctx.fillRect(w/2+1, h/6-1, 2, 2);
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/6-4, 2, 4);
            ctx.fillRect(w/2+2, h/6-4, 2, 4);
        }),

        enemyElemental: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.moveTo(w/2, h/6);
            ctx.lineTo(w/2-3, h/3);
            ctx.lineTo(w/2+3, h/3);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(w/2-4, h/2);
            ctx.lineTo(w/2-2, h/4);
            ctx.lineTo(w/2, h/2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(w/2+4, h/2);
            ctx.lineTo(w/2+2, h/4);
            ctx.lineTo(w/2, h/2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/6, 0, Math.PI * 2);
            ctx.fill();
        }),

        enemyDemon: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(w/2, h/5, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-5, h/5-6, 3, 6);
            ctx.fillRect(w/2+2, h/5-6, 3, 6);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(w/2-4, h/5-2, 3, 3);
            ctx.fillRect(w/2+1, h/5-2, 3, 3);
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2-2, Math.PI * 0.7, Math.PI * 0.3);
            ctx.stroke();
        })
    };
}
