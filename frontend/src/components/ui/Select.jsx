


import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    children,
    className = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-text">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full h-11 appearance-none rounded-lg border bg-surface px-3.5 pr-10 text-sm text-text transition-all duration-150 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-silver focus-visible:border-silver disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-error focus-visible:ring-error/20 focus-visible:border-error'
              : 'border-border'
          } ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface text-text">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-muted">{helperText}</p>}
    </div>
  );
});

export default Select;
