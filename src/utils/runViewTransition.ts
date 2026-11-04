import { flushSync } from 'react-dom'

function runViewTransition(update: () => void, prepare?: () => void): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion || typeof document.startViewTransition !== 'function') {
    update()
    return
  }

  // Зачем: у удаления имя карточки должно стоять ещё в старом кадре, иначе снимок пустой.
  if (prepare) {
    flushSync(prepare)
  }

  const transition = document.startViewTransition(() => {
    flushSync(update)
  })

  // Зачем: повторный клик во время анимации иначе роняет промис и пишет ошибку в консоль.
  transition.ready.catch(() => {})
  transition.finished.catch(() => {})
}

export default runViewTransition
