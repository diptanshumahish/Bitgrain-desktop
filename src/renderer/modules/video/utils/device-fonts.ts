import { signal } from "../../../lib/signal";
import { newId } from "./id";
import { putMediaBlob, getMediaBlob } from "./media-blob-store";

export interface DeviceFont {
  family: string;
  blobId: string;
}

const STORAGE_KEY = "imgi-device-fonts";

export const deviceFontsSignal = signal<DeviceFont[]>([]);

export function deviceFontValue(family: string): string {
  return `'${family}'`;
}

function readRegistry(): DeviceFont[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DeviceFont[]) : [];
  } catch {
    return [];
  }
}

function writeRegistry(fonts: DeviceFont[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fonts));
  } catch {
    /* storage unavailable */
  }
}

function familyFromFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim();
  return base.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "Custom Font";
}

function uniqueFamily(base: string, existing: DeviceFont[]): string {
  const names = new Set(existing.map((f) => f.family));
  if (!names.has(base)) return base;
  let counter = 2;
  while (names.has(`${base} ${counter}`)) counter += 1;
  return `${base} ${counter}`;
}

async function addFontFace(family: string, data: ArrayBuffer): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const face = new FontFace(family, data);
  await face.load();
  document.fonts.add(face);
}

export async function registerDeviceFont(file: File): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const existing = deviceFontsSignal.value;
  const family = uniqueFamily(familyFromFileName(file.name), existing);
  const blobId = newId();
  const buffer = await file.arrayBuffer();
  try {
    await addFontFace(family, buffer.slice(0));
  } catch {
    return null;
  }
  await putMediaBlob(blobId, file);
  const next = [...existing, { family, blobId }];
  deviceFontsSignal.value = next;
  writeRegistry(next);
  return deviceFontValue(family);
}

export async function loadDeviceFonts(): Promise<void> {
  const registry = readRegistry();
  if (registry.length === 0) return;
  deviceFontsSignal.value = registry;
  for (const font of registry) {
    const blob = await getMediaBlob(font.blobId);
    if (!blob) continue;
    try {
      await addFontFace(font.family, await blob.arrayBuffer());
    } catch {
      /* skip fonts that fail to decode */
    }
  }
}
