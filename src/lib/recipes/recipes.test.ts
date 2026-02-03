import { describe, it, expect } from 'vitest'
import {
  getAllRecipes,
  getRecipeById,
  searchRecipes,
  filterRecipesByAllergies,
  filterRecipesByMicrowaveRating,
  getRecipesByCategory,
} from './recipes'
import type { Recipe } from '@/types'

describe('Recipe Operations', () => {
  describe('getAllRecipes', () => {
    it('should return at least 150 recipes', () => {
      const recipes = getAllRecipes()
      expect(recipes.length).toBeGreaterThanOrEqual(150)
    })

    it('should return recipes with required fields', () => {
      const recipes = getAllRecipes()
      const recipe = recipes[0]

      expect(recipe.id).toBeDefined()
      expect(recipe.name).toBeDefined()
      expect(recipe.category).toBeDefined()
      expect(recipe.microwaveRating).toBeGreaterThanOrEqual(1)
      expect(recipe.microwaveRating).toBeLessThanOrEqual(5)
      expect(recipe.nutrition).toBeDefined()
      expect(recipe.nutrition.calories).toBeGreaterThan(0)
      expect(recipe.ingredients).toBeDefined()
      expect(recipe.ingredients.length).toBeGreaterThan(0)
    })
  })

  describe('getRecipeById', () => {
    it('should return a recipe by id', () => {
      const recipes = getAllRecipes()
      const firstRecipe = recipes[0]

      const found = getRecipeById(firstRecipe.id)
      expect(found).toBeDefined()
      expect(found?.id).toBe(firstRecipe.id)
    })

    it('should return undefined for non-existent id', () => {
      const found = getRecipeById('non-existent-id')
      expect(found).toBeUndefined()
    })
  })

  describe('searchRecipes', () => {
    it('should find recipes by name, description, or tags', () => {
      const results = searchRecipes('arroz')
      expect(results.length).toBeGreaterThan(0)
      results.forEach(recipe => {
        const matchesName = recipe.name.toLowerCase().includes('arroz')
        const matchesDescription = recipe.description.toLowerCase().includes('arroz')
        const matchesTags = recipe.tags.some(tag => tag.toLowerCase().includes('arroz'))
        expect(matchesName || matchesDescription || matchesTags).toBe(true)
      })
    })

    it('should be case insensitive', () => {
      const lower = searchRecipes('pollo')
      const upper = searchRecipes('POLLO')
      expect(lower.length).toBe(upper.length)
    })

    it('should return empty array for no matches', () => {
      const results = searchRecipes('xyznonexistent123')
      expect(results).toEqual([])
    })
  })

  describe('filterRecipesByAllergies', () => {
    it('should exclude recipes with specified allergens', () => {
      const recipes = getAllRecipes()
      const filtered = filterRecipesByAllergies(recipes, ['gluten'])

      filtered.forEach(recipe => {
        expect(recipe.allergens).not.toContain('gluten')
      })
    })

    it('should handle multiple allergies', () => {
      const recipes = getAllRecipes()
      const filtered = filterRecipesByAllergies(recipes, ['gluten', 'lácteos'])

      filtered.forEach(recipe => {
        expect(recipe.allergens).not.toContain('gluten')
        expect(recipe.allergens).not.toContain('lácteos')
      })
    })

    it('should return all recipes when no allergies specified', () => {
      const recipes = getAllRecipes()
      const filtered = filterRecipesByAllergies(recipes, [])
      expect(filtered.length).toBe(recipes.length)
    })
  })

  describe('filterRecipesByMicrowaveRating', () => {
    it('should return recipes with rating >= minimum', () => {
      const recipes = getAllRecipes()
      const filtered = filterRecipesByMicrowaveRating(recipes, 4)

      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach(recipe => {
        expect(recipe.microwaveRating).toBeGreaterThanOrEqual(4)
      })
    })

    it('should return all recipes with minimum rating of 1', () => {
      const recipes = getAllRecipes()
      const filtered = filterRecipesByMicrowaveRating(recipes, 1)
      expect(filtered.length).toBe(recipes.length)
    })
  })

  describe('getRecipesByCategory', () => {
    it('should return only main dishes', () => {
      const mains = getRecipesByCategory('main')
      expect(mains.length).toBeGreaterThan(0)
      mains.forEach(recipe => {
        expect(recipe.category).toBe('main')
      })
    })

    it('should return only sides', () => {
      const sides = getRecipesByCategory('side')
      expect(sides.length).toBeGreaterThan(0)
      sides.forEach(recipe => {
        expect(recipe.category).toBe('side')
      })
    })
  })

  describe('Recipe data quality', () => {
    it('should have Colombian recipes', () => {
      const recipes = getAllRecipes()
      const colombian = recipes.filter(r => r.cuisine === 'colombian')
      expect(colombian.length).toBeGreaterThan(30)
    })

    it('should have variety of proteins', () => {
      const recipes = getAllRecipes()
      const tags = recipes.flatMap(r => r.tags)

      expect(tags).toContain('pollo')
      expect(tags).toContain('res')
      expect(tags).toContain('cerdo')
      expect(tags).toContain('pescado')
      expect(tags).toContain('huevo')
      expect(tags).toContain('legumbres')
    })

    it('should have vegetarian options', () => {
      const recipes = getAllRecipes()
      const vegetarian = recipes.filter(r => r.tags.includes('vegetariano'))
      expect(vegetarian.length).toBeGreaterThan(15)
    })

    it('should have recipes with high microwave rating (4-5)', () => {
      const recipes = getAllRecipes()
      const highRating = recipes.filter(r => r.microwaveRating >= 4)
      expect(highRating.length).toBeGreaterThan(80)
    })
  })
})
