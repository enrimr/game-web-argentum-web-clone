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
        
        // Ghost player sprites for all directions
        playerGhost: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (black, looking straight down)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-6, h/3-2, 3, 3);
            ctx.fillRect(w/2+3, h/3-2, 3, 3);
            
            // Ghost mouth (slight oval)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.ellipse(w/2, h/3+4, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        playerGhostUp: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (looking up)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-6, h/3-4, 3, 3);
            ctx.fillRect(w/2+3, h/3-4, 3, 3);
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        playerGhostDown: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (looking down)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-6, h/3, 3, 3);
            ctx.fillRect(w/2+3, h/3, 3, 3);
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        playerGhostLeft: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (looking left)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-8, h/3-2, 3, 3);
            ctx.fillRect(w/2-1, h/3-2, 3, 3);
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        playerGhostRight: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Use semi-transparent white/blue for ghost body
            ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(w/2, h/3, w/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost body (flowing shape)
            ctx.beginPath();
            ctx.moveTo(w/4, h/3);
            ctx.quadraticCurveTo(w/4, h/2+h/4, w/2, h-2);
            ctx.quadraticCurveTo(w*3/4, h/2+h/4, w*3/4, h/3);
            ctx.fill();
            
            // Wavy bottom
            ctx.beginPath();
            ctx.moveTo(w/4, h/2+h/6);
            ctx.quadraticCurveTo(w/3, h/2+h/4, w/2-w/10, h/2+h/8);
            ctx.quadraticCurveTo(w/2, h/2+h/6, w/2+w/10, h/2+h/8);
            ctx.quadraticCurveTo(w*2/3, h/2+h/4, w*3/4, h/2+h/6);
            ctx.fill();
            
            // Ghost eyes (looking right)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2+1, h/3-2, 3, 3);
            ctx.fillRect(w/2+8, h/3-2, 3, 3);
            
            // Ghostly glow effect
            ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2.5, 0, Math.PI * 2);
            ctx.fill();
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
