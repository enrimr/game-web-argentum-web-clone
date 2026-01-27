/**
 * CriminalitySystem.js
 * Gestiona el sistema de criminalidad: puntos, decay, ataques PvP
 */

import { gameState } from '../state.js';
import { addCriminalPoints, reduceCriminalPoints, isCriminal, getCriminalStatusText } from './Factions.js';
import { addChatMessage } from '../ui/UI.js';

// Configuración del sistema
const CRIMINALITY_CONFIG = {
    // Puntos por acciones
    ATTACK_CITIZEN: 10,           // Atacar a ciudadano
    ATTACK_CITIZEN_2ND: 15,       // Segundo ataque
    ATTACK_CITIZEN_3RD: 20,       // Tercer ataque y siguientes
    KILL_CITIZEN: 50,             // Matar a ciudadano
    ATTACK_CRIMINAL: 0,           // Atacar criminal (no suma)
    KILL_CRIMINAL: -5,            // Matar criminal (resta puntos - cazador de recompensas)
    
    // Decay natural
    DECAY_INTERVAL: 300000,       // 5 minutos en ms
    DECAY_AMOUNT: 1,              // Puntos que se reducen cada intervalo
    
    // Thresholds
    CITIZEN_THRESHOLD: 20,        // < 20 = ciudadano
    MINOR_CRIMINAL_THRESHOLD: 50, // >= 50 = criminal
    ASSASSIN_THRESHOLD: 80        // >= 80 = asesino
};

// Estado del sistema
let lastDecayTime = Date.now();
let attackWarningShown = false;

/**
 * Maneja un ataque del jugador a un bot
 * @param {object} attacker - Jugador que ataca
 * @param {object} target - Bot objetivo
 * @returns {boolean} True si el ataque está permitido
 */
export function handlePlayerAttackOnBot(attacker, target) {
    // Si el objetivo es fantasma, no se puede atacar
    if (target.isGhost) {
        addChatMessage('system', '👻 No puedes atacar a un fantasma.');
        return false;
    }
    
    // Verificar si el objetivo es ciudadano o criminal
    const targetIsCriminal = target.criminalStatus >= CRIMINALITY_CONFIG.MINOR_CRIMINAL_THRESHOLD;
    
    // Si atacas a un ciudadano por primera vez, mostrar advertencia
    if (!targetIsCriminal && !attackWarningShown && attacker.criminalStatus < CRIMINALITY_CONFIG.CITIZEN_THRESHOLD) {
        addChatMessage('system', `⚠️ ADVERTENCIA: Atacar a ${target.name} te convertirá en criminal!`);
        addChatMessage('system', `⚠️ Los guardias te atacarán. Presiona ESPACIO de nuevo para confirmar.`);
        attackWarningShown = true;
        return false; // Bloquear primer ataque
    }
    
    // Resetear warning después del primer ataque
    if (attackWarningShown) {
        attackWarningShown = false;
    }
    
    // Si el objetivo NO es criminal, sumar puntos criminales
    if (!targetIsCriminal) {
        // Calcular puntos según historial
        const attackCount = attacker.attackHistory?.[target.id] || 0;
        let points = CRIMINALITY_CONFIG.ATTACK_CITIZEN;
        
        if (attackCount === 1) {
            points = CRIMINALITY_CONFIG.ATTACK_CITIZEN_2ND;
        } else if (attackCount >= 2) {
            points = CRIMINALITY_CONFIG.ATTACK_CITIZEN_3RD;
        }
        
        // Sumar puntos criminales
        addCriminalPoints(attacker, points);
        
        // Actualizar historial
        if (!attacker.attackHistory) attacker.attackHistory = {};
        attacker.attackHistory[target.id] = attackCount + 1;
        
        // Notificar cambio de status
        const oldStatus = getCriminalStatusText(attacker.criminalStatus - points);
        const newStatus = getCriminalStatusText(attacker.criminalStatus);
        
        if (oldStatus !== newStatus) {
            addChatMessage('system', `⚖️ Tu status ha cambiado: ${oldStatus} → ${newStatus}`);
            
            if (isCriminal(attacker.criminalStatus)) {
                addChatMessage('system', '🚨 ¡Ahora eres un CRIMINAL! Los guardias te atacarán.');
            }
        } else {
            addChatMessage('system', `⚖️ +${points} puntos criminales (${attacker.criminalStatus}/100)`);
        }
    }
    
    return true; // Permitir ataque
}

