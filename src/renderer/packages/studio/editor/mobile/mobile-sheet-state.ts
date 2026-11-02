import { signal } from "@bitgrain/core/signal";

export type MobileSheetKind =
  | "add"
  | "background"
  | "layers"
  | "pages"
  | "more"
  | "text"
  | "font"
  | "color"
  | "adjust";

export const mobileSheetSignal = signal<MobileSheetKind | null>(null);

export const openMobileSheet = (kind: MobileSheetKind): void => {
  mobileSheetSignal.value = kind;
};

export const toggleMobileSheet = (kind: MobileSheetKind): void => {
  mobileSheetSignal.value = mobileSheetSignal.value === kind ? null : kind;
};

export const closeMobileSheet = (): void => {
  mobileSheetSignal.value = null;
};
