"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "What is TaskSnap AI?",
    a: "TaskSnap AI turns screenshots from WhatsApp, email, Discord, or announcements into actionable tasks with deadlines, priorities, and assignees.",
  },
  {
    q: "Is it free to use?",
    a: "The app is free and open source. Analyzing a screenshot uses your Groq (or Gemini) API key — Groq's free tier offers generous limits to get started.",
  },
  {
    q: "What image formats are supported?",
    a: "PNG, JPG, JPEG, and WEBP, up to 8 MB. Screenshots are auto-resized before analysis to keep things fast and rate-limit friendly.",
  },
  {
    q: "Where does my data go?",
    a: "Screenshots are sent directly to the AI provider (Groq by default) for analysis. TaskSnap AI has no account system and stores nothing — see your provider's privacy policy for their handling.",
  },
  {
    q: "How accurate is the extraction?",
    a: "Deadlines, priorities, and assignees are extracted only when they are explicit in the screenshot — the AI never invents details you can act on.",
  },
  {
    q: "Do I need an API key?",
    a: "Without a key the app runs in demo mode with sample results. Add a free Groq (or Gemini) key to analyze real screenshots in production.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3.5 py-1.5 text-xs font-medium text-muted">
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
        {FAQS.map(({ q, a }, index) => {
          const open = openIndex === index;
          return (
            <div
              key={q}
              className={cn(
                "overflow-hidden rounded-2xl border bg-card transition-colors",
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