<script setup lang="ts">
defineProps<{ title: string; description: string }>()
</script>
<template>
  <div class="auth-card">
    <header>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </header>
    <slot />
  </div>
</template>
<style scoped>
.auth-card {
  width: min(100%, 470px);
}
.auth-card header {
  margin-bottom: 1.75rem;
}
.auth-card h1 {
  margin-bottom: 0.55rem;
}
.auth-card p {
  color: var(--ink-muted);
  margin: 0;
}
</style>
