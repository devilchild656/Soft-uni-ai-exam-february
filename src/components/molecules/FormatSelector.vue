<script setup lang="ts">
import { InstagramFormat } from '@/types/image.types'
import AppBadge from '@/components/atoms/AppBadge.vue'

interface Props {
  selectedFormat: InstagramFormat
}

defineProps<Props>()

const emit = defineEmits<{
  select: [format: InstagramFormat]
}>()

const formats = [
  {
    value: InstagramFormat.PORTRAIT,
    label: 'Portrait',
    ratio: '4:5',
    dims: '1080×1350',
    boxWidth: 'w-8',
    boxHeight: 'h-10',
  },
  {
    value: InstagramFormat.SQUARE,
    label: 'Square',
    ratio: '1:1',
    dims: '1080×1080',
    boxWidth: 'w-10',
    boxHeight: 'h-10',
  },
  {
    value: InstagramFormat.LANDSCAPE,
    label: 'Landscape',
    ratio: '1.91:1',
    dims: '1080×566',
    boxWidth: 'w-14',
    boxHeight: 'h-7',
  },
] as const
</script>

<template>
  <div class="flex gap-3 flex-wrap">
    <button
      v-for="fmt in formats"
      :key="fmt.value"
      type="button"
      :class="[
        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        selectedFormat === fmt.value
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 hover:border-gray-300 bg-white',
      ]"
      @click="emit('select', fmt.value)"
    >
      <div
        :class="[
          'rounded border-2 transition-colors',
          fmt.boxWidth,
          fmt.boxHeight,
          selectedFormat === fmt.value
            ? 'border-indigo-400 bg-indigo-200'
            : 'border-gray-300 bg-gray-100',
        ]"
      />
      <span class="text-xs font-semibold text-gray-700">{{ fmt.label }}</span>
      <AppBadge :label="fmt.ratio" variant="info" />
      <span class="text-[10px] text-gray-400">{{ fmt.dims }}</span>
    </button>
  </div>
</template>
