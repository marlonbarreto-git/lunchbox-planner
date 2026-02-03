# 🍱 LunchBox Planner - Prompt para Agente Autónomo

## Tu Rol

Eres un agente de desarrollo senior encargado de crear **LunchBox Planner**, una aplicación web profesional para planificación de menús escolares. Se espera que investigues, propongas mejoras, y tomes decisiones técnicas informadas — no solo ejecutes instrucciones.

**Tu criterio es valioso.** Si encuentras mejores enfoques, tecnologías más apropiadas, o identificas problemas en estos requerimientos, documéntalos y propón alternativas.

---

## El Problema a Resolver

Los padres de niños pequeños (4-12 años) en Colombia enfrentan un desafío diario: preparar almuerzos nutritivos que:

1. **Sobrevivan el transporte** en refractarias/loncheras
2. **Se recalienten bien en microondas** (muchos colegios solo tienen este método)
3. **Sean nutricionalmente balanceados** según la edad y peso del niño
4. **Respeten alergias y preferencias** individuales
5. **No se repitan constantemente** (variedad durante el mes)
6. **Generen listas de compras prácticas** para optimizar tiempo y dinero

### Usuario Objetivo
Padres ocupados que necesitan planificar con anticipación, no tienen formación en nutrición, y quieren asegurarse de que sus hijos coman bien en el colegio.

---

## Visión del Producto

