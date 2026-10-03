import { Brain, CalendarClock, ImagePlus, ListChecks, Target, Zap } from "lucide-react";

const FEATURES = [
  {
    Icon: ImagePlus,
    title: "Screenshot upload",
    text: "Drag-and-drop or browse for images — PNG, JPG, JPEG, or WEBP, up to 8 MB.",
  },
  {
    Icon: Brain,
    title: "AI task detection",
    text: "Real vision models extract actionable tasks from messy messages.",
  },
  {
    Icon: CalendarClock,
    title: "Smart deadlines",
    text: "Due dates are picked up only when they're explicit in the screenshot.",
  },
  {
    Icon: Target,
    title: "Priority radar",
    text: "See at a glance which tasks need attention first.",
  },
  {
    Icon: ListChecks,
    title: "Task management",
    text: "Track completion with a clean, satisfying progress checklist.",
  },
  {
    Icon: Zap,
    title: "Smart optimization",
    text: "Images are auto-resized to stay fast and rate-limit friendly.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3.5 py-1.5 text-xs font-medium text-muted">
          <Zap className="size-3.5 text-primary" aria-hidden />
          Features
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Everything you need to stay on track.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Purpose-built for group chats, announcements, and last-minute deadlines.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-edge bg-card p-5 transition-colors hover:border-primary/30"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}