/**
 * SpriteGenerator.js
 * Generación de sprites procedurales del juego
 */

// Generate simple pixel art sprites
function createSprite(width, height, drawFunction) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    const spriteCtx = spriteCanvas.getContext('2d');
    drawFunction(spriteCtx, width, height);
    return spriteCanvas;
}

export function generateAllSprites(TILE_SIZE) {
    return {
        // Terrain sprites
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
            // Trunk
            ctx.fillStyle = '#654321';
            ctx.fillRect(w/2-3, h/2, 6, h/2);
            // Leaves
            ctx.fillStyle = '#228b22';
            ctx.beginPath();
            ctx.arc(w/2, h/3, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#32cd32';
            ctx.beginPath();
            ctx.arc(w/2-3, h/3-2, 8, 0, Math.PI * 2);
            ctx.fill();
        }),

        wall: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#374151';
            ctx.fillRect(w/2-2, h/2-2, 4, 4);
        }),

        building: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(4, 4, 4, 4);
            ctx.fillRect(w-8, 4, 4, 4);
            ctx.fillRect(4, h-8, 4, 4);
            ctx.fillRect(w-8, h-8, 4, 4);
        }),

        floor: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#374151';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(4, 4, 4, 4);
            ctx.fillRect(w-8, 4, 4, 4);
            ctx.fillRect(4, h-8, 4, 4);
            ctx.fillRect(w-8, h-8, 4, 4);
        }),

        dungeonWall: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#374151';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#111827';
            ctx.fillRect(w/2-2, h/2-2, 4, 4);
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

        dungeonDoor: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#374151';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w-6, h/2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-2, 4, 4, 2);
            ctx.fillRect(w/2-1, 6, 2, 6);
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
        }),
        
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
            // Arms (gray)
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            // Sword/Weapon (gold)
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
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
            // Arms (gray)
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            // Sword/Weapon (gold)
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
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
            // Arms (gray)
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            // Sword/Weapon (gold)
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
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
            // Arms (gray)
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            // Sword/Weapon (gold)
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),
        
        // Enemy sprites
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
        }),

        // NPC sprites
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

        // Object sprites
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

        // Item sprites
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

        // Animated player sprites (placeholders - all point to base player sprite for now)
        // Walking animations - with staff movement
        playerWalkUp: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Hair (brown, visible from behind)
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/2-6, h/4-4, 12, 4);
            ctx.fillRect(w/2-4, h/4-2, 8, 2);
            // Body (blue)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Face (yellow, facing up)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Eyes (black, looking up)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-3, h/4-3, 2, 2);
            ctx.fillRect(w/2+1, h/4-3, 2, 2);
            // Arms (gray)
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            // Staff/Weapon (gold) - slightly angled for walking
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-8, h/2-4, 6, 3); // Staff leaning back slightly
        }),

        playerWalkDown: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Body (blue)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Face (yellow, facing down)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Eyes (black, looking down)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-3, h/4-1, 2, 2);
            ctx.fillRect(w/2+1, h/4-1, 2, 2);
            // Arms (gray)
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            // Staff/Weapon (gold) - slightly forward for walking
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-6, h/2-2, 6, 3); // Staff leaning forward slightly
        }),

        playerWalkLeft: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Body (blue)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Face (yellow, facing left)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Eyes (black, looking left)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-5, h/4-1, 2, 2);
            ctx.fillRect(w/2-1, h/4-1, 2, 2);
            // Arms (gray)
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            // Staff/Weapon (gold) - swinging to the side
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-9, h/2-1, 6, 3); // Staff swinging left
        }),

        playerWalkRight: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Body (blue)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Face (yellow, facing right)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Eyes (black, looking right)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-1, h/4-1, 2, 2);
            ctx.fillRect(w/2+3, h/4-1, 2, 2);
            // Arms (gray)
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            // Staff/Weapon (gold) - swinging to the side
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-3, h/2-1, 6, 3); // Staff swinging right
        }),

        // Attack animations
        playerAttackUp: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Attack effect - weapon raised
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-8, h/4-4, 6, 2);
        }),

        playerAttackDown: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Attack effect - weapon extended
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2+4, h/2+4, 6, 2);
        }),

        playerAttackLeft: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Attack effect - weapon to the left
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/4-8, h/2-2, 6, 2);
        }),

        playerAttackRight: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Attack effect - weapon to the right
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2+4, h/2-2, 6, 2);
        }),

        // Talking animations
        playerTalkUp: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Talking effect - speech bubble
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/2-2, h/4-6, 4, 3);
        }),

        playerTalkDown: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Talking effect - speech bubble
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/2-2, h/2+6, 4, 3);
        }),

        playerTalkLeft: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Talking effect - speech bubble
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/4-6, h/2-2, 4, 3);
        }),

        playerTalkRight: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Talking effect - speech bubble
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/2+4, h/2-2, 4, 3);
        }),

        // Idle animations (directional)
        playerIdleUp: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Looking up effect
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4-2, 2, 0, Math.PI * 2);
            ctx.fill();
        }),

        playerIdleDown: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerIdleLeft: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerIdleRight: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        // Frame variations for animations (placeholders)
        playerWalkUp1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Frame 1 effect
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(w/4+3, h/3-1, 2, 2);
        }),

        playerWalkUp2: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Frame 2 effect
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(w/4-1, h/3-1, 2, 2);
        }),

        playerWalkUp3: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            // Frame 3 effect
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(w/4+1, h/3-2, 2, 2);
        }),

        // Similar frames for other directions (simplified placeholders)
        playerWalkDown1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerWalkDown2: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerWalkDown3: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerWalkLeft1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerWalkLeft2: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerWalkLeft3: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerWalkRight1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerWalkRight2: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        playerWalkRight3: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
        }),

        // Attack frames
        playerAttackUp1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-8, h/4-6, 6, 2);
        }),

        playerAttackUp2: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2-10, h/4-8, 8, 2);
        }),

        // Similar attack frames for other directions (placeholders)
        playerAttackDown1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2+4, h/2+6, 6, 2);
        }),

        playerAttackDown2: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2+2, h/2+8, 8, 2);
        }),

        playerAttackLeft1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/4-10, h/2-2, 6, 2);
        }),

        playerAttackLeft2: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/4-12, h/2-2, 8, 2);
        }),

        playerAttackRight1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2+4, h/2-2, 6, 2);
        }),

        playerAttackRight2: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(w/2+6, h/2-2, 8, 2);
        }),

        // Talking frames
        playerTalkUp1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/2-2, h/4-8, 4, 4);
        }),

        playerTalkDown1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/2-2, h/2+6, 4, 4);
        }),

        playerTalkLeft1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/4-8, h/2-2, 4, 4);
        }),

        playerTalkRight1: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/4-6, h/2, 3, h/3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(w/4-7, h/2-3, 5, 3);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(w/2+4, h/2-2, 4, 4);
        }),

        // Interior building tiles
        door: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-2, h/2-2, 4, 4);
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, w, h);
        }),

        wallInterior: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(4, 4, 4, 4);
            ctx.fillRect(w-8, 4, 4, 4);
            ctx.fillRect(4, h-8, 4, 4);
            ctx.fillRect(w-8, h-8, 4, 4);
        }),

        floorInterior: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(4, 4, 4, 4);
            ctx.fillRect(w-8, 4, 4, 4);
            ctx.fillRect(4, h-8, 4, 4);
            ctx.fillRect(w-8, h-8, 4, 4);
        }),

        roof: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Tejas rojas estilo español
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(0, 0, w, h);
            // Líneas de separación de tejas
            ctx.fillStyle = '#991b1b';
            for (let i = 0; i < h; i += 4) {
                ctx.fillRect(0, i, w, 1);
            }
            // Sombra de tejas
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(2, 2, w-4, h-4);
        }),

        window: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            // Marco de ventana
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.strokeRect(4, 4, w-8, h-8);
            // Cristal
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(6, 6, w-12, h-12);
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w/2, 6);
            ctx.lineTo(w/2, h-6);
            ctx.moveTo(6, h/2);
            ctx.lineTo(w-6, h/2);
            ctx.stroke();
        })
    };
}
