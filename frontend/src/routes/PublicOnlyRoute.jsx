import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'ROLE_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/app/overview" replace />;
  }

  return children ? children : <Outlet />;
}

export default PublicOnlyRoute;

