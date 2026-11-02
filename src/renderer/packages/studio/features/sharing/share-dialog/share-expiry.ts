const DAY_MS = 24 * 60 * 60 * 1000;

export const NO_EXPIRY = "never";
export const CURRENT_EXPIRY = "current";

interface ExpiryOption {
  value: string;
  label: string;
  days: number | null;
}

export const EXPIRY_OPTIONS: ExpiryOption[] = [
  { value: NO_EXPIRY, label: "Never expires", days: null },
  { value: "1", label: "Expires in 1 day", days: 1 },
  { value: "7", label: "Expires in 7 days", days: 7 },
  { value: "30", label: "Expires in 30 days", days: 30 },
  { value: "90", label: "Expires in 90 days", days: 90 },
];

export function expiresAtFromOption(value: string, now: number = Date.now()): string | null {
  const option = EXPIRY_OPTIONS.find((candidate) => candidate.value === value);
  if (!option || option.days === null) return null;
  return new Date(now + option.days * DAY_MS).toISOString();
}

export function describeExpiry(expiresAt: string | null, now: number = Date.now()): string {
  if (!expiresAt) return "Never expires";
  const at = new Date(expiresAt);
  if (at.getTime() <= now) return "Expired, pick a new expiry to turn it back on";
  return `Expires ${at.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}
