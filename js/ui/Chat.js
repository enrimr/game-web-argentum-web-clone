/**
 * Chat.js
 * Sistema de chat con opciones de mensajes para diferentes destinatarios
 */

import { gameState } from '../state.js';
import { addChatMessage } from './UI.js';

// Tipos de destinatarios para mensajes (compatibles con el servidor)
export const MESSAGE_TARGETS = {
    GLOBAL: 'global',     // Mensaje global (a todos los jugadores del servidor)
    LOCAL: 'local',       // Jugadores en el mismo mapa (cercanos)
    GROUP: 'group',       // Jugadores en el grupo (futuro)
    PRIVATE: 'private'    // Mensaje privado a un jugador específico
};

// Tiempo de duración de mensajes sobre la cabeza del jugador (en ms)
const MESSAGE_DISPLAY_TIME = 5000;

// Estructura para mantener los mensajes activos sobre los jugadores
const activeOverheadMessages = {
    player: [],  // Mensajes sobre el jugador principal
    others: {}   // Mensajes sobre otros jugadores, indexados por ID
};

/**
 * Inicializa el sistema de chat
 */
export function initChat() {
    console.log("🔄 Inicializando sistema de chat...");

    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initChatInternal());
        return;
    }

    initChatInternal();
}

/**
 * Función interna de inicialización del chat
 */
function initChatInternal() {
    console.log("🎯 Iniciando configuración interna del chat...");

    const chatInput = document.getElementById('chatInput');
    const chatForm = document.getElementById('chatForm');
    const targetSelector = document.getElementById('chatTargetSelector');

    if (!chatInput) {
        console.error("❌ Error: No se encontró el elemento chatInput. Elementos disponibles:");
        console.log("Elementos con ID que contienen 'chat':", Array.from(document.querySelectorAll('[id*="chat"]')).map(el => el.id));
        return;
    }

    if (!chatForm) {
        console.error("❌ Error: No se encontró el elemento chatForm");
        return;
    }

    console.log("✅ Elementos del chat encontrados:", { chatInput: !!chatInput, chatForm: !!chatForm, targetSelector: !!targetSelector });

    // Añadir listener global para teclas Enter y Escape
    const keyHandler = function(e) {
        // Manejar tecla Escape para quitar foco del chat
        if (e.key === 'Escape' && document.activeElement === chatInput) {
            console.log("🚪 Tecla Escape presionada - quitando foco del chat");
            e.preventDefault();
            e.stopPropagation();
            chatInput.blur();
            return;
        }

        // Manejar tecla Enter
        if (e.key === 'Enter') {
            console.log("🔑 Tecla Enter presionada, elemento activo:", document.activeElement?.id || document.activeElement?.tagName);

            // Si ya estamos en el chat input
            if (document.activeElement === chatInput) {
                // Si no hay texto, quitar foco en lugar de enviar
                if (!chatInput.value.trim()) {
                    console.log("📝 Chat vacío - quitando foco del chat");
                    e.preventDefault();
                    e.stopPropagation();
                    chatInput.blur();
                    return;
                } else {
                    // Hay texto, dejar que funcione el submit del form normalmente
                    console.log("📝 Enviando mensaje de chat");
                    return;
                }
            }

            // Si no estamos en el chat, intentar enfocarlo
            // Verificar que no haya menús móviles o pantallas de login abiertas
            // Permitir chat incluso con diálogos de NPC abiertos
            const mobileMenu = document.querySelector('.mobile-menu');
            const loginScreen = document.querySelector('.login-screen');
            const isBlockingModalOpen = (mobileMenu && mobileMenu.style.display !== 'none') ||
                                       (loginScreen && loginScreen.style.display !== 'none');

            console.log("🔍 Estado de modales bloqueantes:", {
                mobileMenuVisible: mobileMenu?.style.display,
                loginScreenVisible: loginScreen?.style.display,
                isBlockingModalOpen
            });

            // Solo enfocamos si no hay modales bloqueantes (menús móviles, login) y el chat está disponible
            // Permitir chat incluso cuando hay diálogos de NPC abiertos
            if (!isBlockingModalOpen && chatInput && !chatInput.disabled) {
                console.log("🎯 Condiciones cumplidas - enfocando chat input");
                e.preventDefault();
                e.stopPropagation();
                chatInput.focus();
                return;
            } else {
                console.log("🚫 No se puede enfocar chat - hay modales abiertos o chat no disponible");
            }
        }
    };

    // Agregar el listener con captura para asegurar prioridad
    document.addEventListener('keydown', keyHandler, true);

    console.log("✅ Listener de teclas Enter/Escape registrado con éxito");

    console.log("🎉 Sistema de chat inicializado correctamente");

    // Manejar envío de mensaje
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            const target = targetSelector.value;
            const targetPlayer = target === MESSAGE_TARGETS.PRIVATE ? 
                document.getElementById('chatPlayerSelector').value : null;
            
            sendChatMessage(message, target, targetPlayer);
            chatInput.value = '';
            chatInput.blur(); // Quitar foco después de enviar
        }
    });

    // Actualizar visibilidad del selector de jugador específico
    targetSelector.addEventListener('change', () => {
        const playerSelectorContainer = document.getElementById('chatPlayerSelectorContainer');
        playerSelectorContainer.style.display = 
            targetSelector.value === MESSAGE_TARGETS.PRIVATE ? 'block' : 'none';
        
        // Si se selecciona PRIVATE pero no hay jugadores, mostrar mensaje
        if (targetSelector.value === MESSAGE_TARGETS.PRIVATE) {
            updatePlayerSelector();
            const playerSelector = document.getElementById('chatPlayerSelector');
            
            if (!playerSelector.options.length) {
                addChatMessage('system', 'No hay otros jugadores online para enviar mensaje privado.');
                targetSelector.value = MESSAGE_TARGETS.GLOBAL;
                playerSelectorContainer.style.display = 'none';
            }
        }
    });
}


