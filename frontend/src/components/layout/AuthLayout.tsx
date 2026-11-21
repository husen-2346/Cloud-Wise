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
    <main className="min-h-screen flex flex-col lg:h-dvh lg:flex-row lg:overflow-hidden bg-app relative overflow-x-hidden auth-root-container">
      {/* Left Image Panel (52% on desktop, 160px banner on mobile) */}
      <div className="relative w-full lg:w-[52%] xl:w-[54%] shrink-0 h-[160px] lg:h-full overflow-hidden bg-gradient-to-br from-[#BFE3FF] via-[#EAF5FF] to-[#F4F8FD]">
        {!imageError && (
          <picture className="w-full h-full">
            <source srcSet="/images/auth-panel.png" />
            <img
              src="/images/auth-panel.png"
              alt=""
              aria-hidden="true"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center"
            />
          </picture>
        )}

        {/* Readability Veil & Hero Copy on Desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent hidden lg:flex flex-col justify-end p-8 lg:p-12 text-white">
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
      <div className="w-full lg:w-[48%] xl:w-[46%] flex flex-col justify-center items-center px-6 sm:px-8 lg:px-12 py-[clamp(16px,4vh,48px)] bg-surface lg:-ml-7 lg:rounded-l-[28px] z-10 shadow-[-10px_0_30px_rgba(11,31,58,0.06)] flex-1 lg:flex-none lg:h-full auth-right-container">
        <div className="w-full max-w-[440px] flex flex-col justify-center">
          {/* Logo 28px high with responsive margin bottom */}
          <div className="mb-[clamp(12px,2.5vh,28px)]">
            <Link to="/" className="inline-flex items-center h-7" aria-label="Go to homepage">
              <Logo size="sm" className="h-7 [&_svg]:w-7 [&_svg]:h-7 [&_span]:text-xl" />
            </Link>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </main>
  );
}
