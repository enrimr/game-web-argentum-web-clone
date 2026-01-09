/**
 * SpellsUI.js
 * Interfaz para selección y lanzamiento de hechizos
 */

import { gameState } from '../state.js';
import { playerSpells, castSpell, toggleMeditation } from '../systems/MagicSystem.js';
import { addChatMessage } from './UI.js';
import { SPELLS, SPELL_TYPES, SPELL_TARGETS } from '../systems/SpellTypes.js';

// Estado de la UI de hechizos
const uiState = {
    visible: false,                // Visibilidad del panel de hechizos
    selectedSpellIndex: -1,        // Índice del hechizo seleccionado actualmente
    waitingForTarget: false,       // Si estamos esperando que el jugador seleccione un objetivo
    currentSpellKey: null          // Clave del hechizo que se está lanzando actualmente
};

/**
 * Inicializar la UI de hechizos
 */
export function initSpellsUI() {
    // Crear el panel de hechizos en el DOM
    createSpellsPanel();
    
    // Asignar eventos
    document.addEventListener('keydown', handleSpellHotkeys);
    
    // Ocultar inicialmente
    toggleSpellsPanel(false);
}

/**
 * Crear el panel de hechizos en el DOM
 */
function createSpellsPanel() {
    const gameContainer = document.getElementById('game-container');
    
    // Crear panel principal
    const spellsPanel = document.createElement('div');
    spellsPanel.id = 'spells-panel';
    spellsPanel.className = 'game-panel';
    
    // Título del panel
    const title = document.createElement('h3');
    title.textContent = '✨ Hechizos';
    spellsPanel.appendChild(title);
    
    // Lista de hechizos
    const spellsList = document.createElement('div');
    spellsList.id = 'spells-list';
    spellsList.className = 'spells-list';
    spellsPanel.appendChild(spellsList);
    
    // Botones de acción
    const actionButtons = document.createElement('div');
    actionButtons.className = 'spells-actions';
    
    // Botón para lanzar hechizo
    const castButton = document.createElement('button');
    castButton.id = 'cast-spell-btn';
    castButton.textContent = 'Lanzar';
    castButton.onclick = () => handleCastButtonClick();
    actionButtons.appendChild(castButton);
    
    // Botón para meditar
    const meditateButton = document.createElement('button');
    meditateButton.id = 'meditate-btn';
    meditateButton.textContent = 'Meditar';
    meditateButton.onclick = () => {
        const isMeditating = toggleMeditation();
        meditateButton.textContent = isMeditating ? 'Dejar de Meditar' : 'Meditar';
    };
    actionButtons.appendChild(meditateButton);
    
    // Botón para cerrar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.onclick = () => toggleSpellsPanel(false);
    actionButtons.appendChild(closeButton);
    
    spellsPanel.appendChild(actionButtons);
    
    // Agregar al contenedor del juego
    gameContainer.appendChild(spellsPanel);
}

/**
 * Actualizar la lista de hechizos disponibles
 */
export function updateSpellsList() {
    const spellsList = document.getElementById('spells-list');
    if (!spellsList) return;
    
    // Limpiar lista actual
    spellsList.innerHTML = '';
    
    if (playerSpells.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No conoces ningún hechizo.';
        spellsList.appendChild(emptyMessage);
        return;
    }
    
    // Añadir cada hechizo a la lista
    playerSpells.forEach((playerSpell, index) => {
        const spellKey = playerSpell.key;
        const spell = SPELLS[spellKey];
        
        if (!spell) return;
        
        const spellItem = document.createElement('div');
        spellItem.className = 'spell-item';
        if (index === uiState.selectedSpellIndex) {
            spellItem.classList.add('selected');
        }
        
        // Información del hechizo
        const spellIcon = document.createElement('span');
        spellIcon.className = 'spell-icon';
        spellIcon.textContent = spell.icon;
        
        const spellName = document.createElement('span');
        spellName.className = 'spell-name';
        spellName.textContent = spell.name;
        
        // Agregar tipo y mana
        const spellDetails = document.createElement('span');
        spellDetails.className = 'spell-details';
        
        let typeText;
        switch (spell.type) {
            case SPELL_TYPES.DAMAGE: typeText = 'Daño'; break;
            case SPELL_TYPES.HEAL: typeText = 'Cura'; break;
            case SPELL_TYPES.BUFF: typeText = 'Mejora'; break;
            case SPELL_TYPES.DEBUFF: typeText = 'Debilita'; break;
            case SPELL_TYPES.SUMMON: typeText = 'Invoca'; break;
            default: typeText = 'Magia';
        }
        
        spellDetails.textContent = `${typeText} | 🔵 ${spell.manaRequired}`;
        
        // Estructura del item
        spellItem.appendChild(spellIcon);
        spellItem.appendChild(spellName);
        spellItem.appendChild(spellDetails);
        
        // Número de tecla para el atajo
        if (index < 9) {
            const hotkey = document.createElement('span');
            hotkey.className = 'spell-hotkey';
            hotkey.textContent = `${index + 1}`;
            spellItem.appendChild(hotkey);
        }
        
        // Evento al hacer clic
        spellItem.addEventListener('click', () => {
            selectSpell(index);
        });
        
        spellsList.appendChild(spellItem);
    });
}

