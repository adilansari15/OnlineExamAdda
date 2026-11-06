import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AlertCircle } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side password policy check
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setErrorMessage('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = await register({ fullName, email, password });
      toast.success(`Account created successfully! Welcome, ${newUser.fullName}.`);
      navigate('/app/overview', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-text">Create Account</h1>
        <p className="text-xs text-muted">Join the examination platform to test your skills</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-error/20 bg-error/5 text-error text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
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
          placeholder="At least 8 characters with letters & numbers"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="Minimum 8 characters, must include both letters and numbers."
          required
        />

        <Button
          variant="accent"
          size="md"
          className="w-full mt-2"
          type="submit"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
