import type { StyleDefinition } from "../../engine/style-definition";
import type { StyleLook } from "../../engine/style-types";
import { LOFI_LOOKS, LOFI_STYLE } from "./tube/lofi/lofi-style";
import { DATAMOSH_LOOKS, DATAMOSH_STYLE } from "./corrupt/datamosh/datamosh-style";
import { FORENSICS_LOOKS, FORENSICS_STYLE } from "./sensor/forensics/forensics-style";
import { THERMAL_STYLE } from "./sensor/thermal/thermal-style";
import { THERMAL_LOOKS } from "./sensor/thermal/thermal-looks";
import { BEACON_LOOKS, BEACON_STYLE } from "./sensor/beacon/beacon-style";

export const SIGNAL_STYLES: readonly StyleDefinition[] = [
  FORENSICS_STYLE, DATAMOSH_STYLE, LOFI_STYLE, THERMAL_STYLE, BEACON_STYLE,
];

export const SIGNAL_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = {
  [FORENSICS_STYLE.id]: FORENSICS_LOOKS,
  [DATAMOSH_STYLE.id]: DATAMOSH_LOOKS,
  [LOFI_STYLE.id]: LOFI_LOOKS,
  [THERMAL_STYLE.id]: THERMAL_LOOKS,
  [BEACON_STYLE.id]: BEACON_LOOKS,
};
