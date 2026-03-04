# Dockerfile para Calima Online Client
# Usa nginx para servir archivos estáticos con soporte para rutas SPA
# Las URLs del servidor se inyectan mediante variables de entorno Docker:
#   API_URL  → URL de la API REST
#   WS_URL   → URL del WebSocket (Socket.io)
#   PORT     → Puerto en el que escucha nginx (Railway lo asigna dinámicamente)
#
# Ejemplo de uso:
#   docker build -t calima-client .
#   docker run -p 8080:80 \
#     -e API_URL=https://mi-servidor.com/api \
#     -e WS_URL=https://mi-servidor.com \
#     calima-client

FROM nginx:alpine

# Instalar bash para el entrypoint script
RUN apk add --no-cache bash

# Crear directorio de trabajo
WORKDIR /usr/share/nginx/html

# Copiar archivos del cliente
COPY . .

# Copiar y hacer ejecutable el script de entrypoint
# Este script generará nginx.conf dinámicamente con el puerto correcto
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto 80 (Railway lo remapea automáticamente)
EXPOSE 80

# Usar el script de entrypoint personalizado
ENTRYPOINT ["/docker-entrypoint.sh"]