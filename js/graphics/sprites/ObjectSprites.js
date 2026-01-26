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
        }),

        // Recursos recolectables
        tree: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Tronco del árbol
            ctx.fillStyle = '#78350f';
            ctx.fillRect(w/2-3, h/2+2, 6, 10);
            // Copa del árbol (círculos verdes superpuestos)
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.arc(w/2-6, h/2-2, 7, 0, Math.PI * 2);
            ctx.arc(w/2+6, h/2-2, 7, 0, Math.PI * 2);
            ctx.arc(w/2, h/2-6, 8, 0, Math.PI * 2);
            ctx.fill();
            // Sombreado de la copa
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(w/2, h/2, 6, 0, Math.PI);
            ctx.fill();
        }),

        treeStump: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Tocón después de talar
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/2-5, h/2+4, 10, 6);
            // Anillos del tronco
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(w/2, h/2+4, 4, 0, Math.PI * 2);
            ctx.arc(w/2, h/2+4, 2, 0, Math.PI * 2);
            ctx.stroke();
            // Sombra
            ctx.fillStyle = '#451a03';
            ctx.fillRect(w/2-5, h/2+9, 10, 1);
        }),

        ironVein: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Roca grande con vetas de hierro
            ctx.fillStyle = '#78716c';
            ctx.fillRect(w/2-8, h/2-4, 16, 12);
            // Vetas grises brillantes
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/2-4, h/2-2, 3, 4);
            ctx.fillRect(w/2+2, h/2, 4, 3);
            ctx.fillRect(w/2-2, h/2+3, 5, 2);
            // Bordes oscuros
            ctx.strokeStyle = '#57534e';
            ctx.lineWidth = 2;
            ctx.strokeRect(w/2-8, h/2-4, 16, 12);
        }),

        goldVein: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Roca con vetas de oro
            ctx.fillStyle = '#78716c';
            ctx.fillRect(w/2-8, h/2-4, 16, 12);
            // Vetas doradas brillantes
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-4, h/2-2, 3, 4);
            ctx.fillRect(w/2+2, h/2, 4, 3);
            ctx.fillRect(w/2-2, h/2+3, 5, 2);
            // Brillo dorado
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(w/2-3, h/2-1, 1, 1);
            ctx.fillRect(w/2+3, h/2+1, 1, 1);
            ctx.fillRect(w/2, h/2+3, 1, 1);
            // Bordes
            ctx.strokeStyle = '#57534e';
            ctx.lineWidth = 2;
            ctx.strokeRect(w/2-8, h/2-4, 16, 12);
        }),

        silverVein: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Roca con vetas de plata
            ctx.fillStyle = '#78716c';
            ctx.fillRect(w/2-8, h/2-4, 16, 12);
            // Vetas plateadas brillantes
            ctx.fillStyle = '#d1d5db';
            ctx.fillRect(w/2-4, h/2-2, 3, 4);
            ctx.fillRect(w/2+2, h/2, 4, 3);
            ctx.fillRect(w/2-2, h/2+3, 5, 2);
            // Brillo plateado
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(w/2-3, h/2-1, 1, 1);
            ctx.fillRect(w/2+3, h/2+1, 1, 1);
            // Bordes
            ctx.strokeStyle = '#57534e';
            ctx.lineWidth = 2;
            ctx.strokeRect(w/2-8, h/2-4, 16, 12);
        })
    };
}
