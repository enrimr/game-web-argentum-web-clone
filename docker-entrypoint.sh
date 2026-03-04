#!/bin/bash
set -e

echo "Starting Calima Online Client..."

# Verificar que los archivos existen
echo "Checking files..."
ls -la /usr/share/nginx/html/

# Verificar directorios importantes
echo "Checking admin directory..."
ls -la /usr/share/nginx/html/admin/ 2>/dev/null || echo "Warning: /admin directory not found"

echo "Checking manual directory..."
ls -la /usr/share/nginx/html/manual/ 2>/dev/null || echo "Warning: /manual directory not found"

# Si existe el archivo de variables de entorno, procesarlo
if [ -f "/usr/share/nginx/html/env.example.js" ]; then
    echo "Processing environment variables..."
    
    # Crear env.js desde env.example.js si no existe
    if [ ! -f "/usr/share/nginx/html/env.js" ]; then
        cp /usr/share/nginx/html/env.example.js /usr/share/nginx/html/env.js
    fi
    
    # Reemplazar variables de entorno si están definidas
    if [ -n "$API_URL" ]; then
        sed -i "s|API_URL:.*|API_URL: '${API_URL}',|g" /usr/share/nginx/html/env.js
    fi
    
    if [ -n "$WS_URL" ]; then
        sed -i "s|WS_URL:.*|WS_URL: '${WS_URL}',|g" /usr/share/nginx/html/env.js
    fi
fi

# Verificar configuración de nginx
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec "$@"