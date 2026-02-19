<script setup lang="ts">
interface Props {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-indigo-100 text-indigo-700',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
    ]"
  >
    {{ label }}
  </span>
</template>
