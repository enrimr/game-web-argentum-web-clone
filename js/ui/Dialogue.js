/**
 * Dialogue.js
 * Sistema de diálogos y conversaciones RPG
 */

import { gameState } from '../state.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';
import { addChatMessage, updateUI } from './UI.js';
import { setPlayerAnimationState } from '../core/Renderer.js';
import { openTrade } from './Trading.js';
import { joinFaction, leaveFaction } from '../systems/Factions.js';

// Estado del diálogo actual
let currentDialogue = null;
let currentDialogueState = 'initial';
let dialogueContainer = null;

/**
 * Iniciar sistema de diálogo
 */
export function initDialogue() {
    // Crear contenedor de diálogo
    dialogueContainer = document.createElement('div');
    dialogueContainer.id = 'dialogue-container';
    dialogueContainer.className = 'dialogue-container';
    dialogueContainer.style.display = 'none';

    // Estilos del diálogo
    dialogueContainer.innerHTML = `
        <div class="dialogue-box">
            <div class="dialogue-speaker">NPC</div>
            <div class="dialogue-text">Texto del diálogo</div>
            <div class="dialogue-options"></div>
            <button class="dialogue-close">Cerrar (ESC o Q)</button>
        </div>
    `;

    document.body.appendChild(dialogueContainer);

    // Event listeners
    dialogueContainer.querySelector('.dialogue-close').addEventListener('click', closeDialogue);
    document.addEventListener('keydown', (e) => {
        if (dialogueContainer.style.display === 'none') return;

        // Cerrar diálogo con ESC o Q
        if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
            closeDialogue();
            return;
        }

        // Seleccionar opciones con teclas numéricas
        const numKey = parseInt(e.key);
        if (numKey >= 1 && numKey <= 9) {
            selectDialogueOptionByNumber(numKey - 1); // Convertir a índice base 0
        }
    });
}

/**
 * Mostrar diálogo con NPC
 * @param {Object} npc - NPC con el que hablar
 */
export function showDialogue(npc) {
    if (!dialogueContainer) return;

    currentDialogue = npc;
    currentDialogueState = 'initial'; // Estado inicial del diálogo

    // Cambiar estado de animación del jugador a "talking"
    setPlayerAnimationState('talking');

    // Obtener diálogo basado en el tipo de NPC
    const dialogueData = getNPCDialogue(npc);

    // Mostrar diálogo
    dialogueContainer.querySelector('.dialogue-speaker').textContent = npc.name;
    dialogueContainer.querySelector('.dialogue-text').textContent = dialogueData.text;

    // Crear opciones
    const optionsContainer = dialogueContainer.querySelector('.dialogue-options');
    optionsContainer.innerHTML = '';

    dialogueData.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'dialogue-option';
        button.textContent = `${index + 1}. ${option.text}`;
        button.addEventListener('click', () => selectDialogueOption(option));
        optionsContainer.appendChild(button);
    });

    // Mostrar contenedor
    dialogueContainer.style.display = 'flex';
}

/**
 * Seleccionar opción de diálogo
 * @param {Object} option - Opción seleccionada
 */
function selectDialogueOption(option) {
    console.log('🔵 selectDialogueOption llamado');
    console.log('Opción seleccionada:', option.text);
    console.log('Tiene action?', !!option.action);
    console.log('Tiene response?', !!option.response);
    
    // Ejecutar acción de la opción
    if (option.action) {
        console.log('🔵 Ejecutando action...');
        option.action();
        
        // Si no hay response, la acción puede haber actualizado las opciones
        // o cerrado el diálogo, así que no continuamos
        if (!option.response && !option.followUpOptions) {
            console.log('🔵 Action ejecutada sin response/followUpOptions, finalizando');
            return;
        }
    }

    // Mostrar respuesta del NPC en el diálogo (no en chat)
    if (option.response) {
        // Mostrar respuesta del NPC en el texto del diálogo
        dialogueContainer.querySelector('.dialogue-text').textContent = option.response;

        // Si hay opciones de seguimiento, mostrarlas
        if (option.followUpOptions && option.followUpOptions.length > 0) {
            updateDialogueOptions(option.followUpOptions);
        } else {
            // Solo mostrar opción para continuar
            updateDialogueOptions([
                { text: "Continuar", response: null, action: () => closeDialogue() }
            ]);
        }
    } else if (option.followUpOptions && option.followUpOptions.length > 0) {
        // Si hay opciones de seguimiento pero no respuesta, mostrarlas
        updateDialogueOptions(option.followUpOptions);
    } else {
        // Cerrar diálogo si no hay más que hacer
        closeDialogue();
    }
}

