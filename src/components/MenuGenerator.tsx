'use client'

import { useState } from 'react'
import type { ChildProfile, WeeklyMenu, MenuItem, MealType, Recipe } from '@/types'
import { MEAL_TYPE_LABELS } from '@/types'
import { generateWeeklyMenu, generateMonthlyMenu, replaceMealInMenu } from '@/lib/menu/generator'
import { calculateNutritionalRequirements } from '@/lib/nutrition/calculator'

type MenuType = 'weekly' | 'monthly'

const ALL_MEAL_TYPES: MealType[] = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner']

interface MenuGeneratorProps {
  profile: ChildProfile
  menu: WeeklyMenu | null
  onMenuGenerated: (menu: WeeklyMenu) => void
  onGoToShopping?: () => void
}

export function MenuGenerator({ profile, menu, onMenuGenerated, onGoToShopping }: MenuGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [menuType, setMenuType] = useState<MenuType>('weekly')
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>(['lunch'])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const requirements = calculateNutritionalRequirements(profile)

  const toggleMealType = (mealType: MealType) => {
    setSelectedMealTypes(prev => {
      if (prev.includes(mealType)) {
        if (prev.length === 1) return prev
        return prev.filter(t => t !== mealType)
      }
      return [...prev, mealType].sort((a, b) =>
        ALL_MEAL_TYPES.indexOf(a) - ALL_MEAL_TYPES.indexOf(b)
      )
    })
  }

  const handleGenerate = (type: MenuType) => {
    setLoading(true)
    setMenuType(type)
    setTimeout(() => {
      const today = new Date()
      const monday = new Date(today)
      monday.setDate(today.getDate() - today.getDay() + 1)
      const startDate = monday.toISOString().split('T')[0]

      const newMenu = type === 'monthly'
        ? generateMonthlyMenu(profile, startDate, selectedMealTypes)
        : generateWeeklyMenu(profile, startDate, selectedMealTypes)
      onMenuGenerated(newMenu)
      setLoading(false)
    }, 500)
  }

  const handleReplaceMeal = (date: string, mealType: MealType) => {
    if (!menu) return
    const updatedMenu = replaceMealInMenu(menu, date, profile, mealType)
    onMenuGenerated(updatedMenu)
  }

  const isMonthlyMenu = menu && menu.items.length > 5 * selectedMealTypes.length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Menú de {profile.name}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {menu
              ? isMonthlyMenu
                ? `Menú mensual: ${menu.items.length} comidas`
                : `Menú semanal: ${menu.items.length} comidas`
              : 'Genera un menú personalizado'}
          </p>
        </div>
        {menu && onGoToShopping && (
          <button
            onClick={onGoToShopping}
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Ver compras →
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 mb-8">
        <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
          Requerimientos nutricionales diarios
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <NutrientBox
            label="Calorías/día"
            value={requirements.dailyCalories}
            unit="kcal"
          />
          <NutrientBox
            label="Almuerzo"
            value={requirements.lunchCalories}
            unit="kcal"
          />
          <NutrientBox
            label="Proteína"
            value={requirements.macros.proteinGrams}
            unit="g"
          />
          <NutrientBox
            label="Carbohidratos"
            value={requirements.macros.carbsGrams}
            unit="g"
          />
        </div>
      </div>

      {!menu && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 md:p-12 border border-zinc-200 dark:border-zinc-800">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Selecciona las comidas
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Elige qué comidas del día quieres planificar. Puedes seleccionar una o varias.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {ALL_MEAL_TYPES.map(mealType => (
              <button
                key={mealType}
                onClick={() => toggleMealType(mealType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMealTypes.includes(mealType)
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {MEAL_TYPE_LABELS[mealType]}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => handleGenerate('weekly')}
              disabled={loading}
              className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading && menuType === 'weekly' ? 'Generando...' : 'Generar menú semanal'}
            </button>
            <button
              onClick={() => handleGenerate('monthly')}
              disabled={loading}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {loading && menuType === 'monthly' ? 'Generando...' : 'Generar menú mensual'}
            </button>
          </div>
        </div>
      )}

      {menu && (
        <div>
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {ALL_MEAL_TYPES.map(mealType => (
                <button
                  key={mealType}
                  onClick={() => toggleMealType(mealType)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedMealTypes.includes(mealType)
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {MEAL_TYPE_LABELS[mealType]}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {isMonthlyMenu ? 'Mes' : 'Semana'} del {formatDate(menu.weekStartDate)}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleGenerate('weekly')}
                  disabled={loading}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  {loading && menuType === 'weekly' ? 'Generando...' : '↻ Semanal'}
                </button>
                <button
                  onClick={() => handleGenerate('monthly')}
                  disabled={loading}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  {loading && menuType === 'monthly' ? 'Generando...' : '↻ Mensual'}
                </button>
              </div>
            </div>
          </div>

          {isMonthlyMenu ? (
            <MonthlyMenuView
              menu={menu}
              selectedMealTypes={selectedMealTypes}
              onReplaceMeal={handleReplaceMeal}
              onSelectRecipe={setSelectedRecipe}
            />
          ) : (
            <WeeklyMenuView
              menu={menu}
              selectedMealTypes={selectedMealTypes}
              onReplaceMeal={handleReplaceMeal}
              onSelectRecipe={setSelectedRecipe}
            />
          )}

          <div className="mt-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6">
            <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
              Resumen {isMonthlyMenu ? 'del mes' : 'de la semana'}
            </h4>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {menu.totalNutrition.calories.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">kcal totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {Math.round(menu.totalNutrition.proteinGrams)}g
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">proteína</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {Math.round(menu.totalNutrition.carbsGrams)}g
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">carbohidratos</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  )
}

function WeeklyMenuView({
  menu,
  selectedMealTypes,
  onReplaceMeal,
  onSelectRecipe,
}: {
  menu: WeeklyMenu
  selectedMealTypes: MealType[]
  onReplaceMeal: (date: string, mealType: MealType) => void
  onSelectRecipe: (recipe: Recipe) => void
}) {
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  const dates = Array.from(new Set(menu.items.map(item => item.date))).sort()

  return (
    <div className="space-y-6">
      {dates.map((date, dayIndex) => {
        const dayItems = menu.items.filter(item => item.date === date)
        const formattedDate = new Date(date).toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'short',
        })

        return (
          <div key={date} className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center font-semibold text-zinc-900 dark:text-zinc-100">
                {dayIndex + 1}
              </div>
              <div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                  {dayNames[dayIndex] || 'Día'}
                </span>
                <span className="text-sm text-zinc-400 dark:text-zinc-500 ml-2">
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {selectedMealTypes.map(mealType => {
                const item = dayItems.find(i => i.mealType === mealType)
                if (!item) return null

                return (
                  <MealItemCard
                    key={`${date}-${mealType}`}
                    item={item}
                    onReplace={() => onReplaceMeal(date, mealType)}
                    onSelect={() => onSelectRecipe(item.recipe)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthlyMenuView({
  menu,
  selectedMealTypes,
  onReplaceMeal,
  onSelectRecipe,
}: {
  menu: WeeklyMenu
  selectedMealTypes: MealType[]
  onReplaceMeal: (date: string, mealType: MealType) => void
  onSelectRecipe: (recipe: Recipe) => void
}) {
  const dates = Array.from(new Set(menu.items.map(item => item.date))).sort()
  const weeks: string[][] = []
  for (let i = 0; i < dates.length; i += 5) {
    weeks.push(dates.slice(i, i + 5))
  }

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  return (
    <div className="space-y-8">
      {weeks.map((weekDates, weekIndex) => (
        <div key={weekIndex}>
          <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Semana {weekIndex + 1}
          </h4>
          <div className="space-y-4">
            {weekDates.map((date, dayIndex) => {
              const dayItems = menu.items.filter(item => item.date === date)
              const formattedDate = new Date(date).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short',
              })

              return (
                <div key={date} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {dayIndex + 1}
                    </div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                      {dayNames[dayIndex]}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {formattedDate}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedMealTypes.map(mealType => {
                      const item = dayItems.find(i => i.mealType === mealType)
                      if (!item) return null

                      return (
                        <MealItemCard
                          key={`${date}-${mealType}`}
                          item={item}
                          compact
                          onReplace={() => onReplaceMeal(date, mealType)}
                          onSelect={() => onSelectRecipe(item.recipe)}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function MealItemCard({
  item,
  compact = false,
  onReplace,
  onSelect,
}: {
  item: MenuItem
  compact?: boolean
  onReplace: () => void
  onSelect: () => void
}) {
  const microwaveStars = Array(5).fill(0).map((_, i) =>
    i < item.recipe.microwaveRating ? '★' : '☆'
  ).join('')

  return (
    <div
      className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg group cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      onClick={onSelect}
    >
      <div className={`${compact ? 'text-lg' : 'text-2xl'} flex-shrink-0`}>
        {getMealTypeEmoji(item.mealType)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {MEAL_TYPE_LABELS[item.mealType]}
          </span>
        </div>
        <h4 className={`${compact ? 'text-sm' : 'text-base'} font-medium text-zinc-900 dark:text-zinc-100 break-words`}>
          {item.recipe.name}
        </h4>
        {!compact && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1">
            {item.recipe.description}
          </p>
        )}
      </div>
      <div className="text-right flex-shrink-0 flex items-start gap-2">
        <div>
          <div className={`${compact ? 'text-sm' : 'text-base'} font-bold text-zinc-900 dark:text-zinc-100`}>
            {item.adjustedNutrition.calories}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-0.5">kcal</span>
          </div>
          {!compact && (
            <div className="text-xs text-amber-500 mt-0.5" title="Aptitud microondas">
              {microwaveStars}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onReplace()
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-all"
          title="Cambiar plato"
          aria-label="Cambiar plato"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function RecipeDetailModal({
  recipe,
  onClose,
}: {
  recipe: Recipe
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-zinc-900 p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {recipe.name}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                {recipe.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoBox label="Tiempo prep." value={`${recipe.prepTimeMinutes} min`} />
            <InfoBox label="Tiempo cocción" value={`${recipe.cookTimeMinutes} min`} />
            <InfoBox label="Porciones" value={`${recipe.servings}`} />
            <InfoBox label="Transporte" value={`${recipe.transportHours}h`} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
            <NutrientBox label="Calorías" value={recipe.nutrition.calories} unit="kcal" />
            <NutrientBox label="Proteína" value={recipe.nutrition.proteinGrams} unit="g" />
            <NutrientBox label="Carbohidratos" value={recipe.nutrition.carbsGrams} unit="g" />
            <NutrientBox label="Grasas" value={recipe.nutrition.fatGrams} unit="g" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-3">
              Ingredientes
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full flex-shrink-0" />
                  <span className="font-medium">{ing.amount} {ing.unit}</span>
                  <span>{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-3">
              Preparación
            </h3>
            <ol className="space-y-3">
              {recipe.instructions.map((instruction, i) => (
                <li key={i} className="flex gap-3 text-zinc-700 dark:text-zinc-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.allergens.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-3">
                Alérgenos
              </h3>
              <div className="flex flex-wrap gap-2">
                {recipe.allergens.map(allergen => (
                  <span
                    key={allergen}
                    className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm rounded-full"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recipe.substitutions && Object.keys(recipe.substitutions).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-3">
                Sustituciones
              </h3>
              <ul className="space-y-2">
                {Object.entries(recipe.substitutions).map(([original, substitute]) => (
                  <li key={original} className="text-zinc-700 dark:text-zinc-300">
                    <span className="font-medium">{original}</span>
                    <span className="text-zinc-400 mx-2">→</span>
                    <span>{substitute}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {recipe.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NutrientBox({
  label,
  value,
  unit,
}: {
  label: string
  value: number
  unit: string
}) {
  return (
    <div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {Math.round(value)}
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-1">{unit}</span>
      </div>
      <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{label}</div>
    </div>
  )
}

function InfoBox({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
      <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  )
}

function getMealTypeEmoji(mealType: MealType): string {
  const emojis: Record<MealType, string> = {
    breakfast: '🍳',
    morningSnack: '🍎',
    lunch: '🍱',
    afternoonSnack: '🍪',
    dinner: '🍽️',
  }
  return emojis[mealType]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
}
