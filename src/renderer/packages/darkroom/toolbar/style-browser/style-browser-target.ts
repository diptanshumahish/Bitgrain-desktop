export interface StyleBrowserTarget {
  styleId: string | null;
  thumbSource: string | null;
  onPick: (styleId: string) => void;
}