/**
 * Actualizar opciones de diálogo
 * @param {Array} options - Nuevas opciones
 */
function updateDialogueOptions(options) {
    const optionsContainer = dialogueContainer.querySelector('.dialogue-options');
    optionsContainer.innerHTML = '';

    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'dialogue-option';
        button.textContent = `${index + 1}. ${option.text}`;
        button.addEventListener('click', () => selectDialogueOption(option));
        optionsContainer.appendChild(button);
    });
}

/**
 * Seleccionar opción de diálogo por número
 * @param {number} index - Índice de la opción (base 0)
 */
function selectDialogueOptionByNumber(index) {
    const optionsButtons = dialogueContainer.querySelectorAll('.dialogue-option');
    if (optionsButtons.length > index) {
        // Simular clic en el botón correspondiente
        optionsButtons[index].click();
    }
}

/**
 * Cerrar diálogo
 */
function closeDialogue() {
    if (dialogueContainer) {
        dialogueContainer.style.display = 'none';
    }
    currentDialogue = null;

    // Cambiar estado de animación del jugador de vuelta a "idle"
    setPlayerAnimationState('idle');
}

/**
 * Obtener diálogo de NPC
 * @param {Object} npc - NPC
 * @returns {Object} Datos del diálogo
 */
function getNPCDialogue(npc) {
    // Manejo especial para reclutadores de facciones
    // Verificar npcType en lugar de type
    if (npc.npcType === 'recruiter_kingdom' || npc.npcType === 'recruiter_armada' || 
        npc.npcType === 'recruiter_legion' || npc.npcType === 'recruiter_chaos') {
        return getRecruiterDialogue(npc);
    }
    
    const dialogues = {
        merchant: {
            text: "¡Hola aventurero! Tengo los mejores items y pociones para tu viaje. ¿Qué te interesa?",
            options: [
                {
                    text: "Comerciar",
                    response: "¡Por supuesto! Aquí tienes mi mercancía.",
                    action: () => {
                        if (currentDialogue) {
                            // Guardar referencia al NPC antes de cerrar el diálogo
                            const npc = currentDialogue;
                            // Cerrar el diálogo antes de abrir el comercio
                            closeDialogue();
                            // Abrir la ventana de comercio
                            openTrade(npc);
                        }
                    }
                },
                {
                    text: "¿Qué novedades hay?",
                    response: "Dicen que en la mazmorra profunda hay dragones guardianes de tesoros legendarios."
                },
                {
                    text: "Hasta luego",
                    response: "¡Vuelve pronto! Los caminos son peligrosos."
                }
            ]
        },
        healer: {
            text: npc.dialogue.greeting,
            options: [
                // Opción de curar solo aparece para jugadores vivos
                ...(!gameState.player.isGhost ? [{
                    text: "Curar",
                    response: npc.dialogue.heal,
                    action: () => {
                        if (currentDialogue) {
                            const result = currentDialogue.healPlayer(gameState.player);
                            if (result.success) {
                                addChatMessage('system', `💚 ${result.message}`);
                                updateUI();
                            } else {
                                addChatMessage('system', `❌ ${result.message}`);
                            }
                        }
                    }
                }] : []),
                // Opción de resucitar solo aparece para jugadores fantasma
                ...(gameState.player.isGhost ? [{
                    text: "Resucitar",
                    response: npc.dialogue.resurrect,
                    action: () => {
                        if (currentDialogue) {
                            const result = currentDialogue.resurrectPlayer(gameState.player);
                            if (result.success) {
                                addChatMessage('system', `✨ ${result.message}`);
                                updateUI();
                                // Cerrar diálogo después de resucitar
                                setTimeout(() => closeDialogue(), 1000);
                            } else {
                                addChatMessage('system', `❌ ${result.message}`);
                            }
                        }
                    }
                }] : []),
                {
                    text: "Adiós",
                    response: npc.dialogue.farewell
                }
            ]
        },
        blacksmith: {
            text: "¡Bienvenido a mi herrería! Forjo las mejores armas y armaduras. ¿Buscas algo específico?",
            options: [
                {
                    text: "Ver tienda",
                    response: "¡Excelente! Aquí está mi mejor equipamiento forjado.",
                    action: () => {
                        if (currentDialogue) {
                            // Guardar referencia al NPC antes de cerrar el diálogo
                            const npc = currentDialogue;
                            // Cerrar el diálogo antes de abrir el comercio
                            closeDialogue();
                            // Abrir la ventana de comercio
                            openTrade(npc);
                        }
                    }
                },
                {
                    text: "Reparar equipo",
                    response: "Por 50 oro reparo todo tu equipo. ¿Quieres que lo haga?",
                    followUpOptions: [
                        {
                            text: "Sí, repáralo",
                            response: "¡Hecho! Tu equipo está como nuevo.",
                            action: () => {
                                if (gameState.player.gold >= 50) {
                                    gameState.player.gold -= 50;
                                    addChatMessage('system', '¡Equipo reparado completamente!');
                                    updateUI(); // Update UI after gold change
                                } else {
                                    addChatMessage('npc', 'No tienes suficiente oro.');
                                }
                            }
                        },
                        {
                            text: "No, gracias",
                            response: "Como prefieras. Vuelve cuando necesites reparaciones."
                        },
                        {
                            text: "¿Cuánto cuesta exactamente?",
                            response: "50 monedas de oro por una reparación completa. Es un precio justo por mi trabajo artesanal."
                        }
                    ]
                },
                {
                    text: "Mejorar armas",
                    response: "Puedo mejorar tu espada por 100 oro, aumentando su daño. ¿Te interesa?",
                    followUpOptions: [
                        {
                            text: "Sí, mejórala",
                            response: "¡Excelente! Voy a trabajar en tu espada...",
                            action: () => {
                                addChatMessage('system', 'Sistema de mejora próximamente...');
                            }
                        },
                        {
                            text: "No por ahora",
                            response: "Entiendo. Las mejoras requieren materiales especiales."
                        },
                        {
                            text: "¿Qué mejora exactamente?",
                            response: "Aumento el daño base de tu arma en 2-3 puntos. Depende del arma que traigas."
                        }
                    ]
                },
                {
                    text: "¿Cómo estás?",
                    response: "Trabajando duro como siempre. El hierro no se forja solo, ¿sabes?"
                },
                {
                    text: "Adiós",
                    response: "¡Que los dioses te protejan en tus aventuras!"
                }
            ]
        },
        banker: {
            text: "¡Bienvenido al banco! Tu oro estará seguro aquí. ¿Qué deseas hacer?",
            options: [
                {
                    text: "Depositar oro",
                    response: "Sistema de depósito próximamente...",
                    action: () => {
                        addChatMessage('system', 'Sistema bancario próximamente...');
                    }
                },
                {
                    text: "Retirar oro",
                    response: "Sistema de retiro próximamente...",
                    action: () => {
                        addChatMessage('system', 'Sistema bancario próximamente...');
                    }
                },
                {
                    text: "¿Es seguro mi oro aquí?",
                    response: "Completamente seguro. Nadie puede robar del banco. Ni siquiera los dragones más feroces."
                },
                {
                    text: "Hasta luego",
                    response: "¡Que tengas un buen día! Recuerda, el banco siempre está abierto."
                }
            ]
        },
        trainer: {
            text: "¡Hola guerrero! Soy el entrenador del pueblo. Puedo ayudarte a mejorar tus habilidades. ¿Qué deseas aprender?",
            options: [
                {
                    text: "Entrenamiento físico",
                    response: "Por 200 oro te entreno durante una semana. Ganarás +10 HP máximo. ¿Quieres entrenar?",
                    followUpOptions: [
                        {
                            text: "Sí, entrenarme",
                            response: "¡Excelente! Comencemos tu entrenamiento...",
                            action: () => {
                                if (gameState.player.gold >= 200) {
                                    gameState.player.gold -= 200;
                                    gameState.player.maxHp += 10;
                                    addChatMessage('system', '¡Entrenamiento completado! +10 HP máximo');
                                    updateUI(); // Update UI after training and gold change
                                    setTimeout(() => addChatMessage('npc', '¡Has mejorado mucho! Vuelve cuando necesites más entrenamiento.'), 1000);
                                } else {
                                    addChatMessage('npc', 'No tienes suficiente oro para el entrenamiento.');
                                }
                            }
                        },
                        {
                            text: "No, demasiado caro",
                            response: "Entiendo. El entrenamiento requiere dedicación y recursos. Vuelve cuando estés listo."
                        },
                        {
                            text: "Háblame de otros entrenamientos",
                            response: "También ofrezco técnicas de combate por 300 oro. ¿Te interesa aprender a luchar mejor?"
                        }
                    ]
                },
                {
                    text: "Técnicas de combate",
                    response: "Puedo enseñarte a luchar mejor por 300 oro. Aumentará tu daño base. ¿Quieres aprender?",
                    followUpOptions: [
                        {
                            text: "Sí, enséñame",
                            response: "¡Perfecto! Te enseñaré las técnicas más avanzadas...",
                            action: () => {
                                addChatMessage('system', 'Sistema de entrenamiento próximamente...');
                            }
                        },
                        {
                            text: "No, por ahora no",
                            response: "Como prefieras. Las técnicas de combate requieren tiempo y práctica."
                        },
                        {
                            text: "Háblame del entrenamiento físico",
                            response: "El entrenamiento físico cuesta 200 oro y aumenta tu HP máximo en 10 puntos. ¿Te interesa?"
                        }
                    ]
                },
                {
                    text: "¿Cómo te convertiste en entrenador?",
                    response: "Fui un gran guerrero en mi juventud. Derroté a un dragón y salvé el pueblo. Ahora enseño a otros."
                },
                {
                    text: "Adiós",
                    response: "¡Adiós! Recuerda practicar mucho. La fuerza viene con el entrenamiento constante."
                }
            ]
        },
        alchemist: {
            text: "¡Saludos! Soy el alquimista del pueblo. Creo pociones y elixires maravillosos. ¿Te interesa algo?",
            options: [
                {
                    text: "Crear poción de mana",
                    response: "Por 40 oro puedo crear una poción azul para ti. ¿La quieres?",
                    action: () => {
                        if (gameState.player.gold >= 40) {
                            gameState.player.gold -= 40;
                            // Aquí iría lógica para añadir item
                            addChatMessage('system', '¡Poción creada! Sistema de crafting próximamente...');
                        } else {
                            addChatMessage('npc', 'No tienes suficiente oro.');
                        }
                    }
                },
                {
                    text: "Antídoto",
                    response: "Puedo crear un antídoto por 30 oro. Protege contra venenos.",
                    action: () => {
                        addChatMessage('system', 'Sistema de alquimia próximamente...');
                    }
                },
                {
                    text: "¿Qué haces aquí?",
                    response: "Estudio los misterios de la alquimia. Convierto lo simple en maravilloso. ¡Como convertir plomo en oro!"
                },
                {
                    text: "Nos vemos",
                    response: "¡Adiós! Vuelve cuando necesites mis servicios alquímicos."
                }
            ]
        }
    };

    // Fallback genérico para NPCs sin diálogo específico
    if (dialogues[npc.type]) {
        return dialogues[npc.type];
    }
    
    // Si el NPC tiene diálogo definido como objeto, usarlo
    if (npc.dialogue && typeof npc.dialogue === 'object') {
        return {
            text: npc.dialogue.greeting || `Hola, soy ${npc.name}`,
            options: [
                {
                    text: "Entendido",
                    response: npc.dialogue.farewell || "¡Hasta luego!"
                }
            ]
        };
    }
    
    // Fallback final
    return {
        text: `Hola, soy ${npc.name}`,
        options: [
            {
                text: "Adiós",
                response: "¡Hasta luego!"
            }
        ]
    };
}

