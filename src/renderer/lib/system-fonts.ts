import { signal } from "./signal";
import type { CustomFontEntry } from "../data/studioTypes";

const ENABLED_KEY = "imgi-system-fonts-enabled";
const SYSTEM_FONTS_GROUP = "System fonts";

interface LocalFontData {
  family: string;
}

export type LoadSystemFontsResult =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "denied" };

// systemFontOptionsSignal holds the OS fonts the user has granted access to, so any picker can
// surface them without re-querying. Empty until the user enables system fonts at least once.
export const systemFontOptionsSignal = signal<CustomFontEntry[]>([]);
export const systemFontsLoadingSignal = signal(false);

export function isSystemFontsSupported(): boolean {
  return typeof window !== "undefined" && "queryLocalFonts" in window;
}

function rememberEnabled(): void {
  try {
    localStorage.setItem(ENABLED_KEY, "true");
  } catch {
    /* storage unavailable */
  }
}

function wasEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

function toFontEntries(fonts: LocalFontData[]): CustomFontEntry[] {
  const seen = new Set<string>();
  const entries: CustomFontEntry[] = [];
  for (const font of fonts) {
    if (seen.has(font.family)) continue;
    seen.add(font.family);
    entries.push({
      label: font.family,
      value: `'${font.family}', sans-serif`,
      group: SYSTEM_FONTS_GROUP,
    });
  }
  return entries.sort((a, b) => a.label.localeCompare(b.label));
}

async function queryFonts(): Promise<CustomFontEntry[]> {
  // @ts-expect-error queryLocalFonts is a modern/experimental API
  const fonts = (await window.queryLocalFonts()) as LocalFontData[];
  return toFontEntries(fonts);
}

async function permissionGranted(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.permissions) return false;
  try {
    const status = await navigator.permissions.query({
      // @ts-expect-error local-fonts is a modern permission name
      name: "local-fonts",
    });
    return status.state === "granted";
  } catch {
    return false;
  }
}

export async function loadSystemFonts(): Promise<LoadSystemFontsResult> {
  if (!isSystemFontsSupported()) return { ok: false, reason: "unsupported" };
  try {
    systemFontsLoadingSignal.value = true;
    systemFontOptionsSignal.value = await queryFonts();
    rememberEnabled();
    return { ok: true };
  } catch {
    return { ok: false, reason: "denied" };
  } finally {
    systemFontsLoadingSignal.value = false;
  }
}

// ensureSystemFontsLoaded silently restores OS fonts the user previously enabled, but only when the
// browser still reports the permission as granted, so we never trigger a fresh permission prompt.
export async function ensureSystemFontsLoaded(): Promise<void> {
  if (systemFontOptionsSignal.value.length > 0) return;
  if (!isSystemFontsSupported() || !wasEnabled()) return;
  if (!(await permissionGranted())) return;
  try {
    systemFontOptionsSignal.value = await queryFonts();
  } catch {
    /* permission revoked between check and query */
  }
}
