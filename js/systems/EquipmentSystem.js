/**
 * EquipmentSystem.js
 * Sistema de gestión de equipamiento visual
 * Maneja qué equipo tiene cada personaje y cómo se renderiza en capas
 */

/**
 * Estructura de equipamiento visual
 * Cada personaje puede tener:
 * - armor: Túnica/Armadura (Layer 2)
 * - helmet: Casco/Capucha (Layer 3)
 * - weapon: Arma (Layer 4)
 * - shield: Escudo (Layer 5)
 */

/**
 * Mapeo de clases a equipamiento por defecto
 */
const CLASS_EQUIPMENT_DEFAULTS = {
    'Guerrero': {
        armor: 'armorPlate',
        helmet: 'helmetFull',
        weapon: 'weaponSwordLong',
        shield: 'shieldLarge'
    },
    'Mago': {
        armor: 'armorRobeLightBlue',
        helmet: 'helmetHood',
        weapon: 'weaponStaff',
        shield: null
    },
    'Arquero': {
        armor: 'armorLeather',
        helmet: 'helmetLight',
        weapon: 'weaponBow',
        shield: null
    },
    'Clérigo': {
        armor: 'armorCleric',
        helmet: 'helmetCrown',
        weapon: 'weaponHammer',
        shield: 'shieldSmall'
    },
    'Asesino': {
        armor: 'armorLeatherDark',
        helmet: 'helmetHoodBrown',
        weapon: 'weaponDagger',
        shield: null
    },
    'Paladín': {
        armor: 'armorPlateGold',
        helmet: 'helmetFullGold',
        weapon: 'weaponSwordLong',
        shield: 'shieldLarge'
    }
};

/**
 * Obtiene el equipamiento visual por defecto para una clase
 * @param {string} className - Nombre de la clase
 * @returns {object} Equipamiento visual
 */
export function getDefaultEquipmentForClass(className) {
    return CLASS_EQUIPMENT_DEFAULTS[className] || {
        armor: null,
        helmet: null,
        weapon: 'weaponSwordShort',
        shield: 'shieldWooden'
    };
}

/**
 * Obtiene equipamiento aleatorio para una clase específica
 * @param {string} className - Nombre de la clase
 * @returns {object} Equipamiento visual
 */
export function getRandomEquipmentForClass(className) {
    const defaults = CLASS_EQUIPMENT_DEFAULTS[className];
    
    if (!defaults) {
        return getDefaultEquipmentForClass(className);
    }
    
    // Agregar algo de variación aleatoria
    const variations = {
        'Guerrero': [
            { armor: 'armorPlate', helmet: 'helmetFull', weapon: 'weaponSwordLong', shield: 'shieldLarge' },
            { armor: 'armorPlateGold', helmet: 'helmetFullGold', weapon: 'weaponSwordLong', shield: 'shieldLarge' },
            { armor: 'armorPlate', helmet: 'helmetFull', weapon: 'weaponHammer', shield: 'shieldLarge' }
        ],
        'Mago': [
            { armor: 'armorRobeLightBlue', helmet: 'helmetHood', weapon: 'weaponStaff', shield: null },
            { armor: 'armorRobeDark', helmet: 'helmetHood', weapon: 'weaponStaff', shield: null }
        ],
        'Arquero': [
            { armor: 'armorLeather', helmet: 'helmetLight', weapon: 'weaponBow', shield: null },
            { armor: 'armorLeather', helmet: null, weapon: 'weaponBow', shield: null }
        ],
        'Clérigo': [
            { armor: 'armorCleric', helmet: 'helmetCrown', weapon: 'weaponHammer', shield: 'shieldSmall' },
            { armor: 'armorCleric', helmet: 'helmetCrown', weapon: 'weaponStaff', shield: null }
        ],
        'Asesino': [
            { armor: 'armorLeatherDark', helmet: 'helmetHoodBrown', weapon: 'weaponDagger', shield: null },
            { armor: 'armorLeatherDark', helmet: 'helmetHood', weapon: 'weaponDagger', shield: null }
        ],
        'Paladín': [
            { armor: 'armorPlateGold', helmet: 'helmetFullGold', weapon: 'weaponSwordLong', shield: 'shieldLarge' },
            { armor: 'armorPlateGold', helmet: 'helmetFullGold', weapon: 'weaponHammer', shield: 'shieldLarge' }
        ]
    };
    
    const classVariations = variations[className] || [defaults];
    return classVariations[Math.floor(Math.random() * classVariations.length)];
}

