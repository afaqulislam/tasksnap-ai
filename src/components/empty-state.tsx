import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";

export function EmptyState() {
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
        <ClipboardList className="size-5" aria-hidden />
      </motion.span>
      <h2 className="text-base font-semibold">
        Your extracted tasks will appear here.
      </h2>
      <p className="max-w-sm text-sm text-muted">
        Upload a screenshot and TaskSnap AI will turn it into a clear,
        prioritized list.
      </p>
    </motion.section>
  );
}
