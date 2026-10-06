"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { GithubIcon } from "./brand-icons";
import { GITHUB_URL } from "@/lib/config";

interface CtaBannerProps {
  onUploadClick: () => void;
}

export function CtaBanner({ onUploadClick }: CtaBannerProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-primary/25 bg-primary/[0.06] px-6 py-12 text-center sm:px-12 sm:py-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        />
        <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Your next deadline is in a screenshot.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
          Open it, snap it, and start from a real list. No account, no install,
          and the screenshot is read on your device.
        </p>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <motion.button
            type="button"
            onClick={onUploadClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong sm:w-auto"
          >
            Snap your first screenshot
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
            View the source
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}