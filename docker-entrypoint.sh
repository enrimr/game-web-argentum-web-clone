#!/bin/bash
set -e

echo "Starting Calima Online Client..."

# Variables de entorno con valores por defecto
API_URL="${API_URL:-http://localhost:3000/api}"
WS_URL="${WS_URL:-http://localhost:3000}"
PORT="${PORT:-80}"

echo "Configuration:"
echo "  API_URL = ${API_URL}"
echo "  WS_URL  = ${WS_URL}"
echo "  PORT    = ${PORT}"

# Verificar que los archivos existen
echo "Checking files..."
ls -la /usr/share/nginx/html/ | head -20

# Verificar directorios importantes
echo "Checking admin directory..."
ls -la /usr/share/nginx/html/admin/ 2>/dev/null || echo "Warning: /admin directory not found"

echo "Checking manual directory..."
ls -la /usr/share/nginx/html/manual/ 2>/dev/null || echo "Warning: /manual directory not found"

# Generar env.js con las variables de entorno
echo "Generating env.js..."
cat > /usr/share/nginx/html/env.js <<EOF
window.ENV = {
    API_URL: "${API_URL}",
    WS_URL: "${WS_URL}"
};
EOF

echo "✅ env.js generated successfully"

# Generar nginx.conf con el puerto correcto (Railway usa $PORT dinámico)
echo "Generating nginx.conf for port ${PORT}..."
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen ${PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Configuración de logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Evita que nginx incluya el puerto interno en los redirects
    port_in_redirect off;

    # Comprimir respuestas
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cabeceras de seguridad
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;

    # env.js sin cache (se genera dinámicamente)
    location = /env.js {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        expires -1;
    }

    # Archivos estáticos con cache larga
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|map)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # Servir el directorio /admin como archivos estáticos
    location /admin/ {
        try_files \$uri \$uri/ \$uri/index.html =404;
    }

    # Servir el directorio /manual como archivos estáticos
    location /manual/ {
        try_files \$uri \$uri/ \$uri/index.html =404;
    }

    # Servir el directorio /api como archivos estáticos
    location /api/ {
        try_files \$uri \$uri/ =404;
    }

    # Servir directorios de recursos estáticos
    location /img/ {
        try_files \$uri =404;
    }

    location /resources/ {
        try_files \$uri =404;
    }

    location /styles/ {
        try_files \$uri =404;
    }

    # Para la raíz y todas las demás rutas, servir index.html (SPA routing)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Manejo de errores
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

echo "✅ nginx.conf generated for port ${PORT}"

# Verificar configuración de nginx
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g "daemon off;"