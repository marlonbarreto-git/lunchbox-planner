'use client'

import { useState } from 'react'
import type { ChildProfile, Sex, ActivityLevel } from '@/types'

interface ProfileFormProps {
  onSubmit: (profile: ChildProfile) => void
  onCancel: () => void
  initialData?: Partial<ChildProfile>
}

const COMMON_ALLERGIES = [
  'gluten',
  'lácteos',
  'huevo',
  'maní',
  'soya',
  'mariscos',
  'pescado',
  'nueces',
]

export function ProfileForm({ onSubmit, onCancel, initialData }: ProfileFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '')
  const [sex, setSex] = useState<Sex>(initialData?.sex || 'male')
  const [weightKg, setWeightKg] = useState(initialData?.weightKg?.toString() || '')
  const [heightCm, setHeightCm] = useState(initialData?.heightCm?.toString() || '')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialData?.activityLevel || 'moderate'
  )
  const [allergies, setAllergies] = useState<string[]>(initialData?.allergies || [])
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (!birthDate) {
      setError('La fecha de nacimiento es requerida')
      return
    }

    const weight = parseFloat(weightKg)
    const height = parseFloat(heightCm)

    if (isNaN(weight) || weight < 10 || weight > 80) {
      setError('El peso debe estar entre 10 y 80 kg')
      return
    }

    if (isNaN(height) || height < 80 || height > 180) {
      setError('La altura debe estar entre 80 y 180 cm')
      return
    }

    const age = calculateAge(birthDate)
    if (age < 4 || age > 12) {
      setError('La edad debe estar entre 4 y 12 años')
      return
    }

    const profile: ChildProfile = {
      id: initialData?.id || generateId(),
      name: name.trim(),
      birthDate,
      sex,
      weightKg: weight,
      heightCm: height,
      activityLevel,
      allergies,
      preferences: { likes: [], dislikes: [] },
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSubmit(profile)
  }

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Nombre
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-colors"
          placeholder="Ej: María"
          maxLength={50}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="profile-birthdate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Fecha de nacimiento
          </label>
          <input
            id="profile-birthdate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="profile-sex" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Sexo
          </label>
          <select
            id="profile-sex"
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-colors"
          >
            <option value="male">Niño</option>
            <option value="female">Niña</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="profile-weight" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Peso (kg)
          </label>
          <input
            id="profile-weight"
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-colors"
            placeholder="Ej: 25"
            min="10"
            max="80"
            step="0.1"
          />
        </div>

        <div>
          <label htmlFor="profile-height" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Altura (cm)
          </label>
          <input
            id="profile-height"
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-colors"
            placeholder="Ej: 120"
            min="80"
            max="180"
          />
        </div>
      </div>

      <div>
        <span id="activity-label" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Nivel de actividad física
        </span>
        <div className="grid grid-cols-3 gap-3" role="group" aria-labelledby="activity-label">
          {(['light', 'moderate', 'heavy'] as ActivityLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActivityLevel(level)}
              aria-pressed={activityLevel === level}
              className={`
                px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activityLevel === level
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              {level === 'light' && '🚶 Baja'}
              {level === 'moderate' && '🏃 Moderada'}
              {level === 'heavy' && '⚡ Alta'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Alergias alimentarias
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map((allergy) => (
            <button
              key={allergy}
              type="button"
              onClick={() => toggleAllergy(allergy)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${allergies.includes(allergy)
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 ring-2 ring-red-300 dark:ring-red-700'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              {allergy}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          Guardar
        </button>
      </div>
    </form>
  )
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function generateId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
