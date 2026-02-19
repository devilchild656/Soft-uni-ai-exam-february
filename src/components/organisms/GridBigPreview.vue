<script setup lang="ts">
interface Props {
  gridLayout: (string | null)[]
  imageMap: Record<string, string>
}

const props = defineProps<Props>()

const TOTAL_CELLS = 9

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
  const id = props.gridLayout[cellIndex]
  if (!id) return null
  return props.imageMap[id] ?? null
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <h3 class="text-sm font-semibold text-gray-700">Full Grid Preview</h3>
      <span class="text-xs text-gray-400">How your profile grid will look on Instagram</span>
    </div>

    <!-- Full-width 3×3 grid — no phone chrome, just the images -->
    <div
      class="grid gap-0.5 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
      style="grid-template-columns: repeat(3, 1fr)"
    >
      <div
        v-for="i in TOTAL_CELLS"
        :key="i - 1"
        class="aspect-square overflow-hidden relative"
        :style="!getImageUrl(i - 1) ? { backgroundColor: placeholderColors[i - 1] } : {}"
      >
        <!-- Processed image -->
        <img
          v-if="getImageUrl(i - 1)"
          :src="getImageUrl(i - 1)!"
          :alt="`Grid position ${i}`"
          class="w-full h-full object-cover"
          draggable="false"
        />

        <!-- Grid position number badge -->
        <div
          class="absolute top-1.5 left-1.5 h-5 min-w-5 px-1 rounded bg-black/40 text-white text-[10px] font-bold flex items-center justify-center leading-none"
        >
          {{ i }}
        </div>
      </div>
    </div>
  </div>
</template>
