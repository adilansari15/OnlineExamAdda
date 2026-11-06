import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  className = ''
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`relative w-full ${maxWidth} rounded-2xl border border-[#414141] dark:border-[#414141] bg-surface dark:bg-[#1A1A1A] p-6 shadow-2xl transition-all z-10 ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 id="modal-title" className="text-lg font-bold font-display text-text tracking-tight">
                {title}
              </h2>
            )}
            {description && <p className="text-xs text-muted mt-1 leading-relaxed">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;

