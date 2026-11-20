interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  className?: string;
}

export function Logo({ size = 'md', iconOnly = false, className = '' }: LogoProps) {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-2' },
    md: { icon: 'w-8 h-8', text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', gap: 'gap-3' },
  };

  const { icon, text, gap } = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${gap} select-none ${className}`}>
      {/* Cloud Icon with Blue Gradient */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${icon} shrink-0 transition-transform duration-200 hover:scale-105`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cloudwiseGradient" x1="2" y1="6" x2="30" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5CC4FF" />
            <stop offset="50%" stopColor="#1AB0FF" />
            <stop offset="100%" stopColor="#0A8BFF" />
          </linearGradient>
          <linearGradient id="cloudwiseInner" x1="10" y1="12" x2="26" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Soft cloud outer shape */}
        <path
          d="M9.5 24C6.46 24 4 21.54 4 18.5C4 15.65 6.16 13.31 8.94 13.04C9.53 8.52 13.39 5 18 5C22.69 5 26.6 8.63 27.06 13.26C29.28 14.12 30.5 16.32 30.5 18.75C30.5 21.65 28.15 24 25.25 24H9.5Z"
          fill="url(#cloudwiseGradient)"
        />
        {/* Subtle highlight inner shape */}
        <path
          d="M10.5 22.5C8 22.5 6 20.5 6 18C6 15.7 7.7 13.8 10 13.5C10.5 9.8 13.8 7 17.5 7C21.3 7 24.5 9.9 24.9 13.7C26.8 14.4 28 16.2 28 18.25C28 20.6 26.1 22.5 23.75 22.5H10.5Z"
          fill="url(#cloudwiseInner)"
        />
        {/* Distinctive cloud cut-line */}
        <path
          d="M11 18.5C13 16 16.5 15.5 19.5 17C21.5 18 23.5 17.5 25 16.5"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </svg>

      {!iconOnly && (
        <span className={`font-sans font-semibold tracking-tight text-ink ${text}`}>
          Cloud<span className="text-brand-500">Wise</span>
        </span>
      )}
    </div>
  );
}
