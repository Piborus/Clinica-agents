<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'
import AppBrand from '@/components/AppBrand.vue'
</script>

<template>
  <main class="auth-shell">
    <section class="auth-story">
      <AppBrand />
      <div>
        <p class="quiet"><ShieldCheck :size="18" /> Privacidade desde a primeira anotação</p>
        <h1>Seu trabalho clínico, organizado com o cuidado que ele exige.</h1>
        <p>
          Cadastros, prontuários e documentos em um espaço sereno, feito para reduzir a carga
          administrativa sem tirar o foco do paciente.
        </p>
      </div>
      <small>Dados separados por profissional e protegidos na origem.</small>
    </section>
    <section class="auth-content"><RouterView /></section>
  </main>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.1fr);
}
.auth-story {
  padding: clamp(2rem, 5vw, 5rem);
  background: var(--primary);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
}
.auth-story :deep(.brand) {
  color: white;
}
.auth-story :deep(.brand small) {
  color: #aecae1;
}
.auth-story h1 {
  max-width: 16ch;
  font-size: clamp(2rem, 4vw, 3.4rem);
}
.auth-story p {
  max-width: 56ch;
  color: #d9e5ed;
}
.quiet {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 650;
}
.auth-content {
  display: grid;
  place-items: center;
  padding: 2rem;
}
@media (max-width: 800px) {
  .auth-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    align-content: start;
  }
  .auth-story {
    min-height: auto;
    padding: 1.25rem;
    gap: 2rem;
    justify-content: flex-start;
  }
  .auth-story > div:not(:first-child),
  .auth-story > small {
    display: none;
  }
  .auth-content {
    padding: 1.25rem;
    place-items: start center;
  }
}
</style>
