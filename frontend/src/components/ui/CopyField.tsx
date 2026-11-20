import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface CopyFieldProps {
  label?: string;
  value: string;
  helperText?: string;
  className?: string;
}

export function CopyField({
  label,
  value,
  helperText,
  className = '',
}: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}

      <div className="flex items-center justify-between gap-3 h-[48px] rounded-[12px] bg-app border border-line px-3.5 transition focus-within:border-brand-500">
        <span className="font-mono text-xs text-ink truncate select-all">
          {value}
        </span>

        <button
          type="button"
          aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-white border border-line rounded-full hover:bg-tint transition shrink-0"
        >
          {copied ? (
            <>
              <Check size={14} className="text-success" />
              <span className="text-success">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {helperText && <p className="mt-1.5 text-xs text-muted">{helperText}</p>}
    </div>
  );
}
