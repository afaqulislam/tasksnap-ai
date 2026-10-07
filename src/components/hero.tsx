"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  AtSign,
  Gauge,
  Lock,
  Mail,
  Megaphone,
  MessageSquare,
  Star,
} from "lucide-react";
import { GithubIcon } from "./brand-icons";
import { GITHUB_URL } from "@/lib/config";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const BENEFITS = [
  { Icon: Lock, text: "OCR runs in your browser" },
  { Icon: Gauge, text: "Text-first AI — a fraction of the tokens" },
  { Icon: Star, text: "Deadlines only when explicitly stated" },
];

const SOURCES = [
  { Icon: MessageSquare, label: "WhatsApp" },
  { Icon: Mail, label: "Email" },
  { Icon: AtSign, label: "Discord" },
  { Icon: Megaphone, label: "Announcements" },
];

const STATS = [
  { value: "3", label: "steps, start to checklist" },
  { value: "2", label: "AI providers, automatic fallback" },
  { value: "100+", label: "OCR languages supported" },
  { value: "8 MB", label: "max screenshot size" },
];

interface HeroProps {
  onUploadClick: () => void;
}

export function Hero({ onUploadClick }: HeroProps) {
  return (
    <section className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div className="relative flex flex-col items-center gap-6">
        <motion.span
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="font-mono-label inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3.5 py-1.5 text-muted"
        >
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          In-browser OCR · AI task extraction
        </motion.span>
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
          className="text-balance max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
        >
          Every task buried in your chats,{" "}
          <span className="bg-gradient-to-r from-primary to-emerald-300 bg-clip-text text-transparent">
            turned into a checklist.
          </span>
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
          className="max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg"
        >
          Snap a screenshot of any conversation. TaskSnap AI reads the text on
          your device, then extracts every task, deadline, priority, and
          assignee — no typing, no copy-paste.
        </motion.p>
        <motion.ul
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col items-center gap-2 text-sm text-muted sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5"
        >
          {BENEFITS.map(({ Icon, text }) => (
            <li key={text} className="inline-flex items-center gap-2">
              <Icon className="size-4 shrink-0 text-primary" aria-hidden />
              {text}
            </li>
          ))}
        </motion.ul>
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
          className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <motion.button
            type="button"
            onClick={onUploadClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong sm:w-auto"
          >
            Snap a screenshot
            <ArrowDown
              className="size-4 transition-transform group-hover:translate-y-0.5"
              aria-hidden
            />
          </motion.button>
          <motion.a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-edge bg-card px-6 text-sm font-semibold text-muted transition-colors hover:border-primary/40 hover:text-foreground sm:w-auto"
          >
            <GithubIcon className="size-4" />
            Star on GitHub
          </motion.a>
        </motion.div>
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.32 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted"
        >
          <span className="text-muted/70">Works with</span>
          {SOURCES.map(({ Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon className="size-3.5 text-primary" aria-hidden />
              {label}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.dl
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        className="mt-14 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-edge bg-edge sm:grid-cols-4"
      >
        {STATS.map(({ value, label }) => (
          <div key={label} className="bg-card px-4 py-5 text-center">
            <dt className="sr-only">{label}</dt>
            <dd>
              <span className="block text-2xl font-bold tracking-tight text-primary">
                {value}
              </span>
              <span className="mt-1 block text-xs leading-snug text-muted">
                {label}
              </span>
            </dd>
          </div>
        ))}
      </motion.dl>
    </section>
  );
}