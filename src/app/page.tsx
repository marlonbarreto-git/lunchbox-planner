'use client'

import { useState, useEffect } from 'react'
import { ProfileForm } from '@/components/ProfileForm'
import { ProfileList } from '@/components/ProfileList'
import { MenuGenerator } from '@/components/MenuGenerator'
import { ShoppingListView } from '@/components/ShoppingListView'
import type { ChildProfile, WeeklyMenu } from '@/types'

type View = 'home' | 'profiles' | 'menu' | 'shopping'

export default function Home() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | null>(null)
  const [currentMenu, setCurrentMenu] = useState<WeeklyMenu | null>(null)
  const [view, setView] = useState<View>('home')
  const [showForm, setShowForm] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const saved = localStorage.getItem('darkMode')
    setDarkMode(saved ? saved === 'true' : prefersDark)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

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
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="max-w-3xl mx-auto px-6 py-16">
          {/* Hero */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              🍱 LunchBox Planner
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Planifica almuerzos escolares nutritivos para tus hijos.
              <span className="block mt-2">Sin complicaciones. Sin registro.</span>
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <FeatureCard
              emoji="👶"
              title="Perfiles personalizados"
              description="Crea perfiles con edad, peso y alergias. Calculamos los requerimientos nutricionales automáticamente."
            />
            <FeatureCard
              emoji="📅"
              title="Menús semanales"
              description="Genera menús de lunes a viernes. Sin repeticiones, respetando alergias al 100%."
            />
            <FeatureCard
              emoji="🍲"
              title="155+ recetas"
              description="Platos colombianos, latinos e internacionales. Todos aptos para microondas."
            />
            <FeatureCard
              emoji="🛒"
              title="Lista de compras"
              description="Ingredientes consolidados y organizados por categoría. Lista para el supermercado."
            />
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => setView('profiles')}
              className="inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Comenzar ahora
              <span>→</span>
            </button>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
              100% gratis • Datos locales • Sin registro
            </p>
          </div>

          {/* Trust */}
          <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
            <p className="text-center text-sm text-slate-500 dark:text-slate-500 mb-4">
              Basado en guías nutricionales de
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-slate-400 dark:text-slate-600 text-sm">
              <span>FAO/OMS</span>
              <span>•</span>
              <span>ICBF Colombia</span>
              <span>•</span>
              <span>USDA</span>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-1 -mb-px overflow-x-auto">
            <NavTab active={view === 'profiles'} onClick={() => setView('profiles')}>
              👶 Perfiles
            </NavTab>
            <NavTab
              active={view === 'menu'}
              onClick={() => selectedProfile && setView('menu')}
              disabled={!selectedProfile}
            >
              📅 Menú
            </NavTab>
            <NavTab
              active={view === 'shopping'}
              onClick={goToShopping}
              disabled={!currentMenu}
            >
              🛒 Compras
            </NavTab>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {view === 'profiles' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Perfiles
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {profiles.length === 0
                    ? 'Agrega el primer perfil para comenzar'
                    : `${profiles.length} perfil${profiles.length > 1 ? 'es' : ''} creado${profiles.length > 1 ? 's' : ''}`
                  }
                </p>
              </div>
              {profiles.length > 0 && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  + Agregar
                </button>
              )}
            </div>

            {showForm ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                  Nuevo perfil
                </h3>
                <ProfileForm
                  onSubmit={handleProfileCreate}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            ) : profiles.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="text-6xl mb-4">👶</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Sin perfiles todavía
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Crea un perfil con la edad, peso y alergias de tu hijo para generar menús personalizados.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
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

      <Footer />
    </div>
  )
}

function Header({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-lg font-bold text-slate-900 dark:text-white">
          🍱 LunchBox
        </a>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="py-8 mt-auto">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Tus datos se guardan localmente en tu dispositivo.
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-600 mt-2">
          Hecho con ❤️ para padres ocupados
        </p>
      </div>
    </footer>
  )
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
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
        px-4 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2
        ${active
          ? 'text-slate-900 dark:text-white border-slate-900 dark:border-white'
          : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  )
}
