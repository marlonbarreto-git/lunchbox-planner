export type Sex = 'male' | 'female'

export type ActivityLevel = 'light' | 'moderate' | 'heavy'

export type MealType = 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner'

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  morningSnack: 'Medias nueves',
  lunch: 'Almuerzo',
  afternoonSnack: 'Onces',
  dinner: 'Cena',
}

export const MEAL_CALORIE_PERCENTAGES: Record<MealType, number> = {
  breakfast: 0.25,
  morningSnack: 0.10,
  lunch: 0.35,
  afternoonSnack: 0.10,
  dinner: 0.20,
}

export interface ChildProfile {
  id: string
  name: string
  birthDate: string
  sex: Sex
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  allergies: string[]
  preferences: {
    likes: string[]
    dislikes: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface NutritionalRequirements {
  dailyCalories: number
  lunchCalories: number
  macros: {
    proteinGrams: number
    carbsGrams: number
    fatGrams: number
  }
  macroPercentages: {
    protein: number
    carbs: number
    fat: number
  }
}

export interface RecipeNutrition {
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  fiberGrams: number
  sodiumMg: number
}

export interface Recipe {
  id: string
  name: string
  description: string
  category: 'main' | 'side' | 'soup' | 'dessert' | 'snack' | 'breakfast' | 'beverage'
  mealTypes: MealType[]
  cuisine: 'colombian' | 'latin' | 'international'
  microwaveRating: 1 | 2 | 3 | 4 | 5
  transportHours: number
  childAcceptance: 'high' | 'medium' | 'low'
  prepTimeMinutes: number
  cookTimeMinutes: number
  servings: number
  ingredients: RecipeIngredient[]
  instructions: string[]
  nutrition: RecipeNutrition
  allergens: string[]
  tags: string[]
  substitutions?: Record<string, string>
}

export interface RecipeIngredient {
  name: string
  amount: number
  unit: string
  category: 'protein' | 'carb' | 'vegetable' | 'fruit' | 'dairy' | 'fat' | 'seasoning' | 'other'
}

export interface MenuItem {
  date: string
  mealType: MealType
  recipe: Recipe
  portions: number
  adjustedNutrition: RecipeNutrition
}

export interface WeeklyMenu {
  id: string
  childId: string
  weekStartDate: string
  selectedMealTypes: MealType[]
  items: MenuItem[]
  totalNutrition: RecipeNutrition
  createdAt: string
}

export interface ShoppingListItem {
  ingredient: string
  totalAmount: number
  unit: string
  category: string
  recipes: string[]
}

export interface ShoppingList {
  id: string
  menuId: string
  items: ShoppingListItem[]
  createdAt: string
}
