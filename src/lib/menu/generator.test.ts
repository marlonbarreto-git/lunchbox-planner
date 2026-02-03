import { describe, it, expect } from 'vitest'
import {
  generateDailyMenu,
  generateWeeklyMenu,
  validateMenuNutrition,
  hasNoAllergensInMenu,
  hasNoRepeatsInWeek,
} from './generator'
import type { ChildProfile, Recipe, MenuItem } from '@/types'
import { getAllRecipes } from '@/lib/recipes/recipes'

const mockProfile: ChildProfile = {
  id: 'test-child-1',
  name: 'Test Child',
  birthDate: '2017-03-15', // ~8 years old
  sex: 'male',
  weightKg: 26.7,
  heightCm: 128,
  activityLevel: 'moderate',
  allergies: ['maní'],
  preferences: {
    likes: ['pollo', 'arroz'],
    dislikes: ['brócoli'],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('Menu Generator', () => {
  describe('generateDailyMenu', () => {
    it('should generate a menu item for a given date', () => {
      const menu = generateDailyMenu(mockProfile, '2025-02-03')

      expect(menu).toBeDefined()
      expect(menu.date).toBe('2025-02-03')
      expect(menu.recipe).toBeDefined()
      expect(menu.recipe.id).toBeDefined()
      expect(menu.portions).toBeGreaterThan(0)
      expect(menu.adjustedNutrition).toBeDefined()
    })

    it('should respect allergy restrictions', () => {
      const profileWithAllergies: ChildProfile = {
        ...mockProfile,
        allergies: ['gluten', 'lácteos'],
      }

      const menu = generateDailyMenu(profileWithAllergies, '2025-02-03')

      expect(menu.recipe.allergens).not.toContain('gluten')
      expect(menu.recipe.allergens).not.toContain('lácteos')
    })

    it('should prefer recipes with high microwave rating', () => {
      const menus: MenuItem[] = []
      for (let i = 0; i < 20; i++) {
        const date = `2025-02-${String(i + 1).padStart(2, '0')}`
        menus.push(generateDailyMenu(mockProfile, date))
      }

      const avgRating = menus.reduce((sum, m) => sum + m.recipe.microwaveRating, 0) / menus.length
      expect(avgRating).toBeGreaterThanOrEqual(3.5)
    })
  })

  describe('generateWeeklyMenu', () => {
    it('should generate 5 menu items for school days (Mon-Fri)', () => {
      const weeklyMenu = generateWeeklyMenu(mockProfile, '2025-02-03')

      expect(weeklyMenu.items).toHaveLength(5)
      expect(weeklyMenu.childId).toBe(mockProfile.id)
      expect(weeklyMenu.weekStartDate).toBe('2025-02-03')
    })

    it('should not repeat main dishes in the same week', () => {
      const weeklyMenu = generateWeeklyMenu(mockProfile, '2025-02-03')

      const recipeIds = weeklyMenu.items.map(item => item.recipe.id)
      const uniqueIds = new Set(recipeIds)

      expect(uniqueIds.size).toBe(5)
    })

    it('should never include recipes with allergens in allergies list', () => {
      const profileWithMultipleAllergies: ChildProfile = {
        ...mockProfile,
        allergies: ['gluten', 'lácteos', 'huevo', 'soya'],
      }

      const weeklyMenu = generateWeeklyMenu(profileWithMultipleAllergies, '2025-02-03')

      weeklyMenu.items.forEach(item => {
        profileWithMultipleAllergies.allergies.forEach(allergy => {
          expect(item.recipe.allergens.map(a => a.toLowerCase()))
            .not.toContain(allergy.toLowerCase())
        })
      })
    })

    it('should calculate total weekly nutrition', () => {
      const weeklyMenu = generateWeeklyMenu(mockProfile, '2025-02-03')

      expect(weeklyMenu.totalNutrition).toBeDefined()
      expect(weeklyMenu.totalNutrition.calories).toBeGreaterThan(0)
      expect(weeklyMenu.totalNutrition.proteinGrams).toBeGreaterThan(0)
      expect(weeklyMenu.totalNutrition.carbsGrams).toBeGreaterThan(0)
      expect(weeklyMenu.totalNutrition.fatGrams).toBeGreaterThan(0)
    })
  })

  describe('validateMenuNutrition', () => {
    it('should return true when nutrition is within 10% tolerance', () => {
      const targetCalories = 600
      const menuItem: MenuItem = {
        date: '2025-02-03',
        recipe: getAllRecipes()[0],
        portions: 1,
        adjustedNutrition: {
          calories: 580, // Within 10% of 600
          proteinGrams: 25,
          carbsGrams: 60,
          fatGrams: 18,
          fiberGrams: 4,
          sodiumMg: 500,
        },
      }

      expect(validateMenuNutrition(menuItem, targetCalories, 0.1)).toBe(true)
    })

    it('should return false when nutrition exceeds 10% tolerance', () => {
      const targetCalories = 600
      const menuItem: MenuItem = {
        date: '2025-02-03',
        recipe: getAllRecipes()[0],
        portions: 1,
        adjustedNutrition: {
          calories: 800, // Exceeds 10% of 600
          proteinGrams: 25,
          carbsGrams: 60,
          fatGrams: 18,
          fiberGrams: 4,
          sodiumMg: 500,
        },
      }

      expect(validateMenuNutrition(menuItem, targetCalories, 0.1)).toBe(false)
    })
  })

  describe('hasNoAllergensInMenu', () => {
    it('should return true when no allergens match', () => {
      const recipes = getAllRecipes().filter(r => r.allergens.length === 0).slice(0, 5)
      const allergies = ['gluten', 'lácteos']

      expect(hasNoAllergensInMenu(recipes, allergies)).toBe(true)
    })

    it('should return false when allergens match', () => {
      const recipes = getAllRecipes().filter(r => r.allergens.includes('gluten')).slice(0, 5)
      const allergies = ['gluten']

      if (recipes.length > 0) {
        expect(hasNoAllergensInMenu(recipes, allergies)).toBe(false)
      }
    })
  })

  describe('hasNoRepeatsInWeek', () => {
    it('should return true when all recipes are unique', () => {
      const recipes = getAllRecipes().slice(0, 5)
      expect(hasNoRepeatsInWeek(recipes)).toBe(true)
    })

    it('should return false when recipes repeat', () => {
      const recipes = getAllRecipes().slice(0, 3)
      const withRepeat = [...recipes, recipes[0], recipes[1]]
      expect(hasNoRepeatsInWeek(withRepeat)).toBe(false)
    })
  })
})
