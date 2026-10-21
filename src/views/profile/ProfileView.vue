<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AppAlert from '@/components/AppAlert.vue'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { normalizeError } from '@/services/errors'
import { callRpc } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { BRAZIL_STATES } from '@/utils/validators'
const auth = useAuthStore()
const form = reactive({ fullName: '', crpNumber: '', crpState: '', revision: 0 })
const error = ref('')
const success = ref('')
const saving = ref(false)
const savedSnapshot = ref('')
const snapshot = computed(() => JSON.stringify(form))
const isDirty = computed(() => savedSnapshot.value !== '' && snapshot.value !== savedSnapshot.value)
useUnsavedChanges(isDirty)
watch(
  () => auth.profile,
  (profile) => {
    if (!profile) return
    Object.assign(form, {
      fullName: profile.fullName,
      crpNumber: profile.crpNumber,
      crpState: profile.crpState,
      revision: profile.revision,
    })
    savedSnapshot.value = snapshot.value
  },
  { immediate: true },
)
async function save() {
  saving.value = true
  error.value = ''
  const { error: failure } = await callRpc('update_profile', {
    p_full_name: form.fullName.trim(),
    p_crp_number: form.crpNumber.replace(/\D/g, ''),
    p_crp_state: form.crpState,
    p_expected_revision: form.revision,
  })
  saving.value = false
  if (failure) {
    error.value = normalizeError(failure).message
    return
  }
  await auth.loadProfile()
  success.value = 'Perfil atualizado.'
}
</script>
<template>
  <section class="page">
    <header class="page-heading">
      <div>
        <h1>Meu perfil</h1>
        <p>
          Esta identificação registra a autoria das alterações e aparece no prontuário exportado.
        </p>
      </div>
    </header>
    <form class="card stack profile" @submit.prevent="save">
      <AppAlert v-if="error" type="error" :message="error" /><AppAlert
        v-if="success"
        type="success"
        :message="success"
      />
      <div class="field">
        <label for="profile-name">Nome completo</label
        ><input id="profile-name" v-model="form.fullName" minlength="3" required />
      </div>
      <div class="field">
        <label for="profile-email">E-mail</label
        ><input id="profile-email" :value="auth.profile?.email" type="email" disabled /><small
          class="field-hint"
          >O e-mail de acesso não é alterado por este formulário.</small
        >
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="profile-state">UF do CRP</label
          ><select id="profile-state" v-model="form.crpState" required>
            <option v-for="state in BRAZIL_STATES" :key="state">{{ state }}</option>
          </select>
        </div>
        <div class="field">
          <label for="profile-crp">Número do CRP</label
          ><input
            id="profile-crp"
            v-model="form.crpNumber"
            inputmode="numeric"
            pattern="[0-9]{1,10}"
            required
          />
        </div>
      </div>
      <div class="actions">
        <button class="button button--primary" :disabled="saving">
          {{ saving ? 'Salvando…' : 'Salvar alterações' }}
        </button>
      </div>
    </form>
  </section>
</template>
<style scoped>
.profile {
  max-width: 680px;
}
</style>
