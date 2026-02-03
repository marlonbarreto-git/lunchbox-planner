import type { WeeklyMenu, ShoppingList, ShoppingListItem, RecipeIngredient } from '@/types'

function generateId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `shopping_${timestamp}_${random}`
}

type IngredientWithMeta = RecipeIngredient & { recipeName: string; portions: number }

export function consolidateIngredients(
  ingredients: IngredientWithMeta[]
): ShoppingListItem[] {
  const consolidated = new Map<string, ShoppingListItem>()

  ingredients.forEach(ing => {
    const key = `${ing.name.toLowerCase()}_${ing.unit.toLowerCase()}`
    const adjustedAmount = ing.amount * ing.portions

    if (consolidated.has(key)) {
      const existing = consolidated.get(key)!
      existing.totalAmount += adjustedAmount
      if (!existing.recipes.includes(ing.recipeName)) {
        existing.recipes.push(ing.recipeName)
      }
    } else {
      consolidated.set(key, {
        ingredient: ing.name,
        totalAmount: adjustedAmount,
        unit: ing.unit,
        category: ing.category,
        recipes: [ing.recipeName],
      })
    }
  })

  return Array.from(consolidated.values()).map(item => ({
    ...item,
    totalAmount: Math.round(item.totalAmount * 100) / 100,
  }))
}

export function groupByCategory(
  items: ShoppingListItem[]
): Record<string, ShoppingListItem[]> {
  return items.reduce((groups, item) => {
    const category = item.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {} as Record<string, ShoppingListItem[]>)
}

export function generateShoppingList(menu: WeeklyMenu): ShoppingList {
  const allIngredients: IngredientWithMeta[] = []

  menu.items.forEach(menuItem => {
    menuItem.recipe.ingredients.forEach(ingredient => {
      allIngredients.push({
        ...ingredient,
        recipeName: menuItem.recipe.name,
        portions: menuItem.portions,
      })
    })
  })

  const consolidatedItems = consolidateIngredients(allIngredients)

  return {
    id: generateId(),
    menuId: menu.id,
    items: consolidatedItems,
    createdAt: new Date().toISOString(),
  }
}

export function formatShoppingListForPrint(shoppingList: ShoppingList): string {
  const grouped = groupByCategory(shoppingList.items)
  const categoryNames: Record<string, string> = {
    protein: 'Proteínas',
    carb: 'Carbohidratos',
    vegetable: 'Verduras',
    fruit: 'Frutas',
    dairy: 'Lácteos',
    fat: 'Grasas y Aceites',
    seasoning: 'Condimentos',
    other: 'Otros',
  }

  let output = '🛒 LISTA DE COMPRAS\n'
  output += '═'.repeat(40) + '\n\n'

  Object.entries(grouped).forEach(([category, items]) => {
    const categoryTitle = categoryNames[category] || category
    output += `📦 ${categoryTitle.toUpperCase()}\n`
    output += '─'.repeat(30) + '\n'

    items.forEach(item => {
      output += `  • ${item.ingredient}: ${item.totalAmount} ${item.unit}\n`
      output += `    (para: ${item.recipes.join(', ')})\n`
    })

    output += '\n'
  })

  return output
}
