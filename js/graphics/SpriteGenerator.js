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
        
        // Character sprites
        player: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
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
            ctx.arc(w/2, h/4, w/4, 0, Math.PI *
