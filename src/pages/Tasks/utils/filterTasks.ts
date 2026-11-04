import type { Task } from '../../../types/Task'
import type { TaskFilter } from '../../../types/TaskFilter'

function filterTasks(
  tasks: Task[],
  filter: TaskFilter,
  pinnedIds?: ReadonlySet<string>,
): Task[] {
  return tasks.filter((task) => {
    // Зачем: статус уже новый, но строка должна доиграть галочку, прежде чем уйти из фильтра.
    if (pinnedIds !== undefined && pinnedIds.has(task.id)) {
      return true
    }

    if (filter === 'active') {
      return !task.isCompleted
    }

    if (filter === 'completed') {
      return task.isCompleted
    }

    return true
  })
}

export default filterTasks
