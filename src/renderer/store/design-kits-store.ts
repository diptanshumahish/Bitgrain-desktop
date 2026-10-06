import { signal, useSignalValue } from "../lib/signal";
import { userSignal } from "../hooks/useAuth";
import type {
  DesignKit,
  ColorVariable,
  TextStyleVariable,
  NumberToken,
} from "../data/design-kit-types";
import { DEFAULT_KIT, STARTER_KIT_ID, createEmptyKit } from "../data/design-kit-types";
import {
  fetchDesignKits,
  pushDesignKit,
  deleteDesignKitRemote,
} from "../lib/design-kits-api";
import { trackEvent as trackPosthog } from "../lib/analytics";
import type { EventName } from "../lib/analytics";
import { trackEvent as trackBackend } from "../lib/tracker";

const STORAGE_KEY = "bitgrain_design_kits";

export const trackKit = (name: EventName, details?: Record<string, unknown>): void => {
  trackPosthog(name, details);
  trackBackend("studio", name.replace("studio_", ""), { details });
};

export const designKitsSignal = signal<DesignKit[]>([]);
export const activeKitIdSignal = signal<string | null>(null);

interface StoredShape {
  kits: DesignKit[];
  activeKitId: string | null;
}

const persist = (): void => {
  try {
    const payload: StoredShape = {
      kits: designKitsSignal.value,
      activeKitId: activeKitIdSignal.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
};

const readLocal = (): StoredShape | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredShape) : null;
  } catch {
    return null;
  }
};

let loaded = false;

const cloneStarter = (): DesignKit => JSON.parse(JSON.stringify(DEFAULT_KIT));

const ensureStarterKit = (): void => {
  if (designKitsSignal.value.some((kit) => kit.id === STARTER_KIT_ID)) return;
  const starter = cloneStarter();
  designKitsSignal.value = [starter, ...designKitsSignal.value];
  if (!activeKitIdSignal.value) activeKitIdSignal.value = starter.id;
  persist();
  if (userSignal.value) pushDesignKit(starter);
};

export const loadDesignKits = (): void => {
  if (loaded) return;
  loaded = true;
  const stored = readLocal();
  if (stored && stored.kits.length > 0) {
    designKitsSignal.value = stored.kits;
    activeKitIdSignal.value = stored.activeKitId ?? stored.kits[0].id;
  } else {
    designKitsSignal.value = [cloneStarter()];
    activeKitIdSignal.value = STARTER_KIT_ID;
    persist();
  }
  if (userSignal.value) {
    fetchDesignKits().then((remote) => {
      if (remote && remote.length > 0) {
        designKitsSignal.value = remote;
        if (!remote.some((kit) => kit.id === activeKitIdSignal.value)) {
          activeKitIdSignal.value = remote[0].id;
        }
        persist();
      }
      // empty array = new account; null = backend unreachable (keep local).
      if (remote) ensureStarterKit();
    });
  }
};

export const activeKit = (): DesignKit | null =>
  designKitsSignal.value.find((kit) => kit.id === activeKitIdSignal.value) ?? null;

export const useActiveKit = (): DesignKit | null => {
  const kits = useSignalValue(designKitsSignal);
  const activeId = useSignalValue(activeKitIdSignal);
  return kits.find((kit) => kit.id === activeId) ?? null;
};

const REMOTE_SYNC_DELAY_MS = 1500;
const remoteTimers = new Map<string, ReturnType<typeof setTimeout>>();

const syncRemote = (kit: DesignKit): void => {
  if (!userSignal.value) return;
  const pending = remoteTimers.get(kit.id);
  if (pending) clearTimeout(pending);
  remoteTimers.set(
    kit.id,
    setTimeout(() => {
      remoteTimers.delete(kit.id);
      pushDesignKit(kit);
    }, REMOTE_SYNC_DELAY_MS),
  );
};

