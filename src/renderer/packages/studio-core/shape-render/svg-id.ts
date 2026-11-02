const UNSAFE_ID_CHARS = /[^a-zA-Z0-9_-]/g;

export const svgSafeId = (raw: string): string => raw.replace(UNSAFE_ID_CHARS, "");
