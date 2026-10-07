"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_MB,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MINUTES,
} from "@/lib/config";

const FAQS = [
  {
    id: "what-is-tasksnap",
    q: "What is TaskSnap AI?",
    a: "TaskSnap AI turns screenshots from WhatsApp, email, Discord, or announcements into actionable tasks with deadlines, priorities, and assignees.",
  },
  {
    id: "is-it-free",
    q: "Is it free to use?",
    a: "Yes — the app is free and open source. Reading the screenshot happens on your device at no cost, and analysis runs on a free AI tier that's more than enough to try it out.",
  },
  {
    id: "data",
    q: "Where does my data go?",
    a: "Text extraction happens on your device. Only that extracted text is sent to the AI provider — the screenshot itself is uploaded just once, to this app, and only when OCR can't read it (so the image can be analyzed directly). There's no account system and nothing is stored by TaskSnap AI.",
  },
  {
    id: "languages",
    q: "Which languages can it read?",
    a: "English out of the box, and Urdu, Arabic, Spanish, German, and 100+ other languages when you enable them in your deployment.",
  },
  {
    id: "formats",
    q: "What image formats are supported?",
    a: `PNG, JPG, JPEG, and WEBP, up to ${MAX_IMAGE_MB} MB. Screenshots are auto-resized to a maximum of ${MAX_IMAGE_DIMENSION}px before analysis to keep things fast and token-friendly.`,
  },
  {
    id: "accuracy",
    q: "How accurate is the extraction?",
    a: "Deadlines, priorities, and assignees are extracted only when they are explicit in the screenshot — the AI never invents details you can act on. Low-confidence OCR text is discarded, and if the image can't be read reliably the app falls back to analyzing it directly.",
  },
  {
    id: "failures",
    q: "What happens if something goes wrong?",
    a: "Every AI request has a timeout, so nothing hangs forever. If Groq is unavailable or rate-limited, TaskSnap automatically retries the Gemini provider when its key is configured — and if neither is available the app shows a clear message instead of failing silently.",
  },
  {
    id: "limits",
    q: "How many screenshots can I analyze?",
    a: `Enough to cover a busy day of group chats. To keep things fair for everyone on the free AI tier, each IP address gets ${RATE_LIMIT_MAX_REQUESTS} analyses per ${RATE_LIMIT_WINDOW_MINUTES}-minute window — if you hit it, the app tells you exactly how long to wait.`,
  },
  {
    id: "api-key",
    q: "Do I need an API key?",
    a: "Not to try it — without an API key the app runs in demo mode and clearly labels its results as samples. Add a free Groq key (or Google Gemini) when you're ready to analyze your own screenshots.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-28 px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="flex flex-col items-center text-center">
        <span className="font-mono-label inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3.5 py-1.5 text-muted">
          <HelpCircle className="size-3.5 text-primary" aria-hidden />
          FAQ
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Frequently asked questions.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Everything you need to know before your first screenshot.
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-3">
        {FAQS.map(({ id, q, a }, index) => {
          const open = openIndex === index;
          return (
            <div
              key={q}
              id={`faq-${id}`}
              className={cn(
                "scroll-mt-28 overflow-hidden rounded-2xl border bg-card transition-colors",
                open ? "border-primary/30" : "border-edge",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold">{q}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted transition-transform",
                    open && "rotate-180 text-primary",
                  )}
                  aria-hidden
                />
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted">
                      {a}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}