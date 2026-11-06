import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = 'Success') => addToast({ title, message, type: 'success' }),
    error: (message, title = 'Error') => addToast({ title, message, type: 'error' }),
    warning: (message, title = 'Warning') => addToast({ title, message, type: 'warning' }),
    info: (message, title = 'Info') => addToast({ title, message, type: 'info' })
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let Icon = Info;
          let iconColor = 'text-accent';
          let borderClass = 'border-border';

          if (t.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'text-success';
            borderClass = 'border-success/30';
          } else if (t.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-error';
            borderClass = 'border-error/30';
          } else if (t.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-warning';
            borderClass = 'border-warning/30';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface p-3.5 shadow-md transition-all ${borderClass}`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${iconColor} mt-0.5`} />
              <div className="flex-1">
                {t.title && <h4 className="text-xs font-semibold text-text">{t.title}</h4>}
                <p className="text-xs text-muted mt-0.5">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-muted hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

