import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ImageItem, BackgroundOption, FillMode } from '@/types/image.types'
import { InstagramFormat } from '@/types/image.types'
import { useImageProcessor } from '@/composables/useImageProcessor'
import { useColorExtractor } from '@/composables/useColorExtractor'
import { useImageExporter } from '@/composables/useImageExporter'
import { useGridExporter } from '@/composables/useGridExporter'

const MAX_IMAGES = 9

export const useImageStore = defineStore('image', () => {
  const images = ref<ImageItem[]>([])
  const activeImageId = ref<string | null>(null)
  const gridLayout = ref<(string | null)[]>(Array(MAX_IMAGES).fill(null))
  const error = ref<string | null>(null)

  // Internal: keeps HTMLImageElement references (not reactive — no need)
  const imageElements = new Map<string, HTMLImageElement>()

  const { detectFormat, processImage } = useImageProcessor()
  const { extractColors } = useColorExtractor()
  const { exportImage, isExporting } = useImageExporter()
  const { exportAll: exportAllImages, isExportingAll } = useGridExporter()

  // --- Computed ---

  const hasImages = computed(() => images.value.length > 0)

  const gridImageCount = computed(
    () => gridLayout.value.filter((id) => id !== null).length,
  )

  const canExportAll = computed(
    () => gridImageCount.value > 0 && !isExportingAll.value && !isExporting.value,
  )

  const activeImage = computed<ImageItem | null>(
    () => images.value.find((img) => img.id === activeImageId.value) ?? null,
  )

  const canExport = computed(
    () => !!activeImage.value?.processedDataUrl && !isExporting.value,
  )

  const imageMap = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const img of images.value) {
      if (img.processedDataUrl) {
        map[img.id] = img.processedDataUrl
      }
    }
    return map
  })

  // --- Helpers ---

  function updateImage(id: string, changes: Partial<ImageItem>): void {
    const idx = images.value.findIndex((img) => img.id === id)
    if (idx !== -1) {
      images.value[idx] = { ...images.value[idx], ...changes }
    }
  }

  function generateId(): string {
    return `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  }

  // --- Actions ---

  async function addImages(files: File[]): Promise<void> {
    error.value = null
    const validFiles = files.filter((f) => f.type.startsWith('image/'))
    const slotsAvailable = MAX_IMAGES - images.value.length
    const filesToAdd = validFiles.slice(0, slotsAvailable)
    if (filesToAdd.length === 0) return

    // Pre-create all items and assign grid slots synchronously so there are no race conditions
    const tasks: { id: string; file: File }[] = []
    for (const file of filesToAdd) {
      const id = generateId()

      const placeholder: ImageItem = {
        id,
        originalFile: file,
        originalUrl: '',
        processedDataUrl: null,
        selectedFormat: InstagramFormat.PORTRAIT,
        selectedBackground: { type: 'solid', colors: ['#6b7280'] },
        fillMode: 'background',
        cropX: 0.5,
        cropY: 0.5,
        colorPalette: null,
        isProcessing: true,
        width: 0,
        height: 0,
      }

      images.value.push(placeholder)

      // Assign to first free grid slot
      const freeSlot = gridLayout.value.findIndex((slot) => slot === null)
      if (freeSlot !== -1) {
        gridLayout.value[freeSlot] = id
      }

      // First image becomes active
      if (!activeImageId.value) {
        activeImageId.value = id
      }

      tasks.push({ id, file })
    }

    // Process all images concurrently
    await Promise.all(tasks.map(({ id, file }) => loadAndProcessImage(id, file)))
  }

  async function loadAndProcessImage(id: string, file: File): Promise<void> {
    try {
      const objectUrl = URL.createObjectURL(file)
      const img = await loadImageElement(objectUrl)
      imageElements.set(id, img)

      const palette = extractColors(img)
      const detectedFormat = detectFormat(img.naturalWidth, img.naturalHeight)
      const background: BackgroundOption = { type: 'solid', colors: [palette.dominant] }

      updateImage(id, {
        originalUrl: objectUrl,
        selectedFormat: detectedFormat,
        selectedBackground: background,
        colorPalette: palette,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })

      const dataUrl = await renderImage(img, detectedFormat, background, 'background')
      updateImage(id, { processedDataUrl: dataUrl, isProcessing: false })
    } catch (e) {
      updateImage(id, { isProcessing: false })
      error.value = e instanceof Error ? e.message : 'Failed to load image'
    }
  }

  async function reprocessImage(id: string): Promise<void> {
    const img = imageElements.get(id)
    const item = images.value.find((i) => i.id === id)
    if (!img || !item) return

    try {
      const dataUrl = await renderImage(
        img,
        item.selectedFormat,
        item.selectedBackground,
        item.fillMode,
        item.cropX,
        item.cropY,
      )
      updateImage(id, { processedDataUrl: dataUrl, isProcessing: false })
    } catch (e) {
      updateImage(id, { isProcessing: false })
      error.value = e instanceof Error ? e.message : 'Failed to process image'
    }
  }

  function renderImage(
    img: HTMLImageElement,
    format: InstagramFormat,
    background: BackgroundOption,
    fillMode: FillMode,
    cropX = 0.5,
    cropY = 0.5,
  ): Promise<string> {
    return new Promise<string>((resolve) => {
      requestAnimationFrame(() => {
        resolve(processImage(img, format, background, fillMode, cropX, cropY))
      })
    })
  }

  function setActiveImage(id: string): void {
    activeImageId.value = id
  }

  function setFormat(format: InstagramFormat): void {
    const id = activeImageId.value
    if (!id) return
    updateImage(id, { selectedFormat: format, isProcessing: true })
    void reprocessImage(id)
  }

  function setBackground(background: BackgroundOption): void {
    const id = activeImageId.value
    if (!id) return
    updateImage(id, { selectedBackground: background, isProcessing: true })
    void reprocessImage(id)
  }

  function setFillMode(fillMode: FillMode): void {
    const id = activeImageId.value
    if (!id) return
    updateImage(id, { fillMode, isProcessing: true })
    void reprocessImage(id)
  }

  let cropDebounceTimer: ReturnType<typeof setTimeout> | null = null

  function setCropOffset(x: number, y: number): void {
    const id = activeImageId.value
    if (!id) return
    updateImage(id, { cropX: x, cropY: y })
    if (cropDebounceTimer) clearTimeout(cropDebounceTimer)
    cropDebounceTimer = setTimeout(() => {
      cropDebounceTimer = null
      void reprocessImage(id)
    }, 80)
  }

  async function triggerExport(): Promise<void> {
    const id = activeImageId.value
    if (!id) return
    const img = imageElements.get(id)
    const item = images.value.find((i) => i.id === id)
    if (!img || !item) return
    await exportImage(img, item.selectedFormat, item.selectedBackground, item.fillMode, undefined, item.cropX, item.cropY)
  }

  async function triggerExportAll(): Promise<void> {
    await exportAllImages(
      gridLayout.value,
      (id) => images.value.find((i) => i.id === id),
      (id) => imageElements.get(id),
    )
  }

  function removeImage(id: string): void {
    const item = images.value.find((img) => img.id === id)
    if (item?.originalUrl) {
      URL.revokeObjectURL(item.originalUrl)
    }
    imageElements.delete(id)
    images.value = images.value.filter((img) => img.id !== id)

    // Clear from grid
    for (let i = 0; i < gridLayout.value.length; i++) {
      if (gridLayout.value[i] === id) {
        gridLayout.value[i] = null
      }
    }

    // Update active image
    if (activeImageId.value === id) {
      activeImageId.value = images.value[0]?.id ?? null
    }
  }

  function swapGridCells(from: number, to: number): void {
    const temp = gridLayout.value[from]
    gridLayout.value[from] = gridLayout.value[to]
    gridLayout.value[to] = temp
  }

  function assignToGrid(imageId: string, cellIndex: number): void {
    // Remove existing assignment for this image
    for (let i = 0; i < gridLayout.value.length; i++) {
      if (gridLayout.value[i] === imageId) {
        gridLayout.value[i] = null
      }
    }
    gridLayout.value[cellIndex] = imageId
  }

  function cleanup(): void {
    for (const img of images.value) {
      if (img.originalUrl) {
        URL.revokeObjectURL(img.originalUrl)
      }
    }
    images.value = []
    activeImageId.value = null
    gridLayout.value = Array(MAX_IMAGES).fill(null)
    imageElements.clear()
    error.value = null
  }

  return {
    images,
    activeImageId,
    activeImage,
    gridLayout,
    imageMap,
    gridImageCount,
    isExporting,
    isExportingAll,
    error,
    hasImages,
    canExport,
    canExportAll,
    addImages,
    setActiveImage,
    setFormat,
    setBackground,
    setFillMode,
    setCropOffset,
    triggerExport,
    triggerExportAll,
    removeImage,
    swapGridCells,
    assignToGrid,
    cleanup,
  }
})

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to decode image. Please use JPG, PNG, or WEBP.'))
    img.src = src
  })
}
