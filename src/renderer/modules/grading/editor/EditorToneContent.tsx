import React from "react";
import { useSignalValue } from "../../../lib/signal";
import { imageSignal } from "../../../store/image-store";
import { pushHistory } from "../../../store/history-store";
import { ScopedGradePanel } from "../mask-ui/ScopedGradePanel";
import { colorGradeSignal } from "./editor-grade-store";
import { maskOverlaySignal, masksSignal, selectedMaskIdSignal } from "./editor-mask-store";

export const EditorToneContent: React.FC = () => {
  const grade = useSignalValue(colorGradeSignal);
  const masks = useSignalValue(masksSignal);
  const selectedId = useSignalValue(selectedMaskIdSignal);
  const overlay = useSignalValue(maskOverlaySignal);
  const image = useSignalValue(imageSignal);

  return (
    <ScopedGradePanel
      grade={grade}
      masks={masks}
      selectedId={selectedId}
      sourceUrl={image}
      hasEffect
      overlay={{ value: overlay, onChange: (value) => { maskOverlaySignal.value = value; } }}
      onGradeChange={(next) => { colorGradeSignal.value = next; }}
      onMasksChange={(next) => { masksSignal.value = next; }}
      onSelect={(id) => { selectedMaskIdSignal.value = id; }}
      onCommit={pushHistory}
    />
  );
};
