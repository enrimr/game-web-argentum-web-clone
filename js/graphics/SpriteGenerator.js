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
        
        // Elementos de edificios
        facade: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Color base para la fachada (más claro que los muros)
            ctx.fillStyle = '#d97706'; // Naranja/marrón claro
            ctx.fillRect(0, 0, w, h);
            
            // Textura de ladrillo para la fachada
            ctx.fillStyle = '#b45309'; // Líneas de ladrillo (más oscuro)
            
            // Líneas horizontales para simular hileras de ladrillos
            for (let y = 2; y < h; y += 4) {
                ctx.fillRect(0, y, w, 1);
            }
            
            // Líneas verticales alternas para simular ladrillos individuales
            for (let y = 0; y < h; y += 8) {
                for (let x = 2; x < w; x += 6) {
                    ctx.fillRect(x, y, 1, 4);
                    ctx.fillRect(x + 3, y + 4, 1, 4);
                }
            }
            
            // Detalles decorativos (borde inferior más oscuro)
            ctx.fillStyle = '#92400e'; // Marrón más oscuro
            ctx.fillRect(0, h-2, w, 2);
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
        }),

        doorShadow: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Base de grass
            ctx.fillStyle = '#2d5016';
            ctx.fillRect(0, 0, w, h);
            // Sombra oscura semi-transparente frente a la puerta
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, w, h);
            // Indicador visual sutil (línea más oscura abajo)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, h-4, w, 4);
        }),
        
        // Alias para mantener compatibilidad con código existente
        doorOpen: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Marco de la puerta (similar a la pared pero más oscuro)
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            
            // Interior visible (como el suelo interior)
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            
            // Puerta abierta hacia un lado (simulación visual)
            ctx.fillStyle = '#78350f'; // Color marrón oscuro para puerta
            ctx.fillRect(2, 2, 6, h-4); // Puerta abierta a la izquierda
            
            // Bisagras
            ctx.fillStyle = '#fbbf24'; // Detalles dorados
            ctx.fillRect(3, 5, 3, 2); // Bisagra superior
            ctx.fillRect(3, h-7, 3, 2); // Bisagra inferior
            
            // Marco de la puerta
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, w, h);
        }),

        doorOpenLeft: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Marco de la puerta (similar a la pared pero más oscuro)
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            
            // Interior visible (como el suelo interior)
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            
            // Puerta abierta hacia la izquierda
            ctx.fillStyle = '#78350f'; // Color marrón oscuro para puerta
            ctx.fillRect(2, 2, 6, h-4); // Puerta visible en el lado izquierdo
            
            // Bisagras en el lado izquierdo
            ctx.fillStyle = '#fbbf24'; // Detalles dorados
            ctx.fillRect(3, 5, 3, 2); // Bisagra superior
            ctx.fillRect(3, h-7, 3, 2); // Bisagra inferior
            
            // Marco de la puerta
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, w, h);
        }),
        
        // Puerta cerrada con pomo a la derecha (abre hacia la izquierda)
        doorClosedLeft: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Marco de la puerta
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            
            // Panel principal de la puerta
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            
            // Detalles de la puerta (tablones)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(6, 4, w-12, 2); // Tablón superior
            ctx.fillRect(6, h/2-1, w-12, 2); // Tablón medio
            ctx.fillRect(6, h-6, w-12, 2); // Tablón inferior
            
            // Manija de la puerta (a la DERECHA para puerta que abre hacia la izquierda)
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w-10, h/2-2, 4, 4);
            
            // Cerradura
            ctx.fillStyle = '#000000';
            ctx.fillRect(w-8, h/2+4, 2, 3);
            
            // Bordes
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, w, h);
        }), 
        
         doorOpenRight: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Marco de la puerta (similar a la pared pero más oscuro)
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            
            // Interior visible (como el suelo interior)
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            
            // Puerta abierta hacia la derecha
            ctx.fillStyle = '#78350f'; // Color marrón oscuro para puerta
            ctx.fillRect(w-8, 2, 6, h-4); // Puerta visible en el lado derecho
            
            // Bisagras en el lado derecho
            ctx.fillStyle = '#fbbf24'; // Detalles dorados
            ctx.fillRect(w-6, 5, 3, 2); // Bisagra superior
            ctx.fillRect(w-6, h-7, 3, 2); // Bisagra inferior
            
            // Marco de la puerta
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, w, h);
        }),
        
        // Puerta cerrada con pomo a la izquierda (abre hacia la derecha)
        doorClosedRight: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Marco de la puerta
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            
            // Panel principal de la puerta
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            
            // Detalles de la puerta (tablones)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(6, 4, w-12, 2); // Tablón superior
            ctx.fillRect(6, h/2-1, w-12, 2); // Tablón medio
            ctx.fillRect(6, h-6, w-12, 2); // Tablón inferior
            
            // Manija de la puerta (a la IZQUIERDA para puerta que abre hacia la derecha)
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(6, h/2-2, 4, 4);
            
            // Cerradura
            ctx.fillStyle = '#000000';
            ctx.fillRect(6, h/2+4, 2, 3);
            
            // Bordes
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, w, h);
        }),

        // Alias para mantener compatibilidad con código existente
        doorClosed: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Marco de la puerta
            ctx.fillStyle = '#92400e';
            ctx.fillRect(0, 0, w, h);
            
            // Panel principal de la puerta
            ctx.fillStyle = '#a16207';
            ctx.fillRect(2, 2, w-4, h-4);
            
            // Detalles de la puerta (tablones)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(6, 4, w-12, 2); // Tablón superior
            ctx.fillRect(6, h/2-1, w-12, 2); // Tablón medio
            ctx.fillRect(6, h-6, w-12, 2); // Tablón inferior
            
            // Manija de la puerta
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w-10, h/2-2, 4, 4);
            
            // Cerradura
            ctx.fillStyle = '#000000';
            ctx.fillRect(w-8, h/2+4, 2, 3);
            
            // Bordes
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, w, h);
        }),
        
        windowWalkable: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Ventana junto a puerta (caminable)
            ctx.fillStyle = '#854d0e'; // Marco
            ctx.fillRect(w/4, h/4, w/2, h/2);
            ctx.fillStyle = '#bfdbfe'; // Cristal
            ctx.fillRect(w/4+2, h/4+2, w/2-4, h/2-4);
        }),
        
        roof: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Tejas rojas
            ctx.fillStyle = '#b91c1c'; // Rojo oscuro
            ctx.fillRect(0, 0, w, h);
            
            // Patrón de tejas
            ctx.fillStyle = '#991b1b'; // Rojo aún más oscuro
            for (let i = 0; i < w; i += 4) {
                for (let j = 0; j < h; j += 4) {
                    if ((i + j) % 8 === 0) {
                        ctx.fillRect(i, j, 3, 3);
                    }
                }
            }
            
            // Borde más claro
            ctx.fillStyle = '#dc2626'; // Rojo más claro
            ctx.fillRect(2, 2, w-4, 2);
        }),
        
        floorInterior: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Floor tiles with wooden pattern
            ctx.fillStyle = '#92400e';  // Base brown
            ctx.fillRect(0, 0, w, h);
            
            ctx.fillStyle = '#a16207';  // Lighter brown for planks
            for (let i = 0; i < w; i += 8) {
                ctx.fillRect(i, 0, 6, h);
            }
            
            // Add some wood grain
            ctx.fillStyle = '#854d0e';  // Darker brown for grain
            for (let i = 0; i < w; i += 8) {
                for (let j = 0; j < h; j += 6) {
                    ctx.fillRect(i+2, j, 1, 4);
                }
            }
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
        
        // NPC sprites - basados en NPCTypes.js
        /*npc_merchant: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo (púrpura/morado para mercader)
            ctx.fillStyle = '#7e22ce';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Cabeza
            ctx.fillStyle = '#fdba74';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Sombrero de comerciante
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(w/4, h/8, w/2, h/8);
            ctx.fillRect(w/3, 0, w/3, h/8);
            // Ojos
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-1, 2, 2);
            ctx.fillRect(w/2+2, h/4-1, 2, 2);
            // Boca (sonrisa)
            ctx.beginPath();
            ctx.moveTo(w/2-3, h/4+3);
            ctx.quadraticCurveTo(w/2, h/4+6, w/2+3, h/4+3);
            ctx.stroke();
        }),
        
        npc_blacksmith: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo (marrón oscuro para herrero)
            ctx.fillStyle = '#78350f';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Cabeza
            ctx.fillStyle = '#fdba74';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Barba
            ctx.fillStyle = '#57534e';
            ctx.beginPath();
            ctx.arc(w/2, h/4+4, 6, 0, Math.PI, false);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-2, 2, 2);
            ctx.fillRect(w/2+2, h/4-2, 2, 2);
            // Delantal
            ctx.fillStyle = '#44403c';
            ctx.fillRect(w/2-6, h/2, 12, h/3);
        }),
        
        npc_banker: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo (traje formal)
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Cabeza
            ctx.fillStyle = '#fdba74';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Cabello
            ctx.fillStyle = '#78350f';
            ctx.fillRect(w/3, h/8, w/3, h/12);
            // Gafas
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-5, h/4-1, 3, 2);
            ctx.fillRect(w/2+2, h/4-1, 3, 2);
            ctx.strokeStyle = '#000';
            ctx.beginPath();
            ctx.rect(w/2-6, h/4-2, 12, 4);
            ctx.stroke();
            // Pajarita
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(w/2-3, h/3, 6, 2);
        }),
        
        npc_guard: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo (armadura gris)
            ctx.fillStyle = '#64748b';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Cabeza
            ctx.fillStyle = '#fdba74';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Casco
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(w/3, h/8, w/3, h/6);
            ctx.fillStyle = '#f59e0b'; // Cresta dorada
            ctx.fillRect(w/2-1, 0, 2, h/6);
            // Ojos (serios)
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-1, 2, 2);
            ctx.fillRect(w/2+2, h/4-1, 2, 2);
            // Boca (recta)
            ctx.fillRect(w/2-3, h/4+3, 6, 1);
        }),
        
        npc_trainer: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo (rojo/marrón para entrenador)
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Cabeza
            ctx.fillStyle = '#fdba74';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Banda en la cabeza
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/3, h/4-6, w/3, 4);
            // Ojos
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-1, 2, 2);
            ctx.fillRect(w/2+2, h/4-1, 2, 2);
            // Barba corta
            ctx.fillStyle = '#57534e';
            ctx.fillRect(w/2-4, h/4+4, 8, 2);
        }),
        
        npc_alchemist: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo (túnica)
            ctx.fillStyle = '#4338ca';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Cabeza
            ctx.fillStyle = '#fdba74';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Sombrero de mago
            ctx.fillStyle = '#312e81';
            ctx.beginPath();
            ctx.moveTo(w/3, h/4-6);
            ctx.lineTo(w*2/3, h/4-6);
            ctx.lineTo(w/2, 0);
            ctx.fill();
            // Estrella en el sombrero
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(w/2, h/8, 2, 0, Math.PI * 2);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-1, 2, 2);
            ctx.fillRect(w/2+2, h/4-1, 2, 2);
        }),
        
        npc_healer: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo (túnica blanca)
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(w/4, h/3, w/2, h/2);
            // Cabeza
            ctx.fillStyle = '#fdba74';
            ctx.beginPath();
            ctx.arc(w/2, h/4, w/4, 0, Math.PI * 2);
            ctx.fill();
            // Símbolo religioso (cruz)
            ctx.fillStyle = '#fcd34d';
            ctx.fillRect(w/2-1, h/2, 2, h/4);
            ctx.fillRect(w/2-w/8, h/2+h/8, w/4, 2);
            // Ojos
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-4, h/4-1, 2, 2);
            ctx.fillRect(w/2+2, h/4-1, 2, 2);
            // Aura
            ctx.strokeStyle = 'rgba(250, 240, 137, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/2-2, 0, Math.PI * 2);
            ctx.stroke();
        }),*/

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
        }),
        
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
        
        // Interior walls - Faltaba en la definición original
        wallInterior: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#78350f'; // Marrón oscuro para paredes interiores
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#92400e'; // Marrón medio para el interior
            ctx.fillRect(2, 2, w-4, h-4);
            // Textura de madera
            ctx.fillStyle = '#78350f';
            for (let i = 0; i < w; i += 8) {
                ctx.fillRect(i, 0, 1, h);
            }
        })
    };
}
