import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  type?: ToastType;
  message: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  type = 'info',
  message,
  description,
  onClose,
  className = '',
}: ToastProps) {
  const icons = {
    success: <CheckCircle2 size={18} className="text-success shrink-0" />,
    error: <AlertCircle size={18} className="text-danger shrink-0" />,
    info: <Info size={18} className="text-brand-500 shrink-0" />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-[16px] bg-white border border-line shadow-card max-w-sm w-full ${className}`}
    >
      {icons[type]}
      <div className="flex-1 text-sm min-w-0">
        <p className="font-semibold text-ink leading-tight">{message}</p>
        {description && (
          <p className="text-xs text-muted mt-1 leading-normal">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Close notification"
          onClick={onClose}
          className="text-muted hover:text-ink transition p-1 shrink-0 -mr-1"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
