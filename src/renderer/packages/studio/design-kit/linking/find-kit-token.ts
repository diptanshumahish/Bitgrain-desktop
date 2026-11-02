import type { DesignKit, NumberToken, TextStyleVariable } from "@bitgrain/studio-core/model/design-kit-types";

export const findKitTextStyle = (kits: DesignKit[], id: string | undefined): TextStyleVariable | null =>
  id ? kits.flatMap((kit) => kit.textStyles).find((style) => style.id === id) ?? null : null;

export const findKitNumber = (kits: DesignKit[], id: string | undefined): NumberToken | null =>
  id ? kits.flatMap((kit) => kit.numbers).find((token) => token.id === id) ?? null : null;
