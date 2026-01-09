/**
 * MagicSystem.js
 * Sistema de magia y hechizos
 * Basado en el sistema de hechizos de Argentum Online
 */

import { gameState } from '../state.js';
import { SPELLS, SPELL_TYPES, SPELL_TARGETS } from './SpellTypes.js';
import { addChatMessage, updateUI } from '../ui/UI.js';
import { setPlayerAnimationState } from '../core/Renderer.js';
import { getSkillSuccessRate } from './Skills.js';

// Tiempo mínimo entre lanzamiento de hechizos (ms)
const MIN_CAST_INTERVAL = 1500;

// Último momento en que se lanzó un hechizo
let lastSpellCast = 0;

// Array de hechizos conocidos por el jugador
// (en un juego real esto se cargaría/guardaría desde el personaje)
export const playerSpells = [];

/**
 * Inicializar sistema de magia
 */
export function initMagicSystem() {
    // En el futuro, este código cargaría los hechizos desde el guardado del personaje
    // Por ahora simplemente agregamos algunos hechizos por defecto para pruebas
    addSpellToPlayer('MAGIC_ARROW');
    addSpellToPlayer('HEAL_WOUNDS');
    addSpellToPlayer('ANTIDOTE');
}

/**
 * Añadir un hechizo a la lista de hechizos conocidos por el jugador
 * @param {string} spellKey - Clave del hechizo en el objeto SPELLS
 * @returns {boolean} True si se añadió correctamente
 */
export function addSpellToPlayer(spellKey) {
    if (!SPELLS[spellKey]) return false;
    
    // Evitar duplicados
    const existingSpell = playerSpells.find(spell => spell.key === spellKey);
    if (existingSpell) return false;
    
    playerSpells.push({
        key: spellKey,
        id: SPELLS[spellKey].id,
        name: SPELLS[spellKey].name,
        icon: SPELLS[spellKey].icon,
        lastCast: 0 // Para controlar cooldown individual
    });
    
    return true;
}

/**
 * Lanzar un hechizo
 * @param {string} spellKey - Clave del hechizo en el objeto SPELLS
 * @param {Object} target - Objetivo del hechizo (personaje, enemigo, coordenadas, etc.)
 * @returns {boolean} True si el hechizo se lanzó correctamente
 */
export function castSpell(spellKey, target = null) {
    // Verificar que el hechizo existe
    const spell = SPELLS[spellKey];
    if (!spell) {
        addChatMessage('system', '❌ Hechizo no encontrado.');
        return false;
    }
    
    // Verificar que el jugador conoce el hechizo
    const knownSpell = playerSpells.find(s => s.key === spellKey);
    if (!knownSpell) {
        addChatMessage('system', '❌ No conoces ese hechizo.');
        return false;
    }
    
    // Verificar cooldown global de hechizos
    const now = Date.now();
    if (now - lastSpellCast < MIN_CAST_INTERVAL) {
        addChatMessage('system', '⏳ Debes esperar para lanzar otro hechizo.');
        return false;
    }
    
    // Verificar cooldown individual del hechizo
    if (now - knownSpell.lastCast < spell.cooldown) {
        const remainingCooldown = Math.ceil((spell.cooldown - (now - knownSpell.lastCast)) / 1000);
        addChatMessage('system', `⏳ ${spell.name} no está listo. Espera ${remainingCooldown} segundos.`);
        return false;
    }
    
    // Verificar que el jugador tiene suficiente mana
    if (gameState.player.mana < spell.manaRequired) {
        addChatMessage('system', '🔵 No tienes suficiente maná.');
        return false;
    }
    
    // Verificar nivel de habilidad requerido
    const magicSkill = gameState.player.skills?.MAGIC || 0;
    if (magicSkill < spell.minSkillRequired) {
        addChatMessage('system', `✨ No tienes suficiente habilidad en Magia (${spell.minSkillRequired} requerido).`);
        return false;
    }
    
    // Verificar si el objetivo es válido según el tipo de hechizo
    if (!isValidTarget(spell, target)) {
        addChatMessage('system', '❌ Objetivo no válido para este hechizo.');
        return false;
    }
    
    // Calcular si el hechizo tiene éxito basado en la habilidad mágica
    const spellDifficulty = spell.minSkillRequired * 1.2;
    const successRate = getSkillSuccessRate(magicSkill, spellDifficulty);
    
    if (Math.random() > successRate) {
        // El hechizo falla
        addChatMessage('system', `✨ Has fallado al lanzar ${spell.name}.`);
        gameState.player.mana -= Math.floor(spell.manaRequired / 2); // Consumir la mitad del maná aunque falle
        updateUI();
        return false;
    }
    
    // Consumir maná
    gameState.player.mana -= spell.manaRequired;
    
    // Actualizar cooldowns
    lastSpellCast = now;
    knownSpell.lastCast = now;
    
    // Animar al jugador
    setPlayerAnimationState('casting');
    
    // Decir las palabras mágicas
    if (spell.words) {
        addChatMessage('player', `"${spell.words}"`, true); // El true indica que son palabras mágicas
    }
    
    // Aplicar efectos según el tipo de hechizo
    applySpellEffects(spell, target);
    
    // Actualizar la interfaz
    updateUI();
    
    return true;
}

