import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, LockKeyhole, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface RegisterProps {
  onLogin?: () => void;
  onRegisterSuccess?: (account: {
    name: string;
    email: string;
    password: string;
  }) => Promise<string | null>;
}

export default function Register({ onLogin, onRegisterSuccess }: RegisterProps) {
  const { handleRegisterSuccess: registerContext } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const regFn = onRegisterSuccess || registerContext;
      const result = await regFn({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (result) {
        setError(result);
      } else {
        if (onLogin) {
          onLogin();
        } else {
          navigate('/login');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      headline="Start Optimizing Cloud Resources"
      subheadline="Create your account to connect your AWS infrastructure, analyze spend, and get actionable AI-driven cost recommendations."
    >
      <div className="w-full">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-medium text-ink tracking-[-0.03em]">
            Create account
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Enter your details below to get started with CloudWise.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Alex Morgan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            leftIcon={<UserRound size={18} />}
          />

          <Input
            label="Work email"
            id="email"
            name="email"
            type="email"
            placeholder="alex@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail size={18} />}
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            leftIcon={<LockKeyhole size={18} />}
          />

          <Input
            label="Confirm password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            leftIcon={<LockKeyhole size={18} />}
          />

          {error && (
            <div
              role="alert"
              className="p-3 rounded-[12px] bg-danger-bg border border-danger/20 text-xs text-danger font-medium"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          {onLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="font-medium text-brand-600 hover:text-brand-500 transition"
            >
              Sign in
            </button>
          ) : (
            <Link
              to="/login"
              className="font-medium text-brand-600 hover:text-brand-500 transition"
            >
              Sign in
            </Link>
          )}
        </p>
      </div>
    </AuthLayout>
  );
}
