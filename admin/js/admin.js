/**
 * Admin Dashboard - Calima Online
 * Panel de administración completo
 */

// Configuración
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let currentToken = null;
let currentSection = 'stats';

// Estado del filtro de personajes
let currentCharacterFilter = {
    userId: null,
    username: null
};

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
        online: '🟢 Jugadores Online',
        npcs: '🎭 NPCs Activos'
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
            // Cargar con el filtro actual si existe
            loadCharacters(1, currentCharacterFilter.userId);
            break;
        case 'online':
            loadOnlinePlayers();
            break;
        case 'npcs':
            loadNPCs();
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
                <button class="btn btn-sm btn-primary" onclick="viewUserCharacters('${user._id}', '${user.username}')" title="Ver personajes">👁️</button>
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
 * Ver personajes de un usuario específico
 */
window.viewUserCharacters = function(userId, username) {
    // Guardar info del usuario en el filtro
    currentCharacterFilter.userId = userId;
    currentCharacterFilter.username = username;
    
    // Navegar a la sección de personajes con el filtro aplicado
    navigateToSection('characters');
};

/**
 * Cargar personajes (todos o filtrados por usuario)
 */
async function loadCharacters(page = 1, userId = null) {
    const tbody = document.getElementById('charactersTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Cargando personajes...</td></tr>';

    // Actualizar filtro si se proporciona
    if (userId !== undefined) {
        currentCharacterFilter.userId = userId;
    }

    // Construir URL con filtro si existe
    let url = `${API_URL}/admin/characters?page=${page}`;
    if (currentCharacterFilter.userId) {
        url += `&userId=${currentCharacterFilter.userId}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayCharacters(data.data);
            displayPagination('charactersPagination', data.pagination, (p) => loadCharacters(p, currentCharacterFilter.userId));
            
            // Mostrar/ocultar banner de filtro
            updateCharacterFilterBanner();
        } else {
            tbody.innerHTML = `<tr><td colspan="8" class="error">Error: ${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Error cargando personajes:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="error">Error de conexión</td></tr>';
    }
}

/**
 * Actualizar banner de filtro de personajes
 */
function updateCharacterFilterBanner() {
    let existingBanner = document.getElementById('characterFilterBanner');
    
    if (currentCharacterFilter.userId && currentCharacterFilter.username) {
        if (!existingBanner) {
            existingBanner = document.createElement('div');
            existingBanner.id = 'characterFilterBanner';
            existingBanner.style.cssText = 'background: #667eea; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;';
            
            const toolbar = document.querySelector('#charactersSection .section-toolbar');
            toolbar.parentNode.insertBefore(existingBanner, toolbar.nextSibling);
        }
        
        existingBanner.innerHTML = `
            <span>📋 Mostrando personajes de: <strong>${currentCharacterFilter.username}</strong></span>
            <button onclick="clearCharacterFilter()" class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white;">
                ❌ Limpiar Filtro
            </button>
        `;
    } else {
        if (existingBanner) {
            existingBanner.remove();
        }
    }
}

/**
 * Limpiar filtro de personajes
 */
window.clearCharacterFilter = function() {
    currentCharacterFilter = { userId: null, username: null };
    loadCharacters(1);
};

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
 * Editar usuario
 */
window.editUser = async function(userId) {
    try {
        // Obtener datos del usuario
        const response = await fetch(`${API_URL}/admin/users?page=1&limit=100`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await response.json();
        const user = data.users.find(u => u._id === userId);
        
        if (!user) {
            showNotification('Usuario no encontrado', 'error');
            return;
        }

        showEditUserModal(user);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar usuario', 'error');
    }
};

/**
 * Mostrar modal de edición de usuario
 */
function showEditUserModal(user) {
    const modal = document.getElementById('modalContent');
    modal.innerHTML = `
        <h2>✏️ Editar Usuario: ${user.username}</h2>
        <form id="editUserForm">
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="editEmail" value="${user.email}" required>
            </div>
            <div class="form-group">
                <label>Rol</label>
                <select id="editRole">
                    <option value="player" ${user.role === 'player' ? 'selected' : ''}>Player</option>
                    <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="editIsActive" ${user.isActive ? 'checked' : ''}>
                    Cuenta activa
                </label>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">💾 Guardar Cambios</button>
            </div>
        </form>
    `;

    document.getElementById('editUserForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveUserChanges(user._id);
    });

    showModal();
}

/**
 * Guardar cambios de usuario
 */
async function saveUserChanges(userId) {
    const email = document.getElementById('editEmail').value;
    const role = document.getElementById('editRole').value;
    const isActive = document.getElementById('editIsActive').checked;

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, role, isActive })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Usuario actualizado exitosamente', 'success');
            closeModal();
            loadUsers();
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

/**
 * Ver personaje completo
 */
window.viewCharacter = async function(charId) {
    try {
        const response = await fetch(`${API_URL}/characters/${charId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showCharacterDetailsModal(data.data);
        } else {
            showNotification('Error al cargar personaje', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
};

/**
 * Mostrar modal de detalles de personaje
 */
function showCharacterDetailsModal(char) {
    const modal = document.getElementById('modalContent');
    modal.innerHTML = `
        <h2>⚔️ Detalles de ${char.name}</h2>
        <div style="max-height: 60vh; overflow-y: auto;">
            <!-- Sprite del Personaje -->
            <div class="form-group" style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #667eea; margin-bottom: 15px;">🎨 Apariencia</h3>
                <canvas id="characterSpriteCanvas" width="64" height="64" style="image-rendering: pixelated; border: 2px solid #667eea; border-radius: 8px; background: white;"></canvas>
                <p style="margin-top: 10px; font-size: 12px; color: #718096;">
                    ${char.state.isAlive ? '❤️ Vivo' : '👻 Fantasma'}
                </p>
            </div>

            <!-- Información Básica -->
            <div class="form-group">
                <h3 style="color: #667eea; margin-bottom: 10px;">📋 Información Básica</h3>
                <p><strong>Nombre:</strong> ${char.name}</p>
                <p><strong>Clase:</strong> ${char.class}</p>
                <p><strong>Nivel:</strong> ${char.stats.level}</p>
                <p><strong>Experiencia:</strong> ${char.stats.experience}</p>
            </div>

            <!-- Stats -->
            <div class="form-group">
                <h3 style="color: #667eea; margin-bottom: 10px;">📊 Estadísticas</h3>
                <p><strong>HP:</strong> ${char.stats.hp}/${char.stats.maxHp}</p>
                <p><strong>Mana:</strong> ${char.stats.mana}/${char.stats.maxMana}</p>
                <p><strong>Stamina:</strong> ${char.stats.stamina}/${char.stats.maxStamina}</p>
                <p><strong>Oro:</strong> ${char.stats.gold.toLocaleString()} 💰</p>
            </div>

            <!-- Atributos -->
            <div class="form-group">
                <h3 style="color: #667eea; margin-bottom: 10px;">💪 Atributos</h3>
                <p><strong>Fuerza:</strong> ${char.stats.strength || 10}</p>
                <p><strong>Destreza:</strong> ${char.stats.dexterity || 10}</p>
                <p><strong>Inteligencia:</strong> ${char.stats.intelligence || 10}</p>
                <p><strong>Constitución:</strong> ${char.stats.constitution || 10}</p>
                <p><strong>Carisma:</strong> ${char.stats.charisma || 10}</p>
            </div>

            <!-- Posición -->
            <div class="form-group">
                <h3 style="color: #667eea; margin-bottom: 10px;">📍 Ubicación</h3>
                <p><strong>Mapa:</strong> ${char.position.map}</p>
                <p><strong>Posición:</strong> (${char.position.x}, ${char.position.y})</p>
            </div>

            <!-- Estado -->
            <div class="form-group">
                <h3 style="color: #667eea; margin-bottom: 10px;">🎮 Estado</h3>
                <p><strong>Online:</strong> ${char.state.isOnline ? '🟢 Sí' : '⚫ No'}</p>
                <p><strong>Vivo:</strong> ${char.state.isAlive ? '❤️ Sí' : '💀 No'}</p>
                <p><strong>Meditando:</strong> ${char.state.isMeditating ? '🧘 Sí' : 'No'}</p>
            </div>

            <!-- Inventario -->
            <div class="form-group">
                <h3 style="color: #667eea; margin-bottom: 10px;">🎒 Inventario</h3>
                ${char.inventory && char.inventory.length > 0 
                    ? char.inventory.map(item => `
                        <p>• ${item.itemId || item.type || 'Item'} x${item.quantity}</p>
                    `).join('')
                    : '<p style="color: #a0aec0; font-style: italic;">Inventario vacío</p>'
                }
            </div>

            <!-- Equipamiento -->
            <div class="form-group">
                <h3 style="color: #667eea; margin-bottom: 10px;">🛡️ Equipamiento</h3>
                <p><strong>Arma:</strong> ${char.equipment.weapon || 'Ninguna'}</p>
                <p><strong>Escudo:</strong> ${char.equipment.shield || 'Ninguno'}</p>
                <p><strong>Armadura:</strong> ${char.equipment.armor || 'Ninguna'}</p>
                <p><strong>Casco:</strong> ${char.equipment.helmet || 'Ninguno'}</p>
            </div>

            <!-- Facción -->
            <div class="form-group">
                <h3 style="color: #667eea; margin-bottom: 10px;">⚔️ Facción & Criminalidad</h3>
                <p><strong>Facción:</strong> ${char.faction || 'Ninguna'}</p>
                <p><strong>Criminalidad:</strong> ${char.criminalStatus || 0} puntos</p>
            </div>
        </div>
        <div class="modal-actions" style="margin-top: 20px;">
            <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
            <button class="btn btn-warning" onclick="editCharacter('${char._id}')">✏️ Editar</button>
        </div>
    `;

    showModal();
    
    // Renderizar sprite después de que el modal esté visible
    setTimeout(() => {
        renderCharacterSprite(char);
    }, 100);
}

/**
 * Renderizar sprite del personaje en el canvas
 */
function renderCharacterSprite(char) {
    const canvas = document.getElementById('characterSpriteCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mapeo de colores según apariencia del servidor
    const tunicColors = {
        1: '#dc2626', 2: '#2563eb', 3: '#16a34a', 4: '#eab308', 5: '#9333ea',
        6: '#ea580c', 7: '#ec4899', 8: '#92400e', 9: '#1f2937', 10: '#f3f4f6'
    };
    
    const skinColors = {
        1: '#fcd9bd', 2: '#d4a574', 3: '#b8865f', 4: '#8d5524', 5: '#9ca3af', 6: '#86efac'
    };
    
    const tunicColor = tunicColors[char.appearance?.body] || '#2563eb';
    const skinColor = skinColors[char.appearance?.head] || '#fcd9bd';
    
    // Si es fantasma, aplicar efecto
    if (!char.state.isAlive || char.stats.hp === 0) {
        ctx.globalAlpha = 0.6;
        ctx.filter = 'grayscale(100%) brightness(1.3)';
    }
    
    // Dibujar sprite simple
    const size = 64;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Cabeza
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 8, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Cuerpo (túnica)
    ctx.fillStyle = tunicColor;
    ctx.fillRect(centerX - 10, centerY + 4, 20, 24);
    
    // Brazos
    ctx.fillStyle = skinColor;
    ctx.fillRect(centerX - 14, centerY + 8, 4, 16);
    ctx.fillRect(centerX + 10, centerY + 8, 4, 16);
    
    // Piernas
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(centerX - 8, centerY + 28, 6, 12);
    ctx.fillRect(centerX + 2, centerY + 28, 6, 12);
    
    // Ojos (si está vivo)
    if (char.state.isAlive && char.stats.hp > 0) {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(centerX - 6, centerY - 10, 3, 3);
        ctx.fillRect(centerX + 3, centerY - 10, 3, 3);
    }
    
    // Restaurar efectos
    ctx.globalAlpha = 1.0;
    ctx.filter = 'none';
}

/**
 * Editar personaje
 */
window.editCharacter = async function(charId) {
    try {
        const response = await fetch(`${API_URL}/characters/${charId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showEditCharacterModal(data.data);
        } else {
            showNotification('Error al cargar personaje', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
};

/**
 * Mostrar modal de edición de personaje
 */
function showEditCharacterModal(char) {
    const modal = document.getElementById('modalContent');
    
    // Definir colores para visualización
    const tunicColors = [
        { id: 1, name: 'Rojo', hex: '#dc2626' },
        { id: 2, name: 'Azul', hex: '#2563eb' },
        { id: 3, name: 'Verde', hex: '#16a34a' },
        { id: 4, name: 'Amarillo', hex: '#eab308' },
        { id: 5, name: 'Morado', hex: '#9333ea' },
        { id: 6, name: 'Naranja', hex: '#ea580c' },
        { id: 7, name: 'Rosa', hex: '#ec4899' },
        { id: 8, name: 'Marrón', hex: '#92400e' },
        { id: 9, name: 'Negro', hex: '#1f2937' },
        { id: 10, name: 'Blanco', hex: '#f3f4f6' }
    ];
    
    const skinColors = [
        { id: 1, name: 'Clara', hex: '#fcd9bd' },
        { id: 2, name: 'Media', hex: '#d4a574' },
        { id: 3, name: 'Morena', hex: '#b8865f' },
        { id: 4, name: 'Oscura', hex: '#8d5524' },
        { id: 5, name: 'Gris', hex: '#9ca3af' },
        { id: 6, name: 'Verde', hex: '#86efac' }
    ];
    
    const classes = [
        { id: 'guerrero', name: 'Guerrero', icon: '⚔️' },
        { id: 'mago', name: 'Mago', icon: '🔮' },
        { id: 'arquero', name: 'Arquero', icon: '🏹' },
        { id: 'clerigo', name: 'Clérigo', icon: '✨' },
        { id: 'asesino', name: 'Asesino', icon: '🗡️' },
        { id: 'paladin', name: 'Paladín', icon: '🛡️' },
        { id: 'bardo', name: 'Bardo', icon: '🎵' }
    ];
    
    modal.innerHTML = `
        <h2>✏️ Editar Personaje: ${char.name}</h2>
        <form id="editCharacterForm" style="max-height: 60vh; overflow-y: auto;">
            <!-- Nombre del Personaje -->
            <h3 style="color: #667eea; margin: 15px 0 10px 0;">📝 Nombre</h3>
            <div class="form-group">
                <input type="text" id="editName" value="${char.name}" 
                       style="width: 100%; padding: 10px; border-radius: 6px; border: 2px solid #e2e8f0;"
                       minlength="3" maxlength="20" required>
                <small style="color: #718096;">3-20 caracteres</small>
            </div>

            <!-- Profesión -->
            <h3 style="color: #667eea; margin: 15px 0 10px 0;">🎭 Profesión</h3>
            <div class="form-group">
                <select id="editClass" style="width: 100%; padding: 8px; border-radius: 6px; border: 2px solid #e2e8f0;">
                    ${classes.map(c => `
                        <option value="${c.id}" ${char.class === c.id ? 'selected' : ''}>
                            ${c.icon} ${c.name}
                        </option>
                    `).join('')}
                </select>
            </div>

            <!-- Stats -->
            <h3 style="color: #667eea; margin: 15px 0 10px 0;">📊 Estadísticas</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Nivel</label>
                    <input type="number" id="editLevel" value="${char.stats.level}" min="1" max="100">
                </div>
                <div class="form-group">
                    <label>Oro</label>
                    <input type="number" id="editGold" value="${char.stats.gold}" min="0">
                </div>
                <div class="form-group">
                    <label>HP</label>
                    <input type="number" id="editHp" value="${char.stats.hp}" min="0">
                </div>
                <div class="form-group">
                    <label>HP Máximo</label>
                    <input type="number" id="editMaxHp" value="${char.stats.maxHp}" min="1">
                </div>
                <div class="form-group">
                    <label>Mana</label>
                    <input type="number" id="editMana" value="${char.stats.mana}" min="0">
                </div>
                <div class="form-group">
                    <label>Mana Máximo</label>
                    <input type="number" id="editMaxMana" value="${char.stats.maxMana}" min="1">
                </div>
            </div>

            <!-- Atributos -->
            <h3 style="color: #667eea; margin: 15px 0 10px 0;">💪 Atributos</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Fuerza</label>
                    <input type="number" id="editStrength" value="${char.stats.strength || 10}" min="1" max="99">
                </div>
                <div class="form-group">
                    <label>Destreza</label>
                    <input type="number" id="editDexterity" value="${char.stats.dexterity || 10}" min="1" max="99">
                </div>
                <div class="form-group">
                    <label>Inteligencia</label>
                    <input type="number" id="editIntelligence" value="${char.stats.intelligence || 10}" min="1" max="99">
                </div>
                <div class="form-group">
                    <label>Constitución</label>
                    <input type="number" id="editConstitution" value="${char.stats.constitution || 10}" min="1" max="99">
                </div>
            </div>

            <!-- Apariencia -->
            <h3 style="color: #667eea; margin: 15px 0 10px 0;">🎨 Apariencia</h3>
            
            <!-- Color de Túnica con preview visual -->
            <div class="form-group">
                <label>Color de Túnica</label>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 8px;">
                    ${tunicColors.map(color => `
                        <label style="cursor: pointer; text-align: center;">
                            <input type="radio" name="tunicColor" value="${color.id}" 
                                   ${(char.appearance?.body || 2) === color.id ? 'checked' : ''}
                                   style="display: none;">
                            <div style="width: 40px; height: 40px; background: ${color.hex}; 
                                        border-radius: 8px; margin: 0 auto 5px; 
                                        border: 3px solid ${(char.appearance?.body || 2) === color.id ? '#667eea' : '#e2e8f0'};
                                        transition: all 0.3s;">
                            </div>
                            <small style="font-size: 11px; color: #718096;">${color.name}</small>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <!-- Color de Piel con preview visual -->
            <div class="form-group">
                <label>Color de Piel</label>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 8px;">
                    ${skinColors.map(color => `
                        <label style="cursor: pointer; text-align: center;">
                            <input type="radio" name="skinColor" value="${color.id}" 
                                   ${(char.appearance?.head || 1) === color.id ? 'checked' : ''}
                                   style="display: none;">
                            <div style="width: 40px; height: 40px; background: ${color.hex}; 
                                        border-radius: 50%; margin: 0 auto 5px; 
                                        border: 3px solid ${(char.appearance?.head || 1) === color.id ? '#667eea' : '#e2e8f0'};
                                        transition: all 0.3s;">
                            </div>
                            <small style="font-size: 11px; color: #718096;">${color.name}</small>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <!-- Raza con radio buttons -->
            <div class="form-group">
                <label>Raza</label>
                <div style="display: flex; gap: 15px; margin-top: 8px;">
                    <label style="cursor: pointer; padding: 10px 15px; background: ${(char.appearance?.race || 1) === 1 ? '#667eea' : '#f7fafc'}; 
                                  color: ${(char.appearance?.race || 1) === 1 ? 'white' : '#2d3748'}; border-radius: 8px; transition: all 0.3s;">
                        <input type="radio" name="race" value="1" ${(char.appearance?.race || 1) === 1 ? 'checked' : ''} style="margin-right: 5px;">
                        🧑 Humano
                    </label>
                    <label style="cursor: pointer; padding: 10px 15px; background: ${(char.appearance?.race || 1) === 2 ? '#667eea' : '#f7fafc'}; 
                                  color: ${(char.appearance?.race || 1) === 2 ? 'white' : '#2d3748'}; border-radius: 8px; transition: all 0.3s;">
                        <input type="radio" name="race" value="2" ${(char.appearance?.race || 1) === 2 ? 'checked' : ''} style="margin-right: 5px;">
                        🧔 Enano
                    </label>
                    <label style="cursor: pointer; padding: 10px 15px; background: ${(char.appearance?.race || 1) === 3 ? '#667eea' : '#f7fafc'}; 
                                  color: ${(char.appearance?.race || 1) === 3 ? 'white' : '#2d3748'}; border-radius: 8px; transition: all 0.3s;">
                        <input type="radio" name="race" value="3" ${(char.appearance?.race || 1) === 3 ? 'checked' : ''} style="margin-right: 5px;">
                        👹 Criatura
                    </label>
                </div>
            </div>

            <!-- Estado -->
            <h3 style="color: #667eea; margin: 15px 0 10px 0;">🎮 Estado</h3>
            <div class="form-group">
                <label style="cursor: pointer; padding: 10px; background: #f7fafc; border-radius: 8px; display: inline-block;">
                    <input type="checkbox" id="editIsAlive" ${char.state.isAlive ? 'checked' : ''} style="margin-right: 8px;">
                    <strong>Personaje vivo</strong> (desmarcar = fantasma 👻)
                </label>
            </div>

            <!-- Facción -->
            <h3 style="color: #667eea; margin: 15px 0 10px 0;">⚔️ Facción</h3>
            <div class="form-group">
                <label>Puntos de Criminalidad</label>
                <input type="number" id="editCriminalStatus" value="${char.criminalStatus || 0}" min="0">
                <small style="color: #718096;">0-49: Ciudadano 😇 | 50-99: Criminal 😈 | 100+: Asesino 💀</small>
            </div>

            <div class="modal-actions" style="margin-top: 25px;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">💾 Guardar Cambios</button>
            </div>
        </form>
    `;

    // Event listeners para cambiar borde de los colores seleccionados
    modal.querySelectorAll('input[name="tunicColor"]').forEach(input => {
        input.addEventListener('change', (e) => {
            modal.querySelectorAll('input[name="tunicColor"]').forEach(i => {
                i.parentElement.querySelector('div').style.borderColor = '#e2e8f0';
            });
            e.target.parentElement.querySelector('div').style.borderColor = '#667eea';
        });
    });
    
    modal.querySelectorAll('input[name="skinColor"]').forEach(input => {
        input.addEventListener('change', (e) => {
            modal.querySelectorAll('input[name="skinColor"]').forEach(i => {
                i.parentElement.querySelector('div').style.borderColor = '#e2e8f0';
            });
            e.target.parentElement.querySelector('div').style.borderColor = '#667eea';
        });
    });
    
    modal.querySelectorAll('input[name="race"]').forEach(input => {
        input.addEventListener('change', (e) => {
            modal.querySelectorAll('input[name="race"]').forEach(i => {
                i.parentElement.style.background = '#f7fafc';
                i.parentElement.style.color = '#2d3748';
            });
            e.target.parentElement.style.background = '#667eea';
            e.target.parentElement.style.color = 'white';
        });
    });

    document.getElementById('editCharacterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveCharacterChanges(char._id);
    });

    showModal();
}

/**
 * Guardar cambios del personaje
 */
async function saveCharacterChanges(characterId) {
    // Obtener valores de radio buttons
    const tunicColorInput = document.querySelector('input[name="tunicColor"]:checked');
    const skinColorInput = document.querySelector('input[name="skinColor"]:checked');
    const raceInput = document.querySelector('input[name="race"]:checked');
    
    // Recopilar todos los cambios
    const updates = {
        name: document.getElementById('editName').value,
        class: document.getElementById('editClass').value,
        stats: {
            level: parseInt(document.getElementById('editLevel').value),
            gold: parseInt(document.getElementById('editGold').value),
            hp: parseInt(document.getElementById('editHp').value),
            maxHp: parseInt(document.getElementById('editMaxHp').value),
            mana: parseInt(document.getElementById('editMana').value),
            maxMana: parseInt(document.getElementById('editMaxMana').value),
            strength: parseInt(document.getElementById('editStrength').value),
            dexterity: parseInt(document.getElementById('editDexterity').value),
            intelligence: parseInt(document.getElementById('editIntelligence').value),
            constitution: parseInt(document.getElementById('editConstitution').value)
        },
        appearance: {
            body: parseInt(tunicColorInput.value),
            head: parseInt(skinColorInput.value),
            race: parseInt(raceInput.value)
        },
        state: {
            isAlive: document.getElementById('editIsAlive').checked
        },
        criminalStatus: parseInt(document.getElementById('editCriminalStatus').value)
    };

    // Ajustar HP si isAlive es false
    if (!updates.state.isAlive) {
        updates.stats.hp = 0;
    }

    try {
        const response = await fetch(`${API_URL}/admin/characters/${characterId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Personaje actualizado exitosamente', 'success');
            closeModal();
            loadCharacters();
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

/**
 * Mostrar modal
 */
function showModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
}

/**
 * Cerrar modal
 */
window.closeModal = function() {
    document.getElementById('modalOverlay').style.display = 'none';
};

// Cerrar modal al hacer clic en el overlay
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') {
            closeModal();
        }
    });
});

/**
 * Cargar NPCs activos
 */
async function loadNPCs(mapFilter = '') {
    const container = document.getElementById('npcsByMap');
    container.innerHTML = '<div class="loading-card">Cargando NPCs...</div>';

    try {
        let url = `${API_URL}/admin/npcs`;
        if (mapFilter) {
            url += `?map=${mapFilter}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayNPCs(data.data);
            
            // Poblar filtro de mapas si está vacío
            populateMapFilter(Object.keys(data.data.byMap));
        } else {
            container.innerHTML = `<div class="loading-card">Error: ${data.message}</div>`;
        }
    } catch (error) {
        console.error('Error cargando NPCs:', error);
        container.innerHTML = '<div class="loading-card">Error de conexión</div>';
    }
}

/**
 * Mostrar NPCs agrupados por mapa
 */
function displayNPCs(npcData) {
    const container = document.getElementById('npcsByMap');
    
    // Actualizar estadísticas
    document.getElementById('totalNPCs').textContent = npcData.stats.total;
    document.getElementById('aliveNPCs').textContent = npcData.stats.alive;
    document.getElementById('deadNPCs').textContent = npcData.stats.dead;
    
    if (npcData.stats.total === 0) {
        container.innerHTML = '<div class="loading-card">No hay NPCs spawneados</div>';
        return;
    }

    // Agrupar NPCs por mapa y mostrarlos
    let html = '';
    
    for (const [mapName, npcsInMap] of Object.entries(npcData.byMap)) {
        html += `
            <div class="map-npc-group">
                <h3 class="map-title">
                    🗺️ ${mapName}
                    <span class="npc-count">${npcsInMap.length} NPC(s)</span>
                </h3>
                <div class="npc-grid">
                    ${npcsInMap.map(npc => `
                        <div class="npc-card ${!npc.isAlive ? 'dead' : ''}">
                            <div class="npc-header">
                                <span class="npc-icon">${getNPCIcon(npc.npcTypeName)}</span>
                                <div class="npc-info">
                                    <h4>${npc.name}</h4>
                                    <small>${npc.npcTypeName}</small>
                                </div>
                                <span class="npc-status ${npc.isAlive ? 'alive' : 'dead'}">
                                    ${npc.isAlive ? '❤️' : '💀'}
                                </span>
                            </div>
                            <div class="npc-stats">
                                <div class="stat-row">
                                    <span>📍 Posición:</span>
                                    <span>(${npc.position.x}, ${npc.position.y})</span>
                                </div>
                                <div class="stat-row">
                                    <span>❤️ HP:</span>
                                    <span>${npc.stats.hp}/${npc.stats.maxHp}</span>
                                </div>
                                <div class="stat-row">
                                    <span>⚔️ Nivel:</span>
                                    <span>${npc.stats.level}</span>
                                </div>
                                <div class="stat-row">
                                    <span>⚠️ Hostil:</span>
                                    <span>${npc.behavior.hostile ? 'Sí 🔴' : 'No 🟢'}</span>
                                </div>
                                <div class="stat-row">
                                    <span>🔄 Spawneado:</span>
                                    <span>${new Date(npc.spawnedAt).toLocaleTimeString('es-ES')}</span>
                                </div>
                            </div>
                            <div class="npc-id">
                                <small>ID: ${npc.instanceId.substring(0, 20)}...</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

/**
 * Obtener icono según tipo de NPC
 */
function getNPCIcon(npcType) {
    const icons = {
        'Goblin': '👹',
        'Araña Gigante': '🕷️',
        'Lobo Salvaje': '🐺',
        'Sacerdote': '⛪',
        'Comerciante': '🏪',
        'Guardia': '🛡️',
        'Herrero': '⚒️'
    };
    
    return icons[npcType] || '🎭';
}

/**
 * Poblar filtro de mapas
 */
function populateMapFilter(mapNames) {
    const select = document.getElementById('mapFilter');
    const currentValue = select.value;
    
    // Si ya tiene opciones (aparte de la primera), no repoblar
    if (select.options.length > 1) return;
    
    mapNames.forEach(mapName => {
        const option = document.createElement('option');
        option.value = mapName;
        option.textContent = mapName;
        select.appendChild(option);
    });
    
    // Restaurar valor seleccionado
    select.value = currentValue;
    
    // Event listener para cambiar mapa
    select.addEventListener('change', (e) => {
        loadNPCs(e.target.value);
    });
}

console.log('🔧 Admin Dashboard iniciado');
