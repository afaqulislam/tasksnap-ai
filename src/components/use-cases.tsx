import { Bell, Briefcase, Compass, GraduationCap } from "lucide-react";

const USE_CASES = [
  {
    Icon: GraduationCap,
    title: "Students",
    text: "Group chats, LMS announcements, and email threads full of assignments. Snap it, get a dated checklist before the next deadline slips.",
    example: "\"Submit the math assignment by Friday\"",
  },
  {
    Icon: Briefcase,
    title: "Teams",
    text: "Standup notes, client threads, and release announcements. Every owner and due date lands in one list instead of six chat windows.",
    example: "\"Ali to ship billing by Thursday — QA on Friday\"",
  },
  {
    Icon: Bell,
    title: "Freelancers & solo work",
    text: "Scope changes, invoice reminders, and client asks buried in long threads. Nothing actionable gets lost in the scroll again.",
    example: "\"Client approved the mockups — invoice due next week\"",
  },
];

export function UseCases() {
  return (
    <section
      id="use-cases"
      className="mx-auto w-full max-w-5xl scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="flex flex-col items-center text-center">
        <span className="font-mono-label inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3.5 py-1.5 text-muted">
          <Compass className="size-3.5 text-primary" aria-hidden />
          Use cases
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Built for the messages that hide real work.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Action items rarely arrive as action items. They arrive as a sentence
          between two memes.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map(({ Icon, title, text, example }) => (
          <div
            key={title}
            className="flex flex-col gap-3 rounded-2xl border border-edge bg-card p-5 transition-colors hover:border-primary/30"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-muted">{text}</p>
            <p className="mt-auto rounded-xl border border-edge bg-surface px-3 py-2 font-mono text-xs leading-relaxed text-muted">
              {example}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}