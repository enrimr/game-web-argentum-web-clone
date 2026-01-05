/**
 * BuildingSprites.js
 * Sprites para edificios y elementos arquitectónicos
 */

import { createSprite } from './SpriteCore.js';

export function generateBuildingSprites(TILE_SIZE) {
    return {
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
