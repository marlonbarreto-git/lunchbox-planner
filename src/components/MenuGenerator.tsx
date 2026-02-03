'use client'

import { useState } from 'react'
import type { ChildProfile, WeeklyMenu, MenuItem } from '@/types'
import { generateWeeklyMenu } from '@/lib/menu/generator'
import { calculateNutritionalRequirements } from '@/lib/nutrition/calculator'

interface MenuGeneratorProps {
  profile: ChildProfile
  menu: WeeklyMenu | null
  onMenuGenerated: (menu: WeeklyMenu) => void
}

export function MenuGenerator({ profile, menu, onMenuGenerated }: MenuGeneratorProps) {
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
      {/* Nutritional Summary */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="font-semibold text-slate-800 mb-3">
          Requerimientos de {profile.name}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <NutrientBox
            label="Calorías/día"
            value={requirements.dailyCalories}
            unit="kcal"
            color="green"
          />
          <NutrientBox
            label="Almuerzo"
            value={requirements.lunchCalories}
            unit="kcal"
            color="blue"
          />
          <NutrientBox
            label="Proteína"
            value={requirements.macros.proteinGrams}
            unit="g"
            color="orange"
          />
          <NutrientBox
            label="Carbohidratos"
            value={requirements.macros.carbsGrams}
            unit="g"
            color="purple"
          />
        </div>
      </div>

      {/* Generate Button */}
      {!menu && (
        <div className="text-center py-8">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar Menú Semanal'}
          </button>
          <p className="text-slate-500 mt-3 text-sm">
            Se generará un menú de lunes a viernes
          </p>
        </div>
      )}

      {/* Menu Display */}
      {menu && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800">
              Menú Semanal
            </h3>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              {loading ? 'Generando...' : 'Regenerar'}
            </button>
          </div>

          <div className="space-y-3">
            {menu.items.map((item, index) => (
              <MenuItemCard key={item.date} item={item} dayIndex={index} />
            ))}
          </div>

          {/* Weekly Summary */}
          <div className="mt-6 bg-slate-50 rounded-xl p-4">
            <h4 className="font-medium text-slate-700 mb-2">Resumen Semanal</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Calorías totales:</span>
                <span className="font-medium text-slate-800 ml-1">
                  {menu.totalNutrition.calories} kcal
                </span>
              </div>
              <div>
                <span className="text-slate-500">Proteína total:</span>
                <span className="font-medium text-slate-800 ml-1">
                  {Math.round(menu.totalNutrition.proteinGrams)}g
                </span>
              </div>
              <div>
                <span className="text-slate-500">Carbos totales:</span>
                <span className="font-medium text-slate-800 ml-1">
                  {Math.round(menu.totalNutrition.carbsGrams)}g
                </span>
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
  color,
}: {
  label: string
  value: number
  unit: string
  color: 'green' | 'blue' | 'orange' | 'purple'
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-800',
    blue: 'bg-blue-50 text-blue-800',
    orange: 'bg-orange-50 text-orange-800',
    purple: 'bg-purple-50 text-purple-800',
  }

  return (
    <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">
        {Math.round(value)}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </div>
      <div className="text-xs">{label}</div>
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
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-primary-600 uppercase">
            {dayName}
          </span>
          <h4 className="font-semibold text-slate-800 mt-1">
            {item.recipe.name}
          </h4>
          <p className="text-sm text-slate-500 mt-1">
            {item.recipe.description}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-800">
            {item.adjustedNutrition.calories}
            <span className="text-xs font-normal text-slate-500 ml-1">kcal</span>
          </div>
          <div className="text-xs text-amber-500" title="Aptitud microondas">
            {microwaveStars}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {item.recipe.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
        {item.portions !== 1 && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
            {item.portions}x porción
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
        <span>P: {Math.round(item.adjustedNutrition.proteinGrams)}g</span>
        <span>C: {Math.round(item.adjustedNutrition.carbsGrams)}g</span>
        <span>G: {Math.round(item.adjustedNutrition.fatGrams)}g</span>
      </div>
    </div>
  )
}
