import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { StudioWorkspaceProps } from "../StudioWorkspace";
import { useSignalValue } from "@bitgrain/core/signal";
import { emitStudioModal } from "../../modals/studio-dialog/host/studio-modal-events";
import { closeMobileSheet, mobileSheetSignal } from "./mobile-sheet-state";
import { MobileLayerSheetHost } from "./mobile-layer-sheet-host";
import { MobileAddSheet } from "./sheets/mobile-add-sheet";
import { MobileMoreSheet } from "./sheets/mobile-more-sheet";
import { MobilePagesSheet } from "./sheets/mobile-pages-sheet";
import { MobileLayersSheet } from "./sheets/mobile-layers-sheet";
import { MobileColorSheet } from "./color/mobile-color-sheet";
import { collectDocumentColors } from "./color/collect-document-colors";
import type { PickedImage } from "./bottom-bar/read-picked-image";

interface MobileSheetHostProps {
  workspace: StudioWorkspaceProps;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onSetBackground: (color: string) => void;
  onSelectLayer: (id: string) => void;
}

const runAndClose = (action: () => void): (() => void) => () => {
  action();
  closeMobileSheet();
};

export const MobileSheetHost: React.FC<MobileSheetHostProps> = ({ workspace, onUpdateLayer, onSetBackground, onSelectLayer }) => {
  const kind = useSignalValue(mobileSheetSignal);
  if (!kind) return null;
  const { layers, background, selectedLayer, pages, activePageId, canvasW, canvasH } = workspace;
  const palette = collectDocumentColors(layers, background);

  if (selectedLayer) {
    return (
      <MobileLayerSheetHost
        kind={kind}
        layer={selectedLayer}
        palette={palette}
        onUpdate={onUpdateLayer}
        onMoveUp={workspace.handleMoveLayerUp}
        onMoveDown={workspace.handleMoveLayerDown}
      />
    );
  }

  const addPhoto = (image: PickedImage): void => {
    workspace.handleAddImageFromUrl(image.src, { name: image.name, width: image.dims.width, height: image.dims.height });
    closeMobileSheet();
  };

  const openResize = (): void =>
    emitStudioModal({ type: "resize", sourceWidth: canvasW, sourceHeight: canvasH, onApply: workspace.handleResizeToFormats });

  const openMockup = (): void =>
    emitStudioModal({
      type: "mockup", template: workspace.effectiveTemplate, background, layers, image: workspace.image,
      width: canvasW, height: canvasH, selectedLayer, onAddPage: workspace.handleAddMockupPage,
    });

  const selectPage = (id: string): void => {
    workspace.handleSelectPage(id);
    closeMobileSheet();
  };

  if (kind === "add") {
    return (
      <MobileAddSheet
        onAddText={runAndClose(workspace.handleAddText)}
        onAddRect={runAndClose(() => workspace.handleAddShape("rect"))}
        onAddCircle={runAndClose(() => workspace.handleAddShape("circle"))}
        onAddPhoto={addPhoto}
        onClose={closeMobileSheet}
      />
    );
  }
  if (kind === "background") {
    return <MobileColorSheet title="Background" value={background} palette={palette} onChange={onSetBackground} onClose={closeMobileSheet} />;
  }
  if (kind === "layers") {
    return (
      <MobileLayersSheet
        layers={layers}
        selectedId={null}
        onSelect={onSelectLayer}
        onToggleVisible={(layer) => workspace.commitUpdate(layer.id, { visible: !layer.visible })}
        onClose={closeMobileSheet}
      />
    );
  }
  if (kind === "pages") {
    return (
      <MobilePagesSheet
        pages={pages}
        activePageId={activePageId}
        onSelectPage={selectPage}
        onAddPage={runAndClose(workspace.handleAddPage)}
        onClose={closeMobileSheet}
      />
    );
  }
  if (kind === "more") {
    return (
      <MobileMoreSheet
        onResize={runAndClose(openResize)}
        onMockup={runAndClose(openMockup)}
        onAddPage={runAndClose(workspace.handleAddPage)}
        onClose={closeMobileSheet}
      />
    );
  }
  return null;
};
