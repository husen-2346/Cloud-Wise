import { Check } from 'lucide-react';

export interface StepItem {
  id: number | string;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 0-indexed
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className = '',
}: StepperProps) {
  return (
    <div className={`w-full ${className}`}>
      <ol className="flex items-center w-full">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <li
              key={step.id}
              className={`flex items-center ${
                idx !== steps.length - 1 ? 'w-full' : ''
              }`}
            >
              <div
                className={`flex items-center gap-2.5 ${
                  onStepClick && isCompleted ? 'cursor-pointer' : ''
                }`}
                onClick={() => onStepClick && isCompleted && onStepClick(idx)}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold select-none shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-success text-white'
                      : isCurrent
                      ? 'bg-brand-500 text-white shadow-glow'
                      : 'bg-line text-muted'
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : idx + 1}
                </span>

                <div className="hidden sm:block text-left">
                  <span
                    className={`block text-xs font-semibold ${
                      isCurrent
                        ? 'text-brand-600'
                        : isCompleted
                        ? 'text-ink'
                        : 'text-muted'
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="block text-[11px] text-muted">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {idx !== steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    isCompleted ? 'bg-success' : 'bg-line'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
