import { useEffect, useId, useRef, useState } from 'react'
import squareIcon from '../../../assets/square.svg'
import squareDarkIcon from '../../../assets/square-dark.svg'
import squareCheckIcon from '../../../assets/square-check.svg'
import squareCheckDarkIcon from '../../../assets/square-check-dark.svg'
import trashIcon from '../../../assets/trash.svg'
import trashDarkIcon from '../../../assets/trash-dark.svg'
import type { Task } from '../../../types/Task'
import TitleEditButton from './TitleEditButton'
import useTitleEditor from '../utils/useTitleEditor'

const safeTaskIdPattern = /^[A-Za-z0-9_-]{1,80}$/

function taskViewTransitionName(taskId: string): string | undefined {
  // Зачем: id из localStorage попадает в CSS-имя. Пробел или кавычка делают его невалидным custom-ident.
  if (!safeTaskIdPattern.test(taskId)) {
    return undefined
  }

  return `task-${taskId}`
}

type TaskItemProps = {
  task: Task
  isViewTransitionTarget: boolean
  isLeaving: boolean
  reversesCheckStroke: boolean
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onRename: (taskId: string, title: string) => void
}

function TaskItem({
  task,
  isViewTransitionTarget,
  isLeaving,
  reversesCheckStroke,
  onToggle,
  onDelete,
  onRename,
}: TaskItemProps) {
  const checkboxId = useId()
  const titleInputId = useId()
  const editFormId = useId()
  const [isCompleteFlash, setIsCompleteFlash] = useState(false)
  const [isCheckReverse, setIsCheckReverse] = useState(false)
  const completeFlashTimerRef = useRef<number | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const editor = useTitleEditor(task.title, (trimmedTitle) => {
    onRename(task.id, trimmedTitle)
  }, titleInputRef)

  useEffect(() => {
    return () => {
      if (completeFlashTimerRef.current !== null) {
        window.clearTimeout(completeFlashTimerRef.current)
      }
    }
  }, [])

  function handleToggle() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!task.isCompleted && !reduceMotion) {
      setIsCheckReverse(false)

      if (completeFlashTimerRef.current !== null) {
        window.clearTimeout(completeFlashTimerRef.current)
      }

      setIsCompleteFlash(true)
      completeFlashTimerRef.current = window.setTimeout(() => {
        completeFlashTimerRef.current = null
        setIsCompleteFlash(false)
      }, 1000)
    } else {
      setIsCompleteFlash(false)
      setIsCheckReverse(task.isCompleted && !reduceMotion && reversesCheckStroke)

      if (completeFlashTimerRef.current !== null) {
        window.clearTimeout(completeFlashTimerRef.current)
        completeFlashTimerRef.current = null
      }
    }

    onToggle(task.id)
  }
  const viewTransitionName = isViewTransitionTarget ? taskViewTransitionName(task.id) : undefined

  return (
    <li
      className={[
        'task-card',
        task.isCompleted ? 'is-completed' : '',
        isCompleteFlash ? 'is-complete-flash' : '',
        isCheckReverse ? 'is-check-reverse' : '',
        isLeaving ? 'is-leaving' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={viewTransitionName === undefined ? undefined : { viewTransitionName }}
    >
      <label className="task-check" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          className="visually-hidden"
          type="checkbox"
          aria-label={task.isCompleted ? `Вернуть задачу: ${task.title}` : `Выполнить задачу: ${task.title}`}
          checked={task.isCompleted}
          onChange={handleToggle}
        />
        <span className="check-icon">
          <img className="icon-light icon-empty" src={squareIcon} alt="" width={24} height={24} />
          <img className="icon-dark icon-empty" src={squareDarkIcon} alt="" width={24} height={24} />
          <img className="icon-light icon-done" src={squareCheckIcon} alt="" width={24} height={24} />
          <img className="icon-dark icon-done" src={squareCheckDarkIcon} alt="" width={24} height={24} />
          <svg className="check-draw" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path pathLength="1" d="M9 12L11 14L15 10" />
          </svg>
        </span>
      </label>
      {editor.isEditing ? (
        <form id={editFormId} className="task-edit" onSubmit={editor.handleEditSubmit}>
          <label className="visually-hidden" htmlFor={titleInputId}>
            Текст задачи
          </label>
          <span className="task-edit-field">
            <span className="task-edit-sizer" aria-hidden="true">
              {editor.draftTitle.length > 0 ? editor.draftTitle : ' '}
            </span>
            <input
              ref={titleInputRef}
              id={titleInputId}
              name="draft-title"
              type="text"
              value={editor.draftTitle}
              autoFocus
              onChange={(event) => {
                editor.setDraftTitle(event.target.value)
              }}
              onBlur={editor.handleDraftBlur}
              onKeyDown={editor.handleEditKeyDown}
            />
          </span>
        </form>
      ) : (
        <p className="task-title">
          <span className="task-title-text">{task.title}</span>
        </p>
      )}
      <TitleEditButton
        showCheck={editor.showCheck}
        formId={editFormId}
        editLabel={`Изменить задачу: ${task.title}`}
        saveLabel={`Сохранить название: ${task.title}`}
        onPointerDown={editor.handleSavePointerDown}
        onClick={editor.handleEditClick}
      />
      <button
        type="button"
        className="icon-button"
        aria-label={`Удалить задачу: ${task.title}`}
        onClick={() => {
          onDelete(task.id)
        }}
      >
        <img className="icon-light" src={trashIcon} alt="" width={24} height={24} />
        <img className="icon-dark" src={trashDarkIcon} alt="" width={24} height={24} />
      </button>
    </li>
  )
}

export default TaskItem
