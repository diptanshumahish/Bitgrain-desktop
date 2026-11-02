const TRIPLE_CLICK_DETAIL = 3;

function selectLineAtCaret(): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  selection.modify("move", "backward", "lineboundary");
  selection.modify("extend", "forward", "lineboundary");
}

export function handleEditorClickSelection(clickDetail: number): void {
  if (clickDetail === TRIPLE_CLICK_DETAIL) selectLineAtCaret();
}
