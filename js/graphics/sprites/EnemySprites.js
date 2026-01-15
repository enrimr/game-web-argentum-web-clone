/**
 * EnemySprites.js
 * Sprites para enemigos del juego
 */

import { createSprite } from './SpriteCore.js';

export function generateEnemySprites(TILE_SIZE) {
    return {
        // Generic enemy sprite
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

        // Goblin - small green humanoid
        goblin: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#166534';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-3, h/4-1, 2, 2);
            ctx.fillRect(w/2+1, h/4-1, 2, 2);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-2, h/4+2, 4, 2);
        }),

        // Skeleton - bony undead
        skeleton: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
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

        // Bandit - human robber
        bandit: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-3, h/4-1, 2, 2);
            ctx.fillRect(w/2+1, h/4-1, 2, 2);
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/4-4, h/2, 2, h/3);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/4-5, h/2-2, 4, 2);
        }),

        // Orc - large green brute
        orc: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#166534';
            ctx.fillRect(w/6, h/4, w*2/3, h/2);
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-4, h/6-2, 3, 3);
            ctx.fillRect(w/2+1, h/6-2, 3, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-2, h/6+2, 4, 3);
        }),

        // Troll - massive green monster
        troll: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
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

        // Dragon - massive fire-breathing beast
        dragon: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
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

        // Elemental - magical fire spirit
        elemental: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
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

        // Demon - hellish dark creature
        demon: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
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
        }),

        // ===== NUEVOS ENEMIGOS PARA EL MUNDO =====

        // Slime - gelatinous blob
        slime: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#6ee7b7';
            ctx.beginPath();
            ctx.arc(w/2-2, h/2-2, w/8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(w/2+2, h/2-1, w/10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-2, h/2-2, 1, 1);
            ctx.fillRect(w/2+1, h/2-2, 1, 1);
        }),

        // Wolf - canine predator
        wolf: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#374151';
            ctx.fillRect(w/4, h/3, w/2, h/3);
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(w/6, h/4, w/3, h/4);
            ctx.fillRect(w/2, h/4, w/3, h/4);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/6, w/6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-3, h/6-1, 2, 2);
            ctx.fillRect(w/2+1, h/6-1, 2, 2);
            ctx.fillStyle = '#f87171';
            ctx.fillRect(w/2-2, h/6+2, 4, 2);
        }),

        // Spider - eight-legged crawler
        spider: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#1f2937';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#374151';
            // Legs
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const legX = w/2 + Math.cos(angle) * w/3;
                const legY = h/2 + Math.sin(angle) * h/3;
                ctx.fillRect(legX-1, legY-1, 3, 2);
            }
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-2, h/2-2, 2, 2);
            ctx.fillRect(w/2, h/2-2, 2, 2);
        }),

        // Bear - large furry beast
        bear: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/6, h/4, w*2/3, h/2);
            ctx.fillStyle = '#a16207';
            ctx.beginPath();
            ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/6-2, 3, 3);
            ctx.fillRect(w/2+1, h/6-2, 3, 3);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-2, h/6+2, 4, 3);
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.strokeRect(w/6, h/4, w*2/3, h/2);
        }),

        // Mountain Goat - agile climber
        mountain_goat: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#f5f5dc';
            ctx.fillRect(w/4, h/3, w/2, h/3);
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(w/6, h/4, w/3, h/4);
            ctx.fillRect(w/2, h/4, w/3, h/4);
            ctx.fillStyle = '#374151';
            ctx.beginPath();
            ctx.arc(w/2, h/6, w/6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-3, h/6-1, 2, 2);
            ctx.fillRect(w/2+1, h/6-1, 2, 2);
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(w/2-4, h/6-4, 3, 4);
            ctx.fillRect(w/2+1, h/6-4, 3, 4);
        }),

        // Cave Golem - stone construct
        cave_golem: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(w/4, h/4, w/2, h/2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/3, h/3, w/3, h/3);
            ctx.fillStyle = '#374151';
            ctx.beginPath();
            ctx.arc(w/2, h/6, w/5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-2, h/6-1, 2, 2);
            ctx.fillRect(w/2, h/6-1, 2, 2);
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            ctx.strokeRect(w/4, h/4, w/2, h/2);
        }),

        // Ancient Guardian - mystical protector
        ancient_guardian: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#7c3aed';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(w/2, h/5, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-4, h/5-3, 3, 3);
            ctx.fillRect(w/2+1, h/5-3, 3, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/2-2, h/5, 4, 2);
            ctx.strokeStyle = '#4c1d95';
            ctx.lineWidth = 2;
            ctx.strokeRect(w/4, h/3, w/2, h/2);
        }),

        // Mountain Troll - large mountain dweller
        mountain_troll: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#166534';
            ctx.fillRect(w/6, h/4, w*2/3, h/2);
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(w/2-4, h/6-2, 3, 3);
            ctx.fillRect(w/2+1, h/6-2, 3, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-2, h/6+2, 4, 3);
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2-2, Math.PI * 0.7, Math.PI * 0.3);
            ctx.stroke();
        }),

        // Bat - flying mammal
        bat: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#1f2937';
            ctx.beginPath();
            ctx.moveTo(w/2, h/4);
            ctx.lineTo(w/4, h/2);
            ctx.lineTo(w/2, h/3);
            ctx.lineTo(w*3/4, h/2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#374151';
            ctx.fillRect(w/2-3, h/4-2, 2, 4);
            ctx.fillRect(w/2+1, h/4-2, 2, 4);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-2, h/3, 2, 2);
            ctx.fillRect(w/2, h/3, 2, 2);
        }),

        // Cave Troll - underground variant
        cave_troll: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#374151';
            ctx.fillRect(w/6, h/4, w*2/3, h/2);
            ctx.fillStyle = '#4b5563';
            ctx.beginPath();
            ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/6-2, 3, 3);
            ctx.fillRect(w/2+1, h/6-2, 3, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-2, h/6+2, 4, 3);
            ctx.strokeStyle = '#6b7280';
            ctx.lineWidth = 2;
            ctx.strokeRect(w/6, h/4, w*2/3, h/2);
        }),

        // Mountain Giant - enormous mountain creature
        mountain_giant: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(w/8, h/6, w*3/4, h*2/3);
            ctx.fillStyle = '#9ca3af';
            ctx.beginPath();
            ctx.arc(w/2, h/8, w/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-6, h/8-3, 4, 4);
            ctx.fillRect(w/2+2, h/8-3, 4, 4);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-3, h/8+3, 6, 4);
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 3;
            ctx.strokeRect(w/8, h/6, w*3/4, h*2/3);
        })
    };
}
