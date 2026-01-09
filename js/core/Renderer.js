/**
 * Renderer.js
 * Sistema de renderizado del juego (módulo principal)
 * Refactorizado en módulos separados para mejor mantenibilidad
 */

// Re-exportar las funciones principales de los módulos de renderizado
export { render, getCameraPosition, isInViewport, worldToScreen } from '../graphics/renderers/RendererCore.js';
export { updatePlayerAnimation, setPlayerAnimationState, setPlayerFacing } from '../graphics/renderers/AnimationHelpers.js';

// Re-exportar la configuración y helpers para debugging
export { layerVisibility } from '../graphics/renderers/RendererCore.js';

// Re-exportar funciones de efectos para uso directo
export { drawMeditationEffects, drawDBZMeditationEffects, drawSpellEffect } from '../graphics/renderers/EffectRenderers.js';