/**
 * Envía un mensaje de chat
 * @param {string} message - Contenido del mensaje
 * @param {string} target - Tipo de destinatario (MESSAGE_TARGETS)
 * @param {string} targetPlayerId - ID del socket del jugador destinatario (si target es PRIVATE)
 */
export async function sendChatMessage(message, target = MESSAGE_TARGETS.GLOBAL, targetPlayerId = null) {
    if (!message || !message.trim()) return;
    
    // En modo online, enviar al servidor
    if (gameState.isOnline) {
        try {
            const { default: socketClient } = await import('../api/SocketClient.js');
            
            // Añadir el mensaje al chat log local PRIMERO (antes de enviarlo al servidor)
            const playerName = gameState.player.name || gameState.player.username || "Tú";
            let prefix = '';
            
            switch (target) {
                case MESSAGE_TARGETS.GLOBAL:
                    prefix = `[Global] ${playerName}:`;
                    break;
                case MESSAGE_TARGETS.LOCAL:
                    prefix = `[Cercanos] ${playerName}:`;
                    break;
                case MESSAGE_TARGETS.GROUP:
                    prefix = `[Grupo] ${playerName}:`;
                    break;
                case MESSAGE_TARGETS.PRIVATE:
                    // Obtener nombre del jugador destinatario
                    let targetPlayerName = 'Jugador';
                    if (targetPlayerId && gameState.onlinePlayers) {
                        const targetPlayer = gameState.onlinePlayers.get(targetPlayerId);
                        targetPlayerName = targetPlayer?.username || targetPlayer?.name || 'Jugador';
                    }
                    prefix = `[Privado a ${targetPlayerName}] ${playerName}:`;
                    break;
            }
            
            addMessageToChat('player', prefix, message, target);
            
            // Enviar al servidor
            socketClient.sendChatMessage(message, target, targetPlayerId);
            
            // IMPORTANTE: Añadir el mensaje overhead sobre la cabeza del jugador local
            addOverheadMessage(gameState.player, message, target);
            
            console.log(`💬 Mensaje enviado: [${target}] ${message}`, targetPlayerId);
        } catch (error) {
            console.error('Error al enviar mensaje de chat:', error);
            addMessageToChat('system', 'Sistema:', 'Error al enviar mensaje', 'error');
        }
    } else {
        // Modo offline: simular mensaje localmente
        const playerName = "Tú";
        let prefix = '';
        
        switch (target) {
            case MESSAGE_TARGETS.GLOBAL:
                prefix = `[Global] ${playerName}:`;
                break;
            case MESSAGE_TARGETS.LOCAL:
                prefix = `[Cercanos] ${playerName}:`;
                break;
            case MESSAGE_TARGETS.GROUP:
                prefix = `[Grupo] ${playerName}:`;
                break;
            case MESSAGE_TARGETS.PRIVATE:
                const targetPlayerName = targetPlayerId === "player1" ? "Jugador1" : "Jugador2";
                prefix = `[Privado a ${targetPlayerName}] ${playerName}:`;
                break;
        }
        
        addMessageToChat('player', prefix, message, target);
        addOverheadMessage(gameState.player, message, target);
        
        // Simular respuesta en modo offline
        simulateMessageReception(message, target, targetPlayerId);
    }
}

