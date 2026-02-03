import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  exportAllData,
  importAllData,
  validateImportData,
  ExportData,
} from './exportImport'
import type { ChildProfile, WeeklyMenu } from '@/types'

const mockProfiles: ChildProfile[] = [
  {
    id: 'profile-1',
    name: 'Maria',
    birthDate: '2017-05-15',
    sex: 'female',
    weightKg: 22,
    heightCm: 115,
    activityLevel: 'moderate',
    allergies: ['maní'],
    preferences: { likes: ['pollo'], dislikes: ['brócoli'] },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'profile-2',
    name: 'Juan',
    birthDate: '2019-03-10',
    sex: 'male',
    weightKg: 18,
    heightCm: 105,
    activityLevel: 'heavy',
    allergies: [],
    preferences: { likes: [], dislikes: [] },
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
]

describe('Export/Import', () => {
  describe('exportAllData', () => {
    it('should create export with version and timestamp', async () => {
      const exportData = await exportAllData(mockProfiles, [])

      expect(exportData.version).toBe('1.0')
      expect(exportData.exportedAt).toBeDefined()
      expect(new Date(exportData.exportedAt).getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should include all profiles', async () => {
      const exportData = await exportAllData(mockProfiles, [])

      expect(exportData.profiles).toHaveLength(2)
      expect(exportData.profiles[0].name).toBe('Maria')
      expect(exportData.profiles[1].name).toBe('Juan')
    })

    it('should produce valid JSON', async () => {
      const exportData = await exportAllData(mockProfiles, [])
      const jsonString = JSON.stringify(exportData)
      const parsed = JSON.parse(jsonString)

      expect(parsed.version).toBe('1.0')
      expect(parsed.profiles).toHaveLength(2)
    })
  })

  describe('validateImportData', () => {
    it('should accept valid export data', () => {
      const validData: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        profiles: mockProfiles,
        menus: [],
      }

      expect(validateImportData(validData)).toBe(true)
    })

    it('should reject data without version', () => {
      const invalidData = {
        exportedAt: new Date().toISOString(),
        profiles: [],
        menus: [],
      }

      expect(validateImportData(invalidData as any)).toBe(false)
    })

    it('should reject data without profiles array', () => {
      const invalidData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        menus: [],
      }

      expect(validateImportData(invalidData as any)).toBe(false)
    })

    it('should reject profiles with missing required fields', () => {
      const invalidData: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        profiles: [
          {
            id: 'profile-1',
            name: 'Test',
            // missing other required fields
          } as any,
        ],
        menus: [],
      }

      expect(validateImportData(invalidData)).toBe(false)
    })

    it('should reject non-object data', () => {
      expect(validateImportData('not an object' as any)).toBe(false)
      expect(validateImportData(null as any)).toBe(false)
      expect(validateImportData(undefined as any)).toBe(false)
    })
  })

  describe('importAllData', () => {
    it('should import profiles successfully', async () => {
      const exportData: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        profiles: mockProfiles,
        menus: [],
      }

      const result = await importAllData(exportData)

      expect(result.success).toBe(true)
      expect(result.profilesImported).toBe(2)
      expect(result.menusImported).toBe(0)
    })

    it('should fail with invalid data', async () => {
      const invalidData = {
        profiles: 'not an array',
      }

      const result = await importAllData(invalidData as any)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('round-trip export/import', () => {
    it('should preserve data through export/import cycle', async () => {
      const exportData = await exportAllData(mockProfiles, [])
      const jsonString = JSON.stringify(exportData)
      const reimported = JSON.parse(jsonString) as ExportData

      expect(validateImportData(reimported)).toBe(true)
      expect(reimported.profiles).toHaveLength(mockProfiles.length)
      expect(reimported.profiles[0].allergies).toEqual(mockProfiles[0].allergies)
    })
  })
})
