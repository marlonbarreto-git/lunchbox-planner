'use client'

import { useMemo } from 'react'
import type { WeeklyMenu, ShoppingListItem } from '@/types'
import { generateShoppingList, groupByCategory } from '@/lib/menu/shoppingList'

interface ShoppingListViewProps {
  menu: WeeklyMenu
}

const CATEGORY_NAMES: Record<string, string> = {
  protein: 'Proteínas',
  carb: 'Carbohidratos',
  vegetable: 'Verduras',
  fruit: 'Frutas',
  dairy: 'Lácteos',
  fat: 'Grasas y Aceites',
  seasoning: 'Condimentos',
  other: 'Otros',
}

const CATEGORY_ICONS: Record<string, string> = {
  protein: '🥩',
  carb: '🍚',
  vegetable: '🥬',
  fruit: '🍎',
  dairy: '🧀',
  fat: '🫒',
  seasoning: '🧂',
  other: '📦',
}

export function ShoppingListView({ menu }: ShoppingListViewProps) {
  const shoppingList = useMemo(() => generateShoppingList(menu), [menu])
  const grouped = useMemo(() => groupByCategory(shoppingList.items), [shoppingList])

  const handleCopy = () => {
    const text = formatListForCopy(grouped)
    navigator.clipboard.writeText(text)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          Lista de Compras
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Copiar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors print:hidden"
          >
            Imprimir
          </button>
        </div>
      </div>

      <div className="text-sm text-slate-500 mb-4">
        {shoppingList.items.length} ingredientes para {menu.items.length} comidas
      </div>

      <div className="space-y-6 print:space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <CategorySection
            key={category}
            category={category}
            items={items}
          />
        ))}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          main, main * {
            visibility: visible;
          }
          main {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

function CategorySection({
  category,
  items,
}: {
  category: string
  items: ShoppingListItem[]
}) {
  const name = CATEGORY_NAMES[category] || category
  const icon = CATEGORY_ICONS[category] || '📋'

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        <span>{name}</span>
        <span className="text-sm font-normal text-slate-500">
          ({items.length})
        </span>
      </h3>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={`${item.ingredient}_${item.unit}`}
            className="flex items-start gap-3 text-slate-700"
          >
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">
                  {item.ingredient}
                </span>
                <span className="text-slate-600">
                  {formatAmount(item.totalAmount)} {item.unit}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Para: {item.recipes.join(', ')}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatAmount(amount: number): string {
  if (Number.isInteger(amount)) {
    return amount.toString()
  }
  return amount.toFixed(1)
}

function formatListForCopy(grouped: Record<string, ShoppingListItem[]>): string {
  let text = 'LISTA DE COMPRAS\n'
  text += '================\n\n'

  Object.entries(grouped).forEach(([category, items]) => {
    const name = CATEGORY_NAMES[category] || category
    text += `${name.toUpperCase()}\n`
    text += '-'.repeat(20) + '\n'

    items.forEach((item) => {
      text += `[ ] ${item.ingredient}: ${formatAmount(item.totalAmount)} ${item.unit}\n`
    })

    text += '\n'
  })

  return text
}
