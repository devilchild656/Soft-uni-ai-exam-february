import { shallowRef } from 'vue'
import type { BackgroundOption } from '@/types/image.types'
import { InstagramFormat, FORMAT_DIMENSIONS, FORMAT_RATIOS } from '@/types/image.types'

export function useImageProcessor() {
  const canvas = shallowRef<HTMLCanvasElement | null>(null)

  function detectFormat(width: number, height: number): InstagramFormat {
    const ratio = width / height

    const distances: Array<{ format: InstagramFormat; distance: number }> = [
      {
        format: InstagramFormat.PORTRAIT,
        distance: Math.abs(ratio - FORMAT_RATIOS[InstagramFormat.PORTRAIT]),
      },
      {
        format: InstagramFormat.SQUARE,
        distance: Math.abs(ratio - FORMAT_RATIOS[InstagramFormat.SQUARE]),
      },
      {
        format: InstagramFormat.LANDSCAPE,
        distance: Math.abs(ratio - FORMAT_RATIOS[InstagramFormat.LANDSCAPE]),
      },
    ]

    distances.sort((a, b) => a.distance - b.distance)
    return distances[0].format
  }

  function processImage(
    img: HTMLImageElement,
    targetFormat: InstagramFormat,
    background: BackgroundOption,
  ): string {
    const { width: targetW, height: targetH } = FORMAT_DIMENSIONS[targetFormat]

    if (!canvas.value) {
      canvas.value = document.createElement('canvas')
    }
    const ctx = canvas.value.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')

    canvas.value.width = targetW
    canvas.value.height = targetH

    fillBackground(ctx, background, targetW, targetH)

    const srcRatio = img.naturalWidth / img.naturalHeight
    const dstRatio = targetW / targetH

    let drawW: number
    let drawH: number

    if (srcRatio > dstRatio) {
      // Image wider than target — letterbox (bars top/bottom)
      drawW = targetW
      drawH = targetW / srcRatio
    } else {
      // Image taller than target — pillarbox (bars on sides)
      drawH = targetH
      drawW = targetH * srcRatio
    }

    const offsetX = (targetW - drawW) / 2
    const offsetY = (targetH - drawH) / 2

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH)

    return canvas.value.toDataURL('image/jpeg', 0.85)
  }

  return { detectFormat, processImage }
}

function fillBackground(
  ctx: CanvasRenderingContext2D,
  background: BackgroundOption,
  w: number,
  h: number,
): void {
  if (background.type === 'solid') {
    ctx.fillStyle = background.colors[0] ?? '#000000'
    ctx.fillRect(0, 0, w, h)
  } else {
    const colors = background.colors.length >= 2 ? background.colors : [background.colors[0], darkenHex(background.colors[0])]
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color)
    })
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
  }
}

function darkenHex(hex: string): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40)
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}
