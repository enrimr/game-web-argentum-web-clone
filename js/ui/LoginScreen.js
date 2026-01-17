/**
 * LoginScreen.js
 * Gestión de la pantalla de inicio y autenticación para el juego
 */

// Mockup de respuestas del servidor para simular las llamadas API
const AUTH_SERVER_RESPONSES = {
    login: {
        success: {
            status: 200,
            data: {
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJ1c2VybmFtZSI6ImpnYW1lciIsImlhdCI6MTYyNTI0NjI5OH0",
                user: {
                    id: 123,
                    username: "jgamer",
                    avatarUrl: null,
                    level: 10,
                    lastLogin: "2026-09-01T12:35:42Z",
                    isAdmin: false
                }
            }
        },
        error: {
            status: 401,
            error: "Las credenciales no son válidas"
        }
    },
    register: {
        success: {
            status: 201,
            data: {
                message: "Usuario creado exitosamente",
                user: {
                    id: 456,
                    username: "nuevo_jugador",
                    createdAt: "2026-09-01T14:22:31Z"
                }
            }
        },
        error: {
            status: 400,
            error: "El nombre de usuario ya está en uso"
        }
    },
    serverStatus: {
        online: {
            status: 200,
            data: {
                status: "online",
                players: 127,
                uptime: "3d 12h 45m",
                version: "1.2.5"
            }
        },
        offline: {
            status: 503,
            error: "El servidor está en mantenimiento"
        }
    }
};

// Protocolo de autenticación para el futuro servidor
const AUTH_PROTOCOL = {
    // Formato de petición para login
    loginRequest: {
        endpoint: "/api/auth/login",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            username: "nombre_usuario",
            password: "contraseña_cifrada" // En implementación real se usaría HTTPS + hash en cliente
        }
    },
    
    // Formato de petición para registro
    registerRequest: {
        endpoint: "/api/auth/register",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            username: "nombre_usuario",
            password: "contraseña_cifrada", // En implementación real se usaría HTTPS + hash en cliente
            email: "correo@ejemplo.com",
            accept_terms: true // Aceptación de términos y condiciones
        }
    },
    
    // Formato de petición para verificar estado del servidor
    serverStatusRequest: {
        endpoint: "/api/server/status",
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    },
    
    // Formato de petición para verificar autenticación
    verifyTokenRequest: {
        endpoint: "/api/auth/verify",
        method: "GET",
        headers: {
            "Authorization": "Bearer TOKEN_JWT"
        }
    }
};

/**
 * Clase para gestionar la pantalla de inicio y autenticación
 */
export class LoginScreen {
    constructor() {
        this.isInitialized = false;
        this.serverUrl = "https://api.calima-online.com"; // URL mockup
        this.isServerOnline = true;
        this.token = localStorage.getItem('auth_token');
        this.user = null;
        
        if (this.token) {
            try {
                this.user = JSON.parse(localStorage.getItem('user_data'));
            } catch (e) {
                this.token = null;
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
            }
        }
    }
    
    /**
     * Verificar si hay parámetros en la URL para saltar la pantalla de login
     * @returns {boolean} True si debe iniciar en modo local directamente
     */
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const skipLogin = urlParams.has('local') || urlParams.get('mode') === 'local';
        
