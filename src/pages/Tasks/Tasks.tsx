import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Task } from '../../types/Task'
import type { TaskFilter } from '../../types/TaskFilter'
import { readHeading, writeHeading } from '../../utils/headingStorage'
import { readTasks, writeTasks } from '../../utils/taskStorage'
import { applyTheme, readTheme, saveTheme, type ThemeName } from '../../utils/theme'
import runViewTransition from '../../utils/runViewTransition'
import filterTasks from './utils/filterTasks?hold=3'
import formatTasksLeft from './utils/formatTasksLeft'
import ListHeading from './components/ListHeading'
import TaskFilters from './components/TaskFilters'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList?hold=3'
import ThemeToggle from './components/ThemeToggle'

const emptyTaskMessage: Record<TaskFilter, string> = {
  all: 'Добавьте задачу в поле выше',
  active: 'Нет активных задач',
  completed: 'Нет выполненных задач',
}

const saveErrorMessage = 'Не удалось сохранить задачи в этом браузере'
const leaveDurationMs = 260
const filterExitDurationMs = 1100
const headingSaveErrorMessage = 'Не удалось сохранить название списка в этом браузере'

type TasksScreenState = {
  tasks: Task[]
  storageMessage: string | null
}

function createTaskId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Зачем: без randomUUID задаче всё равно нужен свой id, иначе переключение заденет не ту строку.
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function Tasks() {
  const [screen, setScreen] = useState<TasksScreenState>(() => {
    const loaded = readTasks()
    return { tasks: loaded.tasks, storageMessage: loaded.errorMessage }
  })
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [theme, setTheme] = useState<ThemeName>(() => readTheme())
  const [heading, setHeading] = useState(() => readHeading())
  const [headingMessage, setHeadingMessage] = useState<string | null>(null)
  const [animatedTaskId, setAnimatedTaskId] = useState<string | null>(null)
  const [leavingTaskIds, setLeavingTaskIds] = useState<ReadonlySet<string>>(() => new Set())
  const [departingTaskIds, setDepartingTaskIds] = useState<ReadonlySet<string>>(() => new Set())
  const tasksRef = useRef(screen.tasks)
  const leaveTimersRef = useRef<Map<string, number>>(new Map())
  const filterExitTimersRef = useRef<Map<string, number>>(new Map())
  const resultsRef = useRef<HTMLDivElement>(null)
  const skipFilterMotionRef = useRef(true)

  useEffect(() => {
    const leaveTimers = leaveTimersRef.current
    const filterExitTimers = filterExitTimersRef.current

    return () => {
      for (const timer of leaveTimers.values()) {
        window.clearTimeout(timer)
      }

      for (const timer of filterExitTimers.values()) {
        window.clearTimeout(timer)
      }
    }
  }, [])

  function releaseDepartingTask(taskId: string) {
    const timer = filterExitTimersRef.current.get(taskId)

    if (timer !== undefined) {
      window.clearTimeout(timer)
      filterExitTimersRef.current.delete(taskId)
    }

    setDepartingTaskIds((current) => {
      if (!current.has(taskId)) {
        return current
      }

      const next = new Set(current)
      next.delete(taskId)
      return next
    })
  }

  function holdDepartingTask(taskId: string) {
    const existingTimer = filterExitTimersRef.current.get(taskId)

    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer)
    }

    setDepartingTaskIds((current) => {
      const next = new Set(current)
      next.add(taskId)
      return next
    })

    const timer = window.setTimeout(() => {
      filterExitTimersRef.current.delete(taskId)
      setDepartingTaskIds((current) => {
        if (!current.has(taskId)) {
          return current
        }

        const next = new Set(current)
        next.delete(taskId)
        return next
      })
    }, filterExitDurationMs)

    filterExitTimersRef.current.set(taskId, timer)
  }

  function clearDepartingTasks() {
    for (const timer of filterExitTimersRef.current.values()) {
      window.clearTimeout(timer)
    }

    filterExitTimersRef.current.clear()
    setDepartingTaskIds((current) => (current.size === 0 ? current : new Set()))
  }

  function commitTasks(nextTasks: Task[], animate = true, cardId: string | null = null) {
    // Зачем: screen обновится после отрисовки, и второй клик записал бы список без предыдущей задачи.
    tasksRef.current = nextTasks

    const applyTasks = () => {
      // Зачем: запись при открытии страницы затёрла бы битый JSON пустым списком раньше, чем человек увидит ошибку чтения.
      const isSaved = writeTasks(nextTasks)

      setScreen({
        tasks: nextTasks,
        storageMessage: isSaved ? null : saveErrorMessage,
      })
    }

    // Зачем: правка названия и смена статуса не снимают список. Снимок только у добавляемой карточки.
    if (!animate || cardId === null) {
      setAnimatedTaskId(null)
      applyTasks()
      return
    }

    runViewTransition(
      () => {
        setAnimatedTaskId(cardId)
        applyTasks()
      },
      animatedTaskId === null
        ? undefined
        : () => {
            setAnimatedTaskId(null)
          },
    )
  }

  function addTask(title: string) {
    const trimmedTitle = title.trim()

    if (trimmedTitle.length === 0) {
      return
    }

    const task: Task = {
      id: createTaskId(),
      title: trimmedTitle,
      isCompleted: false,
    }

    commitTasks([task, ...tasksRef.current], true, task.id)
  }

  function toggleTask(taskId: string) {
    const currentTask = tasksRef.current.find((task) => task.id === taskId)

    if (currentTask === undefined) {
      return
    }

    const nextCompleted = !currentTask.isCompleted
    const nextTasks = tasksRef.current.map((task) => {
      if (task.id !== taskId) {
        return task
      }

      return { ...task, isCompleted: nextCompleted }
    })
    const leavesFilter =
      (filter === 'active' && nextCompleted) || (filter === 'completed' && !nextCompleted)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (leavesFilter && !reduceMotion) {
      holdDepartingTask(taskId)
    } else {
      releaseDepartingTask(taskId)
    }

    // Зачем: статус пишем сразу, а из «Активные» и «Выполненные» строка уходит только после анимации.
    commitTasks(nextTasks, false)
  }

  function deleteTask(taskId: string) {
    const remaining = tasksRef.current.filter((task) => task.id !== taskId)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commitTasks(remaining, false)
      return
    }

    if (leaveTimersRef.current.has(taskId)) {
      return
    }

    setLeavingTaskIds((current) => {
      const next = new Set(current)
      next.add(taskId)
      return next
    })

    const timer = window.setTimeout(() => {
      leaveTimersRef.current.delete(taskId)
      setLeavingTaskIds((current) => {
        const next = new Set(current)
        next.delete(taskId)
        return next
      })
      commitTasks(
        tasksRef.current.filter((task) => task.id !== taskId),
        false,
      )
    }, leaveDurationMs)

    leaveTimersRef.current.set(taskId, timer)
  }

  function renameTask(taskId: string, title: string) {
    const trimmedTitle = title.trim()

    if (trimmedTitle.length === 0) {
      return
    }

    const nextTasks = tasksRef.current.map((task) => {
      if (task.id !== taskId) {
        return task
      }

      return { ...task, title: trimmedTitle }
    })

    commitTasks(nextTasks, false)
  }

  function renameHeading(nextTitle: string) {
    const trimmedTitle = nextTitle.trim()

    if (trimmedTitle.length === 0 || trimmedTitle === heading) {
      return
    }

    // Зачем: снимок view transition во время правки заголовка оставляет на экране старое поле, как у названия задачи.
    const isSaved = writeHeading(trimmedTitle)

    setHeading(trimmedTitle)
    setHeadingMessage(isSaved ? null : headingSaveErrorMessage)
  }

  function changeFilter(nextFilter: TaskFilter) {
    // Зачем: View Transition снимает каждую карточку. Фильтр меняет весь список сразу.
    clearDepartingTasks()
    setAnimatedTaskId(null)
    setFilter(nextFilter)
  }

  useLayoutEffect(() => {
    const results = resultsRef.current

    if (results === null) {
      return
    }

    if (skipFilterMotionRef.current) {
      skipFilterMotionRef.current = false
      return
    }

    results.classList.remove('is-filter-enter')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Зачем: без чтения layout браузер не замечает снятие класса и не перезапускает анимацию.
    void results.offsetWidth
    results.classList.add('is-filter-enter')
  }, [filter])

  function toggleTheme() {
    const nextTheme: ThemeName = theme === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
    saveTheme(nextTheme)
    setTheme(nextTheme)
  }

  const visibleTasks = filterTasks(screen.tasks, filter, departingTaskIds)
  const tasksLeft = screen.tasks.filter((task) => !task.isCompleted).length

  return (
    <main className="tasks-page">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <div className="tasks-column">
        <ListHeading title={heading} onRename={renameHeading} />
        {headingMessage !== null && (
          <p className="storage-message" role="alert">
            {headingMessage}
          </p>
        )}
        {screen.storageMessage !== null && (
          <p className="storage-message" role="alert">
            {screen.storageMessage}
          </p>
        )}
        <TaskForm onAdd={addTask} />
        <div className="task-toolbar">
          <TaskFilters filter={filter} onFilterChange={changeFilter} />
          <p className="tasks-left">{formatTasksLeft(tasksLeft)}</p>
        </div>
        <div className="task-results" ref={resultsRef}>
          <TaskList
            tasks={visibleTasks}
            emptyMessage={emptyTaskMessage[filter]}
            animatedTaskId={animatedTaskId}
            leavingTaskIds={leavingTaskIds}
            reversesCheckStroke={filter === 'completed'}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onRename={renameTask}
          />
        </div>
      </div>
    </main>
  )
}

export default Tasks
