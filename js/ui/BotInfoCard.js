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
    
    // Calcular porcentaje de vida
    const hpPercent = Math.floor((bot.hp / bot.maxHp) * 100);
    
    // Crear la ficha con formato visual
    const card = `
╔════════════════════════════════════╗
║  📋 FICHA DE JUGADOR              ║
╠════════════════════════════════════╣
║ 👤 Nombre: ${bot.name.padEnd(23, ' ')}║
║ ⭐ Nivel: ${String(bot.level).padEnd(24, ' ')}║
║ 💼 Clase: ${bot.class.padEnd(23, ' ')}║
║ 🏴 Facción: ${bot.faction.padEnd(21, ' ')}║
║ ❤️  Vida: ${String(hpPercent).padStart(3, ' ')}% (${bot.hp}/${bot.maxHp})${' '.repeat(Math.max(0, 13 - String(bot.hp).length - String(bot.maxHp).length))}║
║ 🎯 Estado: ${bot.status.padEnd(22, ' ')}║
║ 🕐 Online: ${String(onlineTime).padEnd(19, ' ')} min ║
${bot.guild ? `║ 🏰 Guild: ${bot.guild.padEnd(23, ' ')}║` : ''}
╚════════════════════════════════════╝
    `.trim();
    
    // Mostrar en el chat
    addChatMessage('system', card);
    
    // Información adicional
    addChatMessage('info', `📍 Ubicación: Mapa ${bot.currentMap} (${bot.x}, ${bot.y})`);
    addChatMessage('info', `🤖 Comportamiento actual: ${getBehaviorDescription(bot.behavior)}`);
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
