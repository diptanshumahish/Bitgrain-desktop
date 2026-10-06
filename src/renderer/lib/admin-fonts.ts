import { signal } from "./signal";
import { callApi, resolveAssetUrl } from "./api-client";
import type { CustomFontEntry } from "../data/studioTypes";

interface FontInstance {
  weight: number;
  name: string;
}

interface FontVariant {
  id: string;
  weight: number;
  style: "normal" | "italic";
  format: string;
  isVariable: boolean;
  weightMin: number;
  weightMax: number;
  instances?: FontInstance[];
}

const STANDARD_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const weightOptionLabel = (weight: number, name: string): string =>
  name ? `${weight} ${name}` : weightLabel(weight);

interface FontFamily {
  family: string;
  variants: FontVariant[];
}

const WEIGHT_LABELS: Record<number, string> = {
  100: "100 Thin",
  200: "200 Extralight",
  300: "300 Light",
  400: "400 Regular",
  500: "500 Medium",
  600: "600 Semibold",
  700: "700 Bold",
  800: "800 Extrabold",
  900: "900 Black",
};

export const weightLabel = (weight: number): string => WEIGHT_LABELS[weight] ?? String(weight);

// adminFontOptions feeds the studio font picker with admin-uploaded families.
export const adminFontOptionsSignal = signal<CustomFontEntry[]>([]);

// customFontsReadySignal bumps once the admin font files have actually downloaded, so
// consumers that measure glyphs (e.g. template thumbnails) can repaint with real metrics.
export const customFontsReadySignal = signal(0);

let families: FontFamily[] = [];
let loaded = false;

const preloadFontFiles = (list: FontFamily[]): void => {
  if (typeof document === "undefined" || !document.fonts) return;
  const requests = list.flatMap((family) =>
    family.variants.map((variant) => {
      const weight = variant.isVariable ? variant.weightMax : variant.weight;
      return document.fonts
        .load(`${variant.style} ${weight} 16px '${family.family}'`)
        .catch(() => null);
    }),
  );
  void Promise.all(requests).then(() => {
    customFontsReadySignal.value += 1;
  });
};

export const ensureAdminFontsLoaded = async (): Promise<void> => {
  if (loaded) return;
  loaded = true;
  const res = await callApi<{ families: FontFamily[] }>("/api/fonts").catch(() => null);
  if (!res?.families?.length) return;
  families = res.families;

  const css = families
    .flatMap((family) =>
      family.variants.map((variant) => {
        const weightDecl = variant.isVariable
          ? `${variant.weightMin} ${variant.weightMax}`
          : `${variant.weight}`;
        const fileUrl = resolveAssetUrl(`/api/fonts/${variant.id}/file`);
        return `@font-face{font-family:'${family.family}';font-weight:${weightDecl};font-style:${variant.style};src:url('${fileUrl}');font-display:swap;}`;
      }),
    )
    .join("\n");

  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-admin-fonts", "");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  adminFontOptionsSignal.value = families.map((family) => ({
    label: family.family,
    value: `'${family.family}', sans-serif`,
    group: "Bitgrain fonts",
  }));

  preloadFontFiles(families);
};

// availableStylesForFamily reports which styles (upright / italic) an admin font actually ships,
// or null for built-in fonts (which keep both options).
export const availableStylesForFamily = (familyValue: string | null | undefined): { normal: boolean; italic: boolean } | null => {
  if (!familyValue) return null;
  const match = families.find((family) => familyValue.includes(`'${family.family}'`));
  if (!match) return null;
  return {
    normal: match.variants.some((variant) => variant.style === "normal"),
    italic: match.variants.some((variant) => variant.style === "italic"),
  };
};

// availableWeightsForFamily returns the real weights an admin font ships, or null for built-ins.
export const availableWeightsForFamily = (familyValue: string | null | undefined): { label: string; value: string }[] | null => {
  if (!familyValue) return null;
  const match = families.find((family) => familyValue.includes(`'${family.family}'`));
  if (!match) return null;

  // Build the weight options from each font's own named styles/instances where present, so a
  // font that ships "SemiBold" or "Black" shows exactly that; otherwise fall back to the range
  // (variable) or the single weight (static).
  const nameByWeight = new Map<number, string>();
  for (const variant of match.variants) {
    if (variant.instances && variant.instances.length > 0) {
      for (const instance of variant.instances) {
        if (!nameByWeight.get(instance.weight)) nameByWeight.set(instance.weight, instance.name || "");
      }
    } else if (variant.isVariable) {
      for (const standard of STANDARD_WEIGHTS) {
        if (standard >= variant.weightMin && standard <= variant.weightMax && !nameByWeight.has(standard)) {
          nameByWeight.set(standard, "");
        }
      }
    } else if (!nameByWeight.has(variant.weight)) {
      nameByWeight.set(variant.weight, "");
    }
  }
  if (nameByWeight.size === 0) return null;
  return [...nameByWeight.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([weight, name]) => ({ label: weightOptionLabel(weight, name), value: String(weight) }));
};
