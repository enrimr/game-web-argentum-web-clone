# Sistema de Criminalidad y Facciones

## Inspiración: Argentum Online

### Sistema de Status Ciudadano/Criminal

#### Estados del Jugador

1. **Ciudadano** (Estado inicial)
   - Puede entrar ciudades libremente
   - Los guardias NO atacan
   - Puede comerciar con todos los NPCs
   - Color nombre: Según facción

2. **Criminal** 
   - Los guardias atacan al verlo
   - NO puede entrar ciudades seguras
   - Algunos NPCs no comercian con criminales
   - Color nombre: **ROJO** (independiente de facción)

3. **Rango Criminal** (0-100)
   - 0-19: Ciudadano
   - 20-49: Criminal menor (guardias alertan)
   - 50-79: Criminal (guardias atacan)
   - 80-100: Asesino (guardias atacan en todo el mapa)

#### Cómo Convertirse en Criminal

**Atacar Jugadores/Bots Ciudadanos:**
- 1er ataque a ciudadano: +10 puntos criminales
- 2do ataque: +15 puntos
- 3er ataque: +20 puntos
- Matar ciudadano: +50 puntos

**Atacar Jugadores/Bots Criminales:**
- NO suma puntos criminales
- De hecho, resta -5 puntos (cazar criminales)

**Robar/Saquear:**
- Robar de bots muertos: +5 puntos
- Robar de jugadores muertos: +10 puntos

#### Cómo Redimir Status

**Decay Natural:**
- -1 punto cada 5 minutos de juego
- -5 puntos por cada 30 minutos online

**Misiones de Redención:**
- Entregar oro al sacerdote: -20 puntos por 1000 gold
- Cazar criminales: -10 puntos por criminal eliminado
- Tiempo en prisión: Estar 10 minutos en celda = -50 puntos

---

## Sistema de Afiliación a Facciones

### Cómo Unirse a una Facción

#### Opción 1: NPC Reclutador
- Cada ciudad tiene un **Reclutador de Facción**
- Requisitos:
  - Nivel mínimo: 5
  - No ser criminal (< 20 puntos)
  - Pagar cuota de entrada: 500 gold
  - Aceptar código de conducta

#### Opción 2: Invitación de Líder
- Un jugador de alto rango puede invitar
- Requisitos más flexibles

### Beneficios por Facción

**Reino:**
- +10% descuento en tiendas de ciudad
- Guardias te ayudan en combate
- Acceso a zonas exclusivas del reino
- No puedes atacar otros miembros del Reino

**Armada:**
- +15% velocidad en barcos (futuro)
- Acceso a puertos exclusivos
- Comercio marítimo con bonus
- No puedes atacar Armada ni Reino

**Legión:**
- +10% daño contra Reino/Armada
- Acceso a fortalezas oscuras
- Los guardias TE ATACAN siempre
- Puedes atacar cualquiera excepto Caos/Legión

**Caos:**
- +15% daño contra todos
- Sin restricciones de ataque
- Los guardias TE ATACAN siempre
- Acceso a zonas prohibidas
- NO hay penalización por crímenes
- Puedes atacar cualquiera excepto Caos/Legión

**Neutral:**
- Puede comerciar con TODAS las facciones
- Sin bonificaciones especiales
- Puede atacar a cualquiera pero se vuelve criminal

### Cambiar de Facción

- **Costo:** 5000 gold
- **Penalización:** Pierdes todo el rango
- **Cooldown:** 30 días de juego
- **Enemigos:** La facción anterior te considera enemigo por 7 días

---

## Sistema de Reputación por Facción

### Rangos de Reputación (-100 a +100)

**Enemigo (-100 a -50):**
- NPCs de esa facción no te hablan
- Guardias de esa facción te atacan
- Precios 300% más caros

**Hostil (-49 a -1):**
- NPCs desconfían
- Precios 150% más caros
- Guardias vigilan de cerca

**Neutral (0):**
- Estado inicial
- Precios normales

**Amigable (+1 a +49):**
- Precios 10% más baratos
- Acceso a misiones especiales

**Aliado (+50 a +100):**
- Precios 25% más baratos
- Acceso a items exclusivos
- Guardias te ayudan en combate

### Ganar/Perder Reputación

**Ganar:**
- Completar misiones de la facción: +10
- Donar oro al templo de la facción: +5 por 500 gold
- Eliminar enemigos de la facción: +5
- Ayudar a miembros de la facción: +3

**Perder:**
- Atacar miembros de la facción: -20
- Matar miembros de la facción: -50
- Robar en territorios de la facción: -10
- Fallar misiones de la facción: -5

---

## Implementación Propuesta

### Fase 1: Sistema Base
1. Añadir propiedades al jugador:
   - `player.faction` (null por defecto)
   - `player.criminalStatus` (0-100)
   - `player.factionReputation` (objeto con reputación por facción)

2. Crear UI para:
   - Ver status criminal actual
   - Ver reputación con cada facción
   - Seleccionar facción inicial

3. Modificar guardias:
   - Atacar jugadores criminales (>= 50 puntos)
   - Ignorar jugadores ciudadanos

### Fase 2: Sistema de Combate PvP
1. Detectar ataques a otros jugadores/bots
2. Sumar puntos criminales si atacas ciudadanos
3. Mostrar advertencia antes de primer ataque
4. Timer de decay automático

### Fase 3: NPCs Reclutadores
1. Crear NPC "Reclutador de [Facción]"
2. Diálogo para unirse a facción
3. Validar requisitos
4. Asignar facción al jugador

### Fase 4: Beneficios y Restricciones
1. Implementar bonificaciones por facción
2. Implementar restricciones de ataque
3. Modificar precios según reputación
4. Crear zonas exclusivas por facción

---

## Pros y Contras de Este Sistema

### Pros ✅
- **Rejugabilidad:** Diferentes experiencias por facción
- **PvP significativo:** Consecuencias por atacar
- **Economía dinámica:** Precios varían según reputación
- **Contenido exclusivo:** Zonas/items por facción
- **Rol playing:** Los jugadores eligen su camino

### Contras ❌
- **Complejidad:** Sistema grande para implementar
- **Balance:** Difícil equilibrar beneficios
- **Griefers:** Criminales pueden molestar a nuevos jugadores
- **Zonas seguras necesarias:** Ciudades deben proteger a ciudadanos

---

## Recomendaciones

### Implementación Progresiva

**Semana 1:**
- ✅ Sistema de facciones básico (YA HECHO)
- Añadir `faction` y `criminalStatus` al jugador
- UI para mostrar status

**Semana 2:**
- Sistema de puntos criminales
- Guardias atacan criminales del jugador
- Decay natural de criminalidad

**Semana 3:**
- NPCs reclutadores
- Beneficios básicos por facción
- Restricciones de ataque entre facciones

**Semana 4:**
- Sistema de reputación completo
- Precios dinámicos
- Zonas exclusivas

### Alternativa Simplificada

Si quieres algo más simple y rápido:

1. **Solo 3 estados:** Ciudadano, Criminal, Asesino
2. **Facciones predefinidas** al crear personaje
3. **No cambio de facción** (permanente)
4. **Guardias simples:** Atacan si criminal >= 50
5. **Decay rápido:** -10 puntos cada 2 minutos

¿Qué te parece? ¿Prefieres el sistema completo o la versión simplificada?
