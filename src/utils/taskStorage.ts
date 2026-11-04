import type { Task } from '../types/Task'
import readStoredJson from './readStoredJson'

const storageKey = 'zaloghub-tasks'

const readErrorMessage =
  'Не удалось прочитать сохранённые задачи. Список начнётся заново после следующего изменения.'

const damagedTasksMessage =
  'Часть сохранённых задач была повреждена и не показана.'

type ReadTasksResult = {
  tasks: Task[]
  errorMessage: string | null
}

function readTask(value: unknown): Task | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  if (!('id' in value) || !('title' in value) || !('isCompleted' in value)) {
    return null
  }

  const { id, title, isCompleted } = value

  if (typeof id !== 'string' || id.trim().length === 0) {
    return null
  }

  if (typeof title !== 'string' || title.trim().length === 0) {
    return null
  }

  if (typeof isCompleted !== 'boolean') {
    return null
  }

  return { id, title, isCompleted }
}

export function readTasks(): ReadTasksResult {
  // Зачем: в localStorage может лежать чужая или старая запись. Без проверки она попадёт в список как есть.
  // Битый JSON здесь не перезаписываем: человек ещё не менял список.
  const stored = readStoredJson(storageKey)

  if (stored.status === 'missing') {
    return { tasks: [], errorMessage: null }
  }

  if (stored.status === 'unreadable' || !Array.isArray(stored.value)) {
    return { tasks: [], errorMessage: readErrorMessage }
  }

  const parsed = stored.value

  const tasks: Task[] = []
  const seenIds = new Set<string>()
  let hasDropped = false

  for (const item of parsed) {
    const task = readTask(item)

    if (task === null || seenIds.has(task.id)) {
      hasDropped = true
      continue
    }

    seenIds.add(task.id)
    tasks.push(task)
  }

  return {
    tasks,
    errorMessage: hasDropped ? damagedTasksMessage : null,
  }
}

export function writeTasks(tasks: Task[]): boolean {
  const safeTasks: Task[] = []

  for (const task of tasks) {
    const parsed = readTask(task)

    // Зачем: в хранилище пишем только поля, которые сами проверили. Лишние свойства объекта не сохраняем.
    if (parsed === null) {
      return false
    }

    safeTasks.push(parsed)
  }

  // Зачем: переполнение хранилища или запрет браузера не должны ронять страницу.
  // Как: ошибку глотаем здесь и возвращаем false, человеку уходит только понятный текст.
  try {
    localStorage.setItem(storageKey, JSON.stringify(safeTasks))
    return true
  } catch {
    return false
  }
}
