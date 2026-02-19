import { ref } from 'vue'
import JSZip from 'jszip'
import type { ImageItem, BackgroundOption } from '@/types/image.types'
import { FORMAT_DIMENSIONS } from '@/types/image.types'

// Re-usable canvas compositing at 95% JPEG quality (full export quality)
async function renderToBlob(img: HTMLImageElement, item: ImageItem): Promise<Blob> {
  const { width: targetW, height: targetH } = FORMAT_DIMENSIONS[item.selectedFormat]
  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context unavailable')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (item.fillMode === 'crop') {
    drawImageCover(ctx, img, targetW, targetH, item.cropX, item.cropY)
  } else {
    drawBackground(ctx, targetW, targetH, item.selectedBackground)
    drawImageContain(ctx, img, targetW, targetH)
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob returned null'))),
      'image/jpeg',
      0.95,
    )
  })
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: BackgroundOption,
): void {
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.colors[0] ?? '#000000'
    ctx.fillRect(0, 0, w, h)
  } else {
    const colors =
      bg.colors.length >= 2 ? bg.colors : [bg.colors[0], darkenHex(bg.colors[0] ?? '#000000')]
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1), c))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
  }
}

function drawImageContain(
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

function drawImageCover(
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

function darkenHex(hex: string): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40)
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function useGridExporter() {
  const isExportingAll = ref(false)

  /**
   * Export all images from the grid in grid reading order (left→right, top→bottom).
   * Files are named by their 1-based grid position: 1.jpg, 3.jpg, 5.jpg, etc.
   * If only 1 image: direct JPEG download. If multiple: ZIP.
   */
  async function exportAll(
    gridLayout: (string | null)[],
    getItem: (id: string) => ImageItem | undefined,
    getElement: (id: string) => HTMLImageElement | undefined,
  ): Promise<void> {
    isExportingAll.value = true

    try {
      // Collect grid images in reading order with their 1-based grid position
      const entries: { position: number; item: ImageItem; img: HTMLImageElement }[] = []

      for (let i = 0; i < gridLayout.length; i++) {
        const id = gridLayout[i]
        if (!id) continue
        const item = getItem(id)
        const img = getElement(id)
        if (item && img) {
          entries.push({ position: i + 1, item, img })
        }
      }

      if (entries.length === 0) return

      if (entries.length === 1) {
        const { position, item, img } = entries[0]
        const blob = await renderToBlob(img, item)
        triggerDownload(blob, `instagram-${position}.jpg`)
        return
      }

      // Multiple images → ZIP; render all concurrently
      const zip = new JSZip()
      const blobs = await Promise.all(
        entries.map(async ({ position, item, img }) => ({
          position,
          blob: await renderToBlob(img, item),
        })),
      )

      for (const { position, blob } of blobs) {
        zip.file(`${position}.jpg`, blob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      triggerDownload(zipBlob, `instagram-grid-${Date.now()}.zip`)
    } finally {
      isExportingAll.value = false
    }
  }

  return { exportAll, isExportingAll }
}
