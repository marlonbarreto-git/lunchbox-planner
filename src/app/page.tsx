'use client'

import { useState, useEffect } from 'react'
import { ProfileForm } from '@/components/ProfileForm'
import { ProfileList } from '@/components/ProfileList'
import { MenuGenerator } from '@/components/MenuGenerator'
import { ShoppingListView } from '@/components/ShoppingListView'
import type { ChildProfile, WeeklyMenu } from '@/types'

type View = 'home' | 'profiles' | 'menu' | 'shopping'

const STORAGE_KEYS = {
  profiles: 'lunchbox_profiles',
  selectedProfileId: 'lunchbox_selectedProfileId',
  currentMenu: 'lunchbox_currentMenu',
  darkMode: 'lunchbox_darkMode',
} as const

export default function Home() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | null>(null)
  const [currentMenu, setCurrentMenu] = useState<WeeklyMenu | null>(null)
  const [view, setView] = useState<View>('home')
  const [showForm, setShowForm] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.darkMode)
    setDarkMode(savedDarkMode ? savedDarkMode === 'true' : prefersDark)

    const savedProfiles = localStorage.getItem(STORAGE_KEYS.profiles)
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles) as ChildProfile[]
        setProfiles(parsed)

        const savedSelectedId = localStorage.getItem(STORAGE_KEYS.selectedProfileId)
        if (savedSelectedId) {
          const found = parsed.find(p => p.id === savedSelectedId)
          if (found) {
            setSelectedProfile(found)
            setView('profiles')
          }
        }

        const savedMenu = localStorage.getItem(STORAGE_KEYS.currentMenu)
        if (savedMenu && savedSelectedId) {
          try {
            const parsedMenu = JSON.parse(savedMenu) as WeeklyMenu
            if (parsedMenu.childId === savedSelectedId) {
              setCurrentMenu(parsedMenu)
            }
          } catch {
            localStorage.removeItem(STORAGE_KEYS.currentMenu)
          }
        }

        if (parsed.length > 0) {
          setView('profiles')
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.profiles)
      }
    }

    setIsHydrated(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.darkMode, String(darkMode))
    }
  }, [darkMode, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(profiles))
    }
  }, [profiles, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      if (selectedProfile) {
        localStorage.setItem(STORAGE_KEYS.selectedProfileId, selectedProfile.id)
      } else {
        localStorage.removeItem(STORAGE_KEYS.selectedProfileId)
      }
    }
  }, [selectedProfile, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      if (currentMenu) {
        localStorage.setItem(STORAGE_KEYS.currentMenu, JSON.stringify(currentMenu))
      } else {
        localStorage.removeItem(STORAGE_KEYS.currentMenu)
      }
    }
  }, [currentMenu, isHydrated])

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
    setView('menu')
  }

  const handleMenuGenerated = (menu: WeeklyMenu) => {
    setCurrentMenu(menu)
  }

  const goToShopping = () => {
    if (currentMenu) setView('shopping')
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
        <header className="fixed top-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-900 z-50">
          <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">LunchBox</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 pt-32 pb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Planifica almuerzos<br />escolares nutritivos
          </h1>

          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
            Crea menús semanales personalizados para tus hijos basados en sus necesidades nutricionales.
            Sin registro. Sin complicaciones.
          </p>

          <button
            onClick={() => setView('profiles')}
            className="mt-10 inline-flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Comenzar ahora
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="mt-20 grid gap-8">
            <Feature
              icon="👶"
              title="Perfiles personalizados"
              description="Registra edad, peso, altura y alergias. Los requerimientos nutricionales se calculan automáticamente según estándares OMS."
            />
            <Feature
              icon="📅"
              title="Menús semanales"
              description="Genera menús de lunes a viernes sin repeticiones. Todas las recetas respetan las alergias registradas."
            />
            <Feature
              icon="🍲"
              title="275+ recetas"
              description="Platos colombianos, latinos e internacionales. Todas evaluadas para transporte y recalentamiento en microondas."
            />
            <Feature
              icon="🛒"
              title="Lista de compras"
              description="Ingredientes consolidados por categoría, listos para llevar al supermercado."
            />
          </div>

          <hr className="my-16 border-zinc-200 dark:border-zinc-800" />

          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p>Basado en guías nutricionales de:</p>
            <p className="mt-2 text-zinc-500 dark:text-zinc-500">
              FAO/OMS · ICBF Colombia · USDA
            </p>
          </div>
        </main>

        <footer className="border-t border-zinc-100 dark:border-zinc-900 py-8">
          <div className="max-w-2xl mx-auto px-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
            <p>Tus datos se guardan localmente en tu dispositivo.</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setView('home')}
            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            LunchBox
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex gap-6">
            <NavTab active={view === 'profiles'} onClick={() => setView('profiles')}>
              Perfiles
            </NavTab>
            <NavTab
              active={view === 'menu'}
              onClick={() => selectedProfile && setView('menu')}
              disabled={!selectedProfile}
            >
              Menú
            </NavTab>
            <NavTab
              active={view === 'shopping'}
              onClick={goToShopping}
              disabled={!currentMenu}
            >
              Compras
            </NavTab>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {view === 'profiles' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Perfiles
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  {profiles.length === 0
                    ? 'Agrega el primer perfil para comenzar'
                    : `${profiles.length} perfil${profiles.length > 1 ? 'es' : ''} creado${profiles.length > 1 ? 's' : ''}`
                  }
                </p>
              </div>
              {profiles.length > 0 && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  + Agregar
                </button>
              )}
            </div>

            {showForm ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                  Nuevo perfil
                </h3>
                <ProfileForm
                  onSubmit={handleProfileCreate}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            ) : profiles.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center border border-zinc-200 dark:border-zinc-800">
                <div className="text-5xl mb-4">👶</div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Sin perfiles todavía
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                  Crea un perfil con la edad, peso y alergias de tu hijo para generar menús personalizados.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Crear primer perfil
                </button>
              </div>
            ) : (
              <ProfileList
                profiles={profiles}
                selectedId={selectedProfile?.id}
                onSelect={handleProfileSelect}
                onDelete={handleProfileDelete}
              />
            )}
          </div>
        )}

        {view === 'menu' && selectedProfile && (
          <MenuGenerator
            profile={selectedProfile}
            menu={currentMenu}
            onMenuGenerated={handleMenuGenerated}
            onGoToShopping={goToShopping}
          />
        )}

        {view === 'shopping' && currentMenu && (
          <ShoppingListView menu={currentMenu} />
        )}
      </main>

      <footer className="py-8 mt-auto border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Datos guardados localmente
          </p>
        </div>
      </footer>
    </div>
  )
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

function NavTab({
  children,
  active,
  onClick,
  disabled = false
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
        py-3 text-sm font-medium border-b-2 transition-colors
        ${active
          ? 'text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-zinc-100'
          : 'text-zinc-500 dark:text-zinc-500 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  )
}
