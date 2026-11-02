const SECONDS_PER_MINUTE = 60;
const SECONDS_DIGITS = 2;

export const formatMinutesSeconds = (totalSeconds: number): string => {
  const whole = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const seconds = String(whole % SECONDS_PER_MINUTE).padStart(SECONDS_DIGITS, "0");
  return `${minutes}:${seconds}`;
};
