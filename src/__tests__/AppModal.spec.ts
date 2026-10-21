import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import AppModal from '@/components/AppModal.vue'

describe('AppModal', () => {
  it('exposes an accessible dialog and closes with Escape', async () => {
    const wrapper = mount(AppModal, {
      attachTo: document.body,
      props: { open: true, title: 'Confirmar remoção' },
      slots: { default: '<p>Conteúdo protegido.</p>' },
    })
    await nextTick()

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.textContent).toContain('Conteúdo protegido.')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
  })
})
