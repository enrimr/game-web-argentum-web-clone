/**
 * Dialogue.js
 * Sistema de diálogos y conversaciones RPG
 */

import { gameState } from '../state.js';
import { ITEM_TYPES } from '../systems/ItemTypes.js';
import { addChatMessage, updateUI } from './UI.js';
import { setPlayerAnimationState } from '../core/Renderer.js';
import { openTrade } from './Trading.js';

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
    // Ejecutar acción de la opción
    if (option.action) {
        option.action();
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
                {
                    text: "Necesito curación",
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
                },
                // Opción de resucitar solo aparece para jugadores fantasma
                ...(gameState.player.isGhost ? [{
                    text: "Necesito resucitar",
                    response: npc.dialogue.resurrect,
                    action: () => {
                        if (currentDialogue) {
                            const result = currentDialogue.resurrectPlayer(gameState.player);
                            if (result.success) {
                                addChatMessage('system', `✨ ${result.message}`);
                                updateUI();
                            } else {
                                addChatMessage('system', `❌ ${result.message}`);
                            }
                        }
                    }
                }] : []),
                {
                    text: "¿Cuánto cobras por tus servicios?",
                    response: `Cobro ${npc.services.healCost} monedas por curar y ${npc.services.resurrectCost} monedas por resucitar.`,
                },
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
        healer: {
            text: "Soy el curandero del pueblo. Puedo sanarte por 50 monedas de oro. ¿Necesitas mis servicios?",
            options: [
                {
                    text: "Sí, cúrame por favor",
                    response: "¡Hecho! Te he restaurado toda la vida.",
                    action: () => {
                        if (gameState.player.gold >= 50 && gameState.player.hp < gameState.player.maxHp) {
                            const healAmount = gameState.player.maxHp - gameState.player.hp;
                            gameState.player.hp = gameState.player.maxHp;
                            gameState.player.gold -= 50;
                            addChatMessage('system', `💚 ¡Curado! +${healAmount} HP (-50 oro)`);
                            updateUI(); // Update UI after healing and gold change
                        } else if (gameState.player.hp >= gameState.player.maxHp) {
                            addChatMessage('npc', 'Ya estás completamente sano.');
                        } else {
                            addChatMessage('npc', 'No tienes suficiente oro.');
                        }
                    }
                },
                {
                    text: "¿Cuánto cuesta?",
                    response: "50 monedas de oro por una curación completa. Es un precio justo por salvar tu vida.",
                    followUpOptions: [
                        {
                            text: "Acepto, cúrame",
                            response: "¡Excelente! Prepárate para sentir la energía curativa...",
                            action: () => {
                                if (gameState.player.gold >= 50 && gameState.player.hp < gameState.player.maxHp) {
                                    const healAmount = gameState.player.maxHp - gameState.player.hp;
                                    gameState.player.hp = gameState.player.maxHp;
                                    gameState.player.gold -= 50;
                                    addChatMessage('system', `💚 ¡Curado! +${healAmount} HP (-50 oro)`);
                                    updateUI(); // Update UI after healing and gold change
                                } else if (gameState.player.hp >= gameState.player.maxHp) {
                                    addChatMessage('npc', 'Ya estás completamente sano.');
                                } else {
                                    addChatMessage('npc', 'No tienes suficiente oro.');
                                }
                            }
                        },
                        {
                            text: "Demasiado caro",
                            response: "Entiendo que los precios son altos, pero la magia curativa no es barata. Puedo ofrecerte un descuento si traes hierbas medicinales."
                        },
                        {
                            text: "Háblame de tu magia",
                            response: "Uso antiguos rituales de sanación transmitidos por generaciones. Mi magia restaura completamente tu vitalidad."
                        }
                    ]
                },
                {
                    text: "¿Puedes enseñarme curación?",
                    response: "Lo siento, la curación requiere años de estudio. Pero puedo curarte cuando lo necesites."
                },
                {
                    text: "No gracias",
                    response: "Como quieras. Si cambias de opinión, ya sabes dónde encontrarme."
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
        },
        priest: {
            text: "¡Bendiciones, aventurero! Soy el sacerdote del templo. ¿Necesitas mis servicios espirituales?",
            options: [
                {
                    text: "Curarme",
                    response: "Puedo restaurar tu vitalidad por 100 monedas de oro. ¿Quieres que te cure completamente?",
                    followUpOptions: [
                        {
                            text: "Sí, cúrame por favor",
                            response: "¡Que la luz divina te restaure!",
                            action: () => {
                                if (gameState.player.gold >= 100) {
                                    gameState.player.hp = gameState.player.maxHp;
                                    gameState.player.gold -= 100;
                                    addChatMessage('system', `💚 ¡Curado completamente! +${gameState.player.maxHp} HP (-100 oro)`);
                                    updateUI();
                                } else {
                                    addChatMessage('npc', 'No tienes suficiente oro para mis servicios.');
                                }
                            }
                        },
                        {
                            text: "No, gracias",
                            response: "Como prefieras. La luz divina siempre está aquí cuando la necesites."
                        },
                        {
                            text: "¿Cuánto cuesta?",
                            response: "100 monedas de oro por una curación divina completa. Es un precio justo por el favor de los dioses."
                        }
                    ]
                },
                {
                    text: "Resucitarme",
                    response: "Veo que eres un fantasma... Puedo devolverte a la vida por 500 monedas de oro. ¿Quieres resucitar?",
                    followUpOptions: [
                        {
                            text: "Sí, resucítame",
                            response: "¡Que los dioses te devuelvan a este mundo!",
                            action: () => {
                                if (!gameState.player.isGhost) {
                                    addChatMessage('npc', 'No necesitas resurrección, aventurero.');
                                    return;
                                }
                                if (gameState.player.gold >= 500) {
                                    // Resucitar al jugador
                                    gameState.player.isGhost = false;
                                    gameState.player.hp = Math.floor(gameState.player.maxHp / 2); // Resucitar con la mitad de vida
                                    gameState.player.gold -= 500;

                                    // Recuperar objetos caídos
                                    recoverDroppedItems();

                                    addChatMessage('system', `✨ ¡Resucitado! Recuperas la mitad de tu vida máxima y todos tus objetos.`);
                                    addChatMessage('system', `💰 Perdiste 500 oro en la resurrección.`);
                                    updateUI();
                                } else {
                                    addChatMessage('npc', 'No tienes suficiente oro para la resurrección. Los dioses requieren un sacrificio apropiado.');
                                }
                            }
                        },
                        {
                            text: "No, gracias",
                            response: "Entiendo. Algunos prefieren vagar como fantasmas. Pero recuerda que la vida es preciosa."
                        },
                        {
                            text: "¿Qué cuesta resucitar?",
                            response: "500 monedas de oro. Es el precio que los dioses exigen para devolver un alma al mundo de los vivos."
                        }
                    ]
                },
                {
                    text: "Hablar de los dioses",
                    response: "Los dioses nos observan a todos. Cada acción tiene consecuencias, cada muerte es una lección. ¿Qué quieres saber?"
                },
                {
                    text: "Hasta luego",
                    response: "¡Que los dioses te protejan en tu camino, ya seas vivo o fantasma!"
                }
            ]
        }
    };

    return dialogues[npc.type] || {
        text: `${npc.name}: ${npc.dialogue}`,
        options: [
            {
                text: "Entendido",
                response: "¡Hasta luego!"
            }
        ]
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
