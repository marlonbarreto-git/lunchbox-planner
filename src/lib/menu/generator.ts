import type { ChildProfile, Recipe, MenuItem, WeeklyMenu, RecipeNutrition, MealType } from '@/types'
import { MEAL_CALORIE_PERCENTAGES } from '@/types'
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
  excludeIds: Set<string>,
  usedCuisines: Set<string> = new Set(),
  usedProteins: Set<string> = new Set()
): Recipe {
  const available = candidates.filter(r => !excludeIds.has(r.id))

  if (available.length === 0) {
    throw new Error('No suitable recipes available')
  }

  const scored = available.map(recipe => {
    let score = 0

    // Base score from quality attributes (reduced weight)
    score += recipe.microwaveRating * 5
    if (recipe.childAcceptance === 'high') score += 15
    else if (recipe.childAcceptance === 'medium') score += 8
    score += recipe.transportHours * 2

    // Cuisine diversity bonus (encourage different cuisines)
    if (!usedCuisines.has(recipe.cuisine)) score += 25

    // Protein diversity bonus (encourage variety)
    const mainProtein = recipe.tags.find(t =>
      ['pollo', 'res', 'cerdo', 'pescado', 'huevo', 'legumbres', 'atún', 'camarones'].includes(t.toLowerCase())
    )
    if (mainProtein && !usedProteins.has(mainProtein.toLowerCase())) score += 20

    // Preference matching
    const hasLikedIngredient = recipe.tags.some(tag =>
      preferences.likes.some(like => tag.toLowerCase().includes(like.toLowerCase()))
    )
    if (hasLikedIngredient) score += 15

    const hasDislikedIngredient = recipe.tags.some(tag =>
      preferences.dislikes.some(dislike => tag.toLowerCase().includes(dislike.toLowerCase()))
    )
    if (hasDislikedIngredient) score -= 50

    // Calorie proximity (reduced penalty for variation)
    const calorieDiff = Math.abs(recipe.nutrition.calories - targetCalories)
    score -= calorieDiff / 20

    // Add significant randomness for variety
    score += Math.random() * 40

    return { recipe, score }
  })

  scored.sort((a, b) => b.score - a.score)

  // Select from top 15 candidates (increased from 5)
  const topCandidates = scored.slice(0, Math.min(15, scored.length))
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

function getRecipesForMealType(recipes: Recipe[], mealType: MealType): Recipe[] {
  return recipes.filter(r => r.mealTypes.includes(mealType))
}

function getTargetCaloriesForMeal(dailyCalories: number, mealType: MealType): number {
  return Math.round(dailyCalories * MEAL_CALORIE_PERCENTAGES[mealType])
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
    mealType: 'lunch',
    recipe,
    portions,
    adjustedNutrition: nutrition,
  }
}

export function generateWeeklyMenu(
  profile: ChildProfile,
  weekStartDate: string,
  selectedMealTypes: MealType[] = ['lunch']
): WeeklyMenu {
  const requirements = calculateNutritionalRequirements(profile)

  let allRecipes = getAllRecipes()
  allRecipes = filterRecipesByAllergies(allRecipes, profile.allergies)
  allRecipes = filterRecipesByMicrowaveRating(allRecipes, 3)
  allRecipes = shuffleArray(allRecipes)

  const items: MenuItem[] = []
  const usedRecipeIdsForWeek = new Set<string>()
  const usedCuisinesForWeek = new Set<string>()
  const usedProteinsForWeek = new Set<string>()
  const startDate = new Date(weekStartDate)

  for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + dayIndex)
    const dateStr = date.toISOString().split('T')[0]

    for (const mealType of selectedMealTypes) {
      const targetCalories = getTargetCaloriesForMeal(requirements.dailyCalories, mealType)
      const recipesForMeal = getRecipesForMealType(allRecipes, mealType)

      if (recipesForMeal.length === 0) {
        continue
      }

      const recipe = selectBestRecipe(
        recipesForMeal,
        targetCalories,
        profile.preferences,
        usedRecipeIdsForWeek,
        usedCuisinesForWeek,
        usedProteinsForWeek
      )
      usedRecipeIdsForWeek.add(recipe.id)
      usedCuisinesForWeek.add(recipe.cuisine)

      const mainProtein = recipe.tags.find(t =>
        ['pollo', 'res', 'cerdo', 'pescado', 'huevo', 'legumbres', 'atún', 'camarones'].includes(t.toLowerCase())
      )
      if (mainProtein) usedProteinsForWeek.add(mainProtein.toLowerCase())

      const { portions, nutrition } = adjustPortions(recipe, targetCalories)

      items.push({
        date: dateStr,
        mealType,
        recipe,
        portions,
        adjustedNutrition: nutrition,
      })
    }
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
    selectedMealTypes,
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

