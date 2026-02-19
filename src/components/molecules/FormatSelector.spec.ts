import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormatSelector from './FormatSelector.vue'
import { InstagramFormat } from '@/types/image.types'

describe('FormatSelector', () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders all three format labels', () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.PORTRAIT } })
    expect(wrapper.text()).toContain('Portrait')
    expect(wrapper.text()).toContain('Square')
    expect(wrapper.text()).toContain('Landscape')
  })

  it('shows correct dimensions for each format', () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.PORTRAIT } })
    expect(wrapper.text()).toContain('1080×1350')
    expect(wrapper.text()).toContain('1080×1080')
    expect(wrapper.text()).toContain('1080×566')
  })

  it('shows aspect ratio badges', () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.PORTRAIT } })
    expect(wrapper.text()).toContain('4:5')
    expect(wrapper.text()).toContain('1:1')
    expect(wrapper.text()).toContain('1.91:1')
  })

  // ─── Selected state ────────────────────────────────────────────────────────

  it('highlights Portrait button when Portrait is selected', () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.PORTRAIT } })
    const buttons = wrapper.findAll('button')
    const portraitBtn = buttons.find((b) => b.text().includes('Portrait'))!
    expect(portraitBtn.classes()).toContain('border-indigo-500')
  })

  it('non-selected buttons have border-gray-200', () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.PORTRAIT } })
    const buttons = wrapper.findAll('button')
    const squareBtn = buttons.find((b) => b.text().includes('Square'))!
    const landscapeBtn = buttons.find((b) => b.text().includes('Landscape'))!
    expect(squareBtn.classes()).toContain('border-gray-200')
    expect(landscapeBtn.classes()).toContain('border-gray-200')
  })

  it('highlights Square button when Square is selected', () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.SQUARE } })
    const squareBtn = wrapper.findAll('button').find((b) => b.text().includes('Square'))!
    expect(squareBtn.classes()).toContain('border-indigo-500')
  })

  it('highlights Landscape button when Landscape is selected', () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.LANDSCAPE } })
    const landscapeBtn = wrapper.findAll('button').find((b) => b.text().includes('Landscape'))!
    expect(landscapeBtn.classes()).toContain('border-indigo-500')
  })

  // ─── Events ────────────────────────────────────────────────────────────────

  it('emits select with PORTRAIT when Portrait is clicked', async () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.SQUARE } })
    const portraitBtn = wrapper.findAll('button').find((b) => b.text().includes('Portrait'))!
    await portraitBtn.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([InstagramFormat.PORTRAIT])
  })

  it('emits select with SQUARE when Square is clicked', async () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.PORTRAIT } })
    const squareBtn = wrapper.findAll('button').find((b) => b.text().includes('Square'))!
    await squareBtn.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([InstagramFormat.SQUARE])
  })

  it('emits select with LANDSCAPE when Landscape is clicked', async () => {
    const wrapper = mount(FormatSelector, { props: { selectedFormat: InstagramFormat.PORTRAIT } })
    const landscapeBtn = wrapper.findAll('button').find((b) => b.text().includes('Landscape'))!
    await landscapeBtn.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([InstagramFormat.LANDSCAPE])
  })
})
