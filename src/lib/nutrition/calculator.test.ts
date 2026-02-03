import { describe, it, expect } from 'vitest'
import {
  calculateAge,
  calculateDailyCalories,
  calculateLunchCalories,
  calculateMacros,
  calculateNutritionalRequirements,
} from './calculator'
import type { ChildProfile, ActivityLevel, Sex } from '@/types'

describe('Nutritional Calculator', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly for a 6-year-old', () => {
      const birthDate = new Date()
      birthDate.setFullYear(birthDate.getFullYear() - 6)
      expect(calculateAge(birthDate.toISOString().split('T')[0])).toBe(6)
    })

    it('should calculate age correctly when birthday has not occurred this year', () => {
      const today = new Date()
      const birthDate = new Date(today.getFullYear() - 8, today.getMonth() + 1, 15)
      expect(calculateAge(birthDate.toISOString().split('T')[0])).toBe(7)
    })

    it('should calculate age correctly when birthday has occurred this year', () => {
      const today = new Date()
      const birthDate = new Date(today.getFullYear() - 8, today.getMonth() - 1, 15)
      expect(calculateAge(birthDate.toISOString().split('T')[0])).toBe(8)
    })
  })

  describe('calculateDailyCalories', () => {
    // Based on FAO/WHO data from knowledge.md
    // Note: Age brackets are [min, max), so age 4 falls in 4-5 bracket, age 5 falls in 5-6 bracket
    it('should calculate ~1360 kcal for a 4 year old boy with moderate activity at reference weight', () => {
      const result = calculateDailyCalories(4, 'male', 17.7, 'moderate')
      expect(result).toBeCloseTo(1360, -1) // Within 10 kcal
    })

    it('should calculate ~1241 kcal for a 4 year old girl with moderate activity at reference weight', () => {
      const result = calculateDailyCalories(4, 'female', 16.8, 'moderate')
      expect(result).toBeCloseTo(1241, -1)
    })

    it('should calculate ~1830 kcal for an 8-9 year old boy with moderate activity', () => {
      const result = calculateDailyCalories(8, 'male', 26.7, 'moderate')
      expect(result).toBeCloseTo(1830, -1)
    })

    it('should calculate ~1698 kcal for an 8-9 year old girl with moderate activity', () => {
      const result = calculateDailyCalories(8, 'female', 26.6, 'moderate')
      expect(result).toBeCloseTo(1698, -1)
    })

    it('should calculate ~2150 kcal for a 10-11 year old boy with moderate activity', () => {
      const result = calculateDailyCalories(10, 'male', 33.3, 'moderate')
      expect(result).toBeCloseTo(2150, -1)
    })

    it('should reduce calories by 15% for light activity', () => {
      const moderate = calculateDailyCalories(8, 'male', 26.7, 'moderate')
      const light = calculateDailyCalories(8, 'male', 26.7, 'light')
      expect(light).toBeCloseTo(moderate * 0.85, -1)
    })

    it('should increase calories by 15% for heavy activity', () => {
      const moderate = calculateDailyCalories(8, 'male', 26.7, 'moderate')
      const heavy = calculateDailyCalories(8, 'male', 26.7, 'heavy')
      expect(heavy).toBeCloseTo(moderate * 1.15, -1)
    })

    it('should adjust calories based on actual weight vs reference weight', () => {
      // A lighter 4-year-old boy (15kg vs 17.7kg reference) should need fewer calories
      const result = calculateDailyCalories(4, 'male', 15, 'moderate')
      const expectedRatio = 15 / 17.7
      expect(result).toBeCloseTo(1360 * expectedRatio, -1)
    })
  })

  describe('calculateLunchCalories', () => {
    it('should calculate lunch as 33% of daily calories', () => {
      const dailyCalories = 1500
      const lunchCalories = calculateLunchCalories(dailyCalories)
      expect(lunchCalories).toBeCloseTo(495, 0) // 33% of 1500
    })

    it('should round to nearest integer', () => {
      const lunchCalories = calculateLunchCalories(1000)
      expect(Number.isInteger(lunchCalories)).toBe(true)
    })
  })

  describe('calculateMacros', () => {
    it('should calculate macros with default percentages (protein 17.5%, carbs 52.5%, fat 30%)', () => {
      const calories = 500 // lunch calories
      const macros = calculateMacros(calories)
      
      // Protein: 17.5% of 500 = 87.5 kcal / 4 = 21.9g
      expect(macros.proteinGrams).toBeCloseTo(21.9, 0)
      
      // Carbs: 52.5% of 500 = 262.5 kcal / 4 = 65.6g
      expect(macros.carbsGrams).toBeCloseTo(65.6, 0)
      
      // Fat: 30% of 500 = 150 kcal / 9 = 16.7g
      expect(macros.fatGrams).toBeCloseTo(16.7, 0)
    })

    it('should return percentages used', () => {
      const { percentages } = calculateMacros(500)
      expect(percentages.protein).toBe(17.5)
      expect(percentages.carbs).toBe(52.5)
      expect(percentages.fat).toBe(30)
    })

    it('should allow custom percentages', () => {
      const calories = 600
      const customPercentages = { protein: 20, carbs: 50, fat: 30 }
      const macros = calculateMacros(calories, customPercentages)
      
      // Protein: 20% of 600 = 120 kcal / 4 = 30g
      expect(macros.proteinGrams).toBeCloseTo(30, 0)
      
      // Carbs: 50% of 600 = 300 kcal / 4 = 75g
      expect(macros.carbsGrams).toBeCloseTo(75, 0)
      
      // Fat: 30% of 600 = 180 kcal / 9 = 20g
      expect(macros.fatGrams).toBeCloseTo(20, 0)
    })
  })

  describe('calculateNutritionalRequirements', () => {
    it('should return complete nutritional requirements for a child profile', () => {
      const profile: ChildProfile = {
        id: '1',
        name: 'Test Child',
        birthDate: getDateYearsAgo(8),
        sex: 'male',
        weightKg: 26.7,
        heightCm: 128,
        activityLevel: 'moderate',
        allergies: [],
        preferences: { likes: [], dislikes: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const requirements = calculateNutritionalRequirements(profile)

      expect(requirements.dailyCalories).toBeCloseTo(1830, -1)
      expect(requirements.lunchCalories).toBeCloseTo(604, -1)
      expect(requirements.macros.proteinGrams).toBeGreaterThan(0)
      expect(requirements.macros.carbsGrams).toBeGreaterThan(0)
      expect(requirements.macros.fatGrams).toBeGreaterThan(0)
      expect(requirements.macroPercentages.protein + 
             requirements.macroPercentages.carbs + 
             requirements.macroPercentages.fat).toBe(100)
    })

    it('should handle edge case of minimum age (4 years)', () => {
      const profile: ChildProfile = {
        id: '2',
        name: 'Young Child',
        birthDate: getDateYearsAgo(4),
        sex: 'female',
        weightKg: 16,
        heightCm: 100,
        activityLevel: 'moderate',
        allergies: [],
        preferences: { likes: [], dislikes: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const requirements = calculateNutritionalRequirements(profile)
      expect(requirements.dailyCalories).toBeGreaterThan(1000)
      expect(requirements.dailyCalories).toBeLessThan(1500)
    })

    it('should handle edge case of maximum age (12 years)', () => {
      const profile: ChildProfile = {
        id: '3',
        name: 'Older Child',
        birthDate: getDateYearsAgo(12),
        sex: 'male',
        weightKg: 42,
        heightCm: 150,
        activityLevel: 'heavy',
        allergies: [],
        preferences: { likes: [], dislikes: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const requirements = calculateNutritionalRequirements(profile)
      expect(requirements.dailyCalories).toBeGreaterThan(2500)
      expect(requirements.dailyCalories).toBeLessThan(3200)
    })
  })
})

// Helper function
function getDateYearsAgo(years: number): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  return date.toISOString().split('T')[0]
}
