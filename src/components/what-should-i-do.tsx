import { motion } from "framer-motion";
import { CalendarClock, Target } from "lucide-react";
import type { Task } from "@/lib/types";
import { pickTopTask } from "@/lib/priority";

interface WhatShouldIDoProps {
  tasks: Task[];
  completed: Set<number>;
}

export function WhatShouldIDo({ tasks, completed }: WhatShouldIDoProps) {
  const activeTasks = tasks.filter((_, index) => !completed.has(index));
  const top = pickTopTask(activeTasks);
  if (!top) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
      className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-5 sm:p-6"
    >
      <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
        <Target className="size-4" aria-hidden />
        What should I do now?
      </h2>
      <div className="mt-3">
        <motion.p
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="text-lg font-semibold"
        >
          {top.title}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted"
        >
          <span
            className={`font-medium capitalize ${
              top.priority === "high"
                ? "text-danger"
                : top.priority === "medium"
                  ? "text-warning"
                  : "text-muted"
            }`}
          >
            {top.priority} priority
          </span>
          {top.deadline ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5 text-primary" aria-hidden />
              Due {top.deadline}
            </span>
          ) : null}
        </motion.p>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-3 text-sm font-medium text-foreground"
      >
        Start with this task.
      </motion.p>
    </motion.section>
  );
}
