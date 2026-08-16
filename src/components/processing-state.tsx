"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = [
  "Reading content",
  "Finding actionable tasks",
  "Detecting deadlines",
  "Prioritizing tasks",
];

export function ProcessingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-2xl rounded-2xl border border-edge bg-card p-8 sm:p-10"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center text-lg font-semibold"
      >
        Analyzing your screenshot...
      </motion.h2>
      <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-4">
        {STEPS.map((step, index) => (
          <motion.li
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.6, duration: 0.4 }}
            className="flex items-center gap-3 text-sm text-muted"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.5 + index * 0.6,
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
            >
              <Check className="size-3" aria-hidden />
            </motion.span>
            <span>{step}</span>
          </motion.li>
        ))}
      </ul>
      <div className="mx-auto mt-8 max-w-sm">
        <div className="relative h-1 overflow-hidden rounded-full bg-edge">
          <div
            aria-hidden
            className="animate-progress absolute top-0 h-full rounded-full bg-primary"
          />
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          AI is working...
        </p>
      </div>
    </div>
  );
}
