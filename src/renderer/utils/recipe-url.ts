import type { TransformSnapshot } from "../store/transform-store";

const RECIPE_PARAM = "recipe";
const LEGACY_RECIPE_PARAM = "r";
const PRESET_MODES_PARAM = "m";

const toBase64Url = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (encoded: string): string => {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

const roundNumbers = (_key: string, value: unknown): unknown =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(value * 1000) / 1000
    : value;

const readRecipeParam = (params: URLSearchParams): string | null => {
  const current = params.get(RECIPE_PARAM);
  if (current) return current;
  if (params.has(PRESET_MODES_PARAM)) return null;
  return params.get(LEGACY_RECIPE_PARAM);
};

export function encodeRecipe(snapshot: TransformSnapshot): string {
  return toBase64Url(JSON.stringify(snapshot, roundNumbers));
}

export function encodeRecipeUrl(snapshot: TransformSnapshot): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?${RECIPE_PARAM}=${encodeRecipe(snapshot)}`;
}

export function decodeRecipeFromUrl(): Partial<TransformSnapshot> | null {
  const raw = readRecipeParam(new URLSearchParams(window.location.search));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(raw));
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.modes)) {
      return parsed as Partial<TransformSnapshot>;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearRecipeFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(RECIPE_PARAM);
  if (!url.searchParams.has(PRESET_MODES_PARAM)) url.searchParams.delete(LEGACY_RECIPE_PARAM);
  window.history.replaceState({}, "", url.toString());
}
