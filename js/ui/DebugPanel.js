/**
 * DebugPanel.js
 * Panel de control para mostrar/ocultar capas del mapa y otras opciones de depuración
 */

import { layerVisibility } from '../core/Renderer.js';
import { gameState, getBuildingId, isBuildingVisible, toggleBuildingVisibility } from '../state.js';
import { addExportButtonsToDebugPanel } from '../world/MapExporter.js';
import { showDebugSkillsPanel, initPlayerSkills } from './DebugSkills.js';

// Estado del panel de depuración
let debugPanelVisible = false;

// Estado de la super velocidad
let superSpeedEnabled = false;
let superSpeedMultiplier = 5; // 5x velocidad normal

/**
 * Inicializar el panel de depuración
 */
export function initDebugPanel() {
    // Inicializar las habilidades del jugador
    initPlayerSkills();
    
    createDebugPanel();
    addToggleButton();
    
    // Configurar actualización periódica de la lista de edificios
    setInterval(updateBuildingsList, 2000); // Actualizar cada 2 segundos
}

/**
 * Crear el panel de depuración en el DOM
 */
function createDebugPanel() {
    // Crear el contenedor principal
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.className = 'debug-panel';
    
    // Estilo inicial (oculto)
    debugPanel.style.position = 'absolute';
    debugPanel.style.top = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugPanel.style.color = 'white';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.display = 'none';
    debugPanel.style.zIndex = '1000';
    debugPanel.style.maxHeight = '80vh';  // Altura máxima
    debugPanel.style.overflow = 'auto';    // Permitir scroll
    
    // Título del panel
    const title = document.createElement('div');
    title.textContent = 'Panel de depuración';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    title.style.borderBottom = '1px solid white';
    debugPanel.appendChild(title);
    
    // Sección de capas
    const layersTitle = document.createElement('div');
    layersTitle.textContent = 'Capas del mapa:';
    layersTitle.style.marginTop = '5px';
    layersTitle.style.marginBottom = '5px';
    debugPanel.appendChild(layersTitle);
    
    // Lista de capas disponibles
    const layers = [
        { id: 'baseMap', name: 'Mapa base' },
        { id: 'treeLayer', name: 'Árboles' }, // Añadido toggle para árboles
        { id: 'doorLayer', name: 'Puertas' },
        { id: 'windowLayer', name: 'Ventanas' },
        { id: 'roofLayer', name: 'Tejados' },
        { id: 'buildings', name: 'Casas completas' }, // Añadida la opción para mostrar/ocultar casas completas
        { id: 'objects', name: 'Objetos' },
        { id: 'npcs', name: 'NPCs' },
        { id: 'enemies', name: 'Enemigos' },
        { id: 'player', name: 'Jugador' }
    ];
    
    // Crear checkboxes para cada capa
    layers.forEach(layer => {
        const layerControl = document.createElement('div');
        layerControl.style.margin = '2px 0';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `debug-${layer.id}`;
        checkbox.checked = layerVisibility[layer.id]; // Estado inicial
        
        checkbox.addEventListener('change', (e) => {
            layerVisibility[layer.id] = e.target.checked;
        });
        
        const label = document.createElement('label');
        label.htmlFor = `debug-${layer.id}`;
        label.textContent = layer.name;
        label.style.marginLeft = '5px';
        
        layerControl.appendChild(checkbox);
        layerControl.appendChild(label);
        debugPanel.appendChild(layerControl);
    });
    
    // Sección de minimapa
    const minimapTitle = document.createElement('div');
    minimapTitle.textContent = 'Minimapa:';
    minimapTitle.style.marginTop = '15px';
    minimapTitle.style.marginBottom = '5px';
    minimapTitle.style.borderTop = '1px solid #555';
    minimapTitle.style.paddingTop = '5px';
    debugPanel.appendChild(minimapTitle);
    
    // Control para mostrar/ocultar bots en minimapa
    const botsMinimapControl = document.createElement('div');
    botsMinimapControl.style.margin = '2px 0';
    
    const botsMinimapCheckbox = document.createElement('input');
    botsMinimapCheckbox.type = 'checkbox';
    botsMinimapCheckbox.id = 'debug-bots-minimap';
    
    // Importar y obtener el estado actual
    import('../ui/Minimap.js').then(({ getBotsOnMinimapStatus, toggleBotsOnMinimap }) => {
        botsMinimapCheckbox.checked = getBotsOnMinimapStatus();
        
        botsMinimapCheckbox.addEventListener('change', () => {
            toggleBotsOnMinimap();
        });
    });
    
    const botsMinimapLabel = document.createElement('label');
    botsMinimapLabel.htmlFor = 'debug-bots-minimap';
    botsMinimapLabel.textContent = '🤖 Mostrar bots en minimapa';
    botsMinimapLabel.style.marginLeft = '5px';
    
    botsMinimapControl.appendChild(botsMinimapCheckbox);
    botsMinimapControl.appendChild(botsMinimapLabel);
    debugPanel.appendChild(botsMinimapControl);
    
    // Crear sección de edificios individuales
    const buildingsTitle = document.createElement('div');
    buildingsTitle.textContent = 'Edificios individuales:';
    buildingsTitle.style.marginTop = '15px';
    buildingsTitle.style.marginBottom = '5px';
    buildingsTitle.style.borderTop = '1px solid #555';
    buildingsTitle.style.paddingTop = '5px';
    debugPanel.appendChild(buildingsTitle);
    
    // Contenedor para la lista de edificios
    const buildingsContainer = document.createElement('div');
    buildingsContainer.id = 'buildings-list';
    buildingsContainer.style.marginLeft = '10px';
    buildingsContainer.style.maxHeight = '200px';
    buildingsContainer.style.overflow = 'auto';
    debugPanel.appendChild(buildingsContainer);
    
    // Botón para actualizar lista de edificios
    const updateBuildingsButton = document.createElement('button');
    updateBuildingsButton.textContent = 'Actualizar lista de edificios';
    updateBuildingsButton.style.marginTop = '5px';
    updateBuildingsButton.style.backgroundColor = '#4a5568';
    updateBuildingsButton.style.color = 'white';
    updateBuildingsButton.style.border = 'none';
    updateBuildingsButton.style.padding = '5px 10px';
    updateBuildingsButton.style.borderRadius = '3px';
    updateBuildingsButton.style.cursor = 'pointer';
    updateBuildingsButton.onclick = updateBuildingsList;
    debugPanel.appendChild(updateBuildingsButton);
    
    // Sección de habilidades
    const skillsTitle = document.createElement('div');
    skillsTitle.textContent = 'Habilidades:';
    skillsTitle.style.marginTop = '15px';
    skillsTitle.style.marginBottom = '5px';
    skillsTitle.style.borderTop = '1px solid #555';
    skillsTitle.style.paddingTop = '5px';
    debugPanel.appendChild(skillsTitle);
    
    // Botón para mostrar panel de habilidades
    const skillsButton = document.createElement('button');
    skillsButton.textContent = '✨ Panel de Habilidades';
    skillsButton.style.marginTop = '5px';
    skillsButton.style.width = '100%';
    skillsButton.style.backgroundColor = '#805ad5';
    skillsButton.style.color = 'white';
    skillsButton.style.border = 'none';
    skillsButton.style.padding = '5px 10px';
    skillsButton.style.borderRadius = '3px';
    skillsButton.style.cursor = 'pointer';
    skillsButton.onclick = showDebugSkillsPanel;
    debugPanel.appendChild(skillsButton);

    // Sección de oro (gold cheat)
    const goldTitle = document.createElement('div');
    goldTitle.textContent = 'Oro (Debug):';
    goldTitle.style.marginTop = '15px';
    goldTitle.style.marginBottom = '5px';
    goldTitle.style.borderTop = '1px solid #555';
    goldTitle.style.paddingTop = '5px';
    debugPanel.appendChild(goldTitle);
    
    // Botones para añadir oro
    const goldButtonsContainer = document.createElement('div');
    goldButtonsContainer.style.display = 'flex';
    goldButtonsContainer.style.gap = '5px';
    goldButtonsContainer.style.marginTop = '5px';
    
    const goldAmounts = [100, 1000, 10000];
    goldAmounts.forEach(amount => {
        const goldButton = document.createElement('button');
        goldButton.textContent = `+${amount}`;
        goldButton.style.flex = '1';
        goldButton.style.backgroundColor = '#f59e0b';
        goldButton.style.color = 'white';
        goldButton.style.border = 'none';
        goldButton.style.padding = '5px';
        goldButton.style.borderRadius = '3px';
        goldButton.style.cursor = 'pointer';
        goldButton.onclick = () => addGold(amount);
        goldButtonsContainer.appendChild(goldButton);
    });
    
    debugPanel.appendChild(goldButtonsContainer);
    
    // Indicador de oro actual
    const goldIndicator = document.createElement('div');
    goldIndicator.id = 'gold-indicator';
    goldIndicator.textContent = `Oro actual: ${gameState.player.gold}`;
    goldIndicator.style.marginTop = '5px';
    goldIndicator.style.fontSize = '12px';
    goldIndicator.style.textAlign = 'center';
    goldIndicator.style.color = '#fbbf24';
    debugPanel.appendChild(goldIndicator);
    
    // Sección de super velocidad
    const speedTitle = document.createElement('div');
    speedTitle.textContent = 'Super Velocidad:';
    speedTitle.style.marginTop = '15px';
    speedTitle.style.marginBottom = '5px';
    speedTitle.style.borderTop = '1px solid #555';
    speedTitle.style.paddingTop = '5px';
    debugPanel.appendChild(speedTitle);

    // Botón para activar/desactivar super velocidad
    const speedButton = document.createElement('button');
    speedButton.id = 'super-speed-button';
    speedButton.textContent = superSpeedEnabled ? '🐌 Desactivar Super Velocidad' : '🚀 Activar Super Velocidad';
    speedButton.style.marginTop = '5px';
    speedButton.style.width = '100%';
    speedButton.style.backgroundColor = superSpeedEnabled ? '#dc2626' : '#059669';
    speedButton.style.color = 'white';
    speedButton.style.border = 'none';
    speedButton.style.padding = '5px 10px';
    speedButton.style.borderRadius = '3px';
    speedButton.style.cursor = 'pointer';
    speedButton.onclick = toggleSuperSpeed;
    debugPanel.appendChild(speedButton);

    // Indicador de estado de velocidad
    const speedIndicator = document.createElement('div');
    speedIndicator.id = 'speed-indicator';
    speedIndicator.textContent = `Velocidad: ${superSpeedEnabled ? superSpeedMultiplier + 'x' : 'Normal (1x)'}`;
    speedIndicator.style.marginTop = '5px';
    speedIndicator.style.fontSize = '12px';
    speedIndicator.style.textAlign = 'center';
    speedIndicator.style.color = superSpeedEnabled ? '#fbbf24' : '#94a3b8';
    debugPanel.appendChild(speedIndicator);

    // Sección de teletransporte a mapas
    const teleportTitle = document.createElement('div');
    teleportTitle.textContent = 'Teletransporte:';
    teleportTitle.style.marginTop = '15px';
    teleportTitle.style.marginBottom = '5px';
    teleportTitle.style.borderTop = '1px solid #555';
    teleportTitle.style.paddingTop = '5px';
    debugPanel.appendChild(teleportTitle);
    
    // Crear selector de mapas
    const mapSelector = document.createElement('select');
    mapSelector.id = 'map-teleporter';
    mapSelector.style.width = '100%';
    mapSelector.style.padding = '3px';
    mapSelector.style.backgroundColor = '#2d3748';
    mapSelector.style.color = 'white';
    mapSelector.style.border = '1px solid #4a5568';
    mapSelector.style.borderRadius = '3px';
    
    // Botón de teletransporte
    const teleportButton = document.createElement('button');
    teleportButton.textContent = '🌀 Teletransportar';
    teleportButton.style.marginTop = '5px';
    teleportButton.style.width = '100%';
    teleportButton.style.backgroundColor = '#553c9a';
    teleportButton.style.color = 'white';
    teleportButton.style.border = 'none';
    teleportButton.style.padding = '5px 10px';
    teleportButton.style.borderRadius = '3px';
    teleportButton.style.cursor = 'pointer';
    
    // Actualizar lista de mapas disponibles
    updateMapsList(mapSelector);
    
    // Evento de teletransporte
    teleportButton.addEventListener('click', () => {
        const selectedMap = mapSelector.value;
        if (selectedMap) {
            // Importar la función changeMap dinámicamente para evitar dependencias circulares
            import('../core/Game.js').then(({ changeMap }) => {
                // Teletransportar al centro del mapa seleccionado
                changeMap(selectedMap, 25, 25);
                // Ocultar el panel de depuración después de teletransportarse
                const debugPanel = document.getElementById('debug-panel');
                debugPanelVisible = false;
                debugPanel.style.display = 'none';
                document.getElementById('debug-toggle').textContent = '🛠️';
            });
        }
    });
    
    debugPanel.appendChild(mapSelector);
    debugPanel.appendChild(teleportButton);
    
    // Añadir los botones de exportación de mapas
    try {
        // Importar la función para añadir botones de exportación
        addExportButtonsToDebugPanel(debugPanel);
    } catch (error) {
        console.error('Error al añadir botones de exportación al panel de depuración:', error);
    }
    
    // Añadir el panel al DOM
    document.body.appendChild(debugPanel);
    
    // Actualizar inicialmente la lista de edificios
    updateBuildingsList();
}

