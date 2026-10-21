<script setup lang="ts">
import type { EmailOtpType } from '@supabase/supabase-js'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppAlert from '@/components/AppAlert.vue'
import { supabase } from '@/services/supabase'
import AuthCard from './AuthCard.vue'

const router = useRouter()
const error = ref('')

onMounted(async () => {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  let failure: Error | null = null

  const current = await supabase.auth.getSession()
  if (!current.data.session && code) {
    failure = (await supabase.auth.exchangeCodeForSession(code)).error
  } else if (!current.data.session && tokenHash && type) {
    failure = (await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error
  }

  const session = await supabase.auth.getSession()
  if (failure || !session.data.session) {
    error.value = 'Este link é inválido ou expirou. Solicite um novo link para continuar.'
    return
  }
  await router.replace(type === 'recovery' ? '/redefinir-senha' : '/pacientes')
})
</script>
<template>
  <AuthCard
    title="Confirmando seu acesso"
    description="Validamos o link antes de liberar dados protegidos."
  >
    <div v-if="!error" class="skeleton" aria-label="Confirmando"></div>
    <div v-else class="stack">
      <AppAlert type="error" :message="error" />
      <RouterLink class="button button--primary" to="/entrar">Voltar para entrar</RouterLink>
      <RouterLink class="button button--ghost" to="/confirmar-email"
        >Reenviar confirmação</RouterLink
      >
      <RouterLink class="button button--ghost" to="/recuperar-senha">Recuperar senha</RouterLink>
    </div>
  </AuthCard>
</template>
