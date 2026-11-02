export interface ExportGrant {
  plan: string;
  usesPack: boolean;
  packRequestId?: string;
}

export type ExportOutcome = "done" | "failed" | "cancelled";
