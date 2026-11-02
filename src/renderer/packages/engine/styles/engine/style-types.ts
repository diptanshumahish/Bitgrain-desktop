export type ParamValue = number | string | boolean;
export type ParamValues = Readonly<Record<string, ParamValue>>;

export type StyleCategory =
  | "ascii" | "pixel" | "print" | "geometric" | "distort"
  | "blur" | "glitch" | "light" | "glass" | "material";

interface ParamBase {
  key: string;
  label: string;
  advanced?: boolean;
  hint?: string;
}

export interface NumberParamSpec extends ParamBase {
  kind: "number";
  min: number;
  max: number;
  step: number;
  default: number;
  suffix?: string;
  scalesWithExport?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectParamSpec extends ParamBase {
  kind: "select";
  options: readonly SelectOption[];
  default: string;
}

interface ToggleParamSpec extends ParamBase {
  kind: "toggle";
  default: boolean;
}

interface ColourParamSpec extends ParamBase {
  kind: "colour";
  default: string;
}

export type ParamSpec = NumberParamSpec | SelectParamSpec | ToggleParamSpec | ColourParamSpec;

export interface EffectState {
  enabled: boolean;
  values: Readonly<Record<string, ParamValue>>;
}

export type EffectStates = Readonly<Record<string, EffectState>>;

export interface StyleLook {
  name: string;
  params?: ParamValues;
  effects?: Readonly<Record<string, ParamValues>>;
}

export interface StyleSettings {
  styleId: string;
  params: ParamValues;
  effects: EffectStates;
}
