/**
 * AnimationHelpers.js
 * Funciones para manejar animaciones de sprites y personajes
 */

import { gameState } from '../../state.js';
import { sprites } from './RendererCore.js';

/**
 * Update player animation frames
 * @param {number} deltaTime - Time elapsed since last update (ms)
 */
export function updatePlayerAnimation(deltaTime) {
    const { animation } = gameState.player;

    // Update animation frame timing
    animation.frameTime += deltaTime;

    // Check if it's time to advance to next frame
    if (animation.frameTime >= animation.frameDelay) {
        animation.frameTime = 0;

        // Advance frame based on animation state
        if (animation.state === 'walking') {
            animation.frame = (animation.frame + 1) % 4; // 4 frames for walking
        } else if (animation.state === 'attacking') {
            animation.frame = (animation.frame + 1) % 3; // 3 frames for attacking
        } else if (animation.state === 'talking') {
            animation.frame = (animation.frame + 1) % 2; // 2 frames for talking
        } else if (animation.state === 'meditating') {
            animation.frame = (animation.frame + 1) % 2; // 2 frames for meditation
            
            // Si el jugador está meditando, actualizar el maná periódicamente
            if (gameState.player.meditating && gameState.player.mana < gameState.player.maxMana) {
                // La recuperación de maná ya se maneja en MagicSystem.js con recoverMana()
                // Solo actualizamos la animación aquí
            }
        } else {
            // Idle state - minimal animation
            animation.frame = (animation.frame + 1) % 2; // 2 frames for idle
        }
    }
}

/**
 * Set player animation state
 * @param {string} state - New animation state ('idle', 'walking', 'attacking', 'talking')
 */
export function setPlayerAnimationState(state) {
    const { animation } = gameState.player;

    if (animation.state !== state) {
        animation.state = state;
        animation.frame = 0; // Reset frame when changing state
        animation.frameTime = 0; // Reset timing
    }
}

/**
 * Set player facing direction and update animation
 * @param {string} direction - Direction ('up', 'down', 'left', 'right')
 */
export function setPlayerFacing(direction) {
    if (gameState.player.facing !== direction) {
        gameState.player.facing = direction;
        // Reset animation frame when changing direction
        gameState.player.animation.frame = 0;
        gameState.player.animation.frameTime = 0;
    }
}

/**
 * Get animated player sprite based on direction and animation state
 * @returns {Image} Player sprite for current animation frame
 */
export function getAnimatedPlayerSprite() {
    const { facing, animation, isGhost } = gameState.player;

    // Check if player is a ghost
    if (isGhost) {
        // For ghost, use directional ghost sprites
        if (animation.state === 'walking') {
            // For walking, use animated ghost frames if available
            return sprites[`playerGhost${facing.charAt(0).toUpperCase() + facing.slice(1)}`] || sprites.playerGhost;
        } else {
            // For idle and other states, use directional ghost sprites
            if (facing === 'up') {
                return sprites.playerGhostUp || sprites.playerGhost;
            } else if (facing === 'down') {
                return sprites.playerGhostDown || sprites.playerGhost;
            } else if (facing === 'left') {
                return sprites.playerGhostLeft || sprites.playerGhost;
            } else if (facing === 'right') {
                return sprites.playerGhostRight || sprites.playerGhost;
            } else {
                return sprites.playerGhost;
            }
        }
    }

    // For non-ghost player, use regular sprites
    // Base sprite based on direction and animation state
    let spriteName;

    // Choose sprite based on animation state and direction
    if (animation.state === 'walking') {
        // For walking, use animated frames if available, otherwise base directional sprite
        const frameSuffix = animation.frame > 0 ? animation.frame.toString() : '';
        spriteName = `playerWalk${facing.charAt(0).toUpperCase() + facing.slice(1)}${frameSuffix}`;
    } else if (animation.state === 'meditating') {
        // Para meditación, usamos un sprite especial o alternamos entre sprites para animación
        // Hacemos una animación pulsante basada en el tiempo
        const currentTime = Date.now(); // Obtener tiempo actual
        const pulseRate = 500; // Velocidad de pulso en ms
        const pulse = Math.sin((currentTime % (pulseRate * 2)) / pulseRate * Math.PI);

        if (pulse > 0) {
            spriteName = `playerMeditating1`;  // Posición 1 de meditación
        } else {
            spriteName = `playerMeditating2`;  // Posición 2 de meditación
        }

        // Si no existen sprites específicos de meditación, usar un sprite genérico según dirección
        const fallbackSprite = `player${facing.charAt(0).toUpperCase() + facing.slice(1)}`;

        return sprites[spriteName] || sprites[fallbackSprite] || sprites.player;
    } else if (animation.state === 'attacking') {
        // For attacking, use animated frames if available
        const frameSuffix = animation.frame > 0 ? animation.frame.toString() : '';
        spriteName = `playerAttack${facing.charAt(0).toUpperCase() + facing.slice(1)}${frameSuffix}`;
    } else if (animation.state === 'talking') {
        // For talking, use animated frames if available
        const frameSuffix = animation.frame > 0 ? animation.frame.toString() : '';
        spriteName = `playerTalk${facing.charAt(0).toUpperCase() + facing.slice(1)}${frameSuffix}`;
    } else {
        // Idle state - use directional base sprites
        if (facing === 'up') {
            spriteName = 'playerUp';
        } else if (facing === 'down') {
            spriteName = 'player';
        } else if (facing === 'left') {
            spriteName = 'playerLeft';
        } else if (facing === 'right') {
            spriteName = 'playerRight';
        } else {
            spriteName = 'player';
        }
    }

    // Fallback chain: animated sprite -> directional sprite -> base player sprite
    return sprites[spriteName] ||
           sprites[`player${facing.charAt(0).toUpperCase() + facing.slice(1)}`] ||
           sprites.player;
}
