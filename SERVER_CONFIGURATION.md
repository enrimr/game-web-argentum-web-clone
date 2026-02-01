# Configuración del Servidor - Calima Online Client

## Descripción

La URL del servidor (API y WebSocket) está centralizada en el archivo `js/config.js` para facilitar el cambio entre entornos de desarrollo y producción.

## Cómo Configurar

### Ubicación de la Configuración

Edita el archivo: **`js/config.js`**

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

### ✅ Centralizado
- Un solo lugar para cambiar la URL
- No necesitas buscar en múltiples archivos

### ✅ Sin Variables de Entorno
- No requiere bundler (Webpack, Vite, etc.)
- No requiere archivos `.env`
- Funciona directamente en el navegador

### ✅ Fácil de Cambiar
- Solo edita `CONFIG.SERVER.API_URL` en `js/config.js`
- Los cambios se aplican automáticamente a ApiClient y SocketClient

### ✅ Consistente
- API REST y WebSocket usan la misma URL base
- Evita desincronización entre servicios

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

1. Abre `js/config.js`
2. Establece: `API_URL: 'http://localhost:3000'`
3. Inicia el servidor local: `cd calima-online-server && npm run dev`
4. Abre el cliente: `http://localhost:8080`

### Desplegar a Producción

1. Despliega el servidor a Railway/Vercel
2. Obtén la URL de producción (ej: `https://calima-online-server.up.railway.app`)
3. Edita `js/config.js`: `API_URL: 'https://calima-online-server.up.railway.app'`
4. Despliega el cliente (ej: GitHub Pages, Netlify, Vercel)

## Logs de Debugging

Cuando el juego inicia, verás en la consola:

```
🔗 ApiClient inicializado con URL: http://localhost:3000/api
🔗 SocketClient inicializado con URL: http://localhost:3000
```

Esto confirma que ambos clientes están usando la URL correcta.

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