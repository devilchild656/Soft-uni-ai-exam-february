<script setup lang="ts">
import type { ImageItem } from '@/types/image.types'
import AppFileInput from '@/components/atoms/AppFileInput.vue'

interface Props {
  images: ImageItem[]
  activeImageId: string | null
  canAddMore: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  select: [id: string]
  remove: [id: string]
  filesAdded: [files: File[]]
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h2 class="text-base font-semibold text-gray-900">Images</h2>
        <span class="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
          {{ images.length }} / 9
        </span>
      </div>
    </div>

    <!-- Horizontal scrollable thumbnail strip -->
    <div class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      <!-- Thumbnail for each image -->
      <div
        v-for="img in images"
        :key="img.id"
        class="relative flex-shrink-0 cursor-pointer group"
        @click="emit('select', img.id)"
      >
        <!-- Thumbnail container -->
        <div
          :class="[
            'h-20 w-20 rounded-xl overflow-hidden border-2 transition-all duration-150',
            img.id === activeImageId
              ? 'border-indigo-500 shadow-md shadow-indigo-100'
              : 'border-transparent hover:border-gray-300',
          ]"
        >
          <img
            v-if="img.originalUrl"
            :src="img.processedDataUrl ?? img.originalUrl"
            :alt="img.originalFile.name"
            class="w-full h-full object-cover"
            draggable="false"
          />
          <!-- Placeholder while URL isn't ready yet -->
          <div v-else class="w-full h-full bg-gray-200 animate-pulse" />
        </div>

        <!-- Processing overlay -->
        <div
          v-if="img.isProcessing"
          class="absolute inset-0 rounded-xl bg-white/60 flex items-center justify-center"
        >
          <div
            class="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
          />
        </div>

        <!-- Active indicator label -->
        <div
          v-if="img.id === activeImageId"
          class="absolute bottom-1 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
        >
          Editing
        </div>

        <!-- Remove button (shown on hover) -->
        <button
          class="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
          title="Remove image"
          @click.stop="emit('remove', img.id)"
        >
          ×
        </button>
      </div>

      <!-- Add more button -->
      <AppFileInput
        v-if="canAddMore"
        accept="image/jpeg,image/png,image/webp"
        :multiple="true"
        @files-selected="emit('filesAdded', $event)"
      >
        <template #default="{ trigger }">
          <button
            class="flex-shrink-0 h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-indigo-500 transition-colors"
            title="Add more images"
            @click="trigger"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span class="text-[10px] font-medium">Add more</span>
          </button>
        </template>
      </AppFileInput>
    </div>
  </div>
</template>