/**
 * Simula la recepción de mensajes de otros jugadores en modo offline
 * @param {string} message - Mensaje enviado
 * @param {string} target - Tipo de destinatario
 * @param {string} targetPlayerId - ID del jugador destinatario
 */
function simulateMessageReception(message, target, targetPlayerId) {
    // Solo simular respuestas para mensajes a todos o cercanos
    if (target === MESSAGE_TARGETS.GLOBAL || target === MESSAGE_TARGETS.LOCAL) {
        setTimeout(() => {
            // Simular respuesta de otro jugador
            const responsePrefix = target === MESSAGE_TARGETS.GLOBAL ? 
                '[Global] Jugador1:' : 
                '[Cercanos] Jugador1:';
            
            const responses = [
                '¡Hola!',
                '¿Cómo estás?',
                'Gracias por el mensaje',
                'Estoy buscando una party',
                '¿Alguien para dungeon?'
            ];
            
            const response = responses[Math.floor(Math.random() * responses.length)];
            addMessageToChat('player', responsePrefix, response, target);
            
            // Simular mensaje sobre la cabeza
            const mockPlayer = { id: "player1", x: gameState.player.x + 2, y: gameState.player.y };
            addOverheadMessage(mockPlayer, response, target);
        }, 1000 + Math.random() * 2000);
    }
}

/**
 * Recibe un mensaje de chat del servidor
 * @param {Object} data - Datos del mensaje
 * @param {string} data.username - Nombre del usuario que envió el mensaje
 * @param {string} data.message - Contenido del mensaje
 * @param {string} data.type - Tipo de mensaje (global, local, group, private)
 * @param {string} data.socketId - Socket ID del emisor
 * @param {string} data.targetUsername - Nombre del destinatario (solo para mensajes privados)
 */
