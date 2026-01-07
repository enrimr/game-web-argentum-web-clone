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
        }),
        
        // Nuevos sprites para las Islas Canarias
        
        // Arena de playa
        sand: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.fillStyle = '#f5e7b8'; // Base arena clara
            ctx.fillRect(0, 0, w, h);
            
            // Detalles de arena
            ctx.fillStyle = '#e6d7a5'; // Arena más oscura
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const size = Math.random() * 3 + 1;
                ctx.fillRect(x, y, size, size);
            }
            
            // Pequeños brillos
            ctx.fillStyle = '#fff8e1';
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                ctx.fillRect(x, y, 1, 1);
            }
        }),
        
        // Duna de arena
        dune: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Base de duna
            ctx.fillStyle = '#e6c88a'; // Arena de duna
            ctx.fillRect(0, 0, w, h);
            
            // Degradado para dar sensación de elevación
            const grd = ctx.createLinearGradient(0, 0, w, h);
            grd.addColorStop(0, '#e6c88a');
            grd.addColorStop(0.7, '#d4b377');
            grd.addColorStop(1, '#c19d63');
            
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, w, h);
            
            // Detalle de líneas de viento en la arena
            ctx.strokeStyle = '#d4b377';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const y = h / 4 + i * (h / 4);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.quadraticCurveTo(w/2, y + (Math.random() * 5 - 2.5), w, y);
                ctx.stroke();
            }
        }),
        
        // Montaña
        mountain: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            
            // Silueta de la montaña
            ctx.fillStyle = '#6b7280';
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(w/2, h/5);
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();
            
            // Degradado para dar profundidad
            const grd = ctx.createLinearGradient(0, h/2, w, h/2);
            grd.addColorStop(0, '#6b7280');
            grd.addColorStop(0.5, '#4b5563');
            grd.addColorStop(1, '#374151');
            
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.moveTo(w/4, h);
            ctx.lineTo(w/2, h/4);
            ctx.lineTo(3*w/4, h);
            ctx.closePath();
            ctx.fill();
            
            // Nieve en la cima
            ctx.fillStyle = '#f9fafb';
            ctx.beginPath();
            ctx.moveTo(w/3, h/3);
            ctx.lineTo(w/2, h/5);
            ctx.lineTo(2*w/3, h/3);
            ctx.closePath();
            ctx.fill();
        }),
        
        // Roca normal
        rock: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            
            // Base de la roca
            ctx.fillStyle = '#6b7280';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2 + h/4, w/2, h/4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Parte superior de la roca
            ctx.fillStyle = '#9ca3af';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2, w/2 - 2, h/3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Detalles y sombras
            ctx.fillStyle = '#4b5563';
            ctx.beginPath();
            ctx.ellipse(w/2 - w/6, h/2, w/8, h/6, Math.PI/4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#4b5563';
            ctx.beginPath();
            ctx.ellipse(w/2 + w/5, h/2 + h/8, w/10, h/8, 0, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        // Roca volcánica negra
        volcanicRock: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            
            // Base de la roca volcánica
            ctx.fillStyle = '#111827';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2 + h/4, w/2, h/4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Parte superior irregular
            ctx.fillStyle = '#1f2937';
            ctx.beginPath();
            ctx.moveTo(w/4, h/2);
            ctx.quadraticCurveTo(w/3, h/4, w/2, h/3);
            ctx.quadraticCurveTo(2*w/3, h/5, 3*w/4, h/2);
            ctx.quadraticCurveTo(5*w/6, 2*h/3, 3*w/4, 3*h/4);
            ctx.quadraticCurveTo(w/2, 7*h/8, w/4, 3*h/4);
            ctx.quadraticCurveTo(w/6, 2*h/3, w/4, h/2);
            ctx.fill();
            
            // Detalles de textura porosa
            ctx.fillStyle = '#374151';
            for (let i = 0; i < 8; i++) {
                const x = w/4 + Math.random() * w/2;
                const y = h/3 + Math.random() * h/3;
                const r = Math.random() * 2 + 1;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }),
        
        // Lava volcánica
        lava: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Base de lava
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(0, 0, w, h);
            
            // Gradiente para efecto de brillo
            const grd = ctx.createRadialGradient(w/2, h/2, 2, w/2, h/2, w/2);
            grd.addColorStop(0, '#f97316');
            grd.addColorStop(0.3, '#dc2626');
            grd.addColorStop(0.8, '#991b1b');
            grd.addColorStop(1, '#7f1d1d');
            
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, w, h);
            
            // Burbujas y detalles de lava
            ctx.fillStyle = '#f97316';
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const r = Math.random() * 3 + 1;
                
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Brillos
            ctx.fillStyle = '#fef3c7';
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                ctx.fillRect(x, y, 2, 2);
            }
        }),
        
        // Palmera canaria
        palmTree: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            
            // Tronco de la palmera (más delgado y curvado que un árbol normal)
            ctx.fillStyle = '#92400e';
            ctx.beginPath();
            ctx.moveTo(w/2, h);
            ctx.quadraticCurveTo(w/2 + 3, h/2, w/2 - 1, h/4);
            ctx.lineTo(w/2 + 2, h/4);
            ctx.quadraticCurveTo(w/2 + 6, h/2, w/2 + 3, h);
            ctx.closePath();
            ctx.fill();
            
            // Hojas de palmera
            ctx.fillStyle = '#65a30d';
            
            // Hoja izquierda
            ctx.beginPath();
            ctx.moveTo(w/2, h/4);
            ctx.quadraticCurveTo(w/4, h/5, w/8, h/3);
            ctx.lineTo(w/4, h/4);
            ctx.quadraticCurveTo(w/3, h/5, w/2, h/4);
            ctx.fill();
            
            // Hoja derecha
            ctx.beginPath();
            ctx.moveTo(w/2, h/4);
            ctx.quadraticCurveTo(3*w/4, h/5, 7*w/8, h/3);
            ctx.lineTo(3*w/4, h/4);
            ctx.quadraticCurveTo(2*w/3, h/5, w/2, h/4);
            ctx.fill();
            
            // Hojas superiores
            ctx.beginPath();
            ctx.moveTo(w/2, h/4);
            ctx.quadraticCurveTo(w/2 - 5, h/8, w/3, h/10);
            ctx.lineTo(w/2 - 2, h/8);
            ctx.quadraticCurveTo(w/2, h/12, w/2 + 2, h/8);
            ctx.lineTo(2*w/3, h/10);
            ctx.quadraticCurveTo(w/2 + 5, h/8, w/2, h/4);
            ctx.fill();
        }),
        
        // Cactus de zonas áridas
        cactus: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            
            // Tallo principal
            ctx.fillStyle = '#15803d';
            ctx.fillRect(w/2 - 3, h/4, 6, 3*h/4);
            
            // Brazos laterales
            // Brazo izquierdo
            ctx.fillRect(w/2 - 8, h/3, 5, 4);
            ctx.fillRect(w/2 - 8, h/3, 3, h/4);
            
            // Brazo derecho
            ctx.fillRect(w/2 + 3, h/2, 5, 4);
            ctx.fillRect(w/2 + 5, h/2, 3, h/5);
            
            // Degradado para dar volumen
            const grd = ctx.createLinearGradient(w/2 - 3, 0, w/2 + 3, 0);
            grd.addColorStop(0, '#15803d');
            grd.addColorStop(0.5, '#16a34a');
            grd.addColorStop(1, '#15803d');
            
            ctx.fillStyle = grd;
            ctx.fillRect(w/2 - 3, h/4, 6, 3*h/4);
            
            // Espinas
            ctx.fillStyle = '#d6d3d1';
            for (let i = 0; i < 10; i++) {
                const y = h/4 + i * (3*h/40);
                
                // Espinas izquierdas
                ctx.fillRect(w/2 - 4, y, 1, 1);
                
                // Espinas derechas
                ctx.fillRect(w/2 + 3, y, 1, 1);
            }
        }),
        
        // Concha marina decorativa
        seashell: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            
            // Sombra bajo la concha
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.beginPath();
            ctx.ellipse(w/2, 3*h/4, w/4, h/8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Base de la concha
            ctx.fillStyle = '#fef3c7';
            ctx.beginPath();
            ctx.moveTo(w/3, 2*h/3);
            ctx.quadraticCurveTo(w/2, h/3, 2*w/3, 2*h/3);
            ctx.quadraticCurveTo(w/2, 3*h/4, w/3, 2*h/3);
            ctx.fill();
            
            // Detalles de la concha
            ctx.strokeStyle = '#fed7aa';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(w/2, 2*h/3, i * 3 + 5, Math.PI, 0);
                ctx.stroke();
            }
            
            // Brillos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(w/2 - 3, h/2, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(w/2 + 4, h/2 + 5, 1, 0, Math.PI * 2);
            ctx.fill();
        }),
        
        // Cráter de volcán
        volcano: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            
            // Base del volcán
            ctx.fillStyle = '#4b5563';
            ctx.beginPath();
            ctx.moveTo(0, 2*h/3);
            ctx.lineTo(0, h);
            ctx.lineTo(w, h);
            ctx.lineTo(w, 2*h/3);
            ctx.quadraticCurveTo(3*w/4, h/3, w/2, h/3);
            ctx.quadraticCurveTo(w/4, h/3, 0, 2*h/3);
            ctx.fill();
            
            // Cráter
            ctx.fillStyle = '#292524';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2, w/4, h/6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Interior del cráter (lava)
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2, w/8, h/12, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Brillos de lava
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(w/2 - 2, h/2 - 1, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(w/2 + 3, h/2 + 2, 1, 0, Math.PI * 2);
            ctx.fill();
        })
    };
}
