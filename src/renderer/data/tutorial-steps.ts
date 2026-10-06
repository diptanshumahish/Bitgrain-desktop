export interface TutorialStep {
  id: string;
  target?: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export interface TutorialConfig {
  id: "home" | "studio";
  storageKey: string;
  steps: TutorialStep[];
}

export const HOME_TUTORIAL: TutorialConfig = {
  id: "home",
  storageKey: "imgi_tutorial_home_done",
  steps: [
    {
      id: "home-welcome",
      title: "Welcome to Bitgrain",
      description:
        "Turn any photo into dithered, grainy, or glitchy art right in your browser. Deterministic algorithms, no AI, no generative models. This quick tour will show you the basics.",
    },
    {
      id: "home-upload",
      target: "[data-tutorial='home-upload']",
      title: "Upload your image",
      description:
        "Click upload to add your own photo, or hit random to try a sample. Supports JPG, PNG, WebP, and HEIC.",
      placement: "top",
    },
    {
      id: "home-effects",
      target: "[data-tutorial='home-effects']",
      title: "Pick a style",
      description:
        "Try textures like dither or ASCII, filters like grayscale, or creative effects like glitch and comic.",
      placement: "top",
    },
    {
      id: "home-presets",
      target: "[data-tutorial='home-presets']",
      title: "Presets",
      description:
        "Jump straight to a curated look with one click. You can also save your own presets and come back to them any time.",
      placement: "top",
    },
    {
      id: "home-algorithm",
      target: "[data-tutorial='home-algorithm']",
      title: "Dithering algorithm",
      description:
        "Swap between Atkinson, Floyd-Steinberg, Bayer, blue-noise, and more. Each one creates a distinct dot pattern. Adjust the strength slider to go from subtle to full-on.",
      placement: "top",
    },
    {
      id: "home-adjust",
      target: "[data-tutorial='home-adjust']",
      title: "Fine-tune it",
      description:
        "Control contrast, brightness, saturation, grain, hue, and output resolution. Small tweaks here make a big difference.",
      placement: "top",
    },
    {
      id: "home-chat",
      target: "[data-tutorial='home-chat']",
      title: "Need help?",
      description:
        "Hit this button any time to chat with the Bitgrain assistant. Ask it anything, from how a dither algorithm works to why your export looks different from the preview.",
      placement: "left",
    },
    {
      id: "home-export",
      target: "[data-tutorial='home-export']",
      title: "Export your work",
      description:
        "Download as PNG or SVG. Sample images export for free. Upload your own photo and use credits to export.",
      placement: "top",
    },
    {
      id: "home-studio",
      title: "Want more control?",
      description:
        "Head over to Studio to create full designs with layers, shapes, text, and templates. Hit the Studio button in the toolbar.",
    },
  ],
};

export const STUDIO_TUTORIAL: TutorialConfig = {
  id: "studio",
  storageKey: "imgi_tutorial_studio_done",
  steps: [
    {
      id: "studio-welcome",
      title: "Welcome to Studio",
      description:
        "A full design tool for creating posters, cards, and social graphics. Add layers, apply dither effects, and export.",
    },
    {
      id: "studio-templates",
      target: "[data-tutorial='studio-templates']",
      title: "Templates and layers",
      description:
        "Pick a template to get started quickly, or switch to the layers tab to manage and reorder your design elements.",
      placement: "right",
    },
    {
      id: "studio-properties",
      target: "[data-tutorial='studio-properties']",
      title: "Layer properties",
      description:
        "Change colors, size, position, alignment, and text options for the selected layer. Background color is set here too.",
      placement: "left",
    },
    {
      id: "studio-export",
      target: "[data-tutorial='studio-export']",
      title: "Export your design",
      description:
        "When your design looks right, click Export to download as PNG or SVG. You can also save as a .btg file to continue later.",
      placement: "bottom",
    },
  ],
};

export const TUTORIALS: Record<string, TutorialConfig> = {
  home: HOME_TUTORIAL,
  studio: STUDIO_TUTORIAL,
};
