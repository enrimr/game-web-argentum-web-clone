/**
 * Factions.js
 * Sistema de facciones y alineamientos del juego
 */

// Tipos de alineamiento
export const ALIGNMENT = {
    GOOD: 'good',       // Facciones buenas (protegidas por guardias)
    NEUTRAL: 'neutral', // Facciones neutrales (no atacadas por guardias)
    EVIL: 'evil'        // Facciones malas (atacadas por guardias)
};

// Configuración de facciones
export const FACTIONS = {
    REINO: {
        name: 'Reino',
        alignment: ALIGNMENT.GOOD,
        color: '#3b82f6', // Blue
        description: 'Ciudadanos leales al reino',
        allies: ['ARMADA'],
        enemies: ['CAOS', 'LEGIÓN']
    },
    ARMADA: {
        name: 'Armada',
        alignment: ALIGNMENT.GOOD,
        color: '#06b6d4', // Cyan
        description: 'Fuerzas navales del reino',
        allies: ['REINO'],
        enemies: ['CAOS', 'LEGIÓN']
    },
    NEUTRAL: {
        name: 'Neutral',
        alignment: ALIGNMENT.NEUTRAL,
        color: '#a3a3a3', // Gray
        description: 'Sin afiliación política',
        allies: [],
        enemies: []
    },
    LEGIÓN: {
        name: 'Legión',
        alignment: ALIGNMENT.EVIL,
        color: '#9ca3af', // Gray
        description: 'Legión oscura que sirve al mal',
        allies: ['CAOS'],
        enemies: ['REINO', 'ARMADA']
    },
    CAOS: {
        name: 'Caos',
        alignment: ALIGNMENT.EVIL,
        color: '#ef4444', // Red
        description: 'Seguidores del caos y la destrucción',
        allies: ['LEGIÓN'],
        enemies: ['REINO', 'ARMADA']
    }
};

/**
 * Obtiene la configuración de una facción
 * @param {string} factionName - Nombre de la facción
 * @returns {Object} Configuración de la facción
 */
export function getFaction(factionName) {
    const normalizedName = factionName?.toUpperCase();
    return FACTIONS[normalizedName] || FACTIONS.NEUTRAL;
}

/**
 * Verifica si una facción es malvada
 * @param {string} factionName - Nombre de la facción
 * @returns {boolean} True si la facción es malvada
 */
export function isEvilFaction(factionName) {
    const faction = getFaction(factionName);
    return faction.alignment === ALIGNMENT.EVIL;
}

/**
 * Verifica si una facción es buena
 * @param {string} factionName - Nombre de la facción
 * @returns {boolean} True si la facción es buena
 */
export function isGoodFaction(factionName) {
    const faction = getFaction(factionName);
    return faction.alignment === ALIGNMENT.GOOD;
}

/**
 * Verifica si una facción es neutral
 * @param {string} factionName - Nombre de la facción
 * @returns {boolean} True si la facción es neutral
 */
export function isNeutralFaction(factionName) {
    const faction = getFaction(factionName);
    return faction.alignment === ALIGNMENT.NEUTRAL;
}

/**
 * Verifica si dos facciones son enemigas
 * @param {string} faction1 - Nombre de la primera facción
 * @param {string} faction2 - Nombre de la segunda facción
 * @returns {boolean} True si son enemigas
 */
export function areEnemies(faction1, faction2) {
    const f1 = getFaction(faction1);
    const f2Name = faction2?.toUpperCase();
    return f1.enemies.includes(f2Name);
}

/**
 * Verifica si dos facciones son aliadas
 * @param {string} faction1 - Nombre de la primera facción
 * @param {string} faction2 - Nombre de la segunda facción
 * @returns {boolean} True si son aliadas
 */
export function areAllies(faction1, faction2) {
    const f1 = getFaction(faction1);
    const f2Name = faction2?.toUpperCase();
    return f1.allies.includes(f2Name);
}

/**
 * Obtiene el color de una facción
 * @param {string} factionName - Nombre de la facción
 * @returns {string} Color hexadecimal de la facción
 */
export function getFactionColor(factionName) {
    const faction = getFaction(factionName);
    return faction.color;
}

/**
 * Verifica si un guardia debería atacar a un jugador/bot según su facción
 * @param {string} targetFaction - Facción del objetivo
 * @param {number} criminalStatus - Puntos criminales del objetivo (0-100)
 * @returns {boolean} True si el guardia debería atacar
 */
export function shouldGuardAttack(targetFaction, criminalStatus = 0) {
    // Atacar si es facción malvada
    if (isEvilFaction(targetFaction)) return true;
    
    // Atacar si es criminal (>= 50 puntos)
    if (criminalStatus >= 50) return true;
    
    return false;
}

/**
 * Obtiene el status criminal como texto
 * @param {number} criminalStatus - Puntos criminales (0-100)
 * @returns {string} Descripción del status
 */
export function getCriminalStatusText(criminalStatus) {
    if (criminalStatus >= 80) return 'Asesino';
    if (criminalStatus >= 50) return 'Criminal';
    if (criminalStatus >= 20) return 'Criminal Menor';
    return 'Ciudadano';
}

