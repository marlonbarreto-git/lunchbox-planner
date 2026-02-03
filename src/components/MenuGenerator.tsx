'use client'

import { useState } from 'react'
import type { ChildProfile, WeeklyMenu, MenuItem } from '@/types'
import { generateWeeklyMenu, generateMonthlyMenu, replaceMealInMenu } from '@/lib/menu/generator'
import { calculateNutritionalRequirements } from '@/lib/nutrition/calculator'

type MenuType = 'weekly' | 'monthly'

interface MenuGeneratorProps {
  profile: ChildProfile
  menu: WeeklyMenu | null
  onMenuGenerated: (menu: WeeklyMenu) => void
  onGoToShopping?: () => void
}

export function MenuGenerator({ profile, menu, onMenuGenerated, onGoToShopping }: MenuGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [menuType, setMenuType] = useState<MenuType>('weekly')
  const requirements = calculateNutritionalRequirements(profile)

  const handleGenerate = (type: MenuType) => {
    setLoading(true)
    setMenuType(type)
    setTimeout(() => {
      const today = new Date()
      const monday = new Date(today)
      monday.setDate(today.getDate() - today.getDay() + 1)
      const startDate = monday.toISOString().split('T')[0]

      const newMenu = type === 'monthly'
        ? generateMonthlyMenu(profile, startDate)
        : generateWeeklyMenu(profile, startDate)
      onMenuGenerated(newMenu)
      setLoading(false)
    }, 500)
  }

  const handleReplaceMeal = (date: string) => {
    if (!menu) return
    const updatedMenu = replaceMealInMenu(menu, date, profile)
    onMenuGenerated(updatedMenu)
  }

  const isMonthlyMenu = menu && menu.items.length > 5

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
                ? `Menú mensual: ${menu.items.length} almuerzos`
                : 'Menú semanal generado'
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
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center border border-zinc-200 dark:border-zinc-800">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Listo para generar
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
            Elige el período de planificación. Puedes cambiar cualquier comida después.
          </p>
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
          <div className="flex items-center justify-between mb-6">
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

          {isMonthlyMenu ? (
            <MonthlyMenuView menu={menu} onReplaceMeal={handleReplaceMeal} />
          ) : (
            <div className="space-y-3">
              {menu.items.map((item, index) => (
                <MenuItemCard
                  key={item.date}
                  item={item}
                  dayIndex={index}
                  onReplace={() => handleReplaceMeal(item.date)}
                />
              ))}
            </div>
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
    </div>
  )
}

function MonthlyMenuView({
  menu,
  onReplaceMeal,
}: {
  menu: WeeklyMenu
  onReplaceMeal: (date: string) => void
}) {
  const weeks: MenuItem[][] = []
  for (let i = 0; i < menu.items.length; i += 5) {
    weeks.push(menu.items.slice(i, i + 5))
  }

  return (
    <div className="space-y-8">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex}>
          <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Semana {weekIndex + 1}
          </h4>
          <div className="space-y-3">
            {week.map((item, dayIndex) => (
              <MenuItemCard
                key={item.date}
                item={item}
                dayIndex={dayIndex}
                onReplace={() => onReplaceMeal(item.date)}
                compact
              />
            ))}
          </div>
        </div>
      ))}
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

function MenuItemCard({
  item,
  dayIndex,
  onReplace,
  compact = false,
}: {
  item: MenuItem
  dayIndex: number
  onReplace: () => void
  compact?: boolean
}) {
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  const dayName = dayNames[dayIndex] || 'Día'

  const microwaveStars = Array(5).fill(0).map((_, i) =>
    i < item.recipe.microwaveRating ? '★' : '☆'
  ).join('')

  const formattedDate = new Date(item.date).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 group">
      <div className="flex items-start gap-4">
        <div className={`${compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center font-semibold text-zinc-900 dark:text-zinc-100`}>
          {dayIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {dayName}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formattedDate}
                </span>
              </div>
              <h4 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-zinc-900 dark:text-zinc-100 mt-1 truncate`}>
                {item.recipe.name}
              </h4>
              {!compact && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                  {item.recipe.description}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0 flex items-start gap-2">
              <div>
                <div className={`${compact ? 'text-base' : 'text-lg'} font-bold text-zinc-900 dark:text-zinc-100`}>
                  {item.adjustedNutrition.calories}
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-1">kcal</span>
                </div>
                <div className="text-xs text-amber-500 mt-1" title="Aptitud microondas">
                  {microwaveStars}
                </div>
              </div>
              <button
                onClick={onReplace}
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

          {!compact && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {item.recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
                P: {Math.round(item.adjustedNutrition.proteinGrams)}g ·
                C: {Math.round(item.adjustedNutrition.carbsGrams)}g ·
                G: {Math.round(item.adjustedNutrition.fatGrams)}g
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
}
