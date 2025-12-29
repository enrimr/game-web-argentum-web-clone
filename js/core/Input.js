/**
 * Input.js
 * Manejo de entrada del usuario (teclado)
 */

export const keys = {};

export function initInput() {
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        // Prevent default for movement keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
}

export function isKeyPressed(key) {
    return keys[key] === true;
}

export function clearKey(key) {
    keys[key] = false;
}
