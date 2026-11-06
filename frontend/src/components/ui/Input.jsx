import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-2 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 pointer-events-none text-muted inline-flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full h-11 rounded-lg border bg-surface px-3.5 text-sm text-text placeholder:text-muted transition-all duration-140 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-silver focus-visible:border-silver disabled:opacity-50 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-error-fg focus-visible:ring-error-fg focus-visible:border-error-fg'
              : 'border-border'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 pointer-events-none text-muted inline-flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-error-fg font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-muted">{helperText}</p>}
    </div>
  );
});

export default Input;

