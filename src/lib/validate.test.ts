import { describe, expect, it } from "vitest";
import { parseAnalyzeResponse } from "./validate";

// Deliberately untyped: these fixtures include values the model should not
// be able to send (unknown priorities, blank titles, wrong shapes).
function task(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    title: "Ship the report",
    description: "Send it to the client",
    deadline: "Friday",
    priority: "high",
    assignee: "Ali",
    ...overrides,
  };
}

describe("parseAnalyzeResponse", () => {
  it("accepts a well-formed payload", () => {
    const tasks = parseAnalyzeResponse({ tasks: [task()] });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toEqual(task());
  });

  it("returns [] for malformed payloads", () => {
    expect(parseAnalyzeResponse(null)).toEqual([]);
    expect(parseAnalyzeResponse("nope")).toEqual([]);
    expect(parseAnalyzeResponse({})).toEqual([]);
    expect(parseAnalyzeResponse({ tasks: "nope" })).toEqual([]);
    expect(parseAnalyzeResponse({ tasks: [null, 42, "text"] })).toEqual([]);
  });

  it("drops tasks without a title", () => {
    expect(parseAnalyzeResponse({ tasks: [task({ title: "  " })] })).toEqual(
      [],
    );
  });

  it("defaults missing or unknown priorities to medium", () => {
    const [missing] = parseAnalyzeResponse({
      tasks: [task({ priority: undefined })],
    });
    const [unknown] = parseAnalyzeResponse({
      tasks: [task({ priority: "urgent" })],
    });
    const [empty] = parseAnalyzeResponse({ tasks: [task({ priority: "" })] });
    expect(missing?.priority).toBe("medium");
    expect(unknown?.priority).toBe("medium");
    expect(empty?.priority).toBe("medium");
  });

  it("keeps valid priorities", () => {
    const tasks = parseAnalyzeResponse({
      tasks: [
        task({ priority: "high" }),
        task({ priority: "low", title: "second" }),
      ],
    });
    expect(tasks.map((t) => t.priority)).toEqual(["high", "low"]);
  });

  it("truncates over-long fields", () => {
    const [parsed] = parseAnalyzeResponse({
      tasks: [
        task({
          title: "x".repeat(500),
          description: "y".repeat(500),
          deadline: "z".repeat(200),
          assignee: "a".repeat(200),
        }),
      ],
    });
    expect(parsed?.title).toHaveLength(140);
    expect(parsed?.description).toHaveLength(300);
    expect(parsed?.deadline).toHaveLength(80);
    expect(parsed?.assignee).toHaveLength(80);
  });

  it("normalizes blank optional fields to null", () => {
    const [parsed] = parseAnalyzeResponse({
      tasks: [task({ deadline: "   ", assignee: "" })],
    });
    expect(parsed?.deadline).toBeNull();
    expect(parsed?.assignee).toBeNull();
  });

  it("caps the payload at 20 tasks", () => {
    const many = Array.from({ length: 50 }, (_, i) =>
      task({ title: `Task ${i}` }),
    );
    expect(parseAnalyzeResponse({ tasks: many })).toHaveLength(20);
  });
});
