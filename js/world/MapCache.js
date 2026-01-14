/**
 * MapCache.js
 * Sistema de caché para mapas generados
 * Evita regenerar mapas frecuentemente y mejora rendimiento
 */

import { CONFIG } from '../config.js';

const { MAP_WIDTH, MAP_HEIGHT } = CONFIG;

/**
 * MapCache class - LRU cache for generated maps
 */
export class MapCache {
    constructor(maxSize = 10) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.accessOrder = []; // Para implementar LRU
    }

    /**
     * Generate cache key for map (static method)
     * @param {string} mapType - Type of map
     * @param {Object} params - Additional parameters
     * @returns {string} Cache key
     */
    static generateKey(mapType, params = {}) {
        const paramStr = Object.keys(params).sort().map(key => `${key}:${params[key]}`).join(',');
        return paramStr ? `${mapType}:${paramStr}` : mapType;
    }

    /**
     * Check if map is in cache
     * @param {string} key - Cache key
     * @returns {boolean} True if cached
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * Get map from cache
     * @param {string} key - Cache key
     * @returns {Array|null} Cached map or null
     */
    get(key) {
        if (this.cache.has(key)) {
            // Update access order for LRU
            this.updateAccessOrder(key);
            console.log(`🗄️ Mapa cacheado encontrado: ${key}`);
            return this.cache.get(key);
        }
        return null;
    }

    /**
     * Store map in cache
     * @param {string} key - Cache key
     * @param {Array} mapData - Map data to cache
     * @param {Object} metadata - Additional metadata
     */
    set(key, mapData, metadata = {}) {
        // Evict oldest if cache is full
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        this.cache.set(key, {
            data: mapData,
            metadata: {
                ...metadata,
                cachedAt: Date.now(),
                size: mapData.length * (mapData[0]?.length || 0)
            }
        });

        this.accessOrder.push(key);
        console.log(`🗄️ Mapa cacheado: ${key} (${this.cache.size}/${this.maxSize})`);
    }

    /**
     * Update access order for LRU
     * @param {string} key - Cache key
     */
    updateAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
        this.accessOrder.push(key);
    }

    /**
     * Evict least recently used item
     */
    evictLRU() {
        if (this.accessOrder.length > 0) {
            const lruKey = this.accessOrder.shift();
            this.cache.delete(lruKey);
            console.log(`🗄️ Evict LRU: ${lruKey}`);
        }
    }

    /**
     * Clear all cached maps
     */
    clear() {
        this.cache.clear();
        this.accessOrder.length = 0;
        console.log('🗄️ Cache limpiado');
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        const totalSize = Array.from(this.cache.values()).reduce((sum, item) => {
            return sum + (item.metadata.size || 0);
        }, 0);

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            totalTiles: totalSize,
            hitRate: this.getHitRate(),
            entries: Array.from(this.cache.keys())
        };
    }

    /**
     * Calculate cache hit rate (simplified)
     * @returns {number} Hit rate percentage
     */
    getHitRate() {
        // This is a simplified calculation
        // In a real implementation, you'd track hits/misses
        return this.cache.size > 0 ? Math.min(100, (this.cache.size / this.maxSize) * 100) : 0;
    }

    /**
     * Preload commonly used maps
     * @param {Array} mapTypes - Types of maps to preload
     */
    async preloadMaps(mapTypes) {
        console.log(`🗄️ Preloading ${mapTypes.length} mapas...`);

        for (const mapType of mapTypes) {
            try {
                // Check if not already cached
                const key = MapCache.generateKey(mapType);
                if (!this.has(key)) {
                    // Import MapGenerator to avoid circular dependency
                    const { generateMap } = await import('./MapGenerator.js');
                    const mapData = generateMap(mapType);
                    this.set(key, mapData, { preloaded: true });
                }
            } catch (error) {
                console.warn(`❌ Error preloading map ${mapType}:`, error);
            }
        }

        console.log(`✅ Preload completado. Cache: ${this.cache.size}/${this.maxSize}`);
    }
}

// Singleton instance
export const mapCache = new MapCache();
