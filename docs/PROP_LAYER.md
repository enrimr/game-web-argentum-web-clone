# PropLayer: Sistema de Objetos Decorativos

## 1. Introducción

PropLayer es una nueva capa introducida en el sistema de mapas multicapa para manejar objetos decorativos e interactivos que no encajan bien en las capas tradicionales (base, techos, ventanas, puertas).

Esta capa permite una mayor flexibilidad visual y funcional en el diseño de mapas sin complicar la lógica de colisiones de la capa base.

## 2. Arquitectura del Sistema de Capas

El sistema de capas ahora consiste en:

| Capa | Descripción | Prioridad de Renderizado |
|------|-------------|--------------------------|
| baseMap | Terreno y estructuras base | 1 (más bajo) |
| treeLayer | Árboles y elementos naturales altos | 2 |
| propLayer | Objetos decorativos e interactivos | 3 |
| doorLayer | Puertas de edificios | 4 |
| windowLayer | Ventanas de edificios | 6 (después del jugador) |
| roofLayer | Techos de edificios | 7 (más alto) |

El PropLayer se renderiza después de los árboles pero antes de las puertas, lo que permite que los props estén por encima de los elementos del terreno pero por debajo de las estructuras de edificios.

## 3. Características Principales

- **Separación de Decoraciones**: Los objetos decorativos (antorchas, muebles, carteles, etc.) están ahora en su propia capa, mejorando la organización del código
- **Flexibilidad Visual**: Permite colocar objetos en cualquier tile, incluso encima de otros elementos del mapa
- **Procesamiento Independiente**: La lógica de colisiones y comportamiento puede ser específica para props
- **Manejo de Transparencia**: Aplica efectos de transparencia específicos cuando el jugador está dentro de edificios
- **Debugging Simplificado**: Cada tipo de elemento tiene su propia capa, facilitando la depuración visual

## 4. Implementación Técnica

La implementación de PropLayer sigue el patrón de las otras capas:

```javascript
// En gameState
propLayer: [], // Capa para objetos decorativos

// En MapProcessor
if (mapData.propLayer && Array.isArray(mapData.propLayer)) {
    gameState.propLayer = mapData.propLayer;
}

// En LayerRenderers
export function renderPropLayer(camera, ctx) {
    // Renderizar objetos decorativos
}

// En RendererCore
export const layerVisibility = {
    // ...
    propLayer: true,
    // ...
};
```

## 5. Uso en Diseño de Mapas

Al diseñar un mapa, ahora puedes colocar objetos decorativos como:

- Antorchas y fuentes de luz
- Muebles y decoraciones
- Carteles y letreros informativos
- Vegetación pequeña (arbustos, flores)
- Objetos interactivos menores

Ejemplo de estructura de un mapa con PropLayer:

```javascript
const mapaEjemplo = {
    layers: {
        base: [[/* tiles base */]],
        objects: [[/* objetos estructurales */]],
        props: [[/* objetos decorativos */]],
        doors: [[/* puertas */]],
        windows: [[/* ventanas */]],
        roofs: [[/* techos */]]
    }
};
```

## 6. Beneficios para el Rendimiento

- **Renderizado Selectivo**: Solo renderiza props cuando están en el viewport
- **Cacheo Eficiente**: Mejor organización permite cacheo más eficiente
- **Culling Preciso**: Facilita eliminar objetos no visibles de forma específica
- **Menor Complejidad Lógica**: Separa la lógica de props de otras entidades

## 7. Próximas Mejoras

- Sistema de propiedades para props (interactividad, iluminación, etc.)
- Animaciones específicas para props
- Efectos de partículas asociados a ciertos props
- Integración con sistema de iluminación dinámica
- Editor visual para colocación de props

## 8. Consideraciones de Rendimiento

PropLayer agrega una capa adicional que debe ser procesada durante el renderizado. Sin embargo, el impacto en el rendimiento es mínimo ya que:

1. Solo se procesan props dentro del viewport
2. Muchos props son estáticos y pueden ser cacheados
3. La estructura de datos es eficiente (array bidimensional)

## 9. Conclusión

PropLayer es una adición importante que mejora significativamente la flexibilidad y expresividad visual del sistema de mapas, permitiendo crear entornos más detallados y atractivos sin sacrificar rendimiento o arquitectura de código limpia.
