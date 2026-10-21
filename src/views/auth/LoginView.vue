<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppAlert from '@/components/AppAlert.vue'
import { signIn } from '@/services/authService'
import AuthCard from './AuthCard.vue'

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const route = useRoute()
const router = useRouter()
async function handleSubmit() {
  isLoading.value = true
  error.value = ''
  const result = await signIn(email.value, password.value)
  isLoading.value = false
  if (result.error) {
    error.value = 'E-mail ou senha inválidos.'
    return
  }
  const redirect =
    typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/pacientes'
  await router.replace(redirect)
}
</script>
<template>
  <AuthCard
    title="Entre no PsiManager"
    description="Acesse seus pacientes e prontuários com sua conta profissional."
    ><form class="stack" @submit.prevent="handleSubmit">
      <AppAlert v-if="error" type="error" :message="error" />
      <div class="field">
        <label for="email">E-mail</label
        ><input id="email" v-model="email" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="password">Senha</label
        ><input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>
      <RouterLink class="text-link" to="/recuperar-senha">Esqueci minha senha</RouterLink
      ><button class="button button--primary" :disabled="isLoading">
        {{ isLoading ? 'Entrando…' : 'Entrar' }}
      </button>
      <p class="footer">Primeiro acesso? <RouterLink to="/cadastro">Crie sua conta</RouterLink></p>
    </form></AuthCard
  >
</template>
<style scoped>
.text-link,
.footer a {
  color: var(--secondary);
  font-weight: 650;
}
.text-link {
  justify-self: end;
  font-size: 0.875rem;
}
.footer {
  text-align: center;
  color: var(--ink-muted);
  margin: 0.5rem 0 0;
}
</style>
