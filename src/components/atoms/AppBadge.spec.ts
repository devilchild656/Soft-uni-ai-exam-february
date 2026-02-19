import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppBadge from './AppBadge.vue'

describe('AppBadge', () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders the label text', () => {
    const wrapper = mount(AppBadge, { props: { label: '4:5' } })
    expect(wrapper.text()).toContain('4:5')
  })

  it('renders as a <span>', () => {
    const wrapper = mount(AppBadge, { props: { label: 'Portrait' } })
    expect(wrapper.find('span').exists()).toBe(true)
  })

  // ─── Variants ──────────────────────────────────────────────────────────────

  it('applies default variant (gray) by default', () => {
    const wrapper = mount(AppBadge, { props: { label: 'Default' } })
    const span = wrapper.get('span')
    expect(span.classes()).toContain('bg-gray-100')
    expect(span.classes()).toContain('text-gray-700')
  })

  it('applies success variant (green)', () => {
    const wrapper = mount(AppBadge, { props: { label: 'Done', variant: 'success' } })
    const span = wrapper.get('span')
    expect(span.classes()).toContain('bg-green-100')
    expect(span.classes()).toContain('text-green-700')
  })

  it('applies warning variant (yellow)', () => {
    const wrapper = mount(AppBadge, { props: { label: 'Warning', variant: 'warning' } })
    const span = wrapper.get('span')
    expect(span.classes()).toContain('bg-yellow-100')
    expect(span.classes()).toContain('text-yellow-700')
  })

  it('applies info variant (indigo)', () => {
    const wrapper = mount(AppBadge, { props: { label: '1:1', variant: 'info' } })
    const span = wrapper.get('span')
    expect(span.classes()).toContain('bg-indigo-100')
    expect(span.classes()).toContain('text-indigo-700')
  })
})
