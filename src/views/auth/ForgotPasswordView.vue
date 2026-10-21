<script setup lang="ts">
import { ref } from 'vue'
import AppAlert from '@/components/AppAlert.vue'
import { requestPasswordReset } from '@/services/authService'
import AuthCard from './AuthCard.vue'
const email = ref('')
const isLoading = ref(false)
const sent = ref(false)
const error = ref('')
async function submit() {
  isLoading.value = true
  error.value = ''
  try {
    const result = await requestPasswordReset(email.value)
    if (result.error) error.value = 'Não foi possível enviar o link agora. Tente novamente.'
    else sent.value = true
  } catch {
    error.value = 'Não foi possível enviar o link agora. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}
</script>
<template>
  <AuthCard
    title="Recupere seu acesso"
    description="Enviaremos um link seguro para definir uma nova senha."
    ><AppAlert
      v-if="sent"
      type="success"
      message="Se o e-mail estiver cadastrado, você receberá as instruções em instantes."
    />
    <AppAlert v-if="error" type="error" :message="error" />
    <form v-else class="stack" @submit.prevent="submit">
      <div class="field">
        <label for="recovery-email">E-mail</label
        ><input id="recovery-email" v-model="email" type="email" autocomplete="email" required />
      </div>
      <button class="button button--primary" :disabled="isLoading">
        {{ isLoading ? 'Enviando…' : 'Enviar link' }}</button
      ><RouterLink class="button button--ghost" to="/entrar">Voltar</RouterLink>
    </form></AuthCard
  >
</template>
