<script setup lang="ts">
import { ref } from 'vue'
import AppFileInput from '@/components/atoms/AppFileInput.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const isDragging = ref(false)
const fileName = ref<string | null>(null)

function onFileSelected(file: File): void {
  fileName.value = file.name
  emit('fileSelected', file)
}

function onDrop(event: DragEvent): void {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    onFileSelected(file)
  }
}

function onDragOver(event: DragEvent): void {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave(): void {
  isDragging.value = false
}
</script>

<template>
  <div
    :class="[
      'border-2 border-dashed rounded-2xl p-10 text-center transition-colors duration-200',
      isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400 bg-white',
    ]"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div class="flex flex-col items-center gap-4">
      <svg
        class="h-14 w-14 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>

      <div class="space-y-1">
        <p class="text-base font-medium text-gray-700">
          {{ fileName ? 'Image loaded' : 'Upload an image' }}
        </p>
        <p v-if="fileName" class="text-sm text-indigo-600 font-medium truncate max-w-xs">
          {{ fileName }}
        </p>
        <p v-else class="text-sm text-gray-500">Drag and drop or click to browse</p>
      </div>

      <AppFileInput accept="image/jpeg,image/png,image/webp,image/gif" @file-selected="onFileSelected">
        <template #default="{ trigger }">
          <AppButton variant="secondary" @click="trigger">
            {{ fileName ? 'Change image' : 'Browse files' }}
          </AppButton>
        </template>
      </AppFileInput>

      <p class="text-xs text-gray-400">JPG, PNG, WEBP supported · Max recommended 20MB</p>
    </div>
  </div>
</template>
