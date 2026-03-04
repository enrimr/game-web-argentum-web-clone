#!/bin/sh
# docker-entrypoint.sh
# 1. Genera env.js con las variables de entorno (API_URL, WS_URL)
# 2. Genera nginx.conf usando el puerto que Railway asigna via $PORT
# 3. Arranca nginx

API_URL="${API_URL:-http://localhost:3000/api}"
WS_URL="${WS_URL:-http://localhost:3000}"
PORT="${PORT:-80}"

# Generar env.js
cat > /usr/share/nginx/html/env.js <<EOF
window.ENV = {
    API_URL: "${API_URL}",
    WS_URL: "${WS_URL}"
};
EOF

echo "✅ env.js generado:"
echo "   API_URL = ${API_URL}"
echo "   WS_URL  = ${WS_URL}"
echo "   PORT    = ${PORT}"

# Generar nginx.conf con el puerto correcto (Railway usa $PORT dinámico)
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen ${PORT};
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;

    # env.js sin cache
    location = /env.js {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        expires -1;
    }

    # Archivos estáticos con cache larga
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /manual {
        try_files \$uri \$uri/ /manual/index.html;
    }

    location /admin {
        try_files \$uri \$uri/ /admin/index.html;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "✅ nginx.conf generado con puerto ${PORT}"

# Arrancar nginx en foreground
exec nginx -g "daemon off;"