/**
 * Renderiza el equipamiento de un personaje en capas
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {object} screenPos - Posición en pantalla {x, y}
 * @param {object} equipment - Equipamiento del personaje
 * @param {object} sprites - Objeto con todos los sprites
 */
export function renderEquipmentLayers(ctx, screenPos, equipment, sprites) {
    if (!equipment) return;
    
    // Layer 2: Armadura/Ropa (sobre cuerpo)
    if (equipment.armor && sprites[equipment.armor]) {
        ctx.drawImage(sprites[equipment.armor], screenPos.x, screenPos.y);
    }
    
    // Layer 3: Casco (sobre cabeza)
    if (equipment.helmet && sprites[equipment.helmet]) {
        ctx.drawImage(sprites[equipment.helmet], screenPos.x, screenPos.y);
    }
    
    // Layer 4: Arma (en mano)
    if (equipment.weapon && sprites[equipment.weapon]) {
        ctx.drawImage(sprites[equipment.weapon], screenPos.x, screenPos.y);
    }
    
    // Layer 5: Escudo (mano opuesta)
    if (equipment.shield && sprites[equipment.shield]) {
        ctx.drawImage(sprites[equipment.shield], screenPos.x, screenPos.y);
    }
}

/**
 * Obtiene el equipamiento visual desde el inventario del jugador
 * @param {object} player - Objeto jugador con inventario y equipped
 * @returns {object} Equipamiento visual para renderizar
 */
export function getPlayerVisualEquipment(player) {
    if (!player.equipped) {
        return {
            armor: null,
            helmet: null,
            weapon: null,
            shield: null
        };
    }
    
    // Mapear items equipados a sprites visuales
    const equipment = {
        armor: null,
        helmet: null,
        weapon: null,
        shield: null
    };
    
    // Armadura corporal equipada (slot 'body')
    if (player.equipped.body) {
        equipment.armor = mapItemToVisualSprite(player.equipped.body, 'armor');
    }
    
    // Casco equipado (slot 'head')
    if (player.equipped.head) {
        equipment.helmet = mapItemToVisualSprite(player.equipped.head, 'helmet');
    }
    
    // Arma equipada
    if (player.equipped.weapon) {
        equipment.weapon = mapItemToVisualSprite(player.equipped.weapon, 'weapon');
    }
    
    // Escudo equipado
    if (player.equipped.shield) {
        equipment.shield = mapItemToVisualSprite(player.equipped.shield, 'shield');
    }
    
    return equipment;
}

/**
 * Mapea un item del inventario a su sprite visual correspondiente
 * @param {string} itemType - Tipo de item del inventario
 * @param {string} category - Categoría (weapon, shield, armor, helmet)
 * @returns {string|null} Nombre del sprite visual
 */
function mapItemToVisualSprite(itemType, category) {
    // Mapeo de items del inventario a sprites visuales
    const mappings = {
        weapon: {
            'SWORD': 'weaponSwordShort',
            'SWORD_IRON': 'weaponSwordLong',
            'BOW': 'weaponBow',
            'BOW_ELVEN': 'weaponBow'
        },
        shield: {
            'SHIELD': 'shieldLarge',
            'SHIELD_IRON': 'shieldLarge'
        },
        armor: {
            'ARMOR_LEATHER': 'armorLeather',
            'ARMOR_PLATE': 'armorPlate',
            'ARMOR_PLATE_GOLD': 'armorPlateGold',
            'ROBE_MAGE': 'armorRobeLightBlue'
        },
        helmet: {
            'HELMET_LEATHER': 'helmetLight',
            'HELMET_FULL': 'helmetFull',
            'HELMET_GOLD': 'helmetFullGold',
            'HOOD_MAGE': 'helmetHood'
        }
    };
    
    return mappings[category]?.[itemType] || null;
}

/**
 * Crea equipo visual aleatorio para un bot basado en su clase
 * @param {string} className - Clase del bot
 * @returns {object} Equipamiento visual
 */
export function createBotEquipment(className) {
    return getRandomEquipmentForClass(className);
}
