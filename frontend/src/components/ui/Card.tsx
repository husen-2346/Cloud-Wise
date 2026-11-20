import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({
  children,
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-[20px] bg-surface border border-line p-6 shadow-[0_1px_2px_rgba(11,31,58,0.04),0_14px_34px_-14px_rgba(11,31,58,0.14)] transition-all duration-200 ${
        interactive ? 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
