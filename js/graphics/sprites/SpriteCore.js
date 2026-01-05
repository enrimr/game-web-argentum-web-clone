/**
 * SpriteCore.js
 * Funciones base para la generación de sprites
 */

// Generate simple pixel art sprites
export function createSprite(width, height, drawFunction) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    const spriteCtx = spriteCanvas.getContext('2d');
    drawFunction(spriteCtx, width, height);
    return spriteCanvas;
}
