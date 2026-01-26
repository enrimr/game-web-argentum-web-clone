/**
 * sprite-generator.js
 * Sistema de generación de sprites para el manual
 */

// Sistema de generación de sprites básico
function createSprite(width, height, drawFunction) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.imageRendering = 'pixelated';
    const ctx = canvas.getContext('2d');
    drawFunction(ctx, width, height);
    return canvas;
}

// Generador de sprites de items
export const itemSprites = {
    potion: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-4, h/2-2, 8, 10);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(w/2-3, h/2+3, 6, 2);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/2-2, h/2-4, 4, 3);
    }),
    potionBlue: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(w/2-4, h/2-2, 8, 10);
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(w/2-3, h/2+3, 6, 2);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/2-2, h/2-4, 4, 3);
    }),
    potionGreen: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(w/2-4, h/2-2, 8, 10);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(w/2-3, h/2+3, 6, 2);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/2-2, h/2-4, 4, 3);
    }),
    arrow: (size) => createSprite(size, size, (ctx, w, h) => {
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
    sword: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(w/2-2, h/2-8, 4, 12);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2-4, h/2-2, 8, 2);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(w/2-2, h/2, 4, 4);
    }),
    shield: (size) => createSprite(size, size, (ctx, w, h) => {
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
    bow: (size) => createSprite(size, size, (ctx, w, h) => {
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
    }),
    armor: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(w/4, h/3, w/2, 3);
        ctx.fillRect(w/4, h/2, w/2, 2);
    }),
    helmet: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(w/2 - w/5, h/4 - w/5, w/2.5, w/2.5);
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2 - w/8, h/4, w/4, 2);
    }),
    robe: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillRect(w/4 - 2, h/2 + 2, w/2 + 4, h/3);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2 - 1, h/3, 2, h/4);
    }),
    spellbook: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(w/4, h/4, w/2, h/2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/4 + 2, h/4 + 2, w/2 - 4, h/2 - 4);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(w/2 - 1, h/4 + 2, 2, h/2 - 4);
    }),
    scroll: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(w/4, h/3, w/2, h/3);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(w/4, h/3 + 2, w/2, 1);
        ctx.fillRect(w/4, h/3 + 6, w/2, 1);
    })
};

// Generador de sprites de NPCs
export const npcSprites = {
    merchant: (size) => createSprite(size, size, (ctx, w, h) => {
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
    blacksmith: (size) => createSprite(size, size, (ctx, w, h) => {
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
    healer: (size) => createSprite(size, size, (ctx, w, h) => {
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
    banker: (size) => createSprite(size, size, (ctx, w, h) => {
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
    trainer: (size) => createSprite(size, size, (ctx, w, h) => {
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
    alchemist: (size) => createSprite(size, size, (ctx, w, h) => {
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
    guard: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-4, h/4-2, 2, 2);
        ctx.fillRect(w/2+2, h/4-2, 2, 2);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(w/2-6, h/4-6, 12, 4);
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(w/4-8, h/2, 2, h/3);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/4-9, h/2-2, 4, 2);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/4+w/2+2, h/2, 6, 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(w/4+w/2+3, h/2+3, 4, 2);
        ctx.fillRect(w/4+w/2+4, h/2+2, 2, 4);
    }),
    mage: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-4, h/4-2, 2, 2);
        ctx.fillRect(w/2+2, h/4-2, 2, 2);
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(w/2-2, h/4+4, 4, 4);
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.moveTo(w/2-8, h/4-2);
        ctx.lineTo(w/2+8, h/4-2);
        ctx.lineTo(w/2+6, h/4-8);
        ctx.lineTo(w/2-6, h/4-8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/4-4, h/2, 2, h/3);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w/4-3, h/2-2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/2-2, 0, Math.PI * 2);
        ctx.stroke();
    }),
    carpenter: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-4, h/4-2, 2, 2);
        ctx.fillRect(w/2+2, h/4-2, 2, 2);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(w/2-3, h/4+3, 6, 2);
        ctx.fillRect(w/2-6, h/4-6, 12, 4);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2-4, h/4-4, 8, 2);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(w/4-6, h/2, 4, 2);
        ctx.fillRect(w/4-4, h/2+2, 2, 6);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/4-5, h/2-2, 3, 2);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(w/4, h/3-2, w/2, 3);
        ctx.fillStyle = '#374151';
        ctx.fillRect(w/4+2, h/3-1, 2, 2);
        ctx.fillRect(w/4+w/2-4, h/3-1, 2, 2);
    })
};

