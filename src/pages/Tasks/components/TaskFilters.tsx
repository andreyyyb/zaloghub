import { type ChangeEvent } from 'react'
import type { TaskFilter } from '../../../types/TaskFilter'

const filterOptions: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
]

type TaskFiltersProps = {
  filter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
}

function isTaskFilter(value: string): value is TaskFilter {
  return value === 'all' || value === 'active' || value === 'completed'
}

function TaskFilters({ filter, onFilterChange }: TaskFiltersProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target

    if (!isTaskFilter(value)) {
      return
    }

    onFilterChange(value)
  }

  return (
    <fieldset className="task-filters">
      <legend className="visually-hidden">Показать</legend>
      <div className="filter-options">
        {filterOptions.map((option, index) => (
          <span key={option.value} className="filter-option">
            {index > 0 && <span className="filter-separator" aria-hidden="true" />}
            <label className={filter === option.value ? 'is-selected' : undefined}>
              <input
                className="visually-hidden"
                type="radio"
                name="task-filter"
                value={option.value}
                checked={filter === option.value}
                onChange={handleChange}
              />
              {option.label}
            </label>
          </span>
        ))}
      </div>
    </fieldset>
  )
}

export default TaskFilters
