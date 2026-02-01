# Configuración de Variables de Entorno en Producción

## Problema

En frontend estático (sin bundler), no se pueden usar archivos `.env` directamente. Este documento explica cómo inyectar la URL del servidor desde variables de entorno del hosting.

## Solución: window.ENV

El código busca variables en `window.ENV.API_URL` con **máxima prioridad**.

### Orden de Prioridad

1. **🔧 window.ENV.API_URL** (variable de entorno del hosting)
2. **📝 config.local.js** (override manual local)
3. **🌐 Detección automática** (localhost vs producción)
4. **📌 CONFIG.SERVER.PRODUCTION_URL** (fallback)

---

## Implementación por Plataforma

### Vercel

#### Paso 1: Configurar Variable de Entorno

En Vercel Dashboard:
1. Settings → Environment Variables
2. Añadir: `API_URL` = `https://calima-online-server.up.railway.app`

#### Paso 2: Crear Script de Inyección

Crear `inject-env.js` en la raíz:

```javascript
// inject-env.js
const fs = require('fs');

const apiUrl = process.env.API_URL || 'http://localhost:3000';

const envScript = `
<script>
  window.ENV = {
    API_URL: '${apiUrl}'
  };
</script>
`;

// Inyectar en index.html antes de cargar otros scripts
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('</head>', `${envScript}</head>`);
fs.writeFileSync('index.html', html);

console.log('✅ Variables de entorno inyectadas en index.html');
console.log('API_URL:', apiUrl);
```

#### Paso 3: Configurar vercel.json

```json
{
  "buildCommand": "node inject-env.js",
  "outputDirectory": "."
}
```

---

### Netlify

#### Paso 1: Configurar Variable de Entorno

En Netlify Dashboard:
1. Site settings → Build & deploy → Environment
2. Añadir: `API_URL` = `https://calima-online-server.up.railway.app`

#### Paso 2: Crear Script de Build

Crear `netlify-build.js`:

```javascript
// netlify-build.js
const fs = require('fs');

const apiUrl = process.env.API_URL || 'http://localhost:3000';

console.log('🔧 Inyectando variables de entorno...');
console.log('API_URL:', apiUrl);

const envScript = `
<script>
  window.ENV = {
    API_URL: '${apiUrl}'
  };
  console.log('✅ Variables de entorno cargadas:', window.ENV);
</script>
`;

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('</head>', `${envScript}</head>`);
fs.writeFileSync('index.html', html);

console.log('✅ index.html modificado con éxito');
```

#### Paso 3: Configurar netlify.toml

```toml
[build]
  command = "node netlify-build.js"
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

### GitHub Pages

GitHub Pages no soporta build steps, así que usa detección automática:

#### Opción A: Editar PRODUCTION_URL

```javascript
// js/config.js
SERVER: {
    PRODUCTION_URL: 'https://calima-online-server.up.railway.app',
}
```

#### Opción B: Usar GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Inject Environment Variables
      run: |
        API_URL="${{ secrets.API_URL }}"
        sed -i "s|</head>|<script>window.ENV={API_URL:'$API_URL'};</script></head>|" index.html
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: .
```

---

### Servidor Web Propio (Nginx, Apache)

#### index.html Template

Renombra `index.html` a `index.html.template`:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Variables de entorno inyectadas por el servidor -->
    <script>
      window.ENV = {
        API_URL: '${API_URL}'
      };
    </script>
    ...
</head>
```

#### Script de Deploy

```bash
#!/bin/bash
# deploy.sh

export API_URL="https://calima-online-server.up.railway.app"

# Reemplazar variables en template
envsubst < index.html.template > index.html

echo "✅ Variables inyectadas en index.html"
echo "API_URL: $API_URL"
```

---

## Ejemplo Completo: Vercel

### 1. Estructura de Archivos

```
calima-online-client/
├── index.html
├── inject-env.js (nuevo)
├── vercel.json (actualizado)
├── js/
│   ├── config.js (con soporte window.ENV)
│   └── ...
```

### 2. inject-env.js

```javascript
const fs = require('fs');

const apiUrl = process.env.API_URL || 'http://localhost:3000';

const envScript = `
<script>
  // Variables de entorno inyectadas en build time
  window.ENV = {
    API_URL: '${apiUrl}'
  };
  console.log('✅ Variables de entorno cargadas:', window.ENV);
</script>
`;

let html = fs.readFileSync('index.html', 'utf8');

// Buscar </head> e inyectar antes
html = html.replace('</head>', `${envScript}</head>`);

fs.writeFileSync('index.html', html);

console.log('✅ Variables de entorno inyectadas');
console.log('API_URL:', apiUrl);
```

### 3. vercel.json

```json
{
  "buildCommand": "node inject-env.js",
  "outputDirectory": "."
}
```

### 4. Variables en Vercel Dashboard

```
API_URL = https://calima-online-server-production.up.railway.app
```

### 5. Deploy

```bash
vercel --prod
```

---

## Verificación

En la consola del navegador verás:

```javascript
✅ Variables de entorno cargadas: {API_URL: "https://..."}
🔧 Usando variable de entorno del servidor web: https://...
🔗 URL del servidor configurada: https://...
🔗 ApiClient inicializado con URL: https://.../api
🔗 SocketClient inicializado con URL: https://...
```

## Ventajas

- ✅ URL no está hardcodeada en el código
- ✅ Puedes cambiar la URL sin modificar código
- ✅ Compatible con CI/CD
- ✅ Funciona en cualquier plataforma de hosting
- ✅ Fallback a detección automática si no hay variables

## Resumen

| Plataforma | Método | Complejidad |
|------------|--------|-------------|
| Vercel | Build script + env vars | Media |
| Netlify | Build script + env vars | Media |
| GitHub Pages | GitHub Actions | Alta |
| Servidor Propio | envsubst + template | Media |
| Sin Build | PRODUCTION_URL en config.js | Baja |