// Generador de sprites de enemigos
export const enemySprites = {
    bat: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.moveTo(w/2, h/4);
        ctx.lineTo(w/4, h/2);
        ctx.lineTo(w/2, h/3);
        ctx.lineTo(w*3/4, h/2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-2, h/3, 2, 2);
        ctx.fillRect(w/2, h/3, 2, 2);
    }),
    slime: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-2, h/2-2, 1, 1);
        ctx.fillRect(w/2+1, h/2-2, 1, 1);
    }),
    bandit: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-3, h/4-1, 2, 2);
        ctx.fillRect(w/2+1, h/4-1, 2, 2);
    }),
    skeleton: (size) => createSprite(size, size, (ctx, w, h) => {
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
    spider: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#374151';
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const legX = w/2 + Math.cos(angle) * w/3;
            const legY = h/2 + Math.sin(angle) * h/3;
            ctx.fillRect(legX-1, legY-1, 3, 2);
        }
    }),
    goblin: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#166534';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-3, h/4-1, 2, 2);
        ctx.fillRect(w/2+1, h/4-1, 2, 2);
    }),
    wolf: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#374151';
        ctx.fillRect(w/4, h/3, w/2, h/3);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(w/6, h/4, w/3, h/4);
        ctx.fillRect(w/2, h/4, w/3, h/4);
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-3, h/6-1, 2, 2);
        ctx.fillRect(w/2+1, h/6-1, 2, 2);
    }),
    goat: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(w/4, h/3, w/2, h/3);
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(w/2, h/6, w/6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(w/2-4, h/6-4, 3, 4);
        ctx.fillRect(w/2+1, h/6-4, 3, 4);
    }),
    orc: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#166534';
        ctx.fillRect(w/6, h/4, w*2/3, h/2);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2-4, h/6-2, 3, 3);
        ctx.fillRect(w/2+1, h/6-2, 3, 3);
    }),
    elemental: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/6, 0, Math.PI * 2);
        ctx.fill();
    }),
    demon: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(w/2, h/5, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-5, h/5-6, 3, 6);
        ctx.fillRect(w/2+2, h/5-6, 3, 6);
    }),
    bear: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/6, h/4, w*2/3, h/2);
        ctx.fillStyle = '#a16207';
        ctx.beginPath();
        ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-4, h/6-2, 3, 3);
        ctx.fillRect(w/2+1, h/6-2, 3, 3);
    }),
    caveTroll: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#374151';
        ctx.fillRect(w/6, h/4, w*2/3, h/2);
        ctx.fillStyle = '#4b5563';
        ctx.beginPath();
        ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-2, h/6+2, 4, 3);
    }),
    troll: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#166534';
        ctx.fillRect(w/6, h/4, w*2/3, h/2);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(w/2-3, h/6+2, 2, 4);
        ctx.fillRect(w/2+1, h/6+2, 2, 4);
    }),
    mountainTroll: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#166534';
        ctx.fillRect(w/6, h/4, w*2/3, h/2);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(w/2, h/6, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(w/2-4, h/6-2, 3, 3);
    }),
    golem: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(w/4, h/4, w/2, h/2);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(w/3, h/3, w/3, h/3);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-2, h/6-1, 2, 2);
        ctx.fillRect(w/2, h/6-1, 2, 2);
    }),
    guardian: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(w/2, h/5, w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2-4, h/5-3, 3, 3);
        ctx.fillRect(w/2+1, h/5-3, 3, 3);
    }),
    dragon: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(w/4, h/3, w/2, h/3);
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(w/2, h/6, w/5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w/2-3, h/6-1, 2, 2);
        ctx.fillRect(w/2+1, h/6-1, 2, 2);
    }),
    giant: (size) => createSprite(size, size, (ctx, w, h) => {
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(w/8, h/6, w*3/4, h*2/3);
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.arc(w/2, h/8, w/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2-6, h/8-3, 4, 4);
        ctx.fillRect(w/2+2, h/8-3, 4, 4);
    })
};
