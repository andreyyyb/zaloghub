import type { KeyboardEvent } from 'react'

function isImeEnter(event: KeyboardEvent<HTMLInputElement>): boolean {
  // Зачем: Enter во время набора иероглифов не должен сохранять незаконченную строку. В Safari isComposing уже сброшен, поэтому ещё проверяем keyCode 229.
  return event.key === 'Enter' && (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
}

export default isImeEnter
