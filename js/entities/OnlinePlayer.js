/**
 * OnlinePlayer.js
 * Representa a un jugador online (otro usuario conectado)
 */

export class OnlinePlayer {
    constructor(data) {
        this.socketId = data.socketId;
        this.username = data.username;
        this.x = data.position.x;
        this.y = data.position.y;
        this.map = data.position.map;
        this.class = data.class;
        this.level = data.level;
        this.appearance = data.appearance || {};
        this.equipment = data.equipment || {};
        this.race = data.race || 'human';
        
        // Interpolación para movimiento suave
        this.targetX = this.x;
        this.targetY = this.y;
        this.interpolationSpeed = 0.15;
    }

    /**
     * Actualizar posición del jugador
     * @param {number} x - Nueva posición X
     * @param {number} y - Nueva posición Y
     */
    updatePosition(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    /**
     * Actualizar con interpolación suave
     */
    update() {
        // Interpolar posición hacia la posición objetivo
        if (this.x !== this.targetX || this.y !== this.targetY) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            
            // Si está muy cerca, saltar directamente
            if (Math.abs(dx) < 0.01) {
                this.x = this.targetX;
            } else {
                this.x += dx * this.interpolationSpeed;
            }
            
            if (Math.abs(dy) < 0.01) {
                this.y = this.targetY;
            } else {
                this.y += dy * this.interpolationSpeed;
            }
        }
    }

    /**
     * Verificar si el jugador está en movimiento
     * @returns {boolean}
     */
    isMoving() {
        return this.x !== this.targetX || this.y !== this.targetY;
    }

    /**
     * Obtener datos para serialización
     * @returns {Object}
     */
    toJSON() {
        return {
            socketId: this.socketId,
            username: this.username,
            x: this.x,
            y: this.y,
            map: this.map,
            class: this.class,
            level: this.level,
            appearance: this.appearance
        };
    }
}