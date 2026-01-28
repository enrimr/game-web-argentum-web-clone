/**
 * ResourceGathering.js
 * Sistema reutilizable de recolección de recursos
 * Inspirado en Argentum Online: talar, minar, pescar, etc.
 */

import { gameState } from '../state.js';
import { addChatMessage } from '../ui/UI.js';
import { ITEM_TYPES } from './ItemTypes.js';
import { addItemToInventory } from './Inventory.js';
import { SKILLS, calculateSuccessChance, gainSkillExperience, calculateSkillExpRequired } from './Skills.js';
import { getSkillModifier } from './Classes.js';
import { audioManager } from './AudioManager.js';

/**
 * Configuración de tipos de recursos recolectables
 */
export const RESOURCE_TYPES = {
    TREE: {
        id: 'tree',
        name: 'Árbol',
        requiredTool: 'AXE',
        requiredSkill: 'WOODCUTTING',
        baseWorkTime: 2500, // ms
        minTotalResources: 50, // Mínimo de recursos por árbol
        maxTotalResources: 200, // Máximo de recursos por árbol (reducido para que se agote más rápido)
        minResourcesPerHit: 3, // Mínimo de recursos por golpe (aumentado)
        maxResourcesPerHit: 8, // Máximo de recursos por golpe (aumentado)
        resources: [
            { itemType: 'WOOD', minAmount: 2, maxAmount: 5, minLevel: 1, chance: 1.0 },
            { itemType: 'OAK_WOOD', minAmount: 1, maxAmount: 3, minLevel: 15, chance: 0.3 },
            { itemType: 'ELVEN_WOOD', minAmount: 1, maxAmount: 2, minLevel: 50, chance: 0.1 }
        ],
        icon: '🌲',
        actionVerb: 'talar',
        actionSound: '🪓'
    },
    IRON_VEIN: {
        id: 'iron_vein',
        name: 'Veta de Hierro',
        requiredTool: 'PICKAXE',
        requiredSkill: 'MINING',
        baseWorkTime: 3000,
        minTotalResources: 50,
        maxTotalResources: 200,
        minResourcesPerHit: 3,
        maxResourcesPerHit: 7,
        resources: [
            { itemType: 'IRON_ORE', minAmount: 2, maxAmount: 4, minLevel: 1, chance: 0.8 },
            { itemType: 'COAL', minAmount: 1, maxAmount: 2, minLevel: 5, chance: 0.4 }
        ],
        icon: '⛰️',
        actionVerb: 'picar',
        actionSound: '⛏️'
    },
    GOLD_VEIN: {
        id: 'gold_vein',
        name: 'Veta de Oro',
        requiredTool: 'PICKAXE',
        requiredSkill: 'MINING',
        baseWorkTime: 3500,
        minTotalResources: 50,
        maxTotalResources: 150,
        minResourcesPerHit: 2,
        maxResourcesPerHit: 5,
        resources: [
            { itemType: 'GOLD_ORE', minAmount: 1, maxAmount: 3, minLevel: 40, chance: 0.5 }
        ],
        icon: '🏔️',
        actionVerb: 'picar',
        actionSound: '⛏️'
    },
    SILVER_VEIN: {
        id: 'silver_vein',
        name: 'Veta de Plata',
        requiredTool: 'PICKAXE',
        requiredSkill: 'MINING',
        baseWorkTime: 3200,
        minTotalResources: 50,
        maxTotalResources: 10000,
        minResourcesPerHit: 1,
        maxResourcesPerHit: 3,
        resources: [
            { itemType: 'SILVER_ORE', minAmount: 1, maxAmount: 2, minLevel: 20, chance: 0.6 }
        ],
        icon: '🗻',
        actionVerb: 'picar',
        actionSound: '⛏️'
    },
    SHEEP: {
        id: 'sheep',
        name: 'Oveja',
        requiredTool: 'SHEARS',
        requiredSkill: 'WOODCUTTING', // Reutilizamos esta skill por ahora
        baseWorkTime: 2000,
        minTotalResources: 50,
        maxTotalResources: 200, // Ovejas más limitadas
        minResourcesPerHit: 1,
        maxResourcesPerHit: 3,
        resources: [
            { itemType: 'WOOL', minAmount: 1, maxAmount: 3, minLevel: 1, chance: 0.9 }
        ],
        icon: '🐑',
        actionVerb: 'esquilar',
        actionSound: '✂️',
        respawnTime: 30000 // Las ovejas se pueden esquilar de nuevo después de 30 segundos
    },
    FISHING_SPOT: {
        id: 'fishing_spot',
        name: 'Zona de Pesca',
        requiredTool: 'FISHING_ROD',
        requiredSkill: 'FISHING',
        baseWorkTime: 4000, // 4 segundos por intento
        minTotalResources: 100, // Las zonas de pesca tienen más "peces"
        maxTotalResources: 300,
        minResourcesPerHit: 2,
        maxResourcesPerHit: 5,
        resources: [
            { itemType: 'FISH', minAmount: 1, maxAmount: 3, minLevel: 1, chance: 0.7 },
            { itemType: 'FISH_BIG', minAmount: 1, maxAmount: 2, minLevel: 20, chance: 0.3 },
            { itemType: 'FISH_RARE', minAmount: 1, maxAmount: 1, minLevel: 50, chance: 0.1 },
            { itemType: 'FISH_GOLDEN', minAmount: 1, maxAmount: 1, minLevel: 75, chance: 0.05 }
        ],
        icon: '🎣',
        actionVerb: 'pescar en',
        actionSound: '🎣',
        respawnTime: 60000 // Las zonas de pesca se repueblan cada minuto
    }
};

