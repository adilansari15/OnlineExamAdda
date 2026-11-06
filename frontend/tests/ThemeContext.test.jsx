import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

function TestConsumer() {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="is-dark">{isDark ? 'yes' : 'no'}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to system theme when localStorage is empty', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
  });

  it('updates and persists dark theme on document.documentElement', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Set Dark'));
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('yes');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('toggles theme between dark and light', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Set Light'));
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => {
      fireEvent.click(screen.getByText('Toggle'));
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

