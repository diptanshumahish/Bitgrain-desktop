import { promptSaveOrLeave } from "./studio-modals";
import { dirtySignal } from "../../store/studio-save-status";

interface NavigationConfig {
  handleManualSave: () => Promise<void>;
  navigate: (path: string) => void;
  onExit?: () => void;
}

export const buildHandleExit = ({ handleManualSave, navigate, onExit }: NavigationConfig) => () => {
  if (onExit) {
    onExit();
    return;
  }
  if (!dirtySignal.value) {
    navigate("/studio");
    return;
  }
  promptSaveOrLeave({
    title: "Save changes?",
    message: "Do you want to save your current work before leaving?",
    confirmLabel: "Save & Leave",
    cancelLabel: "Just Leave",
    onSaveAndGo: async () => { await handleManualSave(); navigate("/studio"); },
    onJustGo: () => navigate("/studio"),
  });
};

export const buildHandleNewProject = ({ handleManualSave, navigate, onExit }: NavigationConfig) => async () => {
  if (onExit) {
    onExit();
    return;
  }
  if (!dirtySignal.value) {
    navigate("/studio");
    return;
  }
  promptSaveOrLeave({
    title: "Go to Studio Home?",
    message: "Save your work and head back to the studio home to create or open another project.",
    confirmLabel: "Save & Go Home",
    cancelLabel: "Just Go Home",
    onSaveAndGo: async () => { await handleManualSave(); navigate("/studio"); },
    onJustGo: () => navigate("/studio"),
  });
};

export const promptTemplateSwitch = (
  handleManualSave: () => Promise<void>,
  onApply: () => void,
) => {
  if (!dirtySignal.value) {
    onApply();
    return;
  }
  promptSaveOrLeave({
    title: "Switch Template?",
    message: "Do you want to save your current work before switching to a new template?",
    confirmLabel: "Save & Switch",
    cancelLabel: "Just Switch",
    onSaveAndGo: async () => { await handleManualSave(); onApply(); },
    onJustGo: onApply,
  });
};
