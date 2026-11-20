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
    <main className="min-h-screen bg-app flex flex-col md:flex-row items-stretch justify-center relative overflow-x-hidden">
      {/* Left Image Panel (52% on desktop, 160px banner on mobile) */}
      <div className="relative w-full md:w-[52%] shrink-0 h-[160px] md:h-auto overflow-hidden bg-gradient-to-br from-[#BFE3FF] via-[#EAF5FF] to-[#F4F8FD]">
        {!imageError && (
          <picture className="w-full h-full">
            <source srcSet="/images/auth-panel.webp" type="image/webp" />
            <img
              src="/auth-panel.png"
              alt=""
              aria-hidden="true"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center"
            />
          </picture>
        )}

        {/* Readability Veil & Hero Copy on Desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent hidden md:flex flex-col justify-end p-8 lg:p-12 text-white">
          <div className="max-w-md">
            <h2 className="font-serif text-2xl lg:text-3xl xl:text-4xl font-normal tracking-[-0.03em] leading-tight text-white mb-2">
              {headline}
            </h2>
            <p className="text-white/90 text-xs lg:text-sm leading-relaxed">
              {subheadline}
            </p>
          </div>
        </div>
      </div>

      {/* Right White Form Panel (Overlapping on Desktop with 28px rounded edge) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 md:px-10 lg:px-12 bg-surface md:-ml-7 md:rounded-l-[28px] z-10 shadow-[-10px_0_30px_rgba(11,31,58,0.06)] min-h-[calc(100vh-160px)] md:min-h-screen overflow-y-auto">
        <div className="w-full max-w-[400px] my-auto py-2">
          {/* Logo */}
          <div className="mb-5">
            <Link to="/" className="inline-block" aria-label="Go to homepage">
              <Logo size="md" />
            </Link>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </main>
  );
}
