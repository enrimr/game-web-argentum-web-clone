# Dockerfile para Calima Online Client
# Usa nginx para servir archivos estáticos con soporte para rutas SPA

FROM nginx:alpine

# Instalar bash para el entrypoint script
RUN apk add --no-cache bash

# Crear directorio de trabajo
WORKDIR /usr/share/nginx/html

# Copiar archivos del cliente
COPY . .

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar y hacer ejecutable el script de entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto 80
EXPOSE 80

# Usar el script de entrypoint personalizado
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]