export function generateMonthlyMenu(
  profile: ChildProfile,
  monthStartDate: string,
  selectedMealTypes: MealType[] = ['lunch']
): WeeklyMenu {
  const requirements = calculateNutritionalRequirements(profile)

  let allRecipes = getAllRecipes()
  allRecipes = filterRecipesByAllergies(allRecipes, profile.allergies)
  allRecipes = filterRecipesByMicrowaveRating(allRecipes, 3)
  allRecipes = shuffleArray(allRecipes)

  const items: MenuItem[] = []
  const usedRecipeIdsForMonth = new Set<string>()
  const startDate = new Date(monthStartDate)

  // Find first Monday
  const dayOfWeek = startDate.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek)
  const firstMonday = new Date(startDate)
  firstMonday.setDate(startDate.getDate() + daysUntilMonday)

  // Generate 4 weeks (20 school days)
  for (let week = 0; week < 4; week++) {
    const usedCuisinesForWeek = new Set<string>()
    const usedProteinsForWeek = new Set<string>()

    for (let day = 0; day < 5; day++) {
      const date = new Date(firstMonday)
      date.setDate(firstMonday.getDate() + (week * 7) + day)
      const dateStr = date.toISOString().split('T')[0]

      for (const mealType of selectedMealTypes) {
        const targetCalories = getTargetCaloriesForMeal(requirements.dailyCalories, mealType)
        const recipesForMeal = getRecipesForMealType(allRecipes, mealType)

        if (recipesForMeal.length === 0) {
          continue
        }

        const recipe = selectBestRecipe(
          recipesForMeal,
          targetCalories,
          profile.preferences,
          usedRecipeIdsForMonth,
          usedCuisinesForWeek,
          usedProteinsForWeek
        )
        usedRecipeIdsForMonth.add(recipe.id)
        usedCuisinesForWeek.add(recipe.cuisine)

        const mainProtein = recipe.tags.find(t =>
          ['pollo', 'res', 'cerdo', 'pescado', 'huevo', 'legumbres', 'atún', 'camarones'].includes(t.toLowerCase())
        )
        if (mainProtein) usedProteinsForWeek.add(mainProtein.toLowerCase())

        const { portions, nutrition } = adjustPortions(recipe, targetCalories)

        items.push({
          date: dateStr,
          mealType,
          recipe,
          portions,
          adjustedNutrition: nutrition,
        })
      }
    }
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
    weekStartDate: monthStartDate,
    selectedMealTypes,
    items,
    totalNutrition,
    createdAt: new Date().toISOString(),
  }
}

export function replaceMealInMenu(
  menu: WeeklyMenu,
  dateToReplace: string,
  profile: ChildProfile,
  mealTypeToReplace?: MealType
): WeeklyMenu {
  const requirements = calculateNutritionalRequirements(profile)

  let recipes = getAllRecipes()
  recipes = filterRecipesByAllergies(recipes, profile.allergies)
  recipes = filterRecipesByMicrowaveRating(recipes, 3)
  recipes = shuffleArray(recipes)

  const usedRecipeIds = new Set(menu.items.map(item => item.recipe.id))

  // Find the item to replace
  const itemIndex = menu.items.findIndex(item =>
    item.date === dateToReplace &&
    (mealTypeToReplace === undefined || item.mealType === mealTypeToReplace)
  )

  if (itemIndex === -1) {
    return menu
  }

  const itemToReplace = menu.items[itemIndex]
  const mealType = itemToReplace.mealType
  const targetCalories = getTargetCaloriesForMeal(requirements.dailyCalories, mealType)

  // Remove current recipe from exclusions so we can pick a different one
  usedRecipeIds.delete(itemToReplace.recipe.id)

  // Get recipes suitable for this meal type
  const recipesForMeal = getRecipesForMealType(recipes, mealType)

  if (recipesForMeal.length === 0) {
    return menu
  }

  const recipe = selectBestRecipe(
    recipesForMeal,
    targetCalories,
    profile.preferences,
    usedRecipeIds
  )

  const { portions, nutrition } = adjustPortions(recipe, targetCalories)

  const newItems = [...menu.items]
  newItems[itemIndex] = {
    date: dateToReplace,
    mealType,
    recipe,
    portions,
    adjustedNutrition: nutrition,
  }

  const totalNutrition = newItems.reduce(
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
    ...menu,
    items: newItems,
    totalNutrition,
  }
}
