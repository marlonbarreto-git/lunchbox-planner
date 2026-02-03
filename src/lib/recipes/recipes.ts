import type { Recipe } from '@/types'
import { recipes as recipeData } from '@/data/recipes'

export function getAllRecipes(): Recipe[] {
  return recipeData
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipeData.find(recipe => recipe.id === id)
}

export function searchRecipes(query: string): Recipe[] {
  const lowerQuery = query.toLowerCase()
  return recipeData.filter(recipe =>
    recipe.name.toLowerCase().includes(lowerQuery) ||
    recipe.description.toLowerCase().includes(lowerQuery) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

export function filterRecipesByAllergies(recipes: Recipe[], allergies: string[]): Recipe[] {
  if (allergies.length === 0) return recipes

  const lowerAllergies = allergies.map(a => a.toLowerCase())
  return recipes.filter(recipe =>
    !recipe.allergens.some(allergen =>
      lowerAllergies.includes(allergen.toLowerCase())
    )
  )
}

export function filterRecipesByMicrowaveRating(recipes: Recipe[], minRating: number): Recipe[] {
  return recipes.filter(recipe => recipe.microwaveRating >= minRating)
}

export function getRecipesByCategory(category: Recipe['category']): Recipe[] {
  return recipeData.filter(recipe => recipe.category === category)
}

export function getRecipesByCuisine(cuisine: Recipe['cuisine']): Recipe[] {
  return recipeData.filter(recipe => recipe.cuisine === cuisine)
}

export function getRecipesByTags(tags: string[]): Recipe[] {
  const lowerTags = tags.map(t => t.toLowerCase())
  return recipeData.filter(recipe =>
    lowerTags.some(tag =>
      recipe.tags.some(recipeTag => recipeTag.toLowerCase().includes(tag))
    )
  )
}
