import { encryptObject, decryptObject } from './crypto'

export function setItem<T>(key: string, value: T, encrypt = false): void {
  const data = encrypt ? encryptObject(value) : JSON.stringify(value)
  localStorage.setItem(key, data)
}

export function getItem<T>(key: string, encrypted = false): T | null {
  const data = localStorage.getItem(key)
  if (!data) return null
  if (encrypted) {
    return decryptObject<T>(data)
  }
  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(key)
}

export function clearAll(): void {
  localStorage.clear()
}

export function exportAllData(): string {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      data[key] = localStorage.getItem(key)
    }
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as Record<string, string>
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })
    return true
  } catch {
    return false
  }
}
