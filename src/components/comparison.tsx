import { Fragment } from "react";
import { Check, CircleX, Scale } from "lucide-react";
import { cn } from "@/lib/cn";

const ROWS = [
  {
    label: "Time to a task list",
    manual: "5–10 minutes of scrolling and re-reading",
    tasksnap: "Seconds, from one screenshot",
  },
  {
    label: "Deadlines you can trust",
    manual: "Whatever you remember while typing",
    tasksnap: "Only what's explicitly written",
  },
  {
    label: "Your screenshot",
    manual: "Sent to a third-party service",
    tasksnap: "Read on your device, never uploaded",
  },
  {
    label: "Prioritization",
    manual: "Whatever looks loudest",
    tasksnap: "Priority first, then nearest deadline",
  },
  {
    label: "Ongoing tracking",
    manual: "A notes app you have to maintain",
    tasksnap: "Tick off tasks with live progress",
  },
  {
    label: "Cost",
    manual: "Your time",
    tasksnap: "Free, open source, no account",
  },
];

export function Comparison() {
  return (
    <section
      id="comparison"
      className="mx-auto w-full max-w-4xl scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="flex flex-col items-center text-center">
        <span className="font-mono-label inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3.5 py-1.5 text-muted">
          <Scale className="size-3.5 text-primary" aria-hidden />
          Why TaskSnap
        </span>
        <h2 className="text-balance mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          The manual way, vs. the snapshot way.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Same screenshot, same information — one of these takes minutes and
          keeps leaking context.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3 lg:hidden">
        {ROWS.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-edge bg-card p-4"
          >
            <h3 className="text-sm font-semibold">{row.label}</h3>
            <div className="mt-3 flex flex-col gap-2">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                <CircleX
                  className="mt-0.5 size-4 shrink-0 text-muted/70"
                  aria-hidden
                />
                <span>
                  <span className="font-medium text-foreground/80">
                    Manual:{" "}
                  </span>
                  {row.manual}
                </span>
              </p>
              <p className="flex items-start gap-2 text-sm leading-relaxed">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>
                  <span className="font-medium text-primary">
                    TaskSnap:{" "}
                  </span>
                  {row.tasksnap}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 hidden overflow-hidden rounded-2xl border border-edge lg:block">
        <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-px bg-edge text-sm">
          <div className="bg-surface px-5 py-3.5 font-mono-label text-muted">
            Outcome
          </div>
          <div className="bg-surface px-5 py-3.5 font-mono-label text-muted">
            Manual
          </div>
          <div className="bg-primary/10 px-5 py-3.5 font-mono-label text-primary">
            TaskSnap AI
          </div>
          {ROWS.map((row) => (
            <Fragment key={row.label}>
              <div className="bg-card px-5 py-4 font-medium">{row.label}</div>
              <div
                className={cn(
                  "flex items-start gap-2 bg-card px-5 py-4 text-muted",
                )}
              >
                <CircleX
                  className="mt-0.5 size-4 shrink-0 text-muted/70"
                  aria-hidden
                />
                <span className="text-sm leading-relaxed">{row.manual}</span>
              </div>
              <div className="flex items-start gap-2 bg-primary/[0.04] px-5 py-4">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="text-sm leading-relaxed">{row.tasksnap}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}