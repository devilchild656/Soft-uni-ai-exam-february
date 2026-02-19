import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CropAdjuster from './CropAdjuster.vue'
import { InstagramFormat } from '@/types/image.types'

// Tiny 1×1 GIF that loads without a network request
const BLANK_IMG =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const defaultProps = {
  imageUrl: BLANK_IMG,
  naturalWidth: 1600,
  naturalHeight: 1000,
  cropX: 0.5,
  cropY: 0.5,
  targetFormat: InstagramFormat.SQUARE,
}

describe('CropAdjuster', () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders the crop preview image', () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    expect(wrapper.find('img[alt="Drag to reposition crop"]').exists()).toBe(true)
  })

  it('shows the "Drag to reposition" hint by default', () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    expect(wrapper.text()).toContain('Drag to reposition')
  })

  it('renders both range sliders', () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    expect(wrapper.findAll('input[type="range"]')).toHaveLength(2)
  })

  it('shows the "Quick positions" label', () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    expect(wrapper.text()).toContain('Quick positions')
  })

  it('renders all 9 preset buttons', () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    const labels = ['↖', '↑', '↗', '←', '⊙', '→', '↙', '↓', '↘']
    labels.forEach((label) => {
      const btn = wrapper.findAll('button').find((b) => b.text() === label)
      expect(btn?.exists()).toBe(true)
    })
  })

  // ─── Aspect ratio ──────────────────────────────────────────────────────────

  it('sets correct aspect-ratio style for Square format', () => {
    const wrapper = mount(CropAdjuster, {
      props: { ...defaultProps, targetFormat: InstagramFormat.SQUARE },
    })
    const container = wrapper.find('.relative.overflow-hidden')
    expect((container.element as HTMLElement).style.aspectRatio).toContain('1080')
  })

  it('sets correct aspect-ratio style for Portrait format', () => {
    const wrapper = mount(CropAdjuster, {
      props: { ...defaultProps, targetFormat: InstagramFormat.PORTRAIT },
    })
    const container = wrapper.find('.relative.overflow-hidden')
    expect((container.element as HTMLElement).style.aspectRatio).toContain('1350')
  })

  it('sets correct aspect-ratio style for Landscape format', () => {
    const wrapper = mount(CropAdjuster, {
      props: { ...defaultProps, targetFormat: InstagramFormat.LANDSCAPE },
    })
    const container = wrapper.find('.relative.overflow-hidden')
    expect((container.element as HTMLElement).style.aspectRatio).toContain('566')
  })

  // ─── Preset buttons ────────────────────────────────────────────────────────

  it('emits cropChange(0, 0) when top-left ↖ preset is clicked', async () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    const btn = wrapper.findAll('button').find((b) => b.text() === '↖')!
    await btn.trigger('click')
    expect(wrapper.emitted('cropChange')?.[0]).toEqual([0, 0])
  })

  it('emits cropChange(0.5, 0.5) when center ⊙ preset is clicked', async () => {
    const wrapper = mount(CropAdjuster, { props: { ...defaultProps, cropX: 0, cropY: 0 } })
    const btn = wrapper.findAll('button').find((b) => b.text() === '⊙')!
    await btn.trigger('click')
    expect(wrapper.emitted('cropChange')?.[0]).toEqual([0.5, 0.5])
  })

  it('emits cropChange(1, 1) when bottom-right ↘ preset is clicked', async () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    const btn = wrapper.findAll('button').find((b) => b.text() === '↘')!
    await btn.trigger('click')
    expect(wrapper.emitted('cropChange')?.[0]).toEqual([1, 1])
  })

  it('emits cropChange(1, 0) when top-right ↗ preset is clicked', async () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    const btn = wrapper.findAll('button').find((b) => b.text() === '↗')!
    await btn.trigger('click')
    expect(wrapper.emitted('cropChange')?.[0]).toEqual([1, 0])
  })

  // ─── Active preset highlight ───────────────────────────────────────────────

  it('highlights the center ⊙ preset when cropX=0.5 and cropY=0.5', () => {
    const wrapper = mount(CropAdjuster, { props: { ...defaultProps, cropX: 0.5, cropY: 0.5 } })
    const btn = wrapper.findAll('button').find((b) => b.text() === '⊙')!
    expect(btn.classes()).toContain('bg-indigo-500')
  })

  it('highlights the ↖ preset when cropX=0 and cropY=0', () => {
    const wrapper = mount(CropAdjuster, { props: { ...defaultProps, cropX: 0, cropY: 0 } })
    const btn = wrapper.findAll('button').find((b) => b.text() === '↖')!
    expect(btn.classes()).toContain('bg-indigo-500')
  })

  // ─── Sliders ───────────────────────────────────────────────────────────────

  it('horizontal slider reflects cropX as a percentage', () => {
    const wrapper = mount(CropAdjuster, { props: { ...defaultProps, cropX: 0.75 } })
    const slider = wrapper.findAll('input[type="range"]')[0]
    expect(slider.element.value).toBe('75')
  })

  it('vertical slider reflects cropY as a percentage', () => {
    const wrapper = mount(CropAdjuster, { props: { ...defaultProps, cropY: 0.25 } })
    const slider = wrapper.findAll('input[type="range"]')[1]
    expect(slider.element.value).toBe('25')
  })

  it('emits cropChange when horizontal slider is moved', async () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    const slider = wrapper.findAll('input[type="range"]')[0]
    await slider.setValue('0')
    expect(wrapper.emitted('cropChange')?.[0]).toEqual([0, 0.5])
  })

  it('emits cropChange when vertical slider is moved', async () => {
    const wrapper = mount(CropAdjuster, { props: defaultProps })
    const slider = wrapper.findAll('input[type="range"]')[1]
    await slider.setValue('100')
    expect(wrapper.emitted('cropChange')?.[0]).toEqual([0.5, 1])
  })
})
