<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CaptionSuggestions } from '@/types/image.types'

interface Props {
  suggestions: CaptionSuggestions | null
  isGenerating: boolean
  error: string | null
  canGenerate: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ generate: [] }>()

// ─── Local template state ──────────────────────────────────────────────────

const modelHandle = ref('model_name')
const photographerHandle = ref('photographer_name')
const placeText = ref('City, Country')
const copiedKey = ref<string | null>(null)

// ─── Template fill ─────────────────────────────────────────────────────────

function fillTemplate(template: string): string {
  const [city, country] = placeText.value.split(',').map((s) => s.trim())
  return template
    .replace(/\{model_handle\}/g, modelHandle.value.replace(/^@/, ''))
    .replace(/\{photographer_handle\}/g, photographerHandle.value.replace(/^@/, ''))
    .replace(/\{City\}/g, city ?? '')
    .replace(/\{Country\}/g, country ?? '')
}

// ─── Full caption builder ──────────────────────────────────────────────────

const fullCaption = computed(() => {
  if (!props.suggestions) return ''
  const { caption, hashtags, modelTemplate, photographerTemplate, placeTemplate } = props.suggestions
  const tagLine = hashtags.map((h) => `#${h}`).join(' ')
  return [
    caption,
    '',
    fillTemplate(modelTemplate),
    fillTemplate(photographerTemplate),
    fillTemplate(placeTemplate),
    '',
    tagLine,
  ].join('\n')
})

// ─── Copy helper ───────────────────────────────────────────────────────────

async function copyText(text: string, key: string): Promise<void> {
  await navigator.clipboard.writeText(text)
  copiedKey.value = key
  setTimeout(() => {
    copiedKey.value = null
  }, 2000)
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-2.5">
        <div class="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shrink-0">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900 leading-none">AI Caption &amp; Hashtags</h3>
          <span class="text-xs text-purple-600 font-medium">Powered by Claude</span>
        </div>
      </div>

      <!-- Generate button -->
      <button
        type="button"
        :disabled="!canGenerate || isGenerating"
        class="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all shrink-0"
        :class="
          canGenerate && !isGenerating
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-sm hover:shadow'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        "
        @click="emit('generate')"
      >
        <!-- Spinner while generating -->
        <svg v-if="isGenerating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        {{ isGenerating ? 'Analyzing photo…' : suggestions ? 'Regenerate' : 'Generate' }}
      </button>
    </div>

    <!-- Error banner -->
    <div
      v-if="error"
      class="text-xs bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl leading-relaxed"
    >
      {{ error }}
    </div>

    <!-- Empty state -->
    <div v-if="!suggestions && !isGenerating && !error" class="text-center py-8 text-gray-400">
      <svg
        class="w-12 h-12 mx-auto mb-3 opacity-30"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        />
      </svg>
      <p class="text-sm max-w-xs mx-auto">
        Click <span class="font-semibold text-purple-500">Generate</span> to get an AI-powered
        caption and hashtag suggestions tailored to this photo.
      </p>
    </div>

    <!-- Results -->
    <template v-if="suggestions">

      <!-- Caption -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Caption</span>
          <button
            class="text-xs font-semibold transition-colors"
            :class="copiedKey === 'caption' ? 'text-green-600' : 'text-indigo-600 hover:text-indigo-800'"
            @click="copyText(suggestions.caption, 'caption')"
          >
            {{ copiedKey === 'caption' ? '✓ Copied!' : 'Copy' }}
          </button>
        </div>
        <p
          class="text-sm text-gray-800 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed border border-gray-100"
        >
          {{ suggestions.caption }}
        </p>
      </div>

      <!-- Tags & Credits -->
      <div class="space-y-3">
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Tags &amp; Credits</span>
        <div class="space-y-2.5">

          <!-- Model -->
          <div class="flex items-center gap-3">
            <span class="text-sm w-28 shrink-0 text-gray-600">✨ Model</span>
            <div class="flex-1 flex items-center gap-1.5 bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5">
              <span class="text-gray-400 text-sm">@</span>
              <input
                v-model="modelHandle"
                type="text"
                placeholder="model_name"
                class="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-300"
              />
            </div>
          </div>

          <!-- Photographer -->
          <div class="flex items-center gap-3">
            <span class="text-sm w-28 shrink-0 text-gray-600">📸 Photographer</span>
            <div class="flex-1 flex items-center gap-1.5 bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5">
              <span class="text-gray-400 text-sm">@</span>
              <input
                v-model="photographerHandle"
                type="text"
                placeholder="photographer_name"
                class="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-300"
              />
            </div>
          </div>

          <!-- Location -->
          <div class="flex items-center gap-3">
            <span class="text-sm w-28 shrink-0 text-gray-600">📍 Location</span>
            <input
              v-model="placeText"
              type="text"
              placeholder="City, Country"
              class="flex-1 text-sm bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none text-gray-700 placeholder-gray-300"
            />
          </div>

        </div>
      </div>

      <!-- Hashtags -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Hashtags
            <span class="font-normal text-gray-400">({{ suggestions.hashtags.length }})</span>
          </span>
          <button
            class="text-xs font-semibold transition-colors"
            :class="copiedKey === 'hashtags' ? 'text-green-600' : 'text-indigo-600 hover:text-indigo-800'"
            @click="copyText(suggestions.hashtags.map((h) => `#${h}`).join(' '), 'hashtags')"
          >
            {{ copiedKey === 'hashtags' ? '✓ Copied all!' : 'Copy all' }}
          </button>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tag in suggestions.hashtags"
            :key="tag"
            type="button"
            class="text-xs px-2.5 py-1 rounded-full border transition-colors"
            :class="
              copiedKey === `tag-${tag}`
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200'
            "
            :title="`Click to copy #${tag}`"
            @click="copyText(`#${tag}`, `tag-${tag}`)"
          >
            #{{ tag }}
          </button>
        </div>
      </div>

      <!-- Copy full caption -->
      <button
        type="button"
        class="w-full py-2.5 text-sm font-semibold rounded-xl border-2 transition-all"
        :class="
          copiedKey === 'full'
            ? 'border-green-400 text-green-700 bg-green-50'
            : 'border-indigo-200 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50'
        "
        @click="copyText(fullCaption, 'full')"
      >
        {{ copiedKey === 'full' ? '✓ Full caption copied to clipboard!' : '📋 Copy Full Caption' }}
      </button>

    </template>
  </div>
</template>
