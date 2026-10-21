import type { User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { supabase } from '@/services/supabase'
import type { Profile } from '@/types/domain'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const isReady = ref(false)
  let unsubscribe: (() => void) | undefined

  const isAuthenticated = computed(() => Boolean(user.value))

  async function loadProfile() {
    if (!user.value) {
      profile.value = null
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .maybeSingle()
    if (data) {
      const row = data as Record<string, unknown>
      profile.value = {
        id: String(row.id),
        fullName: String(row.full_name),
        email: String(row.email),
        crpNumber: String(row.crp_number),
        crpState: String(row.crp_state),
        revision: Number(row.revision),
      }
    }
  }

  async function initialize() {
    if (isReady.value) return
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    await loadProfile()
    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      void loadProfile()
    })
    unsubscribe = () => listener.data.subscription.unsubscribe()
    isReady.value = true
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }
  function dispose() {
    unsubscribe?.()
  }

  return { user, profile, isReady, isAuthenticated, initialize, loadProfile, signOut, dispose }
})
