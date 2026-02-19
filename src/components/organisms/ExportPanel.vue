<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import { InstagramFormat, FORMAT_DIMENSIONS } from '@/types/image.types'

interface Props {
  selectedFormat: InstagramFormat
  canExport: boolean
  isExporting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  export: []
}>()

const dims = computed(() => FORMAT_DIMENSIONS[props.selectedFormat])
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
    <h3 class="text-sm font-semibold text-gray-700">Export for Instagram</h3>

    <div class="flex flex-wrap gap-2">
      <AppBadge :label="`${dims.width} × ${dims.height} px`" variant="info" />
      <AppBadge label="JPEG · 95% quality" variant="success" />
    </div>

    <ul class="text-xs text-gray-500 space-y-1">
      <li class="flex items-center gap-1.5">
        <span class="text-green-500">✓</span> Full Instagram resolution
      </li>
      <li class="flex items-center gap-1.5">
        <span class="text-green-500">✓</span> High-quality JPEG (95%) — minimal recompression
      </li>
      <li class="flex items-center gap-1.5">
        <span class="text-green-500">✓</span> Background rendered at full resolution
      </li>
    </ul>

    <AppButton
      variant="primary"
      :loading="isExporting"
      :disabled="!canExport"
      class="w-full"
      @click="emit('export')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {{ isExporting ? 'Exporting...' : 'Download for Instagram' }}
    </AppButton>
  </div>
</template>
