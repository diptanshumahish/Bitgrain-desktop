import React from 'react'
import { PhotoLookSections } from './style-look/PhotoLookSections'
import type { UploadLayer } from '@bitgrain/studio-core/model/studio-types'
import { resolveAssetUrl } from '@bitgrain/api/api-client'
import { emitStudioModal } from "../modals/studio-dialog/host/studio-modal-events";
import { trackEvent } from '@bitgrain/platform/tracker'
import { PanelGroup } from '../ui/panel-group'
import { PositionSizeFields } from '../ui/position-size-fields'
import { AlignRow } from '../ui/align-row'
import { AppearanceControls } from './appearance-controls'
import { TapeControls } from './TapeControls'
import { ImageEffectsSection } from './paint-list/effects/image/ImageEffectsSection'
import { MatchPageButton } from './match-page-button'
import { ImageFrameCard } from './image/ImageFrameCard'
import { ImageFitToggle } from './image/image-fit-toggle'
import { CornerRadiusFields } from './corner/CornerRadiusFields'
import { removeLayerBackground } from '@bitgrain/darkroom/background-removal/actions/remove-layer-background'

interface UploadPropertiesProps {
  layer: UploadLayer
  onChange: (updates: Partial<UploadLayer>) => void
  onAlign?: (alignment: string) => void
  onMatchPage?: () => void
}

export const UploadProperties: React.FC<UploadPropertiesProps> = ({ layer, onChange, onAlign, onMatchPage }) => {
  const openPicker = () => {
    emitStudioModal({
      type: 'add-image',
      title: layer.src ? 'Replace image' : 'Choose image',
      onPick: (src) => {
        onChange({ src })
        trackEvent('studio', layer.src ? 'image_replaced' : 'image_chosen', { details: { layer_type: 'upload' } })
      },
    })
  }

  const resolvedSrc = layer.src ? resolveAssetUrl(layer.src) ?? layer.src : null

  const removeBackground = (): void => {
    if (!resolvedSrc || !layer.src) return
    void removeLayerBackground({
      sourceUrl: resolvedSrc,
      originalSrc: layer.src,
      layerName: layer.name,
      applySrc: src => onChange({ src }),
    })
  }

  return (
    <div className="flex flex-col font-editorial pb-6">
      <ImageFrameCard
        layerId={layer.id}
        src={resolvedSrc}
        fit={layer.fit}
        crop={layer.crop}
        width={layer.width}
        height={layer.height}
        onReplace={openPicker}
        onRemoveBackground={removeBackground}
        onCropChange={crop => onChange({ crop })}
      >
        <ImageFitToggle value={layer.fit} onChange={fit => onChange({ fit })} />
      </ImageFrameCard>

      <PhotoLookSections layer={layer} sourceUrl={resolvedSrc} onChange={onChange} />

      <PanelGroup title="Position & size" actions={onMatchPage && <MatchPageButton onClick={onMatchPage} />}>
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
          showRadius={false}
          values={{
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            rotation: layer.rotation ?? 0,
            borderRadius: layer.borderRadius,
          }}
          onChange={onChange}
        />
        <CornerRadiusFields
          radius={layer.borderRadius}
          radii={layer.cornerRadii}
          smoothing={layer.cornerSmoothing}
          onChange={onChange}
        />
      </PanelGroup>

      <PanelGroup title="Appearance">
        <AppearanceControls
          opacity={layer.opacity}
          blendMode={layer.blendMode}
          onOpacityChange={opacity => onChange({ opacity })}
          onBlendModeChange={blendMode => onChange({ blendMode })}
        />
      </PanelGroup>

      <ImageEffectsSection
        layerId={layer.id}
        fields={{ shadow: layer.shadow, tornEdge: layer.tornEdge, layerEffects: layer.layerEffects }}
        supportsEdge
        onChange={onChange}
      />

      <TapeControls
        tape={layer.tape}
        onChange={tape => onChange({ tape })}
      />
    </div>
  )
}
