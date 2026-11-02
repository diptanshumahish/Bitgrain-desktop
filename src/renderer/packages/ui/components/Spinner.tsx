interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner = ({ size = 14, className = "" }: SpinnerProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`animate-spin ${className}`}
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeOpacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);
