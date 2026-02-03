import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createProfile,
  getProfile,
  getAllProfiles,
  updateProfile,
  deleteProfile,
  validateProfile,
  ProfileValidationError,
} from './profiles'
import type { ChildProfile } from '@/types'

// Mock IndexedDB with in-memory storage for testing
const mockStorage = new Map<string, ChildProfile>()

vi.mock('idb', () => ({
  openDB: vi.fn(() => Promise.resolve({
    get: vi.fn((store: string, id: string) => Promise.resolve(mockStorage.get(id))),
    getAll: vi.fn(() => Promise.resolve(Array.from(mockStorage.values()))),
    put: vi.fn((store: string, value: ChildProfile) => {
      mockStorage.set(value.id, value)
      return Promise.resolve(value.id)
    }),
    delete: vi.fn((store: string, id: string) => {
      mockStorage.delete(id)
      return Promise.resolve()
    }),
  })),
}))

describe('Profile Storage', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  describe('validateProfile', () => {
    const validProfileData = {
      name: 'Maria',
      birthDate: '2018-05-15',
      sex: 'female' as const,
      weightKg: 22,
      heightCm: 115,
      activityLevel: 'moderate' as const,
      allergies: ['maní'],
      preferences: { likes: ['pollo'], dislikes: ['brócoli'] },
    }

    it('should accept valid profile data', () => {
      expect(() => validateProfile(validProfileData)).not.toThrow()
    })

    it('should reject empty name', () => {
      expect(() => validateProfile({ ...validProfileData, name: '' }))
        .toThrow(ProfileValidationError)
    })

    it('should reject name longer than 50 characters', () => {
      expect(() => validateProfile({ ...validProfileData, name: 'A'.repeat(51) }))
        .toThrow(ProfileValidationError)
    })

    it('should reject invalid birth date format', () => {
      expect(() => validateProfile({ ...validProfileData, birthDate: '15/05/2018' }))
        .toThrow(ProfileValidationError)
    })

    it('should reject birth date in the future', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      expect(() => validateProfile({ 
        ...validProfileData, 
        birthDate: futureDate.toISOString().split('T')[0] 
      })).toThrow(ProfileValidationError)
    })

    it('should reject age less than 4 years', () => {
      const recentDate = new Date()
      recentDate.setFullYear(recentDate.getFullYear() - 2)
      expect(() => validateProfile({ 
        ...validProfileData, 
        birthDate: recentDate.toISOString().split('T')[0] 
      })).toThrow(ProfileValidationError)
    })

    it('should reject age greater than 12 years', () => {
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 15)
      expect(() => validateProfile({ 
        ...validProfileData, 
        birthDate: oldDate.toISOString().split('T')[0] 
      })).toThrow(ProfileValidationError)
    })

    it('should reject weight less than 10kg', () => {
      expect(() => validateProfile({ ...validProfileData, weightKg: 8 }))
        .toThrow(ProfileValidationError)
    })

    it('should reject weight greater than 80kg', () => {
      expect(() => validateProfile({ ...validProfileData, weightKg: 85 }))
        .toThrow(ProfileValidationError)
    })

    it('should reject height less than 80cm', () => {
      expect(() => validateProfile({ ...validProfileData, heightCm: 70 }))
        .toThrow(ProfileValidationError)
    })

    it('should reject height greater than 180cm', () => {
      expect(() => validateProfile({ ...validProfileData, heightCm: 190 }))
        .toThrow(ProfileValidationError)
    })

    it('should reject invalid sex value', () => {
      expect(() => validateProfile({ ...validProfileData, sex: 'other' as any }))
        .toThrow(ProfileValidationError)
    })

    it('should reject invalid activity level', () => {
      expect(() => validateProfile({ ...validProfileData, activityLevel: 'extreme' as any }))
        .toThrow(ProfileValidationError)
    })
  })

  describe('createProfile', () => {
    it('should create a profile with auto-generated id and timestamps', async () => {
      const profileData = {
        name: 'Juan',
        birthDate: '2017-03-10',
        sex: 'male' as const,
        weightKg: 25,
        heightCm: 120,
        activityLevel: 'moderate' as const,
        allergies: [],
        preferences: { likes: [], dislikes: [] },
      }

      const profile = await createProfile(profileData)

      expect(profile.id).toBeDefined()
      expect(profile.id.length).toBeGreaterThan(0)
      expect(profile.name).toBe('Juan')
      expect(profile.createdAt).toBeDefined()
      expect(profile.updatedAt).toBeDefined()
      expect(new Date(profile.createdAt).getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should throw validation error for invalid data', async () => {
      const invalidData = {
        name: '',
        birthDate: '2017-03-10',
        sex: 'male' as const,
        weightKg: 25,
        heightCm: 120,
        activityLevel: 'moderate' as const,
        allergies: [],
        preferences: { likes: [], dislikes: [] },
      }

      await expect(createProfile(invalidData)).rejects.toThrow(ProfileValidationError)
    })
  })

  describe('getProfile', () => {
    it('should retrieve an existing profile by id', async () => {
      const created = await createProfile({
        name: 'Sofia',
        birthDate: '2016-08-20',
        sex: 'female' as const,
        weightKg: 28,
        heightCm: 125,
        activityLevel: 'heavy' as const,
        allergies: ['gluten'],
        preferences: { likes: ['frutas'], dislikes: [] },
      })

      const retrieved = await getProfile(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Sofia')
      expect(retrieved?.allergies).toContain('gluten')
    })

    it('should return undefined for non-existent profile', async () => {
      const result = await getProfile('non-existent-id')
      expect(result).toBeUndefined()
    })
  })

  describe('getAllProfiles', () => {
    it('should return empty array when no profiles exist', async () => {
      const profiles = await getAllProfiles()
      expect(profiles).toEqual([])
    })

    it('should return all created profiles', async () => {
      await createProfile({
        name: 'Child 1',
        birthDate: '2017-01-01',
        sex: 'male' as const,
        weightKg: 22,
        heightCm: 115,
        activityLevel: 'moderate' as const,
        allergies: [],
        preferences: { likes: [], dislikes: [] },
      })

      await createProfile({
        name: 'Child 2',
        birthDate: '2019-06-15',
        sex: 'female' as const,
        weightKg: 18,
        heightCm: 105,
        activityLevel: 'light' as const,
        allergies: [],
        preferences: { likes: [], dislikes: [] },
      })

      const profiles = await getAllProfiles()

      expect(profiles).toHaveLength(2)
      expect(profiles.map(p => p.name)).toContain('Child 1')
      expect(profiles.map(p => p.name)).toContain('Child 2')
    })
  })

  describe('updateProfile', () => {
    it('should update profile fields and updatedAt timestamp', async () => {
      const created = await createProfile({
        name: 'Pedro',
        birthDate: '2018-02-14',
        sex: 'male' as const,
        weightKg: 20,
        heightCm: 110,
        activityLevel: 'moderate' as const,
        allergies: [],
        preferences: { likes: [], dislikes: [] },
      })

      const originalUpdatedAt = created.updatedAt

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      const updated = await updateProfile(created.id, { weightKg: 22 })

      expect(updated.weightKg).toBe(22)
      expect(updated.name).toBe('Pedro') // unchanged
      expect(new Date(updated.updatedAt).getTime())
        .toBeGreaterThan(new Date(originalUpdatedAt).getTime())
    })

    it('should validate updated data', async () => {
      const created = await createProfile({
        name: 'Ana',
        birthDate: '2017-11-30',
        sex: 'female' as const,
        weightKg: 23,
        heightCm: 118,
        activityLevel: 'moderate' as const,
        allergies: [],
        preferences: { likes: [], dislikes: [] },
      })

      await expect(updateProfile(created.id, { weightKg: 5 }))
        .rejects.toThrow(ProfileValidationError)
    })

    it('should throw error for non-existent profile', async () => {
      await expect(updateProfile('fake-id', { name: 'New Name' }))
        .rejects.toThrow('Profile not found')
    })
  })

  describe('deleteProfile', () => {
    it('should delete an existing profile', async () => {
      const created = await createProfile({
        name: 'To Delete',
        birthDate: '2018-04-01',
        sex: 'male' as const,
        weightKg: 21,
        heightCm: 112,
        activityLevel: 'moderate' as const,
        allergies: [],
        preferences: { likes: [], dislikes: [] },
      })

      await deleteProfile(created.id)

      const result = await getProfile(created.id)
      expect(result).toBeUndefined()
    })

    it('should not throw for non-existent profile', async () => {
      await expect(deleteProfile('non-existent')).resolves.not.toThrow()
    })
  })
})