export async function receiveChatMessage(data) {
    const { username, message, type, socketId, targetUsername } = data;
    
    // Importar socketClient para verificar si es nuestro propio mensaje
    const { default: socketClient } = await import('../api/SocketClient.js');
    const isOwnMessage = socketClient.isMySocketId(socketId);
    
    console.log(`💬 receiveChatMessage - Emisor: ${username}, isOwnMessage: ${isOwnMessage}, socketId: ${socketId}`);
    
    // FILTRO: No añadir nuestro propio mensaje al chat (ya lo añadimos al enviarlo en sendChatMessage)
    if (!isOwnMessage) {
        let prefix = '';
        let cssClass = 'player';
        
        switch (type) {
            case MESSAGE_TARGETS.GLOBAL:
                prefix = `[Global] ${username}:`;
                cssClass = 'player-global';
                break;
            case MESSAGE_TARGETS.LOCAL:
                prefix = `[Cercanos] ${username}:`;
                cssClass = 'player-local';
                break;
            case MESSAGE_TARGETS.GROUP:
                prefix = `[Grupo] ${username}:`;
                cssClass = 'player-group';
                break;
            case MESSAGE_TARGETS.PRIVATE:
                if (targetUsername) {
                    // Mensaje privado recibido
                    prefix = `[Privado de ${username}]:`;
                } else {
                    // Confirmación de mensaje privado enviado
                    prefix = `[Privado a ${username}]:`;
                }
                cssClass = 'player-private';
                break;
            default:
                prefix = `${username}:`;
                cssClass = 'player';
        }
        
        console.log(`📝 Añadiendo mensaje de ${username} al chat log`);
        addMessageToChat(cssClass, prefix, message, type);
        
        // OVERHEAD MESSAGE: Mostrar sobre la cabeza del jugador emisor (otro jugador)
        if (socketId && gameState.onlinePlayers && gameState.onlinePlayers.has(socketId)) {
            const onlinePlayer = gameState.onlinePlayers.get(socketId);
            console.log(`💭 Añadiendo overhead message sobre ${onlinePlayer.username} en (${onlinePlayer.x}, ${onlinePlayer.y})`);
            addOverheadMessage(onlinePlayer, message, type);
        } else {
            console.warn(`⚠️ No se encontró jugador online con socketId ${socketId} para overhead message`);
        }
    } else {
        console.log(`🚫 Mensaje propio filtrado (no se añade al chat ni overhead porque ya se procesó en sendChatMessage)`);
    }
}

/**
 * Agrega un mensaje al chat con el formato adecuado
 * @param {string} type - Tipo de mensaje ('system', 'player', 'npc')
 * @param {string} prefix - Prefijo del mensaje
 * @param {string} message - Contenido del mensaje
 * @param {string} target - Tipo de destinatario
 */
export function addMessageToChat(type, prefix, message, target) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;

    const messageElement = document.createElement('p');
    messageElement.classList.add('chat-message');
    
    // Añadir clase según el tipo de destinatario
    if (target) {
        messageElement.classList.add(`msg-${target}`);
    }
    
    messageElement.innerHTML = `<span class="${type}">${prefix}</span> ${message}`;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

/**
 * Agrega un mensaje sobre la cabeza de un jugador
 * @param {Object} entity - Jugador o entidad
 * @param {string} message - Mensaje a mostrar
 * @param {string} target - Tipo de destinatario (MESSAGE_TARGETS)
 */
export function addOverheadMessage(entity, message, target = MESSAGE_TARGETS.ALL) {
    const messageObj = {
        text: message,
        timestamp: Date.now(),
        expiresAt: Date.now() + MESSAGE_DISPLAY_TIME,
        target: target
    };
    
    // Si es el jugador principal
    if (entity === gameState.player || (!entity.socketId && !entity.id)) {
        console.log(`💭 Añadiendo overhead sobre jugador principal en (${gameState.player.x}, ${gameState.player.y})`);
        activeOverheadMessages.player.push(messageObj);
    } 
    // Si es otro jugador (OnlinePlayer tiene socketId)
    else {
        const playerId = entity.socketId || entity.id;
        if (!activeOverheadMessages.others[playerId]) {
            activeOverheadMessages.others[playerId] = [];
        }
        console.log(`💭 Añadiendo overhead sobre jugador online ${entity.username} (${playerId}) en (${entity.x}, ${entity.y})`);
        activeOverheadMessages.others[playerId].push(messageObj);
    }
}

