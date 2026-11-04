type StoredJsonRead =
  | { status: 'missing' }
  | { status: 'unreadable' }
  | { status: 'parsed'; value: unknown }

function readStoredJson(storageKey: string): StoredJsonRead {
  let raw: string | null

  try {
    raw = localStorage.getItem(storageKey)
  } catch {
    return { status: 'unreadable' }
  }

  if (raw === null) {
    return { status: 'missing' }
  }

  try {
    // Зачем: JSON.parse в типах DOM объявлен как any. Сразу сужаем до unknown и не доверяем форме.
    const value: unknown = JSON.parse(raw)
    return { status: 'parsed', value }
  } catch {
    return { status: 'unreadable' }
  }
}

export default readStoredJson
