<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  gridLayout: (string | null)[]
  imageMap: Record<string, string>
  activeImageId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'swap-cells': [from: number, to: number]
  'assign-cell': [cellIndex: number]
}>()

const draggingFrom = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const TOTAL_CELLS = 9

// Staggered placeholder colors for cells without images
const placeholderColors = [
  '#e2e8f0',
  '#cbd5e1',
  '#e8edf5',
  '#d1d5db',
  '#e2e8f0',
  '#dce3ec',
  '#e2e8f0',
  '#cbd5e1',
  '#d4d8e0',
]

function getImageUrl(cellIndex: number): string | null {
  const imageId = props.gridLayout[cellIndex]
  if (!imageId) return null
  return props.imageMap[imageId] ?? null
}

function isActiveCell(cellIndex: number): boolean {
  return !!props.activeImageId && props.gridLayout[cellIndex] === props.activeImageId
}

function canAcceptDrop(cellIndex: number): boolean {
  return dragOverIndex.value === cellIndex && draggingFrom.value !== cellIndex
}

function onDragStart(event: DragEvent, index: number): void {
  draggingFrom.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(event: DragEvent, index: number): void {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverIndex.value = index
}

function onDragLeave(event: DragEvent): void {
  // Only clear if we're leaving the cell entirely (not a child element)
  const related = event.relatedTarget as HTMLElement | null
  if (!related || !(event.currentTarget as HTMLElement).contains(related)) {
    dragOverIndex.value = null
  }
}

function onDrop(event: DragEvent, index: number): void {
  event.preventDefault()
  if (draggingFrom.value !== null && draggingFrom.value !== index) {
    emit('swap-cells', draggingFrom.value, index)
  }
  draggingFrom.value = null
  dragOverIndex.value = null
}

function onDragEnd(): void {
  draggingFrom.value = null
  dragOverIndex.value = null
}

function onCellClick(cellIndex: number): void {
  if (!getImageUrl(cellIndex) && props.activeImageId) {
    emit('assign-cell', cellIndex)
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <h3 class="text-sm font-semibold text-gray-700">Instagram Profile Preview</h3>
      <span class="text-xs text-gray-400">
        Drag to rearrange · Click an empty cell to place the active image
      </span>
    </div>

    <!-- Instagram profile mockup -->
    <div
      class="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-xs mx-auto shadow-sm"
    >
      <!-- Fake profile header -->
      <div class="px-3 py-3 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex-shrink-0"
          />
          <div class="space-y-1.5">
            <div class="h-2.5 w-20 bg-gray-200 rounded-full" />
            <div class="h-2 w-14 bg-gray-100 rounded-full" />
          </div>
          <div class="ml-auto">
            <div class="h-7 w-16 bg-gray-100 rounded-md" />
          </div>
        </div>
        <div class="flex justify-around mt-3">
          <div class="text-center">
            <div class="h-2.5 w-6 bg-gray-200 rounded mx-auto mb-1" />
            <div class="h-2 w-8 bg-gray-100 rounded mx-auto" />
          </div>
          <div class="text-center">
            <div class="h-2.5 w-8 bg-gray-200 rounded mx-auto mb-1" />
            <div class="h-2 w-10 bg-gray-100 rounded mx-auto" />
          </div>
          <div class="text-center">
            <div class="h-2.5 w-6 bg-gray-200 rounded mx-auto mb-1" />
            <div class="h-2 w-8 bg-gray-100 rounded mx-auto" />
          </div>
        </div>
      </div>

      <!-- 3×3 draggable grid -->
      <div class="grid gap-0.5" style="grid-template-columns: repeat(3, 1fr)">
        <div
          v-for="i in TOTAL_CELLS"
          :key="i - 1"
          :draggable="!!getImageUrl(i - 1)"
          :class="[
            'aspect-square overflow-hidden relative transition-all duration-100 select-none',
            getImageUrl(i - 1) ? 'cursor-grab active:cursor-grabbing' : '',
            !getImageUrl(i - 1) && activeImageId ? 'cursor-pointer' : '',
            isActiveCell(i - 1) ? 'ring-2 ring-indigo-500 ring-inset' : '',
            canAcceptDrop(i - 1) ? 'ring-2 ring-indigo-300 ring-inset brightness-90' : '',
            draggingFrom === i - 1 ? 'opacity-50' : '',
          ]"
          :style="!getImageUrl(i - 1) ? { backgroundColor: placeholderColors[(i - 1) % placeholderColors.length] } : {}"
          @dragstart="onDragStart($event, i - 1)"
          @dragover="onDragOver($event, i - 1)"
          @dragleave="onDragLeave"
          @drop="onDrop($event, i - 1)"
          @dragend="onDragEnd"
          @click="onCellClick(i - 1)"
        >
          <!-- Image cell -->
          <img
            v-if="getImageUrl(i - 1)"
            :src="getImageUrl(i - 1)!"
            alt="Instagram post"
            class="w-full h-full object-cover pointer-events-none"
            draggable="false"
          />

          <!-- Empty cell — show "+" icon when there's an active image to place -->
          <div
            v-else-if="activeImageId"
            class="absolute inset-0 flex items-center justify-center opacity-20 hover:opacity-50 transition-opacity"
          >
            <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <p class="text-center text-xs text-gray-400">
      {{ gridLayout.filter(Boolean).length }} of 9 grid cells filled
    </p>
  </div>
</template>
