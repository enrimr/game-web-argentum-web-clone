/**
 * manual-init.js
 * Inicialización del manual: sprites, minimapas y mapa mundi
 */

import { itemSprites, npcSprites, enemySprites } from './sprite-generator.js';
import { mapData, zoneCategories, zoneColors } from './map-data.js';
import { classData, classCategories, beginnersClasses, advancedClasses } from './class-data.js';
import { skillsData, skillCategories, probabilityTable, expRequirements } from './skills-data.js';
import { weaponsData, armorsData, helmetsData, consumablesData, spellBooksData, resourcesData, npcsData, itemCategories } from './items-data.js';

// Mapeo de emojis a sprites
const emojiToSpriteMap = {
    // Items
    '⚔️': () => itemSprites.sword(32),
    '🗡️': () => itemSprites.sword(32),
    '🏹': () => itemSprites.bow(32),
    '🛡️': (context) => context === 'npc' ? npcSprites.guard(32) : itemSprites.shield(32),
    '🔰': () => itemSprites.shield(32),
    '🦺': () => itemSprites.armor(32),
    '✨': () => itemSprites.armor(32),
    '👘': () => itemSprites.robe(32),
    '🪖': () => itemSprites.helmet(32),
    '⛑️': () => itemSprites.helmet(32),
    '👑': () => itemSprites.helmet(32),
    '🧪': () => itemSprites.potion(32),
    '💧': () => itemSprites.potionBlue(32),
    '🍀': () => itemSprites.potionGreen(32),
    '📖': () => itemSprites.spellbook(32),
    '📕': () => itemSprites.spellbook(32),
    '📗': () => itemSprites.spellbook(32),
    '📘': () => itemSprites.spellbook(32),
    '📙': () => itemSprites.spellbook(32),
    '📜': () => itemSprites.scroll(32),
    '🧾': () => itemSprites.scroll(32),
    '🔮': () => itemSprites.spellbook(32),
    '🔥': () => itemSprites.spellbook(32),
    '⚡': () => itemSprites.spellbook(32),
    '💚': () => itemSprites.potionGreen(32),
    '💉': () => itemSprites.potionGreen(32),
    '💪': () => itemSprites.scroll(32),
    '🧊': () => itemSprites.scroll(32),
    '☠️': () => itemSprites.scroll(32),
    
    // NPCs
    '🏪': () => npcSprites.merchant(32),
    '🔨': () => npcSprites.blacksmith(32),
    '🪓': () => npcSprites.carpenter(32),
    '🧙': () => npcSprites.mage(32),
    '🧘': () => npcSprites.mage(32),
    '🏦': () => npcSprites.banker(32),
    '⚕️': () => npcSprites.healer(32),
    '🎯': () => npcSprites.trainer(32),
    '🧪': () => npcSprites.alchemist(32)
};