/**
 * Obtener diálogo de reclutador de facción
 * @param {Object} npc - NPC reclutador
 * @returns {Object} Datos del diálogo
 */
function getRecruiterDialogue(npc) {
    // Mapeo de nombres de reclutadores a nombres de facciones
    const factionMap = {
        'recruiter_kingdom': 'Reino',
        'recruiter_armada': 'Armada',
        'recruiter_legion': 'Legión',
        'recruiter_chaos': 'Caos'
    };
    
    const factionName = factionMap[npc.npcType] || 'Neutral';
    
    // Construir texto completo con toda la información
    const fullText = `${npc.dialogue.greeting}\n\n${npc.dialogue.recruit}\n\n📋 ${npc.dialogue.benefits}\n\n⚠️ ${npc.dialogue.requirements}`;
    
    // Determinar si el jugador ya tiene facción
    const hasFaction = gameState.player.faction && gameState.player.faction !== 'Neutral';
    
    // Determinar si el jugador pertenece a ESTA facción específica
    const isInThisFaction = gameState.player.faction === factionName;
    
    console.log('🟢 getRecruiterDialogue - Generando opciones');
    console.log('factionName:', factionName);
    console.log('gameState.player.faction:', gameState.player.faction);
    console.log('isInThisFaction:', isInThisFaction);
    console.log('hasFaction:', hasFaction);
    
    // Construir opciones dinámicas
    const options = [
            // Solo mostrar "Unirme" si NO está en esta facción
            ...(!isInThisFaction ? [{
                text: `Unirme a ${factionName}`,
                response: null,
                action: () => {
                    console.log('Intentando unirse a facción:', factionName);
                    console.log('Player state:', {
                        faction: gameState.player.faction,
                        level: gameState.player.level,
                        gold: gameState.player.gold,
                        criminalStatus: gameState.player.criminalStatus
                    });
                    
                    const currentHasFaction = gameState.player.faction && gameState.player.faction !== 'Neutral';
                    
                    // Verificar requisitos y mostrar respuesta apropiada
                    let responseText = '';
                    let canJoin = true;
                    
                    if (currentHasFaction) {
                        responseText = `Lo siento, pero ya perteneces a ${gameState.player.faction}. Debes abandonar tu facción actual antes de unirte a otra.\n\nVuelve cuando hayas dejado tu facción actual.`;
                        canJoin = false;
                    } else if (gameState.player.level < 5) {
                        responseText = `Me temo que aún no estás listo. Necesitas ser al menos nivel 5 para unirte a ${factionName}.\n\nActualmente eres nivel ${gameState.player.level}. Sigue entrenando y vuelve cuando seas más fuerte.`;
                        canJoin = false;
                    } else {
                        const isGoodFaction = factionName === 'Reino' || factionName === 'Armada';
                        if (isGoodFaction && gameState.player.criminalStatus >= 20) {
                            responseText = `Lo siento, pero tienes antecedentes criminales. ${factionName} solo acepta ciudadanos honorables.\n\nDebes redimirte primero. Tu criminalidad actual es de ${gameState.player.criminalStatus}/100. Necesitas estar por debajo de 20.`;
                            canJoin = false;
                        } else if (gameState.player.gold < 500) {
                            responseText = `Me temo que no tienes suficiente oro. Unirse a ${factionName} cuesta 500 monedas de oro.\n\nActualmente tienes ${gameState.player.gold} oro. Consigue ${500 - gameState.player.gold} oro más y vuelve.`;
                            canJoin = false;
                        }
                    }
                    
                    if (!canJoin) {
                        // Mostrar respuesta de error
                        dialogueContainer.querySelector('.dialogue-text').textContent = responseText;
                        addChatMessage('npc', responseText);
                        updateDialogueOptions([
                            { text: "Entendido", response: null, action: () => closeDialogue() }
                        ]);
                        return;
                    }
                    
                    // Si pasa todas las validaciones, unirse
                    const result = joinFaction(gameState.player, factionName, 500);
                    
                    if (result.success) {
                        const successText = `¡Bienvenido a ${factionName}! ${result.message}\n\n${npc.dialogue.farewell}`;
                        dialogueContainer.querySelector('.dialogue-text').textContent = successText;
                        addChatMessage('system', `✨ ${result.message}`);
                        updateUI();
                        updateDialogueOptions([
                            { text: "¡Gracias!", response: null, action: () => closeDialogue() }
                        ]);
                    } else {
                        const errorText = `Lo siento, ha ocurrido un problema: ${result.message}`;
                        dialogueContainer.querySelector('.dialogue-text').textContent = errorText;
                        addChatMessage('system', `❌ ${result.message}`);
                        updateDialogueOptions([
                            { text: "Entendido", response: null, action: () => closeDialogue() }
                        ]);
                    }
                }
            }] : []),
            {
                text: "Necesito más información",
                response: `Por supuesto. Déjame explicarte más sobre ${factionName}...\n\n${npc.dialogue.benefits}\n\n${npc.dialogue.requirements}`,
                followUpOptions: [
                    {
                        text: `Sí, quiero unirme a ${factionName}`,
                        response: null,
                        action: () => {
                            const currentHasFaction = gameState.player.faction && gameState.player.faction !== 'Neutral';
                            
                            // Verificar requisitos y mostrar respuesta apropiada
                            let responseText = '';
                            let canJoin = true;
                            
                            if (currentHasFaction) {
                                responseText = `Lo siento, pero ya perteneces a ${gameState.player.faction}. Debes abandonar tu facción actual antes de unirte a otra.\n\nVuelve cuando hayas dejado tu facción actual.`;
                                canJoin = false;
                            } else if (gameState.player.level < 5) {
                                responseText = `Me temo que aún no estás listo. Necesitas ser al menos nivel 5 para unirte a ${factionName}.\n\nActualmente eres nivel ${gameState.player.level}. Sigue entrenando y vuelve cuando seas más fuerte.`;
                                canJoin = false;
                            } else {
                                const isGoodFaction = factionName === 'Reino' || factionName === 'Armada';
                                if (isGoodFaction && gameState.player.criminalStatus >= 20) {
                                    responseText = `Lo siento, pero tienes antecedentes criminales. ${factionName} solo acepta ciudadanos honorables.\n\nDebes redimirte primero. Tu criminalidad actual es de ${gameState.player.criminalStatus}/100. Necesitas estar por debajo de 20.`;
                                    canJoin = false;
                                } else if (gameState.player.gold < 500) {
                                    responseText = `Me temo que no tienes suficiente oro. Unirse a ${factionName} cuesta 500 monedas de oro.\n\nActualmente tienes ${gameState.player.gold} oro. Consigue ${500 - gameState.player.gold} oro más y vuelve.`;
                                    canJoin = false;
                                }
                            }
                            
                            if (!canJoin) {
                                // Mostrar respuesta de error
                                dialogueContainer.querySelector('.dialogue-text').textContent = responseText;
                                addChatMessage('npc', responseText);
                                updateDialogueOptions([
                                    { text: "Entendido", response: null, action: () => closeDialogue() }
                                ]);
                                return;
                            }
                            
                            // Si pasa todas las validaciones, unirse
                            const result = joinFaction(gameState.player, factionName, 500);
                            
                            if (result.success) {
                                const successText = `¡Bienvenido a ${factionName}! ${result.message}\n\n${npc.dialogue.farewell}`;
                                dialogueContainer.querySelector('.dialogue-text').textContent = successText;
                                addChatMessage('system', `✨ ${result.message}`);
                                updateUI();
                                updateDialogueOptions([
                                    { text: "¡Gracias!", response: null, action: () => closeDialogue() }
                                ]);
                            } else {
                                const errorText = `Lo siento, ha ocurrido un problema: ${result.message}`;
                                dialogueContainer.querySelector('.dialogue-text').textContent = errorText;
                                addChatMessage('system', `❌ ${result.message}`);
                                updateDialogueOptions([
                                    { text: "Entendido", response: null, action: () => closeDialogue() }
                                ]);
                            }
                        }
                    },
                    {
                        text: "Déjame pensarlo",
                        response: `Entiendo. Es una decisión importante. Vuelve cuando estés listo. ${npc.dialogue.farewell}`
                    }
                ]
            },
            ...(isInThisFaction ? [{
                text: "Abandonar facción",
                response: null,
                action: () => {
                    // Verificar si el jugador tiene facción
                    if (!gameState.player.faction || gameState.player.faction === 'Neutral') {
                        const noFactionText = `No perteneces a ninguna facción actualmente. Solo puedes abandonar una facción si ya estás en una.`;
                        dialogueContainer.querySelector('.dialogue-text').textContent = noFactionText;
                        addChatMessage('npc', noFactionText);
                        updateDialogueOptions([
                            { text: "Entendido", response: null, action: () => closeDialogue() }
                        ]);
                        return;
                    }
                    
                    // Mostrar confirmación antes de abandonar
                    const confirmText = `¿Estás seguro de que quieres abandonar ${gameState.player.faction}?\n\n⚠️ ADVERTENCIA: Tu facción anterior te considerará enemigo (reputación -50). Esta decisión es permanente.`;
                    dialogueContainer.querySelector('.dialogue-text').textContent = confirmText;
                    updateDialogueOptions([
                        {
                            text: "Sí, abandonar facción",
                            response: null,
                            action: () => {
                                console.log('🔴 ACCIÓN DE ABANDONAR FACCIÓN EJECUTADA');
                                console.log('gameState.player.faction:', gameState.player.faction);
                                console.log('Llamando a leaveFaction...');
                                
                                const result = leaveFaction(gameState.player);
                                console.log('Resultado de leaveFaction:', result);
                                console.log('Player.faction después:', gameState.player.faction);
                                
                                if (result.success) {
                                    const successText = `Has abandonado ${result.oldFaction}. Ahora eres neutral, pero ${result.oldFaction} te considera enemigo.\n\nPuedes unirte a otra facción cuando desees.`;
                                    dialogueContainer.querySelector('.dialogue-text').textContent = successText;
                                    addChatMessage('system', `⚠️ ${result.message}`);
                                    updateUI();
                                    updateDialogueOptions([
                                        { text: "Entendido", response: null, action: () => closeDialogue() }
                                    ]);
                                } else {
                                    const errorText = `Ha ocurrido un problema: ${result.message}`;
                                    dialogueContainer.querySelector('.dialogue-text').textContent = errorText;
                                    addChatMessage('system', `❌ ${result.message}`);
                                    updateDialogueOptions([
                                        { text: "Entendido", response: null, action: () => closeDialogue() }
                                    ]);
                                }
                            }
                        },
                        {
                            text: "No, mejor no",
                            response: null,
                            action: () => {
                                dialogueContainer.querySelector('.dialogue-text').textContent = 
                                    `Sabía decisión. Mantente leal a ${gameState.player.faction}. ${npc.dialogue.farewell}`;
                                updateDialogueOptions([
                                    { text: "Adiós", response: null, action: () => closeDialogue() }
                                ]);
                            }
                        }
                    ]);
                }
            }] : []),
            {
                text: "No, gracias",
                response: npc.dialogue.farewell
            }
        ];
    
    console.log('📋 Opciones generadas:', options.length);
    options.forEach((opt, i) => {
        console.log(`  Opción ${i+1}:`, opt.text);
    });
    
    return {
        text: fullText,
        options: options
    };
}

