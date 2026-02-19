import { shallowRef } from 'vue'
import type { InstagramFormat, BackgroundOption } from '@/types/image.types'
import { FORMAT_DIMENSIONS } from '@/types/image.types'

export function useImageExporter() {
  const isExporting = shallowRef(false)

  async function exportImage(
    img: HTMLImageElement,
    format: InstagramFormat,
    background: BackgroundOption,
    filename?: string,
  ): Promise<void> {
    isExporting.value = true

    try {
      const { width: targetW, height: targetH } = FORMAT_DIMENSIONS[format]

      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = targetW
      exportCanvas.height = targetH

      const ctx = exportCanvas.getContext('2d')
      if (!ctx) throw new Error('Export canvas context unavailable')

      // Fill background
      if (background.type === 'solid') {
        ctx.fillStyle = background.colors[0] ?? '#000000'
        ctx.fillRect(0, 0, targetW, targetH)
      } else {
        const colors =
          background.colors.length >= 2
            ? background.colors
            : [background.colors[0], darkenHex(background.colors[0])]
        const gradient = ctx.createLinearGradient(0, 0, 0, targetH)
        colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1), c))
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, targetW, targetH)
      }

      // Scale and center (object-fit: contain)
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

      const offsetX = (targetW - drawW) / 2
      const offsetY = (targetH - drawH) / 2

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH)

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

function darkenHex(hex: string): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40)
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}
