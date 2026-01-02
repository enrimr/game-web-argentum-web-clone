/**
 * DebugPanel.js
 * Panel de control para mostrar/ocultar capas del mapa y otras opciones de depuración
 */

import { layerVisibility } from '../core/Renderer.js';
import { gameState, getBuildingId, isBuildingVisible, toggleBuildingVisibility } from '../state.js';

// Estado del panel de depuración
let debugPanelVisible = false;

/**
 * Inicializar el panel de depuración
 */
export function initDebugPanel() {
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
    
    // Añadir el panel al DOM
    document.body.appendChild(debugPanel);
    
    // Actualizar inicialmente la lista de edificios
    updateBuildingsList();
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