/**
 * Maneja la muerte de un bot por el jugador
 * @param {object} attacker - Jugador que mató
 * @param {object} target - Bot que murió
 */
export function handlePlayerKillBot(attacker, target) {
    const targetWasCriminal = target.criminalStatus >= CRIMINALITY_CONFIG.MINOR_CRIMINAL_THRESHOLD;
    
    if (targetWasCriminal) {
        // Matar criminal: reduce puntos (cazador de recompensas)
        const oldPoints = attacker.criminalStatus;
        reduceCriminalPoints(attacker, Math.abs(CRIMINALITY_CONFIG.KILL_CRIMINAL));
        addChatMessage('system', `⚖️ Has eliminado un criminal: ${CRIMINALITY_CONFIG.KILL_CRIMINAL} puntos (${oldPoints} → ${attacker.criminalStatus})`);
    } else {
        // Matar ciudadano: suma muchos puntos
        addCriminalPoints(attacker, CRIMINALITY_CONFIG.KILL_CITIZEN);
        addChatMessage('system', `⚖️ Has matado a un ciudadano: +${CRIMINALITY_CONFIG.KILL_CITIZEN} puntos criminales!`);
        addChatMessage('system', `🚨 Status criminal: ${getCriminalStatusText(attacker.criminalStatus)} (${attacker.criminalStatus}/100)`);
    }
    
    // Limpiar del historial de ataques
    if (attacker.attackHistory) {
        delete attacker.attackHistory[target.id];
    }
}

/**
 * Actualiza el sistema de decay (llamar periódicamente)
 * @param {number} currentTime - Timestamp actual
 */
export function updateCriminalityDecay(currentTime) {
    // Solo aplicar decay si han pasado 5 minutos
    if (currentTime - lastDecayTime < CRIMINALITY_CONFIG.DECAY_INTERVAL) {
        return;
    }
    
    // Aplicar decay al jugador
    if (gameState.player.criminalStatus > 0) {
        const oldStatus = gameState.player.criminalStatus;
        reduceCriminalPoints(gameState.player, CRIMINALITY_CONFIG.DECAY_AMOUNT);
        
        if (gameState.player.criminalStatus !== oldStatus) {
            console.log(`⏰ Decay criminal: ${oldStatus} → ${gameState.player.criminalStatus}`);
            
            // Notificar si cambia de status
            const oldStatusText = getCriminalStatusText(oldStatus);
            const newStatusText = getCriminalStatusText(gameState.player.criminalStatus);
            
            if (oldStatusText !== newStatusText) {
                addChatMessage('system', `⚖️ Status: ${oldStatusText} → ${newStatusText}`);
            }
        }
    }
    
    lastDecayTime = currentTime;
}

/**
 * Verifica si un ataque está permitido
 * @param {object} attacker - Jugador/bot que ataca
 * @param {object} target - Objetivo
 * @returns {object} {allowed: boolean, reason: string}
 */
export function canAttackTarget(attacker, target) {
    // No se puede atacar a sí mismo
    if (attacker === target) {
        return { allowed: false, reason: 'No puedes atacarte a ti mismo' };
    }
    
    // No se puede atacar fantasmas
    if (target.isGhost) {
        return { allowed: false, reason: 'No puedes atacar fantasmas' };
    }
    
    // Miembros de la misma facción (si no son facciones malvadas)
    if (attacker.faction && attacker.faction === target.faction) {
        // Caos y Legión pueden atacarse entre sí
        if (attacker.faction !== 'Caos' && attacker.faction !== 'Legión') {
            return { allowed: false, reason: `No puedes atacar a tu compañero de ${attacker.faction}!` };
        }
    }
    
    // Todo lo demás está permitido
    return { allowed: true, reason: '' };
}

/**
 * Obtiene el config de criminalidad
 * @returns {object} Configuración
 */
export function getCriminalityConfig() {
    return CRIMINALITY_CONFIG;
}

/**
 * Resetea el historial de ataques del jugador
 */
export function resetAttackHistory() {
    if (gameState.player.attackHistory) {
        gameState.player.attackHistory = {};
    }
}
