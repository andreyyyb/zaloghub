export type ThemeName = 'light' | 'dark'

const storageKey = 'zaloghub-theme'

export function readTheme(): ThemeName {
  // Зачем: тема в localStorage могла быть испорчена. Неизвестное значение не должно включить чужой режим.
  try {
    const raw = localStorage.getItem(storageKey)

    if (raw === 'light' || raw === 'dark') {
      return raw
    }
  } catch {
    return 'light'
  }

  return 'light'
}

export function applyTheme(theme: ThemeName): void {
  // Зачем: чтение не должно ничего записывать. Битая тема иначе затиралась бы значением light при открытии.
  document.documentElement.dataset.theme = theme
}

export function saveTheme(theme: ThemeName): void {
  try {
    localStorage.setItem(storageKey, theme)
  } catch {
    // Тема уже на странице. Если браузер запретил запись, выбор пропадёт после обновления.
  }
}
