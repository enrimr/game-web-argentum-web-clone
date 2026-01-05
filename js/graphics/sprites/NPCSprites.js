/**
 * NPCSprites.js
 * Sprites para NPCs (Non-Player Characters) del juego
 */

import { createSprite } from './SpriteCore.js';

export function generateNPCSprites(TILE_SIZE) {
    return {
        // Sprite genérico para NPC por defecto
        npc: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo
            ctx.fillStyle = '#d97706';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Cabeza
            ctx.fillStyle = '#fdba74';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-1, 2, 2);
            ctx.fillRect(w/2+2, h/4-1, 2, 2);
            // Boca
            ctx.beginPath();
            ctx.moveTo(w/2-3, h/4+3);
            ctx.lineTo(w/2+3, h/4+3);
            ctx.stroke();
        }),

        npc_merchant: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#15803d';
            ctx.fillRect(w/2-6, h/4-6, 12, 3);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/4-2, h/2+6, 4, 0, Math.PI * 2);
            ctx.fill();
        }),

        npc_blacksmith: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-8, h/2, 4, h/3);
            ctx.fillStyle = '#374151';
            ctx.fillRect(w/4-10, h/2-2, 8, 4);
        }),

        npc_healer: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-1, h/2-4, 2, 10);
            ctx.fillRect(w/2-4, h/2-1, 8, 2);
        }),

        npc_banker: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fef3c7';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/4-2, h/2+6, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(w/2-4, h/4-8, 8, 4);
            ctx.fillRect(w/2-6, h/4-4, 12, 2);
        }),

        npc_trainer: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#7c3aed';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/2-3, h/4+2, 6, 6);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(w/4-6, h/3, 2, h/2);
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(w/4-5, h/3-2, 3, 0, Math.PI * 2);
            ctx.fill();
        }),

        npc_alchemist: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#065f46';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#d1d5db';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#10b981';
            ctx.fillRect(w/4-4, h/2+4, 4, 6);
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/4-3, h/2+3, 2, 2);
        }),

        npc_guard: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Armadura plateada
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Cara (piel)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            // Casco (gris oscuro)
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(w/2-6, h/4-6, 12, 4);
            // Espada (plateada)
            ctx.fillStyle = '#d1d5db';
            ctx.fillRect(w/4-8, h/2, 2, h/3);
            // Empuñadura dorada
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/4-9, h/2-2, 4, 2);
            // Escudo (rojo con cruz blanca)
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/4+w/2+2, h/2, 6, 8);
            ctx.fillStyle = '#fff';
            ctx.fillRect(w/4+w/2+3, h/2+3, 4, 2);
            ctx.fillRect(w/4+w/2+4, h/2+2, 2, 4);
        })
    };
}
