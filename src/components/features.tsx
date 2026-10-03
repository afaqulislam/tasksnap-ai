import { Brain, CalendarClock, ImagePlus, ScanText, ShieldCheck, Target } from "lucide-react";
import { MAX_IMAGE_MB } from "@/lib/config";

const FEATURES = [
  {
    Icon: ImagePlus,
    title: "Screenshot upload",
    text: `Drag-and-drop or browse for images — PNG, JPG, JPEG, or WEBP, up to ${MAX_IMAGE_MB} MB.`,
  },
  {
    Icon: ScanText,
    title: "In-browser OCR",
    text: "Text is read on your device first — private, free, multi-language, and zero API tokens spent.",
  },
  {
    Icon: Brain,
    title: "AI task detection",
    text: "Works from clean extracted text and falls back to the image itself — fewer tokens, sharper results.",
  },
  {
    Icon: CalendarClock,
    title: "Smart deadlines",
    text: "Due dates are picked up only when explicit, and the earliest deadline is ranked first.",
  },
  {
    Icon: Target,
    title: "Priority radar",
    text: "High priority wins, then the nearest deadline — so you always see what needs attention first.",
  },
  {
    Icon: ShieldCheck,
    title: "Private & fair",
    text: "Reading stays on your device, and per-device limits keep the shared AI queue fair for everyone.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6 sm:pb-16 scroll-mt-20">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3.5 py-1.5 text-xs font-medium text-muted">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden />
          Features
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Everything you need to stay on track.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Purpose-built for group chats, announcements, and last-minute deadlines
          — and built to fail gracefully when OCR or the AI hiccups.
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