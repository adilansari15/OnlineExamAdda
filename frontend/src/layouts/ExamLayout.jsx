import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Clock, ShieldCheck } from 'lucide-react';

export function ExamLayout() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Persistent Exam Header */}
      <header className="border-b border-border bg-surface px-4 sm:px-8 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-fg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text tracking-tight">Active Assessment</h1>
            <span className="text-[11px] text-muted block -mt-0.5">Online Examination Adda Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {/* Visual timer placeholder */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 font-mono text-sm font-semibold text-text tabular-nums">
            <Clock className="h-4 w-4 text-accent" />
            <span>--:--</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Focus Exam Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export default ExamLayout;

