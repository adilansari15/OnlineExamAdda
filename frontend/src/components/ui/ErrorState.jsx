import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading content. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  className = ''
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-error/20 bg-error/5 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-text">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs text-muted leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;

