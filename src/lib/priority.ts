import type { Task } from "./types";

const PRIORITY_ORDER: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function deadlineTimestamp(deadline: string | null): number | null {
  if (!deadline) return null;
  const time = Date.parse(deadline);
  return Number.isFinite(time) ? time : null;
}

export function pickTopTask(tasks: Task[]): Task | null {
  if (tasks.length === 0) return null;
  return [...tasks].sort((a, b) => {
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (byPriority !== 0) return byPriority;
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    const timeA = deadlineTimestamp(a.deadline);
    const timeB = deadlineTimestamp(b.deadline);
    if (timeA !== null && timeB !== null && timeA !== timeB) {
      return timeA - timeB;
    }
    return 0;
  })[0]!;
}
