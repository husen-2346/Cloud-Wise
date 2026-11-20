import type { ReactNode } from 'react';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

export interface StatCardProps {
  label: string;
  value?: string | number | null;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  subtitle?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  subtitle,
  isLoading = false,
  className = '',
}: StatCardProps) {
  const changeStyles = {
    positive: 'text-success bg-success-bg',
    negative: 'text-danger bg-danger-bg',
    neutral: 'text-neutral bg-neutral-bg',
  };

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted select-none">
          {label}
        </span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>

      {isLoading ? (
        <div className="space-y-2 py-1">
          <Skeleton height="32px" width="60%" />
          <Skeleton height="16px" width="40%" />
        </div>
      ) : (
        <>
          <div className="text-[30px] font-semibold text-ink font-sans tracking-tight tabular-nums leading-none mb-2">
            {value ?? '—'}
          </div>

          <div className="flex items-center gap-2 text-xs">
            {change && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${changeStyles[changeType]}`}
              >
                {change}
              </span>
            )}
            {subtitle && <span className="text-muted">{subtitle}</span>}
          </div>
        </>
      )}
    </Card>
  );
}
