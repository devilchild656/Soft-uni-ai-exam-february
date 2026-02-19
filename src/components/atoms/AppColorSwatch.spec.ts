import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppColorSwatch from './AppColorSwatch.vue'

describe('AppColorSwatch', () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders a <button> element', () => {
    const wrapper = mount(AppColorSwatch, { props: { color: '#336699' } })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('sets the title attribute to the hex value', () => {
    const wrapper = mount(AppColorSwatch, { props: { color: '#abcdef' } })
    expect(wrapper.get('button').attributes('title')).toBe('#abcdef')
  })

  it('applies the color as inline background-color style', () => {
    const wrapper = mount(AppColorSwatch, { props: { color: '#ff0000' } })
    expect((wrapper.get('button').element as HTMLElement).style.backgroundColor).toBe('#ff0000')
  })

  // ─── Sizes ─────────────────────────────────────────────────────────────────

  it('applies md size by default', () => {
    const wrapper = mount(AppColorSwatch, { props: { color: '#000' } })
    const btn = wrapper.get('button')
    expect(btn.classes()).toContain('h-8')
    expect(btn.classes()).toContain('w-8')
  })

  it('applies sm size when size is sm', () => {
    const wrapper = mount(AppColorSwatch, { props: { color: '#000', size: 'sm' } })
    const btn = wrapper.get('button')
    expect(btn.classes()).toContain('h-6')
    expect(btn.classes()).toContain('w-6')
  })

  it('applies lg size when size is lg', () => {
    const wrapper = mount(AppColorSwatch, { props: { color: '#000', size: 'lg' } })
    const btn = wrapper.get('button')
    expect(btn.classes()).toContain('h-10')
    expect(btn.classes()).toContain('w-10')
  })

  // ─── Selected state ────────────────────────────────────────────────────────

  it('shows selected ring when selected is true', () => {
    const wrapper = mount(AppColorSwatch, { props: { color: '#ff0000', selected: true } })
    expect(wrapper.get('button').classes()).toContain('ring-indigo-500')
  })

  it('does not show ring when selected is false', () => {
    const wrapper = mount(AppColorSwatch, { props: { color: '#ff0000', selected: false } })
    expect(wrapper.get('button').classes()).not.toContain('ring-indigo-500')
  })

  // ─── Events ────────────────────────────────────────────────────────────────

  it('emits select with the color value when clicked', async () => {
    const wrapper = mount(AppColorSwatch, { props: { color: '#336699' } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual(['#336699'])
  })
})
