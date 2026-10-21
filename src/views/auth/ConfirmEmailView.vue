<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { MailCheck } from '@lucide/vue'
import AppAlert from '@/components/AppAlert.vue'
import { resendConfirmation } from '@/services/authService'
import AuthCard from './AuthCard.vue'
const route = useRoute()
const email = ref(String(route.query.email ?? ''))
const message = ref('')
const error = ref('')
async function resend() {
  if (!email.value) {
    error.value = 'Informe o e-mail usado no cadastro.'
    return
  }
  const result = await resendConfirmation(email.value)
  if (result.error) error.value = 'Não foi possível reenviar agora.'
  else message.value = 'Enviamos uma nova confirmação.'
}
</script>
<template>
  <AuthCard
    title="Confirme seu e-mail"
    description="Enviamos um link para liberar sua área protegida."
    ><div class="stack centered">
      <MailCheck :size="52" /><AppAlert v-if="message" type="success" :message="message" /><AppAlert
        v-if="error"
        type="error"
        :message="error"
      />
      <p>
        Abra a mensagem enviada para <strong>{{ email || 'seu e-mail' }}</strong
        >. O acesso clínico só será liberado após a confirmação.
      </p>
      <div class="field">
        <label for="confirmation-email">E-mail do cadastro</label>
        <input id="confirmation-email" v-model="email" type="email" autocomplete="email" required />
      </div>
      <button class="button button--ghost" @click="resend">Reenviar confirmação</button
      ><RouterLink class="button button--primary" to="/entrar">Voltar para entrar</RouterLink>
    </div></AuthCard
  >
</template>
<style scoped>
.centered {
  text-align: center;
}
.centered > svg {
  justify-self: center;
  color: var(--secondary);
}
.centered p {
  color: var(--ink-muted);
}
</style>
