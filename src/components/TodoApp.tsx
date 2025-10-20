import { useForm } from "react-hook-form";
import { useTodos, type Todo } from "../hooks/useTodos";
import { useState } from "react";
import "../App.scss";

interface FormData {
  text: string;
}

export const TodoApp = () => {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    completedCount,
    totalCount,
  } = useTodos();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const onSubmit = ({ text }: FormData) => {
    if (text.trim()) {
      addTodo(text.trim());
      reset();
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="todo-app">
      <h1>✨TO-DO✨</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="add-form">
        <input
          {...register("text", { required: true })}
          placeholder="Введите описание задачи"
          className="input"
        />
        <button type="submit" className="btn-add">
          Добавить задачу
        </button>
      </form>

      <div className="stats">
        <span>
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          ВСЕ
        </button>
        <button
          className={`filter-btn ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          АКТИВНЫЕ
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          ЗАВЕРШЕННЫЕ
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </ul>

      {completedCount > 0 && (
        <button onClick={clearCompleted} className="btn-clear">
          Удалить всё
        </button>
      )}
    </div>
  );
};

const TodoItem = ({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) => (
  <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={() => onToggle(todo.id)}
      className="checkbox"
    />
    <span className="todo-text">{todo.text}</span>
    <button onClick={() => onDelete(todo.id)} className="btn-delete">
      ×
    </button>
  </li>
);
