const UNSAFE_FILE_CHARACTERS = /[\\/:*?"<>|]+/g;
const REPEATED_SPACES = /\s+/g;
const MAX_FILE_NAME_LENGTH = 80;
const FALLBACK_FILE_NAME = "Bitgrain design";

export function toDesignFileName(name: string | undefined): string {
  const cleaned = (name ?? "")
    .replace(UNSAFE_FILE_CHARACTERS, " ")
    .replace(REPEATED_SPACES, " ")
    .trim()
    .slice(0, MAX_FILE_NAME_LENGTH)
    .trim();
  return cleaned || FALLBACK_FILE_NAME;
}

export function toPageFileName(designName: string | undefined, pageNumber: number, pageCount: number): string {
  const base = toDesignFileName(designName);
  return pageCount > 1 ? `${base} page ${pageNumber}` : base;
}
