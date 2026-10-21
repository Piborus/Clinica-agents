<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppAlert from '@/components/AppAlert.vue'
import { updatePassword } from '@/services/authService'
import AuthCard from './AuthCard.vue'
const password = ref('')
const confirm = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
async function submit() {
  if (password.value.length < 10) {
    error.value = 'Use ao menos 10 caracteres.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'As senhas não coincidem.'
    return
  }
  loading.value = true
  const result = await updatePassword(password.value)
  loading.value = false
  if (result.error) {
    error.value = 'O link expirou ou não é mais válido.'
    return
  }
  await router.replace('/pacientes')
}
</script>
<template>
  <AuthCard
    title="Defina uma nova senha"
    description="Escolha uma senha com pelo menos 10 caracteres."
    ><form class="stack" @submit.prevent="submit">
      <AppAlert v-if="error" type="error" :message="error" />
      <div class="field">
        <label for="new-password">Nova senha</label
        ><input
          id="new-password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          required
        />
      </div>
      <div class="field">
        <label for="confirm-new-password">Confirme a nova senha</label
        ><input
          id="confirm-new-password"
          v-model="confirm"
          type="password"
          autocomplete="new-password"
          required
        />
      </div>
      <button class="button button--primary" :disabled="loading">
        {{ loading ? 'Salvando…' : 'Salvar nova senha' }}
      </button>
    </form></AuthCard
  >
</template>
