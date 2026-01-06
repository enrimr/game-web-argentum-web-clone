/**
 * MapGenerator.js
 * Generación de mapas para diferentes áreas del juego
 * Compatible con mapas estáticos y generación procedimental
 */

import { CONFIG } from '../config.js';
import { gameState } from '../state.js';
import { generateNewbieCityWithBuildings } from './StaticMapLayouts.js';
import { extractRoofLayer } from './generators/BuildingIdentifier.js';
import { loadStaticMap } from './generators/StaticMapLoader.js';
import { isWalkable, createFallbackMap } from './generators/BaseGenerator.js';
import { 
    generateFieldMap,
    generateCityMap, 
    generateForestMap,
    generateCastleMap,
    generateMarketMap,
    generateRuinsMap,
    generateThroneRoomMap
} from './generators/BasicMapGenerator.js';
import {
    generateDungeonMap,
    generateDeepDungeonMap
} from './generators/DungeonGenerator.js';
import {
    generateNewbieCityLayout,
    generateNewbieFieldLayout,
    generateDarkForestLayout
} from './generators/StaticMapGenerator.js';

/**
 * Generate map based on current map type
 * First checks for static maps, then falls back to procedural generation
 * @param {string} mapType - Type of map to generate
 * @returns {Array} 2D array representing the map
 */
export function generateMap(mapType) {
    // Special cases for newbie maps
    if (mapType === 'newbie_city') {
        console.log("🏙️ Generando mapa de Newbie City con edificios mejorados");

        try {
            // Usamos directamente la función importada al inicio del archivo
            const mapData = generateNewbieCityWithBuildings();

            // Guardar la capa de techos por separado
            if (mapData && Array.isArray(mapData)) {
                extractRoofLayer(mapData);
                return mapData;
            } else {
                return mapData;
            }
        } catch (error) {
            console.error("Error al generar mapa con edificios mejorados:", error);
            console.log("⚠️ Usando versión básica como fallback");
            const mapData = generateNewbieCityLayout();
            extractRoofLayer(mapData);
            return mapData;
        }
    }

    if (mapType === 'newbie_field') {
        console.log("🏞️ Generando mapa de Newbie Field");
        const mapData = generateNewbieFieldLayout();

        // Verificar que el mapa es válido - puede ser un objeto con {map, roofLayer, etc} o directamente un array 2D
        if (mapData) {
            // Si es un objeto con capas (nueva estructura)
            if (mapData.map && Array.isArray(mapData.map) && mapData.map.length > 0) {
                console.log(`🏞️ Mapa Newbie Field generado correctamente (formato multicapa): ${mapData.map.length}x${mapData.map[0]?.length}`);
                
                // Asignar capas directamente al gameState
                gameState.roofLayer = mapData.roofLayer || [];
                gameState.doorLayer = mapData.doorLayer || [];
                gameState.windowLayer = mapData.windowLayer || [];
                
                return mapData.map;
            } 
            // Si es un array 2D directamente (estructura antigua)
            else if (Array.isArray(mapData) && mapData.length > 0) {
                console.log(`🏞️ Mapa Newbie Field generado correctamente (formato array simple): ${mapData.length}x${mapData[0]?.length}`);
                
                try {
                    extractRoofLayer(mapData);
                    return mapData;
                } catch (error) {
                    console.error("Error al extraer capa de techos para newbie_field:", error);
                }
            } 
            // Si no es ninguno de los formatos esperados
            else {
                console.error(`❌ generateNewbieFieldLayout devolvió un formato inesperado: ${typeof mapData}`);
            }
        } else {
            console.error(`❌ generateNewbieFieldLayout devolvió un mapa inválido: ${typeof mapData}`);
        }
        
        // Como fallback en caso de error, crear un mapa mínimo válido
        const fallbackMap = createFallbackMap();
        console.log(`⚠️ Usando mapa fallback para newbie_field: ${fallbackMap.length}x${fallbackMap[0].length}`);
        extractRoofLayer(fallbackMap);
        return fallbackMap;
    }
    
    // For other maps, try to load a static map
    const staticMapData = loadStaticMap(mapType);
    if (staticMapData && Array.isArray(staticMapData) && staticMapData.length > 0) {
        extractRoofLayer(staticMapData);
        return staticMapData;
    }

    // If no static map is found, use procedural generation
    let mapData;
    switch (mapType) {
        case 'field':
            mapData = generateFieldMap();
            break;
        case 'city':
            mapData = generateCityMap();
            break;
        case 'dungeon':
            mapData = generateDungeonMap();
            break;
        case 'forest':
            mapData = generateForestMap();
            break;
        case 'castle':
            mapData = generateCastleMap();
            break;
        case 'market':
            mapData = generateMarketMap();
            break;
        case 'deep_dungeon':
            mapData = generateDeepDungeonMap();
            break;
        case 'ruins':
            mapData = generateRuinsMap();
            break;
        case 'throne_room':
            mapData = generateThroneRoomMap();
            break;
        case 'dark_forest':
            mapData = generateDarkForestLayout();
            break;
        default:
            mapData = generateFieldMap();
    }
    
    extractRoofLayer(mapData);
    return mapData;
}

// Re-export the isWalkable function for compatibility
export { isWalkable };
