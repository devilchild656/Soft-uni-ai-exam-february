<script setup lang="ts">
interface Props {
  processedImageUrl: string
}

defineProps<Props>()

// 3×3 grid, center cell (index 4) = user's post
const CENTER_INDEX = 4
const TOTAL_CELLS = 9

// Staggered gray shades for placeholder cells (simulate other posts)
const placeholderColors = [
  '#e2e8f0',
  '#cbd5e1',
  '#e2e8f0',
  '#d1d5db',
  // center skipped
  '#e2e8f0',
  '#cbd5e1',
  '#e2e8f0',
  '#d1d5db',
]

function placeholderColor(cellIndex: number): string {
  const idx = cellIndex < CENTER_INDEX ? cellIndex : cellIndex - 1
  return placeholderColors[idx] ?? '#e5e7eb'
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <h3 class="text-sm font-semibold text-gray-700">Instagram Profile Preview</h3>
      <span class="text-xs text-gray-400">(highlighted cell = your post)</span>
    </div>

    <!-- Authentic Instagram profile mockup -->
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-xs mx-auto shadow-sm">

      <!-- Fake profile header -->
      <div class="px-3 py-3 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex-shrink-0" />
          <div class="space-y-1.5">
            <div class="h-2.5 w-20 bg-gray-200 rounded-full" />
            <div class="h-2 w-14 bg-gray-100 rounded-full" />
          </div>
          <div class="ml-auto">
            <div class="h-7 w-16 bg-gray-100 rounded-md" />
          </div>
        </div>
        <!-- Stats row -->
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

      <!-- 3×3 grid -->
      <div
        class="grid gap-0.5"
        style="grid-template-columns: repeat(3, 1fr)"
      >
        <template v-for="i in TOTAL_CELLS" :key="i - 1">
          <!-- Center cell: user's processed image -->
          <div
            v-if="i - 1 === CENTER_INDEX"
            class="aspect-square overflow-hidden relative ring-2 ring-indigo-500 ring-inset"
          >
            <img
              :src="processedImageUrl"
              alt="Your Instagram post"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Placeholder cells -->
          <div
            v-else
            class="aspect-square"
            :style="{ backgroundColor: placeholderColor(i - 1) }"
          />
        </template>
      </div>
    </div>
  </div>
</template>
