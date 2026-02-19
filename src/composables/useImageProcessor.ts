import { shallowRef } from 'vue'
import type { BackgroundOption, FillMode } from '@/types/image.types'
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
    fillMode: FillMode = 'background',
    cropX = 0.5,
    cropY = 0.5,
  ): string {
    const { width: targetW, height: targetH } = FORMAT_DIMENSIONS[targetFormat]

    if (!canvas.value) {
      canvas.value = document.createElement('canvas')
    }
    const ctx = canvas.value.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')

    canvas.value.width = targetW
    canvas.value.height = targetH

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    if (fillMode === 'crop') {
      drawCover(ctx, img, targetW, targetH, cropX, cropY)
    } else {
      fillBackground(ctx, background, targetW, targetH)
      drawContain(ctx, img, targetW, targetH)
    }

    return canvas.value.toDataURL('image/jpeg', 0.85)
  }

  return { detectFormat, processImage }
}

/**
 * object-fit: contain — image fits inside frame; background fills padding.
 */
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
): void {
  const srcRatio = img.naturalWidth / img.naturalHeight
  const dstRatio = targetW / targetH

  let drawW: number
  let drawH: number

  if (srcRatio > dstRatio) {
    drawW = targetW
    drawH = targetW / srcRatio
  } else {
    drawH = targetH
    drawW = targetH * srcRatio
  }

  ctx.drawImage(img, (targetW - drawW) / 2, (targetH - drawH) / 2, drawW, drawH)
}

/**
 * object-fit: cover with adjustable anchor — image fills the frame and the
 * user-chosen crop anchor (0–1 in each axis) controls which part is visible.
 *
 * cropX: 0 = left edge, 0.5 = center, 1 = right edge
 * cropY: 0 = top  edge, 0.5 = center, 1 = bottom edge
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  cropX: number,
  cropY: number,
): void {
  const srcRatio = img.naturalWidth / img.naturalHeight
  const dstRatio = targetW / targetH

  let drawW: number
  let drawH: number

  if (srcRatio > dstRatio) {
    // Image wider → scale to frame height; crop left/right
    drawH = targetH
    drawW = targetH * srcRatio
  } else {
    // Image taller → scale to frame width; crop top/bottom
    drawW = targetW
    drawH = targetW / srcRatio
  }

  // overflowX/Y = how many pixels are cropped (total across both sides)
  // offsetX/Y = where to start drawing (negative = image starts outside left/top edge)
  const offsetX = -((drawW - targetW) * cropX)
  const offsetY = -((drawH - targetH) * cropY)

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
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
    const colors =
      background.colors.length >= 2
        ? background.colors
        : [background.colors[0], darkenHex(background.colors[0])]
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
