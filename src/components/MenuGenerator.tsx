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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Menú de {profile.name}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {menu ? 'Menú semanal generado' : 'Genera un menú personalizado'}
          </p>
        </div>
        {menu && onGoToShopping && (
          <button
            onClick={onGoToShopping}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            Ver compras →
          </button>
        )}
      </div>

      {/* Nutritional Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Requerimientos nutricionales diarios
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NutrientBox
            emoji="🔥"
            label="Calorías/día"
            value={requirements.dailyCalories}
            unit="kcal"
          />
          <NutrientBox
            emoji="🍱"
            label="Almuerzo"
            value={requirements.lunchCalories}
            unit="kcal"
          />
          <NutrientBox
            emoji="🥩"
            label="Proteína"
            value={requirements.macros.proteinGrams}
            unit="g"
          />
          <NutrientBox
            emoji="🍚"
            label="Carbohidratos"
            value={requirements.macros.carbsGrams}
            unit="g"
          />
        </div>
      </div>

      {/* Generate Button */}
      {!menu && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Listo para generar
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Crearemos un menú de lunes a viernes con recetas variadas y nutritivas.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar menú semanal'}
          </button>
        </div>
      )}

      {/* Menu Display */}
      {menu && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Semana del {formatDate(menu.weekStartDate)}
            </h3>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm"
            >
              {loading ? 'Generando...' : '↻ Regenerar'}
            </button>
          </div>

          <div className="space-y-4">
            {menu.items.map((item, index) => (
              <MenuItemCard key={item.date} item={item} dayIndex={index} />
            ))}
          </div>

          {/* Weekly Summary */}
          <div className="mt-8 bg-slate-100 dark:bg-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
              Resumen de la semana
            </h4>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {menu.totalNutrition.calories}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">kcal totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {Math.round(menu.totalNutrition.proteinGrams)}g
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">proteína</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {Math.round(menu.totalNutrition.carbsGrams)}g
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">carbohidratos</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NutrientBox({
  emoji,
  label,
  value,
  unit,
}: {
  emoji: string
  label: string
  value: number
  unit: string
}) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">
        {Math.round(value)}
        <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</div>
    </div>
  )
}

function MenuItemCard({ item, dayIndex }: { item: MenuItem; dayIndex: number }) {
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  const dayEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
  const dayName = dayNames[dayIndex] || 'Día'

  const microwaveStars = Array(5).fill(0).map((_, i) =>
    i < item.recipe.microwaveRating ? '★' : '☆'
  ).join('')

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{dayEmojis[dayIndex]}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {dayName}
              </span>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                {item.recipe.name}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {item.recipe.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {item.adjustedNutrition.calories}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">kcal</span>
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
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
              P: {Math.round(item.adjustedNutrition.proteinGrams)}g •
              C: {Math.round(item.adjustedNutrition.carbsGrams)}g •
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
