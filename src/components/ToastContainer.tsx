import type { Toast } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: number) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          role="status"
        >
          <span className="toast__message">{toast.message}</span>

          <button
            type="button"
            className="toast__close"
            onClick={() => onClose(toast.id)}
            aria-label="Закрыть уведомление"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
