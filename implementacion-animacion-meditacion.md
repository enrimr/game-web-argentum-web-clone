# Implementación de la Animación de Meditación Estilo Dragon Ball Z

## Ubicación del Código

La animación de meditación estilo DBZ no utiliza un sprite tradicional o imagen pre-renderizada. En su lugar, se genera dinámicamente mediante código en el archivo:

```
js/core/Renderer.js
```

Específicamente en la función `getAnimatedPlayerSprite()` bajo la condición `else if (animation.state === 'meditating')`.

## Cómo funciona

1. **Intenta usar sprites específicos** (si existieran):
   ```javascript
   if (pulse > 0) {
       spriteName = `playerMeditating1`;  // Posición 1 de meditación
   } else {
       spriteName = `playerMeditating2`;  // Posición 2 de meditación
   }
   ```

2. **Si no existen, usa un sprite base según la dirección**:
   ```javascript
   const fallbackSprite = `player${facing.charAt(0).toUpperCase() + facing.slice(1)}`;
   ```

3. **La magia ocurre con el dibujo dinámico**, no con sprites:
   ```javascript
   // Dibujar la animación estilo DBZ (espiral cónica)
   ctx.save();
        
   // Centro del jugador
   const centerX = playerScreenPos.x + TILE_SIZE/2;
   const centerY = playerScreenPos.y + TILE_SIZE/2;
   
   // Parámetros de la animación usando el tiempo actual
   const baseSpeed = 0.005;  
   const heightVariation = Math.sin(currentTime * 0.003) * 5;
   const maxHeight = 70 + heightVariation;  // Altura máxima de la espiral
   const spiralSpeed = currentTime * 0.01;  // Velocidad de rotación
   
   // Dibujar múltiples espirales para crear efecto de carga de energía
   for (let i = 0; i < 3; i++) {
       const offset = i * (Math.PI * 2 / 3); // Distribuir espirales equitativamente
       
       // Color específico para cada espiral
       const colors = [
           'rgba(138, 43, 226, 0.7)', // Violeta
           'rgba(75, 0, 130, 0.7)',   // Índigo
           'rgba(106, 90, 205, 0.7)'  // SlateBlue
       ];
       
       // Dibujar espiral ascendente
       ctx.beginPath();
       for (let y = 0; y < maxHeight; y += 0.5) {
           const progress = y / maxHeight; // 0 a 1
           const radius = 15 * Math.pow(progress, 0.7) * (1 + Math.sin(progress * 5 + currentTime * 0.01) * 0.1);
           const angle = currentTime * 0.01 + y * 0.2 + offset;
           const x = centerX + Math.cos(angle) * radius;
           const yPos = centerY - y - 5;
           
           // Tamaño de las partículas varía con el pulso
           const particleSize = 2 + Math.sin(currentTime * baseSpeed + y * 0.2) * 1.5;
           
           // Opacidad varía con la altura (más transparente arriba)
           const opacity = 0.8 * (1 - Math.pow(progress, 2));
           
           ctx.fillStyle = colors[i].replace('0.7', opacity.toFixed(2));
           ctx.fillRect(x - particleSize/2, yPos - particleSize/2, particleSize, particleSize);
       }
   }
   ```

4. **Adicionalmente se dibuja un aura pulsante**:
   ```javascript
   // Dibujar aura resplandeciente alrededor del personaje
   const pulseIntensity = 0.5 + Math.abs(pulse) * 0.5;
   const gradient = ctx.createRadialGradient(
       centerX, centerY, 5,
       centerX, centerY, 25 * pulseIntensity
   );
   gradient.addColorStop(0, 'rgba(138, 75, 175, 0.5)');
   gradient.addColorStop(0.7, 'rgba(138, 75, 175, 0.3)');
   gradient.addColorStop(1, 'rgba(138, 75, 175, 0)');
   ctx.fillStyle = gradient;
   ctx.beginPath();
   ctx.arc(centerX, centerY, 25 * pulseIntensity, 0, Math.PI * 2);
   ctx.fill();
   ```

## Resumen

En resumen, no hay archivos de sprite especiales para la animación de meditación - todo se genera en tiempo real con código de dibujo en Canvas, lo que permite efectos más dinámicos y fluidos. Este enfoque permite crear una animación impresionante similar al "aura" que se ve en Dragon Ball Z cuando los personajes meditan o cargan su ki.

La implementación usa:
- Partículas generadas proceduralmente
- Espirales que ascienden con variación en tamaño y opacidad
- Efectos de pulso para crear movimiento
- Gradientes radiales para simular el aura alrededor del personaje

Este tipo de animación dinámica es más flexible que usar sprites, pues permite cambios sutiles y variaciones basadas en el tiempo que serían difíciles de lograr con imágenes pre-renderizadas.
