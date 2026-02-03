'use client'

import type { ChildProfile } from '@/types'

interface ProfileListProps {
  profiles: ChildProfile[]
  selectedId?: string
  onSelect: (profile: ChildProfile) => void
  onDelete: (id: string) => void
}

export function ProfileList({
  profiles,
  selectedId,
  onSelect,
  onDelete,
}: ProfileListProps) {
  if (profiles.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          isSelected={profile.id === selectedId}
          onSelect={() => onSelect(profile)}
          onDelete={() => onDelete(profile.id)}
        />
      ))}
    </div>
  )
}

function ProfileCard({
  profile,
  isSelected,
  onSelect,
  onDelete,
}: {
  profile: ChildProfile
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const age = calculateAge(profile.birthDate)

  return (
    <div
      className={`
        bg-white dark:bg-zinc-900 rounded-xl p-5 cursor-pointer transition-all
        border-2
        ${isSelected
          ? 'border-zinc-900 dark:border-zinc-100'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="text-3xl">
            {profile.sex === 'female' ? '👧' : '👦'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {profile.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {age} años · {profile.weightKg} kg · {profile.heightCm} cm
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 -mr-2"
          title="Eliminar perfil"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {profile.allergies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.allergies.map((allergy) => (
            <span
              key={allergy}
              className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-full"
            >
              {allergy}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <span className={`
          px-3 py-1 text-xs font-medium rounded-full
          ${profile.activityLevel === 'light'
            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
            : profile.activityLevel === 'moderate'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
          }
        `}>
          Actividad {profile.activityLevel === 'light' ? 'baja' : profile.activityLevel === 'moderate' ? 'moderada' : 'alta'}
        </span>

        {isSelected && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            ✓ Seleccionado
          </span>
        )}
      </div>
    </div>
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
