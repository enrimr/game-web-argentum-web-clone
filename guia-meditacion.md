# Guía para probar la animación de meditación estilo DBZ

## Preparación

1. Asegúrate de tener el juego abierto en un navegador ejecutando el archivo `index.html`
2. Verifica que estés en la rama `feature/magic-system` (donde están los cambios implementados)

## Activar la meditación

Hay **dos formas** de activar la meditación:

### Opción 1: Usando el botón en la interfaz
1. Busca en la interfaz el botón "Meditar" que debe aparecer en el panel de hechizos
2. Haz clic en él (el texto cambiará a "Dejar de Meditar")
3. Observa la animación de partículas estilo DBZ alrededor de tu personaje

### Opción 2: Usando el teclado
1. Simplemente presiona la tecla `M` en tu teclado
2. Observa la animación de partículas que rodea a tu personaje
3. Presiona `M` nuevamente para detener la meditación

## Si no ves la animación

1. Verifica la consola del navegador (F12) para ver si hay errores
2. Asegúrate de tener maná disponible para recuperar
3. Aumenta el nivel de tu habilidad de meditación:
   - Abre el panel de debug (ícono 🛠️ en la esquina superior derecha)
   - Haz clic en "Panel de Habilidades"
   - Usa los botones +10 o +50 para incrementar tu habilidad de "Meditación"
   
## Detalles técnicos

La animación funciona dibujando:
- Partículas en espiral ascendentes de colores violeta/púrpura
- Un aura pulsante alrededor del personaje
- Todo esto se renderiza sobre el sprite del personaje sin reemplazarlo

La animación se activa cuando el estado de animación del jugador es "meditating", que es lo que establece la función toggleMeditation() en MagicSystem.js.
