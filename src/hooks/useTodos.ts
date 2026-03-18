import { useEffect, useMemo, useReducer } from "react";
import type { Todo, TodoPriority } from "../types/todo";

const TODOS_STORAGE_KEY = "todo-app-items";

type TodoAction =
  | {
      type: "add";
      payload: {
        text: string;
        priority: TodoPriority;
        deadline: string | null;
      };
    }
  | { type: "toggle"; payload: { id: number } }
  | { type: "delete"; payload: { id: number } }
  | { type: "clearCompleted" }
  | {
      type: "edit";
      payload: {
        id: number;
        text: string;
        priority: TodoPriority;
        deadline: string | null;
      };
    };

const getInitialTodos = (): Todo[] => {
  const saved = localStorage.getItem(TODOS_STORAGE_KEY);

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as Todo[];

    return parsed.map((todo) => ({
      ...todo,
      deadline: todo.deadline ?? null,
    }));
  } catch {
    return [];
  }
};

const todosReducer = (state: Todo[], action: TodoAction): Todo[] => {
  switch (action.type) {
    case "add": {
      const { text, priority, deadline } = action.payload;
      const normalizedText = text.trim();

      if (!normalizedText) return state;

      const newTodo: Todo = {
        id: Date.now(),
        text: normalizedText,
        completed: false,
        priority,
        createdAt: new Date().toISOString(),
        deadline,
      };

      return [newTodo, ...state];
    }

    case "toggle":
      return state.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, completed: !todo.completed }
          : todo,
      );

    case "delete":
      return state.filter((todo) => todo.id !== action.payload.id);

    case "clearCompleted":
      return state.filter((todo) => !todo.completed);

    case "edit": {
      const normalizedText = action.payload.text.trim();

      if (!normalizedText) return state;

      return state.map((todo) =>
        todo.id === action.payload.id
          ? {
              ...todo,
              text: normalizedText,
              priority: action.payload.priority,
              deadline: action.payload.deadline,
            }
          : todo,
      );
    }

    default:
      return state;
  }
};

export const useTodos = () => {
  const [todos, dispatch] = useReducer(todosReducer, [], getInitialTodos);

  useEffect(() => {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  );

  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  return {
    todos,
    addTodo: (text: string, priority: TodoPriority, deadline: string | null) =>
      dispatch({ type: "add", payload: { text, priority, deadline } }),
    toggleTodo: (id: number) => dispatch({ type: "toggle", payload: { id } }),
    deleteTodo: (id: number) => dispatch({ type: "delete", payload: { id } }),
    clearCompleted: () => dispatch({ type: "clearCompleted" }),
    editTodo: (
      id: number,
      text: string,
      priority: TodoPriority,
      deadline: string | null,
    ) =>
      dispatch({
        type: "edit",
        payload: { id, text, priority, deadline },
      }),
    completedCount,
    activeCount,
    totalCount: todos.length,
  };
};