/**
 * Herramientas requeridas para cada tipo de recolección
 */
export const GATHERING_TOOLS = {
    AXE: ['AXE', 'AXE_IRON', 'AXE_STEEL'],
    PICKAXE: ['PICKAXE', 'PICKAXE_IRON', 'PICKAXE_STEEL'],
    SHEARS: ['SHEARS'],
    FISHING_ROD: ['FISHING_ROD', 'FISHING_ROD_GOOD']
};

/**
 * Estado de recolección del jugador
 */
export const gatheringState = {
    isGathering: false,
    currentResource: null,
    startTime: 0,
    targetObject: null,
    intervalId: null,
    initialPlayerX: null,
    initialPlayerY: null,
    requiredTool: null
};

/**
 * Intenta recolectar un recurso
 * @param {Object} resourceObject - Objeto de recurso a recolectar
 * @returns {boolean} True si la recolección comenzó exitosamente
 */
export function attemptGathering(resourceObject) {
    // Verificar que el jugador está vivo
    if (gameState.player.isGhost) {
        addChatMessage('system', '👻 Como fantasma no puedes recolectar recursos.');
        return false;
    }

    // Verificar que no está ya recolectando
    if (gatheringState.isGathering) {
        addChatMessage('system', '⏳ Ya estás recolectando un recurso.');
        return false;
    }

    // Obtener la definición del tipo de recurso
    const resourceType = RESOURCE_TYPES[resourceObject.resourceType];
    if (!resourceType) {
        console.error(`Tipo de recurso desconocido: ${resourceObject.resourceType}`);
        return false;
    }

    // Verificar que el recurso no está agotado
    if (resourceObject.depleted || (resourceObject.remainingResources !== undefined && resourceObject.remainingResources <= 0)) {
        addChatMessage('system', `❌ Este ${resourceType.name} ya está agotado.`);
        return false;
    }
    
    // Inicializar cantidad de recursos si no existe (aleatoria entre min y max)
    if (resourceObject.remainingResources === undefined) {
        const min = resourceType.minTotalResources;
        const max = resourceType.maxTotalResources;
        resourceObject.totalResources = min + Math.floor(Math.random() * (max - min + 1));
        resourceObject.remainingResources = resourceObject.totalResources;
        console.log(`🎲 Recurso inicializado con ${resourceObject.totalResources} recursos totales`);
    }

    // Verificar herramienta equipada
    const equippedWeapon = gameState.player.equipped.weapon;
    const requiredTools = GATHERING_TOOLS[resourceType.requiredTool];
    
    if (!equippedWeapon || !requiredTools.includes(equippedWeapon)) {
        const toolName = getToolName(resourceType.requiredTool);
        addChatMessage('system', `❌ Necesitas equipar ${toolName} para ${resourceType.actionVerb} ${resourceType.name.toLowerCase()}.`);
        return false;
    }

    // Verificar nivel de skill
    const skillLevel = gameState.player.skills[resourceType.requiredSkill] || 1;
    
    // Guardar posición inicial del jugador
    gatheringState.initialPlayerX = gameState.player.x;
    gatheringState.initialPlayerY = gameState.player.y;
    gatheringState.requiredTool = resourceType.requiredTool;

    // Marcar el objeto como siendo recolectado actualmente
    resourceObject.beingGathered = true;
    
    // Iniciar recolección
    gatheringState.isGathering = true;
    gatheringState.currentResource = resourceType;
    gatheringState.startTime = Date.now();
    gatheringState.targetObject = resourceObject;

    // Calcular tiempo de trabajo basado en nivel de skill
    const workTime = calculateWorkTime(resourceType.baseWorkTime, skillLevel);

    addChatMessage('system', `${resourceType.actionSound} Comenzaste a ${resourceType.actionVerb} el ${resourceType.name}...`);

    // Configurar intervalos para intentos continuos
    gatheringState.intervalId = setInterval(() => {
        performGatheringAttempt();
    }, workTime);

    return true;
}

