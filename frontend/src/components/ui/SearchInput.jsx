import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({
  value: controlledValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = ''
}) {
  const [innerValue, setInnerValue] = useState(controlledValue || '');

  useEffect(() => {
    setInnerValue(controlledValue || '');
  }, [controlledValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange && innerValue !== controlledValue) {
        onChange(innerValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [innerValue, debounceMs, onChange, controlledValue]);

  return (
    <div className={`relative flex items-center w-full max-w-sm ${className}`}>
      <Search className="absolute left-3.5 h-4 w-4 text-muted pointer-events-none" />
      <input
        type="text"
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-lg border border-border bg-surface pl-10 pr-10 text-sm text-text placeholder:text-muted transition-all duration-150 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-silver focus-visible:border-silver"
      />
      {innerValue && (
        <button
          type="button"
          onClick={() => {
            setInnerValue('');
            if (onChange) onChange('');
          }}
          className="absolute right-3.5 p-1 rounded-md text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;

