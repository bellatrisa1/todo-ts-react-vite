import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTodos } from "../hooks/useTodos";
import { useToast } from "../hooks/useToast";
import { TodoItem } from "./TodoItem";
import { ToastContainer } from "./ToastContainer";
import type {
  TodoFilter,
  TodoPriority,
  TodoQuickFilter,
  TodoSort,
} from "../types/todo";
import "../App.scss";

interface FormData {
  text: string;
  priority: TodoPriority;
  deadline: string;
}

const FILTER_LABELS: Record<TodoFilter, string> = {
  all: "Все",
  active: "Активные",
  completed: "Завершённые",
};

const SORT_LABELS: Record<TodoSort, string> = {
  newest: "Сначала новые",
  oldest: "Сначала старые",
  "priority-high": "Сначала высокий приоритет",
  "priority-low": "Сначала низкий приоритет",
};

const QUICK_FILTER_LABELS: Record<TodoQuickFilter, string> = {
  all: "Все задачи",
  overdue: "Просроченные",
  today: "На сегодня",
  "high-priority": "Высокий приоритет",
  "no-deadline": "Без дедлайна",
};

const PRIORITY_ORDER: Record<TodoPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const STORAGE_KEYS = {
  filter: "todo-ui-filter",
  quickFilter: "todo-ui-quick-filter",
  sort: "todo-ui-sort",
  search: "todo-ui-search",
} as const;

const isTodoFilter = (value: string): value is TodoFilter => {
  return ["all", "active", "completed"].includes(value);
};

const isTodoQuickFilter = (value: string): value is TodoQuickFilter => {
  return ["all", "overdue", "today", "high-priority", "no-deadline"].includes(
    value,
  );
};

const isTodoSort = (value: string): value is TodoSort => {
  return ["newest", "oldest", "priority-high", "priority-low"].includes(value);
};

const getInitialFilter = (): TodoFilter => {
  const saved = localStorage.getItem(STORAGE_KEYS.filter);
  return saved && isTodoFilter(saved) ? saved : "all";
};

const getInitialQuickFilter = (): TodoQuickFilter => {
  const saved = localStorage.getItem(STORAGE_KEYS.quickFilter);
  return saved && isTodoQuickFilter(saved) ? saved : "all";
};

const getInitialSort = (): TodoSort => {
  const saved = localStorage.getItem(STORAGE_KEYS.sort);
  return saved && isTodoSort(saved) ? saved : "newest";
};

const getInitialSearch = (): string => {
  return localStorage.getItem(STORAGE_KEYS.search) ?? "";
};

const isToday = (date: string) => {
  const today = new Date();
  const target = new Date(date);

  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
};

const isOverdue = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return target.getTime() < today.getTime();
};