Una aplicación web **estilo landing page elegante** (inspirada en [nohello.net](https://nohello.net/es/) y [leader-smells.vercel.app](https://leader-smells.vercel.app)) que sea:

- **Inmediatamente útil** — Generar un menú semanal en menos de 1 minuto
- **Confiable** — Basada en guías nutricionales de organismos reconocidos (OMS, FAO, ICBF)
- **Intuitiva** — Un padre sin conocimientos técnicos debe poder usarla sin tutorial
- **Offline-first** — Funciona sin conexión, datos 100% locales
- **Exportable** — Los usuarios son dueños de sus datos

---

## Funcionalidades Esenciales

### Must Have (Crítico)
1. **Perfiles de niños** con edad, peso, altura, alergias, preferencias
2. **Cálculo automático de requerimientos nutricionales** basado en estándares OMS
3. **Generación de menús** (diario, semanal, mensual) que respeten restricciones
4. **Indicador de aptitud para microondas** en cada receta
5. **Lista de compras consolidada** con cantidades
6. **Importar/Exportar datos** (el usuario es dueño de su información)

### Should Have (Importante)
- Catálogo de recetas buscable y filtrable
- Ajuste de porciones con recálculo nutricional
- Vista de calendario para el menú
- Sugerencias de sustitución de ingredientes

### Could Have (Deseable)
- Estimación de costos (precios colombianos)
- Tips de almacenamiento y recalentamiento
- Modo "solo almuerzo escolar" simplificado
- Compartir menú via link

### Won't Have (Fuera de alcance)
- Cuentas de usuario / autenticación
- Backend / base de datos en la nube
- Integración con supermercados
- App móvil nativa

---

## Restricciones Técnicas

### Obligatorias
- **Repositorio:** `github.com/marlonbarreto-git/lunchbox-planner`
- **Deploy:** Vercel
- **Datos:** 100% locales (IndexedDB/LocalStorage) — sin backend
- **TDD:** Tests primero, implementación después
- **Documentación:** Mantener `knowledge.md` actualizado en cada iteración
- **Commits:** Usar mensajes descriptivos siguiendo conventional commits

### Recomendadas (pero evalúa alternativas)
- Next.js con App Router
- TypeScript
- Tailwind CSS
- Vitest + Playwright para testing

**Si encuentras que otra tecnología es más apropiada, documenta tu razonamiento en `knowledge.md` y procede.**

---

## Base de Conocimiento Nutricional

### Fuentes que DEBES consultar e integrar
Antes de definir la lógica nutricional, investiga y documenta en `knowledge.md`:

1. **OMS/WHO** — Guías de alimentación infantil
2. **FAO** — Requerimientos energéticos por edad
3. **ICBF Colombia** — Guías alimentarias para población colombiana
4. **USDA FoodData Central** — Composición nutricional de alimentos

### Preguntas que debes responder con tu investigación
- ¿Cuántas calorías necesita un niño de 6 años con actividad moderada?
- ¿Cómo se distribuyen los macronutrientes idealmente?
- ¿Qué porcentaje del requerimiento diario debe cubrir el almuerzo?
- ¿Cuáles son los micronutrientes críticos en la infancia?
- ¿Qué alimentos son particularmente importantes para niños colombianos?

**Documenta tus hallazgos con fuentes. Si encuentras discrepancias entre fuentes, menciónalas.**

---

## Base de Datos de Recetas

### Criterios de Inclusión
Cada receta debe ser evaluada en:

1. **Aptitud para microondas** (1-5 estrellas)
   - ¿Mantiene textura después de recalentar?
   - ¿Se calienta uniformemente?
   - ¿Produce olores fuertes en espacio cerrado?

2. **Durabilidad en transporte** (horas seguras fuera de refrigeración)
   - Considera el clima tropical colombiano
   - Evalúa riesgo de contaminación bacteriana

3. **Aceptación infantil**
   - ¿Es visualmente atractivo para niños?
   - ¿Las texturas son apropiadas para la edad?
   - ¿Los sabores son balanceados (no muy picante/amargo)?

4. **Disponibilidad de ingredientes en Colombia**
   - Prioriza ingredientes de fácil acceso
   - Indica sustitutos para ingredientes menos comunes

### Diversidad Requerida
- **Mínimo 150 recetas** (apunta a 200+)
- Incluir: Colombianas, latinoamericanas, internacionales adaptadas
- Variedad de proteínas: Pollo, res, cerdo, pescado, huevo, legumbres
- Opciones vegetarianas y para restricciones comunes

### Tu Criterio
Investiga qué platos funcionan mejor para este caso de uso. No te limites a una lista predefinida — si descubres que ciertos tipos de preparación son ideales para microondas, priorízalos.

---

## Enfoque de Desarrollo

### TDD No Negociable
```
1. Escribe el test que define el comportamiento esperado
2. Verifica que falla
3. Implementa el mínimo para que pase
4. Refactoriza
5. Documenta decisiones en knowledge.md
```

### Tests que DEBEN existir (el cómo es tu decisión)
- [ ] Cálculos nutricionales son correctos según fuentes oficiales
- [ ] Perfiles de niños validan rangos realistas
- [ ] Generador de menús respeta alergias al 100%
- [ ] Generador de menús no repite platos principales en la semana
- [ ] Lista de compras consolida ingredientes correctamente
- [ ] Import/Export produce datos válidos y reimportables
- [ ] La app funciona offline después de la carga inicial
- [ ] Es navegable completamente por teclado
- [ ] Es usable en móvil, tablet y desktop

### knowledge.md — Tu Bitácora
Este archivo es crítico para mantener contexto entre sesiones. Debe incluir:

```markdown
# LunchBox Planner - Knowledge Base

## Decisiones de Arquitectura
[Por qué elegiste X sobre Y]

## Investigación Nutricional
[Hallazgos de OMS, FAO, ICBF con links]

## Hallazgos sobre Recetas
[Qué funciona para microondas, qué no]

## Problemas Encontrados y Soluciones
[Bugs, limitaciones, workarounds]

## Ideas para Mejorar
[Cosas que se te ocurran que mejoren el producto]

## TODOs Pendientes
[Lo que falta por hacer]

## Changelog Resumido
[Qué has completado en cada sesión]
```

---

## Criterios de Éxito

### El producto está "terminado" cuando:

#### Funcionalidad ✅
- [ ] Un usuario nuevo puede generar su primer menú semanal en < 2 minutos
- [ ] El menú generado cumple con requerimientos nutricionales (±10% tolerancia)
- [ ] Las alergias marcadas NUNCA aparecen en el menú (0% de fallos)
- [ ] La lista de compras es práctica y usable para ir al supermercado
- [ ] Los datos exportados se pueden reimportar sin pérdida

#### Calidad ✅
- [ ] Todos los tests pasan
- [ ] La app carga en < 3 segundos en conexión 3G
- [ ] Lighthouse Accessibility > 90
- [ ] No hay errores en consola durante uso normal
- [ ] Funciona en Chrome, Firefox, Safari (últimas 2 versiones)

#### UX ✅
- [ ] Un padre sin conocimientos técnicos puede usarla sin ayuda
- [ ] El diseño es limpio, profesional, y genera confianza
- [ ] Los errores se comunican de forma clara y amigable
- [ ] La app es usable en el celular de camino al supermercado

#### Documentación ✅
- [ ] README explica qué es, cómo usarlo, cómo contribuir
- [ ] knowledge.md documenta todas las decisiones importantes
- [ ] El código tiene comentarios donde la lógica no es obvia

---

## Lo que NO debes hacer

1. **No copies estas especificaciones ciegamente** — Piensa si tienen sentido
2. **No implementes sin tests** — TDD es obligatorio, no opcional
3. **No ignores problemas** — Si algo no funciona bien, documéntalo
4. **No sacrifiques UX por features** — Mejor hacer menos cosas bien
5. **No inventes datos nutricionales** — Todo debe tener fuente verificable
6. **No optimices prematuramente** — Primero que funcione, luego optimiza

---

## Preguntas que debes hacerte

Antes de cada decisión importante, considera:

1. **¿Esto resuelve el problema del usuario o solo cumple un requisito?**
2. **¿Hay una forma más simple de lograr lo mismo?**
3. **¿Qué podría salir mal y cómo lo prevengo?**
4. **¿Un padre ocupado entendería esto a primera vista?**
5. **¿Estoy documentando esto para mi yo futuro?**

---

## Estructura Sugerida (adapta según necesites)

```
lunchbox-planner/
├── src/
│   ├── app/              # Páginas y rutas
│   ├── components/       # Componentes reutilizables
│   ├── lib/              # Lógica de negocio
│   │   ├── nutrition/    # Cálculos nutricionales
│   │   ├── recipes/      # Gestión de recetas
│   │   ├── menu/         # Generación de menús
│   │   └── storage/      # Persistencia local
│   ├── data/             # Datos estáticos (recetas)
│   └── types/            # TypeScript types
├── __tests__/            # Tests organizados por tipo
├── knowledge.md          # TU BITÁCORA - ACTUALÍZALA
├── README.md
└── [configs...]
```

---

## Cómo empezar

```bash
# 1. Crea el repositorio
# 2. Inicializa el proyecto (elige el stack que consideres mejor)
# 3. Configura testing
# 4. Crea knowledge.md con tu plan inicial
# 5. INVESTIGA las fuentes nutricionales antes de codear
# 6. Empieza por el núcleo: perfiles + cálculo nutricional
# 7. Itera incrementalmente con TDD
```

---

## Mensaje Final

Este prompt define el **problema** y los **criterios de éxito**, pero confía en tu criterio para el **cómo**. 

Si descubres que:
- Una tecnología funciona mejor → úsala y documenta por qué
- Un requisito no tiene sentido → cuestiónalo en knowledge.md
- Hay una feature que mejoraría mucho la experiencia → proponla
- Las fuentes nutricionales dicen algo diferente → sigue a las fuentes

**Tu trabajo no es solo ejecutar — es pensar, investigar, y crear el mejor producto posible para padres que quieren alimentar bien a sus hijos.**

---

*Fecha de creación: 2025-02-03*
*Este prompt es un punto de partida, no un contrato. Mejóralo.*
