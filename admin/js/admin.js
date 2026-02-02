/**
 * Admin Dashboard - Calima Online
 * Panel de administración completo
 */

// Configuración
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let currentToken = null;
let currentSection = 'stats';

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initAdminDashboard();
});

/**
 * Inicializar el dashboard
 */
function initAdminDashboard() {
    // Verificar si ya hay sesión activa
    const token = localStorage.getItem('authToken');
    if (token) {
        verifyTokenAndLoadDashboard(token);
    }

    // Event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('refreshBtn').addEventListener('click', refreshCurrentSection);

    // Navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navigateToSection(section);
        });
    });
}

/**
 * Manejar login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const spinner = document.getElementById('loginSpinner');
    const btnText = document.getElementById('loginBtnText');
    const errorDiv = document.getElementById('loginError');

    // Ocultar error previo
    errorDiv.style.display = 'none';

    // Mostrar spinner
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Iniciando sesión...';

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Verificar que sea admin o moderator
            if (data.data.role !== 'admin' && data.data.role !== 'moderator') {
                errorDiv.textContent = 'No tienes permisos para acceder al panel de administración';
                errorDiv.style.display = 'block';
                return;
            }

            currentToken = data.data.token;
            currentUser = {
                username: data.data.username,
                role: data.data.role,
                userId: data.data.userId
            };

            localStorage.setItem('authToken', currentToken);
            localStorage.setItem('adminUser', JSON.stringify(currentUser));

            showDashboard();
        } else {
            errorDiv.textContent = data.message || 'Error al iniciar sesión';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error en login:', error);
        errorDiv.textContent = 'Error de conexión con el servidor';
        errorDiv.style.display = 'block';
    } finally {
        spinner.style.display = 'none';
        btnText.textContent = 'Iniciar Sesión';
    }
}

/**
 * Verificar token y cargar dashboard
 */
async function verifyTokenAndLoadDashboard(token) {
    try {
        const response = await fetch(`${API_URL}/auth/verify-token`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success && (data.data.role === 'admin' || data.data.role === 'moderator')) {
            currentToken = token;
            currentUser = data.data;
            showDashboard();
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('adminUser');
        }
    } catch (error) {
        console.error('Error verificando token:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
    }
}

/**
 * Mostrar dashboard
 */
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('adminUsername').textContent = currentUser.username;

    // Cargar sección inicial
    loadStats();
}

/**
 * Manejar logout
 */
function handleLogout() {
    currentToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');

    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

/**
 * Navegar a una sección
 */
function navigateToSection(section) {
    currentSection = section;

    // Actualizar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });

    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Mostrar sección seleccionada
    document.getElementById(`${section}Section`).classList.add('active');

    // Actualizar título
    const titles = {
        stats: '📊 Estadísticas del Servidor',
        users: '👥 Gestión de Usuarios',
        characters: '⚔️ Gestión de Personajes',
        online: '🟢 Jugadores Online'
    };
    document.getElementById('sectionTitle').textContent = titles[section];

    // Cargar datos de la sección
    switch (section) {
        case 'stats':
            loadStats();
            break;
        case 'users':
            loadUsers();
            break;
        case 'characters':
            loadCharacters();
            break;
        case 'online':
            loadOnlinePlayers();
            break;
    }
}

/**
 * Refrescar sección actual
 */
function refreshCurrentSection() {
    navigateToSection(currentSection);
}

/**
 * Cargar estadísticas
 */
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayStats(data.stats);
        } else {
            showNotification('Error al cargar estadísticas: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error cargando stats:', error);
        showNotification('Error de conexión', 'error');
    }
}

/**
 * Mostrar estadísticas
 */
function displayStats(stats) {
    // Stats generales
    document.getElementById('totalUsers').textContent = stats.users.total;
    document.getElementById('activeUsers').textContent = stats.users.active;
    document.getElementById('totalCharacters').textContent = stats.characters.total;
    document.getElementById('onlineNow').textContent = stats.characters.online;

    // Rankings
    const topLevel = document.getElementById('topLevel');
    topLevel.innerHTML = stats.rankings.topLevel.slice(0, 10).map((char, i) => `
        <div class="ranking-item">
            <span class="rank">${i + 1}</span>
            <span class="name">${char.name}</span>
            <span class="value">Lv.${char.stats.level}</span>
        </div>
    `).join('');

    const topGold = document.getElementById('topGold');
    topGold.innerHTML = stats.rankings.topGold.slice(0, 10).map((char, i) => `
        <div class="ranking-item">
            <span class="rank">${i + 1}</span>
            <span class="name">${char.name}</span>
            <span class="value">${char.stats.gold.toLocaleString()} 💰</span>
        </div>
    `).join('');

    // Server info
    const uptime = Math.floor(stats.server.uptime);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    document.getElementById('serverUptime').textContent = `${hours}h ${minutes}m ${seconds}s`;
    
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('es-ES');
}

/**
 * Cargar usuarios
 */
async function loadUsers(page = 1) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Cargando usuarios...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/admin/users?page=${page}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayUsers(data.users);
            displayPagination('usersPagination', data.pagination, loadUsers);
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="error">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="error">Error de conexión</td></tr>';
    }
}

