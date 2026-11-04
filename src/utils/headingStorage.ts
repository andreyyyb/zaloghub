import readStoredJson from './readStoredJson'

const storageKey = 'zaloghub-heading'

const defaultHeading = 'Мои задачи'

function readStoredHeading(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedTitle = value.trim()

  if (trimmedTitle.length === 0) {
    return null
  }

  return trimmedTitle
}

export function readHeading(): string {
  // Зачем: ключ отдельный от задач. Чужое или битое значение нельзя показать и нельзя затереть заголовком по умолчанию при открытии.
  const stored = readStoredJson(storageKey)

  if (stored.status !== 'parsed') {
    return defaultHeading
  }

  return readStoredHeading(stored.value) ?? defaultHeading
}

export function writeHeading(title: string): boolean {
  const trimmedTitle = title.trim()

  if (trimmedTitle.length === 0) {
    return false
  }

  // Зачем: переполнение хранилища или запрет браузера не должны ронять страницу.
  try {
    localStorage.setItem(storageKey, JSON.stringify(trimmedTitle))
    return true
  } catch {
    return false
  }
}
