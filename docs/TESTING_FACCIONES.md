# Guía de Testing - Sistema de Facciones y Criminalidad

## Cómo Probar el Sistema (Fase 1)

### 1. Iniciar el Juego

```bash
python3 -m http.server 9000
```

Luego abre: `http://localhost:9000?local`

### 2. Abrir Consola del Navegador

Presiona **F12** → pestaña **Console**

---

## Comandos de Testing

### Ver Estado Actual del Jugador

```javascript
// Ver todas las propiedades del jugador
gameState.player

// Ver facción actual
gameState.player.faction

// Ver status criminal
gameState.player.criminalStatus

// Ver reputación con facciones
gameState.player.factionReputation
```

### Cambiar Facción del Jugador

```javascript
// Unirse al Reino (facción buena)
gameState.player.faction = 'Reino'

// Unirse a Caos (facción malvada)
gameState.player.faction = 'Caos'

// Unirse a Legión (facción malvada)
gameState.player.faction = 'Legión'

// Sin facción
gameState.player.faction = null
```

### Modificar Puntos Criminales

```javascript
// Importar funciones de facciones
import('./js/systems/Factions.js').then(({ addCriminalPoints, reduceCriminalPoints, getCriminalStatusText }) => {
  // Añadir 60 puntos criminales (te vuelve criminal)
  addCriminalPoints(gameState.player, 60);
  console.log('Status:', getCriminalStatusText(gameState.player.criminalStatus));
  
  // Reducir 30 puntos
  reduceCriminalPoints(gameState.player, 30);
  console.log('Status:', getCriminalStatusText(gameState.player.criminalStatus));
});
```

### Modificar Reputación con Facciones

```javascript
// Aumentar reputación con el Reino
gameState.player.factionReputation.Reino = 50  // Aliado

// Disminuir reputación con Caos
gameState.player.factionReputation.Caos = -80  // Enemigo

// Ver todas las reputaciones
console.table(gameState.player.factionReputation)
```

---

## Pruebas Específicas

### Test 1: Jugador Ciudadano vs Guardias

```javascript
// 1. Ser ciudadano (< 50 puntos)
gameState.player.criminalStatus = 0
gameState.player.faction = 'Reino'

// 2. Ir a arena de guardias
import('./js/core/Game.js').then(({ changeMap }) => {
  changeMap('guard_test_arena', 30, 20);
});

// Resultado esperado: Guardias te ignoran ✅
```

### Test 2: Jugador Criminal vs Guardias

```javascript
// 1. Convertirse en criminal
gameState.player.criminalStatus = 60
gameState.player.faction = 'Reino'  // Aunque sea Reino, es criminal

// 2. Ir a arena de guardias
import('./js/core/Game.js').then(({ changeMap }) => {
  changeMap('guard_test_arena', 30, 20);
});

// Resultado esperado: Guardias te atacan ⚔️
```

### Test 3: Facción Caos (Siempre Atacado)

```javascript
// 1. Unirse a Caos
gameState.player.faction = 'Caos'
gameState.player.criminalStatus = 0  // Aunque no seas criminal

// 2. Ir a arena
import('./js/core/Game.js').then(({ changeMap }) => {
  changeMap('guard_test_arena', 30, 20);
});

// Resultado esperado: Guardias atacan (facción malvada) ⚔️
```

### Test 4: Ver Color de Nombre

```javascript
import('./js/systems/Factions.js').then(({ getNameColor }) => {
  // Ciudadano del Reino
  console.log('Reino ciudadano:', getNameColor(0, 'Reino'));  // Azul
  
  // Criminal del Reino
  console.log('Reino criminal:', getNameColor(60, 'Reino'));  // Rojo
  
  // Caos ciudadano
  console.log('Caos:', getNameColor(0, 'Caos'));  // Rojo (facción)
});
```

### Test 5: Probar Todos los Status

```javascript
import('./js/systems/Factions.js').then(({ getCriminalStatusText }) => {
  console.log('0 puntos:', getCriminalStatusText(0));    // Ciudadano
  console.log('25 puntos:', getCriminalStatusText(25));  // Criminal Menor
  console.log('60 puntos:', getCriminalStatusText(60));  // Criminal
  console.log('90 puntos:', getCriminalStatusText(90));  // Asesino
});
```

---

## Escenarios de Testing Completos

### Escenario A: Ciclo de Vida Criminal

```javascript
// 1. Empezar como ciudadano
gameState.player.criminalStatus = 0
console.log('Inicio:', getCriminalStatusText(0))  // Ciudadano

// 2. Atacar a ciudadano (simulado)
import('./js/systems/Factions.js').then(({ addCriminalPoints }) => {
  addCriminalPoints(gameState.player, 10);
  console.log('Después 1er ataque:', gameState.player.criminalStatus);  // 10
  
  addCriminalPoints(gameState.player, 15);
  console.log('Después 2do ataque:', gameState.player.criminalStatus);  // 25
  
  addCriminalPoints(gameState.player, 30);
  console.log('Después 3er ataque:', gameState.player.criminalStatus);  // 55 - Criminal!
});

// 3. Los guardias ahora te atacan
// Ve a la arena y compruébalo
```

### Escenario B: Redención

```javascript
// 1. Ser criminal
gameState.player.criminalStatus = 70

// 2. Redimir pagando al sacerdote (simulado)
import('./js/systems/Factions.js').then(({ reduceCriminalPoints }) => {
  reduceCriminalPoints(gameState.player, 20);  // -20 por 1000 gold
  console.log('Después donación:', gameState.player.criminalStatus);  // 50
  
  reduceCriminalPoints(gameState.player, 20);
  console.log('Después 2da donación:', gameState.player.criminalStatus);  // 30 - Ya no criminal
});
```

### Escenario C: Cambiar de Facción

```javascript
// 1. Sin facción
console.log('Inicio:', gameState.player.faction);  // null

// 2. Unirse a Reino
gameState.player.faction = 'Reino'
console.log('Facción:', gameState.player.faction);  // Reino

// 3. Cambiar a Caos (traición!)
gameState.player.faction = 'Caos'
gameState.player.factionReputation.Reino = -50  // Reino te odia
console.log('Nueva facción:', gameState.player.faction);  // Caos
console.log('Reputación Reino:', gameState.player.factionReputation.Reino);  // -50
```

---

## Estado Actual del Repositorio

```
78e12f9..a93dbcf  main -> main
```

## Archivos Creados/Modificados

1. **`docs/SISTEMA_CRIMINALIDAD_FACCIONES.md`** - Diseño completo
2. **`js/state.js`** - Propiedades añadidas
3. **`js/systems/Factions.js`** - Funciones de criminalidad

## Siguiente Paso

**Fase 2:** Implementar UI para mostrar status y detectar ataques PvP

¡Prueba estos comandos en la consola y verás cómo funciona el sistema! 🔍
</result>
<task_progress>
- [x] Añadir propiedades al jugador
- [x] Expandir Factions.js
- [x] Crear guía de testing
- [x] Hacer commit y push
</task_progress>
</attempt_completion>
