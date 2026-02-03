import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { ChildProfile, Sex, ActivityLevel } from '@/types'
import { calculateAge } from '@/lib/nutrition/calculator'

const DB_NAME = 'lunchbox-planner'
const DB_VERSION = 1
const PROFILES_STORE = 'profiles'

interface LunchBoxDB extends DBSchema {
  profiles: {
    key: string
    value: ChildProfile
    indexes: { 'by-name': string }
  }
}

let dbPromise: Promise<IDBPDatabase<LunchBoxDB>> | null = null

async function getDB(): Promise<IDBPDatabase<LunchBoxDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LunchBoxDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(PROFILES_STORE, { keyPath: 'id' })
        store.createIndex('by-name', 'name')
      },
    })
  }
  return dbPromise
}

export class ProfileValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProfileValidationError'
  }
}

interface ProfileInput {
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
}

const VALID_SEX_VALUES: Sex[] = ['male', 'female']
const VALID_ACTIVITY_LEVELS: ActivityLevel[] = ['light', 'moderate', 'heavy']

export function validateProfile(data: ProfileInput): void {
  if (!data.name || data.name.trim().length === 0) {
    throw new ProfileValidationError('Name is required')
  }
  if (data.name.length > 50) {
    throw new ProfileValidationError('Name must be 50 characters or less')
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(data.birthDate)) {
    throw new ProfileValidationError('Birth date must be in YYYY-MM-DD format')
  }

  const birthDate = new Date(data.birthDate)
  if (isNaN(birthDate.getTime())) {
    throw new ProfileValidationError('Invalid birth date')
  }

  if (birthDate > new Date()) {
    throw new ProfileValidationError('Birth date cannot be in the future')
  }

  const age = calculateAge(data.birthDate)
  if (age < 4) {
    throw new ProfileValidationError('Child must be at least 4 years old')
  }
  if (age > 12) {
    throw new ProfileValidationError('Child must be 12 years old or younger')
  }

  if (!VALID_SEX_VALUES.includes(data.sex)) {
    throw new ProfileValidationError('Sex must be "male" or "female"')
  }

  if (!VALID_ACTIVITY_LEVELS.includes(data.activityLevel)) {
    throw new ProfileValidationError('Activity level must be "light", "moderate", or "heavy"')
  }

  if (data.weightKg < 10) {
    throw new ProfileValidationError('Weight must be at least 10kg')
  }
  if (data.weightKg > 80) {
    throw new ProfileValidationError('Weight must be 80kg or less')
  }

  if (data.heightCm < 80) {
    throw new ProfileValidationError('Height must be at least 80cm')
  }
  if (data.heightCm > 180) {
    throw new ProfileValidationError('Height must be 180cm or less')
  }
}

function generateId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `profile_${timestamp}_${random}`
}

export async function createProfile(data: ProfileInput): Promise<ChildProfile> {
  validateProfile(data)

  const now = new Date().toISOString()
  const profile: ChildProfile = {
    id: generateId(),
    name: data.name.trim(),
    birthDate: data.birthDate,
    sex: data.sex,
    weightKg: data.weightKg,
    heightCm: data.heightCm,
    activityLevel: data.activityLevel,
    allergies: data.allergies,
    preferences: data.preferences,
    createdAt: now,
    updatedAt: now,
  }

  const db = await getDB()
  await db.put(PROFILES_STORE, profile)

  return profile
}

export async function getProfile(id: string): Promise<ChildProfile | undefined> {
  const db = await getDB()
  return db.get(PROFILES_STORE, id)
}

export async function getAllProfiles(): Promise<ChildProfile[]> {
  const db = await getDB()
  return db.getAll(PROFILES_STORE)
}

export async function updateProfile(
  id: string,
  updates: Partial<ProfileInput>
): Promise<ChildProfile> {
  const db = await getDB()
  const existing = await db.get(PROFILES_STORE, id)

  if (!existing) {
    throw new Error('Profile not found')
  }

  const updated: ProfileInput = {
    name: updates.name ?? existing.name,
    birthDate: updates.birthDate ?? existing.birthDate,
    sex: updates.sex ?? existing.sex,
    weightKg: updates.weightKg ?? existing.weightKg,
    heightCm: updates.heightCm ?? existing.heightCm,
    activityLevel: updates.activityLevel ?? existing.activityLevel,
    allergies: updates.allergies ?? existing.allergies,
    preferences: updates.preferences ?? existing.preferences,
  }

  validateProfile(updated)

  const profile: ChildProfile = {
    ...existing,
    ...updated,
    updatedAt: new Date().toISOString(),
  }

  await db.put(PROFILES_STORE, profile)

  return profile
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(PROFILES_STORE, id)
}
