import type { Priority, Task } from "./types";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

// Hard caps so a hostile/odd model response can't bloat stored tasks.
const MAX_TITLE_LENGTH = 140;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_SHORT_TEXT_LENGTH = 80;

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && PRIORITIES.includes(value as Priority);
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptionalText(value: unknown): string | null {
  const text = cleanText(value);
  return text.length > 0 ? text : null;
}

function parseTask(raw: unknown): Task | null {
  if (typeof raw !== "object" || raw === null) return null;

  const record = raw as Record<string, unknown>;
  const title = cleanText(record.title);
  if (!title) return null;

  // Anything the model labels oddly ("urgent", "P1", "ASAP") is treated as
  // medium rather than silently downgraded to low.
  const priority = isPriority(record.priority) ? record.priority : "medium";

  return {
    title: title.slice(0, MAX_TITLE_LENGTH),
    description: cleanText(record.description).slice(0, MAX_DESCRIPTION_LENGTH),
    deadline: cleanOptionalText(record.deadline)?.slice(0, MAX_SHORT_TEXT_LENGTH) ?? null,
    priority,
    assignee: cleanOptionalText(record.assignee)?.slice(0, MAX_SHORT_TEXT_LENGTH) ?? null,
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
