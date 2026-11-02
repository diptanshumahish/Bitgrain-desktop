export type MetadataKind = "camera" | "editing" | "credentials" | "ai-label" | "rights" | "text" | "other";

export interface StripOutcome {
  bytes: Uint8Array<ArrayBuffer>;
  found: MetadataKind[];
}

export interface CleanedImage {
  blob: Blob;
  found: MetadataKind[];
  rebuilt: boolean;
}
