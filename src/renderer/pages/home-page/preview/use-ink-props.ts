import { useSignalValue } from "../../../lib/signal";
import {
  popartCellSignal,
  popartAngleSignal,
  popartThresholdSignal,
  popartGrainSignal,
  popartSpatterSignal,
  popartInkSignal,
  popartPaperSignal,
  inkwashDetailSignal,
  inkwashBandsSignal,
  inkwashBleedSignal,
  inkwashInkSignal,
  inkwashPaperSignal,
  mangaCellSignal,
  mangaAngleSignal,
  mangaLineWeightSignal,
  mangaContrastSignal,
} from "../../../store/transform-store";
import { colorGradeSignal } from "../../../modules/grading/editor/editor-grade-store";
import { maskOverlaySignal, masksSignal, selectedMaskIdSignal } from "../../../modules/grading/editor/editor-mask-store";
import type { OutputPreviewProps } from "../../../components/output-preview/types";

type InkProps = Pick<
  OutputPreviewProps,
  | "popartCell" | "popartAngle" | "popartThreshold" | "popartGrain" | "popartSpatter" | "popartInk" | "popartPaper"
  | "inkwashDetail" | "inkwashBands" | "inkwashBleed" | "inkwashInk" | "inkwashPaper"
  | "mangaCell" | "mangaAngle" | "mangaLineWeight" | "mangaContrast"
  | "grade" | "masks" | "overlayMaskId"
>;

export const useInkProps = (): InkProps => {
  const maskOverlay = useSignalValue(maskOverlaySignal);
  const selectedMaskId = useSignalValue(selectedMaskIdSignal);
  return {
    popartCell: useSignalValue(popartCellSignal),
    popartAngle: useSignalValue(popartAngleSignal),
    popartThreshold: useSignalValue(popartThresholdSignal),
    popartGrain: useSignalValue(popartGrainSignal),
    popartSpatter: useSignalValue(popartSpatterSignal),
    popartInk: useSignalValue(popartInkSignal),
    popartPaper: useSignalValue(popartPaperSignal),
    inkwashDetail: useSignalValue(inkwashDetailSignal),
    inkwashBands: useSignalValue(inkwashBandsSignal),
    inkwashBleed: useSignalValue(inkwashBleedSignal),
    inkwashInk: useSignalValue(inkwashInkSignal),
    inkwashPaper: useSignalValue(inkwashPaperSignal),
    mangaCell: useSignalValue(mangaCellSignal),
    mangaAngle: useSignalValue(mangaAngleSignal),
    mangaLineWeight: useSignalValue(mangaLineWeightSignal),
    mangaContrast: useSignalValue(mangaContrastSignal),
    grade: useSignalValue(colorGradeSignal),
    masks: useSignalValue(masksSignal),
    overlayMaskId: maskOverlay ? selectedMaskId : null,
  };
};
