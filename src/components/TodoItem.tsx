import { useMemo, useState } from "react";
import type { Todo, TodoPriority } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (
    id: number,
    text: string,
    priority: TodoPriority,
    deadline: string | null,
  ) => void;
}

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

const getDeadlineStatus = (deadline: string | null, completed: boolean) => {
  if (!deadline || completed) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffInMs = deadlineDate.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return { label: "Просрочено", tone: "overdue" as const };
  }

  if (diffInDays === 0) {
    return { label: "Сегодня", tone: "today" as const };
  }

  if (diffInDays <= 3) {
    return { label: "Скоро", tone: "soon" as const };
  }

  return { label: "Запланировано", tone: "planned" as const };
};

export const TodoItem = ({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState<TodoPriority>(todo.priority);
  const [editDeadline, setEditDeadline] = useState(todo.deadline ?? "");

  const handleSave = () => {
    const trimmed = editText.trim();

    if (!trimmed) return;

    onEdit(todo.id, trimmed, editPriority, editDeadline || null);
    setIsEditing(false);
  };

  const formattedDate = new Date(todo.createdAt).toLocaleDateString("ru-RU");

  const formattedDeadline = useMemo(() => {
    if (!todo.deadline) return null;

    return new Date(todo.deadline).toLocaleDateString("ru-RU");
  }, [todo.deadline]);

  const deadlineStatus = getDeadlineStatus(todo.deadline, todo.completed);

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      {isEditing ? (
        <div className="todo-item__edit todo-item__edit--extended">
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="input"
          />

          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as TodoPriority)}
            className="select"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>

          <input
            type="date"
            value={editDeadline}
            onChange={(e) => setEditDeadline(e.target.value)}
            className="input"
          />

          <div className="todo-item__actions">
            <button type="button" className="icon-btn" onClick={handleSave}>
              Сохранить
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setEditText(todo.text);
                setEditPriority(todo.priority);
                setEditDeadline(todo.deadline ?? "");
                setIsEditing(false);
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <>
          <label className="todo-item__main">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              className="checkbox"
            />

            <div className="todo-item__content">
              <span className="todo-text">{todo.text}</span>

              <div className="todo-meta">
                <span
                  className={`priority-badge priority-badge--${todo.priority}`}
                >
                  {PRIORITY_LABELS[todo.priority]}
                </span>

                <span className="todo-date">Создано: {formattedDate}</span>

                {formattedDeadline && (
                  <span className="todo-date">
                    Дедлайн: {formattedDeadline}
                  </span>
                )}

                {deadlineStatus && (
                  <span
                    className={`deadline-badge deadline-badge--${deadlineStatus.tone}`}
                  >
                    {deadlineStatus.label}
                  </span>
                )}
              </div>
            </div>
          </label>

          <div className="todo-item__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setIsEditing(true)}
            >
              Редактировать
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => onDelete(todo.id)}
            >
              Удалить
            </button>
          </div>
        </>
      )}
    </li>
  );
};
