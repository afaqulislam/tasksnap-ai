"use client";

import { motion } from "framer-motion";
import { ArrowDown, AtSign, Mail, Megaphone, MessageSquare } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

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
          className="inline-flex items-center gap-2 rounded-full border border-edge bg-card px-3.5 py-1.5 text-xs font-medium text-muted"
        >
          <SparklesPill />
          AI Task Extractor
        </motion.span>
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
          className="text-balance max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
        >
          Turn messy messages into{" "}
          <span className="bg-gradient-to-r from-primary to-emerald-300 bg-clip-text text-transparent">
            actionable tasks.
          </span>
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
          className="max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg"
        >
          Upload a screenshot from WhatsApp, email, Discord, or any
          announcement. TaskSnap AI extracts tasks, deadlines, priorities, and
          assignees automatically.
        </motion.p>
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.button
            type="button"
            onClick={onUploadClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong"
          >
            Upload Screenshot
            <ArrowDown
              className="size-4 transition-transform group-hover:translate-y-0.5"
              aria-hidden
            />
          </motion.button>
          <p className="text-xs text-muted/80">
            No account required · AI-powered · Takes seconds
          </p>
        </motion.div>
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.32 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted"
        >
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="size-3.5 text-primary" aria-hidden />
            WhatsApp
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="size-3.5 text-primary" aria-hidden />
            Email
          </span>
          <span className="inline-flex items-center gap-1.5">
            <AtSign className="size-3.5 text-primary" aria-hidden />
            Discord
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Megaphone className="size-3.5 text-primary" aria-hidden />
            Announcements
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function SparklesPill() {
  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
    </span>
  );
}