/**
 * Actualizar la lista de mapas disponibles en el selector
 * @param {HTMLSelectElement} selector - Selector donde cargar los mapas
 */
function updateMapsList(selector) {
    // Vaciar selector primero
    selector.innerHTML = '';
    
    // Importar dinámicamente MAP_DEFINITIONS
    import('../world/MapDefinitions.js').then(({ MAP_DEFINITIONS }) => {
        // Opción inicial
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Seleccionar mapa --';
        selector.appendChild(defaultOption);
        
        // Añadir todos los mapas disponibles
        Object.keys(MAP_DEFINITIONS).forEach(mapKey => {
            const mapDef = MAP_DEFINITIONS[mapKey];
            const option = document.createElement('option');
            option.value = mapKey;
            option.textContent = mapDef.name || mapKey;
            selector.appendChild(option);
        });
    });
}

/**
 * Actualizar la lista de edificios en el panel de depuración
 */
function updateBuildingsList() {
    const container = document.getElementById('buildings-list');
    if (!container) return;
    
    // Limpiar la lista actual
    container.innerHTML = '';
    
    // Si no hay edificios registrados, crear unos edificios de prueba basados en el código en MapGenerator.js
    if (!gameState.buildings || gameState.buildings.length === 0) {
        console.log('📋 No se detectaron edificios registrados. Creando edificios basados en el código...');
        
        // Edificios con fachadas de 2 filas (ventanas arriba, puerta abajo) - Tomados de MapGenerator.js
        const hardcodedBuildings = [
            // Casa norte-izquierda (fachada sur)
            { x: 5, y: 5, width: 8, height: 6 },
            // Casa norte-derecha (fachada sur)
            { x: 37, y: 5, width: 8, height: 6 },
            // Casa sur-izquierda (fachada sur)
            { x: 5, y: 28, width: 8, height: 6 },
            // Casa sur-derecha (fachada sur)
            { x: 37, y: 28, width: 8, height: 6 },
            // Casa central-izquierda (fachada sur)
            { x: 15, y: 10, width: 6, height: 5 },
            // Casa central-derecha (fachada sur)
            { x: 31, y: 10, width: 6, height: 5 }
        ];
        
        // Registrar estos edificios en gameState.buildings
        gameState.buildings = hardcodedBuildings;
        console.log(`🏠 Registrados ${gameState.buildings.length} edificios hardcodeados para depuración`);
    }
    
    // Verificar nuevamente si hay edificios disponibles después de la inicialización
    if (!gameState.buildings || gameState.buildings.length === 0) {
        const noBuildings = document.createElement('div');
        noBuildings.textContent = 'No hay edificios detectados';
        noBuildings.style.fontStyle = 'italic';
        noBuildings.style.color = '#aaa';
        container.appendChild(noBuildings);
        return;
    }
    
    // Crear entrada para cada edificio
    gameState.buildings.forEach((building, index) => {
        const buildingControl = document.createElement('div');
        buildingControl.style.margin = '2px 0';
        
        const buildingId = getBuildingId(
            gameState.currentMap, 
            building.x, 
            building.y, 
            building.width, 
            building.height
        );
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `debug-building-${index}`;
        checkbox.checked = isBuildingVisible(buildingId);
        
        checkbox.addEventListener('change', () => {
            toggleBuildingVisibility(buildingId);
        });
        
        const label = document.createElement('label');
        label.htmlFor = `debug-building-${index}`;
        label.textContent = `Casa #${index+1} (${building.x},${building.y}) [${building.width}x${building.height}]`;
        label.style.marginLeft = '5px';
        label.style.fontSize = '12px';
        
        buildingControl.appendChild(checkbox);
        buildingControl.appendChild(label);
        container.appendChild(buildingControl);
    });
}

