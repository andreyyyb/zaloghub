import { useId, type FormEvent, type KeyboardEvent } from 'react'
import plusIcon from '../../../assets/plus.svg'
import isImeEnter from '../utils/isImeEnter'

type TaskFormProps = {
  onAdd: (title: string) => void
}

function syncAriaInvalid(input: HTMLInputElement) {
  const isUserInvalid = input.matches(':user-invalid')
  input.setAttribute('aria-invalid', isUserInvalid ? 'true' : 'false')
}

function TaskForm({ onAdd }: TaskFormProps) {
  const titleId = useId()
  const errorId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const titleInput = form.elements.namedItem('title')

    if (!(titleInput instanceof HTMLInputElement) || !titleInput.checkValidity()) {
      return
    }

    const title = titleInput.value.trim()

    if (title.length === 0) {
      return
    }

    onAdd(title)
    form.reset()
    titleInput.setAttribute('aria-invalid', 'false')
  }

  function handleInvalid(event: FormEvent<HTMLInputElement>) {
    // Зачем: браузер показал бы английскую подсказку, а рядом с полем уже есть русский текст.
    event.preventDefault()
    syncAriaInvalid(event.currentTarget)
  }

  function handleBlur(event: FormEvent<HTMLInputElement>) {
    syncAriaInvalid(event.currentTarget)
  }

  function handleInput(event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget

    if (input.hasAttribute('aria-invalid')) {
      syncAriaInvalid(input)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isImeEnter(event)) {
      event.preventDefault()
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-field">
        <label className="visually-hidden" htmlFor={titleId}>
          Новая задача
        </label>
        <input
          id={titleId}
          name="title"
          type="text"
          required
          pattern={'.*\\S.*'}
          placeholder="Введите задачу.."
          enterKeyHint="done"
          aria-errormessage={errorId}
          onInvalid={handleInvalid}
          onBlur={handleBlur}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        <p id={errorId} className="error-msg">Введите текст задачи</p>
      </div>
      <button type="submit" className="add-button">
        <img src={plusIcon} alt="" width={24} height={24} />
        Добавить
      </button>
    </form>
  )
}

export default TaskForm
