import ColorThief from 'colorthief'
import type { ColorPalette } from '@/types/image.types'

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

export function useColorExtractor() {
  const colorThief = new ColorThief()

  function extractColors(img: HTMLImageElement): ColorPalette {
    // quality=5: sample every 5th pixel — good performance/accuracy trade-off
    const dominant = colorThief.getColor(img, 5)
    const rawPalette = colorThief.getPalette(img, 6, 5)

    return {
      dominant: rgbToHex(...dominant),
      palette: rawPalette.map(([r, g, b]) => rgbToHex(r, g, b)),
    }
  }

  return { extractColors }
}
