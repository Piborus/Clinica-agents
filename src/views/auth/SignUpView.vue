<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppAlert from '@/components/AppAlert.vue'
import { signUp } from '@/services/authService'
import { BRAZIL_STATES } from '@/utils/validators'
import AuthCard from './AuthCard.vue'

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  crpNumber: '',
  crpState: '',
})
const error = ref('')
const isLoading = ref(false)
const router = useRouter()
async function handleSubmit() {
  error.value = ''
  if (form.password.length < 10) {
    error.value = 'Use uma senha com pelo menos 10 caracteres.'
    return
  }
  if (form.password !== form.confirmPassword) {
    error.value = 'As senhas não coincidem.'
    return
  }
  if (!/^\d{1,10}$/.test(form.crpNumber.replace(/\D/g, ''))) {
    error.value = 'Informe um número de CRP válido.'
    return
  }
  isLoading.value = true
  const result = await signUp(form)
  isLoading.value = false
  if (result.error) {
    error.value = 'Não foi possível criar a conta. Verifique os dados ou recupere o acesso.'
    return
  }
  await router.push({ name: 'confirm-email', query: { email: form.email } })
}
</script>
<template>
  <AuthCard
    title="Crie sua conta profissional"
    description="Seus dados identificam a autoria dos registros clínicos."
    ><form class="stack" @submit.prevent="handleSubmit">
      <AppAlert v-if="error" type="error" :message="error" />
      <div class="field">
        <label for="full-name">Nome completo</label
        ><input id="full-name" v-model="form.fullName" autocomplete="name" required />
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="crp-state">UF do CRP</label
          ><select id="crp-state" v-model="form.crpState" required>
            <option value="" disabled>Selecione</option>
            <option v-for="state in BRAZIL_STATES" :key="state">{{ state }}</option>
          </select>
        </div>
        <div class="field">
          <label for="crp-number">Número do CRP</label
          ><input id="crp-number" v-model="form.crpNumber" inputmode="numeric" required />
        </div>
      </div>
      <div class="field">
        <label for="signup-email">E-mail</label
        ><input id="signup-email" v-model="form.email" type="email" autocomplete="email" required />
      </div>
      <div class="form-grid">
        <div class="field">
          <label for="signup-password">Senha</label
          ><input
            id="signup-password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            minlength="10"
            required
          /><small class="field-hint">Mínimo de 10 caracteres.</small>
        </div>
        <div class="field">
          <label for="confirm-password">Confirme a senha</label
          ><input
            id="confirm-password"
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            required
          />
        </div>
      </div>
      <button class="button button--primary" :disabled="isLoading">
        {{ isLoading ? 'Criando conta…' : 'Criar conta' }}
      </button>
      <p class="footer">Já tem conta? <RouterLink to="/entrar">Entrar</RouterLink></p>
    </form></AuthCard
  >
</template>
<style scoped>
.footer {
  text-align: center;
  color: var(--ink-muted);
  margin: 0.5rem 0 0;
}
.footer a {
  color: var(--secondary);
  font-weight: 650;
}
</style>
