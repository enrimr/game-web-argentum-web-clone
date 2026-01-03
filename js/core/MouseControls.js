/**
 * MouseControls.js
 * Sistema de control por ratón - clic para interactuar con el mundo
 */



// Importar funciones refactorizadas
import { handleCanvasClick } from './ClickHandler.js';

/**
 * Inicializar controles de ratón
 */
export function initMouseControls() {
    const canvas = document.getElementById('gameCanvas');

    canvas.addEventListener('click', handleCanvasClick);
    canvas.style.cursor = 'crosshair'; // Cambiar cursor para indicar interactividad
}

// Re-exportar funciones para mantener compatibilidad con módulos que importan desde MouseControls.js
export { updateAutoMovement, isPlayerAutoMoving, getAutoMoveTarget } from './AutoMovement.js';
