const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tues: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  weds: 3,
  thursday: 4,
  thurs: 4,
  thu: 4,
  thur: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

const WEEKDAY_PATTERN = Object.keys(WEEKDAYS)
  .sort((a, b) => b.length - a.length)
  .join("|");

interface TimeOfDay {
  hour: number;
  minute: number;
}

function extractTime(normalized: string): TimeOfDay | null {
  if (/\b(noon|midday)\b/.test(normalized)) return { hour: 12, minute: 0 };
  if (/\bmidnight\b/.test(normalized)) return { hour: 0, minute: 0 };
  if (
    /\b(eod|end of (the )?(day|business day)|close of business|cob)\b/.test(
      normalized,
    )
  ) {
    return { hour: 17, minute: 0 };
  }

  const meridiem = normalized.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(?:o['\u2019]?clock\s*)?(a\.?m\.?|p\.?m\.?)\b/,
  );
  if (meridiem) {
    const rawHour = Number(meridiem[1]);
    const minute = meridiem[2] ? Number(meridiem[2]) : 0;
    if (rawHour < 1 || rawHour > 12 || minute > 59) return null;
    const isPm = meridiem[3].toLowerCase().startsWith("p");
    const hour = isPm
      ? rawHour === 12
        ? 12
        : rawHour + 12
      : rawHour === 12
        ? 0
        : rawHour;
    return { hour, minute };
  }

  const clockWord = normalized.match(/\b(\d{1,2})\s*o['\u2019]?clock\b/);
  if (clockWord) {
    const hour = Number(clockWord[1]);
    if (hour > 23) return null;
    return { hour, minute: 0 };
  }

  const named = normalized.match(/\b(?:at|by)\s+(\d{1,2})(?::(\d{2}))?\b/);
  if (named) {
    const hour = Number(named[1]);
    const minute = named[2] ? Number(named[2]) : 0;
    if (hour > 23 || minute > 59) return null;
    return { hour, minute };
  }

  return null;
}

function startOfDay(day: Date): Date {
  const copy = new Date(day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(day: Date, days: number): Date {
  const copy = new Date(day);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// Dates without an explicit year ("Mar 5") are normalized to the next
// occurrence instead of an arbitrary year in the past.
function resolveYear(day: Date, hasYear: boolean, now: Date): Date {
  if (hasYear) return day;
  const candidate = new Date(day);
  candidate.setFullYear(now.getFullYear());
  if (startOfDay(candidate).getTime() < startOfDay(now).getTime()) {
    candidate.setFullYear(now.getFullYear() + 1);
  }
  return candidate;
}

interface DateHint {
  date: Date;
  /** The hint came from a relative word such as "tomorrow" or "Friday". */
  relative: boolean;
  /** `date` already carries a meaningful time of day ("in 2 hours"). */
  exactTime: boolean;
}

// "October 10, 2026 at 9am" is not a string Date.parse() understands;
// dropping the clock phrase leaves a date it can parse on its own.
function stripClockPhrases(value: string): string {
  return value
    .replace(
      /\b(?:at|by)?\s*\d{1,2}(?::\d{2})?\s*(?:o['\u2019]?clock\s*)?(?:a\.?m\.?|p\.?m\.?)\b/g,
      " ",
    )
    .replace(/\b(?:at|by)\s+\d{1,2}(?::\d{2})?\b/g, " ")
    .replace(/\b(?:noon|midnight|eod|end of (?:the )?(?:day|business day))\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDate(normalized: string, now: Date): DateHint | null {
  const today = startOfDay(now);

  if (/\b(tonight|this evening)\b/.test(normalized)) {
    return { date: today, relative: true, exactTime: false };
  }
  if (/\btoday\b/.test(normalized)) {
    return { date: today, relative: true, exactTime: false };
  }
  if (/\b(tomorrow|tmr|tmrw|tom)\b/.test(normalized)) {
    return { date: addDays(today, 1), relative: true, exactTime: false };
  }

  const relative = normalized.match(
    /\bin\s+(\d{1,3})\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months)\b/,
  );
  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2];
    if (unit.startsWith("minute")) {
      return {
        date: new Date(now.getTime() + amount * 60_000),
        relative: true,
        exactTime: true,
      };
    }
    if (unit.startsWith("hour")) {
      return {
        date: new Date(now.getTime() + amount * 3_600_000),
        relative: true,
        exactTime: true,
      };
    }
    if (unit.startsWith("week")) {
      return {
        date: addDays(today, amount * 7),
        relative: true,
        exactTime: false,
      };
    }
    if (unit.startsWith("month")) {
      const date = new Date(today);
      date.setMonth(date.getMonth() + amount);
      return { date, relative: true, exactTime: false };
    }
    return { date: addDays(today, amount), relative: true, exactTime: false };
  }

  const weekday = normalized.match(
    new RegExp(`\\b(next\\s+)?(${WEEKDAY_PATTERN})\\b`),
  );
  if (weekday) {
    const target = WEEKDAYS[weekday[2]];
    const isNext = Boolean(weekday[1]);
    const diff = (target - now.getDay() + 7) % 7;
    const daysAhead = diff === 0 && isNext ? 7 : diff;
    return {
      date: addDays(today, daysAhead),
      relative: true,
      exactTime: false,
    };
  }

  const iso = normalized.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    return {
      date: new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])),
      relative: false,
      exactTime: false,
    };
  }

  const candidate = stripClockPhrases(normalized);
  const parsed = Number.isFinite(Date.parse(candidate))
    ? Date.parse(candidate)
    : Date.parse(normalized);
  if (Number.isFinite(parsed)) {
    return {
      date: resolveYear(
        new Date(parsed),
        /\b(19|20)\d{2}\b/.test(normalized),
        now,
      ),
      relative: false,
      exactTime: false,
    };
  }

  return null;
}

/**
 * Turns the free-form deadline text returned by the model ("Friday",
 * "Tomorrow at 4 PM", "2026-10-10", "in 3 days", "EOD") into an epoch
 * timestamp so urgency sorting actually works. Returns null when nothing
 * can be parsed — unparseable deadlines sort after parseable ones.
 */
export function parseDeadlineToTimestamp(
  deadline: string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!deadline) return null;

  const normalized = deadline.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return null;

  const time = extractTime(normalized);
  const hint = extractDate(normalized, now);

  if (!hint && !time) return null;

  // A bare time ("at 4 PM") means later today.
  const base = hint ? hint.date : startOfDay(now);

  if (hint && !hint.relative && time) {
    // Prefer the model's own full timestamp when Date.parse understands it
    // ("Oct 10 2026 4pm").
    const full = Date.parse(normalized);
    if (Number.isFinite(full)) return full;
  }

  const result = new Date(base);
  if (time) {
    result.setHours(time.hour, time.minute, 0, 0);
  } else if (hint && !hint.exactTime) {
    // "in 2 hours" already resolved to a precise instant; everything else
    // is a plain date, which is due by the end of that day.
    if (/\b(tonight|this evening)\b/.test(normalized)) {
      result.setHours(20, 0, 0, 0);
    } else {
      result.setHours(23, 59, 0, 0);
    }
  }

  return result.getTime();
}
