import { createEventChannel } from "@bitgrain/core/events/event-channel";

const SVG_CHOICE_EVENT = "bg:svg-import-choice";
const SVG_LAYERS_EVENT = "bg:svg-import-layers";

export interface SvgImportChoice {
  name: string;
  onEditable: () => void;
  onImage: () => void;
}

export interface SvgLayersRequest {
  name: string;
  markup: string;
}

const svgImportChoiceChannel = createEventChannel<SvgImportChoice>(SVG_CHOICE_EVENT);
const svgLayersImportChannel = createEventChannel<SvgLayersRequest>(SVG_LAYERS_EVENT);

export const emitSvgImportChoice = svgImportChoiceChannel.emit;
export const onSvgImportChoice = svgImportChoiceChannel.on;

export const emitSvgLayersImport = svgLayersImportChannel.emit;
export const onSvgLayersImport = svgLayersImportChannel.on;
