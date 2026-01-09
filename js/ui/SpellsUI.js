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
    // Asignar eventos
    document.addEventListener('keydown', handleSpellHotkeys);
    
    // Configurar los botones del panel lateral
    const toggleSpellsListBtn = document.getElementById('toggleSpellsList');
    if (toggleSpellsListBtn) {
        toggleSpellsListBtn.addEventListener('click', () => toggleSpellsPanel());
    }
    
    const castSpellBtn = document.getElementById('castSpellBtn');
    if (castSpellBtn) {
        castSpellBtn.addEventListener('click', () => handleCastButtonClick());
    }
    
    const meditateBtn = document.getElementById('meditateBtn');
    if (meditateBtn) {
        meditateBtn.addEventListener('click', () => {
            const isMeditating = toggleMeditation();
            meditateBtn.textContent = isMeditating ? 'Dejar de Meditar' : 'Meditar';
        });
    }
    
    // Actualizar lista de hechizos (vacía inicialmente)
    updateSpellsList();
}

/**
 * Actualizar la lista de hechizos disponibles
 */
export function updateSpellsList() {
    const spellsList = document.getElementById('sidebarSpellsList');
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
    const spellsList = document.getElementById('sidebarSpellsList');
    const spellsActions = document.querySelector('.spells-actions');
    const toggleBtn = document.getElementById('toggleSpellsList');
    
    if (!spellsList) return;
    
    // Si no se proporciona valor, alternar estado actual
    if (visible === null) {
        visible = !uiState.visible;
    }
    
    // Actualizar estado y visibilidad
    uiState.visible = visible;
    spellsList.style.display = visible ? 'block' : 'none';
    spellsActions.style.display = visible ? 'flex' : 'none';
    
    // Actualizar texto del botón
    if (toggleBtn) {
        toggleBtn.textContent = visible ? 'Ocultar' : 'Mostrar';
    }
    
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