/**
 * Verificar si un objetivo es válido para el hechizo
 * @param {Object} spell - Objeto del hechizo
 * @param {Object} target - Objetivo del hechizo
 * @returns {boolean} True si el objetivo es válido
 */
function isValidTarget(spell, target) {
    if (!target) {
        return spell.target === SPELL_TARGETS.SELF;
    }
    
    switch (spell.target) {
        case SPELL_TARGETS.SELF:
            return target.isPlayer === true;
            
        case SPELL_TARGETS.FRIENDLY:
            // Por ahora solo el jugador puede ser objetivo amistoso
            // En el futuro se podrían incluir NPCs aliados
            return target.isPlayer === true;
            
        case SPELL_TARGETS.ENEMY:
            // Verificar si el objetivo es un enemigo
            return target.type && gameState.enemies.includes(target);
            
        case SPELL_TARGETS.ANY:
            // Cualquier personaje válido
            return (target.isPlayer === true) || 
                   (target.type && gameState.enemies.includes(target)) || 
                   (gameState.npcs && gameState.npcs.includes(target));
            
        case SPELL_TARGETS.TERRAIN:
            // Verificar si son coordenadas válidas
            return (typeof target.x === 'number' && typeof target.y === 'number');
            
        default:
            return false;
    }
}

/**
 * Aplicar los efectos del hechizo según su tipo
 * @param {Object} spell - Objeto del hechizo
 * @param {Object} target - Objetivo del hechizo
 */
function applySpellEffects(spell, target) {
    // Si el hechizo es de tipo SELF, el objetivo siempre es el jugador
    const finalTarget = (spell.target === SPELL_TARGETS.SELF) ? 
                       { isPlayer: true } : 
                       target;
    
    // Efectos visuales (en el futuro, esto mostraría efectos gráficos)
    showSpellVisualEffects(spell, finalTarget);
    
    switch (spell.type) {
        case SPELL_TYPES.DAMAGE:
            applyDamageSpell(spell, finalTarget);
            break;
            
        case SPELL_TYPES.HEAL:
            applyHealingSpell(spell, finalTarget);
            break;
            
        case SPELL_TYPES.BUFF:
            applyBuffSpell(spell, finalTarget);
            break;
            
        case SPELL_TYPES.DEBUFF:
            applyDebuffSpell(spell, finalTarget);
            break;
            
        // Otros tipos como SUMMON, AREA_EFFECT, etc. se implementarán después
    }
}

/**
 * Mostrar efectos visuales del hechizo
 * @param {Object} spell - Objeto del hechizo
 * @param {Object} target - Objetivo del hechizo
 */
function showSpellVisualEffects(spell, target) {
    // Esto en el futuro mostraría efectos visuales en el objetivo
    console.log(`Visual effect: ${spell.effects?.visual || 'default_magic_effect'} on target`);
}

/**
 * Aplicar un hechizo de daño
 * @param {Object} spell - Objeto del hechizo
 * @param {Object} target - Objetivo del hechizo
 */
function applyDamageSpell(spell, target) {
    if (!target || !spell.damage) return;
    
    // Calcular daño aleatorio entre min y max
    const damage = Math.floor(Math.random() * (spell.damage.max - spell.damage.min + 1)) + spell.damage.min;
    
    // Aplicar daño al objetivo
    if (target.hp !== undefined) {
        target.hp -= damage;
        
        // Verificar si el enemigo murió
        if (target.hp <= 0) {
            target.hp = 0;
            // Si tenemos una función handleEnemyDeath importada, la llamaríamos aquí
            if (target.type && gameState.enemies.includes(target)) {
                import('./Combat.js').then(combat => {
                    combat.handleEnemyDeath(target);
                });
            }
        }
        
        // Mensajes
        const targetName = target.name || target.type || "objetivo";
        addChatMessage('player', `${spell.casterMessage} ${targetName} causando ${damage} de daño.`);
    }
}

/**
 * Aplicar un hechizo de curación
 * @param {Object} spell - Objeto del hechizo
 * @param {Object} target - Objetivo del hechizo
 */