/**
 * Obtiene el color del nombre según criminalidad
 * @param {number} criminalStatus - Puntos criminales (0-100)
 * @param {string} faction - Facción del jugador
 * @returns {string} Color hexadecimal
 */
export function getNameColor(criminalStatus, faction) {
    // Criminales siempre en rojo, independiente de facción
    if (criminalStatus >= 50) return '#ef4444';
    
    // Si no es criminal, usar color de facción
    return getFactionColor(faction);
}

/**
 * Verifica si un jugador es considerado criminal
 * @param {number} criminalStatus - Puntos criminales (0-100)
 * @returns {boolean} True si es criminal
 */
export function isCriminal(criminalStatus) {
    return criminalStatus >= 50;
}

/**
 * Añade puntos criminales a un jugador
 * @param {object} player - Objeto jugador
 * @param {number} points - Puntos a añadir
 */
export function addCriminalPoints(player, points) {
    player.criminalStatus = Math.min(100, player.criminalStatus + points);
}

/**
 * Reduce puntos criminales (decay o redención)
 * @param {object} player - Objeto jugador
 * @param {number} points - Puntos a reducir
 */
export function reduceCriminalPoints(player, points) {
    player.criminalStatus = Math.max(0, player.criminalStatus - points);
}

/**
 * Une al jugador a una facción
 * @param {object} player - Objeto jugador
 * @param {string} factionName - Nombre de la facción
 * @param {number} cost - Costo en oro
 * @returns {object} {success: boolean, message: string}
 */
export function joinFaction(player, factionName, cost = 500) {
    // Validar que la facción existe
    const faction = getFaction(factionName);
    if (!faction || faction === FACTIONS.NEUTRAL) {
        return { success: false, message: 'Facción no válida.' };
    }
    
    // Validar nivel mínimo
    if (player.level < 5) {
        return { success: false, message: 'Necesitas nivel 5 o superior para unirte a una facción.' };
    }
    
    // Validar que no sea criminal (para facciones buenas)
    if (isGoodFaction(factionName) && player.criminalStatus >= 20) {
        return { success: false, message: 'No puedes unirte al Reino o Armada siendo criminal.' };
    }
    
    // Validar oro
    if (player.gold < cost) {
        return { success: false, message: `Necesitas ${cost} de oro para unirte.` };
    }
    
    // Si ya tiene facción (y no es Neutral), verificar traición
    if (player.faction && player.faction !== 'Neutral') {
        return { success: false, message: `Ya perteneces a ${player.faction}. Debes abandonarla primero.` };
    }
    
    // Procesar unión
    player.gold -= cost;
    player.faction = factionName;
    
    // Establecer reputación inicial
    player.factionReputation[factionName.toUpperCase()] = 50; // Empieza como amigable
    
    return {
        success: true,
        message: `¡Te has unido a ${factionName}! Bienvenido.`,
        faction: factionName
    };
}

/**
 * Abandona la facción actual
 * @param {object} player - Objeto jugador
 * @returns {object} {success: boolean, message: string}
 */
export function leaveFaction(player) {
    console.log('=== leaveFaction LLAMADO ===');
    console.log('Player.faction:', player.faction);
    console.log('Player object:', player);
    
    if (!player.faction || player.faction === 'Neutral') {
        console.log('FALLO: Player sin facción o ya Neutral');
        return { success: false, message: 'No perteneces a ninguna facción.' };
    }
    
    const oldFaction = player.faction;
    console.log('oldFaction guardada:', oldFaction);
    
    // Penalización: la facción anterior te considera enemigo
    console.log('Estableciendo reputación -50 para:', oldFaction.toUpperCase());
    player.factionReputation[oldFaction.toUpperCase()] = -50;
    
    // Abandonar facción y volver a neutral
    console.log('Cambiando player.faction de', player.faction, 'a Neutral');
    player.faction = 'Neutral';
    console.log('Player.faction después del cambio:', player.faction);
    
    const result = {
        success: true,
        message: `Has abandonado ${oldFaction}. Ahora te consideran enemigo.`,
        oldFaction: oldFaction
    };
    console.log('Retornando resultado:', result);
    console.log('=== leaveFaction FINALIZADO ===');
    
    return result;
}

/**
 * Obtiene el bonus de daño según facción
 * @param {string} attackerFaction - Facción del atacante
 * @param {string} targetFaction - Facción del objetivo
 * @returns {number} Multiplicador de daño (1.0 = sin bonus, 1.15 = +15%)
 */
export function getDamageBonus(attackerFaction, targetFaction) {
    if (!attackerFaction) return 1.0; // Sin facción, sin bonus
    
    const normalizedAttacker = attackerFaction.toUpperCase();
    const normalizedTarget = targetFaction?.toUpperCase();
    
    switch (normalizedAttacker) {
        case 'CAOS':
            // Caos: +15% daño contra TODOS
            return 1.15;
            
        case 'LEGIÓN':
            // Legión: +10% daño contra Reino y Armada
            if (normalizedTarget === 'REINO' || normalizedTarget === 'ARMADA') {
                return 1.10;
            }
            return 1.0;
            
        case 'REINO':
        case 'ARMADA':
        case 'NEUTRAL':
        default:
            // Sin bonus especial
            return 1.0;
    }
}
