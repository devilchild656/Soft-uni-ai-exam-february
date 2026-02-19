export enum InstagramFormat {
  PORTRAIT = 'PORTRAIT',
  SQUARE = 'SQUARE',
  LANDSCAPE = 'LANDSCAPE',
}

export const FORMAT_DIMENSIONS: Record<InstagramFormat, { width: number; height: number }> = {
  [InstagramFormat.PORTRAIT]: { width: 1080, height: 1350 },
  [InstagramFormat.SQUARE]: { width: 1080, height: 1080 },
  [InstagramFormat.LANDSCAPE]: { width: 1080, height: 566 },
}

export const FORMAT_RATIOS: Record<InstagramFormat, number> = {
  [InstagramFormat.PORTRAIT]: 4 / 5,
  [InstagramFormat.SQUARE]: 1,
  [InstagramFormat.LANDSCAPE]: 1.91,
}

export type BackgroundType = 'solid' | 'gradient'

/** How the image fills the Instagram frame */
export type FillMode = 'background' | 'crop'

export interface BackgroundOption {
  type: BackgroundType
  colors: string[]
}

export interface ColorPalette {
  dominant: string
  palette: string[]
}

export interface ProcessedImage {
  originalFile: File
  originalUrl: string
  processedDataUrl: string
  width: number
  height: number
  format: InstagramFormat
}

export interface ImageItem {
  id: string
  originalFile: File
  originalUrl: string
  processedDataUrl: string | null
  selectedFormat: InstagramFormat
  selectedBackground: BackgroundOption
  fillMode: FillMode
  /** Horizontal crop anchor: 0 = left edge, 0.5 = center, 1 = right edge */
  cropX: number
  /** Vertical crop anchor: 0 = top edge, 0.5 = center, 1 = bottom edge */
  cropY: number
  colorPalette: ColorPalette | null
  isProcessing: boolean
  width: number
  height: number
}