/**
 * Mostrar usuarios en la tabla
 */
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>${user.username}</strong></td>
            <td>${user.email}</td>
            <td><span class="badge badge-${user.role}">${user.role}</span></td>
            <td>
                ${user.isBanned 
                    ? '<span class="badge badge-banned">Baneado</span>' 
                    : user.isActive 
                        ? '<span class="badge badge-active">Activo</span>'
                        : '<span class="badge badge-inactive">Inactivo</span>'
                }
            </td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editUser('${user._id}')">✏️</button>
                ${!user.isBanned 
                    ? `<button class="btn btn-sm btn-danger" onclick="banUser('${user._id}', '${user.username}')">🚫</button>`
                    : `<button class="btn btn-sm btn-success" onclick="unbanUser('${user._id}', '${user.username}')">✅</button>`
                }
            </td>
        </tr>
    `).join('');
}

/**
 * Cargar personajes
 */
async function loadCharacters() {
    const tbody = document.getElementById('charactersTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Cargando personajes...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/characters`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayCharacters(data.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="error">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Error cargando personajes:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="error">Error de conexión</td></tr>';
    }
}

/**
 * Mostrar personajes en la tabla
 */
function displayCharacters(characters) {
    const tbody = document.getElementById('charactersTableBody');
    
    if (characters.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay personajes</td></tr>';
        return;
    }

    tbody.innerHTML = characters.map(char => `
        <tr>
            <td><strong>${char.name}</strong></td>
            <td>${char.class}</td>
            <td>${char.stats.level}</td>
            <td>${char.stats.hp}/${char.stats.maxHp}</td>
            <td>${char.stats.gold.toLocaleString()} 💰</td>
            <td>
                ${char.state.isOnline 
                    ? '<span class="badge badge-online">Online</span>' 
                    : char.stats.hp === 0 
                        ? '<span class="badge badge-ghost">Fantasma</span>'
                        : '<span class="badge badge-offline">Offline</span>'
                }
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewCharacter('${char._id}')">👁️</button>
                <button class="btn btn-sm btn-warning" onclick="editCharacter('${char._id}')">✏️</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Cargar jugadores online
 */
async function loadOnlinePlayers() {
    const grid = document.getElementById('onlinePlayersGrid');
    grid.innerHTML = '<div class="loading-card">Cargando jugadores online...</div>';

    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayOnlinePlayers(data.stats.online.players);
        } else {
            grid.innerHTML = `<div class="loading-card">Error: ${data.message}</div>`;
        }
    } catch (error) {
        console.error('Error cargando jugadores online:', error);
        grid.innerHTML = '<div class="loading-card">Error de conexión</div>';
    }
}

/**
 * Mostrar jugadores online
 */
function displayOnlinePlayers(players) {
    const grid = document.getElementById('onlinePlayersGrid');
    
    if (players.length === 0) {
        grid.innerHTML = '<div class="loading-card">No hay jugadores online</div>';
        return;
    }

    grid.innerHTML = players.map(player => `
        <div class="online-player-card ${player.isGhost ? 'ghost' : ''}">
            <h4>${player.username} ${player.isGhost ? '👻' : '❤️'}</h4>
            <div class="player-details">
                <p><strong>Nivel:</strong> ${player.level}</p>
                <p><strong>Mapa:</strong> ${player.map}</p>
                <p><strong>HP:</strong> ${player.hp}/${player.maxHp}</p>
                <p><strong>Facción:</strong> ${player.faction}</p>
                <p><strong>Estado:</strong> ${player.isGhost ? 'Fantasma' : 'Vivo'}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Mostrar paginación
 */
function displayPagination(containerId, pagination, loadFunction) {
    const container = document.getElementById(containerId);
    
    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    
    // Botón anterior
    html += `<button ${pagination.page === 1 ? 'disabled' : ''} onclick="window.loadPage(${pagination.page - 1})">← Anterior</button>`;
    
    // Páginas
    for (let i = 1; i <= Math.min(pagination.pages, 5); i++) {
        html += `<button class="${i === pagination.page ? 'active' : ''}" onclick="window.loadPage(${i})">${i}</button>`;
    }
    
    // Botón siguiente
    html += `<button ${pagination.page === pagination.pages ? 'disabled' : ''} onclick="window.loadPage(${pagination.page + 1})">Siguiente →</button>`;
    
    container.innerHTML = html;
    
    // Hacer la función global temporalmente
    window.loadPage = loadFunction;
}

/**
 * Mostrar notificación
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    }[type] || '✅';
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Banear usuario
 */
window.banUser = async function(userId, username) {
    if (!confirm(`¿Estás seguro de que quieres banear a ${username}?`)) {
        return;
    }

    const reason = prompt('Razón del ban:');
    if (!reason) return;

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isBanned: true,
                banReason: reason
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`Usuario ${username} baneado exitosamente`, 'success');
            loadUsers();
        } else {
            showNotification('Error al banear usuario: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
};

/**
 * Desbanear usuario
 */
window.unbanUser = async function(userId, username) {
    if (!confirm(`¿Estás seguro de que quieres desbanear a ${username}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isBanned: false
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`Usuario ${username} desbaneado exitosamente`, 'success');
            loadUsers();
        } else {
            showNotification('Error al desbanear usuario: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
};

/**
 * Editar usuario (placeholder)
 */
window.editUser = function(userId) {
    showNotification('Función de edición en desarrollo', 'info');
};

/**
 * Ver personaje (placeholder)
 */
window.viewCharacter = function(charId) {
    showNotification('Función de vista en desarrollo', 'info');
};

/**
 * Editar personaje (placeholder)
 */
window.editCharacter = function(charId) {
    showNotification('Función de edición en desarrollo', 'info');
};

console.log('🔧 Admin Dashboard iniciado');