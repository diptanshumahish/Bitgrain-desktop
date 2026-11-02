import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { imageMetaSignal } from "../../../state/image-store";
import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";

const FREE_PLAN = "free";

interface FreeSizeCapNoteProps {
  scale: number;
}

export const FreeSizeCapNote: React.FC<FreeSizeCapNoteProps> = ({ scale }) => {
  const meta = useSignalValue(imageMetaSignal);
  const cap = getPlanLimits(FREE_PLAN).maxExportLongEdge;
  if (!meta || cap === null) return null;
  const requested = Math.max(meta.width, meta.height) * scale;
  if (requested <= cap) return null;
  return (
    <p className="m-0 text-[12px] leading-snug text-[var(--s-text-subtle)]">
      Free downloads are saved at {cap} px on the long edge. Pro keeps all {requested} px.
    </p>
  );
};
