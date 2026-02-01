# Configuración del Servidor - Calima Online Client

## Descripción

La URL del servidor (API y WebSocket) está centralizada en el archivo `js/config.js` para facilitar el cambio entre entornos de desarrollo y producción.

## Cómo Configurar

### Opción 1: Configuración Local (Recomendado)

**No modifiques `js/config.js` directamente.** En su lugar, usa configuración local:

1. Copia el archivo de ejemplo:
```bash
cp js/config.local.example.js js/config.local.js
```

2. Edita `js/config.local.js` con tu URL de servidor:
```javascript
export const LOCAL_CONFIG_OVERRIDES = {
    SERVER: {
        API_URL: 'https://calima-online-server-production.up.railway.app',
    }
};
```

3. ✅ `config.local.js` está en `.gitignore` y NO se subirá al repositorio

### Opción 2: Configuración por Defecto

Edita el archivo: **`js/config.js`** (se commitea al repo)

```javascript
// Configuración del servidor (Multiplayer)
SERVER: {
    // URL del servidor API y WebSocket
    // Para desarrollo local: 'http://localhost:3000'
    // Para producción: 'https://tu-servidor.com'
    API_URL: 'http://localhost:3000',
    
    // Configuración de reconexión
    RECONNECTION_ATTEMPTS: 5,
    RECONNECTION_DELAY: 1000,
    
    // Timeout de peticiones HTTP (ms)
    REQUEST_TIMEOUT: 10000
},
```

### Entornos Disponibles

#### Desarrollo Local

```javascript
API_URL: 'http://localhost:3000'
```

#### Producción (Railway)

```javascript
API_URL: 'https://calima-online-server-production.up.railway.app'
```

#### Producción (Vercel)

```javascript
API_URL: 'https://tu-dominio.vercel.app'
```

#### Servidor Personalizado

```javascript
API_URL: 'https://tu-dominio-personalizado.com'
```

## Archivos que Usan esta Configuración

### 1. ApiClient.js
```javascript
import { CONFIG } from '../config.js';

this.baseUrl = `${CONFIG.SERVER.API_URL}/api`;
```

**Endpoints generados:**
- `${CONFIG.SERVER.API_URL}/api/auth/register`
- `${CONFIG.SERVER.API_URL}/api/auth/login`
- `${CONFIG.SERVER.API_URL}/api/characters`
- etc.

### 2. SocketClient.js
```javascript
import { CONFIG } from '../config.js';

this.serverUrl = CONFIG.SERVER.API_URL;
```

**Conexión WebSocket:**
- Socket.io se conecta a `CONFIG.SERVER.API_URL`
- Usa la misma URL base que el API REST

## Ventajas de este Sistema

### ✅ Configuración Local Privada
- `config.local.js` NO se sube al repositorio (en .gitignore)
- Cada desarrollador puede tener su propia configuración
- No expones URLs de producción en el repo público

### ✅ Centralizado
- Un solo lugar para cambiar la URL
- No necesitas buscar en múltiples archivos

### ✅ Sin Bundler
- No requiere bundler (Webpack, Vite, etc.)
- Funciona directamente en el navegador
- Usa import dinámico de ES6

### ✅ Fácil de Cambiar
- Crea `config.local.js` con tu URL
- Los cambios se aplican automáticamente
- No afecta a otros desarrolladores

### ✅ Consistente
- API REST y WebSocket usan la misma URL base
- Evita desincronización entre servicios

### ✅ Fallback Seguro
- Si `config.local.js` no existe, usa valores de `config.js`
- No rompe el juego si falta el archivo

## Configuración Adicional

### Reconexión Automática

Ajusta el comportamiento de reconexión en caso de pérdida de conexión:

```javascript
RECONNECTION_ATTEMPTS: 5,      // Número de intentos
RECONNECTION_DELAY: 1000,      // Delay entre intentos (ms)
```

### Timeout de Peticiones

Tiempo máximo de espera para peticiones HTTP:

```javascript
REQUEST_TIMEOUT: 10000  // 10 segundos
```

## Ejemplo de Uso

### Desarrollo Local

1. No necesitas crear `config.local.js`, usa el valor por defecto (`localhost:3000`)
2. Inicia el servidor local: `cd calima-online-server && npm run dev`
3. Abre el cliente: `http://localhost:8080`

### Desarrollo con Servidor Remoto

1. Copia el ejemplo: `cp js/config.local.example.js js/config.local.js`
2. Edita `js/config.local.js`:
```javascript
export const LOCAL_CONFIG_OVERRIDES = {
    SERVER: {
        API_URL: 'https://tu-servidor-remoto.com',
    }
};
```
3. Refresca el navegador

### Desplegar a Producción

**Opción A - Sin archivo local (se commitea):**
1. Despliega el servidor a Railway/Vercel
2. Obtén la URL de producción
3. Edita `js/config.js`: `API_URL: 'https://tu-servidor.up.railway.app'`
4. Commit y push
5. Despliega el cliente

**Opción B - Con archivo local (NO se commitea):**
1. Despliega el servidor
2. Crea `js/config.local.js` en producción con la URL correcta
3. El cliente lee la configuración local automáticamente

## Logs de Debugging

Cuando el juego inicia, verás en la consola:

**Con config.local.js:**
```
📝 Aplicando configuración local (config.local.js)
🔗 URL del servidor sobrescrita: https://tu-servidor.com
🔗 ApiClient inicializado con URL: https://tu-servidor.com/api
🔗 SocketClient inicializado con URL: https://tu-servidor.com
```

**Sin config.local.js:**
```
📌 Usando configuración por defecto de config.js
🔗 ApiClient inicializado con URL: http://localhost:3000/api
🔗 SocketClient inicializado con URL: http://localhost:3000
```

Esto confirma qué configuración está usando el cliente.

## Troubleshooting

### Problema: No se puede conectar al servidor

1. Verifica que `CONFIG.SERVER.API_URL` esté correcta
2. Comprueba que el servidor esté ejecutándose
3. Revisa la consola del navegador para errores de CORS
4. Asegúrate de que la URL no tenga espacios ni caracteres extraños

### Problema: CORS Error

El servidor debe permitir el origen del cliente en su configuración CORS. Verifica en el servidor:

```javascript
// server.js
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:8080'];
```

### Problema: WebSocket no conecta pero API sí

Verifica que la URL en SocketClient no tenga `/api` al final:
- ✅ Correcto: `http://localhost:3000`
- ❌ Incorrecto: `http://localhost:3000/api`

## Notas Importantes

- **NO COMMITEAR** URLs de producción con credenciales
- **SIEMPRE** usar HTTPS en producción
- **DOCUMENTAR** la URL de producción en documentación privada
- **PROBAR** conexión después de cambiar la URL

## Futuras Mejoras

### Detección Automática de Entorno

```javascript
API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'https://calima-online-server.up.railway.app'
```

### Múltiples Servidores

```javascript
SERVERS: {
    DEV: 'http://localhost:3000',
    STAGING: 'https://staging.calima-online.com',
    PROD: 'https://api.calima-online.com'
},
CURRENT: 'DEV'  // Cambiar según necesidad