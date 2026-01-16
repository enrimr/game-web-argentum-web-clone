/**
 * BotInfoCard.js
 * Sistema para mostrar ficha de información de bots/jugadores en el chat
 */

import { addChatMessage } from './UI.js';

/**
 * Muestra la ficha de información de un bot en el chat
 * @param {Object} bot - El bot del que mostrar información
 */
export function showBotInfoCard(bot) {
    // Calcular tiempo online (desde creación)
    const onlineTime = Math.floor((Date.now() - bot.createdAt) / 1000 / 60); // minutos
    
    // Crear la ficha simple en una línea
    const card = `${bot.name} (${bot.hp}/${bot.maxHp}) ║ Lvl. ${bot.level} ║ ${bot.class} ║ ${bot.faction} | Online: ${onlineTime} min`;
    
    // Mostrar en el chat
    addChatMessage('system', card);
}

/**
 * Obtiene una descripción legible del comportamiento actual
 * @param {string} behavior - Comportamiento del bot
 * @returns {string} Descripción del comportamiento
 */
function getBehaviorDescription(behavior) {
    const descriptions = {
        'idle': '💤 Descansando',
        'wandering': '🚶 Explorando',
        'hunting': '⚔️ Cazando enemigos',
        'chatting': '💬 Conversando',
        'traveling': '🗺️ Viajando'
    };
    
    return descriptions[behavior] || '❓ Desconocido';
}

/**
 * Muestra información resumida de un bot (versión corta)
 * @param {Object} bot - El bot del que mostrar información
 */
export function showBotInfoShort(bot) {
    const hpPercent = Math.floor((bot.hp / bot.maxHp) * 100);
    addChatMessage('info', `🤖 ${bot.name} - Lv.${bot.level} ${bot.class} [${bot.faction}] - HP: ${hpPercent}%`);
}
