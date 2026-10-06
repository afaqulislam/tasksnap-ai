import { describe, expect, it } from "vitest";
import { getActiveTasks, pickTopTask } from "./priority";
import type { Task } from "./types";

// Tuesday, 6 October 2026, 09:00 local.
const NOW = new Date(2026, 9, 6, 9, 0, 0).getTime();

function task(overrides: Partial<Task>): Task {
  return {
    title: "Task",
    description: "",
    deadline: null,
    priority: "medium",
    assignee: null,
    ...overrides,
  };
}

describe("pickTopTask", () => {
  it("returns null for an empty list", () => {
    expect(pickTopTask([], NOW)).toBeNull();
  });

  it("ranks priority ahead of deadlines", () => {
    const lowWithDeadline = task({
      title: "low",
      priority: "low",
      deadline: "today",
    });
    const highWithout = task({ title: "high", priority: "high" });
    expect(pickTopTask([lowWithDeadline, highWithout], NOW)?.title).toBe(
      "high",
    );
  });

  it("ranks the nearest deadline first within a priority", () => {
    const friday = task({ title: "friday", deadline: "Friday" });
    const tomorrow = task({ title: "tomorrow", deadline: "tomorrow" });
    expect(pickTopTask([friday, tomorrow], NOW)?.title).toBe("tomorrow");
    expect(pickTopTask([tomorrow, friday], NOW)?.title).toBe("tomorrow");
  });

  it("prefers a stated deadline over none", () => {
    const withDeadline = task({ title: "dated", deadline: "someday" });
    const without = task({ title: "undated" });
    expect(pickTopTask([without, withDeadline], NOW)?.title).toBe("dated");
  });

  it("prefers a parseable deadline over an unparseable one", () => {
    const parseable = task({ title: "friday", deadline: "Friday" });
    const vague = task({ title: "vague", deadline: "whenever really" });
    expect(pickTopTask([vague, parseable], NOW)?.title).toBe("friday");
  });
});

describe("getActiveTasks", () => {
  it("filters out completed indexes", () => {
    const tasks = [task({ title: "a" }), task({ title: "b" })];
    expect(getActiveTasks(tasks, new Set([0])).map((t) => t.title)).toEqual([
      "b",
    ]);
    expect(getActiveTasks(tasks, new Set())).toHaveLength(2);
  });
});
