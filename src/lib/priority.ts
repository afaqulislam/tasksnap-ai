import { parseDeadlineToTimestamp } from "./deadline";
import type { Priority, Task } from "./types";

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

const PRIORITY_TEXT: Record<Priority, string> = {
  high: "text-danger",
  medium: "text-warning",
  low: "text-muted",
};

export function priorityTextClass(priority: Priority): string {
  return PRIORITY_TEXT[priority];
}

export function getActiveTasks(
  tasks: Task[],
  completed: Set<number>,
): Task[] {
  return tasks.filter((_, index) => !completed.has(index));
}

function deadlineSortValue(deadline: string | null, now: number): number | null {
  const parsed = parseDeadlineToTimestamp(deadline, new Date(now));
  return parsed ?? null;
}

export function pickTopTask(tasks: Task[], now = Date.now()): Task | null {
  if (tasks.length === 0) return null;
  return [...tasks].sort((a, b) => {
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (byPriority !== 0) return byPriority;

    // Any stated deadline beats no deadline, parseable or not.
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;

    const timeA = deadlineSortValue(a.deadline, now);
    const timeB = deadlineSortValue(b.deadline, now);
    if (timeA !== null && timeB !== null && timeA !== timeB) {
      return timeA - timeB;
    }
    if (timeA !== null && timeB === null) return -1;
    if (timeA === null && timeB !== null) return 1;
    return 0;
  })[0]!;
}
