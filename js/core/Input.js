/**
 * Input.js
 * Manejo de entrada del usuario (teclado)
 */

export const keys = {};

export function initInput() {
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        // Prevent default for movement keys, space, shift, Q and numbers
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Shift', 'q', 'Q', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
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
