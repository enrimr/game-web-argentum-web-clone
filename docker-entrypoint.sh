#!/bin/sh
# docker-entrypoint.sh
# Genera /usr/share/nginx/html/env.js con las variables de entorno Docker
# antes de arrancar nginx.
#
# Variables esperadas:
#   API_URL  → URL de la API REST  (por defecto: http://localhost:3000/api)
#   WS_URL   → URL del WebSocket   (por defecto: http://localhost:3000)

API_URL="${API_URL:-http://localhost:3000/api}"
WS_URL="${WS_URL:-http://localhost:3000}"

cat > /usr/share/nginx/html/env.js <<EOF
window.ENV = {
    API_URL: "${API_URL}",
    WS_URL: "${WS_URL}"
};
EOF

echo "✅ env.js generado:"
echo "   API_URL = ${API_URL}"
echo "   WS_URL  = ${WS_URL}"

# Arrancar nginx en foreground
exec nginx -g "daemon off;"
