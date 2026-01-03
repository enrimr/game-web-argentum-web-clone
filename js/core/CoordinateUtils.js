/**
 * CoordinateUtils.js
 * Utilidades para conversión de coordenadas y manejo de dirección del jugador
 */

import { gameState } from '../state.js';
import { CONFIG } from '../config.js';

// Importar la función getCameraPosition del renderer para consistencia
import { getCameraPosition } from './Renderer.js';

const { TILE_SIZE } = CONFIG;

/**
 * Convertir coordenadas de pantalla a coordenadas del mundo
 * @param {number} screenX - Coordenada X de pantalla
 * @param {number} screenY - Coordenada Y de pantalla
 * @returns {Object} Coordenadas del mundo {x, y}
 */
export function screenToWorld(screenX, screenY) {
    // Vamos a simplificar completamente la lógica e ir directo a lo que necesitamos:
    // 1. Medir la coordenada exacta del clic
    // 2. Determinar qué celda del mundo corresponde

    // Obtener la posición de la cámara
    const camera = getCameraPosition();

    // Convertir directamente a coordenadas de celda
    // El renderizador usa estas fórmulas inversas:
    // screenX = (worldX - camera.x) * TILE_SIZE;
    // screenY = (worldY - camera.y) * TILE_SIZE;

    // Despejando worldX y worldY:
    // worldX = camera.x + (screenX / TILE_SIZE);
    // worldY = camera.y + (screenY / TILE_SIZE);

    // Necesitamos usar el mismo método de redondeo usado en renderizado:
    // Ese método es Math.floor para ambas coordenadas
    const worldX = camera.x + Math.floor(screenX / TILE_SIZE);
    const worldY = camera.y + Math.floor(screenY / TILE_SIZE);

    // Log adicional para depuración
    console.log(`   Cálculo directo: screenX=${screenX}, screenY=${screenY} → worldX=${worldX}, worldY=${worldY}`);

    return { x: worldX, y: worldY };
}

/**
 * Actualizar la dirección del jugador para que mire hacia una posición objetivo
 * @param {number} targetX - Coordenada X del objetivo
 * @param {number} targetY - Coordenada Y del objetivo
 */
export function updatePlayerFacingTowardsTarget(targetX, targetY) {
    const player = gameState.player;
    const dx = targetX - player.x;
    const dy = targetY - player.y;

    // Determinar la dirección basada en la posición relativa del objetivo
    if (Math.abs(dx) > Math.abs(dy)) {
        // Principalmente horizontal
        player.facing = dx > 0 ? 'right' : 'left';
    } else {
        // Principalmente vertical
        player.facing = dy > 0 ? 'down' : 'up';
    }

    // Importar la función para cambiar la animación
    import('./Renderer.js').then(({ setPlayerFacing, setPlayerAnimationState }) => {
        setPlayerFacing(player.facing);
        setPlayerAnimationState('attacking'); // Activar animación de ataque
    });
}

/**
 * Verificar si el jugador está mirando hacia un objetivo específico
 * @param {number} targetX - Coordenada X del objetivo
 * @param {number} targetY - Coordenada Y del objetivo
 * @returns {boolean} True si el jugador está mirando hacia el objetivo
 */
export function isPlayerFacingTarget(targetX, targetY) {
    const player = gameState.player;
    const dx = targetX - player.x;
    const dy = targetY - player.y;

    // Determinar la dirección esperada basada en la posición relativa del objetivo
    let expectedFacing;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Principalmente horizontal
        expectedFacing = dx > 0 ? 'right' : 'left';
    } else {
        // Principalmente vertical
        expectedFacing = dy > 0 ? 'down' : 'up';
    }

    // Verificar si la dirección actual del jugador coincide con la esperada
    return player.facing === expectedFacing;
}
