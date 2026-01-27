/**
 * SkillsPanel.js
 * Panel de visualización de habilidades del personaje
 */

import { gameState } from '../state.js';
import { SKILLS, calculateSkillExpRequired } from '../systems/Skills.js';
import { getSkillModifier } from '../systems/Classes.js';

let isPanelVisible = false;

/**
 * Toggle the skills panel visibility
 */
export function toggleSkillsPanel() {
    isPanelVisible = !isPanelVisible;
    
    const panel = document.getElementById('skillsPanel');
    const backdrop = document.getElementById('skillsPanelBackdrop');
    
    if (!panel) {
        createSkillsPanel();
    } else {
        panel.style.display = isPanelVisible ? 'flex' : 'none';
        if (backdrop) {
            backdrop.style.display = isPanelVisible ? 'flex' : 'none';
        }
    }
    
    if (isPanelVisible) {
        updateSkillsPanel();
    }
}

/**
 * Create the skills panel DOM structure
 */
function createSkillsPanel() {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'skillsPanelBackdrop';
    backdrop.className = 'skills-panel-backdrop';
    backdrop.addEventListener('click', toggleSkillsPanel);
    
    // Create panel container
    const panel = document.createElement('div');
    panel.id = 'skillsPanel';
    panel.className = 'skills-panel';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'skills-panel-header';
    header.innerHTML = `
        <h2>📊 Habilidades de ${gameState.player.name}</h2>
        <button class="skills-panel-close" onclick="window.toggleSkillsPanel()">✕</button>
    `;
    
    // Create class info with skill points
    const classInfo = document.createElement('div');
    classInfo.className = 'skills-class-info';
    const skillPoints = gameState.player.skillPoints || 0;
    classInfo.innerHTML = `
        <p><strong>Clase:</strong> ${gameState.player.class}</p>
        <p><strong>Puntos de habilidad disponibles:</strong> <span id="skillPointsDisplay" style="color: #fbbf24; font-size: 18px; font-weight: bold;">${skillPoints}</span></p>
        <p><small>Las clases tienen bonificaciones y penalizaciones en diferentes habilidades</small></p>
    `;
    
    // Create filter buttons
    const filterBar = document.createElement('div');
    filterBar.className = 'skills-filter-bar';
    filterBar.innerHTML = `
        <button class="skills-filter-btn active" data-filter="all">Todas</button>
        <button class="skills-filter-btn" data-filter="combat">Combate</button>
        <button class="skills-filter-btn" data-filter="magic">Magia</button>
        <button class="skills-filter-btn" data-filter="work">Trabajo</button>
        <button class="skills-filter-btn" data-filter="craft">Crafteo</button>
        <button class="skills-filter-btn" data-filter="social">Social</button>
        <button class="skills-filter-btn" data-filter="rogue">Pícaro</button>
        <button class="skills-filter-btn" data-filter="special">Especial</button>
    `;
    
    // Add filter event listeners
    setTimeout(() => {
        const filterButtons = filterBar.querySelectorAll('.skills-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterSkills(btn.dataset.filter);
            });
        });
    }, 0);
    
    // Create skills container
    const skillsContainer = document.createElement('div');
    skillsContainer.id = 'skillsContainer';
    skillsContainer.className = 'skills-container';
    
    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(classInfo);
    panel.appendChild(filterBar);
    panel.appendChild(skillsContainer);
    
    // Add to DOM
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    
    // Make toggleSkillsPanel globally available
    window.toggleSkillsPanel = toggleSkillsPanel;
}

/**
 * Update the skills panel with current player data
 */