function applyHealingSpell(spell, target) {
    if (!target || !spell.healing) return;
    
    // Calcular curación aleatoria entre min y max
    const healing = Math.floor(Math.random() * (spell.healing.max - spell.healing.min + 1)) + spell.healing.min;
    
    // Aplicar curación al objetivo
    if (target.hp !== undefined && target.maxHp !== undefined) {
        const hpBefore = target.hp;
        target.hp = Math.min(target.hp + healing, target.maxHp);
        const actualHealing = target.hp - hpBefore;
        
        // Mensajes
        if (target.isPlayer) {
            addChatMessage('player', `${spell.selfMessage} ${actualHealing} puntos de vida.`);
        } else {
            const targetName = target.name || target.type || "objetivo";
            addChatMessage('player', `${spell.casterMessage} ${targetName} por ${actualHealing} puntos de vida.`);
        }
    }
}

/**
 * Aplicar un hechizo de mejora (buff)
 * @param {Object} spell - Objeto del hechizo
 * @param {Object} target - Objetivo del hechizo
 */
function applyBuffSpell(spell, target) {
    if (!target) return;
    
    // Verificar el tipo específico de buff
    if (spell.key === 'ANTIDOTE') {
        // Curar veneno
        if (target.poisoned) {
            target.poisoned = false;
            
            if (target.isPlayer) {
                addChatMessage('player', `${spell.selfMessage}.`);
            } else {
                const targetName = target.name || target.type || "objetivo";
                addChatMessage('player', `${spell.casterMessage} ${targetName}.`);
            }
        } else {
            addChatMessage('system', `El objetivo no está envenenado.`);
        }
    }
    else if (spell.key === 'STRENGTHEN') {
        // Aplicar mejora de daño
        if (!target.buffs) target.buffs = {};
        
        // Guardar el buff con su duración
        target.buffs.strengthen = {
            effect: spell.effect.damageBuff,
            duration: spell.duration,
            startTime: Date.now()
        };
        
        if (target.isPlayer) {
            addChatMessage('player', `${spell.selfMessage}. +${spell.effect.damageBuff} de daño durante ${spell.duration/1000} segundos.`);
        } else {
            const targetName = target.name || target.type || "objetivo";
            addChatMessage('player', `${spell.casterMessage} ${targetName}. +${spell.effect.damageBuff} de daño durante ${spell.duration/1000} segundos.`);
        }
    }
}

/**
 * Aplicar un hechizo de debilitamiento (debuff)
 * @param {Object} spell - Objeto del hechizo
 * @param {Object} target - Objetivo del hechizo
 */
function applyDebuffSpell(spell, target) {
    if (!target) return;
    
    // Verificar el tipo específico de debuff
    if (spell.key === 'PARALYZE') {
        // Paralizar objetivo
        if (!target.debuffs) target.debuffs = {};
        
        target.debuffs.paralyzed = {
            duration: spell.duration,
            startTime: Date.now()
        };
        
        const targetName = target.name || target.type || "objetivo";
        addChatMessage('player', `${spell.casterMessage} ${targetName} durante ${spell.duration/1000} segundos.`);
    }
    else if (spell.key === 'POISON') {
        // Envenenar objetivo
        if (!target.debuffs) target.debuffs = {};
        
        target.debuffs.poisoned = {
            damage: {
                min: spell.damage.min,
                max: spell.damage.max
            },
            ticks: spell.damage.ticks,
            interval: spell.damage.interval,
            nextTickTime: Date.now() + spell.damage.interval,
            ticksRemaining: spell.damage.ticks
        };
        
        const targetName = target.name || target.type || "objetivo";
        addChatMessage('player', `${spell.casterMessage} ${targetName}.`);
    }
}

/**
 * Actualizar efectos de hechizos a lo largo del tiempo
 * Llamar esta función en cada frame o tick del juego
 */
