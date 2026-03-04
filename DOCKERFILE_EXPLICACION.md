# Explicación del Dockerfile y Configuración de Nginx

## Problema Original

El Dockerfile anterior no manejaba correctamente las rutas `/admin` y `/manual`, que son directorios con archivos estáticos. Cuando se usaba `python3 -m http.server`, funcionaba porque Python sirve todos los archivos y directorios directamente sin necesidad de configuración especial.

## Solución Implementada

### 1. Dockerfile

El Dockerfile ahora:
- Usa nginx:alpine como base (ligero y eficiente)
- Copia todos los archivos del cliente a `/usr/share/nginx/html`
- Copia la configuración personalizada de nginx
- Usa un script de entrypoint para configuración dinámica
- Expone el puerto 80

### 2. Nginx Configuration (nginx.conf)

La configuración de nginx ahora maneja correctamente:

#### Archivos Estáticos
- JavaScript, CSS, imágenes, fuentes, etc. se sirven directamente con caché de 1 año

#### Directorios Especiales
- `/admin/` - Sirve archivos estáticos del panel de administración
- `/manual/` - Sirve archivos estáticos del manual
- `/api/` - Sirve archivos de configuración como env.js
- `/img/`, `/resources/`, `/styles/` - Recursos del juego

#### SPA Routing
- Todas las demás rutas redirigen a `index.html` para el routing del cliente
- Esto permite que el juego funcione como Single Page Application

### 3. Docker Entrypoint Script

El script de entrypoint:
- Verifica que los archivos existen
- Procesa variables de entorno (API_URL, WS_URL)
- Valida la configuración de nginx antes de iniciar
- Proporciona logs útiles para debugging

## Cómo Funciona

### Jerarquía de Rutas en Nginx

```
location /admin/          <- Prioridad alta: archivos estáticos
location /manual/         <- Prioridad alta: archivos estáticos
location ~* \.(js|css)$   <- Media: archivos por extensión
location /                <- Baja: fallback a SPA routing
```

Nginx procesa las locations en este orden:
1. Exact match (`location = /path`)
2. Preferential prefix (`location ^~ /path`)
3. Regex match (`location ~ pattern`)
4. Prefix match (`location /path`)

### Try Files

La directiva `try_files $uri $uri/ $uri/index.html` intenta:
1. Servir el archivo exacto (`$uri`)
2. Servir el directorio (`$uri/`)
3. Servir index.html del directorio
4. Si nada funciona, devuelve 404 o redirige según configuración

## Cómo Probar

### Construcción Local

```bash
# Desde el directorio calima-online-client
docker build -t calima-client .
```

### Ejecución Local

```bash
# Sin variables de entorno
docker run -p 8080:80 calima-client

# Con variables de entorno
docker run -p 8080:80 \
  -e API_URL=http://localhost:3000/api \
  -e WS_URL=ws://localhost:3000 \
  calima-client
```

### Verificar las Rutas

Abre un navegador y prueba:
- http://localhost:8080/ - Página principal
- http://localhost:8080/admin/ - Panel de administración
- http://localhost:8080/manual/ - Manual del juego
- http://localhost:8080/admin/index.html - Admin explícito
- http://localhost:8080/manual/index.html - Manual explícito

### Verificar con Docker Compose

```bash
# Desde el directorio raíz del proyecto
docker-compose up client
```

### Debug

Ver logs del contenedor:
```bash
docker logs <container-id>
```

Entrar al contenedor para inspeccionar:
```bash
docker exec -it <container-id> sh
cd /usr/share/nginx/html
ls -la
```

## Diferencias con Python HTTP Server

| Aspecto | Python http.server | Nginx |
|---------|-------------------|-------|
| Configuración | No requiere | Requiere nginx.conf |
| SPA Routing | No soporta nativamente | Configurado con try_files |
| Performance | Menor | Mayor |
| Producción | No recomendado | Recomendado |
| Directorios | Sirve todo automáticamente | Necesita configuración explícita |
| Caché | Básico | Avanzado y configurable |

## Variables de Entorno Soportadas

- `API_URL` - URL del servidor API (default: ver env.example.js)
- `WS_URL` - URL del WebSocket (default: ver env.example.js)

Estas variables se inyectan en el archivo `env.js` durante el inicio del contenedor.

## Archivos Importantes

- `Dockerfile` - Definición de la imagen Docker
- `nginx.conf` - Configuración del servidor web
- `docker-entrypoint.sh` - Script de inicialización
- `env.example.js` - Plantilla de configuración
- `.dockerignore` - Archivos excluidos de la imagen

## Troubleshooting

### Las rutas /admin o /manual devuelven 404

1. Verificar que los directorios existen en el contenedor:
   ```bash
   docker exec -it <container> ls -la /usr/share/nginx/html/admin
   ```

2. Revisar logs de nginx:
   ```bash
   docker exec -it <container> cat /var/log/nginx/error.log
   ```

### El SPA routing no funciona

1. Verificar que la configuración de nginx se cargó correctamente:
   ```bash
   docker exec -it <container> nginx -T
   ```

2. Verificar que index.html existe:
   ```bash
   docker exec -it <container> ls -la /usr/share/nginx/html/index.html
   ```

### Variables de entorno no se aplican

1. Verificar que env.js fue creado:
   ```bash
   docker exec -it <container> cat /usr/share/nginx/html/env.js
   ```

2. Revisar logs del entrypoint:
   ```bash
   docker logs <container>