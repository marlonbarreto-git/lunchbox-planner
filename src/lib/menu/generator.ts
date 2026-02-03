import type { ChildProfile, Recipe, MenuItem, WeeklyMenu, RecipeNutrition } from '@/types'
import { getAllRecipes, filterRecipesByAllergies, filterRecipesByMicrowaveRating } from '@/lib/recipes/recipes'
import { calculateNutritionalRequirements } from '@/lib/nutrition/calculator'

function generateId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `menu_${timestamp}_${random}`
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function selectBestRecipe(
  candidates: Recipe[],
  targetCalories: number,
  preferences: { likes: string[]; dislikes: string[] },
  excludeIds: Set<string>
): Recipe {
  const available = candidates.filter(r => !excludeIds.has(r.id))

  if (available.length === 0) {
    throw new Error('No suitable recipes available')
  }

  const scored = available.map(recipe => {
    let score = 0

    // Microwave rating (higher is better)
    score += recipe.microwaveRating * 10

    // Child acceptance
    if (recipe.childAcceptance === 'high') score += 30
    else if (recipe.childAcceptance === 'medium') score += 15

    // Transport hours (longer is better)
    score += recipe.transportHours * 5

    // Preference matching (likes boost, dislikes penalty)
    const hasLikedIngredient = recipe.tags.some(tag =>
      preferences.likes.some(like => tag.toLowerCase().includes(like.toLowerCase()))
    )
    if (hasLikedIngredient) score += 20

    const hasDislikedIngredient = recipe.tags.some(tag =>
      preferences.dislikes.some(dislike => tag.toLowerCase().includes(dislike.toLowerCase()))
    )
    if (hasDislikedIngredient) score -= 40

    // Calorie proximity (closer to target is better)
    const calorieDiff = Math.abs(recipe.nutrition.calories - targetCalories)
    score -= calorieDiff / 10

    return { recipe, score }
  })

  scored.sort((a, b) => b.score - a.score)

  // Add some randomness among top candidates
  const topCandidates = scored.slice(0, Math.min(5, scored.length))
  const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)]

  return selected.recipe
}

function adjustPortions(recipe: Recipe, targetCalories: number): { portions: number; nutrition: RecipeNutrition } {
  const baseCalories = recipe.nutrition.calories
  const portions = Math.max(0.5, Math.min(2, targetCalories / baseCalories))

  const adjustedNutrition: RecipeNutrition = {
    calories: Math.round(recipe.nutrition.calories * portions),
    proteinGrams: Math.round(recipe.nutrition.proteinGrams * portions * 10) / 10,
    carbsGrams: Math.round(recipe.nutrition.carbsGrams * portions * 10) / 10,
    fatGrams: Math.round(recipe.nutrition.fatGrams * portions * 10) / 10,
    fiberGrams: Math.round(recipe.nutrition.fiberGrams * portions * 10) / 10,
    sodiumMg: Math.round(recipe.nutrition.sodiumMg * portions),
  }

  return {
    portions: Math.round(portions * 100) / 100,
    nutrition: adjustedNutrition,
  }
}

export function generateDailyMenu(profile: ChildProfile, date: string): MenuItem {
  const requirements = calculateNutritionalRequirements(profile)
  const targetCalories = requirements.lunchCalories

  let recipes = getAllRecipes()
  recipes = filterRecipesByAllergies(recipes, profile.allergies)
  recipes = filterRecipesByMicrowaveRating(recipes, 3) // Minimum 3 stars for microwave
  recipes = recipes.filter(r => r.category === 'main') // Only main dishes for daily menu

  const recipe = selectBestRecipe(recipes, targetCalories, profile.preferences, new Set())
  const { portions, nutrition } = adjustPortions(recipe, targetCalories)

  return {
    date,
    recipe,
    portions,
    adjustedNutrition: nutrition,
  }
}

export function generateWeeklyMenu(profile: ChildProfile, weekStartDate: string): WeeklyMenu {
  const requirements = calculateNutritionalRequirements(profile)
  const targetCalories = requirements.lunchCalories

  let recipes = getAllRecipes()
  recipes = filterRecipesByAllergies(recipes, profile.allergies)
  recipes = filterRecipesByMicrowaveRating(recipes, 3)
  recipes = recipes.filter(r => r.category === 'main')
  recipes = shuffleArray(recipes)

  const items: MenuItem[] = []
  const usedRecipeIds = new Set<string>()
  const startDate = new Date(weekStartDate)

  for (let i = 0; i < 5; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const recipe = selectBestRecipe(recipes, targetCalories, profile.preferences, usedRecipeIds)
    usedRecipeIds.add(recipe.id)

    const { portions, nutrition } = adjustPortions(recipe, targetCalories)

    items.push({
      date: dateStr,
      recipe,
      portions,
      adjustedNutrition: nutrition,
    })
  }

  const totalNutrition = items.reduce(
    (total, item) => ({
      calories: total.calories + item.adjustedNutrition.calories,
      proteinGrams: total.proteinGrams + item.adjustedNutrition.proteinGrams,
      carbsGrams: total.carbsGrams + item.adjustedNutrition.carbsGrams,
      fatGrams: total.fatGrams + item.adjustedNutrition.fatGrams,
      fiberGrams: total.fiberGrams + item.adjustedNutrition.fiberGrams,
      sodiumMg: total.sodiumMg + item.adjustedNutrition.sodiumMg,
    }),
    { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, fiberGrams: 0, sodiumMg: 0 }
  )

  return {
    id: generateId(),
    childId: profile.id,
    weekStartDate,
    items,
    totalNutrition,
    createdAt: new Date().toISOString(),
  }
}

export function validateMenuNutrition(
  menuItem: MenuItem,
  targetCalories: number,
  tolerance: number = 0.1
): boolean {
  const actualCalories = menuItem.adjustedNutrition.calories
  const lowerBound = targetCalories * (1 - tolerance)
  const upperBound = targetCalories * (1 + tolerance)

  return actualCalories >= lowerBound && actualCalories <= upperBound
}

export function hasNoAllergensInMenu(recipes: Recipe[], allergies: string[]): boolean {
  const lowerAllergies = allergies.map(a => a.toLowerCase())

  return recipes.every(recipe =>
    !recipe.allergens.some(allergen =>
      lowerAllergies.includes(allergen.toLowerCase())
    )
  )
}

export function hasNoRepeatsInWeek(recipes: Recipe[]): boolean {
  const ids = recipes.map(r => r.id)
  return new Set(ids).size === ids.length
}
