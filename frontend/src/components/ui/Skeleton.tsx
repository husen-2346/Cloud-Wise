interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  radius?: string;
}

export function Skeleton({
  className = '',
  width = '100%',
  height = '20px',
  radius = '8px',
}: SkeletonProps) {
  return (
    <div
      style={{ width, height, borderRadius: radius }}
      className={`relative overflow-hidden bg-line/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent ${className}`}
      aria-hidden="true"
    />
  );
}
