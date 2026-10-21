<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'
</script>

<template>
  <RouterLink class="brand" to="/pacientes" aria-label="PsiManager — pacientes">
    <span class="brand-mark"><ShieldCheck :size="22" /></span>
    <span><strong>PsiManager</strong><small>Prontuário clínico</small></span>
  </RouterLink>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--primary);
  text-decoration: none;
}
.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--secondary-soft);
}
strong,
small {
  display: block;
}
strong {
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}
small {
  color: var(--ink-muted);
  font-size: 0.68rem;
  margin-top: 0.08rem;
}
</style>
