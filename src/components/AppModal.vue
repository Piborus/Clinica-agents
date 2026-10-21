<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: 'primary' | 'danger'
    wide?: boolean
  }>(),
  { confirmLabel: 'Confirmar', cancelLabel: 'Cancelar', tone: 'primary', wide: false },
)
const emit = defineEmits<{ close: []; confirm: [] }>()
const dialog = ref<HTMLDivElement>()
const titleId = computed(
  () =>
    `modal-${props.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')}`,
)
let previousFocus: HTMLElement | null = null
function handleKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape') emit('close')
  if (!props.open || event.key !== 'Tab' || !dialog.value) return
  const focusable = Array.from(
    dialog.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe',
    ),
  )
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null
      await nextTick()
      dialog.value?.querySelector<HTMLElement>('button, a[href], input, select, textarea')?.focus()
    } else previousFocus?.focus()
  },
)
onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="backdrop" @click.self="emit('close')">
      <div
        ref="dialog"
        class="modal"
        :class="{ 'modal--wide': wide }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <h2 :id="titleId">{{ title }}</h2>
        <div class="modal-content"><slot /></div>
        <div class="actions">
          <button class="button button--ghost" type="button" @click="emit('close')">
            {{ cancelLabel }}
          </button>
          <button
            class="button"
            :class="tone === 'danger' ? 'button--danger' : 'button--primary'"
            type="button"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgb(30 58 76 / 30%);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  padding: 1rem;
}
.modal {
  width: min(100%, 480px);
  background: white;
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: 0 20px 32px -8px rgb(30 58 76 / 16%);
}
.modal--wide {
  width: min(100%, 920px);
}
.modal-content {
  color: var(--ink-muted);
}
.actions {
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
