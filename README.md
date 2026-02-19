# Instagram Image Formatter

A fully client-side Vue 3 web app for preparing photos for Instagram. Upload up to 9 images, format each one to the exact Instagram dimensions, fine-tune the crop, arrange the grid, preview how your profile will look, and export everything — all in the browser, nothing uploaded to any server.

---

## Features

### Image Management
- **Multi-image upload** — drag & drop or file browser, up to 9 images at once (JPG, PNG, WEBP)
- **Thumbnail strip** — switch between images instantly; add or remove images at any time
- **Per-image settings** — every image has its own format, background, fill mode, and crop position

### Formatting
- **Auto-detect format** — the closest Instagram format is selected automatically on upload
- **Format selection** — Portrait (4:5), Square (1:1), Landscape (1.91:1)
- **Color extraction** — dominant color and 6-color palette extracted from each image using ColorThief
- **Background fill mode** — solid color or gradient; fill the padding with extracted colors
- **Auto crop mode** — crop the image to fill the full frame with no background padding

### Crop Control
- **Format-accurate preview** — the crop preview shows the exact Instagram frame shape (portrait, square, or landscape)
- **Drag to reposition** — drag the image inside the frame to choose which part is visible
- **Precision sliders** — horizontal and vertical sliders with a live percentage readout
- **9-point presets** — one click to snap to any corner, edge, or center position
- **Rule-of-thirds grid** overlay for composition guidance

### Grid
- **Instagram grid preview** — see how your posts look in a realistic 3×3 profile grid mockup
- **Drag-and-drop reorder** — drag cells in the grid to rearrange the post order
- **Full-width grid preview** — a large, numbered grid view showing all posts in sequence

### AI Caption & Hashtags *(requires API key)*
- **AI-powered caption** — Claude analyzes each photo and writes a 2–3 sentence Instagram caption
- **28 relevant hashtags** — a mix of popular, niche, and trending tags tailored to the image content
- **Credit templates** — editable fields for tagging a model (`@handle`), photographer (`@handle`), and location
- **One-click copy** — copy individual hashtags, all hashtags, the caption, or the complete post text

### Export
- **Single image export** — downloads the active image as a 95% quality JPEG at full Instagram resolution
- **ZIP export** — exports all grid images as numbered JPEGs (`1.jpg`, `2.jpg`, …) in a ZIP file, ordered by grid position

---

## Instagram Format Dimensions

| Format | Dimensions | Aspect Ratio |
|--------|------------|--------------|
| Portrait | 1080 × 1350 px | 4:5 |
| Square | 1080 × 1080 px | 1:1 |
| Landscape | 1080 × 566 px | 1.91:1 |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Vue 3](https://vuejs.org/) + `<script setup lang="ts">` | UI framework |
| [Pinia](https://pinia.vuejs.org/) | State management (setup-style stores) |
| [TypeScript](https://www.typescriptlang.org/) strict mode | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Vite](https://vitejs.dev/) | Build tool |
| [ColorThief](https://lokeshdhakar.com/projects/color-thief/) | Dominant color & palette extraction |
| [JSZip](https://stuk.github.io/jszip/) | Client-side ZIP generation |
| [@anthropic-ai/sdk](https://github.com/anthropic-ai/sdk-python) | AI caption & hashtag generation |
| Canvas API | Image compositing & export |

---

## Project Structure

```
src/
├── types/
│   └── image.types.ts              # Domain enums, interfaces (ImageItem, CaptionSuggestions, …)
├── composables/
│   ├── useColorExtractor.ts        # ColorThief wrapper
│   ├── useImageProcessor.ts        # Canvas compositing — contain & cover algorithms
│   ├── useImageExporter.ts         # Single-image 95% JPEG export
│   ├── useGridExporter.ts          # Multi-image ZIP export
│   └── useAiSuggestions.ts         # Claude API — caption & hashtag generation
├── stores/
│   └── useImageStore.ts            # Pinia store — single source of truth for all images
├── components/
│   ├── atoms/                      # AppButton, AppFileInput, AppColorSwatch, AppBadge
│   ├── molecules/
│   │   ├── ImageUploader.vue       # Drag & drop upload zone
│   │   ├── ImageList.vue           # Thumbnail strip with add / remove
│   │   ├── FormatSelector.vue      # Portrait / Square / Landscape picker
│   │   ├── ColorPalette.vue        # Color swatches + gradient option
│   │   └── CropAdjuster.vue        # Drag + sliders + presets for crop repositioning
│   └── organisms/
│       ├── ImageEditorPanel.vue    # Original vs processed preview + all controls
│       ├── InstagramGridPreview.vue# Drag-and-drop 3×3 grid mockup
│       ├── GridBigPreview.vue      # Full-width numbered grid
│       ├── ExportPanel.vue         # Single & ZIP export buttons
│       └── CaptionPanel.vue        # AI caption, hashtags, credit templates
└── views/
    └── HomeView.vue                # Smart layer — only component that accesses the store
```

The architecture follows **Atomic Design** with strict store isolation: only `HomeView` accesses the Pinia store; all other components are pure, prop-driven UI.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

App will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output is in the `dist/` folder.

### Type Check

```bash
npm run type-check
```

---

## AI Caption & Hashtags Setup

The AI features use the Claude Haiku model via the Anthropic API and require an API key.

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your key (get one at [console.anthropic.com](https://console.anthropic.com/)):
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Restart the dev server. The **Generate** button in the Caption & Hashtags panel will become active once an image is processed.

If the key is not set the panel shows a helpful message and the rest of the app works normally.

---

## How It Works

### Processing pipeline

1. **Upload** — the file is read as a blob Object URL (fully client-side, nothing sent to a server)
2. **Color extraction** — ColorThief samples pixels from the decoded image to find the dominant color and a 6-color palette
3. **Format detection** — the image's aspect ratio is compared against the three Instagram ratios; the closest match is auto-selected
4. **Canvas compositing** — a canvas is created at the target Instagram dimensions and one of two algorithms runs:
   - **Background fill** (`object-fit: contain`) — image is scaled to fit inside the frame; background color or gradient fills the padding
   - **Crop** (`object-fit: cover`) — image is scaled to fill the entire frame; the crop anchor `(cropX, cropY)` controls which part is visible
5. **Preview** — the canvas is exported as a data URL at 85% JPEG quality for fast UI updates
6. **Export** — a fresh canvas renders the same composition at 95% JPEG quality and is downloaded via a temporary Object URL

### Crop anchor formula

```
offsetX = -((drawW - targetW) * cropX)
offsetY = -((drawH - targetH) * cropY)
```

Where `cropX` / `cropY` are in `[0, 1]`: `0` = left/top edge visible, `0.5` = centered, `1` = right/bottom edge visible.

### AI suggestions

The processed JPEG data URL is sent as base64 to Claude Haiku's vision endpoint. The model returns a JSON object with the caption, hashtag array, and three credit line templates which are filled in using the user's handle inputs.

---

## License

MIT