/**
 * Realiza un intento de recolección
 */
function performGatheringAttempt() {
    if (!gatheringState.isGathering) return;

    const resourceType = gatheringState.currentResource;
    const resourceObject = gatheringState.targetObject;
    const skillLevel = gameState.player.skills[resourceType.requiredSkill] || 1;

    // Verificar que el jugador no se movió
    if (gameState.player.x !== gatheringState.initialPlayerX || 
        gameState.player.y !== gatheringState.initialPlayerY) {
        addChatMessage('system', `🚶 Te has movido, la recolección se detuvo.`);
        cancelGathering();
        return;
    }

    // Verificar que la herramienta sigue equipada
    const equippedWeapon = gameState.player.equipped.weapon;
    const requiredTools = GATHERING_TOOLS[gatheringState.requiredTool];
    if (!equippedWeapon || !requiredTools.includes(equippedWeapon)) {
        addChatMessage('system', `❌ Desequipaste la herramienta, la recolección se detuvo.`);
        cancelGathering();
        return;
    }

    // Verificar que el recurso no está agotado
    if (resourceObject.depleted || resourceObject.remainingResources <= 0) {
        // Recurso agotado
        if (resourceType.respawnTime) {
            resourceObject.depleted = true;
            resourceObject.respawnAt = Date.now() + resourceType.respawnTime;
            
            setTimeout(() => {
                if (resourceObject) {
                    resourceObject.depleted = false;
                    resourceObject.respawnAt = null;
                    const min = resourceType.minTotalResources;
                    const max = resourceType.maxTotalResources;
                    resourceObject.totalResources = min + Math.floor(Math.random() * (max - min + 1));
                    resourceObject.remainingResources = resourceObject.totalResources;
                }
            }, resourceType.respawnTime);
            
            addChatMessage('system', `🌟 El ${resourceType.name} se ha agotado temporalmente.`);
        } else {
            resourceObject.depleted = true;
            addChatMessage('system', `💀 El ${resourceType.name} se ha agotado completamente.`);
        }
        cancelGathering();
        return;
    }

    // Calcular probabilidad de éxito usando fórmula de AO
    const successChance = calculateSuccessChance(skillLevel);
    const randomRoll = Math.floor(Math.random() * successChance) + 1;
    const succeeded = randomRoll <= 3;
    
    if (succeeded) {
        // Reproducir sonido de recolección según el tipo de recurso
        playGatheringSound(resourceType);

        // Calcular cuántos recursos se extraen
        const resourcesExtracted = calculateResourcesExtracted(resourceType, skillLevel);
        
        // Reducir la cantidad restante del recurso
        resourceObject.remainingResources = Math.max(0, resourceObject.remainingResources - resourcesExtracted);
        
        // Calcular recursos obtenidos
        const obtainedResources = calculateResourcesObtained(resourceType, skillLevel, resourcesExtracted);

        // Agregar recursos al inventario
        for (const resource of obtainedResources) {
            const success = addItemToInventory(resource.itemType, resource.amount);
            if (success) {
                const itemName = ITEM_TYPES[resource.itemType].name;
                addChatMessage('system', `✅ ¡Obtuviste ${resource.amount}x ${itemName}!`);
            } else {
                addChatMessage('system', '⚠️ Inventario lleno, la recolección se detuvo.');
                cancelGathering();
                return;
            }
        }
        
        // Mostrar progreso del recurso
        const totalResources = resourceObject.totalResources || resourceType.minTotalResources;
        const percentage = Math.floor((resourceObject.remainingResources / totalResources) * 100);
        addChatMessage('system', `📊 Recurso restante: ${resourceObject.remainingResources}/${totalResources} (${percentage}%)`);
    } else {
        // Falló la recolección
        addChatMessage('system', `❌ No has conseguido extraer nada del ${resourceType.name}.`);
    }

    // Ganar experiencia en la skill
    const leveledUp = gainSkillExperience(gameState.player, resourceType.requiredSkill, succeeded);
    
    if (leveledUp) {
        const skillName = SKILLS[resourceType.requiredSkill].name;
        const newLevel = gameState.player.skills[resourceType.requiredSkill];
        addChatMessage('system', `⭐ ¡Tu habilidad de ${skillName} ha mejorado a nivel ${newLevel}!`);
        addChatMessage('system', `✨ ¡Has ganado 50 puntos de experiencia!`);
    }

    // Actualizar UI
    import('../ui/UI.js').then(({ updateUI }) => {
        updateUI();
    });
}

