export interface AnalyticsClient {
  capture: (name: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  register: (properties: Record<string, unknown>) => void;
  reset: () => void;
  setPersonProperties: (properties: Record<string, unknown>) => void;
  setOptedOut: (optedOut: boolean) => void;
}

export type QueuedCall =
  | { type: "capture"; name: string; properties?: Record<string, unknown> }
  | { type: "identify"; userId: string; properties?: Record<string, unknown> }
  | { type: "register"; properties: Record<string, unknown> }
  | { type: "reset" }
  | { type: "setPersonProperties"; properties: Record<string, unknown> }
  | { type: "setOptedOut"; optedOut: boolean };

type ConversionFormat = "heic" | "raw" | "tiff";
type ConversionStage = "started" | "completed" | "failed";

export type EventName =
  | "auth:login_completed"
  | "checkout:page_viewed"
  | "checkout:started"
  | "checkout:cancelled"
  | "checkout:failed"
  | "checkout:verified"
  | "darkroom:background_removed"
  | "darkroom:loop_exported"
  | "darkroom:sound_loop_exported"
  | "home:export_downloaded"
  | "home:watermark_gate_shown"
  | `home:${ConversionFormat}_conversion_${ConversionStage}`
  | "payment:modal_opened"
  | "studio:background_removed"
  | "studio:export_started"
  | "studio:export_completed"
  | "studio:watermark_gate_shown";
