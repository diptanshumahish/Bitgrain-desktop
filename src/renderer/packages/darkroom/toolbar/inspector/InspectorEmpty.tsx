import React from "react";

export const InspectorEmpty: React.FC = () => (
  <div className="flex-1 flex flex-col gap-1 px-4 py-6">
    <p className="text-[13px] font-medium text-[var(--s-text)]">No photo yet</p>
    <p className="text-[12px] leading-snug text-[var(--s-text-subtle)]">
      Open or drop a photo and its effects, adjustments and export settings will show up here.
    </p>
  </div>
);
