# LunchBox Planner

Planifica almuerzos escolares nutritivos y deliciosos para tus hijos.

## Descripción

LunchBox Planner es una aplicación web diseñada para padres de niños de 4-12 años en Colombia. Ayuda a planificar menús semanales que:

- Son **nutricionalmente balanceados** según guías FAO/OMS e ICBF
- Están **optimizados para microondas** (recetas con rating 3-5 estrellas)
- **Respetan alergias** al 100%
- Generan **listas de compras automáticas**
- Funcionan **100% offline** después de la primera carga

## Características

- **Perfiles de niños**: Crea perfiles con edad, peso, altura y alergias
- **Cálculo nutricional**: Basado en tablas FAO/WHO de requerimientos energéticos
- **155+ recetas**: Colombianas, latinoamericanas e internacionales adaptadas
- **Generador de menús**: Menús semanales sin repeticiones
- **Lista de compras**: Ingredientes consolidados por categoría
- **Offline-first**: Todos los datos se guardan localmente
- **Export/Import**: Tus datos siempre son tuyos

## Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Testing**: Vitest (94 tests) + Playwright
- **Storage**: IndexedDB
- **Deploy**: Vercel

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar tests
npm test

# Build de producción
npm run build
```

## Estructura del Proyecto

```
src/
├── app/              # Páginas Next.js
├── components/       # Componentes UI
├── lib/
│   ├── nutrition/    # Cálculos nutricionales
│   ├── recipes/      # Gestión de recetas
│   ├── menu/         # Generador de menús y lista de compras
│   └── storage/      # Persistencia y export/import
├── data/             # Base de datos de recetas
└── types/            # TypeScript types
```

## Fuentes Nutricionales

- [FAO/WHO Energy Requirements](https://www.fao.org/4/y5686e/y5686e06.htm)
- [ICBF Guías Alimentarias](https://www.icbf.gov.co/guias-alimentarias-basadas-en-alimentos-para-la-poblacion-colombiana-mayor-de-2-anos-3)
- [USDA School Lunch Standards](https://www.fns.usda.gov/school-meals/nutrition-standards/nslp-meal-pattern)

## Licencia

MIT
