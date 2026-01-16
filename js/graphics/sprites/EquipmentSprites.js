/**
 * EquipmentSprites.js
 * Sprites de equipamiento visual en estilo pixel art
 * Cada pieza se renderiza como capa sobre el personaje base
 */

import { createSprite } from './SpriteCore.js';

export function generateEquipmentSprites(TILE_SIZE) {
    const sprites = {};
    
    // ============================================
    // ARMADURAS Y ROPA (Layer 2 - sobre cuerpo)
    // ============================================
    
    // Túnica ligera (Magos) - Azul/Morada
    sprites.armorRobeLightBlue = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#8b5cf6'; // Morado
        ctx.fillRect(w/4, h/3, w/2, h/2); // Torso
        ctx.fillRect(w/4 - 2, h/2 + 2, w/2 + 4, h/3); // Falda túnica
        // Detalles dorados
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2 - 1, h/3, 2, h/4); // Línea central
    });
    
    sprites.armorRobeDark = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#312e81'; // Morado oscuro
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillRect(w/4 - 2, h/2 + 2, w/2 + 4, h/3);
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(w/2 - 1, h/3, 2, h/4);
    });
    
    // Armadura de cuero (Arqueros/Asesinos) - Marrón
    sprites.armorLeather = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#92400e'; // Marrón
        ctx.fillRect(w/4, h/3, w/2, h/2);
        // Detalles
        ctx.fillStyle = '#78350f';
        ctx.fillRect(w/4 + 2, h/3 + 2, 2, h/6);
        ctx.fillRect(w/2 + w/4 - 4, h/3 + 2, 2, h/6);
    });
    
    sprites.armorLeatherDark = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#1c0a00'; // Negro/marrón
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w/4 + 2, h/3 + 2, 2, h/6);
        ctx.fillRect(w/2 + w/4 - 4, h/3 + 2, 2, h/6);
    });
    
    // Armadura de placas (Guerreros/Paladines) - Gris/Plateada
    sprites.armorPlate = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#9ca3af'; // Gris plateado
        ctx.fillRect(w/4, h/3, w/2, h/2);
        // Placas
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(w/4, h/3, w/2, 3); // Hombros
        ctx.fillRect(w/4, h/2, w/2, 2); // Centro
        ctx.fillRect(w/4, h/2 + h/6, w/2, 2); // Cinturón
    });
    
    sprites.armorPlateGold = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#fbbf24'; // Dorado
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(w/4, h/3, w/2, 3);
        ctx.fillRect(w/4, h/2, w/2, 2);
        ctx.fillRect(w/4, h/2 + h/6, w/2, 2);
    });
    
    // Ropa de clérigo - Blanca/Dorada
    sprites.armorCleric = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#f3f4f6'; // Blanco
        ctx.fillRect(w/4, h/3, w/2, h/2);
        ctx.fillRect(w/4 - 2, h/2, w/2 + 4, h/3);
        // Cruz dorada
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(w/2 - 1, h/2 - 2, 2, 8); // Vertical
        ctx.fillRect(w/2 - 3, h/2, 6, 2); // Horizontal
    });
    
    // ============================================
    // CASCOS (Layer 3 - sobre cabeza)
    // ============================================
    
    // Capucha (Magos/Asesinos) - Oscura
    sprites.helmetHood = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#312e81'; // Morado oscuro
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/4 + 2, 0, Math.PI * 2);
        ctx.fill();
        // Sombra en la cara
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(w/2 - w/6, h/4 - 2, w/3, h/8);
    });
    
    sprites.helmetHoodBrown = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#92400e'; // Marrón
        ctx.beginPath();
        ctx.arc(w/2, h/4, w/4 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(w/2 - w/6, h/4 - 2, w/3, h/8);
    });
    
    // Casco ligero - Marrón
    sprites.helmetLight = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#92400e'; // Marrón cuero
        // Casco simple
        ctx.fillRect(w/2 - w/6, h/4 - w/6, w/3, 4);
        ctx.fillRect(w/2 - w/6, h/4 - w/6, 3, w/6);
        ctx.fillRect(w/2 + w/6 - 3, h/4 - w/6, 3, w/6);
    });
    
    // Casco completo (Guerreros) - Metálico
    sprites.helmetFull = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#6b7280'; // Gris oscuro
        // Casco completo
        ctx.fillRect(w/2 - w/5, h/4 - w/5, w/2.5, w/2.5);
        // Ranura visor
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2 - w/8, h/4, w/4, 2);
    });
    
    sprites.helmetFullGold = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#fbbf24'; // Dorado
        ctx.fillRect(w/2 - w/5, h/4 - w/5, w/2.5, w/2.5);
        ctx.fillStyle = '#000';
        ctx.fillRect(w/2 - w/8, h/4, w/4, 2);
    });
    
    // Corona/Diadema (Clérigos) - Dorada
    sprites.helmetCrown = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#fbbf24'; // Dorado
        // Base de la corona
        ctx.fillRect(w/2 - w/5, h/4 - w/6, w/2.5, 3);
        // Puntas de la corona
        ctx.fillRect(w/2 - w/6, h/4 - w/5, 2, 4);
        ctx.fillRect(w/2 - 1, h/4 - w/4.5, 2, 5);
        ctx.fillRect(w/2 + w/6 - 2, h/4 - w/5, 2, 4);
        // Gema central
        ctx.fillStyle = '#ef4444'; // Rojo
        ctx.fillRect(w/2 - 1, h/4 - w/6 + 1, 2, 2);
    });
    
    // ============================================
    // ARMAS (Layer 4 - en mano)
    // ============================================
    
    // Espada corta
    sprites.weaponSwordShort = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#9ca3af'; // Hoja gris
        ctx.fillRect(w/4 - 8, h/2, 3, h/4);
        ctx.fillStyle = '#78350f'; // Empuñadura marrón
        ctx.fillRect(w/4 - 9, h/2 + h/5, 5, 4);
        ctx.fillStyle = '#fbbf24'; // Pomo dorado
        ctx.fillRect(w/4 - 8, h/2 + h/5 + 4, 3, 2);
    });
    
    // Espada larga
    sprites.weaponSwordLong = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#9ca3af'; // Hoja gris
        ctx.fillRect(w/4 - 8, h/2 - 4, 3, h/3 + 4);
        ctx.fillStyle = '#78350f'; // Empuñadura
        ctx.fillRect(w/4 - 9, h/2 + h/6, 5, 4);
        ctx.fillStyle = '#fbbf24'; // Pomo
        ctx.fillRect(w/4 - 8, h/2 + h/6 + 4, 3, 2);
    });
    
    // Arco
    sprites.weaponBow = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.strokeStyle = '#78350f'; // Marrón
        ctx.lineWidth = 2;
        // Arco
        ctx.beginPath();
        ctx.arc(w/4 - 8, h/2 + h/6, h/4, -Math.PI/2, Math.PI/2, false);
        ctx.stroke();
        // Cuerda
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w/4 - 8, h/2);
        ctx.lineTo(w/4 - 8, h/2 + h/3);
        ctx.stroke();
    });
    
    // Bastón mágico
    sprites.weaponStaff = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#78350f'; // Marrón madera
        ctx.fillRect(w/4 - 8, h/2, 2, h/2.5);
        // Gema en la punta
        ctx.fillStyle = '#8b5cf6'; // Morado
        ctx.beginPath();
        ctx.arc(w/4 - 7, h/2 - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        // Brillo
        ctx.fillStyle = '#c4b5fd';
        ctx.fillRect(w/4 - 8, h/2 - 3, 2, 2);
    });
    
    // Daga
    sprites.weaponDagger = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#9ca3af'; // Hoja gris
        ctx.fillRect(w/4 - 8, h/2, 2, h/6);
        ctx.fillStyle = '#1c0a00'; // Empuñadura negra
        ctx.fillRect(w/4 - 9, h/2 + h/8, 4, 3);
    });
    
    // Martillo
    sprites.weaponHammer = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#78350f'; // Mango marrón
        ctx.fillRect(w/4 - 8, h/2, 2, h/4);
        ctx.fillStyle = '#6b7280'; // Cabeza gris
        ctx.fillRect(w/4 - 10, h/2 - 4, 6, 6);
    });
    
    // ============================================
    // ESCUDOS (Layer 5 - mano opuesta)
    // ============================================
    
    // Escudo pequeño
    sprites.shieldSmall = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#78350f'; // Marrón
        ctx.beginPath();
        ctx.arc(w*3/4 + 4, h/2 + h/6, h/8, 0, Math.PI * 2);
        ctx.fill();
        // Borde metálico
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    
    // Escudo grande
    sprites.shieldLarge = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#3b82f6'; // Azul
        ctx.fillRect(w*3/4 + 2, h/2, h/6, h/3);
        // Borde
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.strokeRect(w*3/4 + 2, h/2, h/6, h/3);
        // Emblema
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(w*3/4 + 2 + h/12, h/2 + h/6, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Escudo de madera
    sprites.shieldWooden = createSprite(TILE_SIZE, TILE_SIZE, (ctx, w, h) => {
        ctx.fillStyle = '#92400e'; // Marrón madera
        ctx.beginPath();
        ctx.arc(w*3/4 + 4, h/2 + h/6, h/7, 0, Math.PI * 2);
        ctx.fill();
        // Vetas de madera
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w*3/4 + 4 - h/14, h/2 + h/6);
        ctx.lineTo(w*3/4 + 4 + h/14, h/2 + h/6);
        ctx.stroke();
    });
    
    return sprites;
}
