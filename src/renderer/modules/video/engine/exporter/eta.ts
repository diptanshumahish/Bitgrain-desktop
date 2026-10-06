const MIN_RATIO_FOR_ETA = 0.02;

export function computeEtaSeconds(
  ratio: number,
  startedAt: number | null,
  now: number = Date.now(),
): number | null {
  if (startedAt === null) return null;
  if (ratio <= MIN_RATIO_FOR_ETA) return null;
  const elapsed = (now - startedAt) / 1000;
  if (elapsed <= 0) return null;
  const total = elapsed / ratio;
  const remaining = total - elapsed;
  if (!Number.isFinite(remaining) || remaining < 0) return null;
  return remaining;
}

export function formatEta(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  if (minutes < 60) return `${minutes}m ${remaining.toString().padStart(2, "0")}s`;
  const hours = Math.floor(minutes / 60);
  const minutesRemainder = minutes % 60;
  return `${hours}h ${minutesRemainder.toString().padStart(2, "0")}m`;
}
