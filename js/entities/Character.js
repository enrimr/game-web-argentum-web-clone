/**
 * Character.js
 * Base class for all characters (Player, Enemy, NPC)
 * Similar to AO's character structure
 */

export class Character {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.hp = 100;
        this.maxHp = 100;
        this.facing = 'down';
        this.moving = false;
        this.name = '';
    }
    
    /**
     * Apply damage to character
     * @param {number} amount - Damage amount
     * @returns {boolean} True if character died
     */
    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp === 0;
    }
    
    /**
     * Heal character
     * @param {number} amount - Heal amount
     */
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }
    
    /**
     * Set character position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Get character position
     * @returns {object} Position {x, y}
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
