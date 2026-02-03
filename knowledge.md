# LunchBox Planner - Knowledge Base

## Decisiones de Arquitectura

### Stack Tecnológico
- **Framework**: Next.js 14 con App Router
  - *Razón*: Integración nativa con Vercel (requisito), SSG para carga rápida, ecosistema maduro
  - *Alternativas evaluadas*: Vite+React (más ligero pero menos integrado), Astro (menos maduro para SPA complejas)
- **Lenguaje**: TypeScript (strict mode)
- **Estilos**: Tailwind CSS
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Storage**: IndexedDB via `idb` library (100% local, offline-first)
- **Deploy**: Vercel con static export

### Estructura del Proyecto
```
src/
├── app/              # Páginas Next.js (App Router)
├── components/       # Componentes UI reutilizables
├── lib/              # Lógica de negocio
│   ├── nutrition/    # Cálculos nutricionales
│   ├── recipes/      # Gestión de recetas
│   ├── menu/         # Generación de menús
│   └── storage/      # Persistencia IndexedDB
├── data/             # Datos estáticos (recetas JSON)
├── types/            # TypeScript types
└── test/             # Configuración de tests
```

---

## Investigación Nutricional

### Fuentes Oficiales Consultadas

1. **FAO/WHO/UNU Expert Consultation on Human Energy Requirements** (2001/2004)
   - URL: https://www.fao.org/4/y5686e/y5686e06.htm
   - Tablas detalladas de requerimientos energéticos por edad, sexo y nivel de actividad

2. **NCBI StatPearls - Nutrition and Hydration Requirements**
   - URL: https://www.ncbi.nlm.nih.gov/books/NBK562207/
   - Fórmulas simplificadas y distribución de macronutrientes

3. **ICBF Colombia - Guías Alimentarias Basadas en Alimentos (GABA)**
   - URL: https://www.icbf.gov.co/guias-alimentarias-basadas-en-alimentos-para-la-poblacion-colombiana-mayor-de-2-anos-3
   - Resolución 3803 de 2016: Recomendaciones para población colombiana

4. **USDA National School Lunch Program**
   - URL: https://www.fns.usda.gov/school-meals/nutrition-standards/nslp-meal-pattern
   - Estándares de almuerzo escolar (33% del requerimiento diario)

### Requerimientos Energéticos Diarios (kcal/día)

#### Niños (Actividad Moderada)
| Edad | Peso ref. (kg) | kcal/día |
|------|----------------|----------|
| 4-5  | 17.7           | 1,360    |
| 5-6  | 19.7           | 1,467    |
| 6-7  | 21.7           | 1,573    |
| 7-8  | 24.0           | 1,692    |
| 8-9  | 26.7           | 1,830    |
| 9-10 | 29.7           | 1,978    |
| 10-11| 33.3           | 2,150    |
| 11-12| 37.5           | 2,341    |

#### Niñas (Actividad Moderada)
| Edad | Peso ref. (kg) | kcal/día |
|------|----------------|----------|
| 4-5  | 16.8           | 1,241    |
| 5-6  | 18.6           | 1,330    |
| 6-7  | 20.6           | 1,428    |
| 7-8  | 23.3           | 1,554    |
| 8-9  | 26.6           | 1,698    |
| 9-10 | 30.5           | 1,854    |
| 10-11| 34.7           | 2,006    |
| 11-12| 39.2           | 2,149    |

**Ajustes por actividad física:**
- Ligera: -15% del valor moderado
- Intensa: +15% del valor moderado

### Fórmulas Simplificadas (por kg de peso)
- 4-5 años: 70 kcal/kg/día
- 6-8 años: 60-65 kcal/kg/día
- 9+ años: 35-45 kcal/kg/día

### Distribución de Macronutrientes
| Macronutriente | % de calorías | Notas |
|----------------|---------------|-------|
| Carbohidratos  | 50-55%        | Preferir integrales |
| Proteínas      | 15-20%        | ~1g/kg de peso |
| Grasas         | 25-35%        | Saturadas <10% |

### Almuerzo Escolar
- **Porcentaje del requerimiento diario**: 30-35% (usamos 33% como estándar USDA)
- **Distribución de comidas típica**:
  - Desayuno: 25%
  - Almuerzo: 33%
  - Cena: 30%
  - Snacks: 12%