/**
 * Cancela la recolección en curso
 */
export function cancelGathering(silent = false) {
    if (gatheringState.isGathering) {
        // Marcar el objeto como ya no siendo recolectado
        if (gatheringState.targetObject) {
            gatheringState.targetObject.beingGathered = false;
        }
        
        // Limpiar el intervalo
        if (gatheringState.intervalId) {
            clearInterval(gatheringState.intervalId);
            gatheringState.intervalId = null;
        }
        
        if (!silent) {
            addChatMessage('system', '❌ Recolección cancelada.');
        }
        
        gatheringState.isGathering = false;
        gatheringState.currentResource = null;
        gatheringState.startTime = 0;
        gatheringState.targetObject = null;
        gatheringState.initialPlayerX = null;
        gatheringState.initialPlayerY = null;
        gatheringState.requiredTool = null;
    }
}

/**
 * Calcula el tiempo de trabajo basado en el nivel de skill
 * @param {number} baseTime - Tiempo base en ms
 * @param {number} skillLevel - Nivel de la skill
 * @returns {number} Tiempo ajustado en ms
 */
function calculateWorkTime(baseTime, skillLevel) {
    // A mayor nivel, más rápido se recolecta (hasta 50% más rápido al nivel 100)
    const speedBonus = 1 - (skillLevel / 200);
    return Math.floor(baseTime * speedBonus);
}

/**
 * Calcula cuántos recursos se extraen del nodo basándose en el skill
 * @param {Object} resourceType - Tipo de recurso
 * @param {number} skillLevel - Nivel de la skill
 * @returns {number} Cantidad de recursos extraídos del nodo
 */
function calculateResourcesExtracted(resourceType, skillLevel) {
    // Skill level afecta la cantidad extraída por golpe
    // Nivel 1: minResourcesPerHit
    // Nivel 100: maxResourcesPerHit
    const skillFactor = skillLevel / 100;
    const range = resourceType.maxResourcesPerHit - resourceType.minResourcesPerHit;
    const extracted = resourceType.minResourcesPerHit + Math.floor(range * skillFactor);
    
    return Math.max(resourceType.minResourcesPerHit, extracted);
}

