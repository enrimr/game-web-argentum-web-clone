/**
 * AdminPanel.js
 * Panel de administración para ver estadísticas del juego
 * Solo accesible para usuarios con rol admin o moderator
 */

import { gameState } from '../state.js';
import apiClient from '../api/ApiClient.js';

let isAdminPanelOpen = false;
let statsUpdateInterval = null;

/**
 * Inicializar el panel de administración
 */
export function initAdminPanel() {
    // Crear el HTML del panel si no existe
    if (!document.getElementById('adminPanel')) {
        createAdminPanelHTML();
    }

    // Configurar event listeners
    setupEventListeners();
}

/**
 * Crear el HTML del panel de administración
 */
function createAdminPanelHTML() {
    const panelHTML = `
        <div id="adminPanel" class="admin-panel" style="display: none;">
            <div class="admin-panel-header">
                <h2>🔧 Panel de Administración</h2>
                <button id="adminPanelClose" class="close-btn">✕</button>
            </div>
            
            <div class="admin-panel-content">
                <!-- Estadísticas Generales -->
                <div class="admin-section">
                    <h3>📊 Estadísticas Generales</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Usuarios Totales</div>
                            <div class="stat-value" id="stat-total-users">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Usuarios Activos</div>
                            <div class="stat-value" id="stat-active-users">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Personajes</div>
                            <div class="stat-value" id="stat-total-characters">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Online Ahora</div>
                            <div class="stat-value highlight" id="stat-online-characters">-</div>
                        </div>
                    </div>
                </div>

                <!-- Jugadores Online -->
                <div class="admin-section">
                    <h3>👥 Jugadores Online</h3>
                    <div id="online-players-list" class="online-players-list">
                        <p class="loading">Cargando...</p>
                    </div>
                </div>

                <!-- Rankings -->
                <div class="admin-section">
                    <h3>🏆 Rankings</h3>
                    <div class="rankings-container">
                        <div class="ranking-column">
                            <h4>Top 5 Nivel</h4>
                            <div id="ranking-level" class="ranking-list">
                                <p class="loading">Cargando...</p>
                            </div>
                        </div>
                        <div class="ranking-column">
                            <h4>Top 5 Oro</h4>
                            <div id="ranking-gold" class="ranking-list">
                                <p class="loading">Cargando...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Servidor -->
                <div class="admin-section">
                    <h3>🖥️ Servidor</h3>
                    <div class="server-info">
                        <p><strong>Uptime:</strong> <span id="server-uptime">-</span></p>
                        <p><strong>Última Actualización:</strong> <span id="last-update">-</span></p>
                    </div>
                </div>

                <!-- Botón de actualización manual -->
                <div class="admin-section">
                    <button id="refreshStatsBtn" class="refresh-btn">🔄 Actualizar Ahora</button>
                    <p class="update-info">Actualización automática cada 30 segundos</p>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', panelHTML);
}

/**
 * Configurar event listeners del panel
 */
function setupEventListeners() {
    const closeBtn = document.getElementById('adminPanelClose');
    const refreshBtn = document.getElementById('refreshStatsBtn');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeAdminPanel();
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadAdminStats();
        });
    }

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isAdminPanelOpen) {
            closeAdminPanel();
        }
    });
}

/**
 * Abrir/cerrar el panel de administración
 */
export function toggleAdminPanel() {
    if (isAdminPanelOpen) {
        closeAdminPanel();
    } else {
        openAdminPanel();
    }
}

/**
 * Abrir el panel de administración
 */
export function openAdminPanel() {
    // Verificar permisos
    if (!gameState.onlineUser || (gameState.onlineUser.role !== 'admin' && gameState.onlineUser.role !== 'moderator')) {
        console.error('❌ No tienes permisos para abrir el panel de admin');
        return;
    }

    const panel = document.getElementById('adminPanel');
    if (!panel) {
        initAdminPanel();
    }

    panel.style.display = 'flex';
    isAdminPanelOpen = true;

    // Cargar estadísticas iniciales
    loadAdminStats();

    // Configurar actualización automática cada 30 segundos
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
    }
    statsUpdateInterval = setInterval(() => {
        loadAdminStats();
    }, 30000);

    console.log('🔧 Panel de administración abierto');
}

/**
 * Cerrar el panel de administración
 */
export function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'none';
    }

    isAdminPanelOpen = false;

    // Detener actualización automática
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
        statsUpdateInterval = null;
    }

    console.log('🔧 Panel de administración cerrado');
}

/**
 * Cargar estadísticas del servidor
 */
async function loadAdminStats() {
    try {
        console.log('📊 Cargando estadísticas del servidor...');
        
        const token = localStorage.getItem('authToken'); // Usar la misma clave que ApiClient
        if (!token) {
            console.error('❌ No hay token de autenticación');
            console.error('❌ gameState.onlineUser:', gameState.onlineUser);
            showError('No se pudo cargar el token de autenticación. Cierra sesión y vuelve a entrar.');
            return;
        }
        
        console.log('✅ Token encontrado, solicitando estadísticas...');

        const response = await apiClient.getAdminStats(token);
        
        if (response.success) {
            displayStats(response.stats);
            updateLastUpdateTime();
        } else {
            console.error('❌ Error al cargar estadísticas:', response.message);
            showError('Error al cargar estadísticas: ' + response.message);
        }
    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
        showError('Error de conexión al cargar estadísticas');
    }
}

/**
 * Mostrar estadísticas en el panel
 * @param {Object} stats - Estadísticas del servidor
 */
function displayStats(stats) {
    // Estadísticas generales
    document.getElementById('stat-total-users').textContent = stats.users.total;
    document.getElementById('stat-active-users').textContent = stats.users.active;
    document.getElementById('stat-total-characters').textContent = stats.characters.total;
    document.getElementById('stat-online-characters').textContent = stats.characters.online;

    // Jugadores online
    const onlinePlayersList = document.getElementById('online-players-list');
    if (stats.online.count === 0) {
        onlinePlayersList.innerHTML = '<p class="no-data">No hay jugadores online</p>';
    } else {
        onlinePlayersList.innerHTML = stats.online.players.map(player => `
            <div class="online-player-item">
                <span class="player-name">${player.username}</span>
                <span class="player-level">Lv.${player.level}</span>
                <span class="player-map">${player.map}</span>
                ${player.isGhost ? '<span class="player-status ghost">👻</span>' : '<span class="player-status alive">❤️</span>'}
            </div>
        `).join('');
    }

    // Rankings
    const levelRanking = document.getElementById('ranking-level');
    const goldRanking = document.getElementById('ranking-gold');

    if (stats.rankings.topLevel.length === 0) {
        levelRanking.innerHTML = '<p class="no-data">No hay datos</p>';
    } else {
        levelRanking.innerHTML = stats.rankings.topLevel.slice(0, 5).map((char, index) => `
            <div class="ranking-item">
                <span class="rank">${index + 1}.</span>
                <span class="rank-name">${char.name}</span>
                <span class="rank-value">Lv.${char.stats.level}</span>
            </div>
        `).join('');
    }

    if (stats.rankings.topGold.length === 0) {
        goldRanking.innerHTML = '<p class="no-data">No hay datos</p>';
    } else {
        goldRanking.innerHTML = stats.rankings.topGold.slice(0, 5).map((char, index) => `
            <div class="ranking-item">
                <span class="rank">${index + 1}.</span>
                <span class="rank-name">${char.name}</span>
                <span class="rank-value">${char.stats.gold.toLocaleString()} 💰</span>
            </div>
        `).join('');
    }

    // Servidor
    const uptimeSeconds = Math.floor(stats.server.uptime);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    document.getElementById('server-uptime').textContent = 
        `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Actualizar hora de última actualización
 */
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES');
    document.getElementById('last-update').textContent = timeString;
}

/**
 * Mostrar mensaje de error en el panel
 * @param {string} message - Mensaje de error
 */
function showError(message) {
    const onlinePlayersList = document.getElementById('online-players-list');
    if (onlinePlayersList) {
        onlinePlayersList.innerHTML = `<p class="error">${message}</p>`;
    }
}

// Auto-inicializar cuando se carga el módulo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPanel);
} else {
    initAdminPanel();
}