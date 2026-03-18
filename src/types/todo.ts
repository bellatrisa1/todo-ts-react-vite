export type TodoFilter = "all" | "active" | "completed";
export type TodoPriority = "low" | "medium" | "high";
export type TodoSort = "newest" | "oldest" | "priority-high" | "priority-low";
export type TodoQuickFilter =
  | "all"
  | "overdue"
  | "today"
  | "high-priority"
  | "no-deadline";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: string;
  deadline: string | null;
}