/**
 * Calcula los recursos obtenidos basado en skill level y cantidad extraída
 * @param {Object} resourceType - Tipo de recurso
 * @param {number} skillLevel - Nivel de la skill
 * @param {number} resourcesExtracted - Cantidad de recursos extraídos del nodo
 * @returns {Array} Array de recursos obtenidos {itemType, amount}
 */
function calculateResourcesObtained(resourceType, skillLevel, resourcesExtracted) {
    const obtained = [];

    for (const resource of resourceType.resources) {
        // Verificar nivel mínimo
        if (skillLevel < resource.minLevel) continue;

        // Verificar chance de obtener
        if (Math.random() > resource.chance) continue;

        // Calcular cantidad basada en skill y recursos extraídos
        // A mayor skill, más cerca del máximo
        const skillFactor = skillLevel / 100;
        const range = resource.maxAmount - resource.minAmount;
        const baseAmount = resource.minAmount + Math.floor(range * skillFactor * Math.random());
        
        // Multiplicar por un factor basado en recursos extraídos
        const extractionBonus = Math.max(1, Math.floor(resourcesExtracted / 3));
        const amount = baseAmount * extractionBonus;

        if (amount > 0) {
            obtained.push({
                itemType: resource.itemType,
                amount: Math.max(1, amount)
            });
        }
    }

    // Si no se obtuvo nada, dar al menos el recurso básico
    if (obtained.length === 0 && resourceType.resources.length > 0) {
        const basicResource = resourceType.resources[0];
        obtained.push({
            itemType: basicResource.itemType,
            amount: basicResource.minAmount
        });
    }

    return obtained;
}

/**
 * Obtiene el nombre legible de una herramienta
 * @param {string} toolType - Tipo de herramienta
 * @returns {string} Nombre de la herramienta
 */
function getToolName(toolType) {
    const toolNames = {
        'AXE': 'un hacha',
        'PICKAXE': 'un pico',
        'SHEARS': 'unas tijeras de esquilar',
        'FISHING_ROD': 'una caña de pescar'
    };
    return toolNames[toolType] || 'una herramienta';
}

/**
 * Verifica si el jugador tiene la herramienta adecuada equipada
 * @param {string} toolType - Tipo de herramienta requerida
 * @returns {boolean} True si tiene la herramienta equipada
 */
export function hasRequiredTool(toolType) {
    const equippedWeapon = gameState.player.equipped.weapon;
    const requiredTools = GATHERING_TOOLS[toolType];
    return equippedWeapon && requiredTools && requiredTools.includes(equippedWeapon);
}

/**
 * Reproduce el sonido apropiado según el tipo de recurso
 * @param {Object} resourceType - Tipo de recurso siendo recolectado
 */
function playGatheringSound(resourceType) {
    let soundKey = null;

    switch (resourceType.id) {
        case 'tree':
            soundKey = 'gathering/gatherWood';
            break;
        case 'iron_vein':
        case 'gold_vein':
        case 'silver_vein':
            soundKey = 'gathering/gatherMetal';
            break;
        case 'fishing_spot':
            soundKey = 'gathering/gatherFish';
            break;
        case 'sheep':
            // Por ahora usamos el sonido de madera para esquilar
            soundKey = 'gathering/gatherWood';
            break;
        default:
            soundKey = 'gathering/gatherWood';
    }

    if (soundKey) {
        audioManager.play(soundKey, 'gathering');
    }
}

/**
 * Obtiene el estado actual de recolección
 * @returns {Object} Estado de recolección
 */
export function getGatheringState() {
    return {
        ...gatheringState,
        progress: gatheringState.isGathering 
            ? Math.min(1, (Date.now() - gatheringState.startTime) / calculateWorkTime(gatheringState.currentResource.baseWorkTime, gameState.player.skills[gatheringState.currentResource.requiredSkill] || 1))
            : 0
    };
}
