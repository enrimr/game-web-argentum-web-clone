/**
 * Cliente API para comunicación con el backend de Calima Online
 */

class ApiClient {
    constructor() {
        // URL base del servidor (puede configurarse desde variables de entorno)
        this.baseUrl = 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
    }

    /**
     * Realiza una petición HTTP al servidor
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Añadir token si existe
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error en petición API:', error);
            throw error;
        }
    }

    // ==================== AUTENTICACIÓN ====================

    /**
     * Registrar nuevo usuario
     */
    async register(username, email, password) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    /**
     * Iniciar sesión
     */
    async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    /**
     * Obtener perfil del usuario actual
     */
    async getProfile() {
        return await this.request('/auth/me', {
            method: 'GET'
        });
    }

    /**
     * Verificar token
     */
    async verifyToken() {
        return await this.request('/auth/verify-token', {
            method: 'GET'
        });
    }

    /**
     * Cambiar contraseña
     */
    async changePassword(currentPassword, newPassword) {
        return await this.request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    /**
     * Cerrar sesión
     */
    logout() {
        this.clearToken();
        localStorage.removeItem('selectedCharacterId');
    }

    // ==================== PERSONAJES ====================

    /**
     * Obtener todos los personajes del usuario
     */
    async getCharacters() {
        return await this.request('/characters', {
            method: 'GET'
        });
    }

    /**
     * Obtener un personaje específico
     */
    async getCharacter(characterId) {
        return await this.request(`/characters/${characterId}`, {
            method: 'GET'
        });
    }

    /**
     * Crear nuevo personaje
     */
    async createCharacter(name, characterClass, appearance = {}) {
        return await this.request('/characters', {
            method: 'POST',
            body: JSON.stringify({
                name,
                class: characterClass,
                appearance
            })
        });
    }

    /**
     * Actualizar personaje
     */
    async updateCharacter(characterId, updates) {
        return await this.request(`/characters/${characterId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    /**
     * Eliminar personaje
     */
    async deleteCharacter(characterId) {
        return await this.request(`/characters/${characterId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Seleccionar personaje para jugar
     */
    async selectCharacter(characterId) {
        const response = await this.request(`/characters/${characterId}/select`, {
            method: 'POST'
        });

        if (response.success) {
            localStorage.setItem('selectedCharacterId', characterId);
        }

        return response;
    }

    /**
     * Desconectar personaje
     */
    async disconnectCharacter(characterId, gameState = {}) {
        const response = await this.request(`/characters/${characterId}/disconnect`, {
            method: 'POST',
            body: JSON.stringify(gameState)
        });

        if (response.success) {
            localStorage.removeItem('selectedCharacterId');
        }

        return response;
    }

    /**
     * Verificar disponibilidad de nombre
     */
    async checkNameAvailability(name) {
        return await this.request(`/characters/check-name/${name}`, {
            method: 'GET'
        });
    }

    // ==================== GESTIÓN DE TOKEN ====================

    /**
     * Guardar token de autenticación
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    /**
     * Obtener token actual
     */
    getToken() {
        return this.token || localStorage.getItem('authToken');
    }

    /**
     * Eliminar token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    /**
     * Verificar si hay sesión activa
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    // ==================== CONFIGURACIÓN ====================

    /**
     * Cambiar URL base del servidor
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }

    /**
     * Obtener URL base del servidor
     */
    getBaseUrl() {
        return this.baseUrl;
    }
}

// Exportar instancia singleton
const apiClient = new ApiClient();
export default apiClient;