/**
 * Función para activar/desactivar la super velocidad
 */
function toggleSuperSpeed() {
    superSpeedEnabled = !superSpeedEnabled;

    // Actualizar botón
    const speedButton = document.getElementById('super-speed-button');
    const speedIndicator = document.getElementById('speed-indicator');

    if (superSpeedEnabled) {
        speedButton.textContent = '🐌 Desactivar Super Velocidad';
        speedButton.style.backgroundColor = '#dc2626';
        speedIndicator.textContent = `Velocidad: ${superSpeedMultiplier}x`;
        speedIndicator.style.color = '#fbbf24';
        console.log(`🚀 Super velocidad activada (${superSpeedMultiplier}x)`);
    } else {
        speedButton.textContent = '🚀 Activar Super Velocidad';
        speedButton.style.backgroundColor = '#059669';
        speedIndicator.textContent = 'Velocidad: Normal (1x)';
        speedIndicator.style.color = '#94a3b8';
        console.log('🐌 Super velocidad desactivada');
    }

    // Notificar al game loop sobre el cambio de velocidad
    import('../core/GameLoop.js').then(({ setSuperSpeed }) => {
        if (setSuperSpeed) {
            setSuperSpeed(superSpeedEnabled, superSpeedMultiplier);
        }
    }).catch(err => {
        console.error('Error al configurar super velocidad:', err);
    });
}

