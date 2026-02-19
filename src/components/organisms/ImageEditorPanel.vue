<script setup lang="ts">
import type { ProcessedImage, BackgroundOption, ColorPalette } from '@/types/image.types'
import { InstagramFormat } from '@/types/image.types'
import FormatSelector from '@/components/molecules/FormatSelector.vue'
import ColorPaletteControl from '@/components/molecules/ColorPalette.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'

interface Props {
  originalImage: ProcessedImage
  processedImage: ProcessedImage | null
  selectedFormat: InstagramFormat
  selectedBackground: BackgroundOption
  colorPalette: ColorPalette
  isProcessing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  formatSelected: [format: InstagramFormat]
  backgroundSelected: [background: BackgroundOption]
}>()

function onSolidColor(color: string): void {
  emit('backgroundSelected', { type: 'solid', colors: [color] })
}

function onGradient(colors: string[]): void {
  emit('backgroundSelected', { type: 'gradient', colors })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Original vs Processed preview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Original -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-gray-700">Original</h3>
          <AppBadge :label="`${originalImage.width}×${originalImage.height}`" />
        </div>
        <div
          class="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-48 border border-gray-200"
        >
          <img
            :src="originalImage.originalUrl"
            alt="Original image"
            class="max-w-full max-h-72 object-contain"
          />
        </div>
      </div>

      <!-- Processed -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-gray-700">Instagram Preview</h3>
          <AppBadge :label="selectedFormat" variant="info" />
        </div>
        <div
          class="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-48 relative border border-gray-200"
        >
          <img
            v-if="processedImage"
            :src="processedImage.processedDataUrl"
            alt="Processed preview"
            class="max-w-full max-h-72 object-contain"
          />
          <div v-else class="text-sm text-gray-400">Processing...</div>

          <!-- Processing overlay -->
          <div
            v-if="isProcessing"
            class="absolute inset-0 bg-white/60 flex items-center justify-center"
          >
            <div
              class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Format selector -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold text-gray-700">Instagram Format</h3>
      <FormatSelector
        :selected-format="selectedFormat"
        @select="emit('formatSelected', $event)"
      />
    </div>

    <!-- Background color -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold text-gray-700">Background Fill</h3>
      <p class="text-xs text-gray-400">
        Colors extracted from your image. Select a solid color or gradient.
      </p>
      <ColorPaletteControl
        :dominant="colorPalette.dominant"
        :palette="colorPalette.palette"
        :selected-color="selectedBackground.colors[0]"
        :background-type="selectedBackground.type"
        @select-solid="onSolidColor"
        @select-gradient="onGradient"
      />
    </div>
  </div>
</template>
