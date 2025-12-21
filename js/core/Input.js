/**
 * Sistema de manejo de entrada del usuario
 */

export class InputManager {
    constructor() {
        this.keys = {};
        this.initializeListeners();
    }
    
    initializeListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    isKeyPressed(key) {
        return this.keys[key] === true;
    }
    
    clearKey(key) {
        this.keys[key] = false;
    }
    
    isMovingUp() {
        return this.isKeyPressed('ArrowUp') || this.isKeyPressed('w') || this.isKeyPressed('W');
    }
    
    isMovingDown() {
        return this.isKeyPressed('ArrowDown') || this.isKeyPressed('s') || this.isKeyPressed('S');
    }
    
    isMovingLeft() {
        return this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a') || this.isKeyPressed('A');
    }
    
    isMovingRight() {
        return this.isKeyPressed('ArrowRight') || this.isKeyPressed('d') || this.isKeyPressed('D');
    }
    
    isInteracting() {
        return this.isKeyPressed(' ');
    }
}