/**
 * Obtener diálogo por ID
 * @param {string} dialogueId - ID del diálogo
 * @returns {Object} Datos del diálogo
 */
function getDialogueById(dialogueId) {
    // Aquí irían diálogos más complejos con ramificaciones
    return null;
}

/**
 * Recuperar objetos caídos después de resurrección
 */
function recoverDroppedItems() {
    // Filtrar objetos caídos del jugador en el mapa actual
    const playerDroppedItems = gameState.droppedItems.filter(item =>
        item.droppedByPlayer && item.map === gameState.currentMap
    );

    // Recuperar objetos al inventario y equipo
    playerDroppedItems.forEach(item => {
        if (item.equippedSlot) {
            // Es un objeto equipado - volver a equiparlo
            gameState.player.equipped[item.equippedSlot] = {
                type: item.type,
                name: ITEM_TYPES[item.type]?.name || item.type
            };
        } else {
            // Es un objeto de inventario - añadir al inventario
            const existingItem = gameState.player.inventory.find(invItem => invItem.type === item.type);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                gameState.player.inventory.push({
                    type: item.type,
                    quantity: item.quantity,
                    name: ITEM_TYPES[item.type]?.name || item.type
                });
            }
        }
    });

    // Remover los objetos caídos del suelo
    gameState.droppedItems = gameState.droppedItems.filter(item =>
        !(item.droppedByPlayer && item.map === gameState.currentMap)
    );

    addChatMessage('system', `📦 ¡Recuperaste ${playerDroppedItems.length} objetos caídos!`);
}

/**
 * Verificar si el diálogo está abierto
 * @returns {boolean} True si hay diálogo abierto
 */
export function isDialogueOpen() {
    return dialogueContainer && dialogueContainer.style.display !== 'none';
}
