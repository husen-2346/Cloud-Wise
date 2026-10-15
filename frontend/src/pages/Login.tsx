
import { useState, type FormEvent } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react';

interface LoginProps {
  onRegister: () => void;
}

export default function Login({ onRegister }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert('Authentication will be connected later.');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1116] px-5 py-10 text-[#e8eef0]">
      <section className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="mb-9 flex items-center justify-center gap-3">
          <img
            src="/logo-icon.svg"
            alt="CloudWise logo"
            className="h-12 w-12 object-contain"
          />

          <span className="text-2xl font-semibold tracking-tight">
            Cloud<span className="text-[#a7f3d0]">Wise</span>
          </span>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/[0.09] bg-[#111a21] p-7 shadow-2xl shadow-black/20 sm:p-9">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-sans text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#91a0aa]">
              Sign in to continue to your cloud cost dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

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
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#d5dde1]"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-[#a7f3d0] transition hover:text-white"
                  onClick={() =>
                    alert('Password recovery will be implemented later.')
                  }
                >
                  Forgot password?
                </button>
              </div>

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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#53616b]"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  aria-pressed={showPassword}
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="shrink-0 text-[#71818c] transition hover:text-[#e8eef0]"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#a7f3d0] py-3 text-sm font-semibold text-[#0b1116] transition hover:bg-[#8de8bf] active:scale-[0.99]"
            >
              Sign in
            </button>
          </form>

          {/* Register Navigation */}
          <p className="mt-7 text-center text-sm text-[#91a0aa]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onRegister}
              className="font-medium text-[#a7f3d0] transition hover:text-white"
            >
              Create account
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
