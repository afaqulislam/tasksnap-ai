import { ImagePlus, ListChecks, ScanText, Sparkles } from "lucide-react";

const STEPS = [
  {
    Icon: ImagePlus,
    title: "Upload a screenshot",
    text: "Drop any screenshot — WhatsApp, email, Discord, or an announcement.",
  },
  {
    Icon: ScanText,
    title: "OCR reads it locally",
    text: "Tesseract extracts the text right in your browser — private, multi-language, and free of API tokens.",
  },
  {
    Icon: Sparkles,
    title: "AI builds your list",
    text: "Tasks, deadlines, priorities, and assignees — extracted, then ranked by urgency. If OCR can't read it, the image is analyzed directly.",
  },
  {
    Icon: ListChecks,
    title: "Track & take action",
    text: "Tick tasks off as you go and see what needs attention first.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-16">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3.5 py-1.5 text-xs font-medium text-muted">
          <Sparkles className="size-3.5 text-primary" aria-hidden />
          How it works
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          From screenshot to schedule in seconds.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          No typing, no copying — just snap, analyze, and go.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ Icon, title, text }, index) => (
          <div
            key={title}
            className="rounded-2xl border border-edge bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="rounded-full border border-edge bg-surface px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted">
                Step {index + 1}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}