interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) {
    return null;
  }

  // Client-side heuristic calculation
  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const varietyCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  let strength: 'weak' | 'medium' | 'strong';
  let label: string;
  let activeBars: number;

  if (length >= 10 && varietyCount >= 3) {
    strength = 'strong';
    label = 'Strong';
    activeBars = 3;
  } else if (length >= 8 && varietyCount >= 2) {
    strength = 'medium';
    label = 'Medium';
    activeBars = 2;
  } else {
    strength = 'weak';
    label = 'Weak';
    activeBars = 1;
  }

  const colorStyles = {
    weak: 'bg-danger text-danger',
    medium: 'bg-warning text-warning',
    strong: 'bg-success text-success',
  };

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex items-center gap-1.5 h-1.5 w-full">
        <div
          className={`h-full flex-1 rounded-full transition-colors duration-200 ${
            activeBars >= 1 ? colorStyles[strength].split(' ')[0] : 'bg-line'
          }`}
        />
        <div
          className={`h-full flex-1 rounded-full transition-colors duration-200 ${
            activeBars >= 2 ? colorStyles[strength].split(' ')[0] : 'bg-line'
          }`}
        />
        <div
          className={`h-full flex-1 rounded-full transition-colors duration-200 ${
            activeBars >= 3 ? colorStyles[strength].split(' ')[0] : 'bg-line'
          }`}
        />
      </div>

      <div className="flex items-center justify-between mt-1 text-[11px]">
        <span className="text-muted">Password strength:</span>
        <span className={`font-medium ${colorStyles[strength].split(' ')[1]}`}>
          {label}
        </span>
      </div>
    </div>
  );
}
