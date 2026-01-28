/**
 * ResourcePreloader.js
 * Sistema de precarga de recursos con manejo de errores y reintentos automáticos
 */

export class ResourcePreloader {
    constructor() {
        this.resources = [];
        this.loadedCount = 0;
        this.failedResources = [];
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 segundo entre reintentos
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
    }

    /**
     * Detectar todos los recursos críticos del DOM
     */
    detectResources() {
        this.resources = [];

        // Detectar CSS
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            if (link.href && !link.href.includes('chrome-extension')) {
                this.resources.push({
                    type: 'css',
                    url: link.href,
                    element: link,
                    retries: 0
                });
            }
        });

        // Detectar módulos JS (scripts con type="module")
        document.querySelectorAll('script[type="module"]').forEach(script => {
            if (script.src && !script.src.includes('chrome-extension')) {
                this.resources.push({
                    type: 'js',
                    url: script.src,
                    element: script,
                    retries: 0
                });
            }
        });

        // Detectar imágenes críticas (favicon, logos)
        document.querySelectorAll('link[rel*="icon"]').forEach(icon => {
            if (icon.href && !icon.href.includes('chrome-extension')) {
                this.resources.push({
                    type: 'image',
                    url: icon.href,
                    element: icon,
                    retries: 0
                });
            }
        });

        console.log(`🔍 Detectados ${this.resources.length} recursos para precargar`);
        return this.resources.length;
    }

    /**
     * Cargar un recurso individual con reintentos
     * @param {Object} resource - Recurso a cargar
     * @returns {Promise<boolean>} True si se cargó correctamente
     */
    async loadResource(resource) {
        const { type, url, retries } = resource;

        try {
            if (type === 'css') {
                await this.loadCSS(url);
            } else if (type === 'js') {
                await this.loadScript(url);
            } else if (type === 'image') {
                await this.loadImage(url);
            }

            console.log(`✅ Recurso cargado: ${url}`);
            return true;
        } catch (error) {
            console.warn(`⚠️ Error cargando ${url} (intento ${retries + 1}/${this.maxRetries}):`, error.message);

            // Intentar recargar si no hemos excedido los reintentos
            if (retries < this.maxRetries) {
                resource.retries++;
                await this.sleep(this.retryDelay * (retries + 1)); // Backoff exponencial
                return this.loadResource(resource);
            } else {
                console.error(`❌ Falló después de ${this.maxRetries} intentos: ${url}`);
                this.failedResources.push(resource);
                return false;
            }
        }
    }

    /**
     * Cargar archivo CSS
     * @param {string} url - URL del CSS
     * @returns {Promise<void>}
     */
    loadCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;

            const timeout = setTimeout(() => {
                reject(new Error('Timeout loading CSS'));
            }, 10000); // 10 segundos timeout

            link.onload = () => {
                clearTimeout(timeout);
                resolve();
            };

            link.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Failed to load CSS'));
            };

            // No agregar al DOM, solo verificar que se puede cargar
            // Los links ya están en el HTML
            // Hacer fetch para verificar que existe
            fetch(url, { method: 'HEAD' })
                .then(() => {
                    clearTimeout(timeout);
                    resolve();
                })
                .catch(() => {
                    clearTimeout(timeout);
                    reject(new Error('CSS not accessible'));
                });
        });
    }

    /**
     * Cargar script JS
     * @param {string} url - URL del script
     * @returns {Promise<void>}
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout loading script'));
            }, 10000); // 10 segundos timeout

            // Hacer fetch para verificar que el script existe
            fetch(url, { method: 'HEAD' })
                .then(() => {
                    clearTimeout(timeout);
                    resolve();
                })
                .catch(() => {
                    clearTimeout(timeout);
                    reject(new Error('Script not accessible'));
                });
        });
    }

    /**
     * Cargar imagen
     * @param {string} url - URL de la imagen
     * @returns {Promise<void>}
     */
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            const timeout = setTimeout(() => {
                reject(new Error('Timeout loading image'));
            }, 10000); // 10 segundos timeout

            img.onload = () => {
                clearTimeout(timeout);
                resolve();
            };

            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }

    /**
     * Dormir durante X milisegundos
     * @param {number} ms - Milisegundos
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Precargar todos los recursos
     * @returns {Promise<Object>} Resultado de la precarga
     */
    async preloadAll() {
        const total = this.detectResources();

        if (total === 0) {
            console.log('✅ No hay recursos para precargar');
            if (this.onComplete) this.onComplete({ success: true, loaded: 0, failed: 0 });
            return { success: true, loaded: 0, failed: 0 };
        }

        this.loadedCount = 0;
        this.failedResources = [];

        // Cargar recursos en paralelo con límite de concurrencia
        const concurrencyLimit = 5;
        const results = [];

        for (let i = 0; i < this.resources.length; i += concurrencyLimit) {
            const batch = this.resources.slice(i, i + concurrencyLimit);
            const batchPromises = batch.map(resource => this.loadResource(resource));
            const batchResults = await Promise.all(batchPromises);

            results.push(...batchResults);

            // Actualizar progreso
            this.loadedCount += batch.length;
            const progress = (this.loadedCount / total) * 100;

            if (this.onProgress) {
                this.onProgress({
                    loaded: this.loadedCount,
                    total: total,
                    progress: progress,
                    currentResource: batch[batch.length - 1]?.url
                });
            }

            console.log(`📊 Progreso: ${this.loadedCount}/${total} (${progress.toFixed(1)}%)`);
        }

        const successCount = results.filter(r => r === true).length;
        const failedCount = this.failedResources.length;

        const result = {
            success: failedCount === 0,
            loaded: successCount,
            failed: failedCount,
            failedResources: this.failedResources
        };

        console.log(`✨ Precarga completada: ${successCount}/${total} exitosos, ${failedCount} fallidos`);

        if (failedCount > 0) {
            console.warn('⚠️ Recursos que fallaron:', this.failedResources.map(r => r.url));
            if (this.onError) this.onError(this.failedResources);
        }

        if (this.onComplete) this.onComplete(result);

        return result;
    }

    /**
     * Establecer callback de progreso
     * @param {Function} callback - Función a llamar en cada progreso
     */
    setOnProgress(callback) {
        this.onProgress = callback;
    }

    /**
     * Establecer callback de completado
     * @param {Function} callback - Función a llamar al completar
     */
    setOnComplete(callback) {
        this.onComplete = callback;
    }

    /**
     * Establecer callback de error
     * @param {Function} callback - Función a llamar si hay errores
     */
    setOnError(callback) {
        this.onError = callback;
    }
}

// Exportar instancia singleton
export const resourcePreloader = new ResourcePreloader();