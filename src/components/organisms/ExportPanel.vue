<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'
import { InstagramFormat, FORMAT_DIMENSIONS } from '@/types/image.types'

interface Props {
  selectedFormat: InstagramFormat
  canExport: boolean
  isExporting: boolean
  gridImageCount: number
  canExportAll: boolean
  isExportingAll: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  export: []
  exportAll: []
}>()

const dims = computed(() => FORMAT_DIMENSIONS[props.selectedFormat])

const exportAllLabel = computed(() => {
  if (props.isExportingAll) return 'Packaging ZIP…'
  if (props.gridImageCount === 1) return 'Download (1 image)'
  return `Download all as ZIP (${props.gridImageCount} images)`
})
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5 space-y-5 shadow-sm">
    <h3 class="text-sm font-semibold text-gray-700">Export for Instagram</h3>

    <!-- ── Export active image ── -->
    <div class="space-y-3">
      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Active image</p>

      <div class="flex flex-wrap gap-2">
        <AppBadge :label="`${dims.width} × ${dims.height} px`" variant="info" />
        <AppBadge label="JPEG · 95%" variant="success" />
      </div>

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
        {{ isExporting ? 'Exporting…' : 'Download for Instagram' }}
      </AppButton>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-100" />

    <!-- ── Export all grid images ── -->
    <div class="space-y-3">
      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">All grid images</p>

      <ul class="text-xs text-gray-500 space-y-1">
        <li class="flex items-center gap-1.5">
          <span class="text-green-500">✓</span> Named by grid position (1.jpg, 2.jpg, …)
        </li>
        <li class="flex items-center gap-1.5">
          <span class="text-green-500">✓</span> Full resolution · 95% JPEG quality
        </li>
        <li v-if="gridImageCount > 1" class="flex items-center gap-1.5">
          <span class="text-green-500">✓</span> Packaged as a single ZIP file
        </li>
      </ul>

      <AppButton
        variant="secondary"
        :loading="isExportingAll"
        :disabled="!canExportAll"
        class="w-full"
        @click="emit('exportAll')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {{ exportAllLabel }}
      </AppButton>
    </div>
  </div>
</template>
