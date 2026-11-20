import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      type = 'text',
      id,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isPassword = type === 'password';
    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink mb-1.5"
          >
            {label}
          </label>
        )}

        <div
          className={`flex items-center h-[48px] rounded-[12px] bg-surface border transition-all duration-150 px-3.5 ${
            error
              ? 'border-danger focus-within:ring-2 focus-within:ring-danger/25'
              : 'border-line focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/25'
          } ${disabled ? 'opacity-55 cursor-not-allowed bg-app' : ''}`}
        >
          {leftIcon && (
            <span className="shrink-0 text-muted mr-2.5 flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            className={`min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
              className="shrink-0 text-muted hover:text-ink transition ml-2 p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error ? (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            role="alert"
            className="mt-1.5 text-xs text-danger"
          >
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
