import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const loggedInUser = await login({ email, password });
      toast.success(`Welcome back, ${loggedInUser.fullName}!`);

      if (loggedInUser.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/app/overview';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-text">Sign In</h1>
        <p className="text-xs text-muted">Enter your credentials to access your examinations</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-error/20 bg-error/5 text-error text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="student@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          variant="accent"
          size="md"
          className="w-full mt-2"
          type="submit"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-accent hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
}