### Micronutrientes Críticos en la Infancia
1. **Hierro**: Prevención de anemia (vísceras 1x/semana según ICBF)
2. **Calcio**: Desarrollo óseo (lácteos, vegetales de hoja verde)
3. **Vitamina D**: Absorción de calcio (exposición solar, pescados grasos)
4. **Zinc**: Sistema inmune y crecimiento
5. **Vitamina A**: Visión y sistema inmune

---

## Hallazgos sobre Recetas

### Criterios para Aptitud de Microondas (1-5 estrellas)

**⭐⭐⭐⭐⭐ Excelentes:**
- Guisos y estofados (se rehidratan bien)
- Arroz con salsas
- Pastas con salsa
- Lentejas y frijoles
- Sopas

**⭐⭐⭐⭐ Buenos:**
- Pollo desmechado/guisado
- Carne molida
- Huevos revueltos (si se recalientan con cuidado)
- Verduras al vapor

**⭐⭐⭐ Aceptables:**
- Pollo asado (pierde jugosidad)
- Arroz solo (puede secarse)
- Tortillas/wraps

**⭐⭐ Problemáticos:**
- Frituras (se ablandan)
- Carnes a la plancha (se resecan)
- Pan/empanados (textura gomosa)

**⭐ Evitar:**
- Huevos fritos
- Carnes rojas término medio
- Alimentos crujientes

### Consideraciones para Clima Tropical Colombiano

**Tiempo máximo fuera de refrigeración (seguro):**
- Con lonchera térmica + gel frío: 4-5 horas
- Sin refrigeración: 2 horas máximo
- Zona de peligro: 5°C - 60°C

**Alimentos de alto riesgo (evitar sin refrigeración):**
- Mayonesa casera
- Mariscos
- Lácteos no pasteurizados
- Carnes poco cocidas

**Alimentos seguros para transporte:**
- Alimentos bien cocidos
- Frutas enteras
- Frutos secos
- Galletas secas

### Platos Colombianos Ideales para Microondas
1. **Arroz con pollo** - Excelente recalentamiento
2. **Lentejas con arroz** - Muy estable
3. **Bandeja paisa simplificada** - Frijoles + arroz + carne molida
4. **Sudado de pollo** - La salsa mantiene humedad
5. **Arroz atollado** - Textura se mantiene bien
6. **Sancocho (versión espesa)** - Ideal para termo
7. **Frijoles antioqueños** - Muy estables

---

## Problemas Encontrados y Soluciones

*Por documentar durante desarrollo*

---

## Ideas para Mejorar

1. **Modo "emergencia"**: Sugerir recetas rápidas cuando no hay tiempo de planificar
2. **Integración con calendario**: Exportar menú a Google Calendar/iCal
3. **Fotos de referencia**: Cómo debe verse el plato en la lonchera
4. **Tips de preparación batch**: Preparar ingredientes el domingo para toda la semana
5. **Alertas de vencimiento**: Recordar usar ingredientes antes de que venzan

---

## TODOs Pendientes

- [x] Configurar proyecto (Next.js, TypeScript, testing)
- [x] Investigar fuentes nutricionales
- [x] Implementar modelo de datos para perfiles de niños
- [x] Implementar calculadora nutricional
- [x] Crear base de datos de recetas (155+)
- [x] Implementar generador de menús
- [x] Implementar lista de compras
- [x] Implementar import/export
- [x] Diseñar UI elegante
- [x] Configurar PWA/offline
- [ ] Deploy a Vercel
- [ ] Pruebas E2E con Playwright
- [ ] Lighthouse audit (accessibility >90)

---

## Changelog Resumido

### 2025-02-03 - Sesión 1
- Inicializado proyecto Next.js 14 con TypeScript
- Configurado Tailwind CSS, Vitest, Playwright
- Investigadas fuentes nutricionales (FAO, OMS, ICBF, USDA)
- Documentados requerimientos energéticos por edad y sexo
- Documentada distribución de macronutrientes
- Identificados criterios de aptitud para microondas
- Creada estructura base del proyecto
- Implementada calculadora nutricional con tests (19 tests)
- Implementado sistema de perfiles con validación (24 tests)
- Creada base de datos de 155 recetas colombianas/latinas
- Implementado generador de menús semanales (13 tests)
- Implementada lista de compras consolidada (9 tests)
- Implementado import/export de datos (11 tests)
- Diseñada UI responsive con tabs de navegación
- Configurado PWA con service worker para offline
- Total: 94 tests pasando
