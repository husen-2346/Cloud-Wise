import type { ReactNode } from 'react';

export type BadgeVariant =
  | 'available'
  | 'connected'
  | 'pending'
  | 'coming-soon'
  | 'failed'
  | 'running'
  | 'stopped'
  | 'in-use'
  | 'unattached';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'connected',
  children,
  className = '',
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    available: 'bg-success-bg text-success',
    connected: 'bg-success-bg text-success',
    running: 'bg-success-bg text-success',
    pending: 'bg-warning-bg text-warning',
    unattached: 'bg-warning-bg text-warning',
    failed: 'bg-danger-bg text-danger',
    stopped: 'bg-neutral-bg text-neutral',
    'coming-soon': 'bg-neutral-bg text-neutral',
    'in-use': 'bg-tint text-brand-600',
  };

  const dotStyles: Record<BadgeVariant, string> = {
    available: 'bg-success',
    connected: 'bg-success',
    running: 'bg-success',
    pending: 'bg-warning',
    unattached: 'bg-warning',
    failed: 'bg-danger',
    stopped: 'bg-neutral',
    'coming-soon': 'bg-neutral',
    'in-use': 'bg-brand-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-tight select-none ${variantStyles[variant]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`}
        aria-hidden="true"
      />
      <span>{children}</span>
    </span>
  );
}
