import type { Task } from '../../../types/Task'
import TaskItem from './TaskItem?hold=3'

type TaskListProps = {
  tasks: Task[]
  emptyMessage: string
  animatedTaskId: string | null
  leavingTaskIds: ReadonlySet<string>
  reversesCheckStroke: boolean
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onRename: (taskId: string, title: string) => void
}

function TaskList({
  tasks,
  emptyMessage,
  animatedTaskId,
  leavingTaskIds,
  reversesCheckStroke,
  onToggle,
  onDelete,
  onRename,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty-tasks">{emptyMessage}</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isViewTransitionTarget={task.id === animatedTaskId}
          isLeaving={leavingTaskIds.has(task.id)}
          reversesCheckStroke={reversesCheckStroke}
          onToggle={onToggle}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </ul>
  )
}

export default TaskList