/**
 * Función para añadir oro al jugador (debug)
 * @param {number} amount - Cantidad de oro a añadir
 */
function addGold(amount) {
    gameState.player.gold += amount;
    
    // Actualizar indicador de oro en el panel
    const goldIndicator = document.getElementById('gold-indicator');
    if (goldIndicator) {
        goldIndicator.textContent = `Oro actual: ${gameState.player.gold}`;
    }
    
    // Actualizar UI del juego
    import('./UI.js').then(({ updateUI, addChatMessage }) => {
        updateUI();
        addChatMessage('system', `💰 [DEBUG] Agregado ${amount} oro`);
    });
    
    console.log(`💰 [DEBUG] Agregado ${amount} oro. Total: ${gameState.player.gold}`);
}

/**
 * Añadir botón para mostrar/ocultar el panel de depuración
 */
function addToggleButton() {
    const toggleButton = document.createElement('button');
    toggleButton.id = 'debug-toggle';
    toggleButton.textContent = '🛠️'; // Icono de herramienta

    // Estilo del botón
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '10px';
    toggleButton.style.right = '10px';
    toggleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '1001'; // Por encima del panel

    // Evento para mostrar/ocultar el panel
    toggleButton.addEventListener('click', () => {
        const debugPanel = document.getElementById('debug-panel');
        debugPanelVisible = !debugPanelVisible;

        if (debugPanelVisible) {
            debugPanel.style.display = 'block';
            toggleButton.textContent = '❌'; // Icono de cierre
        } else {
            debugPanel.style.display = 'none';
            toggleButton.textContent = '🛠️'; // Icono de herramienta
        }
    });

    // Añadir el botón al DOM
    document.body.appendChild(toggleButton);
}
