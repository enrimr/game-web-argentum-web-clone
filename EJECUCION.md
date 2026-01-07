# 🌐 Instrucciones para Ejecutar Argentum Demo

## ⚠️ Importante: Uso de un Servidor Web

Este juego **debe ser ejecutado bajo un servidor web** para funcionar correctamente. Abrir directamente el archivo `index.html` en un navegador puede causar errores debido a las **restricciones de seguridad CORS** (Cross-Origin Resource Sharing) que impiden cargar archivos locales.

## ❓ ¿Por qué se necesita un servidor web?

Los navegadores modernos implementan una política de seguridad llamada "Same-Origin Policy" que restringe cómo los documentos o scripts cargados desde un origen pueden interactuar con recursos de otro origen. Esto afecta especialmente cuando:

- El juego carga archivos JSON para los mapas
- El juego carga recursos dinámicamente (como los mapas de Canarias)
- Se realizan peticiones JavaScript para cargar estos recursos

Al abrir el archivo directamente, el navegador utiliza el protocolo `file://` en lugar de `http://` o `https://`, lo que activa estas restricciones y provoca errores como:

```
Access to fetch at 'file:///path/to/map.json' from origin 'null' has been blocked by CORS policy
```

## 🚀 Opciones para lanzar un servidor web local

### 1. Usando Python (Recomendado)

Python incluye un servidor HTTP simple y fácil de usar:

#### Python 3:
```bash
cd /ruta/a/argentum-demo
python3 -m http.server 9000
```

#### Python 2:
```bash
cd /ruta/a/argentum-demo
python -m SimpleHTTPServer 9000
```

Luego abre tu navegador y visita: `http://localhost:9000`

### 2. Usando Node.js

Si tienes Node.js instalado:

#### Usando módulo http-server:
```bash
# Instalar el módulo (solo la primera vez)
npm install -g http-server

# Ejecutar el servidor
cd /ruta/a/argentum-demo
http-server -p 9000
```

#### Usando módulo serve:
```bash
# Instalar el módulo (solo la primera vez)
npm install -g serve

# Ejecutar el servidor
cd /ruta/a/argentum-demo
serve -l 9000
```

### 3. Usando PHP

Si tienes PHP instalado:
```bash
cd /ruta/a/argentum-demo
php -S localhost:9000
```

### 4. Usando Live Server en Visual Studio Code

Si estás utilizando VS Code, puedes instalar la extensión "Live Server" y luego:
1. Abre el proyecto en VS Code
2. Haz clic con el botón derecho en `index.html`
3. Selecciona "Open with Live Server"

## 🔧 Consideraciones adicionales

### Puertos

- El número `9000` usado en los ejemplos puede ser cambiado por cualquier otro puerto disponible.
- Si encuentras un mensaje como "puerto ya en uso", prueba con otro número de puerto (ej: 8080, 3000, etc.).

### Ejecución permanente

- Los métodos mostrados arriba mantendrán el servidor activo mientras la terminal esté abierta.
- Para detener el servidor, presiona `Ctrl+C` en la terminal.

### Acceso desde otros dispositivos

- Por defecto, estos servidores solo permiten conexiones desde el mismo dispositivo.
- Para permitir acceso desde otros dispositivos en la misma red, consulta la documentación específica de cada herramienta.

## 🎮 Una vez lanzado el servidor

Cuando el servidor esté activo:

1. Abre tu navegador
2. Visita la dirección `http://localhost:9000` (o el puerto que hayas elegido)
3. El juego debería cargarse sin errores CORS
4. ¡Disfruta de la aventura!

---

Si encuentras problemas o tienes dudas sobre cómo ejecutar el juego, no dudes en abrir un issue en el repositorio.