// Inicializar sprites en iconos
function initializeSprites() {
    document.querySelectorAll('.icon').forEach(icon => {
        const text = icon.textContent.trim();
        const parentSection = icon.closest('section');
        const context = parentSection?.id === 'npcs' ? 'npc' : 'item';
        
        const spriteGen = emojiToSpriteMap[text];
        if (spriteGen) {
            const sprite = typeof spriteGen === 'function' 
                ? (context === 'npc' && text === '🛡️' ? spriteGen(context) : spriteGen())
                : spriteGen;
            
            if (sprite) {
                icon.textContent = '';
                icon.appendChild(sprite);
            }
        }
    });

    // Reemplazar emojis en las tablas de enemigos
    document.querySelectorAll('table tbody tr td:first-child').forEach(cell => {
        const text = cell.textContent.trim();
        let spriteGen = null;
        const size = 24;
        
        // Mapeo de nombres a sprites
        const nameToSprite = {
            'Murciélago': () => enemySprites.bat(size),
            'Slime': () => enemySprites.slime(size),
            'Bandido': () => enemySprites.bandit(size),
            'Esqueleto': () => enemySprites.skeleton(size),
            'Araña': () => enemySprites.spider(size),
            'Goblin': () => enemySprites.goblin(size),
            'Lobo': () => enemySprites.wolf(size),
            'Cabra Montesa': () => enemySprites.goat(size),
            'Orco': () => enemySprites.orc(size),
            'Elemental': () => enemySprites.elemental(size),
            'Demonio': () => enemySprites.demon(size),
            'Oso': () => enemySprites.bear(size),
            'Troll de Cueva': () => enemySprites.caveTroll(size),
            'Troll de Montaña': () => enemySprites.mountainTroll(size),
            'Troll': () => enemySprites.troll(size),
            'Gólem': () => enemySprites.golem(size),
            'Guardián': () => enemySprites.guardian(size),
            'Dragón': () => enemySprites.dragon(size),
            'Gigante': () => enemySprites.giant(size)
        };
        
        // Buscar coincidencia
        for (const [name, generator] of Object.entries(nameToSprite)) {
            if (text.includes(name)) {
                spriteGen = generator;
                break;
            }
        }
        
        if (spriteGen) {
            const sprite = spriteGen();
            const nameMatch = text.match(/\s+(.+)$/);
            const name = nameMatch ? nameMatch[1] : text;
            
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.gap = '10px';
            
            container.appendChild(sprite);
            const textSpan = document.createElement('span');
            textSpan.textContent = name;
            container.appendChild(textSpan);
            
            cell.textContent = '';
            cell.appendChild(container);
        }
    });
}

// Crear minimapa para una zona
function createMinimap(mapId, size = 80) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.className = 'minimap-preview';
    canvas.style.imageRendering = 'pixelated';
    
    const ctx = canvas.getContext('2d');
    const mapInfo = mapData[mapId];
    
    if (!mapInfo) return null;
    
    // Color de fondo según tipo de zona
    const bgColor = zoneColors[mapInfo.zone] || '#374151';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Añadir patrón para diferenciar zonas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < size; i += 10) {
        for (let j = 0; j < size; j += 10) {
            if ((i + j) % 20 === 0) {
                ctx.fillRect(i, j, 5, 5);
            }
        }
    }
    
    // Marcar entrada de mazmorra si aplica
    if (mapInfo.isDungeon) {
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(size/2 - 10, size/2 - 10, 20, 20);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(size/2 - 5, size/2 - 5, 10, 10);
    }
    
    // Borde
    ctx.strokeStyle = '#53a8b6';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);
    
    return canvas;
}

// Insertar minimapas en items de mapa
function insertMinimaps() {
    document.querySelectorAll('.map-item').forEach(item => {
        const mapName = item.querySelector('.map-name')?.textContent;
        if (!mapName) return;
        
        // Buscar mapId correspondiente
        let mapId = null;
        for (const [id, data] of Object.entries(mapData)) {
            if (data.name === mapName) {
                mapId = id;
                break;
            }
        }
        
        if (mapId) {
            const minimap = createMinimap(mapId);
            if (minimap) {
                item.insertBefore(minimap, item.firstChild);
            }
        }
    });
}

