import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CaptionPanel from './CaptionPanel.vue'
import type { CaptionSuggestions } from '@/types/image.types'

const mockSuggestions: CaptionSuggestions = {
  caption:
    'Golden hour magic at its finest! The warm light painted everything in the most breathtaking hues. Have you ever stood in a moment so perfect you just had to capture it?',
  hashtags: ['sunset', 'goldenhour', 'photography', 'landscape', 'naturephotography'],
  modelTemplate: 'Model: @{model_handle} ✨',
  photographerTemplate: '📸 Photo: @{photographer_handle}',
  placeTemplate: '📍 {City}, {Country}',
}

const noSuggestionsProps = {
  suggestions: null as CaptionSuggestions | null,
  isGenerating: false,
  error: null as string | null,
  canGenerate: true,
}

const writeTextMock = vi.fn().mockResolvedValue(undefined)

// happy-dom exposes navigator.clipboard as a non-writable getter;
// use defineProperty so we can override it in tests.
beforeEach(() => {
  writeTextMock.mockClear()
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    configurable: true,
    writable: true,
  })
})

describe('CaptionPanel', () => {
  // ─── Header ────────────────────────────────────────────────────────────────

  it('renders the "AI Caption & Hashtags" heading', () => {
    const wrapper = mount(CaptionPanel, { props: noSuggestionsProps })
    expect(wrapper.text()).toContain('AI Caption')
    expect(wrapper.text()).toContain('Hashtags')
  })

  it('shows "Powered by Claude" subtitle', () => {
    const wrapper = mount(CaptionPanel, { props: noSuggestionsProps })
    expect(wrapper.text()).toContain('Powered by Claude')
  })

  // ─── Generate button ───────────────────────────────────────────────────────

  it('shows "Generate" label when no suggestions exist', () => {
    const wrapper = mount(CaptionPanel, { props: noSuggestionsProps })
    expect(wrapper.text()).toContain('Generate')
  })

  it('Generate button is disabled when canGenerate is false', () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, canGenerate: false },
    })
    const btn = wrapper.find('button[disabled]')
    expect(btn.exists()).toBe(true)
  })

  it('Generate button is enabled when canGenerate is true', () => {
    const wrapper = mount(CaptionPanel, { props: noSuggestionsProps })
    const btn = wrapper.get('button')
    expect((btn.element as HTMLButtonElement).disabled).toBe(false)
  })

  it('emits generate event when the button is clicked', async () => {
    const wrapper = mount(CaptionPanel, { props: noSuggestionsProps })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('generate')).toHaveLength(1)
  })

  // ─── Generating state ──────────────────────────────────────────────────────

  it('shows "Analyzing photo" while isGenerating is true', () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, isGenerating: true },
    })
    expect(wrapper.text()).toContain('Analyzing photo')
  })

  it('disables the button while generating', () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, isGenerating: true },
    })
    expect((wrapper.get('button').element as HTMLButtonElement).disabled).toBe(true)
  })

  // ─── Error state ───────────────────────────────────────────────────────────

  it('shows the error message when error prop is set', () => {
    const wrapper = mount(CaptionPanel, {
      props: {
        ...noSuggestionsProps,
        error: 'VITE_ANTHROPIC_API_KEY is not set.',
        canGenerate: false,
      },
    })
    expect(wrapper.text()).toContain('VITE_ANTHROPIC_API_KEY is not set.')
  })

  it('does not show an error banner when error is null', () => {
    const wrapper = mount(CaptionPanel, { props: noSuggestionsProps })
    expect(wrapper.find('.bg-red-50').exists()).toBe(false)
  })

  // ─── Empty state ───────────────────────────────────────────────────────────

  it('shows empty-state guidance text before generation', () => {
    const wrapper = mount(CaptionPanel, { props: noSuggestionsProps })
    const emptyState = wrapper.find('.text-gray-400')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('Generate')
  })

  // ─── Suggestions: caption ──────────────────────────────────────────────────

  it('renders the caption text when suggestions are provided', () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    expect(wrapper.text()).toContain(mockSuggestions.caption)
  })

  it('shows "Regenerate" label when suggestions already exist', () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    expect(wrapper.text()).toContain('Regenerate')
  })

  // ─── Suggestions: hashtags ─────────────────────────────────────────────────

  it('renders all hashtag chips', () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    mockSuggestions.hashtags.forEach((tag) => {
      expect(wrapper.text()).toContain(`#${tag}`)
    })
  })

  it('shows the hashtag count', () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    expect(wrapper.text()).toContain(`(${mockSuggestions.hashtags.length})`)
  })

  // ─── Suggestions: templates ────────────────────────────────────────────────

  it('renders model, photographer, and location inputs', () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    expect(wrapper.find('input[placeholder="model_name"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="photographer_name"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="City, Country"]').exists()).toBe(true)
  })

  it('model handle input is editable', async () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    const input = wrapper.get('input[placeholder="model_name"]')
    await input.setValue('jane_doe')
    expect((input.element as HTMLInputElement).value).toBe('jane_doe')
  })

  it('photographer handle input is editable', async () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    const input = wrapper.get('input[placeholder="photographer_name"]')
    await input.setValue('john_lens')
    expect((input.element as HTMLInputElement).value).toBe('john_lens')
  })

  it('location input is editable', async () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    const input = wrapper.get('input[placeholder="City, Country"]')
    await input.setValue('Paris, France')
    expect((input.element as HTMLInputElement).value).toBe('Paris, France')
  })

  // ─── Copy Full Caption ─────────────────────────────────────────────────────

  it('shows the "Copy Full Caption" button when suggestions exist', () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    expect(wrapper.text()).toContain('Copy Full Caption')
  })

  it('calls clipboard.writeText when Copy Full Caption is clicked', async () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    const copyBtn = wrapper.findAll('button').find((b) => b.text().includes('Copy Full Caption'))!
    await copyBtn.trigger('click')
    await flushPromises()
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
  })

  it('shows confirmation message after copying the full caption', async () => {
    const wrapper = mount(CaptionPanel, {
      props: { ...noSuggestionsProps, suggestions: mockSuggestions },
    })
    const copyBtn = wrapper.findAll('button').find((b) => b.text().includes('Copy Full Caption'))!
    await copyBtn.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Full caption copied to clipboard')
  })
})
