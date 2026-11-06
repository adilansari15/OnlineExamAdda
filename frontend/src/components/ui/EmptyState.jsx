import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data to display here.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-surface/50 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-text">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs text-muted leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="accent" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;

