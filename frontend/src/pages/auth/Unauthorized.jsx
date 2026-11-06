import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function Unauthorized() {
  const { user } = useAuth();
  const returnPath = user?.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/app/overview';

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 text-error mb-4">
        <ShieldX className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Access Restricted (403)</h1>
      <p className="mt-2 max-w-md text-sm text-muted leading-relaxed">
        You do not have the required permissions to view this resource. If you believe this is an error, please contact your platform administrator.
      </p>
      <div className="mt-6">
        <Link to={returnPath}>
          <Button variant="accent" size="md">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

