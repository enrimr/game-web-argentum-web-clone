/**
 * ItemSprites.js
 * Sprites para items y objetos de inventario
 */

import { createSprite } from './SpriteCore.js';

export function generateItemSprites(TILE_SIZE) {
    return {
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

        // Libros y pergaminos
        spellBook: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Libro cerrado
            ctx.fillStyle = '#7c2d12';
            ctx.fillRect(w/2-6, h/2-4, 12, 10);
            // Páginas
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(w/2-5, h/2-3, 10, 8);
            // Detalles del libro
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1;
            ctx.strokeRect(w/2-6, h/2-4, 12, 10);
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-4);
            ctx.lineTo(w/2, h/2+6);
            ctx.stroke();
        }),

        scroll: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Pergamino enrollado
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(w/2-5, h/2-3, 10, 8);
            // Bordes enrollados
            ctx.fillStyle = '#d97706';
            ctx.fillRect(w/2-6, h/2-3, 2, 8);
            ctx.fillRect(w/2+4, h/2-3, 2, 8);
            // Sello de cera
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(w/2, h/2+1, 2, 0, Math.PI * 2);
            ctx.fill();
        }),

        // Herramientas de recolección
        axe: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Mango marrón
            ctx.fillStyle = '#78350f';
            ctx.fillRect(w/2-1, h/2-8, 2, 14);
            // Hoja del hacha (gris metálico)
            ctx.fillStyle = '#9ca3af';
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-6);
            ctx.lineTo(w/2+8, h/2-3);
            ctx.lineTo(w/2+8, h/2+1);
            ctx.lineTo(w/2, h/2-2);
            ctx.fill();
            // Borde oscuro de la hoja
            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-6);
            ctx.lineTo(w/2+8, h/2-3);
            ctx.lineTo(w/2+8, h/2+1);
            ctx.lineTo(w/2, h/2-2);
            ctx.closePath();
            ctx.stroke();
        }),

        pickaxe: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Mango marrón
            ctx.fillStyle = '#78350f';
            ctx.fillRect(w/2-1, h/2-2, 2, 10);
            // Cabeza del pico (gris metálico)
            ctx.fillStyle = '#9ca3af';
            // Punta izquierda
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-6);
            ctx.lineTo(w/2-7, h/2-3);
            ctx.lineTo(w/2-6, h/2-1);
            ctx.lineTo(w/2, h/2-4);
            ctx.fill();
            // Punta derecha
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-6);
            ctx.lineTo(w/2+7, h/2-3);
            ctx.lineTo(w/2+6, h/2-1);
            ctx.lineTo(w/2, h/2-4);
            ctx.fill();
            // Bordes oscuros
            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 1;
            ctx.stroke();
        }),

        // Recursos recolectables
        wood: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Tronco de madera
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/2-6, h/2-4, 12, 8);
            // Vetas de la madera
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w/2-4, h/2-4);
            ctx.lineTo(w/2-4, h/2+4);
            ctx.moveTo(w/2, h/2-4);
            ctx.lineTo(w/2, h/2+4);
            ctx.moveTo(w/2+4, h/2-4);
            ctx.lineTo(w/2+4, h/2+4);
            ctx.stroke();
            // Anillos del tronco (extremos)
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w/2-6, h/2, 4, 0, Math.PI * 2);
            ctx.arc(w/2+6, h/2, 4, 0, Math.PI * 2);
            ctx.stroke();
        }),

        oakWood: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Tronco de roble (más oscuro)
            ctx.fillStyle = '#713f12';
            ctx.fillRect(w/2-6, h/2-4, 12, 8);
            // Vetas más marcadas
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w/2-4, h/2-4);
            ctx.lineTo(w/2-4, h/2+4);
            ctx.moveTo(w/2, h/2-4);
            ctx.lineTo(w/2, h/2+4);
            ctx.moveTo(w/2+4, h/2-4);
            ctx.lineTo(w/2+4, h/2+4);
            ctx.stroke();
            // Anillos
            ctx.strokeStyle = '#1c0a00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w/2-6, h/2, 4, 0, Math.PI * 2);
            ctx.arc(w/2+6, h/2, 4, 0, Math.PI * 2);
            ctx.stroke();
        }),

        elvenWood: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Madera élfica (tono verdoso brillante)
            ctx.fillStyle = '#86efac';
            ctx.fillRect(w/2-6, h/2-4, 12, 8);
            // Vetas mágicas
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w/2-4, h/2-4);
            ctx.lineTo(w/2-4, h/2+4);
            ctx.moveTo(w/2, h/2-4);
            ctx.lineTo(w/2, h/2+4);
            ctx.moveTo(w/2+4, h/2-4);
            ctx.lineTo(w/2+4, h/2+4);
            ctx.stroke();
            // Brillo mágico
            ctx.fillStyle = '#dcfce7';
            ctx.beginPath();
            ctx.arc(w/2-6, h/2, 2, 0, Math.PI * 2);
            ctx.arc(w/2+6, h/2, 2, 0, Math.PI * 2);
            ctx.fill();
        }),

        ironOre: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Piedra base
            ctx.fillStyle = '#57534e';
            ctx.fillRect(w/2-7, h/2-6, 14, 12);
            // Vetas de hierro
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(w/2-4, h/2-4, 3, 3);
            ctx.fillRect(w/2+2, h/2-2, 2, 4);
            ctx.fillRect(w/2-2, h/2+1, 4, 2);
            // Sombra
            ctx.fillStyle = '#292524';
            ctx.fillRect(w/2-7, h/2+4, 14, 2);
        }),

        coal: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Carbón negro
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(w/2-6, h/2-5, 12, 10);
            // Reflejos
            ctx.fillStyle = '#44403c';
            ctx.fillRect(w/2-4, h/2-3, 2, 2);
            ctx.fillRect(w/2+2, h/2, 2, 2);
            // Bordes irregulares
            ctx.fillStyle = '#0c0a09';
            ctx.fillRect(w/2-6, h/2-5, 2, 10);
            ctx.fillRect(w/2+4, h/2-5, 2, 10);
        }),

        silverOre: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Piedra base
            ctx.fillStyle = '#57534e';
            ctx.fillRect(w/2-7, h/2-6, 14, 12);
            // Vetas de plata
            ctx.fillStyle = '#d1d5db';
            ctx.fillRect(w/2-4, h/2-4, 3, 3);
            ctx.fillRect(w/2+2, h/2-2, 3, 4);
            ctx.fillRect(w/2-3, h/2+1, 5, 2);
            // Brillo plateado
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(w/2-3, h/2-3, 1, 1);
            ctx.fillRect(w/2+3, h/2, 1, 1);
        }),

        goldOre: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Piedra base
            ctx.fillStyle = '#57534e';
            ctx.fillRect(w/2-7, h/2-6, 14, 12);
            // Vetas de oro
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w/2-4, h/2-4, 3, 3);
            ctx.fillRect(w/2+2, h/2-2, 3, 4);
            ctx.fillRect(w/2-3, h/2+1, 5, 2);
            // Brillo dorado
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(w/2-3, h/2-3, 1, 1);
            ctx.fillRect(w/2+3, h/2, 1, 1);
            ctx.fillRect(w/2, h/2+1, 1, 1);
        }),

        wool: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Lana esponjosa (blanco)
            ctx.fillStyle = '#f5f5f5';
            // Varios círculos para dar efecto esponjoso
            ctx.beginPath();
            ctx.arc(w/2-3, h/2-2, 4, 0, Math.PI * 2);
            ctx.arc(w/2+3, h/2-2, 4, 0, Math.PI * 2);
            ctx.arc(w/2-3, h/2+2, 4, 0, Math.PI * 2);
            ctx.arc(w/2+3, h/2+2, 4, 0, Math.PI * 2);
            ctx.arc(w/2, h/2, 5, 0, Math.PI * 2);
            ctx.fill();
            // Sombra suave
            ctx.fillStyle = '#e5e5e5';
            ctx.beginPath();
            ctx.arc(w/2, h/2+2, 4, 0, Math.PI);
            ctx.fill();
        }),

        // Caña de pescar
        fishingRod: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Vara de madera (marrón)
            ctx.fillStyle = '#92400e';
            ctx.fillRect(w/2-1, h/2-8, 2, 16);
            // Punta más clara
            ctx.fillStyle = '#a16207';
            ctx.fillRect(w/2-1, h/2-8, 2, 4);
            // Hilo/sedal (gris claro)
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-8);
            ctx.lineTo(w/2+6, h/2);
            ctx.stroke();
            // Anzuelo (gris metálico)
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(w/2+6, h/2, 2, Math.PI, 0);
            ctx.stroke();
        }),

        // Peces
        fish: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo del pez (gris plateado)
            ctx.fillStyle = '#9ca3af';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cola
            ctx.beginPath();
            ctx.moveTo(w/2-6, h/2);
            ctx.lineTo(w/2-10, h/2-3);
            ctx.lineTo(w/2-10, h/2+3);
            ctx.closePath();
            ctx.fill();
            // Ojo
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(w/2+3, h/2-1, 1, 0, Math.PI * 2);
            ctx.fill();
            // Brillo plateado
            ctx.fillStyle = '#d1d5db';
            ctx.fillRect(w/2+1, h/2-2, 2, 1);
        }),

        fishBig: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo del pez grande (azul)
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cola grande
            ctx.beginPath();
            ctx.moveTo(w/2-8, h/2);
            ctx.lineTo(w/2-12, h/2-4);
            ctx.lineTo(w/2-12, h/2+4);
            ctx.closePath();
            ctx.fill();
            // Ojo
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(w/2+4, h/2-1, 1, 0, Math.PI * 2);
            ctx.fill();
            // Escamas (detalles)
            ctx.strokeStyle = '#1e40af';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w/2-2, h/2-3);
            ctx.lineTo(w/2-2, h/2+3);
            ctx.moveTo(w/2+2, h/2-3);
            ctx.lineTo(w/2+2, h/2+3);
            ctx.stroke();
        }),

        fishRare: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo del pez raro (naranja brillante)
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2, 7, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cola elegante
            ctx.beginPath();
            ctx.moveTo(w/2-7, h/2);
            ctx.lineTo(w/2-11, h/2-5);
            ctx.lineTo(w/2-11, h/2+5);
            ctx.closePath();
            ctx.fill();
            // Ojo
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(w/2+4, h/2-1, 1, 0, Math.PI * 2);
            ctx.fill();
            // Franjas (patrón de pez tropical)
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(w/2-3, h/2-4, 1, 8);
            ctx.fillRect(w/2+1, h/2-4, 1, 8);
            // Aleta dorsal
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-5);
            ctx.lineTo(w/2-2, h/2-8);
            ctx.lineTo(w/2+2, h/2-8);
            ctx.closePath();
            ctx.fill();
        }),

        fishGolden: createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
            // Cuerpo del pez dorado (dorado brillante)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cola dorada elegante
            ctx.beginPath();
            ctx.moveTo(w/2-8, h/2);
            ctx.lineTo(w/2-12, h/2-5);
            ctx.lineTo(w/2-10, h/2);
            ctx.lineTo(w/2-12, h/2+5);
            ctx.closePath();
            ctx.fill();
            // Ojo
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(w/2+4, h/2-1, 1, 0, Math.PI * 2);
            ctx.fill();
            // Brillo dorado intenso
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(w/2-2, h/2-3, 2, 2);
            ctx.fillRect(w/2+2, h/2, 1, 1);
            // Aleta dorsal dorada
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(w/2, h/2-5);
            ctx.lineTo(w/2-2, h/2-9);
            ctx.lineTo(w/2+2, h/2-9);
            ctx.closePath();
            ctx.fill();
            // Aura mágica
            ctx.strokeStyle = '#fef3c7';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(w/2, h/2, 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        })
    };
}
