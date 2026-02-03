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
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del niño/a
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ej: María"
          maxLength={50}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="profile-birthdate" className="block text-sm font-medium text-slate-700 mb-1">
            Fecha de nacimiento
          </label>
          <input
            id="profile-birthdate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="profile-sex" className="block text-sm font-medium text-slate-700 mb-1">
            Sexo
          </label>
          <select
            id="profile-sex"
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="male">Niño</option>
            <option value="female">Niña</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="profile-weight" className="block text-sm font-medium text-slate-700 mb-1">
            Peso (kg)
          </label>
          <input
            id="profile-weight"
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ej: 25"
            min="10"
            max="80"
            step="0.1"
          />
        </div>

        <div>
          <label htmlFor="profile-height" className="block text-sm font-medium text-slate-700 mb-1">
            Altura (cm)
          </label>
          <input
            id="profile-height"
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ej: 120"
            min="80"
            max="180"
          />
        </div>
      </div>

      <div>
        <span id="activity-label" className="block text-sm font-medium text-slate-700 mb-1">
          Nivel de actividad física
        </span>
        <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="activity-label">
          {(['light', 'moderate', 'heavy'] as ActivityLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActivityLevel(level)}
              aria-pressed={activityLevel === level}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activityLevel === level
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              {level === 'light' && 'Baja'}
              {level === 'moderate' && 'Moderada'}
              {level === 'heavy' && 'Alta'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Alergias alimentarias
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map((allergy) => (
            <button
              key={allergy}
              type="button"
              onClick={() => toggleAllergy(allergy)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${allergies.includes(allergy)
                  ? 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Guardar Perfil
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
