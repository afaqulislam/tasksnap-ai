import type { Priority, Task } from "./types";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

export function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && PRIORITIES.includes(value as Priority);
}

export function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function cleanOptionalText(value: unknown): string | null {
  const text = cleanText(value);
  return text.length > 0 ? text : null;
}

export function parseTask(raw: unknown): Task | null {
  if (typeof raw !== "object" || raw === null) return null;

  const record = raw as Record<string, unknown>;
  const title = cleanText(record.title);
  if (!title) return null;

  const priority = isPriority(record.priority)
    ? record.priority
    : record.priority === undefined || record.priority === null
      ? "medium"
      : "low";

  return {
    title: title.slice(0, 140),
    description: cleanText(record.description).slice(0, 300),
    deadline: cleanOptionalText(record.deadline)?.slice(0, 80) ?? null,
    priority,
    assignee: cleanOptionalText(record.assignee)?.slice(0, 80) ?? null,
  };
}

export function parseAnalyzeResponse(body: unknown): Task[] {
  if (typeof body !== "object" || body === null) return [];

  const record = body as Record<string, unknown>;
  if (!Array.isArray(record.tasks)) return [];

  const tasks: Task[] = [];
  for (const raw of record.tasks.slice(0, 20)) {
    const task = parseTask(raw);
    if (task) tasks.push(task);
  }
  return tasks;
}
