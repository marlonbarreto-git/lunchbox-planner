import type { ChildProfile, Sex, ActivityLevel, NutritionalRequirements } from '@/types'

// FAO/WHO reference data for daily energy requirements (kcal/day)
// Source: https://www.fao.org/4/y5686e/y5686e06.htm
const ENERGY_REQUIREMENTS = {
  male: {
    moderate: [
      { ageMin: 4, ageMax: 5, kcal: 1360, refWeight: 17.7 },
      { ageMin: 5, ageMax: 6, kcal: 1467, refWeight: 19.7 },
      { ageMin: 6, ageMax: 7, kcal: 1573, refWeight: 21.7 },
      { ageMin: 7, ageMax: 8, kcal: 1692, refWeight: 24.0 },
      { ageMin: 8, ageMax: 9, kcal: 1830, refWeight: 26.7 },
      { ageMin: 9, ageMax: 10, kcal: 1978, refWeight: 29.7 },
      { ageMin: 10, ageMax: 11, kcal: 2150, refWeight: 33.3 },
      { ageMin: 11, ageMax: 12, kcal: 2341, refWeight: 37.5 },
      { ageMin: 12, ageMax: 13, kcal: 2548, refWeight: 42.3 },
    ],
  },
  female: {
    moderate: [
      { ageMin: 4, ageMax: 5, kcal: 1241, refWeight: 16.8 },
      { ageMin: 5, ageMax: 6, kcal: 1330, refWeight: 18.6 },
      { ageMin: 6, ageMax: 7, kcal: 1428, refWeight: 20.6 },
      { ageMin: 7, ageMax: 8, kcal: 1554, refWeight: 23.3 },
      { ageMin: 8, ageMax: 9, kcal: 1698, refWeight: 26.6 },
      { ageMin: 9, ageMax: 10, kcal: 1854, refWeight: 30.5 },
      { ageMin: 10, ageMax: 11, kcal: 2006, refWeight: 34.7 },
      { ageMin: 11, ageMax: 12, kcal: 2149, refWeight: 39.2 },
      { ageMin: 12, ageMax: 13, kcal: 2276, refWeight: 43.8 },
    ],
  },
}

// Activity level multipliers (±15% from moderate)
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  light: 0.85,
  moderate: 1.0,
  heavy: 1.15,
}

// Weight-based formulas (kcal/kg/day) for fallback
const WEIGHT_BASED_KCAL: Array<{ ageMin: number; ageMax: number; kcalPerKg: number }> = [
  { ageMin: 4, ageMax: 6, kcalPerKg: 70 },
  { ageMin: 6, ageMax: 9, kcalPerKg: 62.5 }, // Average of 60-65
  { ageMin: 9, ageMax: 13, kcalPerKg: 40 }, // Average of 35-45
]

// Lunch as percentage of daily calories (USDA standard)
const LUNCH_PERCENTAGE = 0.33

// Default macronutrient distribution
const DEFAULT_MACROS = {
  protein: 17.5, // 15-20% average
  carbs: 52.5, // 50-55% average
  fat: 30, // 25-35% average
}

// Calories per gram
const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function calculateDailyCalories(
  age: number,
  sex: Sex,
  weightKg: number,
  activityLevel: ActivityLevel
): number {
  const requirements = ENERGY_REQUIREMENTS[sex].moderate
  const ageGroup = requirements.find(r => age >= r.ageMin && age < r.ageMax)
  
  let baseCalories: number
  
  if (ageGroup) {
    // Adjust for actual weight vs reference weight
    const weightRatio = weightKg / ageGroup.refWeight
    baseCalories = ageGroup.kcal * weightRatio
  } else {
    // Fallback to weight-based formula
    const weightFormula = WEIGHT_BASED_KCAL.find(f => age >= f.ageMin && age < f.ageMax)
    const kcalPerKg = weightFormula?.kcalPerKg ?? 50 // Conservative fallback
    baseCalories = weightKg * kcalPerKg
  }
  
  // Apply activity level multiplier
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]
  return Math.round(baseCalories * multiplier)
}

export function calculateLunchCalories(dailyCalories: number): number {
  return Math.round(dailyCalories * LUNCH_PERCENTAGE)
}

interface MacroResult {
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  percentages: {
    protein: number
    carbs: number
    fat: number
  }
}

export function calculateMacros(
  calories: number,
  percentages?: { protein: number; carbs: number; fat: number }
): MacroResult {
  const macroPercentages = percentages ?? DEFAULT_MACROS
  
  const proteinCalories = calories * (macroPercentages.protein / 100)
  const carbsCalories = calories * (macroPercentages.carbs / 100)
  const fatCalories = calories * (macroPercentages.fat / 100)
  
  return {
    proteinGrams: Math.round(proteinCalories / KCAL_PER_GRAM.protein * 10) / 10,
    carbsGrams: Math.round(carbsCalories / KCAL_PER_GRAM.carbs * 10) / 10,
    fatGrams: Math.round(fatCalories / KCAL_PER_GRAM.fat * 10) / 10,
    percentages: macroPercentages,
  }
}

export function calculateNutritionalRequirements(profile: ChildProfile): NutritionalRequirements {
  const age = calculateAge(profile.birthDate)
  const dailyCalories = calculateDailyCalories(age, profile.sex, profile.weightKg, profile.activityLevel)
  const lunchCalories = calculateLunchCalories(dailyCalories)
  const macros = calculateMacros(lunchCalories)
  
  return {
    dailyCalories,
    lunchCalories,
    macros: {
      proteinGrams: macros.proteinGrams,
      carbsGrams: macros.carbsGrams,
      fatGrams: macros.fatGrams,
    },
    macroPercentages: macros.percentages,
  }
}
