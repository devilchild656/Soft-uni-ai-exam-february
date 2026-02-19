# Instagram Image Formatter

A Vue 3 web app for formatting any image to fit Instagram's aspect ratio standards. Upload a landscape, portrait, or square photo — the app auto-detects the format, extracts colors from the image to suggest a matching background, and exports the result at full Instagram resolution.

---

## Features

- **Upload** via drag & drop or file browser (JPG, PNG, WEBP)
- **Auto-detect** the closest Instagram format on upload
- **Format selection** — Portrait (4:5), Square (1:1), Landscape (1.91:1)
- **Color extraction** — dominant color and 6-color palette pulled from the image using ColorThief
- **Solid or gradient background** — fill the padding area with an extracted color or gradient
- **Real-time preview** — original vs formatted side-by-side, updates instantly on every change
- **Instagram grid preview** — see how your post looks in a realistic 3×3 profile grid
- **High-quality export** — downloads a JPEG at 95% quality at full Instagram resolution (1080px wide)

---

## Instagram Format Dimensions

| Format | Dimensions | Aspect Ratio |
|--------|-----------|--------------|
| Portrait | 1080 × 1350 px | 4:5 |
| Square | 1080 × 1080 px | 1:1 |
| Landscape | 1080 × 566 px | 1.91:1 |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Vue 3](https://vuejs.org/) + `<script setup lang="ts">` | UI framework |
| [Pinia](https://pinia.vuejs.org/) | State management |
| [TypeScript](https://www.typescriptlang.org/) (strict mode) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Vite](https://vitejs.dev/) | Build tool |
| [ColorThief](https://lokeshdhakar.com/projects/color-thief/) | Color extraction |
| Canvas API | Image compositing & export |

---

## Project Structure

```
src/
├── types/
│   └── image.types.ts          # Domain enums & interfaces
├── composables/
│   ├── useColorExtractor.ts    # ColorThief wrapper
│   ├── useImageProcessor.ts    # Canvas compositing algorithm
│   └── useImageExporter.ts     # High-quality JPEG export
├── stores/
│   └── useImageStore.ts        # Pinia store — single source of truth
├── components/
│   ├── atoms/                  # AppButton, AppFileInput, AppColorSwatch, AppBadge
│   ├── molecules/              # ImageUploader, ColorPalette, FormatSelector
│   └── organisms/              # ImageEditorPanel, InstagramGridPreview, ExportPanel
└── views/
    └── HomeView.vue            # Smart layer — only place that accesses the store
```

The architecture follows **Atomic Design** with strict store isolation: only Views access Pinia stores; all other components are pure, prop-driven UI.

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

## How It Works

1. **Upload** — the file is read as an Object URL (no server upload, fully client-side)
2. **Color extraction** — ColorThief samples pixels from the loaded image to find the dominant color and a 6-color palette
3. **Format detection** — the image's aspect ratio is compared against the three Instagram ratios; the closest match is auto-selected
4. **Canvas compositing** — a canvas is created at the target Instagram dimensions, filled with the chosen background color or gradient, and the image is drawn centered using `object-fit: contain` semantics
5. **Preview** — the processed canvas is exported as a data URL at 85% JPEG quality for fast UI updates
6. **Export** — a separate canvas renders at the same dimensions but at 95% JPEG quality and is downloaded via a temporary Object URL

---

## License

MIT
