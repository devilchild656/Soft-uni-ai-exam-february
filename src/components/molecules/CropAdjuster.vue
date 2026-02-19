<script setup lang="ts">
import { ref, computed } from 'vue'
import type { InstagramFormat } from '@/types/image.types'
import { FORMAT_DIMENSIONS } from '@/types/image.types'

interface Props {
  imageUrl: string
  naturalWidth: number
  naturalHeight: number
  cropX: number
  cropY: number
  targetFormat: InstagramFormat
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cropChange: [x: number, y: number]
}>()

// ─── Presets ───────────────────────────────────────────────────────────────

const presets: { label: string; x: number; y: number }[] = [
  { label: '↖', x: 0, y: 0 },   { label: '↑', x: 0.5, y: 0 },   { label: '↗', x: 1, y: 0 },
  { label: '←', x: 0, y: 0.5 }, { label: '⊙', x: 0.5, y: 0.5 }, { label: '→', x: 1, y: 0.5 },
  { label: '↙', x: 0, y: 1 },   { label: '↓', x: 0.5, y: 1 },   { label: '↘', x: 1, y: 1 },
]

function isPresetActive(x: number, y: number): boolean {
  return Math.abs(props.cropX - x) < 0.13 && Math.abs(props.cropY - y) < 0.13
}

// ─── Container sizing ──────────────────────────────────────────────────────

const dims = computed(() => FORMAT_DIMENSIONS[props.targetFormat])

// Enforce the exact Instagram frame shape.
// max-height: 18rem — then the browser auto-shrinks width to maintain aspect-ratio.
const containerStyle = computed(() => ({
  aspectRatio: `${dims.value.width} / ${dims.value.height}`,
  maxHeight: '18rem',
  // For portrait (0.8) the computed width < 100%, so we clamp with min().
  // For landscape (1.91) the image is wide — width stays 100%, height < 18rem.
  width: `min(100%, calc(18rem * ${dims.value.width / dims.value.height}))`,
}))

// ─── Drag logic ────────────────────────────────────────────────────────────

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

  // Scale that makes the image cover the container — same formula as object-fit: cover
  const scale = Math.max(pW / props.naturalWidth, pH / props.naturalHeight)
  const dispW = props.naturalWidth * scale
  const dispH = props.naturalHeight * scale

  const overflowX = dispW - pW
  const overflowY = dispH - pH

  // Drag left → reveal more right side → cropX increases
  const newX = overflowX > 0.5 ? Math.max(0, Math.min(1, startCropX - dx / overflowX)) : 0.5
  const newY = overflowY > 0.5 ? Math.max(0, Math.min(1, startCropY - dy / overflowY)) : 0.5

  emit('cropChange', newX, newY)
}

function onPointerUp(): void {
  isDragging.value = false
}

// ─── Slider handlers ───────────────────────────────────────────────────────

function onSliderX(e: Event): void {
  emit('cropChange', parseInt((e.target as HTMLInputElement).value) / 100, props.cropY)
}

function onSliderY(e: Event): void {
  emit('cropChange', props.cropX, parseInt((e.target as HTMLInputElement).value) / 100)
}

// ─── CSS binding ───────────────────────────────────────────────────────────

const objectPosition = computed(() => `${props.cropX * 100}% ${props.cropY * 100}%`)
</script>

<template>
  <div class="space-y-3">

    <!-- Preview — correct Instagram frame shape -->
    <div class="flex justify-center">
      <div
        ref="containerRef"
        class="relative overflow-hidden rounded-xl border-2 select-none transition-colors"
        :class="isDragging ? 'cursor-grabbing border-indigo-400' : 'cursor-grab border-indigo-200 hover:border-indigo-300'"
        :style="containerStyle"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <!-- Image fills the frame at exactly this format's aspect ratio -->
        <img
          :src="imageUrl"
          alt="Drag to reposition crop"
          class="w-full h-full object-cover pointer-events-none"
          :style="{ objectPosition }"
          draggable="false"
        />

        <!-- Rule-of-thirds grid overlay (hidden while dragging) -->
        <div v-if="!isDragging" class="absolute inset-0 pointer-events-none">
          <div class="absolute top-0 bottom-0 left-1/3 w-px bg-white/30" />
          <div class="absolute top-0 bottom-0 left-2/3 w-px bg-white/30" />
          <div class="absolute left-0 right-0 top-1/3 h-px bg-white/30" />
          <div class="absolute left-0 right-0 top-2/3 h-px bg-white/30" />
        </div>

        <!-- Drag hint -->
        <div
          v-if="!isDragging"
          class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full pointer-events-none whitespace-nowrap"
        >
          Drag to reposition
        </div>
      </div>
    </div>

    <!-- Sliders for precise positioning -->
    <div class="space-y-2 px-1">
      <div class="flex items-center gap-3">
        <span class="text-xs font-medium text-gray-500 w-20 shrink-0">← Horizontal →</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="Math.round(cropX * 100)"
          class="flex-1 h-1.5 accent-indigo-500"
          @input="onSliderX"
        />
        <span class="text-xs tabular-nums text-gray-400 w-8 text-right">{{ Math.round(cropX * 100) }}%</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs font-medium text-gray-500 w-20 shrink-0">↑ Vertical ↓</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="Math.round(cropY * 100)"
          class="flex-1 h-1.5 accent-indigo-500"
          @input="onSliderY"
        />
        <span class="text-xs tabular-nums text-gray-400 w-8 text-right">{{ Math.round(cropY * 100) }}%</span>
      </div>
    </div>

    <!-- 9-point position presets -->
    <div class="px-1">
      <p class="text-xs text-gray-400 mb-1.5">Quick positions</p>
      <div class="grid grid-cols-9 gap-1">
        <button
          v-for="preset in presets"
          :key="preset.label"
          type="button"
          class="h-7 text-xs rounded-lg border transition-colors font-mono"
          :class="isPresetActive(preset.x, preset.y)
            ? 'bg-indigo-500 text-white border-indigo-500'
            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'"
          :title="`Position: ${preset.x * 100}% / ${preset.y * 100}%`"
          @click="emit('cropChange', preset.x, preset.y)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

  </div>
</template>