const replaceKit = (next: DesignKit): void => {
  const stamped = { ...next, updatedAt: Date.now() };
  designKitsSignal.value = designKitsSignal.value.map((kit) =>
    kit.id === stamped.id ? stamped : kit,
  );
  persist();
  syncRemote(stamped);
};

const mutateActive = (fn: (kit: DesignKit) => DesignKit): void => {
  const current = activeKit();
  if (current) replaceKit(fn(current));
};

export const createKit = (name: string): void => {
  const kit = createEmptyKit(name.trim() || "Untitled kit");
  designKitsSignal.value = [...designKitsSignal.value, kit];
  activeKitIdSignal.value = kit.id;
  persist();
  syncRemote(kit);
  trackKit("studio_kit_created", { name: kit.name });
};

export const renameKit = (id: string, name: string): void => {
  designKitsSignal.value = designKitsSignal.value.map((kit) =>
    kit.id === id ? { ...kit, name: name.trim() || kit.name, updatedAt: Date.now() } : kit,
  );
  persist();
  const updated = designKitsSignal.value.find((kit) => kit.id === id);
  if (updated) syncRemote(updated);
};

export const deleteKit = (id: string): void => {
  const next = designKitsSignal.value.filter((kit) => kit.id !== id);
  designKitsSignal.value = next.length > 0 ? next : [cloneStarter()];
  if (activeKitIdSignal.value === id) {
    activeKitIdSignal.value = designKitsSignal.value[0]?.id ?? null;
  }
  persist();
  if (userSignal.value) deleteDesignKitRemote(id);
  trackKit("studio_kit_deleted");
};

export const setActiveKit = (id: string): void => {
  activeKitIdSignal.value = id;
  persist();
};

export const registerKit = (kit: DesignKit): void => {
  const exists = designKitsSignal.value.some((existing) => existing.id === kit.id);
  designKitsSignal.value = exists
    ? designKitsSignal.value.map((existing) => (existing.id === kit.id ? kit : existing))
    : [...designKitsSignal.value, kit];
  activeKitIdSignal.value = kit.id;
  persist();
  syncRemote(kit);
};

export const addColor = (color: ColorVariable): void => {
  mutateActive((kit) => ({ ...kit, colors: [...kit.colors, color] }));
  trackKit("studio_kit_token_added", { token: "color" });
};
export const updateColor = (id: string, updates: Partial<ColorVariable>): void =>
  mutateActive((kit) => ({
    ...kit,
    colors: kit.colors.map((color) => (color.id === id ? { ...color, ...updates } : color)),
  }));
export const removeColor = (id: string): void =>
  mutateActive((kit) => ({ ...kit, colors: kit.colors.filter((color) => color.id !== id) }));

export const addTextStyle = (style: TextStyleVariable): void => {
  mutateActive((kit) => ({ ...kit, textStyles: [...kit.textStyles, style] }));
  trackKit("studio_kit_token_added", { token: "text_style" });
};
export const updateTextStyle = (id: string, updates: Partial<TextStyleVariable>): void =>
  mutateActive((kit) => ({
    ...kit,
    textStyles: kit.textStyles.map((style) => (style.id === id ? { ...style, ...updates } : style)),
  }));
export const removeTextStyle = (id: string): void =>
  mutateActive((kit) => ({ ...kit, textStyles: kit.textStyles.filter((style) => style.id !== id) }));

export const addNumber = (token: NumberToken): void => {
  mutateActive((kit) => ({ ...kit, numbers: [...kit.numbers, token] }));
  trackKit("studio_kit_token_added", { token: "number", kind: token.kind });
};
export const updateNumber = (id: string, updates: Partial<NumberToken>): void =>
  mutateActive((kit) => ({
    ...kit,
    numbers: kit.numbers.map((token) => (token.id === id ? { ...token, ...updates } : token)),
  }));
export const removeNumber = (id: string): void =>
  mutateActive((kit) => ({ ...kit, numbers: kit.numbers.filter((token) => token.id !== id) }));
