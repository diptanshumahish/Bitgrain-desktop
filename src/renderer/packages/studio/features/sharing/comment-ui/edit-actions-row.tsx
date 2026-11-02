import React from "react";
import { Button } from "@bitgrain/ui/components/Button";

interface EditActionsRowProps {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
}

export const EditActionsRow: React.FC<EditActionsRowProps> = ({ buttonRef, onCancel }) => (
  <div className="flex items-center justify-end gap-1">
    <Button type="button" variant="ghost" size="xs" onClick={onCancel}>
      Cancel
    </Button>
    <Button ref={buttonRef} type="submit" variant="primary" size="xs">
      Save
    </Button>
  </div>
);
