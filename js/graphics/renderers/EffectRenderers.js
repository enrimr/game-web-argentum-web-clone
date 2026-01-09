/**
 * EffectRenderers.js
 * Renderiza efectos visuales como los efectos de meditación, hechizos, etc.
 */

import { TILE_SIZE } from './RendererCore.js';

/**
 * Draw simple meditation ring around player
 * @param {Object} playerScreenPos - Player screen position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function drawMeditationEffects(playerScreenPos, ctx) {
    ctx.save();

    // Centro del jugador
    const centerX = playerScreenPos.x + TILE_SIZE/2;
    const centerY = playerScreenPos.y + TILE_SIZE/2;

    // Parámetros de la animación usando el tiempo actual
    const currentTime = Date.now();
    const pulseRate = 1000; // Velocidad de pulso en ms (más lento para el aro)
    const pulse = Math.sin((currentTime % (pulseRate * 2)) / pulseRate * Math.PI);
    const pulseIntensity = 0.5 + Math.abs(pulse) * 0.5;
    
    // Dibujar aro alrededor del personaje
    const ringRadius = TILE_SIZE/2 + 5; // Tamaño del aro ligeramente mayor que el sprite
    const ringWidth = 3 + Math.sin(currentTime * 0.002) * 1; // Ancho del aro con ligera variación
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius * pulseIntensity, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.8)'; // Violeta brillante
    ctx.lineWidth = ringWidth;
    ctx.stroke();
    
    // Añadir un segundo aro con otro color para efecto visual
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius * pulseIntensity - 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(75, 0, 130, 0.6)'; // Índigo más transparente
    ctx.lineWidth = ringWidth / 2;
    ctx.stroke();

    ctx.restore();
}

/**
 * Draw Dragon Ball Z style meditation effects (espirales de energía)
 * @param {Object} playerScreenPos - Position on screen {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function drawDBZMeditationEffects(playerScreenPos, ctx) {
    ctx.save();

    // Centro del jugador
    const centerX = playerScreenPos.x + TILE_SIZE/2;
    const centerY = playerScreenPos.y + TILE_SIZE/2;

    // Parámetros de la animación usando el tiempo actual
    const currentTime = Date.now();
    const baseSpeed = 0.005;
    const heightVariation = Math.sin(currentTime * 0.003) * 5;  // Variación de altura
    const maxHeight = 70 + heightVariation;  // Altura máxima de la espiral
    const spiralSpeed = currentTime * 0.01;  // Velocidad de rotación

    // Dibujar múltiples espirales para crear efecto de carga de energía
    for (let i = 0; i < 3; i++) {
        const offset = i * (Math.PI * 2 / 3); // Distribuir espirales equitativamente

        // Color específico para cada espiral
        const colors = [
            'rgba(138, 43, 226, 0.7)', // Violeta
            'rgba(75, 0, 130, 0.7)',   // Índigo
            'rgba(106, 90, 205, 0.7)'  // SlateBlue
        ];

        // Dibujar espiral ascendente
        ctx.beginPath();
        for (let y = 0; y < maxHeight; y += 0.5) {
            const progress = y / maxHeight; // 0 a 1
            const radius = 15 * Math.pow(progress, 0.7) * (1 + Math.sin(progress * 5 + currentTime * 0.01) * 0.1);
            const angle = currentTime * 0.01 + y * 0.2 + offset;
            const x = centerX + Math.cos(angle) * radius;
            const yPos = centerY - y - 5;  // -5 para que empiece un poco más arriba del centro

            // Tamaño de las partículas varía con el pulso
            const particleSize = 2 + Math.sin(currentTime * baseSpeed + y * 0.2) * 1.5;

            // Opacidad varía con la altura (más transparente arriba)
            const opacity = 0.8 * (1 - Math.pow(progress, 2));

            ctx.fillStyle = colors[i].replace('0.7', opacity.toFixed(2));
            ctx.fillRect(x - particleSize/2, yPos - particleSize/2, particleSize, particleSize);
        }
    }

    // Dibujar aura resplandeciente alrededor del personaje
    const pulseRate = 500; // Velocidad de pulso en ms
    const pulse = Math.sin((currentTime % (pulseRate * 2)) / pulseRate * Math.PI);
    const pulseIntensity = 0.5 + Math.abs(pulse) * 0.5;
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 5,
        centerX, centerY, 25 * pulseIntensity
    );
    gradient.addColorStop(0, 'rgba(138, 75, 175, 0.5)');
    gradient.addColorStop(0.7, 'rgba(138, 75, 175, 0.3)');
    gradient.addColorStop(1, 'rgba(138, 75, 175, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25 * pulseIntensity, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Draw spell cast effects
 * @param {Object} startPos - Start position {x, y}
 * @param {Object} targetPos - Target position {x, y}
 * @param {string} spellType - Type of spell
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function drawSpellEffect(startPos, targetPos, spellType, ctx) {
    ctx.save();

    // Base para añadir efectos de hechizos en el futuro
    switch (spellType) {
        case 'fireball':
            drawFireballEffect(startPos, targetPos, ctx);
            break;
        case 'heal':
            drawHealEffect(startPos, ctx);
            break;
        case 'lightning':
            drawLightningEffect(startPos, targetPos, ctx);
            break;
        default:
            drawGenericSpellEffect(startPos, targetPos, ctx);
    }

    ctx.restore();
}

/**
 * Draw fireball spell effect
 * @param {Object} startPos - Start position {x, y}
 * @param {Object} targetPos - Target position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function drawFireballEffect(startPos, targetPos, ctx) {
    // Implementación básica para futuro desarrollo
    ctx.beginPath();
    ctx.arc(startPos.x + TILE_SIZE/2, startPos.y + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 100, 0, 0.7)';
    ctx.fill();
}

/**
 * Draw healing spell effect
 * @param {Object} pos - Position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function drawHealEffect(pos, ctx) {
    // Implementación básica para futuro desarrollo
    ctx.beginPath();
    ctx.arc(pos.x + TILE_SIZE/2, pos.y + TILE_SIZE/2, TILE_SIZE/2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 100, 0.5)';
    ctx.fill();
}

/**
 * Draw lightning spell effect
 * @param {Object} startPos - Start position {x, y}
 * @param {Object} targetPos - Target position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function drawLightningEffect(startPos, targetPos, ctx) {
    // Implementación básica para futuro desarrollo
    ctx.beginPath();
    ctx.moveTo(startPos.x + TILE_SIZE/2, startPos.y + TILE_SIZE/2);
    ctx.lineTo(targetPos.x + TILE_SIZE/2, targetPos.y + TILE_SIZE/2);
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

/**
 * Draw generic spell effect
 * @param {Object} startPos - Start position {x, y}
 * @param {Object} targetPos - Target position {x, y}
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
function drawGenericSpellEffect(startPos, targetPos, ctx) {
    // Implementación básica para futuro desarrollo
    ctx.beginPath();
    ctx.arc(startPos.x + TILE_SIZE/2, startPos.y + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(100, 100, 255, 0.6)';
    ctx.fill();
}