        return skipLogin;
    }
    
    /**
     * Inicializar la pantalla de login
     * @returns {Promise<void>}
     */
    async init() {
        if (this.isInitialized) return;
        
        // Verificar si hay que saltar la pantalla de login e iniciar en modo local
        if (this.checkUrlParams()) {
            console.log('URL parameter detected: skipping login screen and starting in local mode');
            // No iniciamos el juego aquí, solo marcamos que se debe saltar la pantalla
            // El juego se iniciará desde Game.js cuando esté listo
            this.skipLoginScreen = true;
            this.isInitialized = true;
            return;
        }
        
        // Crear elemento HTML de la pantalla de login
        const loginScreenElement = document.createElement('div');
        loginScreenElement.className = 'login-screen';
        loginScreenElement.id = 'loginScreen';
        loginScreenElement.innerHTML = this.getLoginScreenHTML();
        
        // Añadir a la página
        document.body.appendChild(loginScreenElement);
        
        // Añadir estilos
        if (!document.querySelector('link[href="styles/login-screen.css"]')) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = 'styles/login-screen.css';
            document.head.appendChild(linkElement);
        }
        
        // Inicializar eventos
        this.initEvents();

        // Inicializar carousel del hero banner
        this.initHeroCarousel();

        // Comprobar estado del servidor
        await this.checkServerStatus();

        this.isInitialized = true;
    }
    
    /**
     * Obtener el HTML de la pantalla de login
     * @returns {string} HTML de la pantalla de login
     */
    getLoginScreenHTML() {
        return `
            <!-- Hero Banner Carousel -->
            <div class="hero-banner">
                <div class="hero-carousel">
                    <div class="hero-slide active">
                        <img src="img/landing/hero_banner_image1_calimaonlineworld.png" alt="Calima Online World">
                    </div>
                    <div class="hero-slide">
                        <img src="img/landing/hero_banner_image2_city.png" alt="City View">
                    </div>
                    <div class="hero-slide">
                        <img src="img/landing/hero_banner_image3_fieldwithenemies.png" alt="Field with Enemies">
                    </div>
                </div>
                <div class="hero-overlay">
                    <div class="hero-content">
                        <img src="img/landing/calima_online_logo.png" alt="Calima Online Logo" class="hero-logo">
                        <p class="hero-description">
                            ¡Explora un mundo fantástico inspirado en las Islas Canarias!
                        </p>
                    </div>
                </div>
                <div class="hero-indicators">
                    <span class="indicator active" data-slide="0"></span>
                    <span class="indicator" data-slide="1"></span>
                    <span class="indicator" data-slide="2"></span>
                </div>
            </div>

            <div class="login-logo">
                <p>¡Explora un mundo fantástico inspirado en las Islas Canarias!</p>
            </div>
            
            <div class="login-container">
                <div class="login-tabs">
                    <button id="homeTab" class="login-tab active">Inicio</button>
                    <button id="loginTab" class="login-tab">Iniciar Sesión</button>
                    <button id="registerTab" class="login-tab">Crear Cuenta</button>
                </div>
                
                <!-- Panel de Inicio -->
                <div id="homePanel" class="login-panel active">
                    <div class="login-options">
                        <button id="playLocalButton" class="login-button">
                            <span class="icon">🎮</span>
                            Jugar en Modo Local
                        </button>
                        
                        <button id="playOnlineButton" class="login-button">
                            <span class="icon">🌐</span>
                            Jugar en Modo Multijugador
                        </button>
                        
                        <a href="/manual" target="_blank" class="login-button manual-button">
                            <span class="icon">📖</span>
                            Ver Manual del Juego
                        </a>
                    </div>
                    
                    <div class="server-status">
                        <div id="statusIndicator" class="status-indicator status-online"></div>
                        <span id="serverStatusText">Servidor online - 127 jugadores conectados</span>
                    </div>
                </div>
                
                <!-- Panel de Inicio de Sesión -->
                <div id="loginPanel" class="login-panel">
                    <div id="loginError" class="error-message">Usuario o contraseña incorrectos</div>
                    
                    <form id="loginForm" class="auth-form">
                        <div class="input-group">
                            <span class="icon">👤</span>
                            <input type="text" id="loginUsername" class="auth-input" placeholder="Nombre de usuario" required>
                        </div>
                        
                        <div class="input-group">
                            <span class="icon">🔒</span>
                            <input type="password" id="loginPassword" class="auth-input" placeholder="Contraseña" required>
                        </div>
                        
                        <button type="submit" id="loginSubmit" class="submit-button">
                            Iniciar Sesión
                            <span id="loginSpinner" class="spinner" style="display: none;"></span>
                        </button>
                    </form>
                    
                    <div class="form-footer">
                        ¿No tienes cuenta? <span id="goToRegister" class="form-link">Regístrate aquí</span>
                    </div>
                </div>
                
                <!-- Panel de Registro -->
                <div id="registerPanel" class="login-panel">
                    <div id="registerError" class="error-message">El nombre de usuario ya está en uso</div>
                    
                    <form id="registerForm" class="auth-form">
                        <div class="input-group">
                            <span class="icon">👤</span>
                            <input type="text" id="registerUsername" class="auth-input" placeholder="Nombre de usuario" required>
                        </div>
                        
                        <div class="input-group">
                            <span class="icon">📧</span>
                            <input type="email" id="registerEmail" class="auth-input" placeholder="Correo electrónico" required>
                        </div>
                        
                        <div class="input-group">
                            <span class="icon">🔒</span>
                            <input type="password" id="registerPassword" class="auth-input" placeholder="Contraseña" required>
                        </div>
                        
                        <div class="input-group">
                            <span class="icon">🔒</span>
                            <input type="password" id="registerConfirmPassword" class="auth-input" placeholder="Confirmar contraseña" required>
                        </div>
                        
                        <div class="checkbox-group">
                            <input type="checkbox" id="registerTerms" required>
                            <label for="registerTerms">Acepto los <a href="#" class="form-link">términos y condiciones</a></label>
                        </div>
                        
                        <button type="submit" id="registerSubmit" class="submit-button">
                            Crear Cuenta
                            <span id="registerSpinner" class="spinner" style="display: none;"></span>
                        </button>
                    </form>
                    
                    <div class="form-footer">
                        ¿Ya tienes cuenta? <span id="goToLogin" class="form-link">Inicia sesión aquí</span>
                    </div>
                </div>
            </div>
            
            <div class="login-footer">
                &copy; 2026 Calima Online - Versión Demo
            </div>
        `;
    }
    
    /**
     * Inicializar eventos de la pantalla de login
     */
    initEvents() {
        // Tabs
        document.getElementById('homeTab').addEventListener('click', () => this.showPanel('home'));
        document.getElementById('loginTab').addEventListener('click', () => this.showPanel('login'));
        document.getElementById('registerTab').addEventListener('click', () => this.showPanel('register'));

        // Enlaces entre formularios
        document.getElementById('goToRegister').addEventListener('click', () => this.showPanel('register'));
        document.getElementById('goToLogin').addEventListener('click', () => this.showPanel('login'));

        // Botones principales
        document.getElementById('playLocalButton').addEventListener('click', () => this.startLocalGame());
        document.getElementById('playOnlineButton').addEventListener('click', () => {
            if (this.token && this.user) {
                this.startOnlineGame();
            } else {
                this.showPanel('login');
            }
        });

        // Formulario de login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Formulario de registro
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    /**
     * Inicializar el carousel del hero banner
     */
    initHeroCarousel() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.hero-slide');
        this.indicators = document.querySelectorAll('.indicator');

        // Auto-rotate every 4 seconds
        this.carouselInterval = setInterval(() => {
            this.nextSlide();
        }, 4000);

        // Click events for indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });

        // Pause on hover
        const heroBanner = document.querySelector('.hero-banner');
        if (heroBanner) {
            heroBanner.addEventListener('mouseenter', () => {
                clearInterval(this.carouselInterval);
            });

            heroBanner.addEventListener('mouseleave', () => {
                this.carouselInterval = setInterval(() => {
                    this.nextSlide();
                }, 4000);
            });
        }
    }

    /**
     * Ir al siguiente slide
     */
    nextSlide() {
        this.goToSlide((this.currentSlide + 1) % this.slides.length);
    }

    /**
     * Ir a un slide específico
     * @param {number} slideIndex - Índice del slide
     */
    goToSlide(slideIndex) {
        // Remove active class from current slide and indicator
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');

        // Set new current slide
        this.currentSlide = slideIndex;

        // Add active class to new slide and indicator
        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');
    }
    
    /**
     * Mostrar un panel específico (home, login, register)
     * @param {string} panelName - Nombre del panel a mostrar
     */
    showPanel(panelName) {
        // Ocultar todos los paneles y desactivar todas las tabs
        document.querySelectorAll('.login-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        document.querySelectorAll('.login-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Mostrar el panel seleccionado y activar su tab
        document.getElementById(`${panelName}Panel`).classList.add('active');
        document.getElementById(`${panelName}Tab`).classList.add('active');
        
        // Ocultar mensajes de error
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.style.display = 'none';
        });
    }
    
    /**
     * Manejar inicio de sesión
     * @returns {Promise<void>}
     */
    async handleLogin() {
        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        const spinner = document.getElementById('loginSpinner');
        const errorMessage = document.getElementById('loginError');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            this.showError('loginError', 'Por favor, completa todos los campos');
            return;
        }
        
        // Mostrar spinner
        spinner.style.display = 'inline-block';
        
        try {
            // Simular llamada al servidor
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mockear respuesta del servidor
            const response = username === 'test' && password === 'test' 
                ? AUTH_SERVER_RESPONSES.login.success 
                : AUTH_SERVER_RESPONSES.login.error;
            
            if (response.status === 200) {
                // Login exitoso
                this.token = response.data.token;
                this.user = response.data.user;
                
                // Guardar en localStorage
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('user_data', JSON.stringify(this.user));
                
                // Iniciar juego online
                this.startOnlineGame();
            } else {
                // Error en login
                this.showError('loginError', response.error);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            this.showError('loginError', 'Error al conectar con el servidor');
        } finally {
            // Ocultar spinner
            spinner.style.display = 'none';
        }
    }
    
    /**
     * Manejar registro de nuevo usuario
     * @returns {Promise<void>}
     */
    async handleRegister() {
        const usernameInput = document.getElementById('registerUsername');
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('registerConfirmPassword');
        const termsCheckbox = document.getElementById('registerTerms');
        const spinner = document.getElementById('registerSpinner');
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!username || !email || !password || !confirmPassword) {
            this.showError('registerError', 'Por favor, completa todos los campos');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('registerError', 'Las contraseñas no coinciden');
            return;
        }
        
        if (!termsCheckbox.checked) {
            this.showError('registerError', 'Debes aceptar los términos y condiciones');
            return;
        }
        
        // Mostrar spinner
        spinner.style.display = 'inline-block';
        
        try {
            // Simular llamada al servidor
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mockear respuesta del servidor
            const response = username !== 'admin' 
                ? AUTH_SERVER_RESPONSES.register.success 
                : AUTH_SERVER_RESPONSES.register.error;
            
            if (response.status === 201) {
                // Registro exitoso
                alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
                
                // Redirigir al login con los datos ya rellenados
                document.getElementById('loginUsername').value = username;
                document.getElementById('loginPassword').value = '';
                this.showPanel('login');
            } else {
                // Error en registro
                this.showError('registerError', response.error);
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            this.showError('registerError', 'Error al conectar con el servidor');
        } finally {
            // Ocultar spinner
            spinner.style.display = 'none';
        }
    }
    
    /**
     * Mostrar un mensaje de error
     * @param {string} elementId - ID del elemento de error
     * @param {string} message - Mensaje de error
     */
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Animar el error (shake)
        errorElement.classList.remove('visible');
        void errorElement.offsetWidth; // Truco para reiniciar la animación
        errorElement.classList.add('visible');
    }
    
    /**
     * Comprobar estado del servidor
     * @returns {Promise<void>}
     */
    async checkServerStatus() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('serverStatusText');
        
        try {
            // Simular llamada al servidor
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mockear respuesta del servidor (90% probabilidad de estar online)
            const response = Math.random() > 0.1 
                ? AUTH_SERVER_RESPONSES.serverStatus.online 
                : AUTH_SERVER_RESPONSES.serverStatus.offline;
            
            if (response.status === 200) {
                this.isServerOnline = true;
                statusIndicator.className = 'status-indicator status-online';
                statusText.textContent = `Servidor online - ${response.data.players} jugadores conectados`;
            } else {
                this.isServerOnline = false;
                statusIndicator.className = 'status-indicator status-offline';
                statusText.textContent = `Servidor offline - ${response.error}`;
                
                // Deshabilitar botón de juego online
                document.getElementById('playOnlineButton').disabled = true;
            }
        } catch (error) {
            console.error('Error al comprobar estado del servidor:', error);
            this.isServerOnline = false;
            statusIndicator.className = 'status-indicator status-offline';
            statusText.textContent = 'Error al conectar con el servidor';
            
            // Deshabilitar botón de juego online
            document.getElementById('playOnlineButton').disabled = true;
        }
    }
    
    /**
     * Iniciar juego en modo local
     */
    startLocalGame() {
        console.log('Iniciando juego en modo local');
        
        // Buscar el elemento de pantalla de login
        const loginScreen = document.getElementById('loginScreen');
        
        // Si existe la pantalla de login (no estamos saltándola con parámetros URL)
        if (loginScreen) {
            // Ocultar pantalla de login con una animación
            loginScreen.classList.add('hidden');
            
            // Eliminar después de la animación
            setTimeout(() => {
                loginScreen.remove();
                // Inicializar juego actual
                window.dispatchEvent(new Event('login-complete'));
            }, 500);
        } else {
            // Si no existe pantalla de login (estamos usando parámetros URL para saltarla)
            // Inicializar juego actual directamente
            window.dispatchEvent(new Event('login-complete'));
        }
    }
    
    /**
     * Iniciar juego en modo online
     */
    startOnlineGame() {
        console.log('Iniciando juego en modo online');
        console.log('Usuario autenticado:', this.user.username);
        
        // Verificar que el servidor esté online
        if (!this.isServerOnline) {
            alert('El servidor está offline. Por favor, inténtalo más tarde.');
            return;
        }
        
        // Aquí se conectaría con el servidor de WebSockets para el juego
        // Por ahora, simplemente iniciar el juego en modo local
        
        // Ocultar pantalla de login con una animación
        const loginScreen = document.getElementById('loginScreen');
        loginScreen.classList.add('hidden');
        
        // Eliminar después de la animación
        setTimeout(() => {
            loginScreen.remove();
            
            // Inicializar juego actual pero con el usuario logueado
            window.dispatchEvent(new CustomEvent('login-complete', {
                detail: {
                    online: true,
                    user: this.user,
                    token: this.token
                }
            }));
        }, 500);
    }
    
    /**
     * Cerrar sesión
     */
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Redireccionar a la pantalla de login
        window.location.reload();
    }
}

// Exportar instancia singleton
export const loginScreen = new LoginScreen();

// Exportar protocolo de autenticación para uso en otros módulos
export const AUTH_PROTOCOL_SPEC = AUTH_PROTOCOL;
