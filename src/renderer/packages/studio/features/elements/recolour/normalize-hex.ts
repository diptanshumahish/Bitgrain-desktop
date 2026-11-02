const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const SHORT_HEX_LENGTH = 4;

export const normalizeHex = (value: unknown): string | null => {
  if (typeof value !== "string" || !HEX_PATTERN.test(value.trim())) return null;
  const hex = value.trim().toLowerCase();
  if (hex.length !== SHORT_HEX_LENGTH) return hex;
  return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
};
