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

export function generateAllSprites(TILE_SIZE) {
    // Combina todos los sprites generados en un solo objeto
    return {
        ...generateTerrainSprites(TILE_SIZE),
        ...generateBuildingSprites(TILE_SIZE),
        ...generateCharacterSprites(TILE_SIZE),
        ...generateEnemySprites(TILE_SIZE),
        ...generateNPCSprites(TILE_SIZE),
        ...generateObjectSprites(TILE_SIZE),
        ...generateItemSprites(TILE_SIZE)
    };
}

// Re-exportamos createSprite por si algún otro módulo lo necesita directamente
export { createSprite };
