export type Priority = "high" | "medium" | "low";

export interface Task {
  title: string;
  description: string;
  deadline: string | null;
  priority: Priority;
  assignee: string | null;
}

export interface AnalyzeResponse {
  tasks: Task[];
  demo: boolean;
}

export type Phase = "idle" | "selected" | "processing" | "done" | "error";
