const DOUBLE_CLICK_DETAIL = 2;
const TRIPLE_CLICK_DETAIL = 3;

function selectAllContent(editorEl: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(editorEl);
  selection.removeAllRanges();
  selection.addRange(range);
}

function selectLineAtCaret(): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  selection.modify("move", "backward", "lineboundary");
  selection.modify("extend", "forward", "lineboundary");
}

export function handleEditorClickSelection(clickDetail: number, editorEl: HTMLElement): void {
  if (clickDetail === TRIPLE_CLICK_DETAIL) {
    selectAllContent(editorEl);
    return;
  }
  if (clickDetail === DOUBLE_CLICK_DETAIL) {
    selectLineAtCaret();
  }
}
