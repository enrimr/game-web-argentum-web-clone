/**
 * TerrainSprites.js
 * Sprites para terrenos y elementos naturales
 */

import { createSprite } from './SpriteCore.js';

export function generateTerrainSprites(TILE_SIZE) {
    return {
        grass: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#2d5016';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#3a6b1f';
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                ctx.fillRect(x, y, 2, 2);
            }
        }),
        
        water: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#1e40af';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(4, 4, w-8, h-8);
        }),
        
        stone: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#374151';
            ctx.fillRect(w/2-2, h/2-2, 4, 4);
        }),
        
        tree: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Limpia el contexto para asegurar transparencia
            ctx.clearRect(0, 0, w, h);
            
            // Tronco del árbol
            ctx.fillStyle = '#654321';
            ctx.fillRect(w/2-3, h/2, 6, h/2);
            
            // Hojas (varias capas para dar profundidad)
            ctx.fillStyle = '#228b22';
            ctx.beginPath();
            ctx.arc(w/2, h/3, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#32cd32';
            ctx.beginPath();
            ctx.arc(w/2-3, h/3-2, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Algunos detalles de hojas para dar textura
            ctx.fillStyle = '#3a6b1f';
            ctx.beginPath();
            ctx.arc(w/2+4, h/3+2, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Pequeño detalle de luz en las hojas
            ctx.fillStyle = '#90ee90';
            ctx.beginPath();
            ctx.arc(w/2-2, h/3-4, 3, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        path: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#a16207';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#92400e';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(4, 4, 3, 3);
            ctx.fillRect(w-7, h-7, 3, 3);
            ctx.fillRect(w/2-1, h/2-1, 3, 3);
        })
    };
}
