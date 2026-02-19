<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useImageStore } from '@/stores/useImageStore'
import ImageUploader from '@/components/molecules/ImageUploader.vue'
import ImageEditorPanel from '@/components/organisms/ImageEditorPanel.vue'
import InstagramGridPreview from '@/components/organisms/InstagramGridPreview.vue'
import ExportPanel from '@/components/organisms/ExportPanel.vue'

const store = useImageStore()

onUnmounted(() => {
  store.cleanup()
})
</script>

<template>
  <main class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-gray-900">Instagram Image Formatter</h1>
          <p class="text-xs text-gray-500 hidden sm:block">
            Upload · Format · Preview · Export at full resolution
          </p>
        </div>
        <button
          v-if="store.hasImage"
          type="button"
          class="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
          @click="store.cleanup()"
        >
          Start over
        </button>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">

      <!-- Error banner -->
      <div
        v-if="store.error"
        class="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-3"
      >
        <svg class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <p class="text-sm text-red-700">{{ store.error }}</p>
      </div>

      <!-- Upload zone -->
      <section v-if="!store.hasImage">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Format any image for Instagram</h2>
          <p class="text-gray-500 mt-1">
            Upload a landscape, portrait, or square photo — we'll fit it perfectly.
          </p>
        </div>
        <ImageUploader @file-selected="store.loadImage($event)" />
      </section>

      <!-- Editor (shown after upload) -->
      <template v-if="store.hasImage && store.originalImage && store.colorPalette">

        <!-- Section 1: Image editor -->
        <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-base font-semibold text-gray-900 mb-5">Edit & Format</h2>
          <ImageEditorPanel
            :original-image="store.originalImage"
            :processed-image="store.processedImage"
            :selected-format="store.selectedFormat"
            :selected-background="store.selectedBackground"
            :color-palette="store.colorPalette"
            :is-processing="store.isProcessing"
            @format-selected="store.setFormat($event)"
            @background-selected="store.setBackground($event)"
          />
        </section>

        <!-- Section 2: Instagram grid preview -->
        <section
          v-if="store.processedImage"
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <InstagramGridPreview :processed-image-url="store.processedImage.processedDataUrl" />
        </section>

        <!-- Section 3: Export -->
        <section v-if="store.processedImage" class="max-w-sm">
          <ExportPanel
            :selected-format="store.selectedFormat"
            :can-export="store.canExport"
            :is-exporting="store.isExporting"
            @export="store.triggerExport()"
          />
        </section>

      </template>
    </div>
  </main>
</template>
