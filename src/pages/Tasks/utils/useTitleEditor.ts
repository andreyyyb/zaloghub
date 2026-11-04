import { useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import isImeEnter from './isImeEnter'

type TitleEditor = {
  isEditing: boolean
  showCheck: boolean
  draftTitle: string
  setDraftTitle: (nextTitle: string) => void
  handleEditSubmit: (event: FormEvent<HTMLFormElement>) => void
  handleEditKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  handleDraftBlur: (event: FocusEvent<HTMLInputElement>) => void
  handleEditClick: () => void
  handleSavePointerDown: (event: PointerEvent<HTMLButtonElement>) => void
}

const saveGestureWindowMs = 50

function isSaveButton(target: EventTarget | null): boolean {
  return target instanceof HTMLButtonElement && target.dataset.saveTitle === 'true'
}

function useTitleEditor(
  savedTitle: string,
  onCommit: (trimmedTitle: string) => void,
  inputRef: RefObject<HTMLInputElement | null>,
): TitleEditor {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(savedTitle)
  const saveClickRef = useRef(false)
  const saveGestureAtRef = useRef(0)

  function hasNewTitle(value: string): boolean {
    const trimmedTitle = value.trim()
    return trimmedTitle.length > 0 && trimmedTitle !== savedTitle
  }

  function markSaveGesture() {
    saveClickRef.current = true
    saveGestureAtRef.current = performance.now()
  }

  function clearSaveGesture() {
    saveClickRef.current = false
    saveGestureAtRef.current = 0
  }

  function beginEditing() {
    clearSaveGesture()
    setDraftTitle(savedTitle)
    setIsEditing(true)
  }

  function closeEditor() {
    // Зачем: поле ещё в DOM, пока React не перерисует строку. Сбрасываем ref сразу, чтобы следующий клик не считал редактор открытым.
    inputRef.current = null
    setIsEditing(false)
  }

  function finishEditing(nextTitle: string) {
    if (inputRef.current === null) {
      return
    }

    closeEditor()

    const trimmedTitle = nextTitle.trim()

    if (trimmedTitle.length === 0 || trimmedTitle === savedTitle) {
      setDraftTitle(savedTitle)
      return
    }

    onCommit(trimmedTitle)
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const titleInput = event.currentTarget.elements.namedItem('draft-title')

    if (!(titleInput instanceof HTMLInputElement)) {
      return
    }

    finishEditing(titleInput.value)
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isImeEnter(event)) {
      event.preventDefault()
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      finishEditing(event.currentTarget.value)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeEditor()
      setDraftTitle(savedTitle)
    }
  }

  function handleDraftBlur(event: FocusEvent<HTMLInputElement>) {
    if (inputRef.current === null) {
      return
    }

    if (isSaveButton(event.relatedTarget)) {
      markSaveGesture()
    }

    finishEditing(event.currentTarget.value)
  }

  function handleEditClick() {
    if (inputRef.current !== null) {
      if (hasNewTitle(inputRef.current.value)) {
        finishEditing(inputRef.current.value)
      }
      return
    }

    // Зачем: клик после сохранения приходит уже без поля. Флаг ставим только на этот жест, а следующий pointerdown его снимает.
    if (saveClickRef.current) {
      clearSaveGesture()
      return
    }

    beginEditing()
  }

  function handleSavePointerDown(event: PointerEvent<HTMLButtonElement>) {
    const input = inputRef.current

    if (input === null) {
      const blurJustSaved = saveClickRef.current && performance.now() - saveGestureAtRef.current < saveGestureWindowMs

      if (!blurJustSaved) {
        clearSaveGesture()
      }

      return
    }

    // Зачем: blur раньше click закрывает поле и следующий click открывает его снова. preventDefault только пока поле на экране.
    event.preventDefault()

    if (!hasNewTitle(input.value)) {
      return
    }

    markSaveGesture()
    finishEditing(input.value)
  }

  const showCheck = isEditing && hasNewTitle(draftTitle)

  return {
    isEditing,
    showCheck,
    draftTitle,
    setDraftTitle,
    handleEditSubmit,
    handleEditKeyDown,
    handleDraftBlur,
    handleEditClick,
    handleSavePointerDown,
  }
}

export default useTitleEditor