/**
 * Seleccionar un hechizo de la lista
 * @param {number} index - Índice del hechizo en la lista
 */
function selectSpell(index) {
    if (index < 0 || index >= playerSpells.length) return;
    
    uiState.selectedSpellIndex = index;
    updateSpellsList(); // Actualizar UI para mostrar selección
}

/**
 * Manejar los atajos de teclado para hechizos
 * @param {KeyboardEvent} event - Evento de teclado
 */
function handleSpellHotkeys(event) {
    // No procesar si el panel no está visible
    if (!uiState.visible) return;
    
    // Verificar si se presionó un número del 1 al 9
    const keyNum = parseInt(event.key);
    if (keyNum >= 1 && keyNum <= 9) {
        // Seleccionar hechizo correspondiente (índices comienzan en 0)
        selectSpell(keyNum - 1);
    }
    
    // Tecla C para lanzar hechizo seleccionado
    if (event.key.toLowerCase() === 'c') {
        handleCastButtonClick();
    }
    
    // Tecla M para meditar
    if (event.key.toLowerCase() === 'm') {
        toggleMeditation();
    }
}

/**
 * Alternar visibilidad del panel de hechizos
 * @param {boolean} visible - Si el panel debe estar visible
 */
export function toggleSpellsPanel(visible = null) {
    const panel = document.getElementById('spells-panel');
    if (!panel) return;
    
    // Si no se proporciona valor, alternar estado actual
    if (visible === null) {
        visible = !uiState.visible;
    }
    
    // Actualizar estado y visibilidad
    uiState.visible = visible;
    panel.style.display = visible ? 'flex' : 'none';
    
    // Al mostrar, actualizar lista de hechizos
    if (visible) {
        updateSpellsList();
    }
}

/**
 * Manejar clic en el botón de lanzar hechizo
 */
function handleCastButtonClick() {
    if (uiState.selectedSpellIndex < 0 || uiState.selectedSpellIndex >= playerSpells.length) {
        addChatMessage('system', '❌ Selecciona un hechizo primero.');
        return;
    }
    
    const selectedSpell = playerSpells[uiState.selectedSpellIndex];
    const spellKey = selectedSpell.key;
    const spell = SPELLS[spellKey];
    
    // Verificar si el hechizo requiere selección de objetivo
    if (spell.target === SPELL_TARGETS.SELF) {
        // Lanzar sobre uno mismo directamente
        castSpell(spellKey, { isPlayer: true });
    } else {
        // Activar modo de selección de objetivo
        uiState.waitingForTarget = true;
        uiState.currentSpellKey = spellKey;
        addChatMessage('system', `🎯 Selecciona un objetivo para ${spell.name}.`);
        
        // Cambiar cursor para indicar selección de objetivo
        document.body.classList.add('targeting');
    }
}

/**
 * Manejar selección de objetivo en el mapa
 * @param {Object} target - Objetivo seleccionado (enemigo, NPC, etc.)
 * @returns {boolean} True si se procesó un objetivo para un hechizo
 */
export function handleTargetSelection(target) {
    // No hacer nada si no estamos esperando un objetivo
    if (!uiState.waitingForTarget || !uiState.currentSpellKey) return false;
    
    // Intentar lanzar el hechizo sobre el objetivo
    const success = castSpell(uiState.currentSpellKey, target);
    
    // Resetear estado de selección de objetivo
    uiState.waitingForTarget = false;
    uiState.currentSpellKey = null;
    document.body.classList.remove('targeting');
    
    return success;
}

/**
 * Obtener el estado actual de la UI de hechizos
 * @returns {Object} Estado de la UI de hechizos
 */
export function getSpellsUIState() {
    return uiState;
}
