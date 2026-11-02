import type React from "react";

// Desktop (PORTED.md): the onboarding hint portals into document.body and would
// leak from a hidden darkroom tab onto the visible one. Kept as a null component
// so the import in the ported Home stays valid.
export const PrintFinishHint: React.FC = () => null;
