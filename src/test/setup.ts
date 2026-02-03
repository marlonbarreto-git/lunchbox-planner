import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IndexedDB for tests
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
}

vi.stubGlobal('indexedDB', indexedDB)
