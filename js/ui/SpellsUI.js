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
    currentSpellKey: null,         // Clave del hechizo que se está lanzando actualmente
    currentSpellPage: 0            // Página actual de hechizos en barra móvil
};

const SPELLS_PER_PAGE = 4; // 4 hechizos por página en móvil

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
    
    // Inicializar event listeners de la barra móvil
    initMobileSpellsBarEvents();
    
    // Actualizar lista de hechizos (vacía inicialmente)
    updateSpellsList();
}

/**
 * Inicializar eventos de la barra de hechizos móvil
 */
function initMobileSpellsBarEvents() {
    const spellsBar = document.getElementById('mobileSpellsBar');
    if (!spellsBar) return;

    const spellSlots = spellsBar.querySelectorAll('.spell-slot');

    spellSlots.forEach((slot, index) => {
        slot.addEventListener('click', () => {
            // Calcular índice real del hechizo considerando paginación
            const actualIndex = uiState.currentSpellPage * SPELLS_PER_PAGE + index;
            if (actualIndex < playerSpells.length) {
                selectSpell(actualIndex);
                // Lanzar directamente el hechizo seleccionado
                handleCastButtonClick();
            }
        });
    });

    // Configurar botones de paginación
    const prevBtn = document.querySelector('.spell-prev-btn');
    const nextBtn = document.querySelector('.spell-next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => changeSpellPage(-1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changeSpellPage(1));
    }
}

/**
 * Cambiar página de hechizos
 * @param {number} direction - Dirección (-1 anterior, 1 siguiente)
 */
function changeSpellPage(direction) {
    const totalPages = Math.ceil(playerSpells.length / SPELLS_PER_PAGE);
    uiState.currentSpellPage += direction;
    
    // Clamp
    if (uiState.currentSpellPage < 0) uiState.currentSpellPage = 0;
    if (uiState.currentSpellPage >= totalPages) uiState.currentSpellPage = totalPages - 1;
    
    updateMobileSpellsBar();
    updateSpellPaginationButtons();
}

/**
 * Actualizar estado de botones de paginación de hechizos
 */
function updateSpellPaginationButtons() {
    const totalPages = Math.ceil(playerSpells.length / SPELLS_PER_PAGE);
    
    const prevBtn = document.querySelector('.spell-prev-btn');
    const nextBtn = document.querySelector('.spell-next-btn');
    
    if (prevBtn) {
        if (uiState.currentSpellPage === 0) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0.5';
        } else {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
        }
    }
    
    if (nextBtn) {
        if (uiState.currentSpellPage >= totalPages - 1 || playerSpells.length <= SPELLS_PER_PAGE) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
        } else {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        }
    }
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
    
    // Añadir cada hechizo como tarjeta estilo inventario (2 por fila)
    playerSpells.forEach((playerSpell, index) => {
        const spellKey = playerSpell.key;
        const spell = SPELLS[spellKey];
        
        if (!spell) return;
        
        // Icono de tipo de hechizo
        const TYPE_ICONS = {
            [SPELL_TYPES.DAMAGE]:      { icon: '⚔️', label: 'Daño',    cls: 'type-damage'  },
            [SPELL_TYPES.HEAL]:        { icon: '💚', label: 'Cura',    cls: 'type-heal'    },
            [SPELL_TYPES.BUFF]:        { icon: '⬆️', label: 'Mejora',  cls: 'type-buff'    },
            [SPELL_TYPES.DEBUFF]:      { icon: '⬇️', label: 'Debilita',cls: 'type-debuff'  },
            [SPELL_TYPES.SUMMON]:      { icon: '🌀', label: 'Invoca',  cls: 'type-summon'  },
            [SPELL_TYPES.AREA_EFFECT]: { icon: '💥', label: 'Área',    cls: 'type-area'    },
        };
        const typeInfo = TYPE_ICONS[spell.type] || { icon: '✨', label: 'Magia', cls: 'type-other' };

        const spellCard = document.createElement('div');
        spellCard.className = `spell-card ${typeInfo.cls}`;
        if (index === uiState.selectedSpellIndex) spellCard.classList.add('selected');
        spellCard.title = `${spell.name}\n${spell.description}\n🔵 Mana: ${spell.manaRequired}`;

        // Icono grande del hechizo
        const iconEl = document.createElement('span');
        iconEl.className = 'spell-card-icon';
        iconEl.textContent = spell.icon;

        // Badge de tipo en esquina superior izquierda
        const typeBadge = document.createElement('span');
        typeBadge.className = `spell-card-type-badge ${typeInfo.cls}`;
        typeBadge.textContent = typeInfo.icon;
        typeBadge.title = typeInfo.label;

        // Nombre corto (máx 10 chars para caber)
        const nameEl = document.createElement('span');
        nameEl.className = 'spell-card-name';
        nameEl.textContent = spell.name.length > 10 ? spell.name.substring(0, 9) + '…' : spell.name;

        // Coste de mana en esquina inferior derecha
        const manaEl = document.createElement('span');
        manaEl.className = 'spell-card-mana';
        manaEl.textContent = `🔵${spell.manaRequired}`;

        // Hotkey (tecla rápida)
        if (index < 9) {
            const hotkey = document.createElement('span');
            hotkey.className = 'spell-card-hotkey';
            hotkey.textContent = index + 1;
            spellCard.appendChild(hotkey);
        }

        // Barra de mana en la parte inferior (ancho proporcional al coste)
        const manaBar = document.createElement('span');
        manaBar.className = 'spell-card-mana-bar';

        spellCard.appendChild(typeBadge);
        spellCard.appendChild(iconEl);
        spellCard.appendChild(nameEl);
        spellCard.appendChild(manaEl);
        spellCard.appendChild(manaBar);

        // Evento al hacer clic
        spellCard.addEventListener('click', () => selectSpell(index));
        
        spellsList.appendChild(spellCard);
    });

    // Actualizar barra de hechizos móvil
    updateMobileSpellsBar();
}

