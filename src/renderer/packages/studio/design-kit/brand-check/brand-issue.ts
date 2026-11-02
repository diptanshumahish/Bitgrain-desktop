type BrandIssueKind = "color" | "font";

export interface BrandIssue {
  key: string;
  pageId: string;
  layerId: string | null;
  label: string;
  kind: BrandIssueKind;
  field: string;
  varField: string | null;
  value: string;
  fixValue: string;
  fixId: string;
}

export interface BrandReport {
  issues: BrandIssue[];
  offBrandLayerCount: number;
}
