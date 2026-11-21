import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { PasswordStrength } from './components/PasswordStrength';

export default function RegisterPage() {
  const { handleRegisterSuccess } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Full name must not exceed 100 characters.';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (password.length > 72) {
      newErrors.password = 'Password must not exceed 72 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const errorMsg = await handleRegisterSuccess({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (errorMsg) {
        setServerError(errorMsg);
      } else {
        navigate('/login', {
          state: {
            registered: true,
            message: 'Account created. Sign in to continue.',
          },
        });
      }
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the registration server. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      headline="Start Optimizing Cloud Resources"
      subheadline="Create your account to connect your AWS infrastructure, analyze spend, and get actionable AI-driven cost recommendations."
    >
      <div className="w-full">
        {/* Header Section */}
        <div className="mb-[clamp(10px,1.8vh,18px)] max-h-800:mb-2">
          <p className="text-xs uppercase tracking-[0.14em] text-muted font-semibold mb-1">
            GET STARTED
          </p>
          <h1 className="font-serif text-[clamp(28px,4.4vh,40px)] font-normal text-ink tracking-[-0.03em] leading-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted mt-1 max-h-800:mt-0 leading-normal auth-subtitle">
            Start optimizing your cloud costs in minutes.
          </p>
        </div>

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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[clamp(10px,1.8vh,18px)]" noValidate>
          <Input
            label="Full name"
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            maxLength={100}
            value={name}
            onChange={handleNameChange}
            error={errors.name}
            disabled={isSubmitting}
            required
            leftIcon={<User size={18} />}
            containerClassName="auth-input-height"
          />

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
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isSubmitting}
              required
              minLength={8}
              maxLength={72}
              leftIcon={<Lock size={18} />}
              containerClassName="auth-input-height"
            />
            {errors.password ? (
              <p role="alert" className="mt-1 text-xs text-danger">
                {errors.password}
              </p>
            ) : password ? (
              <PasswordStrength password={password} />
            ) : (
              <p className="mt-1 text-xs text-muted">
                At least 8 characters
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            rightIcon={<ArrowRight size={18} />}
            className="w-full font-medium auth-btn-height !h-[48px]"
          >
            Create account
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
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
