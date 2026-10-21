<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info } from '@lucide/vue'

withDefaults(defineProps<{ type?: 'error' | 'success' | 'info'; message: string }>(), {
  type: 'info',
})
</script>

<template>
  <div class="alert" :class="`alert--${type}`" :role="type === 'error' ? 'alert' : 'status'">
    <AlertCircle v-if="type === 'error'" :size="20" />
    <CheckCircle2 v-else-if="type === 'success'" :size="20" />
    <Info v-else :size="20" />
    <span>{{ message }}</span>
  </div>
</template>
