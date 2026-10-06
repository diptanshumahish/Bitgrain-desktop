import type { TextLayer } from "./studioTypes";

export interface ColorVariable {
  id: string;
  name: string;
  value: string;
}

export interface TextStyleVariable {
  id: string;
  name: string;
  fontFamily: string;
  fontWeight: TextLayer["fontWeight"];
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: TextLayer["textTransform"];
  fontStyle: TextLayer["fontStyle"];
}

export type NumberKind = "radius" | "strokeWidth" | "fontSize" | "spacing" | "generic";

export interface NumberToken {
  id: string;
  name: string;
  value: number;
  kind: NumberKind;
}

export interface DesignKit {
  id: string;
  name: string;
  colors: ColorVariable[];
  textStyles: TextStyleVariable[];
  numbers: NumberToken[];
  createdAt: number;
  updatedAt: number;
}

export const NUMBER_KINDS: Array<{ value: NumberKind; label: string }> = [
  { value: "radius", label: "Radius" },
  { value: "strokeWidth", label: "Stroke" },
  { value: "fontSize", label: "Font size" },
  { value: "spacing", label: "Spacing" },
  { value: "generic", label: "Value" },
];

export const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `dk-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const createEmptyKit = (name: string): DesignKit => ({
  id: newId(),
  name,
  colors: [],
  textStyles: [],
  numbers: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const STARTER_KIT_ID = "bitgrain-starter-kit";

export const DEFAULT_KIT: DesignKit = {
  id: STARTER_KIT_ID,
  name: "BitGrain Starter Kit",
  colors: [
    { id: newId(), name: "Ink", value: "#0a0a0a" },
    { id: newId(), name: "Paper", value: "#f5f0e6" },
    { id: newId(), name: "Accent", value: "#820000" },
    { id: newId(), name: "Muted", value: "#6b7280" },
  ],
  textStyles: [
    { id: newId(), name: "Heading", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", fontSize: 64, lineHeight: 1.05, letterSpacing: 0, textTransform: "none", fontStyle: "regular" },
    { id: newId(), name: "Subheading", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "600", fontSize: 32, lineHeight: 1.15, letterSpacing: 0, textTransform: "none", fontStyle: "regular" },
    { id: newId(), name: "Body", fontFamily: "'Inter', sans-serif", fontWeight: "400", fontSize: 18, lineHeight: 1.5, letterSpacing: 0, textTransform: "none", fontStyle: "regular" },
    { id: newId(), name: "Caption", fontFamily: "'DM Mono', monospace", fontWeight: "500", fontSize: 12, lineHeight: 1.4, letterSpacing: 0, textTransform: "none", fontStyle: "regular" },
  ],
  numbers: [
    { id: newId(), name: "Radius sm", value: 8, kind: "radius" },
    { id: newId(), name: "Radius lg", value: 24, kind: "radius" },
    { id: newId(), name: "Spacing", value: 24, kind: "spacing" },
    { id: newId(), name: "Stroke", value: 2, kind: "strokeWidth" },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
