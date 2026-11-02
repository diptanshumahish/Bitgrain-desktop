import type { LayerTokenRefs, TokenSlot } from "@bitgrain/studio-core/model/studio-types";
import type { NumberKind } from "@bitgrain/studio-core/model/design-kit-types";

export const TOKEN_SLOT_FIELD: Record<TokenSlot, string> = {
  radius: "borderRadius",
  strokeWidth: "strokeWidth",
  fontSize: "fontSize",
  spacing: "gap",
};

export const TOKEN_SLOTS: TokenSlot[] = ["radius", "strokeWidth", "fontSize", "spacing"];

export const TEXT_STYLE_FIELDS: string[] = [
  "fontFamily",
  "fontWeight",
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "fontStyle",
];

export const slotForKind = (kind: NumberKind): TokenSlot | null =>
  kind === "generic" ? null : kind;

export const withoutSlot = (refs: LayerTokenRefs | undefined, slot: TokenSlot): LayerTokenRefs | undefined => {
  if (!refs?.[slot]) return refs;
  const rest = Object.fromEntries(Object.entries(refs).filter(([key]) => key !== slot));
  return Object.keys(rest).length > 0 ? rest : undefined;
};
