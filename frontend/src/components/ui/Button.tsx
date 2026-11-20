import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium select-none rounded-full transition-all duration-150 active:scale-[0.98] disabled:opacity-55 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

    const sizeStyles = {
      md: 'h-[44px] px-6 text-sm gap-2',
      lg: 'h-[56px] px-8 text-base gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-brand-400 to-brand-500 text-white shadow-[0_10px_28px_-8px_rgba(10,139,255,0.55)] hover:brightness-105 hover:-translate-y-[1px]',
      secondary:
        'glass-surface text-ink border border-line hover:brightness-105 hover:-translate-y-[1px] hover:bg-white',
      ghost:
        'bg-transparent text-brand-600 hover:bg-tint hover:-translate-y-[1px]',
      danger:
        'bg-surface text-danger border border-danger hover:bg-danger-bg hover:-translate-y-[1px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