export const TodoApp = () => {
  const [filter, setFilter] = useState<TodoFilter>(getInitialFilter);
  const [quickFilter, setQuickFilter] = useState<TodoQuickFilter>(
    getInitialQuickFilter,
  );
  const [search, setSearch] = useState<string>(getInitialSearch);
  const [sort, setSort] = useState<TodoSort>(getInitialSort);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      text: "",
      priority: "medium",
      deadline: "",
    },
  });

  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    editTodo,
    completedCount,
    activeCount,
    totalCount,
  } = useTodos();

  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filter, filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.quickFilter, quickFilter);
  }, [quickFilter]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sort, sort);
  }, [sort]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.search, search);
  }, [search]);

  const handleAddTodo = ({ text, priority, deadline }: FormData) => {
    addTodo(text, priority, deadline || null);

    reset({
      text: "",
      priority: "medium",
      deadline: "",
    });

    showToast("Задача успешно добавлена", "success");
  };

  const handleDeleteTodo = (id: number) => {
    deleteTodo(id);
    showToast("Задача удалена", "warning");
  };

  const handleEditTodo = (
    id: number,
    text: string,
    priority: TodoPriority,
    deadline: string | null,
  ) => {
    editTodo(id, text, priority, deadline);
    showToast("Задача обновлена", "info");
  };

  const handleClearCompleted = () => {
    clearCompleted();
    showToast("Выполненные задачи очищены", "warning");
  };

  const overdueCount = useMemo(() => {
    return todos.filter(
      (todo) => !todo.completed && todo.deadline && isOverdue(todo.deadline),
    ).length;
  }, [todos]);

  const todayCount = useMemo(() => {
    return todos.filter(
      (todo) => !todo.completed && todo.deadline && isToday(todo.deadline),
    ).length;
  }, [todos]);

  const highPriorityCount = useMemo(() => {
    return todos.filter((todo) => !todo.completed && todo.priority === "high")
      .length;
  }, [todos]);

  const withoutDeadlineCount = useMemo(() => {
    return todos.filter((todo) => !todo.completed && !todo.deadline).length;
  }, [todos]);

  const filteredTodos = useMemo(() => {
    const filtered = todos
      .filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
      })
      .filter((todo) => {
        switch (quickFilter) {
          case "overdue":
            return (
              !todo.completed &&
              Boolean(todo.deadline) &&
              isOverdue(todo.deadline!)
            );
          case "today":
            return (
              !todo.completed &&
              Boolean(todo.deadline) &&
              isToday(todo.deadline!)
            );
          case "high-priority":
            return !todo.completed && todo.priority === "high";
          case "no-deadline":
            return !todo.completed && !todo.deadline;
          case "all":
          default:
            return true;
        }
      })
      .filter((todo) =>
        todo.text.toLowerCase().includes(search.trim().toLowerCase()),
      );

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "priority-high":
          return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        case "priority-low":
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [todos, filter, quickFilter, search, sort]);

  const progress = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  return (
    <main className="page">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <section className="todo-app">
        <header className="todo-app__hero">
          <div className="todo-app__hero-content">
            <p className="todo-app__eyebrow">Панель управления задачами</p>
            <h1 className="todo-app__title">Мои задачи</h1>
            <p className="todo-app__subtitle">
              Управляйте задачами, отслеживайте прогресс и держите фокус на
              важных сроках.
            </p>
          </div>

          <div className="todo-app__hero-side">
            <div className="progress-card">
              <div className="progress-card__top">
                <span className="progress-card__label">Общий прогресс</span>
                <strong className="progress-card__value">{progress}%</strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="progress-card__text">
                Выполнено {completedCount} из {totalCount} задач
              </p>
            </div>
          </div>
        </header>

        <section className="summary-grid">
          <div className="summary-card">
            <span className="summary-card__label">Всего</span>
            <strong className="summary-card__value">{totalCount}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-card__label">Активных</span>
            <strong className="summary-card__value">{activeCount}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-card__label">Выполнено</span>
            <strong className="summary-card__value">{completedCount}</strong>
          </div>
        </section>

        <section className="analytics-grid">
          <button
            type="button"
            className={`analytics-card analytics-card--danger ${
              quickFilter === "overdue" ? "analytics-card--active" : ""
            }`}
            onClick={() =>
              setQuickFilter((prev) => (prev === "overdue" ? "all" : "overdue"))
            }
          >
            <span className="analytics-card__label">Просрочено</span>
            <strong className="analytics-card__value">{overdueCount}</strong>
            <p className="analytics-card__text">Задачи с истёкшим сроком</p>
          </button>

          <button
            type="button"
            className={`analytics-card analytics-card--info ${
              quickFilter === "today" ? "analytics-card--active" : ""
            }`}
            onClick={() =>
              setQuickFilter((prev) => (prev === "today" ? "all" : "today"))
            }
          >
            <span className="analytics-card__label">На сегодня</span>
            <strong className="analytics-card__value">{todayCount}</strong>
            <p className="analytics-card__text">Нужно выполнить сегодня</p>
          </button>

          <button
            type="button"
            className={`analytics-card analytics-card--accent ${
              quickFilter === "high-priority" ? "analytics-card--active" : ""
            }`}
            onClick={() =>
              setQuickFilter((prev) =>
                prev === "high-priority" ? "all" : "high-priority",
              )
            }
          >
            <span className="analytics-card__label">Высокий приоритет</span>
            <strong className="analytics-card__value">
              {highPriorityCount}
            </strong>
            <p className="analytics-card__text">
              Требуют внимания в первую очередь
            </p>
          </button>

          <button
            type="button"
            className={`analytics-card analytics-card--muted ${
              quickFilter === "no-deadline" ? "analytics-card--active" : ""
            }`}
            onClick={() =>
              setQuickFilter((prev) =>
                prev === "no-deadline" ? "all" : "no-deadline",
              )
            }
          >
            <span className="analytics-card__label">Без дедлайна</span>
            <strong className="analytics-card__value">
              {withoutDeadlineCount}
            </strong>
            <p className="analytics-card__text">Можно уточнить сроки позже</p>
          </button>
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Добавить задачу</h2>
            <p className="panel__subtitle">
              Создайте новую задачу, задайте приоритет и при необходимости
              укажите дедлайн.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleAddTodo)}
            className="add-form add-form--extended"
          >
            <div className="field">
              <input
                {...register("text", {
                  required: "Введите текст задачи",
                  minLength: {
                    value: 3,
                    message: "Минимум 3 символа",
                  },
                })}
                placeholder="Например: Подготовить новый раздел портфолио"
                className={`input ${errors.text ? "input--error" : ""}`}
              />
              {errors.text && (
                <span className="field__error">{errors.text.message}</span>
              )}
            </div>

            <select {...register("priority")} className="select">
              <option value="low">Низкий приоритет</option>
              <option value="medium">Средний приоритет</option>
              <option value="high">Высокий приоритет</option>
            </select>

            <input type="date" {...register("deadline")} className="input" />

            <button type="submit" className="btn btn--primary">
              Добавить задачу
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel__header panel__header--row">
            <div>
              <h2 className="panel__title">Список задач</h2>
              <p className="panel__subtitle">
                Фильтруйте, ищите, сортируйте и следите за сроками выполнения.
              </p>
            </div>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleClearCompleted}
              disabled={completedCount === 0}
            >
              Очистить выполненные
            </button>
          </div>

          <div className="toolbar toolbar--stacked">
            <div className="filters">
              {(Object.keys(FILTER_LABELS) as TodoFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-btn ${filter === item ? "active" : ""}`}
                  onClick={() => setFilter(item)}
                >
                  {FILTER_LABELS[item]}
                </button>
              ))}
            </div>

            <div className="toolbar__right">
              <input
                type="text"
                placeholder="Поиск по задачам..."
                className="input input--search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="select select--compact"
                value={sort}
                onChange={(e) => setSort(e.target.value as TodoSort)}
              >
                {(Object.keys(SORT_LABELS) as TodoSort[]).map((item) => (
                  <option key={item} value={item}>
                    {SORT_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {quickFilter !== "all" && (
            <div className="active-quick-filter">
              <span className="active-quick-filter__label">
                Быстрый фильтр:{" "}
                <strong>{QUICK_FILTER_LABELS[quickFilter]}</strong>
              </span>

              <button
                type="button"
                className="active-quick-filter__reset"
                onClick={() => setQuickFilter("all")}
              >
                Сбросить
              </button>
            </div>
          )}

          {filteredTodos.length ? (
            <ul className="todo-list">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={handleDeleteTodo}
                  onEdit={handleEditTodo}
                />
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🗂️</div>
              <h3 className="empty-state__title">Ничего не найдено</h3>
              <p className="empty-state__text">
                Попробуйте изменить фильтр, сортировку или поисковый запрос.
              </p>
            </div>
          )}
        </section>

        <footer className="todo-app__footer">
          <span>Осталось задач: {activeCount}</span>
          <span>Выполнено: {completedCount}</span>
          <span>Всего задач: {totalCount}</span>
        </footer>
      </section>
    </main>
  );
};
