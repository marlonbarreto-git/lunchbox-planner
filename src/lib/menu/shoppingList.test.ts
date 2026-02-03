import { describe, it, expect } from 'vitest'
import {
  generateShoppingList,
  consolidateIngredients,
  groupByCategory,
} from './shoppingList'
import type { WeeklyMenu, ShoppingList, MenuItem, RecipeIngredient } from '@/types'
import { getAllRecipes } from '@/lib/recipes/recipes'

const mockMenuItems: MenuItem[] = getAllRecipes().slice(0, 3).map((recipe, i) => ({
  date: `2025-02-0${i + 3}`,
  recipe,
  portions: 1,
  adjustedNutrition: recipe.nutrition,
}))

const mockWeeklyMenu: WeeklyMenu = {
  id: 'menu-test-1',
  childId: 'child-test-1',
  weekStartDate: '2025-02-03',
  items: mockMenuItems,
  totalNutrition: {
    calories: 1200,
    proteinGrams: 60,
    carbsGrams: 150,
    fatGrams: 40,
    fiberGrams: 15,
    sodiumMg: 1800,
  },
  createdAt: new Date().toISOString(),
}

describe('Shopping List', () => {
  describe('generateShoppingList', () => {
    it('should generate a shopping list from weekly menu', () => {
      const shoppingList = generateShoppingList(mockWeeklyMenu)

      expect(shoppingList).toBeDefined()
      expect(shoppingList.id).toBeDefined()
      expect(shoppingList.menuId).toBe(mockWeeklyMenu.id)
      expect(shoppingList.items.length).toBeGreaterThan(0)
      expect(shoppingList.createdAt).toBeDefined()
    })

    it('should consolidate ingredients from menu recipes', () => {
      const shoppingList = generateShoppingList(mockWeeklyMenu)

      const totalIngredientCount = mockMenuItems.reduce(
        (sum, item) => sum + item.recipe.ingredients.length,
        0
      )

      // Consolidated list should have fewer or equal items than total ingredients
      expect(shoppingList.items.length).toBeLessThanOrEqual(totalIngredientCount)
      expect(shoppingList.items.length).toBeGreaterThan(0)
    })

    it('should track which recipes require each ingredient', () => {
      const shoppingList = generateShoppingList(mockWeeklyMenu)

      shoppingList.items.forEach(item => {
        expect(item.recipes).toBeDefined()
        expect(item.recipes.length).toBeGreaterThan(0)
      })
    })

    it('should adjust quantities based on portions', () => {
      const doublePortionsMenu: WeeklyMenu = {
        ...mockWeeklyMenu,
        items: mockMenuItems.map(item => ({
          ...item,
          portions: 2,
        })),
      }

      const normalList = generateShoppingList(mockWeeklyMenu)
      const doubleList = generateShoppingList(doublePortionsMenu)

      const normalItem = normalList.items[0]
      const doubleItem = doubleList.items.find(i => i.ingredient === normalItem.ingredient)

      if (doubleItem) {
        expect(doubleItem.totalAmount).toBeCloseTo(normalItem.totalAmount * 2, 1)
      }
    })
  })

  describe('consolidateIngredients', () => {
    it('should combine same ingredients from different recipes', () => {
      const ingredients: Array<RecipeIngredient & { recipeName: string; portions: number }> = [
        { name: 'arroz', amount: 2, unit: 'tazas', category: 'carb', recipeName: 'Recipe 1', portions: 1 },
        { name: 'arroz', amount: 1, unit: 'tazas', category: 'carb', recipeName: 'Recipe 2', portions: 1 },
        { name: 'pollo', amount: 500, unit: 'g', category: 'protein', recipeName: 'Recipe 1', portions: 1 },
      ]

      const consolidated = consolidateIngredients(ingredients)

      const arrozItem = consolidated.find(i => i.ingredient === 'arroz')
      expect(arrozItem).toBeDefined()
      expect(arrozItem?.totalAmount).toBe(3)
      expect(arrozItem?.recipes).toContain('Recipe 1')
      expect(arrozItem?.recipes).toContain('Recipe 2')
    })

    it('should not combine ingredients with different units', () => {
      const ingredients: Array<RecipeIngredient & { recipeName: string; portions: number }> = [
        { name: 'leche', amount: 1, unit: 'taza', category: 'dairy', recipeName: 'Recipe 1', portions: 1 },
        { name: 'leche', amount: 500, unit: 'ml', category: 'dairy', recipeName: 'Recipe 2', portions: 1 },
      ]

      const consolidated = consolidateIngredients(ingredients)
      const lecheItems = consolidated.filter(i => i.ingredient === 'leche')

      expect(lecheItems.length).toBe(2)
    })

    it('should apply portions multiplier to amounts', () => {
      const ingredients: Array<RecipeIngredient & { recipeName: string; portions: number }> = [
        { name: 'huevos', amount: 2, unit: 'unidades', category: 'protein', recipeName: 'Recipe 1', portions: 1.5 },
      ]

      const consolidated = consolidateIngredients(ingredients)
      const huevosItem = consolidated.find(i => i.ingredient === 'huevos')

      expect(huevosItem?.totalAmount).toBe(3) // 2 * 1.5
    })
  })

  describe('groupByCategory', () => {
    it('should group items by category', () => {
      const items = [
        { ingredient: 'arroz', totalAmount: 3, unit: 'tazas', category: 'carb', recipes: ['R1'] },
        { ingredient: 'pollo', totalAmount: 500, unit: 'g', category: 'protein', recipes: ['R1'] },
        { ingredient: 'papa', totalAmount: 2, unit: 'unidades', category: 'carb', recipes: ['R2'] },
        { ingredient: 'carne', totalAmount: 400, unit: 'g', category: 'protein', recipes: ['R2'] },
      ]

      const grouped = groupByCategory(items)

      expect(grouped.carb).toHaveLength(2)
      expect(grouped.protein).toHaveLength(2)
      expect(grouped.carb.map(i => i.ingredient)).toContain('arroz')
      expect(grouped.carb.map(i => i.ingredient)).toContain('papa')
    })

    it('should handle empty arrays', () => {
      const grouped = groupByCategory([])
      expect(Object.keys(grouped).length).toBe(0)
    })
  })
})
