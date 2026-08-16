"use client";

import { motion } from "framer-motion";
import { TaskCard } from "./task-card";
import type { Task } from "@/lib/types";

interface TaskListProps {
  tasks: Task[];
  completed: Set<number>;
  onToggle: (index: number) => void;
}

export function TaskList({ tasks, completed, onToggle }: TaskListProps) {
  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task, index) => (
        <motion.div
          key={`${task.title}-${index}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
        >
          <TaskCard
            task={task}
            isCompleted={completed.has(index)}
            onToggle={() => onToggle(index)}
          />
        </motion.div>
      ))}
    </div>
  );
}
