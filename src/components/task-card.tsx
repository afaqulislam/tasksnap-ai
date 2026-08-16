"use client";

import { motion } from "framer-motion";
import { CalendarClock, Check, Undo2, User } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Task } from "@/lib/types";

const PRIORITY_STYLES = {
  high: "border-danger/30 bg-danger/10 text-danger",
  medium: "border-warning/30 bg-warning/10 text-warning",
  low: "border-edge bg-surface text-muted",
} as const;

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
}

export function TaskCard({ task, isCompleted, onToggle }: TaskCardProps) {
  return (
    <motion.article
      animate={{
        opacity: isCompleted ? 0.55 : 1,
        scale: isCompleted ? 0.985 : 1,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group rounded-2xl border bg-card p-5 transition-colors sm:p-6",
        isCompleted ? "border-edge" : "border-edge hover:border-primary/40",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                PRIORITY_STYLES[task.priority],
              )}
            >
              {task.priority}
            </span>
            {isCompleted ? (
              <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-success">
                Done
              </span>
            ) : null}
          </div>
          <h3
            className={cn(
              "mt-2.5 break-words text-base font-semibold",
              isCompleted && "line-through",
            )}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p
              className={cn(
                "mt-1.5 break-words text-sm leading-relaxed text-muted",
                isCompleted && "line-through",
              )}
            >
              {task.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
            {task.deadline ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-3.5 text-primary" aria-hidden />
                Due {task.deadline}
              </span>
            ) : null}
            {task.assignee ? (
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5 text-primary" aria-hidden />
                Assigned to {task.assignee}
              </span>
            ) : null}
          </div>
        </div>
        <motion.button
          type="button"
          onClick={onToggle}
          whileTap={{ scale: 0.95 }}
          aria-pressed={isCompleted}
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition",
            isCompleted
              ? "border-edge bg-surface text-muted hover:text-foreground"
              : "border-transparent bg-success/15 text-success hover:bg-success/25",
          )}
        >
          {isCompleted ? (
            <>
              <Undo2 className="size-4" aria-hidden />
              Undo
            </>
          ) : (
            <>
              <Check className="size-4" aria-hidden />
              Complete
            </>
          )}
        </motion.button>
      </div>
    </motion.article>
  );
}
