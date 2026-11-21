import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { GoogleSignInButton } from './components/GoogleSignInButton';

export default function LoginPage() {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(() => {
    const state = location.state as { registered?: boolean; message?: string } | null;
    if (state?.registered || state?.message) {
      return state.message || 'Account created. Sign in to continue.';
    }
    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clean up router state so it doesn't persist across future page reloads
  useEffect(() => {
    if (successMessage) {
      window.history.replaceState({}, document.title);
    }
  }, [successMessage]);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleForgotPassword = () => {
    setInfoMessage("Password reset isn't available yet.");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setServerError(null);
    setInfoMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const errorMsg = await handleLogin(email, password);

      if (errorMsg) {
        setServerError(errorMsg);
      } else {
        navigate('/app/overview');
      }
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the authentication server. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      headline="Welcome back to CloudWise"
      subheadline="Sign in to your account to monitor cloud costs, detect infrastructure waste, and view AI-driven recommendations."
    >
      <div className="w-full">
        {/* Header Section */}
        <div className="mb-[clamp(12px,2vh,20px)] max-h-800:mb-2.5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted font-semibold mb-1">
            WELCOME BACK
          </p>
          <h1 className="font-serif text-[clamp(28px,4.4vh,40px)] font-normal text-ink tracking-[-0.03em] leading-tight">
            Sign in to CloudWise
          </h1>
          <p className="text-sm text-muted mt-1 max-h-800:mt-0 leading-normal auth-subtitle">
            Continue to your cloud optimization dashboard.
          </p>
        </div>

        {/* Success Alert (e.g. from Registration) - compact single line */}
        {successMessage && (
          <div className="mb-2">
            <Alert
              compact
              variant="success"
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Alert>
          </div>
        )}

        {/* Informational Alert (e.g. Forgot Password) - compact single line */}
        {infoMessage && (
          <div className="mb-2">
            <Alert
              compact
              variant="info"
              onClose={() => setInfoMessage(null)}
            >
              {infoMessage}
            </Alert>
          </div>
        )}

        {/* Backend / Server Error Alert - compact single line */}
        {serverError && (
          <div className="mb-2">
            <Alert
              compact
              variant="error"
              onClose={() => setServerError(null)}
            >
              {serverError}
            </Alert>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[clamp(10px,1.8vh,18px)]" noValidate>
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            error={errors.email}
            disabled={isSubmitting}
            required
            leftIcon={<Mail size={18} />}
            containerClassName="auth-input-height"
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink"
              >
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-brand-600 hover:text-brand-500 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              disabled={isSubmitting}
              required
              leftIcon={<Lock size={18} />}
              containerClassName="auth-input-height"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            rightIcon={<ArrowRight size={18} />}
            className="w-full font-medium auth-btn-height !h-[48px]"
          >
            Sign in
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-[clamp(8px,1.5vh,16px)] auth-divider">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative bg-surface px-3 text-xs uppercase tracking-[0.14em] text-muted font-medium">
            or
          </div>
        </div>

        {/* Google Sign-in Button */}
        <GoogleSignInButton />

        {/* Footer */}
        <p className="mt-[clamp(10px,1.8vh,18px)] text-center text-sm auth-footer text-muted">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:text-brand-500 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
