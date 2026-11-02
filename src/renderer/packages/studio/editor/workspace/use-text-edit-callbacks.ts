import { useEffect, useRef } from "react";
import type { Layer, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";
import { trackEvent } from "@bitgrain/platform/tracker";
import { refitTextLayer } from "../../layers/text-box/text-box-fit";
import { trimTrailingLines } from "../../layers/text-box/trim-trailing-lines";
import { promoteUniformFontSize } from "../../layers/text-box/promote-uniform-size";
import { takeTextExtras } from "@bitgrain/studio-core/text/layout/text-extras-queue";
import { whenTextFontReady } from "../../layers/text-box/text-font-ready";

interface TextEditInput {
  layers: Layer[];
  editingId: string | null;
  activePageWidth: number;
  pushHistory: () => void;
  setSelectedIds: (ids: string[]) => void;
  setEditingId: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  handleDeleteLayer: (id: string) => void;
}

interface TextEditCallbacks {
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, rawContent: string, rawRichContent: string) => void;
  onCommitText: (id: string, content: string, richContent: string) => void;
}

const hasTextChanged = (layer: Layer | null | undefined, content: string, richContent: string | undefined): boolean =>
  layer?.type !== "text" || layer.content !== content || (layer.richContent ?? "") !== (richContent ?? "");

export const useTextEditCallbacks = (input: TextEditInput): TextEditCallbacks => {
  const { layers, editingId, activePageWidth, pushHistory, setSelectedIds, setEditingId, updateLayer, handleDeleteLayer } = input;
  const editDirtyRef = useRef(false);
  useEffect(() => {
    editDirtyRef.current = false;
  }, [editingId]);

  const ensureEditHistory = (): void => {
    if (editDirtyRef.current) return;
    pushHistory();
    editDirtyRef.current = true;
  };

  const onStartEdit = (id: string): void => {
    editDirtyRef.current = false;
    setSelectedIds([id]);
    setEditingId(id);
  };

  const onEndEdit = (id: string, rawContent: string, rawRichContent: string): void => {
    setEditingId(null);
    const { content, richContent } = trimTrailingLines(rawContent, rawRichContent);
    const layer = findLayerById(layers, id);
    if (hasTextChanged(layer, content, richContent)) ensureEditHistory();
    if (content === "") {
      handleDeleteLayer(id);
      return;
    }
    if (layer?.type !== "text") {
      updateLayer(id, { content, richContent });
      return;
    }
    const refitted = refitTextLayer(layer, { content, richContent, ...takeTextExtras(id), ...promoteUniformFontSize(layer, richContent) }, activePageWidth);
    updateLayer(id, refitted);
    const committedLayer: TextLayer = { ...layer, ...refitted };
    whenTextFontReady(committedLayer, () => updateLayer(id, refitTextLayer(committedLayer, { content }, activePageWidth)));
    trackEvent("studio", "text_edit_committed", { details: { char_count: content.length } });
  };

  const onCommitText = (id: string, content: string, richContent: string): void => {
    ensureEditHistory();
    const layer = findLayerById(layers, id);
    updateLayer(id, layer?.type === "text" ? refitTextLayer(layer, { content, richContent, ...takeTextExtras(id) }, activePageWidth) : { content, richContent });
  };

  return { onStartEdit, onEndEdit, onCommitText };
};
