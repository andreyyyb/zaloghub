import moonIcon from '../../../assets/moon.svg'
import sunIcon from '../../../assets/sun.svg'
import type { ThemeName } from '../../../utils/theme'

type ThemeToggleProps = {
  theme: ThemeName
  onToggle: () => void
}

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      onClick={onToggle}
    >
      <img src={isDark ? sunIcon : moonIcon} alt="" width={48} height={48} />
    </button>
  )
}

export default ThemeToggle
