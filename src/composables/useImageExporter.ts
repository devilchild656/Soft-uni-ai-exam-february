import { shallowRef } from 'vue'
import type { InstagramFormat, BackgroundOption, FillMode } from '@/types/image.types'
import { FORMAT_DIMENSIONS } from '@/types/image.types'

export function useImageExporter() {
  const isExporting = shallowRef(false)

  async function exportImage(
    img: HTMLImageElement,
    format: InstagramFormat,
    background: BackgroundOption,
    fillMode: FillMode = 'background',
    filename?: string,
    cropX = 0.5,
    cropY = 0.5,
  ): Promise<void> {
    isExporting.value = true

    try {
      const { width: targetW, height: targetH } = FORMAT_DIMENSIONS[format]

      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = targetW
      exportCanvas.height = targetH

      const ctx = exportCanvas.getContext('2d')
      if (!ctx) throw new Error('Export canvas context unavailable')

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      if (fillMode === 'crop') {
        drawCover(ctx, img, targetW, targetH, cropX, cropY)
      } else {
        fillBackground(ctx, background, targetW, targetH)
        drawContain(ctx, img, targetW, targetH)
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        exportCanvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Canvas toBlob returned null'))
          },
          'image/jpeg',
          0.95,
        )
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename ?? `instagram-${format.toLowerCase()}-${Date.now()}.jpg`
      a.click()

      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } finally {
      isExporting.value = false
    }
  }

  return { exportImage, isExporting }
}

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
    drawH = targetH
    drawW = targetH * srcRatio
  } else {
    drawW = targetW
    drawH = targetW / srcRatio
  }

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
    colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1), c))
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
