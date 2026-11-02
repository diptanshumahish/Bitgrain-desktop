import type { SnapshotExtras } from "@bitgrain/engine/core/transform-snapshot";
import { applyGradeFromSnapshot, gradeForSnapshot } from "../grading/editor/editor-grade-store";
import { applyStyleFromSnapshot, styleSettingsSignal } from "../styles/state/style-store";

export const captureSnapshotExtras = (): SnapshotExtras => ({
  grade: gradeForSnapshot(),
  style: styleSettingsSignal.value,
});

export const applySnapshotExtras = (snapshot: SnapshotExtras): void => {
  applyGradeFromSnapshot(snapshot.grade);
  applyStyleFromSnapshot(snapshot.style);
};
