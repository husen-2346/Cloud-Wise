
import { useState, type FormEvent } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';

interface RegisterProps {
  onLogin: () => void;
  onRegisterSuccess: (account: {
    name: string;
    email: string;
    password: string;
  }) => string | null;
}

export default function Register({ onLogin, onRegisterSuccess }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError('');

  const formData = new FormData(event.currentTarget);
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(
    formData.get('confirmPassword') ?? '',
  );

  if (fullName.length < 2) {
    setError('Please enter your full name.');
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

  const result = onRegisterSuccess({
    name: fullName,
    email,
    password,
  });

  if (result) {
    setError(result);
  }
}


  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1116] px-5 py-10 text-[#e8eef0]">
      <section className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <img
            src="/logo-icon.svg"
            alt="CloudWise logo"
            className="h-12 w-12 object-contain"
          />

          <span className="text-2xl font-semibold tracking-tight">
            Cloud<span className="text-[#a7f3d0]">Wise</span>
          </span>
        </div>

        {/* Registration Card */}
        <div className="rounded-2xl border border-white/[0.09] bg-[#111a21] p-7 shadow-2xl shadow-black/20 sm:p-9">

          {/* Heading */}
          <div className="mb-7">
            <h1 className="font-sans text-3xl font-semibold tracking-tight">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#91a0aa]">
              Start making smarter cloud cost decisions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-[#d5dde1]"
              >
                Full name
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-white/[0.12] bg-[#0b1116] px-3.5 transition focus-within:border-[#a7f3d0]/70">
                <UserRound
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[#71818c]"
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                  minLength={2}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#53616b]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#d5dde1]"
              >
                Email address
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-white/[0.12] bg-[#0b1116] px-3.5 transition focus-within:border-[#a7f3d0]/70">
                <Mail
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[#71818c]"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#53616b]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#d5dde1]"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-white/[0.12] bg-[#0b1116] px-3.5 transition focus-within:border-[#a7f3d0]/70">
                <LockKeyhole
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[#71818c]"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#53616b]"
                />

                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                  className="shrink-0 text-[#71818c] transition hover:text-[#e8eef0]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#d5dde1]"
              >
                Confirm password
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-white/[0.12] bg-[#0b1116] px-3.5 transition focus-within:border-[#a7f3d0]/70">
                <LockKeyhole
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[#71818c]"
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#53616b]"
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  aria-pressed={showConfirmPassword}
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  className="shrink-0 text-[#71818c] transition hover:text-[#e8eef0]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Validation Error */}
            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#a7f3d0] py-3 text-sm font-semibold text-[#0b1116] transition hover:bg-[#8de8bf] active:scale-[0.99]"
            >
              Create account
            </button>
          </form>

          {/* Login Navigation */}
          <p className="mt-6 text-center text-sm text-[#91a0aa]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onLogin}
              className="font-medium text-[#a7f3d0] transition hover:text-white"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#65737d]">
          Intelligent cloud cost analysis, made simpler.
        </p>
      </section>
    </main>
  );
}
