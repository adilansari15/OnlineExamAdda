import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex gap-4">
        {isDanger && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-text">{title}</h3>
          <p className="text-sm text-muted leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? 'danger' : 'accent'}
          size="md"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

