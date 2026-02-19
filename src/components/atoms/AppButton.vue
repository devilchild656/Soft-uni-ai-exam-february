<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  loading: false,
  type: 'button',
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm',
      'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
    ]"
    @click="$emit('click', $event)"
  >
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
    <slot />
  </button>
</template>