export function updateSkillsPanel() {
    const container = document.getElementById('skillsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Group skills by type
    const skillsByType = {};
    Object.entries(SKILLS).forEach(([key, skill]) => {
        if (!skillsByType[skill.type]) {
            skillsByType[skill.type] = [];
        }
        skillsByType[skill.type].push({ key, ...skill });
    });
    
    // Render each skill type group
    Object.entries(skillsByType).forEach(([type, skills]) => {
        const typeSection = document.createElement('div');
        typeSection.className = 'skills-type-section';
        typeSection.dataset.type = type;
        
        const typeHeader = document.createElement('h3');
        typeHeader.className = 'skills-type-header';
        const typeNames = {
            'combat': '⚔️ Combate',
            'magic': '✨ Magia',
            'work': '🔨 Trabajo',
            'craft': '🛠️ Crafteo',
            'social': '👥 Social',
            'rogue': '🦹 Pícaro',
            'special': '🌟 Especial'
        };
        typeHeader.textContent = typeNames[type] || type;
        typeSection.appendChild(typeHeader);
        
        // Render each skill in this type
        skills.forEach(skill => {
            const skillElement = createSkillElement(skill);
            typeSection.appendChild(skillElement);
        });
        
        container.appendChild(typeSection);
    });
}

/**
 * Create a skill element
 */
function createSkillElement(skill) {
    const currentLevel = gameState.player.skills[skill.key] || 1;
    const currentExp = gameState.player.skillExp[skill.key] || 0;
    const expNeeded = calculateSkillExpRequired(currentLevel);
    const classModifier = getSkillModifier(gameState.player.class, skill.key);
    const adjustedExpNeeded = Math.floor(expNeeded * classModifier);
    
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skill-item';
    
    // Determine skill level color
    let levelColor = '#94a3b8'; // Gray for low level
    if (currentLevel >= 75) levelColor = '#fbbf24'; // Gold for master
    else if (currentLevel >= 50) levelColor = '#a78bfa'; // Purple for expert
    else if (currentLevel >= 25) levelColor = '#60a5fa'; // Blue for intermediate
    
    // Class modifier indicator
    let modifierIndicator = '';
    let modifierClass = '';
    if (classModifier < 1) {
        modifierIndicator = '⭐'; // Bonus
        modifierClass = 'bonus';
    } else if (classModifier > 1) {
        modifierIndicator = '⚠️'; // Penalty
        modifierClass = 'penalty';
    }
    
    // Check if can level up (has points and not at max level)
    const canLevelUp = (gameState.player.skillPoints || 0) > 0 && currentLevel < skill.maxLevel;
    
    skillDiv.innerHTML = `
        <div class="skill-header">
            <div class="skill-icon-name">
                <span class="skill-icon">${skill.icon}</span>
                <span class="skill-name">${skill.name}</span>
                ${modifierIndicator ? `<span class="skill-modifier ${modifierClass}" title="Modificador de clase: x${classModifier}">${modifierIndicator}</span>` : ''}
            </div>
            <div class="skill-level-controls">
                <div class="skill-level" style="color: ${levelColor}">
                    Nv. ${currentLevel}/${skill.maxLevel}
                </div>
                ${canLevelUp ? `<button class="skill-level-up-btn" data-skill="${skill.key}" title="Gastar 1 punto para subir esta habilidad">+</button>` : ''}
            </div>
        </div>
        <div class="skill-description">${skill.description}</div>
        <div class="skill-exp-bar">
            <div class="skill-exp-fill" style="width: ${(currentExp / adjustedExpNeeded) * 100}%"></div>
            <span class="skill-exp-text">${currentExp}/${adjustedExpNeeded} EXP</span>
        </div>
        ${classModifier !== 1 ? `<div class="skill-modifier-info">Modificador de clase: x${classModifier}</div>` : ''}
    `;
    
    // Add event listener to the level up button
    setTimeout(() => {
        const levelUpBtn = skillDiv.querySelector('.skill-level-up-btn');
        if (levelUpBtn) {
            levelUpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                spendSkillPoint(skill.key);
            });
        }
    }, 0);
    
    return skillDiv;
}

/**
 * Spend a skill point to level up a skill
 */
function spendSkillPoint(skillKey) {
    // Verificar que el jugador tenga puntos disponibles
    if (!gameState.player.skillPoints || gameState.player.skillPoints <= 0) {
        return;
    }
    
    // Verificar que la habilidad exista
    const skill = SKILLS[skillKey];
    if (!skill) {
        return;
    }
    
    // Verificar que no esté al máximo
    const currentLevel = gameState.player.skills[skillKey] || 1;
    if (currentLevel >= skill.maxLevel) {
        return;
    }
    
    // Gastar punto y subir habilidad
    gameState.player.skillPoints--;
    gameState.player.skills[skillKey] = currentLevel + 1;
    
    // Actualizar el display de puntos
    const skillPointsDisplay = document.getElementById('skillPointsDisplay');
    if (skillPointsDisplay) {
        skillPointsDisplay.textContent = gameState.player.skillPoints;
    }
    
    // Actualizar el panel completo para reflejar cambios
    updateSkillsPanel();
    
    // Mostrar mensaje de éxito
    import('../ui/UI.js').then(({ addChatMessage }) => {
        addChatMessage('system', `✨ ¡${skill.name} subió a nivel ${currentLevel + 1}!`);
    });
}

/**
 * Filter skills by type
 */
function filterSkills(type) {
    const sections = document.querySelectorAll('.skills-type-section');
    sections.forEach(section => {
        if (type === 'all' || section.dataset.type === type) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

/**
 * Initialize the skills panel
 */
export function initSkillsPanel() {
    // Panel will be created when first toggled
    console.log('Skills panel module loaded');
}