/**
 * CharacterManager.js
 * Sistema de gestión de personajes para Caloma Online
 * Maneja la creación, almacenamiento y carga de personajes
 */

/**
 * Razas disponibles
 */
export const RACES = {
    HUMAN: {
        id: 'human',
        name: 'Humano',
        description: 'Raza versátil y equilibrada',
        icon: '👤',
        stats: {
            strengthBonus: 0,
            dexterityBonus: 0,
            constitutionBonus: 0,
            intelligenceBonus: 0,
            charismaBonus: 0
        }
    },
    DWARF: {
        id: 'dwarf',
        name: 'Enano',
        description: 'Robusto y resistente, experto en minería',
        icon: '🧔',
        stats: {
            strengthBonus: 1,
            dexterityBonus: -1,
            constitutionBonus: 2,
            intelligenceBonus: 0,
            charismaBonus: -1
        },
        skillBonus: {
            MINING: 0.8,
            BLACKSMITHING: 0.8
        }
    },
    CREATURE: {
        id: 'creature',
        name: 'Criatura',
        description: 'Ser místico con afinidad mágica',
        icon: '🧙',
        stats: {
            strengthBonus: -1,
            dexterityBonus: 1,
            constitutionBonus: -1,
            intelligenceBonus: 2,
            charismaBonus: 0
        },
        skillBonus: {
            MAGIC: 0.8,
            MEDITATE: 0.8
        }
    }
};

/**
 * Géneros disponibles
 */
export const GENDERS = {
    MALE: { id: 'male', name: 'Masculino', icon: '♂️' },
    FEMALE: { id: 'female', name: 'Femenino', icon: '♀️' }
};

/**
 * Colores de túnica disponibles
 */
export const TUNIC_COLORS = {
    RED: { id: 'red', name: 'Rojo', hex: '#dc2626' },
    BLUE: { id: 'blue', name: 'Azul', hex: '#2563eb' },
    GREEN: { id: 'green', name: 'Verde', hex: '#16a34a' },
    YELLOW: { id: 'yellow', name: 'Amarillo', hex: '#ca8a04' },
    PURPLE: { id: 'purple', name: 'Púrpura', hex: '#9333ea' },
    ORANGE: { id: 'orange', name: 'Naranja', hex: '#ea580c' },
    PINK: { id: 'pink', name: 'Rosa', hex: '#ec4899' },
    BROWN: { id: 'brown', name: 'Marrón', hex: '#92400e' },
    BLACK: { id: 'black', name: 'Negro', hex: '#1f2937' },
    WHITE: { id: 'white', name: 'Blanco', hex: '#f3f4f6' }
};

/**
 * Colores de piel disponibles
 */
export const SKIN_COLORS = {
    LIGHT: { id: 'light', name: 'Clara', hex: '#fde68a' },
    MEDIUM: { id: 'medium', name: 'Media', hex: '#d4a373' },
    TAN: { id: 'tan', name: 'Morena', hex: '#a67c52' },
    DARK: { id: 'dark', name: 'Oscura', hex: '#6b4423' },
    GRAY: { id: 'gray', name: 'Gris', hex: '#9ca3af' },
    GREEN: { id: 'green', name: 'Verde', hex: '#84cc16' }
};

/**
 * Colores de cabello disponibles
 */
export const HAIR_COLORS = {
    BLACK: { id: 'black', name: 'Negro', hex: '#1f2937' },
    BROWN: { id: 'brown', name: 'Castaño', hex: '#92400e' },
    BLONDE: { id: 'blonde', name: 'Rubio', hex: '#fbbf24' },
    RED: { id: 'red', name: 'Pelirrojo', hex: '#dc2626' },
    WHITE: { id: 'white', name: 'Blanco', hex: '#f3f4f6' },
    GRAY: { id: 'gray', name: 'Gris', hex: '#6b7280' },
    BLUE: { id: 'blue', name: 'Azul', hex: '#3b82f6' },
    GREEN: { id: 'green', name: 'Verde', hex: '#16a34a' },
    PURPLE: { id: 'purple', name: 'Púrpura', hex: '#9333ea' }
};

/**
 * Estilos de cabello disponibles
 */
export const HAIR_STYLES = {
    SHORT: { id: 'short', name: 'Corto', icon: '✂️' },
    LONG: { id: 'long', name: 'Largo', icon: '💇' },
    BALD: { id: 'bald', name: 'Calvo', icon: '👨‍🦲' },
    PONYTAIL: { id: 'ponytail', name: 'Coleta', icon: '👱' },
    BRAIDS: { id: 'braids', name: 'Trenzas', icon: '👧' }
};

/**
 * Clase para gestionar personajes
 */
export class CharacterManager {
    constructor() {
        this.maxCharacters = 5;
        this.storageKey = 'caloma_characters';
        this.activeCharacterKey = 'caloma_active_character';
        this.usedNamesKey = 'caloma_used_names';
    }

