import React from 'react'
import type { UploadLayer } from '../../../data/studioTypes'
import { resolveAssetUrl } from '../../../lib/api-client'
import { emitModal } from '../../../lib/event-bus'
import { trackEvent } from '../../../lib/tracker'
import { PanelGroup } from '../ui/panel-group'
import { PositionSizeFields } from '../ui/position-size-fields'
import { AlignRow } from '../ui/align-row'
import { AppearanceControls } from './appearance-controls'
import { BitgrainEffectControls } from './BitgrainEffectControls'
import { EdgeFrameControls } from './EdgeFrameControls'
import { TapeControls } from './TapeControls'
import { ShadowGlowControls } from './shadow-glow-controls'
import { MatchPageButton } from './match-page-button'
import { ImageFrameCard } from './image/ImageFrameCard'
import { ImageFitToggle } from './image/image-fit-toggle'
import { ColorSection } from './image/ColorSection'

interface UploadPropertiesProps {
  layer: UploadLayer
  onChange: (updates: Partial<UploadLayer>) => void
  onAlign?: (alignment: string) => void
  onMatchPage?: () => void
}

export const UploadProperties: React.FC<UploadPropertiesProps> = ({ layer, onChange, onAlign, onMatchPage }) => {
  const openPicker = () => {
    emitModal({
      type: 'add-image',
      title: layer.src ? 'Replace image' : 'Choose image',
      onPick: (src) => {
        onChange({ src })
        trackEvent('studio', layer.src ? 'image_replaced' : 'image_chosen', { details: { layer_type: 'upload' } })
      },
    })
  }

  const resolvedSrc = layer.src ? resolveAssetUrl(layer.src) ?? layer.src : null

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
        onCropChange={crop => onChange({ crop })}
      >
        <ImageFitToggle value={layer.fit} onChange={fit => onChange({ fit })} />
      </ImageFrameCard>

      <PanelGroup title="Position & Size" actions={onMatchPage && <MatchPageButton onClick={onMatchPage} />}>
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
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
      </PanelGroup>

      <PanelGroup title="Appearance">
        <AppearanceControls
          opacity={layer.opacity}
          blendMode={layer.blendMode}
          onOpacityChange={opacity => onChange({ opacity })}
          onBlendModeChange={blendMode => onChange({ blendMode })}
        />
      </PanelGroup>

      <ColorSection
        filters={layer.filters}
        colorGrade={layer.colorGrade}
        masks={layer.masks}
        sourceUrl={resolvedSrc}
        hasEffect={!!layer.bitgrainEffect}
        onChange={onChange}
      />

      <PanelGroup title="Effect">
        <BitgrainEffectControls
          effect={layer.bitgrainEffect}
          onChange={effect => onChange({ bitgrainEffect: effect })}
        />
      </PanelGroup>

      <ShadowGlowControls shadow={layer.shadow} onChange={shadow => onChange({ shadow })} />

      <EdgeFrameControls
        effect={layer.tornEdge}
        layerId={layer.id}
        onChange={tornEdge => onChange({ tornEdge })}
      />

      <TapeControls
        tape={layer.tape}
        onChange={tape => onChange({ tape })}
      />
    </div>
  )
}
