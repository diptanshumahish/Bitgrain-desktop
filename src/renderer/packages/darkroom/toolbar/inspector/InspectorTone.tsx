import React, { memo, useEffect } from "react";
import { EditorToneContent } from "../../grading/editor/EditorToneContent";
import { selectedMaskIdSignal } from "../../grading/editor/editor-mask-store";
import { trackEvent } from "@bitgrain/platform/tracker";

const InspectorToneView: React.FC = () => {
  useEffect(() => {
    trackEvent("grading", "panel_opened", { details: { surface: "editor" } });
    return () => {
      selectedMaskIdSignal.value = null;
    };
  }, []);

  return (
    <div className="px-4 py-3">
      <EditorToneContent />
    </div>
  );
};

export const InspectorTone = memo(InspectorToneView);
