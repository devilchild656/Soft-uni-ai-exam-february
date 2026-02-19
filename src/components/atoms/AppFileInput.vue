<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  accept?: string
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
  multiple: false,
})

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function trigger(): void {
  inputRef.value?.click()
}

function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])
  if (files.length > 0) {
    emit('filesSelected', files)
    target.value = ''
  }
}

defineExpose({ trigger })
</script>

<template>
  <div>
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="sr-only"
      @change="handleChange"
    />
    <slot :trigger="trigger" />
  </div>
</template>
