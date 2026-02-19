<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  accept?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
})

const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function trigger(): void {
  inputRef.value?.click()
}

function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('fileSelected', file)
    target.value = ''
  }
}

defineExpose({ trigger })
</script>

<template>
  <div>
    <input ref="inputRef" type="file" :accept="accept" class="sr-only" @change="handleChange" />
    <slot :trigger="trigger" />
  </div>
</template>
