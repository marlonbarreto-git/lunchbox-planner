'use client'

import { useMemo } from 'react'
import type { WeeklyMenu, ShoppingListItem } from '@/types'
import { generateShoppingList, groupByCategory } from '@/lib/menu/shoppingList'

interface ShoppingListViewProps {
  menu: WeeklyMenu
}

const CATEGORY_INFO: Record<string, { name: string; emoji: string }> = {
  protein: { name: 'Proteínas', emoji: '🥩' },
  carb: { name: 'Carbohidratos', emoji: '🍚' },
  vegetable: { name: 'Verduras', emoji: '🥬' },
  fruit: { name: 'Frutas', emoji: '🍎' },
  dairy: { name: 'Lácteos', emoji: '🧀' },
  fat: { name: 'Grasas', emoji: '🫒' },
  seasoning: { name: 'Condimentos', emoji: '🧂' },
  other: { name: 'Otros', emoji: '📦' },
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Lista de compras
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {shoppingList.items.length} ingredientes para {menu.items.length} comidas
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            📋 Copiar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors print:hidden"
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* Categories */}
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
  const info = CATEGORY_INFO[category] || { name: category, emoji: '📋' }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{info.emoji}</span>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {info.name}
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          ({items.length})
        </span>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={`${item.ingredient}_${item.unit}`}
            className="flex items-start gap-3"
          >
            <input
              type="checkbox"
              className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-slate-900 dark:focus:ring-white bg-slate-50 dark:bg-slate-700"
            />
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-slate-900 dark:text-white">
                  {item.ingredient}
                </span>
                <span className="text-slate-600 dark:text-slate-400 tabular-nums">
                  {formatAmount(item.totalAmount)} {item.unit}
                </span>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {item.recipes.join(' • ')}
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
  let text = '🛒 LISTA DE COMPRAS\n'
  text += '━'.repeat(30) + '\n\n'

  Object.entries(grouped).forEach(([category, items]) => {
    const info = CATEGORY_INFO[category] || { name: category, emoji: '📋' }
    text += `${info.emoji} ${info.name.toUpperCase()}\n`

    items.forEach((item) => {
      text += `☐ ${item.ingredient}: ${formatAmount(item.totalAmount)} ${item.unit}\n`
    })

    text += '\n'
  })

  return text
}
