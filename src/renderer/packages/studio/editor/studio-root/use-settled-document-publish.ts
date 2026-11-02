import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { studioPagesSignal } from "../../state/studio-document-store";
import { publishPageLayers } from "@bitgrain/studio-core/text/path/path-candidates-signal";
import { useGestureSettledEffect } from "./use-gesture-settled-effect";

const publishPages = (pages: TemplatePage[]): void => {
  studioPagesSignal.value = pages;
};

export const useSettledDocumentPublish = (pages: TemplatePage[], activeLayers: Layer[]): void => {
  useGestureSettledEffect(activeLayers, publishPageLayers);
  useGestureSettledEffect(pages, publishPages);
};
