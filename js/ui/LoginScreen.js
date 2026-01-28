/**
 * LoginScreen.js
 * Gestión de la pantalla de inicio y autenticación para el juego
 */

import { characterManager, RACES, TUNIC_COLORS, SKIN_COLORS, HAIR_COLORS, HAIR_STYLES } from '../systems/CharacterManager.js';
import { CHARACTER_CLASSES } from '../systems/Classes.js';
import { generateCustomCharacterSprites } from '../graphics/sprites/CustomCharacterSprites.js';

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
        this.currentScreen = 'home'; // home, login, register, characters, createCharacter
        
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

                <!-- Panel de Selección de Personajes -->
                <div id="charactersPanel" class="login-panel">
                    <div class="characters-header">
                        <h2>Selecciona tu Personaje</h2>
                        <button id="logoutButton" class="logout-button">Cerrar Sesión</button>
                    </div>
                    <div id="charactersList" class="characters-list">
                        <!-- Se llenará dinámicamente -->
                    </div>
                </div>

                <!-- Panel de Creación de Personaje -->
                <div id="createCharacterPanel" class="login-panel">
                    <div class="create-character-header">
                        <button id="backToCharacters" class="back-button">← Volver</button>
                        <h2>Crear Personaje</h2>
                    </div>
                    
                    <div id="createCharacterError" class="error-message"></div>
                    
                    <!-- Sección fija: Nombre, Preview y Botón -->
                    <div class="fixed-creation-section">
                        <!-- Nombre -->
                        <div class="form-section">
                            <label>Nombre del Personaje</label>
                            <input type="text" id="characterName" class="auth-input" placeholder="Nombre (3-20 caracteres)" required>
                            <small>Solo letras, números, guiones y guiones bajos</small>
                        </div>

                        <!-- Preview del personaje - SIEMPRE VISIBLE -->
                        <div class="form-section">
                            <label>Vista Previa</label>
                            <div id="characterPreview" class="character-preview">
                                <div class="preview-placeholder">
                                    Configura tu personaje para ver una vista previa
                                </div>
                            </div>
                        </div>

                        <!-- Botón Crear Personaje -->
                        <button type="button" id="createCharacterSubmit" class="submit-button">
                            Crear Personaje
                            <span id="createCharacterSpinner" class="spinner" style="display: none;"></span>
                        </button>
                    </div>

                    <!-- Sección con scroll: Opciones de personalización -->
                    <form id="createCharacterForm" class="create-character-form-scrollable">
                        <!-- Profesión/Clase -->
                        <div class="form-section">
                            <label>Profesión</label>
                            <div id="classesList" class="options-grid">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>

                        <!-- Raza -->
                        <div class="form-section">
                            <label>Raza</label>
                            <div id="racesList" class="options-grid">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>

                        <!-- Apariencia -->
                        <div class="form-section">
                            <label>Apariencia</label>
                            
                            <div class="appearance-subsection">
                                <label>Color de Túnica</label>
                                <div id="tunicColorsList" class="color-options">
                                    <!-- Se llenará dinámicamente -->
                                </div>
                            </div>

                            <div class="appearance-subsection">
                                <label>Color de Piel</label>
                                <div id="skinColorsList" class="color-options">
                                    <!-- Se llenará dinámicamente -->
                                </div>
                            </div>

                            <div class="appearance-subsection">
                                <label>Color de Cabello</label>
                                <div id="hairColorsList" class="color-options">
                                    <!-- Se llenará dinámicamente -->
                                </div>
                            </div>

                            <div class="appearance-subsection">
                                <label>Estilo de Cabello</label>
                                <div id="hairStylesList" class="options-grid small">
                                    <!-- Se llenará dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </form>
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
                this.showCharacterSelection();
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

        // Botón de logout
        document.getElementById('logoutButton').addEventListener('click', () => this.logout());

        // Botón volver desde crear personaje
        document.getElementById('backToCharacters').addEventListener('click', () => this.showCharacterSelection());

        // Botón de crear personaje (ahora está fuera del form)
        // Note: El botón se inicializará después de renderizar el formulario
        
        // Formulario de crear personaje (ya no tiene submit porque el botón está fuera)
        const createForm = document.getElementById('createCharacterForm');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }
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
     * Mostrar un panel específico (home, login, register, characters, createCharacter)
     * @param {string} panelName - Nombre del panel a mostrar
     */
    showPanel(panelName) {
        this.currentScreen = panelName;

        // Ocultar todos los paneles y desactivar todas las tabs
        document.querySelectorAll('.login-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        document.querySelectorAll('.login-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Mostrar el panel seleccionado y activar su tab si existe
        const panel = document.getElementById(`${panelName}Panel`);
        if (panel) {
            panel.classList.add('active');
        }

        const tab = document.getElementById(`${panelName}Tab`);
        if (tab) {
            tab.classList.add('active');
        }
        
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
                
                // Mostrar selección de personajes
                this.showCharacterSelection();
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
                this.showNotification('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');
                
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
     * Mostrar pantalla de selección de personajes
     */
    showCharacterSelection() {
        // Ocultar las tabs de login y registro cuando el usuario está autenticado
        const loginTabs = document.querySelector('.login-tabs');
        if (loginTabs) {
            loginTabs.style.display = 'none';
        }
        
        this.showPanel('characters');
        this.renderCharactersList();
    }

    /**
     * Renderizar lista de personajes
     */
    renderCharactersList() {
        const charactersList = document.getElementById('charactersList');
        const characters = characterManager.getCharacters();

        let html = '';

        // Botón para crear nuevo personaje
        if (characters.length < characterManager.maxCharacters) {
            html += `
                <div class="character-slot create-new" id="createNewCharacter">
                    <div class="create-icon">+</div>
                    <div class="create-text">Crear Nuevo Personaje</div>
                </div>
            `;
        }

        // Personajes existentes
        characters.forEach((char, index) => {
            const classData = CHARACTER_CLASSES[char.class.toUpperCase()];
            const raceData = RACES[char.race.toUpperCase()];
            const canvasId = `charCanvas${index}`;
            
            html += `
                <div class="character-slot" data-character-id="${char.id}">
                    <div class="character-info">
                        <div class="character-avatar">
                            <canvas id="${canvasId}" width="32" height="32" class="character-sprite-preview"></canvas>
                        </div>
                        <div class="character-details">
                            <h3>${char.name}</h3>
                            <p class="character-class">${classData.name} ${classData.icon} - ${raceData.name} ${raceData.icon}</p>
                            <p class="character-level">Nivel ${char.level}</p>
                            <p class="character-date">Última vez: ${this.formatDate(char.lastPlayed)}</p>
                        </div>
                    </div>
                    <div class="character-actions">
                        <button class="play-button" data-character-id="${char.id}">Jugar</button>
                        <button class="delete-button" data-character-id="${char.id}">Eliminar</button>
                    </div>
                </div>
            `;
        });

        // Slots vacíos
        for (let i = characters.length; i < characterManager.maxCharacters; i++) {
            if (i > 0 || characters.length > 0) { // No mostrar slots vacíos si ya hay el botón de crear
                html += `
                    <div class="character-slot empty">
                        <div class="empty-text">Slot vacío</div>
                    </div>
                `;
            }
        }

        charactersList.innerHTML = html;

        // Eventos
        const createButton = document.getElementById('createNewCharacter');
        if (createButton) {
            createButton.addEventListener('click', () => this.showCreateCharacter());
        }

        document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const characterId = e.target.dataset.characterId;
                this.playWithCharacter(characterId);
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const characterId = e.target.dataset.characterId;
                this.deleteCharacter(characterId);
            });
        });

        // Renderizar sprites de personajes
        characters.forEach((char, index) => {
            const canvasId = `charCanvas${index}`;
            const canvas = document.getElementById(canvasId);
            if (canvas && char.appearance) {
                const ctx = canvas.getContext('2d');
                const TILE_SIZE = 32;
                
                const appearance = {
                    race: char.race,
                    skinColor: char.appearance.skinColor,
                    tunicColor: char.appearance.tunicColor
                };
                
                const sprites = generateCustomCharacterSprites(appearance, TILE_SIZE);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(sprites.player, 0, 0);
            }
        });
    }

    /**
     * Mostrar pantalla de creación de personaje
     */
    showCreateCharacter() {
        this.showPanel('createCharacter');
        this.renderCreateCharacterForm();
    }

    /**
     * Renderizar formulario de creación de personaje
     */
    renderCreateCharacterForm() {
        // Renderizar clases
        const classesList = document.getElementById('classesList');
        let classesHTML = '';
        Object.values(CHARACTER_CLASSES).forEach(classData => {
            classesHTML += `
                <div class="option-card" data-type="class" data-value="${classData.id}">
                    <div class="option-icon">${classData.icon}</div>
                    <div class="option-name">${classData.name}</div>
                    <div class="option-description">${classData.description}</div>
                </div>
            `;
        });
        classesList.innerHTML = classesHTML;

        // Renderizar razas
        const racesList = document.getElementById('racesList');
        let racesHTML = '';
        Object.values(RACES).forEach(race => {
            racesHTML += `
                <div class="option-card" data-type="race" data-value="${race.id}">
                    <div class="option-icon">${race.icon}</div>
                    <div class="option-name">${race.name}</div>
                    <div class="option-description">${race.description}</div>
                </div>
            `;
        });
        racesList.innerHTML = racesHTML;

        // Renderizar colores de túnica
        const tunicColorsList = document.getElementById('tunicColorsList');
        let tunicColorsHTML = '';
        Object.values(TUNIC_COLORS).forEach(color => {
            tunicColorsHTML += `
                <div class="color-option" data-type="tunicColor" data-value="${color.id}" 
                     style="background-color: ${color.hex}" title="${color.name}">
                </div>
            `;
        });
        tunicColorsList.innerHTML = tunicColorsHTML;

        // Renderizar colores de piel
        const skinColorsList = document.getElementById('skinColorsList');
        let skinColorsHTML = '';
        Object.values(SKIN_COLORS).forEach(color => {
            skinColorsHTML += `
                <div class="color-option" data-type="skinColor" data-value="${color.id}" 
                     style="background-color: ${color.hex}" title="${color.name}">
                </div>
            `;
        });
        skinColorsList.innerHTML = skinColorsHTML;

        // Renderizar colores de cabello
        const hairColorsList = document.getElementById('hairColorsList');
        let hairColorsHTML = '';
        Object.values(HAIR_COLORS).forEach(color => {
            hairColorsHTML += `
                <div class="color-option" data-type="hairColor" data-value="${color.id}" 
                     style="background-color: ${color.hex}" title="${color.name}">
                </div>
            `;
        });
        hairColorsList.innerHTML = hairColorsHTML;

        // Renderizar estilos de cabello
        const hairStylesList = document.getElementById('hairStylesList');
        let hairStylesHTML = '';
        Object.values(HAIR_STYLES).forEach(style => {
            hairStylesHTML += `
                <div class="option-card small" data-type="hairStyle" data-value="${style.id}">
                    <div class="option-icon">${style.icon}</div>
                    <div class="option-name">${style.name}</div>
                </div>
            `;
        });
        hairStylesList.innerHTML = hairStylesHTML;

        // Inicializar estado de selección
        this.characterCreationData = {
            name: '',
            class: null,
            race: null,
            tunicColor: null,
            skinColor: null,
            hairColor: null,
            hairStyle: null
        };

        // Eventos de selección
        this.initCharacterCreationEvents();
    }

    /**
     * Inicializar eventos del formulario de creación de personaje
     */
    initCharacterCreationEvents() {
        // Eventos para opciones de clase, raza, género
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                const value = card.dataset.value;

                // Quitar selección anterior del mismo tipo
                document.querySelectorAll(`.option-card[data-type="${type}"]`).forEach(c => {
                    c.classList.remove('selected');
                });

                // Marcar como seleccionado
                card.classList.add('selected');

                // Guardar selección
                this.characterCreationData[type] = value;

                // Actualizar preview
                this.updateCharacterPreview();
            });
        });

        // Eventos para colores
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                const type = option.dataset.type;
                const value = option.dataset.value;

                // Quitar selección anterior del mismo tipo
                document.querySelectorAll(`.color-option[data-type="${type}"]`).forEach(o => {
                    o.classList.remove('selected');
                });

                // Marcar como seleccionado
                option.classList.add('selected');

                // Guardar selección
                this.characterCreationData[type] = value;

                // Actualizar preview
                this.updateCharacterPreview();
            });
        });

        // Evento para nombre
        document.getElementById('characterName').addEventListener('input', (e) => {
            this.characterCreationData.name = e.target.value;
        });

        // Evento para el botón de crear personaje (está fuera del form)
        const createButton = document.getElementById('createCharacterSubmit');
        if (createButton) {
            createButton.addEventListener('click', () => {
                this.handleCreateCharacter();
            });
        }
    }

    /**
     * Actualizar vista previa del personaje
     */
    updateCharacterPreview() {
        const preview = document.getElementById('characterPreview');
        const data = this.characterCreationData;

        // Verificar que se hayan seleccionado los campos necesarios
        if (!data.class || !data.race || !data.tunicColor || !data.skinColor) {
            preview.innerHTML = '<div class="preview-placeholder">Configura tu personaje para ver una vista previa</div>';
            return;
        }

        const classData = CHARACTER_CLASSES[data.class.toUpperCase()];
        const raceData = RACES[data.race.toUpperCase()];
        const tunicColor = TUNIC_COLORS[data.tunicColor.toUpperCase()];
        const skinColor = SKIN_COLORS[data.skinColor.toUpperCase()];

        // Generar sprite personalizado
        const TILE_SIZE = 48; // Tamaño más grande para vista previa
        const appearance = {
            race: data.race,
            skinColor: data.skinColor,
            tunicColor: data.tunicColor
        };
        
        const sprites = generateCustomCharacterSprites(appearance, TILE_SIZE);

        preview.innerHTML = `
            <div class="character-preview-display">
                <div class="preview-sprite-container">
                    <canvas id="previewCanvas" width="${TILE_SIZE}" height="${TILE_SIZE}"></canvas>
                </div>
                <div class="preview-info">
                    <h3>${data.name || 'Tu Personaje'}</h3>
                    <p><strong>Clase:</strong> ${classData.name} ${classData.icon}</p>
                    <p><strong>Raza:</strong> ${raceData.name} ${raceData.icon}</p>
                </div>
                <div class="preview-appearance">
                    <div class="appearance-item">
                        <span>Túnica:</span>
                        <div class="color-square" style="background-color: ${tunicColor.hex}"></div>
                        <span>${tunicColor.name}</span>
                    </div>
                    <div class="appearance-item">
                        <span>Piel:</span>
                        <div class="color-square" style="background-color: ${skinColor.hex}"></div>
                        <span>${skinColor.name}</span>
                    </div>
                </div>
            </div>
        `;

        // Renderizar el sprite en el canvas
        const canvas = document.getElementById('previewCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sprites.player, 0, 0);
    }

    /**
     * Manejar creación de personaje
     */
    async handleCreateCharacter() {
        const data = this.characterCreationData;
        const spinner = document.getElementById('createCharacterSpinner');

        // Validar datos
        if (!data.name || data.name.length < 3 || data.name.length > 20) {
            this.showError('createCharacterError', 'El nombre debe tener entre 3 y 20 caracteres');
            return;
        }

        if (!data.class) {
            this.showError('createCharacterError', 'Debes seleccionar una profesión');
            return;
        }

        if (!data.race) {
            this.showError('createCharacterError', 'Debes seleccionar una raza');
            return;
        }

        if (!data.tunicColor) {
            this.showError('createCharacterError', 'Debes seleccionar un color de túnica');
            return;
        }

        if (!data.skinColor) {
            this.showError('createCharacterError', 'Debes seleccionar un color de piel');
            return;
        }

        if (!data.hairColor) {
            this.showError('createCharacterError', 'Debes seleccionar un color de cabello');
            return;
        }

        if (!data.hairStyle) {
            this.showError('createCharacterError', 'Debes seleccionar un estilo de cabello');
            return;
        }

        // Verificar nombre disponible
        if (!characterManager.isNameAvailable(data.name)) {
            this.showError('createCharacterError', 'El nombre no está disponible o no es válido');
            return;
        }

        // Mostrar spinner
        spinner.style.display = 'inline-block';

        try {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Crear personaje
            const character = characterManager.createCharacter(data);

            // Éxito
            this.showNotification(`¡Personaje ${character.name} creado exitosamente!`, 'success');
            
            // Volver a la selección de personajes
            this.showCharacterSelection();
        } catch (error) {
            this.showError('createCharacterError', error.message);
        } finally {
            spinner.style.display = 'none';
        }
    }

    /**
     * Jugar con un personaje
     * @param {string} characterId - ID del personaje
     */
    playWithCharacter(characterId) {
        const character = characterManager.getCharacterById(characterId);
        
        if (!character) {
            this.showNotification('Error: Personaje no encontrado', 'error');
            return;
        }

        // Establecer como personaje activo
        characterManager.setActiveCharacter(character);

        // Actualizar última vez jugado
        characterManager.updateCharacter(characterId, {
            lastPlayed: new Date().toISOString()
        });

        // Iniciar juego online
        this.startOnlineGame();
    }

    /**
     * Eliminar personaje
     * @param {string} characterId - ID del personaje
     */
    async deleteCharacter(characterId) {
        const character = characterManager.getCharacterById(characterId);
        
        if (!character) {
            this.showNotification('Error: Personaje no encontrado', 'error');
            return;
        }

        const confirmed = await this.showConfirm(`¿Estás seguro de que quieres eliminar a <strong>${character.name}</strong>?<br><small>Esta acción no se puede deshacer.</small>`);
        
        if (confirmed) {
            const success = characterManager.deleteCharacter(characterId);
            
            if (success) {
                this.showNotification(`Personaje ${character.name} eliminado`, 'info');
                this.renderCharactersList();
            } else {
                this.showNotification('Error al eliminar personaje', 'error');
            }
        }
    }

    /**
     * Formatear fecha
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('es-ES');
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
     * Mostrar notificación tipo toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info, warning)
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = {
            success: '✓',
            error: '✗',
            info: 'ℹ',
            warning: '⚠'
        }[type] || '✓';
        
        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Mostrar diálogo de confirmación personalizado
     * @param {string} message - Mensaje de confirmación
     * @returns {Promise<boolean>} True si el usuario confirma, false si cancela
     */
    showConfirm(message) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'custom-dialog-overlay';
            
            dialog.innerHTML = `
                <div class="custom-dialog">
                    <div class="custom-dialog-icon">⚠️</div>
                    <div class="custom-dialog-message">${message}</div>
                    <div class="custom-dialog-buttons">
                        <button class="dialog-button dialog-button-cancel">Cancelar</button>
                        <button class="dialog-button dialog-button-confirm">Confirmar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            // Animar entrada
            setTimeout(() => dialog.classList.add('show'), 10);
            
            // Eventos de los botones
            const cancelBtn = dialog.querySelector('.dialog-button-cancel');
            const confirmBtn = dialog.querySelector('.dialog-button-confirm');
            
            const close = (result) => {
                dialog.classList.remove('show');
                setTimeout(() => {
                    dialog.remove();
                    resolve(result);
                }, 300);
            };
            
            cancelBtn.addEventListener('click', () => close(false));
            confirmBtn.addEventListener('click', () => close(true));
            
            // Cerrar con ESC
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    close(false);
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        });
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
        
        // Mostrar UI del juego
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
        
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
        console.log('Usuario autenticado:', this.user?.username);
        
        // Obtener personaje activo
        const character = characterManager.getActiveCharacter();
        console.log('Personaje seleccionado:', character?.name);
        
        // Verificar que el servidor esté online
        if (!this.isServerOnline) {
            alert('El servidor está offline. Por favor, inténtalo más tarde.');
            return;
        }
        
        // Mostrar UI del juego
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
        
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
                    character: character,
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
        
        // Mostrar las tabs de login y registro de nuevo
        const loginTabs = document.querySelector('.login-tabs');
        if (loginTabs) {
            loginTabs.style.display = 'flex';
        }
        
        // Volver al panel de inicio
        this.showPanel('home');
    }
}

// Exportar instancia singleton
export const loginScreen = new LoginScreen();
