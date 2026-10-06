// Onboarding hint disabled on desktop: it portals into document.body and would
// leak from mounted-but-hidden surfaces. Kept as a null component so the import
// in the ported Home stays valid.
export const PrintFinishHint = (): null => null;