// Crear mapa mundi completo
function createWorldMap() {
    const container = document.querySelector('.world-map-container');
    if (!container) return;
    
    const canvas = document.createElement('canvas');
    canvas.className = 'world-map-canvas';
    const scale = 60; // Tamaño de cada celda del mapa
    
    // Calcular posiciones de los mapas en un layout lógico
    const positions = {
        newbie_city: { x: 2, y: 4 },
        training_fields: { x: 2, y: 3 },
        forest_outskirts_1: { x: 2, y: 2 },
        forest_outskirts_2: { x: 3, y: 2 },
        forest_outskirts_3: { x: 4, y: 2 },
        dark_forest_north: { x: 4, y: 1 },
        dark_forest_center: { x: 5, y: 1 },
        dark_forest_east: { x: 6, y: 1 },
        dark_forest_south: { x: 5, y: 2 },
        forest_cave: { x: 5, y: 0 },
        mountain_pass_lower: { x: 6, y: 2 },
        mountain_pass_middle: { x: 7, y: 2 },
        mountain_city: { x: 7, y: 3 },
        mountain_pass_upper: { x: 8, y: 2 },
        mountain_peak: { x: 9, y: 2 },
        mountain_dungeon: { x: 8, y: 1 }
    };
    
    // Calcular tamaño del canvas
    let maxX = 0, maxY = 0;
    for (const pos of Object.values(positions)) {
        maxX = Math.max(maxX, pos.x);
        maxY = Math.max(maxY, pos.y);
    }
    
    canvas.width = (maxX + 1) * scale + 40;
    canvas.height = (maxY + 1) * scale + 40;
    
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    // Fondo
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar conexiones primero
    ctx.strokeStyle = '#53a8b6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    
    for (const [mapId, mapInfo] of Object.entries(mapData)) {
        const pos1 = positions[mapId];
        if (!pos1) continue;
        
        const x1 = pos1.x * scale + scale / 2 + 20;
        const y1 = pos1.y * scale + scale / 2 + 20;
        
        for (const connId of mapInfo.connections) {
            const pos2 = positions[connId];
            if (!pos2) continue;
            
            const x2 = pos2.x * scale + scale / 2 + 20;
            const y2 = pos2.y * scale + scale / 2 + 20;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
    
    ctx.setLineDash([]);
    
    // Dibujar zonas
    for (const [mapId, mapInfo] of Object.entries(mapData)) {
        const pos = positions[mapId];
        if (!pos) continue;
        
        const x = pos.x * scale + 20;
        const y = pos.y * scale + 20;
        const size = scale - 10;
        
        // Fondo de la zona
        ctx.fillStyle = zoneColors[mapInfo.zone] || '#374151';
        ctx.fillRect(x, y, size, size);
        
        // Patrón
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < size; i += 8) {
            for (let j = 0; j < size; j += 8) {
                if ((i + j) % 16 === 0) {
                    ctx.fillRect(x + i, y + j, 4, 4);
                }
            }
        }
        
        // Marcar mazmorras
        if (mapInfo.isDungeon) {
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(x + size/2 - 5, y + size/2 - 5, 10, 10);
        }
        
        // Borde
        ctx.strokeStyle = mapInfo.isDungeon ? '#fbbf24' : '#53a8b6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
        
        // Etiqueta
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = mapId.replace(/_/g, ' ').substr(0, 8);
        ctx.fillText(label, x + size/2, y + size/2);
    }
    
    // Leyenda
    const legendY = canvas.height - 100;
    ctx.fillStyle = 'rgba(15, 52, 96, 0.8)';
    ctx.fillRect(10, legendY, canvas.width - 20, 90);
    
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#53a8b6';
    ctx.textAlign = 'left';
    ctx.fillText('Leyenda:', 20, legendY + 20);
    
    let legendX = 20;
    let legendRow = legendY + 40;
    const zoneTypes = Object.entries(zoneColors);
    const itemsPerRow = 3;
    
    zoneTypes.forEach(([zone, color], i) => {
        if (i > 0 && i % itemsPerRow === 0) {
            legendRow += 25;
            legendX = 20;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(legendX, legendRow - 8, 15, 15);
        ctx.strokeStyle = '#53a8b6';
        ctx.strokeRect(legendX, legendRow - 8, 15, 15);
        
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '11px sans-serif';
        ctx.fillText(zone, legendX + 20, legendRow);
        
        legendX += 150;
    });
    
    container.appendChild(canvas);
}

// Inicialización cuando carga el DOM
export function initializeManual() {
    initializeSprites();
    insertMinimaps();
    createWorldMap();
}

// Auto-inicializar si se carga como módulo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeManual);
} else {
    initializeManual();
}
