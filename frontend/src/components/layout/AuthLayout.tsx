import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  headline?: string;
  subheadline?: string;
}

export function AuthLayout({
  children,
  headline = 'Intelligent Cloud Cost Optimization',
  subheadline = 'Analyze usage, reduce waste, and make smarter infrastructure decisions.',
}: AuthLayoutProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <main className="min-h-screen bg-app flex flex-col md:flex-row items-stretch justify-center relative overflow-hidden">
      {/* Left Image Panel (52% on desktop, 160px banner on mobile) */}
      <div className="relative w-full md:w-[52%] shrink-0 h-[160px] md:h-auto overflow-hidden bg-gradient-to-br from-[#BFE3FF] via-[#EAF5FF] to-[#F4F8FD]">
        {!imageError && (
          <img
            src="/auth-panel.png"
            alt=""
            aria-hidden="true"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center"
          />
        )}

        {/* Readability Veil & Hero Copy on Desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent hidden md:flex flex-col justify-end p-12 text-white">
          <div className="max-w-md">
            <h2 className="font-serif text-3xl lg:text-4xl font-medium tracking-[-0.03em] leading-tight text-white mb-3">
              {headline}
            </h2>
            <p className="text-white/85 text-sm lg:text-base leading-relaxed">
              {subheadline}
            </p>
          </div>
        </div>
      </div>

      {/* Right White Form Panel (Overlapping on Desktop with 28px rounded edge) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 md:px-12 lg:px-16 bg-surface md:-ml-7 md:rounded-l-[28px] z-10 shadow-[-10px_0_30px_rgba(11,31,58,0.06)] min-h-[calc(100vh-160px)] md:min-h-screen">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="inline-block" aria-label="Go to homepage">
              <Logo size="lg" />
            </Link>
          </div>

          {/* Form Content */}
          {children}

          {/* Footer note */}
          <p className="mt-8 text-center text-xs text-muted">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
