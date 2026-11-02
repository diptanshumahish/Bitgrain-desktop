import { Studio } from "@bitgrain/studio/editor/Studio";
import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";

export function StudioSurface({
  instanceId,
  tabId,
  initialTemplate,
}: {
  instanceId?: string;
  tabId?: string;
  initialTemplate?: TemplateDef;
}) {
  return (
    <div className="h-full w-full">
      <Studio instanceId={instanceId} tabId={tabId} initialTemplate={initialTemplate} />
    </div>
  );
}
