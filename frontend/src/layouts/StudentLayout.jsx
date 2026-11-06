import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Compass,
  History,
  BarChart3,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: 'Overview', to: '/app/overview', icon: LayoutDashboard },
  { label: 'Explore Quizzes', to: '/app/quizzes', icon: Compass },
  { label: 'My Attempts', to: '/app/attempts', icon: History },
  { label: 'Performance', to: '/app/performance', icon: BarChart3 },
  { label: 'My Profile', to: '/app/profile', icon: User }
];

export function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const item = navItems.find((n) => location.pathname.startsWith(n.to));
    return item ? item.label : 'Student Portal';
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'S';

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between border-b border-[#D8D8D8] dark:border-[#2E2E2E] bg-surface dark:bg-[#101010] px-4 h-16 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-fg shadow-xs">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-text font-display">ExamAdda</span>
            <span className="text-[10px] text-muted block -mt-0.5">Student</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-muted hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop 248px + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[248px] border-r border-[#D8D8D8] dark:border-[#303030] bg-surface dark:bg-[#101010] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Brand header */}
            <div className="h-[72px] px-5 border-b border-[#D8D8D8] dark:border-[#303030] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-xs">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-text tracking-tight font-display">ExamAdda</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-2 dark:bg-[#202020] text-silver border border-border">STUDENT</span>
                  </div>
                  <span className="text-[11px] text-muted block mt-0.5">Online Examination</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-md text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="px-3 py-4">
              <p className="px-3 pb-2 text-[10px] font-bold text-muted uppercase tracking-wider">Overview & Exams</p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-surface-2 dark:bg-[#252525] text-text dark:text-white font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-primary'
                            : 'text-muted dark:text-[#A0A0A0] hover:text-text dark:hover:text-white hover:bg-surface-2 dark:hover:bg-[#1E1E1E]'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#D8D8D8] dark:border-[#303030] space-y-3 bg-surface-2/40 dark:bg-[#101010]">
            {/* User profile card */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface dark:bg-[#171717] border border-border shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 dark:bg-[#252525] text-text dark:text-white text-xs font-bold shrink-0 border border-border">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text truncate">{user?.fullName || 'Student'}</p>
                <p className="text-[10px] text-muted truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-error hover:bg-error/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex items-center justify-between border-b border-[#D8D8D8] dark:border-[#2E2E2E] bg-surface/90 dark:bg-[#101010]/95 backdrop-blur-md px-8 h-[72px] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-medium">ExamAdda</span>
            <span className="text-muted/40">/</span>
            <h2 className="text-sm font-semibold text-text tracking-tight font-display">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-2 dark:bg-[#171717] border border-border text-xs text-text">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-text">{user?.fullName || 'Student'}</span>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-2xs"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default StudentLayout;
