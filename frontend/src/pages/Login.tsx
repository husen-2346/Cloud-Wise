import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface LoginProps {
  onRegister?: () => void;
  onLogin?: (email: string, password: string) => Promise<string | null>;
}

export default function Login({ onRegister, onLogin }: LoginProps) {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginFn = onLogin || handleLogin;
      const result = await loginFn(email, password);

      if (result) {
        setError(result);
      } else {
        navigate('/app/overview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      headline="Welcome back to CloudWise"
      subheadline="Sign in to your account to monitor cloud costs, detect anomalies and view intelligent savings opportunities."
    >
      <div className="w-full">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-medium text-ink tracking-[-0.03em]">
            Sign in
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Enter your email and password to access your dashboard.
          </p>
        </div>

        {/* Google sign-in button (disabled until OAuth backend exists, no 'Coming soon' badge as per DESIGN.md) */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full h-[48px] rounded-full border border-line bg-surface text-sm font-medium text-muted flex items-center justify-center gap-3 mb-6 opacity-60 cursor-not-allowed select-none"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-line" />
          <span className="text-xs uppercase tracking-[0.14em] text-muted font-semibold">
            Or sign in with email
          </span>
          <div className="flex-1 h-px bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            id="email"
            name="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail size={18} />}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="text-sm font-medium text-ink">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-medium text-brand-600 hover:text-brand-500 transition"
                onClick={() => alert('Password reset is not implemented yet.')}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<LockKeyhole size={18} />}
            />
          </div>

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
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{' '}
          {onRegister ? (
            <button
              type="button"
              onClick={onRegister}
              className="font-medium text-brand-600 hover:text-brand-500 transition"
            >
              Create account
            </button>
          ) : (
            <Link
              to="/register"
              className="font-medium text-brand-600 hover:text-brand-500 transition"
            >
              Create account
            </Link>
          )}
        </p>
      </div>
    </AuthLayout>
  );
}
