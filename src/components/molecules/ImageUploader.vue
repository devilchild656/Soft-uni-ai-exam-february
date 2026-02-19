<script setup lang="ts">
import { ref } from 'vue'
import AppFileInput from '@/components/atoms/AppFileInput.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const isDragging = ref(false)

function onFilesSelected(files: File[]): void {
  emit('filesSelected', files)
}

function onDrop(event: DragEvent): void {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
    f.type.startsWith('image/'),
  )
  if (files.length > 0) {
    onFilesSelected(files)
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
        <p class="text-base font-medium text-gray-700">Upload images for Instagram</p>
        <p class="text-sm text-gray-500">Drag and drop or click to browse — up to 9 images</p>
      </div>

      <AppFileInput
        accept="image/jpeg,image/png,image/webp"
        :multiple="true"
        @files-selected="onFilesSelected"
      >
        <template #default="{ trigger }">
          <AppButton variant="secondary" @click="trigger">Browse files</AppButton>
        </template>
      </AppFileInput>

      <p class="text-xs text-gray-400">JPG, PNG, WEBP supported · Max recommended 20MB each</p>
    </div>
  </div>
</template>
