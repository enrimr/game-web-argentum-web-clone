# 🎮 Guía Rápida: Setup Multijugador Calima Online

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor Backend

```bash
# Terminal 1
cd calima-online-server
npm install
cp .env.example .env
```

**Importante:** Edita `.env` con tu configuración:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/calima-online
JWT_SECRET=tu_secreto_seguro_aqui
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080
```

**Iniciar MongoDB:**
```bash
# macOS con Homebrew
brew services start mongodb-community
```

**Iniciar servidor:**
```bash
npm run dev
```

Deberías ver:
```
✅ MongoDB conectado: localhost
🚀 Servidor Calima Online iniciado
📡 Puerto: 3000
```

### 2. Iniciar el Cliente

```bash
# Terminal 2
cd calima-online-client
# Usar tu servidor web preferido, por ejemplo:
python3 -m http.server 8080
```

### 3. Probar la Integración

**Abrir navegador:**
```
http://localhost:8080
```

## 🧪 Testing Paso a Paso

### Test 1: Registro de Usuario ✅
1. Click en "Crear Cuenta"
2. Rellenar formulario:
   - Usuario: `testuser1`
   - Email: `test@example.com`
   - Contraseña: `test123`
3. Aceptar términos
4. Click "Crear Cuenta"
5. **Resultado esperado:** Mensaje de éxito y redirección a login

### Test 2: Inicio de Sesión ✅
1. En pantalla de login, usar las credenciales creadas
2. Click "Iniciar Sesión"
3. **Resultado esperado:** 
   - Login exitoso
   - Pantalla de personajes (vacía si es primera vez)
   - Mensaje en consola: "Cargados 0 personajes del servidor"

### Test 3: Crear Personaje ✅
1. Click en botón "Crear Nuevo Personaje" (+)
2. Configurar personaje:
   - Nombre: `Guerrero123`
   - Clase: Guerrero
   - Raza: Humano
   - Colores: Seleccionar cualquiera
3. Click "Crear Personaje"
4. **Resultado esperado:**
   - Personaje creado exitosamente
   - Aparece en lista de personajes
   - Guardado en base de datos MongoDB

### Test 4: Verificar en MongoDB ✅
```bash
# En otra terminal
mongosh calima-online

# Ver usuarios
db.users.find().pretty()

# Ver personajes
db.characters.find().pretty()
```

### Test 5: Múltiples Personajes ✅
1. Crear hasta 3 personajes
2. **Resultado esperado:**
   - Se pueden crear hasta 3
   - Al intentar crear el 4º, debe dar error
   - Todos visibles en la lista

### Test 6: Eliminar Personaje ✅
1. Click en "Eliminar" de un personaje
2. Confirmar eliminación
3. **Resultado esperado:**
   - Eliminado del servidor
   - Eliminado de la lista local
   - Slot disponible para crear nuevo

### Test 7: Logout y Login de Nuevo ✅
1. Click "Cerrar Sesión"
2. Volver a iniciar sesión
3. **Resultado esperado:**
   - Personajes cargados automáticamente
   - Misma lista que antes

## 🔍 Debugging

### Ver Logs del Servidor
```bash
# El servidor muestra logs automáticamente:
✅ testuser1 se unió al mapa newbie_city
🔌 testuser1 se desconectó
```

### Ver Logs del Cliente
Abrir consola del navegador (F12):
```javascript
// Debería mostrar:
"Cargados X personajes del servidor"
"✅ Conectado al servidor WebSocket"
```

### Verificar API directamente
```bash
# Verificar salud del servidor
curl http://localhost:3000/health

# Ver personajes (necesitas token)
curl -H "Authorization: Bearer tu_token" http://localhost:3000/api/characters
```

## 🎯 Flujo Completo Implementado

```
Usuario → Registro → Login → Cargar Personajes
                                    ↓
                              ¿Tiene personajes?
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
              SI: Mostrar lista              NO: Solo botón crear
                    ↓                               ↓
         Crear/Eliminar/Jugar           Crear primer personaje
                    ↓                               ↓
              Seleccionar personaje ←───────────────┘
                    ↓
              Iniciar juego online
                    ↓
         WebSocket conectado + Sincronización
```

## 📊 Estructura de Datos

### Personaje en Servidor (MongoDB):
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  userId: "507f1f77bcf86cd799439012",
  name: "Guerrero123",
  class: "guerrero",
  stats: {
    level: 1,
    experience: 0,
    gold: 100,
    hp: 120,
    maxHp: 120,
    ...
  },
  inventory: [...],
  equipment: {...},
  lastPlayed: "2026-01-28T18:00:00.000Z"
}
```

### Personaje en Cliente (Local):
```javascript
{
  id: "507f1f77bcf86cd799439011",
  name: "Guerrero123",
  class: "guerrero",
  race: "humano",
  level: 1,
  experience: 0,
  gold: 100,
  appearance: {...},
  stats: {...},
  inventory: [...],
  equipment: {...}
}
```

## ⚙️ Configuración Avanzada

### Cambiar URL del Servidor

En `js/api/ApiClient.js`:
```javascript
this.baseUrl = 'https://tu-servidor.com/api';
```

En `js/api/SocketClient.js`:
```javascript
this.serverUrl = 'https://tu-servidor.com';
```

### Modo Híbrido

El cliente detecta automáticamente si el servidor está disponible:
- **Servidor online:** Funcionalidad completa de multijugador
- **Servidor offline:** Funciona en modo local sin problemas

## ✨ Funcionalidades Completadas

- ✅ Registro de usuarios con validación
- ✅ Login con JWT
- ✅ Carga automática de personajes del usuario
- ✅ Creación de personajes en servidor (máx 3)
- ✅ Eliminación de personajes con confirmación
- ✅ Sincronización bidireccional cliente-servidor
- ✅ Detección automática de estado del servidor
- ✅ Fallback a modo local si servidor está offline

## 📝 Notas

- Los personajes se sincronizan automáticamente al hacer login
- La lista se actualiza en tiempo real al crear/eliminar
- Si el servidor está offline, muestra mensaje apropiado
- El modo local sigue funcionando independientemente

---

**Última actualización:** 28/01/2026