'use client'

import { useState } from 'react'
import type { ChildProfile, WeeklyMenu, MenuItem } from '@/types'
import { generateWeeklyMenu } from '@/lib/menu/generator'
import { calculateNutritionalRequirements } from '@/lib/nutrition/calculator'

interface MenuGeneratorProps {
  profile: ChildProfile
  menu: WeeklyMenu | null
  onMenuGenerated: (menu: WeeklyMenu) => void
  onGoToShopping?: () => void
}

export function MenuGenerator({ profile, menu, onMenuGenerated, onGoToShopping }: MenuGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const requirements = calculateNutritionalRequirements(profile)

  const handleGenerate = () => {
    setLoading(true)
    setTimeout(() => {
      const today = new Date()
      const monday = new Date(today)
      monday.setDate(today.getDate() - today.getDay() + 1)
      const weekStart = monday.toISOString().split('T')[0]

      const newMenu = generateWeeklyMenu(profile, weekStart)
      onMenuGenerated(newMenu)
      setLoading(false)
    }, 500)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Menú de {profile.name}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {menu ? 'Menú semanal generado' : 'Genera un menú personalizado'}
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
            Crearemos un menú de lunes a viernes con recetas variadas y nutritivas.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar menú semanal'}
          </button>
        </div>
      )}

      {menu && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Semana del {formatDate(menu.weekStartDate)}
            </h3>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {loading ? 'Generando...' : '↻ Regenerar'}
            </button>
          </div>

          <div className="space-y-3">
            {menu.items.map((item, index) => (
              <MenuItemCard key={item.date} item={item} dayIndex={index} />
            ))}
          </div>

          <div className="mt-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6">
            <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
              Resumen de la semana
            </h4>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {menu.totalNutrition.calories}
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

function MenuItemCard({ item, dayIndex }: { item: MenuItem; dayIndex: number }) {
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  const dayName = dayNames[dayIndex] || 'Día'

  const microwaveStars = Array(5).fill(0).map((_, i) =>
    i < item.recipe.microwaveRating ? '★' : '☆'
  ).join('')

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {dayIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {dayName}
              </span>
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                {item.recipe.name}
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                {item.recipe.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {item.adjustedNutrition.calories}
                <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-1">kcal</span>
              </div>
              <div className="text-xs text-amber-500 mt-1" title="Aptitud microondas">
                {microwaveStars}
              </div>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
}
