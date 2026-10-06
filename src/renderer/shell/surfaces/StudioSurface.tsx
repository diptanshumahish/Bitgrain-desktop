import { Studio } from "../../pages/Studio";
import type { TemplateDef } from "../../data/studioTypes";

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
