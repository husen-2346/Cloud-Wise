import type { ReactNode } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}: AlertProps) {
  const variantMap: Record<
    AlertVariant,
    { bg: string; border: string; text: string; icon: ReactNode }
  > = {
    info: {
      bg: 'bg-tint',
      border: 'border-line',
      text: 'text-brand-600',
      icon: <Info size={18} className="text-brand-500 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-success-bg',
      border: 'border-success/20',
      text: 'text-success',
      icon: <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-warning-bg',
      border: 'border-warning/20',
      text: 'text-warning',
      icon: <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-danger-bg',
      border: 'border-danger/20',
      text: 'text-danger',
      icon: <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />,
    },
  };

  const style = variantMap[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-[12px] border ${style.bg} ${style.border} ${className}`}
    >
      {style.icon}
      <div className="flex-1 text-sm text-body min-w-0">
        {title && <h4 className="font-semibold text-ink mb-1">{title}</h4>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={onClose}
          className="text-muted hover:text-ink transition p-1 shrink-0 -mr-1"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
