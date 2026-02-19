<script setup lang="ts">
import AppColorSwatch from '@/components/atoms/AppColorSwatch.vue'

interface Props {
  dominant: string
  palette: string[]
  selectedColor: string
  backgroundType: 'solid' | 'gradient'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectSolid: [color: string]
  selectGradient: [colors: string[]]
}>()

function getGradientColors(): string[] {
  if (props.palette.length >= 2) {
    return [props.dominant, props.palette[1]]
  }
  return [props.dominant, darkenHex(props.dominant)]
}

function darkenHex(hex: string): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40)
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-gray-500 w-16">Dominant</span>
        <AppColorSwatch
          :color="dominant"
          size="lg"
          :selected="backgroundType === 'solid' && selectedColor === dominant"
          @select="emit('selectSolid', $event)"
        />
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-medium text-gray-500 w-16">Palette</span>
        <AppColorSwatch
          v-for="color in palette"
          :key="color"
          :color="color"
          size="md"
          :selected="backgroundType === 'solid' && selectedColor === color"
          @select="emit('selectSolid', $event)"
        />
      </div>
    </div>

    <div class="flex items-center gap-3">
      <span class="text-xs font-medium text-gray-500 w-16">Gradient</span>
      <button
        type="button"
        :style="{
          background: `linear-gradient(to bottom, ${dominant}, ${palette[1] ?? darkenHex(dominant)})`,
        }"
        :class="[
          'h-8 w-16 rounded-lg border-2 transition-all duration-150',
          backgroundType === 'gradient'
            ? 'border-indigo-500 ring-2 ring-indigo-500 scale-110'
            : 'border-gray-200 hover:scale-105',
        ]"
        title="Apply gradient background"
        @click="emit('selectGradient', getGradientColors())"
      />
    </div>
  </div>
</template>
