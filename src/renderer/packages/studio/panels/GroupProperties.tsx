import React from "react";
import type { BlendMode, GroupLayer, Layer } from "@bitgrain/studio-core/model/studio-types";
import { GroupColoursSection } from "../features/elements/recolour/group-colours-section";
import { PanelGroup } from "../ui/panel-group";
import { PositionSizeFields } from "../ui/position-size-fields";
import { AlignRow } from "../ui/align-row";
import { AppearanceControls } from "./appearance-controls";
import { GroupActions } from "./group/group-actions";
import { GroupContents } from "./group/group-contents";
import { AutoLayoutSection } from "./auto-layout/auto-layout-section";
import { GroupSpecimenCard } from "./group/group-specimen-card";
import { withGroupScaling } from "../layers/resize/group-resize";

interface GroupPropertiesProps {
  layer: GroupLayer;
  onChange: (updates: Partial<GroupLayer>) => void;
  onAlign?: (alignment: string) => void;
  onUngroup?: () => void;
  pageLayers?: Layer[];
  pageBackground?: string;
}

export const GroupProperties: React.FC<GroupPropertiesProps> = ({
  layer,
  onChange,
  onAlign,
  onUngroup,
  pageLayers = [],
  pageBackground = "",
}) => (
  <div className="flex flex-col font-editorial pb-6">
    <GroupSpecimenCard layer={layer} />

    <PanelGroup title="Position & size" actions={<GroupActions layer={layer} onChange={onChange} onUngroup={onUngroup} />}>
      {onAlign && <AlignRow onAlign={onAlign} />}
      <PositionSizeFields
        values={{
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
          rotation: layer.rotation ?? 0,
          borderRadius: 0,
        }}
        onChange={(updates) => onChange(withGroupScaling(layer, updates as Partial<GroupLayer>))}
        showRadius={false}
      />
    </PanelGroup>

    <PanelGroup title="Appearance">
      <AppearanceControls
        opacity={layer.opacity}
        blendMode={layer.blendMode}
        onOpacityChange={(opacity) => onChange({ opacity })}
        onBlendModeChange={(blendMode: BlendMode) => onChange({ blendMode })}
      />
    </PanelGroup>

    <GroupContents layer={layer} />

    <AutoLayoutSection settings={layer} allowHug onChange={onChange} />

    <GroupColoursSection layer={layer} pageLayers={pageLayers} pageBackground={pageBackground} onChange={onChange} />
  </div>
);
