'use client'

import { useState } from 'react'
import { ProfileForm } from '@/components/ProfileForm'
import { ProfileList } from '@/components/ProfileList'
import { MenuGenerator } from '@/components/MenuGenerator'
import { ShoppingListView } from '@/components/ShoppingListView'
import type { ChildProfile, WeeklyMenu } from '@/types'

type Tab = 'profiles' | 'menu' | 'shopping'

export default function Home() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | null>(null)
  const [currentMenu, setCurrentMenu] = useState<WeeklyMenu | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('profiles')
  const [showForm, setShowForm] = useState(false)

  const handleProfileCreate = (profile: ChildProfile) => {
    setProfiles(prev => [...prev, profile])
    setShowForm(false)
  }

  const handleProfileDelete = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id))
    if (selectedProfile?.id === id) {
      setSelectedProfile(null)
      setCurrentMenu(null)
    }
  }

  const handleProfileSelect = (profile: ChildProfile) => {
    setSelectedProfile(profile)
    setCurrentMenu(null)
    setActiveTab('menu')
  }

  const handleMenuGenerated = (menu: WeeklyMenu) => {
    setCurrentMenu(menu)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <header className="bg-primary-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            LunchBox Planner
          </h1>
          <p className="text-white text-lg md:text-xl">
            Almuerzos escolares nutritivos, sin complicaciones
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            <TabButton
              active={activeTab === 'profiles'}
              onClick={() => setActiveTab('profiles')}
            >
              Perfiles ({profiles.length})
            </TabButton>
            <TabButton
              active={activeTab === 'menu'}
              onClick={() => setActiveTab('menu')}
              disabled={!selectedProfile}
            >
              Menú Semanal
            </TabButton>
            <TabButton
              active={activeTab === 'shopping'}
              onClick={() => setActiveTab('shopping')}
              disabled={!currentMenu}
            >
              Lista de Compras
            </TabButton>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profiles Tab */}
        {activeTab === 'profiles' && (
          <div>
            {profiles.length === 0 && !showForm ? (
              <EmptyState
                title="Comienza agregando un perfil"
                description="Crea un perfil para tu hijo con su edad, peso y alergias para generar menús personalizados."
                action={
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Crear Primer Perfil
                  </button>
                }
              />
            ) : (
              <>
                {showForm ? (
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Nuevo Perfil</h2>
                    <ProfileForm
                      onSubmit={handleProfileCreate}
                      onCancel={() => setShowForm(false)}
                    />
                  </div>
                ) : (
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Perfiles de tus hijos
                    </h2>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      + Agregar
                    </button>
                  </div>
                )}
                <ProfileList
                  profiles={profiles}
                  selectedId={selectedProfile?.id}
                  onSelect={handleProfileSelect}
                  onDelete={handleProfileDelete}
                />
              </>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && selectedProfile && (
          <MenuGenerator
            profile={selectedProfile}
            menu={currentMenu}
            onMenuGenerated={handleMenuGenerated}
          />
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && currentMenu && (
          <ShoppingListView menu={currentMenu} />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-100 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>
            LunchBox Planner - Todos tus datos se guardan localmente en tu dispositivo.
          </p>
          <p className="mt-1">
            Basado en guías nutricionales de FAO/OMS e ICBF Colombia.
          </p>
        </div>
      </footer>
    </main>
  )
}

function TabButton({
  children,
  active,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-3 font-medium text-sm transition-colors
        ${active
          ? 'text-primary-600 border-b-2 border-primary-600'
          : 'text-slate-600 hover:text-slate-900'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="text-6xl mb-4">🍱</div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  )
}
