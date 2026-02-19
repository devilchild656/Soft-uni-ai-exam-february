<script setup lang="ts">
interface Props {
  color: string
  selected?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  size: 'md',
})

defineEmits<{
  select: [color: string]
}>()

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}
</script>

<template>
  <button
    type="button"
    :title="color"
    :style="{ backgroundColor: color }"
    :class="[
      'rounded-full border-2 transition-all duration-150 cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
      sizeClasses[size],
      selected
        ? 'border-white ring-2 ring-indigo-500 scale-110'
        : 'border-gray-200 hover:scale-105',
    ]"
    @click="$emit('select', color)"
  />
</template>
