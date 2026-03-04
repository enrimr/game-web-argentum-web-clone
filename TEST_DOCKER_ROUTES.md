# Guía de Prueba - Docker Routes

## Objetivo
Verificar que todas las rutas funcionan correctamente en el contenedor Docker, especialmente `/admin` y `/manual`.

## Pasos para Probar

### 1. Construir la Imagen

```bash
cd calima-online-client
docker build -t calima-client:test .
```

### 2. Ejecutar el Contenedor

```bash
docker run -p 8080:80 --name calima-test calima-client:test
```

### 3. Verificar las Rutas

Abre un navegador y prueba las siguientes URLs:

#### ✅ Ruta Principal
- http://localhost:8080/
- Debería mostrar el juego principal (index.html)

#### ✅ Panel de Administración
- http://localhost:8080/admin/
- http://localhost:8080/admin/index.html
- Debería mostrar el panel de admin

#### ✅ Manual del Juego
- http://localhost:8080/manual/
- http://localhost:8080/manual/index.html
- Debería mostrar el manual

#### ✅ Recursos Estáticos
- http://localhost:8080/img/ (debería dar 404 o mostrar directorio)
- http://localhost:8080/js/core/Game.js (debería descargar el archivo JS)
- http://localhost:8080/styles.css (debería mostrar el CSS)

#### ✅ Variables de Entorno
- http://localhost:8080/env.js (debería mostrar la configuración)

### 4. Verificar Logs del Contenedor

```bash
docker logs calima-test
```

Deberías ver:
```
Starting Calima Online Client...
Checking files...
Checking admin directory...
Checking manual directory...
Processing environment variables...
Testing nginx configuration...
nginx: the configuration file /etc/nginx/conf.d/default.conf syntax is ok
nginx: configuration file /etc/nginx/conf.d/default.conf test is successful
Starting nginx...
```

### 5. Inspeccionar el Contenedor

Si algo no funciona, puedes entrar al contenedor:

```bash
docker exec -it calima-test sh
```

Dentro del contenedor, verifica:

```bash
# Ver archivos en el directorio raíz
ls -la /usr/share/nginx/html/

# Ver directorio admin
ls -la /usr/share/nginx/html/admin/

# Ver directorio manual
ls -la /usr/share/nginx/html/manual/

# Ver configuración de nginx
cat /etc/nginx/conf.d/default.conf

# Ver logs de nginx
cat /var/log/nginx/error.log
cat /var/log/nginx/access.log
```

### 6. Probar con Variables de Entorno

```bash
# Detener el contenedor anterior
docker stop calima-test
docker rm calima-test

# Iniciar con variables de entorno personalizadas
docker run -p 8080:80 --name calima-test \
  -e API_URL=https://mi-servidor.com/api \
  -e WS_URL=wss://mi-servidor.com \
  calima-client:test
```

Luego verifica que env.js tenga las variables correctas:
```bash
curl http://localhost:8080/env.js
```

### 7. Prueba con Docker Compose

Edita `docker-compose.yml` en la raíz del proyecto y asegúrate de que el servicio client esté configurado:

```yaml
services:
  client:
    build: ./calima-online-client
    ports:
      - "8080:80"
    environment:
      - API_URL=http://localhost:3000/api
      - WS_URL=ws://localhost:3000
```

Luego ejecuta:
```bash
cd ..  # Volver al directorio raíz
docker-compose up client
```

### 8. Limpieza

Cuando termines las pruebas:

```bash
# Detener el contenedor
docker stop calima-test

# Eliminar el contenedor
docker rm calima-test

# Eliminar la imagen (opcional)
docker rmi calima-client:test
```

## Troubleshooting Común

### Error: "404 Not Found" en /admin o /manual

**Causa**: Los directorios no se copiaron al contenedor.

**Solución**:
1. Verifica que los directorios existen localmente:
   ```bash
   ls -la calima-online-client/admin/
   ls -la calima-online-client/manual/
   ```

2. Verifica el `.dockerignore` no los excluye:
   ```bash
   cat .dockerignore | grep -E "(admin|manual)"
   ```

3. Reconstruye la imagen:
   ```bash
   docker build --no-cache -t calima-client:test .
   ```

### Error: "nginx: configuration file test failed"

**Causa**: Sintaxis incorrecta en nginx.conf.

**Solución**:
1. Prueba la configuración localmente:
   ```bash
   docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine nginx -t
   ```

2. Revisa el archivo nginx.conf por errores de sintaxis.

### Las variables de entorno no se aplican

**Causa**: El script de entrypoint no se ejecutó correctamente.

**Solución**:
1. Verifica que el script tenga permisos de ejecución:
   ```bash
   ls -la docker-entrypoint.sh
   ```

2. Verifica los logs del contenedor:
   ```bash
   docker logs calima-test
   ```

3. El script debe tener `#!/bin/bash` y estar en formato Unix (LF, no CRLF).

### La página principal funciona pero /admin y /manual no

**Causa**: La configuración de nginx no está correcta.

**Solución**:
1. Verifica la configuración cargada:
   ```bash
   docker exec -it calima-test cat /etc/nginx/conf.d/default.conf
   ```

2. Asegúrate de que las secciones `location /admin/` y `location /manual/` están presentes.

3. Revisa los logs de nginx:
   ```bash
   docker exec -it calima-test cat /var/log/nginx/error.log
   ```

## Comparación con Python HTTP Server

Si funcionaba con `python3 -m http.server`, es porque Python sirve todos los archivos y directorios automáticamente. Con nginx necesitamos configurar explícitamente cómo servir cada ruta.

**Python HTTP Server (automático):**
```bash
python3 -m http.server 8000
# ✅ http://localhost:8000/admin/ → funciona automáticamente
# ✅ http://localhost:8000/manual/ → funciona automáticamente
```

**Nginx (necesita configuración):**
```nginx
location /admin/ {
    try_files $uri $uri/ $uri/index.html =404;
}
location /manual/ {
    try_files $uri $uri/ $uri/index.html =404;
}
```

## Prueba Rápida (Checklist)

- [ ] Construir imagen: `docker build -t calima-client:test .`
- [ ] Ejecutar contenedor: `docker run -p 8080:80 calima-client:test`
- [ ] Probar ruta principal: http://localhost:8080/
- [ ] Probar admin: http://localhost:8080/admin/
- [ ] Probar manual: http://localhost:8080/manual/
- [ ] Verificar logs: `docker logs <container-id>`
- [ ] Verificar archivos: `docker exec -it <container-id> ls /usr/share/nginx/html/admin/`

## Resultado Esperado

✅ Todas las rutas deberían funcionar correctamente, igual que con `python3 -m http.server`, pero con mejor rendimiento y características de producción (caché, compresión gzip, etc.).