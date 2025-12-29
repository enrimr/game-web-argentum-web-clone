# Plan de Implementación - NPCs en Ciudad con Minimapa

## Cambios necesarios en game.js:

### 1. Añadir array de NPCs al gameState
```javascript
npcs: [], // NPCs del juego (comerciantes, herreros, etc.)
```

### 2. Crear sprites de NPCs
- Mercader (verde)
- Herrero (gris/metal)
- Curandero (blanco/cruz roja)
- Banquero (dorado)

### 3. Función generateNPCs()
Crear NPCs según el mapa actual:
- Ciudad: Mercader, Herrero, Curandero, Banquero
- Mercado: Mercader, Alquimista
- Campo: Entrenador

### 4. Renderizar NPCs
Añadir en la función render() después de enemies

### 5. Interactuar con NPCs
Modificar función interact() para detectar NPCs

### 6. Mostrar NPCs en minimapa
Color diferente (amarillo/dorado) para NPCs en renderMinimap()

## Archivos a modificar:
1. game.js - Añadir toda la lógica
2. Probar en navegador
3. Commit cambios

Voy a implementarlo paso a paso...
