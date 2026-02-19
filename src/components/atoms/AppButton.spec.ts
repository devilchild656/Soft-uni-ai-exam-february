import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from './AppButton.vue'

describe('AppButton', () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders slot content', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Save changes' } })
    expect(wrapper.text()).toContain('Save changes')
  })

  it('renders a <button> element', () => {
    const wrapper = mount(AppButton, { slots: { default: 'OK' } })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  // ─── Variants ──────────────────────────────────────────────────────────────

  it('applies primary styles by default', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Primary' } })
    expect(wrapper.get('button').classes()).toContain('bg-indigo-600')
  })

  it('applies secondary styles when variant is secondary', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Secondary' },
      props: { variant: 'secondary' },
    })
    expect(wrapper.get('button').classes()).toContain('bg-gray-200')
  })

  it('applies ghost styles when variant is ghost', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Ghost' },
      props: { variant: 'ghost' },
    })
    expect(wrapper.get('button').classes()).toContain('bg-transparent')
  })

  // ─── Disabled state ────────────────────────────────────────────────────────

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Disabled' },
      props: { disabled: true },
    })
    expect((wrapper.get('button').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('is not disabled by default', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Active' } })
    expect((wrapper.get('button').element as HTMLButtonElement).disabled).toBe(false)
  })

  // ─── Loading state ─────────────────────────────────────────────────────────

  it('shows a spinner when loading is true', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Saving…' },
      props: { loading: true },
    })
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('is disabled while loading', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Saving…' },
      props: { loading: true },
    })
    expect((wrapper.get('button').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not show spinner when loading is false', () => {
    const wrapper = mount(AppButton, { slots: { default: 'OK' } })
    expect(wrapper.find('.animate-spin').exists()).toBe(false)
  })

  // ─── Click event ───────────────────────────────────────────────────────────

  it('emits click when clicked and not disabled', async () => {
    const wrapper = mount(AppButton, { slots: { default: 'Click me' } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
