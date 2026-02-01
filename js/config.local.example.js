/**
 * config.local.example.js
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo a config.local.js: cp config.local.example.js config.local.js
 * 2. Edita config.local.js con tu configuración específica
 * 3. config.local.js está en .gitignore y NO se subirá al repositorio
 * 
 * Este archivo sobrescribe valores de config.js sin modificar el original
 */

export const LOCAL_CONFIG_OVERRIDES = {
    SERVER: {
        // Descomenta y edita según tu entorno:
        
        // Para servidor de producción en Railway:
        // API_URL: 'https://calima-online-server-production.up.railway.app',
        
        // Para servidor de producción en Vercel:
        // API_URL: 'https://tu-dominio.vercel.app',
        
        // Para desarrollo local (por defecto en config.js):
        // API_URL: 'http://localhost:3000',
        
        // Para otro servidor personalizado:
        // API_URL: 'https://tu-servidor-personalizado.com',
    }
};