/**
 * Actualiza los mensajes sobre la cabeza (elimina expirados)
 */
export function updateOverheadMessages() {
    const currentTime = Date.now();
    
    // Actualizar mensajes del jugador principal
    activeOverheadMessages.player = activeOverheadMessages.player.filter(
        msg => msg.expiresAt > currentTime
    );
    
    // Actualizar mensajes de otros jugadores
    Object.keys(activeOverheadMessages.others).forEach(playerId => {
        activeOverheadMessages.others[playerId] = activeOverheadMessages.others[playerId].filter(
            msg => msg.expiresAt > currentTime
        );
        
        // Eliminar jugadores sin mensajes
        if (activeOverheadMessages.others[playerId].length === 0) {
            delete activeOverheadMessages.others[playerId];
        }
    });
}

/**
 * Actualiza la lista de jugadores disponibles para mensaje privado
 */
export function updatePlayerSelector() {
    const playerSelector = document.getElementById('chatPlayerSelector');
    if (!playerSelector) return;
    
    playerSelector.innerHTML = '';
    
    // En modo online, usar jugadores reales
    if (gameState.isOnline && gameState.onlinePlayers) {
        gameState.onlinePlayers.forEach((player, socketId) => {
            const option = document.createElement('option');
            option.value = socketId;
            option.textContent = player.username || player.name || 'Jugador';
            playerSelector.appendChild(option);
        });
    } else {
        // Simular jugadores en modo offline (para testing)
        const mockPlayers = { 
            "player1": { id: "player1", username: "Jugador1" },
            "player2": { id: "player2", username: "Jugador2" }
        };
        
        Object.values(mockPlayers).forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.username;
            playerSelector.appendChild(option);
        });
    }
}

/**
 * Renderiza los mensajes sobre la cabeza de los jugadores
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 */
export async function renderOverheadMessages(ctx) {
    const currentTime = Date.now();
    
    // Importar worldToScreen del RendererCore para usar la posición correcta de la cámara
    const { worldToScreen: correctWorldToScreen } = await import('../graphics/renderers/RendererCore.js');
    
    // Renderizar mensajes del jugador principal
    if (activeOverheadMessages.player.length > 0) {
        const playerScreenPos = correctWorldToScreen(gameState.player.x, gameState.player.y);
        renderEntityMessages(ctx, playerScreenPos, activeOverheadMessages.player, currentTime);
    }
    
    // Renderizar mensajes de otros jugadores
    Object.entries(activeOverheadMessages.others).forEach(([playerId, messages]) => {
        const player = gameState.onlinePlayers?.get(playerId) || findSimulatedPlayer(playerId);
        if (player) {
            const playerScreenPos = correctWorldToScreen(player.x, player.y);
            renderEntityMessages(ctx, playerScreenPos, messages, currentTime);
        }
    });
}

/**
 * Encuentra un jugador simulado para testing
 * @param {string} playerId - ID del jugador simulado
 * @returns {Object|null} Jugador simulado o null si no se encuentra
 */
function findSimulatedPlayer(playerId) {
    // Para testing, crear un jugador simulado cerca del jugador principal
    if (playerId === "player1") {
        return { id: "player1", x: gameState.player.x + 2, y: gameState.player.y };
    } else if (playerId === "player2") {
        return { id: "player2", x: gameState.player.x, y: gameState.player.y + 2 };
    }
    return null;
}

/**
 * Renderiza los mensajes sobre una entidad
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {Object} screenPos - Posición en pantalla {x, y}
 * @param {Array} messages - Mensajes a renderizar
 * @param {number} currentTime - Tiempo actual
 */
