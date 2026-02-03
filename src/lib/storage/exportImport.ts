import type { ChildProfile, WeeklyMenu } from '@/types'

export interface ExportData {
  version: string
  exportedAt: string
  profiles: ChildProfile[]
  menus: WeeklyMenu[]
}

export interface ImportResult {
  success: boolean
  profilesImported: number
  menusImported: number
  error?: string
}

const EXPORT_VERSION = '1.0'

function isValidProfile(profile: any): profile is ChildProfile {
  return (
    typeof profile === 'object' &&
    profile !== null &&
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    typeof profile.birthDate === 'string' &&
    (profile.sex === 'male' || profile.sex === 'female') &&
    typeof profile.weightKg === 'number' &&
    typeof profile.heightCm === 'number' &&
    (profile.activityLevel === 'light' || profile.activityLevel === 'moderate' || profile.activityLevel === 'heavy') &&
    Array.isArray(profile.allergies) &&
    typeof profile.preferences === 'object' &&
    Array.isArray(profile.preferences?.likes) &&
    Array.isArray(profile.preferences?.dislikes) &&
    typeof profile.createdAt === 'string' &&
    typeof profile.updatedAt === 'string'
  )
}

function isValidMenu(menu: any): menu is WeeklyMenu {
  return (
    typeof menu === 'object' &&
    menu !== null &&
    typeof menu.id === 'string' &&
    typeof menu.childId === 'string' &&
    typeof menu.weekStartDate === 'string' &&
    Array.isArray(menu.items) &&
    typeof menu.totalNutrition === 'object' &&
    typeof menu.createdAt === 'string'
  )
}

export function validateImportData(data: any): data is ExportData {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  if (typeof data.version !== 'string') {
    return false
  }

  if (!Array.isArray(data.profiles)) {
    return false
  }

  if (!Array.isArray(data.menus)) {
    return false
  }

  for (const profile of data.profiles) {
    if (!isValidProfile(profile)) {
      return false
    }
  }

  for (const menu of data.menus) {
    if (!isValidMenu(menu)) {
      return false
    }
  }

  return true
}

export async function exportAllData(
  profiles: ChildProfile[],
  menus: WeeklyMenu[]
): Promise<ExportData> {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    profiles,
    menus,
  }
}

export async function importAllData(data: ExportData): Promise<ImportResult> {
  if (!validateImportData(data)) {
    return {
      success: false,
      profilesImported: 0,
      menusImported: 0,
      error: 'Invalid data format',
    }
  }

  // In a real implementation, this would save to IndexedDB
  // For now, we just validate and return success
  return {
    success: true,
    profilesImported: data.profiles.length,
    menusImported: data.menus.length,
  }
}

export function downloadAsJson(data: ExportData, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function readJsonFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const data = JSON.parse(text)

        if (!validateImportData(data)) {
          reject(new Error('Invalid data format'))
          return
        }

        resolve(data)
      } catch (error) {
        reject(new Error('Failed to parse JSON file'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
