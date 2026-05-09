import CryptoJS from 'crypto-js'

const STORAGE_KEY = 'xhs_seo_tool_key'

function getEncryptionKey(): string {
  let key = localStorage.getItem(STORAGE_KEY)
  if (!key) {
    key = CryptoJS.lib.WordArray.random(256 / 8).toString()
    localStorage.setItem(STORAGE_KEY, key)
  }
  return key
}

export function encrypt(data: string): string {
  const key = getEncryptionKey()
  return CryptoJS.AES.encrypt(data, key).toString()
}

export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey()
  const bytes = CryptoJS.AES.decrypt(encryptedData, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function encryptObject<T>(obj: T): string {
  return encrypt(JSON.stringify(obj))
}

export function decryptObject<T>(encryptedData: string): T | null {
  try {
    const decrypted = decrypt(encryptedData)
    return JSON.parse(decrypted) as T
  } catch {
    return null
  }
}
