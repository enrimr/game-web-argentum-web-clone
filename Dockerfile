# Dockerfile para Calima Online Client
# Usa nginx para servir archivos estáticos en producción
# Las URLs del servidor se inyectan mediante variables de entorno Docker:
#   API_URL  → URL de la API REST
#   WS_URL   → URL del WebSocket (Socket.io)
#
# Ejemplo de uso:
#   docker build -t calima-client .
#   docker run -p 8080:80 \
#     -e API_URL=https://mi-servidor.com/api \
#     -e WS_URL=https://mi-servidor.com \
#     calima-client

FROM nginx:alpine

# Copiar archivos del cliente al directorio de nginx
COPY . /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script de arranque: genera env.js con las variables de entorno y arranca nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
