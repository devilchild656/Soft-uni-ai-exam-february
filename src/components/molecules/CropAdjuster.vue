<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  imageUrl: string
  naturalWidth: number
  naturalHeight: number
  cropX: number
  cropY: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cropChange: [x: number, y: number]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)

let startClientX = 0
let startClientY = 0
let startCropX = 0
let startCropY = 0

function onPointerDown(e: PointerEvent): void {
  if (!containerRef.value) return
  isDragging.value = true
  startClientX = e.clientX
  startClientY = e.clientY
  startCropX = props.cropX
  startCropY = props.cropY
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (!isDragging.value || !containerRef.value) return

  const dx = e.clientX - startClientX
  const dy = e.clientY - startClientY

  const pW = containerRef.value.clientWidth
  const pH = containerRef.value.clientHeight

  // Scale that makes the image cover the container (same as object-fit: cover)
  const scale = Math.max(pW / props.naturalWidth, pH / props.naturalHeight)
  const dispW = props.naturalWidth * scale
  const dispH = props.naturalHeight * scale

  const overflowX = dispW - pW
  const overflowY = dispH - pH

  // Dragging left (dx < 0) reveals more of the right → cropX increases
  const newX = overflowX > 0.5 ? Math.max(0, Math.min(1, startCropX - dx / overflowX)) : 0.5
  const newY = overflowY > 0.5 ? Math.max(0, Math.min(1, startCropY - dy / overflowY)) : 0.5

  emit('cropChange', newX, newY)
}

function onPointerUp(): void {
  isDragging.value = false
}

const objectPosition = computed(() => `${props.cropX * 100}% ${props.cropY * 100}%`)
</script>

<template>
  <div
    ref="containerRef"
    class="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 h-72 select-none"
    :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <img
      :src="imageUrl"
      alt="Drag to reposition crop"
      class="w-full h-full object-cover pointer-events-none"
      :style="{ objectPosition }"
      draggable="false"
    />

    <!-- Drag hint (hidden while dragging) -->
    <div
      v-if="!isDragging"
      class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full pointer-events-none whitespace-nowrap"
    >
      Drag to reposition
    </div>
  </div>
</template>