/**
 * Actualizar la barra de hechizos móvil
 */
function updateMobileSpellsBar() {
    const spellsBar = document.getElementById('mobileSpellsBar');
    if (!spellsBar) return;

    const spellSlots = spellsBar.querySelectorAll('.spell-slot');
    const startIndex = uiState.currentSpellPage * SPELLS_PER_PAGE;

    // Actualizar cada slot (máximo 4 hechizos por página)
    spellSlots.forEach((slot, index) => {
        // Limpiar contenido previo
        slot.textContent = '';
        slot.classList.remove('empty', 'active');

        const actualIndex = startIndex + index;
        
        if (actualIndex < playerSpells.length) {
            const playerSpell = playerSpells[actualIndex];
            const spell = SPELLS[playerSpell.key];

            if (spell) {
                // Mostrar icono del hechizo
                slot.textContent = spell.icon;
                slot.title = `${spell.name} - 🔵 ${spell.manaRequired}`;

                // Añadir costo de mana
                const manaCost = document.createElement('span');
                manaCost.className = 'spell-mana-cost';
                manaCost.textContent = spell.manaRequired;
                slot.appendChild(manaCost);

                // Marcar como activo si está seleccionado
                if (actualIndex === uiState.selectedSpellIndex) {
                    slot.classList.add('active');
                }
            } else {
                slot.textContent = '-';
                slot.classList.add('empty');
                slot.title = 'Slot vacío';
            }
        } else {
            slot.textContent = '-';
            slot.classList.add('empty');
            slot.title = 'Slot vacío';
        }
    });

    // Mostrar la barra si hay hechizos
    spellsBar.style.display = playerSpells.length > 0 ? 'flex' : 'none';
    
    // Actualizar estado de botones de paginación
    updateSpellPaginationButtons();
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
    // Tecla M para meditar (funciona siempre, incluso sin panel visible)
    if (event.key.toLowerCase() === 'm') {
        const isMeditating = toggleMeditation();
        // Actualizar el texto del botón si existe
        const meditateBtn = document.getElementById('meditateBtn');
        if (meditateBtn) {
            meditateBtn.textContent = isMeditating ? 'Dejar de Meditar' : 'Meditar';
        }
        return;
    }

    // No procesar si el panel no está visible (excepto meditación que ya se manejó arriba)
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
    // IMPORTANTE: usar 'grid' (no 'block') para respetar el grid de 2 columnas del CSS
    uiState.visible = visible;
    spellsList.style.display = visible ? 'grid' : 'none';
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
        
        // Mostrar un mensaje más claro según el tipo de hechizo
        let targetMessage;
        switch (spell.target) {
            case SPELL_TARGETS.ENEMY:
                targetMessage = `Haz clic sobre un enemigo para lanzar ${spell.name}.`;
                break;
            case SPELL_TARGETS.FRIENDLY:
                targetMessage = `Haz clic sobre ti mismo u otro personaje amistoso para lanzar ${spell.name}.`;
                break;
            case SPELL_TARGETS.ANY:
                targetMessage = `Haz clic sobre cualquier personaje para lanzar ${spell.name}.`;
                break;
            case SPELL_TARGETS.TERRAIN:
                targetMessage = `Haz clic en un lugar del mapa para lanzar ${spell.name}.`;
                break;
            default:
                targetMessage = `Selecciona un objetivo para ${spell.name}.`;
        }
        
        addChatMessage('system', `✨ ${targetMessage}`);
        
        // Cambiar cursor para indicar selección de objetivo
        document.body.classList.add('targeting');
        
        // Añadir un botón de cancelación al DOM
        const castButton = document.getElementById('castSpellBtn');
        if (castButton) {
            castButton.textContent = 'Cancelar';
            castButton.classList.add('cancel-mode');
            castButton.onclick = cancelTargetSelection;
        }
    }
}

/**
 * Cancelar la selección de objetivo
 */
function cancelTargetSelection() {
    // Resetear estado de selección de objetivo
    uiState.waitingForTarget = false;
    uiState.currentSpellKey = null;
    document.body.classList.remove('targeting');
    
    // Restaurar el botón de lanzar
    const castButton = document.getElementById('castSpellBtn');
    if (castButton) {
        castButton.textContent = 'Lanzar';
        castButton.classList.remove('cancel-mode');
        castButton.onclick = () => handleCastButtonClick();
    }
    
    addChatMessage('system', '✨ Lanzamiento de hechizo cancelado.');
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
    
    // Resetear estado de selección de objetivo y restaurar la interfaz
    uiState.waitingForTarget = false;
    uiState.currentSpellKey = null;
    document.body.classList.remove('targeting');
    
    // Restaurar el botón de lanzar
    const castButton = document.getElementById('castSpellBtn');
    if (castButton) {
        castButton.textContent = 'Lanzar';
        castButton.classList.remove('cancel-mode');
        castButton.onclick = () => handleCastButtonClick();
    }
    
    return success;
}

/**
 * Obtener el estado actual de la UI de hechizos
 * @returns {Object} Estado de la UI de hechizos
 */
export function getSpellsUIState() {
    return uiState;
}
