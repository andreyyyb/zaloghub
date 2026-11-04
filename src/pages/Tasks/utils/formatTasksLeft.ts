function formatTasksLeft(count: number): string {
  const lastTwo = count % 100
  const lastOne = count % 10

  if (lastTwo < 11 || lastTwo > 14) {
    if (lastOne === 1) {
      return `Осталась ${count} задача`
    }

    if (lastOne >= 2 && lastOne <= 4) {
      return `Осталось ${count} задачи`
    }
  }

  return `Осталось ${count} задач`
}

export default formatTasksLeft