function renderEntityMessages(ctx, screenPos, messages, currentTime) {
    // Configuración de estilo base
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.lineWidth = 2;

    // Empezar a dibujar desde arriba de la entidad
    let yOffset = -15;

    // Dibujar cada mensaje, los más recientes primero
    messages.slice().reverse().forEach(msg => {
        // Calcular opacidad basada en tiempo restante
        const timeLeft = msg.expiresAt - currentTime;
        const opacity = Math.min(1, timeLeft / 1000); // Fadeout en el último segundo

        if (opacity > 0) {
            // Establecer colores según el tipo de mensaje
            switch (msg.target) {
                case MESSAGE_TARGETS.GLOBAL:
                    ctx.fillStyle = '#ffffff'; // Blanco para mensajes globales
                    ctx.strokeStyle = '#000000';
                    break;
                case MESSAGE_TARGETS.LOCAL:
                    ctx.fillStyle = '#00ff00'; // Verde para mensajes cercanos
                    ctx.strokeStyle = '#008000';
                    break;
                case MESSAGE_TARGETS.GROUP:
                    ctx.fillStyle = '#0080ff'; // Azul para mensajes de grupo
                    ctx.strokeStyle = '#004080';
                    break;
                case MESSAGE_TARGETS.PRIVATE:
                    ctx.fillStyle = '#ffff00'; // Amarillo para mensajes privados
                    ctx.strokeStyle = '#808000';
                    break;
                default:
                    ctx.fillStyle = '#ffffff'; // Blanco por defecto
                    ctx.strokeStyle = '#000000';
                    break;
            }

            ctx.globalAlpha = opacity;

            // Texto con borde
            ctx.strokeText(msg.text, screenPos.x + 16, screenPos.y + yOffset);
            ctx.fillText(msg.text, screenPos.x + 16, screenPos.y + yOffset);

            // Avanzar posición para el siguiente mensaje
            yOffset -= 12;
        }

        ctx.globalAlpha = 1.0;
    });
}



/**
 * Función de prueba para verificar que el foco del chat funciona
 * Puede ser llamada desde la consola del navegador: testChatFocus()
 */
export function testChatFocus() {
    console.log("🧪 Probando funcionalidad completa del chat...");

    const chatInput = document.getElementById('chatInput');
    if (!chatInput) {
        console.error("❌ No se encontró el elemento chatInput");
        return "Error: chatInput no encontrado";
    }

    console.log("📝 Probando foco con Enter...");

    // Simular que se presiona Enter
    const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
    });

    // Disparar el evento
    document.dispatchEvent(enterEvent);

    // Verificar foco después de un delay
    setTimeout(() => {
        const activeElement = document.activeElement;
        console.log("🎯 Elemento activo después de Enter:", activeElement?.id || activeElement?.tagName);

        if (activeElement === chatInput) {
            console.log("✅ ¡ÉXITO! El foco se movió al chat input");

            // Ahora probar quitar foco con Escape
            console.log("🚪 Probando quitar foco con Escape...");
            setTimeout(() => {
                const escapeEvent = new KeyboardEvent('keydown', {
                    key: 'Escape',
                    keyCode: 27,
                    which: 27,
                    bubbles: true,
                    cancelable: true
                });

                document.dispatchEvent(escapeEvent);

                setTimeout(() => {
                    const activeElementAfterEscape = document.activeElement;
                    console.log("🎯 Elemento activo después de Escape:", activeElementAfterEscape?.id || activeElementAfterEscape?.tagName);

                    if (activeElementAfterEscape !== chatInput) {
                        console.log("✅ ¡ÉXITO! El foco se quitó del chat input");
                    } else {
                        console.log("❌ FALLO: El foco no se quitó del chat input");
                    }
                }, 100);
            }, 500);
        } else {
            console.log("❌ FALLO: El foco no se movió al chat input");
        }
    }, 100);

    return "Test de chat iniciado - revisa la consola para ver los resultados";
}

// Hacer la función disponible globalmente para pruebas
if (typeof window !== 'undefined') {
    window.testChatFocus = testChatFocus;
    console.log("🧪 Función testChatFocus() disponible en la consola del navegador");
}
