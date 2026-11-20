import {
  forwardRef,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  options?: SelectOption[];
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      options,
      children,
      id,
      className = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-ink mb-1.5"
          >
            {label}
          </label>
        )}

        <div
          className={`relative flex items-center h-[48px] rounded-[12px] bg-surface border transition-all duration-150 px-3.5 ${
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

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={`min-w-0 flex-1 appearance-none bg-transparent py-2.5 text-sm text-ink outline-none cursor-pointer pr-6 ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <ChevronDown
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 text-muted"
          />
        </div>

        {error ? (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