export function updateSpellEffects() {
    const now = Date.now();
    
    // Actualizar buffs del jugador
    if (gameState.player.buffs) {
        Object.entries(gameState.player.buffs).forEach(([buffName, buff]) => {
            if (now - buff.startTime >= buff.duration) {
                // El buff ha expirado
                delete gameState.player.buffs[buffName];
                addChatMessage('system', `El efecto de ${buffName} ha terminado.`);
                updateUI();
            }
        });
    }
    
    // Actualizar debuffs del jugador
    if (gameState.player.debuffs) {
        // Verificar parálisis
        if (gameState.player.debuffs.paralyzed) {
            const paralysis = gameState.player.debuffs.paralyzed;
            if (now - paralysis.startTime >= paralysis.duration) {
                delete gameState.player.debuffs.paralyzed;
                addChatMessage('system', `Ya no estás paralizado.`);
            }
        }
        
        // Verificar veneno
        if (gameState.player.debuffs.poisoned) {
            const poison = gameState.player.debuffs.poisoned;
            if (now >= poison.nextTickTime && poison.ticksRemaining > 0) {
                // Aplicar daño por veneno
                const damage = Math.floor(Math.random() * (poison.damage.max - poison.damage.min + 1)) + poison.damage.min;
                gameState.player.hp = Math.max(0, gameState.player.hp - damage);
                
                addChatMessage('system', `☠️ Sufres ${damage} de daño por veneno.`);
                
                // Actualizar próximo tick y contador
                poison.nextTickTime = now + poison.interval;
                poison.ticksRemaining--;
                
                // Si se acabaron los ticks, eliminar el veneno
                if (poison.ticksRemaining <= 0) {
                    delete gameState.player.debuffs.poisoned;
                    addChatMessage('system', `El veneno se ha disipado.`);
                }
                
                updateUI();
                
                // Verificar si el jugador murió por veneno
                if (gameState.player.hp === 0 && !gameState.player.isGhost) {
                    import('./Combat.js').then(combat => {
                        // Llamar función que maneja muerte del jugador
                        // Suponemos que existe una función enterGhostMode
                        if (typeof combat.enterGhostMode === 'function') {
                            combat.enterGhostMode();
                        }
                    });
                }
            }
        }
    }
    
    // Actualizar efectos en enemigos
    gameState.enemies.forEach(enemy => {
        if (enemy.debuffs) {
            // Actualizar parálisis de enemigos
            if (enemy.debuffs.paralyzed) {
                const paralysis = enemy.debuffs.paralyzed;
                if (now - paralysis.startTime >= paralysis.duration) {
                    delete enemy.debuffs.paralyzed;
                    console.log(`${enemy.type} ya no está paralizado.`);
                }
            }
            
            // Actualizar veneno de enemigos
            if (enemy.debuffs.poisoned) {
                const poison = enemy.debuffs.poisoned;
                if (now >= poison.nextTickTime && poison.ticksRemaining > 0) {
                    // Aplicar daño por veneno
                    const damage = Math.floor(Math.random() * (poison.damage.max - poison.damage.min + 1)) + poison.damage.min;
                    enemy.hp = Math.max(0, enemy.hp - damage);
                    
                    // Mensaje solo si el enemigo está cerca del jugador
                    const distanceToPlayer = Math.abs(gameState.player.x - enemy.x) + Math.abs(gameState.player.y - enemy.y);
                    if (distanceToPlayer <= 5) {
                        addChatMessage('system', `☠️ El ${enemy.type} sufre ${damage} de daño por veneno.`);
                    }
                    
                    // Actualizar próximo tick y contador
                    poison.nextTickTime = now + poison.interval;
                    poison.ticksRemaining--;
                    
                    // Si se acabaron los ticks, eliminar el veneno
                    if (poison.ticksRemaining <= 0) {
                        delete enemy.debuffs.poisoned;
                    }
                    
                    // Verificar si el enemigo murió por veneno
                    if (enemy.hp <= 0) {
                        import('./Combat.js').then(combat => {
                            combat.handleEnemyDeath(enemy);
                        });
                    }
                }
            }
        }
    });
}

/**
 * Recuperación de maná por meditación (llamar periódicamente)
 */
export function recoverMana() {
    if (gameState.player.meditating && gameState.player.mana < gameState.player.maxMana) {
        const meditationSkill = gameState.player.skills?.MEDITATE || 0;
        const recoveryRate = 0.05 + (meditationSkill / 100) * 0.15; // 5% base + hasta 15% adicional
        
        const manaToRecover = Math.ceil(gameState.player.maxMana * recoveryRate);
        gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + manaToRecover);
        
        updateUI();
    }
}

/**
 * Alternar estado de meditación del jugador
 * @returns {boolean} Nuevo estado de meditación
 */
export function toggleMeditation() {
    gameState.player.meditating = !gameState.player.meditating;
    
    if (gameState.player.meditating) {
        addChatMessage('player', '🧘 Has comenzado a meditar. Recuperarás maná gradualmente.');
    } else {
        addChatMessage('player', '🧘 Has dejado de meditar.');
    }
    
    return gameState.player.meditating;
}

/**
 * Obtener modificador de daño de hechizos basado en habilidad de magia
 * @returns {number} Multiplicador de daño mágico
 */
export function getMagicDamageModifier() {
    const magicSkill = gameState.player.skills?.MAGIC || 0;
    return 1 + (magicSkill / 100) * 0.5; // Hasta 50% adicional al máximo nivel
}
