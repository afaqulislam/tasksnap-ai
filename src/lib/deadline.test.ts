import { describe, expect, it } from "vitest";
import { parseDeadlineToTimestamp } from "./deadline";

// Tuesday, 6 October 2026, 09:00 local.
const NOW = new Date(2026, 9, 6, 9, 0, 0);

function at(day: number, hour: number, minute: number): number {
  return new Date(2026, 9, day, hour, minute, 0, 0).getTime();
}

describe("parseDeadlineToTimestamp", () => {
  it("returns null for empty or unparseable deadlines", () => {
    expect(parseDeadlineToTimestamp(null, NOW)).toBeNull();
    expect(parseDeadlineToTimestamp(undefined, NOW)).toBeNull();
    expect(parseDeadlineToTimestamp("   ", NOW)).toBeNull();
    expect(parseDeadlineToTimestamp("no idea when", NOW)).toBeNull();
    expect(parseDeadlineToTimestamp("submit the report", NOW)).toBeNull();
  });

  it("parses bare weekdays", () => {
    expect(parseDeadlineToTimestamp("Friday", NOW)).toBe(at(9, 23, 59));
    expect(parseDeadlineToTimestamp("fri", NOW)).toBe(at(9, 23, 59));
  });

  it("parses weekday + time", () => {
    expect(parseDeadlineToTimestamp("Friday at 5 PM", NOW)).toBe(at(9, 17, 0));
    expect(parseDeadlineToTimestamp("Monday 9:30 am", NOW)).toBe(
      at(12, 9, 30),
    );
  });

  it("moves to next week for 'next <weekday>'", () => {
    expect(parseDeadlineToTimestamp("next Monday", NOW)).toBe(at(12, 23, 59));
  });

  it("parses relative day words", () => {
    expect(parseDeadlineToTimestamp("today", NOW)).toBe(at(6, 23, 59));
    expect(parseDeadlineToTimestamp("tonight", NOW)).toBe(at(6, 20, 0));
    expect(parseDeadlineToTimestamp("tomorrow", NOW)).toBe(at(7, 23, 59));
    expect(parseDeadlineToTimestamp("Tomorrow at 4 PM", NOW)).toBe(
      at(7, 16, 0),
    );
  });

  it("parses 'in N …' offsets", () => {
    expect(parseDeadlineToTimestamp("in 3 days", NOW)).toBe(at(9, 23, 59));
    expect(parseDeadlineToTimestamp("in 2 hours", NOW)).toBe(
      NOW.getTime() + 2 * 3_600_000,
    );
    expect(parseDeadlineToTimestamp("in 1 week", NOW)).toBe(at(13, 23, 59));
  });

  it("parses explicit dates", () => {
    expect(parseDeadlineToTimestamp("2026-10-10", NOW)).toBe(at(10, 23, 59));
    expect(parseDeadlineToTimestamp("October 10, 2026", NOW)).toBe(
      at(10, 23, 59),
    );
    expect(parseDeadlineToTimestamp("October 10, 2026 at 9am", NOW)).toBe(
      at(10, 9, 0),
    );
  });

  it("rolls year-less dates forward instead of using a past year", () => {
    // 5 March is already behind us in October 2026.
    expect(parseDeadlineToTimestamp("Mar 5", NOW)).toBe(
      new Date(2027, 2, 5, 23, 59, 0, 0).getTime(),
    );
  });

  it("parses a bare clock time as later today", () => {
    expect(parseDeadlineToTimestamp("at 4 PM", NOW)).toBe(at(6, 16, 0));
    expect(parseDeadlineToTimestamp("by 11:15", NOW)).toBe(at(6, 11, 15));
  });

  it("parses shorthand end-of-day and clock words", () => {
    expect(parseDeadlineToTimestamp("EOD", NOW)).toBe(at(6, 17, 0));
    expect(parseDeadlineToTimestamp("end of day", NOW)).toBe(at(6, 17, 0));
    expect(parseDeadlineToTimestamp("noon", NOW)).toBe(at(6, 12, 0));
    expect(parseDeadlineToTimestamp("midnight", NOW)).toBe(at(6, 0, 0));
  });

  it("handles 12am/12pm correctly", () => {
    expect(parseDeadlineToTimestamp("tomorrow at 12am", NOW)).toBe(
      at(7, 0, 0),
    );
    expect(parseDeadlineToTimestamp("tomorrow at 12pm", NOW)).toBe(
      at(7, 12, 0),
    );
  });
});
