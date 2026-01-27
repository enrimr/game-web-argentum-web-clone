/**
 * SpriteGenerator.js
 * Generación de sprites procedurales del juego
 */

import { createSprite } from './sprites/SpriteCore.js';
import { generateTerrainSprites } from './sprites/TerrainSprites.js';
import { generateBuildingSprites } from './sprites/BuildingSprites.js';
import { generateCharacterSprites } from './sprites/CharacterSprites.js';
import { generateEnemySprites } from './sprites/EnemySprites.js';
import { generateNPCSprites } from './sprites/NPCSprites.js';
import { generateObjectSprites } from './sprites/ObjectSprites.js';
import { generateItemSprites } from './sprites/ItemSprites.js';
import { generateEquipmentSprites } from './sprites/EquipmentSprites.js';
import { generateCustomCharacterSprites } from './sprites/CustomCharacterSprites.js';

export function generateAllSprites(TILE_SIZE) {
    // Combina todos los sprites generados en un solo objeto
    return {
        ...generateTerrainSprites(TILE_SIZE),
        ...generateBuildingSprites(TILE_SIZE),
        ...generateCharacterSprites(TILE_SIZE),
        ...generateEnemySprites(TILE_SIZE),
        ...generateNPCSprites(TILE_SIZE),
        ...generateObjectSprites(TILE_SIZE),
        ...generateItemSprites(TILE_SIZE),
        ...generateEquipmentSprites(TILE_SIZE)
    };
}

/**
 * Regenerar sprites del jugador con apariencia personalizada
 * @param {Object} sprites - Objeto de sprites existente
 * @param {Object} appearance - Apariencia del personaje
 * @param {number} TILE_SIZE - Tamaño del tile
 * @returns {Object} Sprites actualizados
 */
export function updatePlayerSprites(sprites, appearance, TILE_SIZE) {
    if (!appearance) {
        console.warn('No se proporcionó apariencia, usando sprites por defecto');
        return sprites;
    }
    
    console.log('🎨 Generando sprites personalizados con apariencia:', appearance);
    
    // Generar sprites personalizados
    const customSprites = generateCustomCharacterSprites(appearance, TILE_SIZE);
    
    // Reemplazar sprites del jugador con los personalizados
    return {
        ...sprites,
        player: customSprites.player,
        playerUp: customSprites.playerUp,
        playerDown: customSprites.player, // playerDown es igual a player
        playerLeft: customSprites.playerLeft,
        playerRight: customSprites.playerRight
    };
}

// Re-exportamos createSprite por si algún otro módulo lo necesita directamente
export { createSprite };
