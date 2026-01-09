/**
 * DebugSkills.js
 * Panel de debug para manejar habilidades (solo para desarrollo)
 */

import { gameState } from '../state.js';
import { addChatMessage } from './UI.js';
import { SKILLS } from '../systems/Skills.js';

// Inicializar habilidades del jugador si no existen
export function initPlayerSkills() {
    if (!gameState.player.skills) {
        gameState.player.skills = {};
    }

    // Asegurarse de que exista la habilidad de magia con un mínimo de 10
    // para permitir lanzar el hechizo de curación
    if (!gameState.player.skills.MAGIC || gameState.player.skills.MAGIC < 10) {
        gameState.player.skills.MAGIC = 10;
    }

    // Asegurarse de que exista la habilidad de meditación con un valor inicial
    if (!gameState.player.skills.MEDITATE || gameState.player.skills.MEDITATE < 5) {
        gameState.player.skills.MEDITATE = 5;
    }
}

// Mostrar panel de debug
export function showDebugSkillsPanel() {
    // Asegurarse de que existan las habilidades
    initPlayerSkills();

    // Verificar si el panel ya existe
    if (document.getElementById('debug-skills-panel')) {
        document.getElementById('debug-skills-panel').style.display = 'block';
        return;
    }

    // Crear panel flotante
    const panel = document.createElement('div');
    panel.id = 'debug-skills-panel';
    panel.className = 'debug-panel';
    panel.style.position = 'fixed';
    panel.style.top = '50px';
    panel.style.right = '10px';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    panel.style.border = '2px solid #6a3b8a';
    panel.style.borderRadius = '8px';
    panel.style.padding = '10px';
    panel.style.zIndex = '1000';
    panel.style.color = 'white';
    panel.style.width = '250px';
    panel.style.maxHeight = '400px';
    panel.style.overflowY = 'auto';

    // Título
    const title = document.createElement('h3');
    title.textContent = '🛠️ Panel de Debug: Habilidades';
    title.style.margin = '0 0 10px 0';
    title.style.color = '#8a4baf';
    title.style.textAlign = 'center';
    panel.appendChild(title);

    // Habilidades mágicas
    const magicSkills = document.createElement('div');
    magicSkills.innerHTML = '<h4>Habilidades Mágicas</h4>';
    panel.appendChild(magicSkills);

    // Añadir botones para magia
    addSkillControls(panel, 'MAGIC', '✨ Magia');
    addSkillControls(panel, 'MEDITATE', '🧘 Meditación');

    // Botón de cierre
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#6a3b8a';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.width = '100%';
    closeButton.onclick = () => {
        panel.style.display = 'none';
    };
    panel.appendChild(closeButton);

    // Añadir al DOM
    document.body.appendChild(panel);
}

// Función para añadir controles de una habilidad
function addSkillControls(panel, skillKey, skillLabel) {
    const skillDiv = document.createElement('div');
    skillDiv.style.marginBottom = '10px';
    skillDiv.style.display = 'flex';
    skillDiv.style.alignItems = 'center';
    skillDiv.style.justifyContent = 'space-between';

    // Label de la habilidad
    const label = document.createElement('span');
    label.textContent = skillLabel + ': ';
    skillDiv.appendChild(label);

    // Valor actual
    const valueSpan = document.createElement('span');
    valueSpan.id = `skill-value-${skillKey}`;
    valueSpan.textContent = gameState.player.skills[skillKey] || '0';
    valueSpan.style.margin = '0 10px';
    valueSpan.style.fontWeight = 'bold';
    skillDiv.appendChild(valueSpan);

    // Contenedor para botones
    const buttonsDiv = document.createElement('div');
    
    // Botón para incrementar
    const increaseBtn = document.createElement('button');
    increaseBtn.textContent = '+10';
    increaseBtn.style.marginRight = '5px';
    increaseBtn.style.backgroundColor = '#4caf50';
    increaseBtn.style.color = 'white';
    increaseBtn.style.border = 'none';
    increaseBtn.style.borderRadius = '4px';
    increaseBtn.style.padding = '3px 6px';
    increaseBtn.style.cursor = 'pointer';
    increaseBtn.onclick = () => {
        increaseSkill(skillKey, 10);
    };
    buttonsDiv.appendChild(increaseBtn);

    // Botón para incrementar mucho
    const increaseBigBtn = document.createElement('button');
    increaseBigBtn.textContent = '+50';
    increaseBigBtn.style.backgroundColor = '#2e7d32';
    increaseBigBtn.style.color = 'white';
    increaseBigBtn.style.border = 'none';
    increaseBigBtn.style.borderRadius = '4px';
    increaseBigBtn.style.padding = '3px 6px';
    increaseBigBtn.style.cursor = 'pointer';
    increaseBigBtn.onclick = () => {
        increaseSkill(skillKey, 50);
    };
    buttonsDiv.appendChild(increaseBigBtn);

    skillDiv.appendChild(buttonsDiv);
    panel.appendChild(skillDiv);
}

// Incrementar habilidad
function increaseSkill(skillKey, amount) {
    // Asegurarse de que existan las habilidades
    initPlayerSkills();

    // Obtener nivel máximo de la habilidad
    const maxLevel = SKILLS[skillKey]?.maxLevel || 100;

    // Incrementar habilidad
    gameState.player.skills[skillKey] = Math.min(
        maxLevel, 
        (gameState.player.skills[skillKey] || 0) + amount
    );

    // Actualizar UI
    document.getElementById(`skill-value-${skillKey}`).textContent = gameState.player.skills[skillKey];

    // Notificar al usuario
    addChatMessage('system', `⚡ Habilidad ${SKILLS[skillKey]?.name || skillKey} aumentada a ${gameState.player.skills[skillKey]}`);
}
