import Anthropic from '@anthropic-ai/sdk'
import { ref } from 'vue'
import type { CaptionSuggestions } from '@/types/image.types'

const PROMPT = `Analyze this photo and return ONLY a valid JSON object with this exact structure:
{
  "caption": "2-3 sentence engaging Instagram caption, conversational tone, ends with a question or call-to-action",
  "hashtags": ["array", "of", "28", "relevant", "hashtags", "no", "hash", "symbol", "mix", "of", "popular", "niche", "and", "trending"],
  "modelTemplate": "Model: @{model_handle} ✨",
  "photographerTemplate": "📸 Photo: @{photographer_handle}",
  "placeTemplate": "📍 {City}, {Country}"
}
Return only the JSON object — no markdown, no code fences, no explanation.`

export function useAiSuggestions() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function generateSuggestions(imageDataUrl: string): Promise<CaptionSuggestions | null> {
    const apiKey = (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined) ?? ''
    if (!apiKey) {
      error.value =
        'VITE_ANTHROPIC_API_KEY is not set. Create a .env file with your Anthropic API key to enable AI suggestions.'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

      // imageDataUrl is "data:image/jpeg;base64,<data>"
      const base64 = imageDataUrl.split(',')[1]
      if (!base64) throw new Error('Invalid image data URL')

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
              },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      })

      const raw =
        response.content[0]?.type === 'text' ? response.content[0].text.trim() : ''

      // Extract JSON object even if the model accidentally wraps it in markdown
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('AI returned an unexpected format. Please try again.')

      return JSON.parse(match[0]) as CaptionSuggestions
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to generate suggestions'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { generateSuggestions, isLoading, error }
}
