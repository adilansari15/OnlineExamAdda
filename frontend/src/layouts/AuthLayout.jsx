import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top bar with logo and theme toggle */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-text font-display">ExamAdda</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-silver font-normal">Online Assessment Platform</span>
          </div>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 sm:p-9 shadow-card">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted py-3">
        &copy; {new Date().getFullYear()} Online Examination Adda. Secure, accurate & reliable.
      </footer>
    </div>
  );
}

export default AuthLayout;

