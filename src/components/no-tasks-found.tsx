import { motion } from "framer-motion";
import { SearchX } from "lucide-react";

interface NoTasksFoundProps {
  onReset: () => void;
}

export function NoTasksFound({ onReset }: NoTasksFoundProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
        className="flex size-12 items-center justify-center rounded-2xl border border-edge bg-card text-primary"
      >
        <SearchX className="size-5" aria-hidden />
      </motion.span>
      <h2 className="text-lg font-semibold">No actionable tasks found.</h2>
      <p className="max-w-sm text-sm leading-relaxed text-muted">
        Try uploading a screenshot containing assignments, deadlines,
        reminders, or action items.
      </p>
      <motion.button
        type="button"
        onClick={onReset}
        whileTap={{ scale: 0.97 }}
        className="mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition hover:bg-primary-strong"
      >
        Upload Another Screenshot
      </motion.button>
    </motion.section>
  );
}