    /**
     * Obtener todos los personajes del usuario actual
     * @returns {Array} Lista de personajes
     */
    getCharacters() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error al cargar personajes:', e);
            return [];
        }
    }

    /**
     * Obtener personaje activo
     * @returns {Object|null} Personaje activo o null
     */
    getActiveCharacter() {
        try {
            const stored = localStorage.getItem(this.activeCharacterKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Error al cargar personaje activo:', e);
            return null;
        }
    }

    /**
     * Establecer personaje activo
     * @param {Object} character - Personaje a activar
     */
    setActiveCharacter(character) {
        try {
            localStorage.setItem(this.activeCharacterKey, JSON.stringify(character));
        } catch (e) {
            console.error('Error al guardar personaje activo:', e);
        }
    }

    /**
     * Verificar si un nombre está disponible
     * @param {string} name - Nombre a verificar
     * @returns {boolean} True si está disponible
     */
    isNameAvailable(name) {
        const normalizedName = name.trim().toLowerCase();
        
        if (normalizedName.length < 3 || normalizedName.length > 20) {
            return false;
        }

        // Verificar caracteres válidos (letras, números, guiones)
        if (!/^[a-z0-9_-]+$/i.test(normalizedName)) {
            return false;
        }

        // Obtener nombres usados
        const usedNames = this.getUsedNames();
        return !usedNames.includes(normalizedName);
    }

    /**
     * Obtener todos los nombres usados
     * @returns {Array} Lista de nombres usados
     */
    getUsedNames() {
        try {
            const stored = localStorage.getItem(this.usedNamesKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error al cargar nombres usados:', e);
            return [];
        }
    }

    /**
     * Registrar nombre usado
     * @param {string} name - Nombre a registrar
     */
    registerUsedName(name) {
        try {
            const usedNames = this.getUsedNames();
            const normalizedName = name.trim().toLowerCase();
            
            if (!usedNames.includes(normalizedName)) {
                usedNames.push(normalizedName);
                localStorage.setItem(this.usedNamesKey, JSON.stringify(usedNames));
            }
        } catch (e) {
            console.error('Error al registrar nombre:', e);
        }
    }

    /**
     * Crear nuevo personaje
     * @param {Object} characterData - Datos del personaje
     * @returns {Object|null} Personaje creado o null si hay error
     */
    createCharacter(characterData) {
        try {
            const characters = this.getCharacters();

            // Verificar límite de personajes
            if (characters.length >= this.maxCharacters) {
                throw new Error(`Solo puedes tener ${this.maxCharacters} personajes`);
            }

            // Validar nombre
            if (!this.isNameAvailable(characterData.name)) {
                throw new Error('El nombre no está disponible');
            }

            // Crear personaje con ID único
            const character = {
                id: Date.now().toString(),
                name: characterData.name.trim(),
                class: characterData.class,
                race: characterData.race,
                gender: characterData.gender,
                appearance: {
                    tunicColor: characterData.tunicColor,
                    skinColor: characterData.skinColor,
                    hairColor: characterData.hairColor,
                    hairStyle: characterData.hairStyle
                },
                level: 1,
                experience: 0,
                createdAt: new Date().toISOString(),
                lastPlayed: new Date().toISOString()
            };

            // Guardar personaje
            characters.push(character);
            localStorage.setItem(this.storageKey, JSON.stringify(characters));

            // Registrar nombre
            this.registerUsedName(character.name);

            return character;
        } catch (e) {
            console.error('Error al crear personaje:', e);
            throw e;
        }
    }

    /**
     * Eliminar personaje
     * @param {string} characterId - ID del personaje a eliminar
     * @returns {boolean} True si se eliminó correctamente
     */
    deleteCharacter(characterId) {
        try {
            const characters = this.getCharacters();
            const index = characters.findIndex(c => c.id === characterId);
            
            if (index === -1) {
                throw new Error('Personaje no encontrado');
            }

            // Eliminar personaje
            const deletedCharacter = characters.splice(index, 1)[0];
            localStorage.setItem(this.storageKey, JSON.stringify(characters));

            // Si era el personaje activo, limpiar
            const activeChar = this.getActiveCharacter();
            if (activeChar && activeChar.id === characterId) {
                localStorage.removeItem(this.activeCharacterKey);
            }

            // Nota: NO eliminamos el nombre de usedNames para evitar conflictos
            // con personajes eliminados

            return true;
        } catch (e) {
            console.error('Error al eliminar personaje:', e);
            return false;
        }
    }

    /**
     * Actualizar datos del personaje
     * @param {string} characterId - ID del personaje
     * @param {Object} updates - Datos a actualizar
     * @returns {Object|null} Personaje actualizado o null si hay error
     */
    updateCharacter(characterId, updates) {
        try {
            const characters = this.getCharacters();
            const index = characters.findIndex(c => c.id === characterId);
            
            if (index === -1) {
                throw new Error('Personaje no encontrado');
            }

            // Actualizar personaje
            characters[index] = {
                ...characters[index],
                ...updates,
                lastPlayed: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(characters));

            // Si es el personaje activo, actualizar también
            const activeChar = this.getActiveCharacter();
            if (activeChar && activeChar.id === characterId) {
                this.setActiveCharacter(characters[index]);
            }

            return characters[index];
        } catch (e) {
            console.error('Error al actualizar personaje:', e);
            return null;
        }
    }

    /**
     * Obtener personaje por ID
     * @param {string} characterId - ID del personaje
     * @returns {Object|null} Personaje o null si no existe
     */
    getCharacterById(characterId) {
        const characters = this.getCharacters();
        return characters.find(c => c.id === characterId) || null;
    }

    /**
     * Limpiar todos los datos (solo para desarrollo/testing)
     */
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.activeCharacterKey);
        localStorage.removeItem(this.usedNamesKey);
    }
}

// Exportar instancia singleton
export const characterManager = new CharacterManager();