import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the current router view', () => {
    const wrapper = mount(App, {
      global: { stubs: { RouterView: { template: '<main>Página atual</main>' } } },
    })
    expect(wrapper.text()).toContain('Página atual')
  })
})
