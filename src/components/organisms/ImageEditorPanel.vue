<script setup lang="ts">
import type { ProcessedImage, BackgroundOption, ColorPalette, FillMode } from '@/types/image.types'
import { InstagramFormat } from '@/types/image.types'
import FormatSelector from '@/components/molecules/FormatSelector.vue'
import ColorPaletteControl from '@/components/molecules/ColorPalette.vue'
import CropAdjuster from '@/components/molecules/CropAdjuster.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'

interface Props {
  originalImage: ProcessedImage
  processedImage: ProcessedImage | null
  selectedFormat: InstagramFormat
  selectedBackground: BackgroundOption
  colorPalette: ColorPalette
  fillMode: FillMode
  cropX: number
  cropY: number
  isProcessing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  formatSelected: [format: InstagramFormat]
  backgroundSelected: [background: BackgroundOption]
  fillModeSelected: [mode: FillMode]
  cropChange: [x: number, y: number]
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

      <!-- Processed / Crop adjuster -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-gray-700">
            {{ fillMode === 'crop' ? 'Reposition Crop' : 'Instagram Preview' }}
          </h3>
          <AppBadge :label="selectedFormat" variant="info" />
          <AppBadge :label="fillMode === 'crop' ? 'Crop' : 'Fill'" variant="success" />
        </div>

        <!-- Crop mode: interactive drag-to-reposition -->
        <CropAdjuster
          v-if="fillMode === 'crop'"
          :image-url="originalImage.originalUrl"
          :natural-width="originalImage.width"
          :natural-height="originalImage.height"
          :crop-x="cropX"
          :crop-y="cropY"
          :target-format="selectedFormat"
          @crop-change="(x, y) => emit('cropChange', x, y)"
        />

        <!-- Background fill mode: static processed preview -->
        <div
          v-else
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

    <!-- Fill mode toggle -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold text-gray-700">Fill Mode</h3>
      <div class="flex rounded-xl border border-gray-200 overflow-hidden divide-x divide-gray-200">
        <!-- Background fill option -->
        <button
          type="button"
          :class="[
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            fillMode === 'background'
              ? 'bg-indigo-50 text-indigo-700'
              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700',
          ]"
          @click="emit('fillModeSelected', 'background')"
        >
          <!-- Color swatch icon -->
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          Background fill
        </button>

        <!-- Auto crop option -->
        <button
          type="button"
          :class="[
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            fillMode === 'crop'
              ? 'bg-indigo-50 text-indigo-700'
              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700',
          ]"
          @click="emit('fillModeSelected', 'crop')"
        >
          <!-- Crop icon -->
          <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 9V5m0 0h4M3 5l4 4M21 15v4m0 0h-4m4 0l-4-4M9 3H5m0 0v4M5 3l4 4M15 21h4m0 0v-4m0 4l-4-4"
            />
          </svg>
          Auto crop
        </button>
      </div>

      <!-- Hint text per mode -->
      <p v-if="fillMode === 'background'" class="text-xs text-gray-400">
        Image fits inside the frame with a color or gradient background filling the padding.
      </p>
      <p v-else class="text-xs text-gray-400">
        Image is cropped to fill the entire frame — no background, no padding.
      </p>
    </div>

    <!-- Background color (hidden in crop mode) -->
    <div v-if="fillMode === 'background'" class="space-y-2">
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
