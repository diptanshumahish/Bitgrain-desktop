export interface AnalyticsClient {
  capture: (name: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  register: (properties: Record<string, unknown>) => void;
  reset: () => void;
  setPersonProperties: (properties: Record<string, unknown>) => void;
}

export type QueuedCall =
  | { type: "capture"; name: string; properties?: Record<string, unknown> }
  | { type: "identify"; userId: string; properties?: Record<string, unknown> }
  | { type: "register"; properties: Record<string, unknown> }
  | { type: "reset" }
  | { type: "setPersonProperties"; properties: Record<string, unknown> };

export type EventName =
  | "image_uploaded"
  | "export_downloaded"
  | "watermark_gate_shown"
  | "payment_modal_opened"
  | "mosh_randomized"
  | "preset_shared"
  | "changelog_viewed"
  | "heic_conversion_started"
  | "heic_conversion_completed"
  | "raw_conversion_started"
  | "raw_conversion_completed"
  | "raw_conversion_failed"
  | "tiff_conversion_started"
  | "tiff_conversion_completed"
  | "tiff_conversion_failed"
  | "studio_opened"
  | "studio_layer_added"
  | "studio_layer_deleted"
  | "studio_layer_grouped"
  | "studio_layer_ungrouped"
  | "studio_template_selected"
  | "studio_canvas_resized"
  | "studio_font_uploaded"
  | "studio_export_started"
  | "studio_export_completed"
  | "studio_theme_toggled"
  | "studio_save_restored"
  | "studio_manual_save_completed"
  | "studio_scatter_collage"
  | "studio_kit_created"
  | "studio_kit_deleted"
  | "studio_kit_token_added"
  | "studio_kit_applied"
  | "video_processing_started"
  | "video_processing_completed"
  | "video_recording_started"
  | "video_recording_completed"
  | "video_recorded"
  | "webcam_started"
  | "video_file_uploaded"
  | "free_credits_granted"
  | "signup_completed"
  | "login_completed"
  | "checkout_page_viewed"
  | "checkout_started"
  | "checkout_cancelled"
  | "checkout_failed"
  | "payment_succeeded";
