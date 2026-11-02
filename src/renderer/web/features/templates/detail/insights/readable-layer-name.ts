const READABLE_NAME = /^[A-Z]?[a-z]+(?: [A-Za-z0-9]+)*$/;
const MIN_READABLE_LENGTH = 5;
const SHORT_WORDS = new Set(["title", "date", "name", "body", "price", "brand", "time", "year", "role", "city", "host", "logo", "quote"]);

export const isReadableLayerName = (name: string): boolean => {
  const trimmed = name.trim();
  if (!READABLE_NAME.test(trimmed)) return false;
  return trimmed.length >= MIN_READABLE_LENGTH || SHORT_WORDS.has(trimmed.toLowerCase());
};
