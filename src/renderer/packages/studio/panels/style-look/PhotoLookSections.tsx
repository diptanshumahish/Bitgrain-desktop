import React from "react";
import type { ImageLayer } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../ui/panel-group";
import { BitgrainEffectControls } from "../BitgrainEffectControls";
import { ColorSection } from "../image/ColorSection";

type PhotoLookFields = Pick<ImageLayer, "filters" | "colorGrade" | "masks" | "bitgrainEffect" | "src">;

interface PhotoLookSectionsProps {
  layer: PhotoLookFields;
  sourceUrl: string | null;
  onChange: (updates: Partial<PhotoLookFields>) => void;
}

export const PhotoLookSections: React.FC<PhotoLookSectionsProps> = ({ layer, sourceUrl, onChange }) => (
  <>
    <ColorSection
      filters={layer.filters}
      colorGrade={layer.colorGrade}
      masks={layer.masks}
      sourceUrl={sourceUrl}
      hasEffect={!!layer.bitgrainEffect}
      onChange={onChange}
    />
    <PanelGroup title="Look" anchor="look">
      <BitgrainEffectControls
        effect={layer.bitgrainEffect}
        thumbSource={layer.src}
        onChange={(effect) => onChange({ bitgrainEffect: effect })}
      />
    </PanelGroup>
  </>
);
