import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`inline-flex items-center rounded-lg border border-border bg-surface-2 p-0.5 shadow-2xs ${className}`}>
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light theme"
        className={`rounded-md p-1.5 transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-surface text-text shadow-xs font-semibold'
            : 'text-muted hover:text-text'
        }`}
        aria-label="Light mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark theme"
        className={`rounded-md p-1.5 transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-surface text-text shadow-xs font-semibold'
            : 'text-muted hover:text-text'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        title="System default"
        className={`rounded-md p-1.5 transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-surface text-text shadow-xs font-semibold'
            : 'text-muted hover:text-text'
        }`}
        aria-label="System mode"
      >
        <Laptop className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default ThemeToggle;

