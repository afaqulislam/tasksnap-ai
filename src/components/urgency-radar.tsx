import { motion } from "framer-motion";
import { CheckCircle2, Zap } from "lucide-react";
import type { Task } from "@/lib/types";
import { pickTopTask } from "@/lib/priority";

interface UrgencyRadarProps {
  tasks: Task[];
  completed: Set<number>;
}

export function UrgencyRadar({ tasks, completed }: UrgencyRadarProps) {
  const activeTasks = tasks.filter((_, index) => !completed.has(index));
  const highCount = activeTasks.filter(
    (task) => task.priority === "high",
  ).length;
  const mostUrgent = pickTopTask(activeTasks);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-edge bg-card p-5 sm:p-6"
    >
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <motion.div
          aria-hidden
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 18 }}
          className="relative mx-auto flex size-20 shrink-0 items-center justify-center sm:mx-0"
        >
          <span className="absolute inset-0 animate-radar-sweep rounded-full border border-primary/30" />
          <span className="absolute inset-2 rounded-full border border-primary/25" />
          <span className="absolute inset-4 rounded-full border border-primary/20" />
          <motion.span
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"
          >
            <Zap className="size-5" aria-hidden />
          </motion.span>
        </motion.div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
            <Zap className="size-4 text-primary" aria-hidden />
            Urgency Radar
          </h2>

          {mostUrgent ? (
            <div className="mt-2">
              {highCount > 0 ? (
                <p className="text-sm text-muted">
                  <span className="font-semibold text-foreground">
                    {highCount}
                  </span>{" "}
                  {highCount === 1 ? "task needs" : "tasks need"} attention
                </p>
              ) : (
                <p className="text-sm text-muted">
                  No critical tasks — but stay on top of the list below.
                </p>
              )}
              <div className="mt-3 flex flex-col items-center gap-1.5 sm:items-start">
                <p className="text-base font-semibold">{mostUrgent.title}</p>
                <p className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted sm:justify-start">
                  <span
                    className={`font-medium uppercase tracking-wide ${
                      mostUrgent.priority === "high"
                        ? "text-danger"
                        : mostUrgent.priority === "medium"
                          ? "text-warning"
                          : "text-muted"
                    }`}
                  >
                    {mostUrgent.priority === "high"
                      ? "High priority"
                      : mostUrgent.priority === "medium"
                        ? "Medium priority"
                        : "Low priority"}
                  </span>
                  {mostUrgent.deadline ? (
                    <span>Due {mostUrgent.deadline}</span>
                  ) : null}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-center gap-2 text-success sm:justify-start">
              <CheckCircle2 className="size-4" aria-hidden />
              <span className="text-sm font-medium">
                No urgent tasks detected
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
