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
        bg-white rounded-xl shadow p-4 cursor-pointer transition-all
        ${isSelected
          ? 'ring-2 ring-primary-500 shadow-lg'
          : 'hover:shadow-md'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center text-2xl
            ${profile.sex === 'female' ? 'bg-pink-100' : 'bg-blue-100'}
          `}>
            {profile.sex === 'female' ? '👧' : '👦'}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{profile.name}</h3>
            <p className="text-sm text-slate-500">
              {age} años • {profile.weightKg} kg • {profile.heightCm} cm
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
          title="Eliminar perfil"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {profile.allergies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {profile.allergies.map((allergy) => (
            <span
              key={allergy}
              className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full"
            >
              {allergy}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className={`
          px-2 py-0.5 rounded-full
          ${profile.activityLevel === 'light' ? 'bg-yellow-100 text-yellow-700' : ''}
          ${profile.activityLevel === 'moderate' ? 'bg-green-100 text-green-700' : ''}
          ${profile.activityLevel === 'heavy' ? 'bg-orange-100 text-orange-700' : ''}
        `}>
          Actividad {profile.activityLevel === 'light' ? 'baja' : profile.activityLevel === 'moderate' ? 'moderada' : 'alta'}
        </span>
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
