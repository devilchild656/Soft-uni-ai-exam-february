import { ref, shallowRef, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ProcessedImage, BackgroundOption, ColorPalette } from '@/types/image.types'
import { InstagramFormat } from '@/types/image.types'
import { useImageProcessor } from '@/composables/useImageProcessor'
import { useColorExtractor } from '@/composables/useColorExtractor'
import { useImageExporter } from '@/composables/useImageExporter'

export const useImageStore = defineStore('image', () => {
  const originalImage = shallowRef<ProcessedImage | null>(null)
  const processedImage = shallowRef<ProcessedImage | null>(null)
  const selectedFormat = ref<InstagramFormat>(InstagramFormat.PORTRAIT)
  const selectedBackground = ref<BackgroundOption>({ type: 'solid', colors: ['#6b7280'] })
  const colorPalette = ref<ColorPalette | null>(null)
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  const imageElement = shallowRef<HTMLImageElement | null>(null)

  const { detectFormat, processImage } = useImageProcessor()
  const { extractColors } = useColorExtractor()
  const { exportImage, isExporting } = useImageExporter()

  const hasImage = computed(() => originalImage.value !== null)
  const hasProcessedImage = computed(() => processedImage.value !== null)
  const canExport = computed(
    () => hasProcessedImage.value && !isProcessing.value && !isExporting.value,
  )

  async function loadImage(file: File): Promise<void> {
    isProcessing.value = true
    error.value = null

    if (originalImage.value?.originalUrl) {
      URL.revokeObjectURL(originalImage.value.originalUrl)
    }

    try {
      const objectUrl = URL.createObjectURL(file)
      const img = await loadImageElement(objectUrl)

      imageElement.value = img

      const palette = extractColors(img)
      colorPalette.value = palette

      selectedBackground.value = {
        type: 'solid',
        colors: [palette.dominant],
      }

      const detectedFormat = detectFormat(img.naturalWidth, img.naturalHeight)
      selectedFormat.value = detectedFormat

      originalImage.value = {
        originalFile: file,
        originalUrl: objectUrl,
        processedDataUrl: objectUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: detectedFormat,
      }

      await processCurrentImage()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load image'
    } finally {
      isProcessing.value = false
    }
  }

  async function processCurrentImage(): Promise<void> {
    if (!imageElement.value || !originalImage.value) return

    isProcessing.value = true
    error.value = null

    try {
      const dataUrl = await new Promise<string>((resolve) => {
        requestAnimationFrame(() => {
          resolve(
            processImage(
              imageElement.value!,
              selectedFormat.value,
              selectedBackground.value,
            ),
          )
        })
      })

      processedImage.value = {
        ...originalImage.value,
        processedDataUrl: dataUrl,
        format: selectedFormat.value,
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to process image'
    } finally {
      isProcessing.value = false
    }
  }

  function setFormat(format: InstagramFormat): void {
    selectedFormat.value = format
    void processCurrentImage()
  }

  function setBackground(background: BackgroundOption): void {
    selectedBackground.value = background
    void processCurrentImage()
  }

  async function triggerExport(): Promise<void> {
    if (!imageElement.value || !processedImage.value) return
    await exportImage(imageElement.value, selectedFormat.value, selectedBackground.value)
  }

  function cleanup(): void {
    if (originalImage.value?.originalUrl) {
      URL.revokeObjectURL(originalImage.value.originalUrl)
    }
    originalImage.value = null
    processedImage.value = null
    imageElement.value = null
    colorPalette.value = null
    error.value = null
  }

  return {
    originalImage,
    processedImage,
    selectedFormat,
    selectedBackground,
    colorPalette,
    isProcessing,
    isExporting,
    error,
    hasImage,
    hasProcessedImage,
    canExport,
    loadImage,
    processCurrentImage,
    setFormat,
    setBackground,
    triggerExport,
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
