<script setup lang="ts">
import { Save, Trash2 } from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppAlert from '@/components/AppAlert.vue'
import AppModal from '@/components/AppModal.vue'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { discardDraft, getEvolution, saveEvolution } from '@/services/clinicalService'
import type { EvolutionInput, EvolutionStatus } from '@/types/domain'
const route = useRoute()
const router = useRouter()
const today = new Date().toISOString().slice(0, 10)
const id = computed(() =>
  typeof route.params.evolutionId === 'string' ? route.params.evolutionId : undefined,
)
const form = reactive<EvolutionInput>({
  patientId: String(route.params.patientId),
  attendedOn: today,
  report: '',
  intervention: '',
  clinicalResponse: '',
  nextSteps: '',
  status: 'draft',
})
const error = ref('')
const loading = ref(false)
const discardOpen = ref(false)
const finalizedEditOpen = ref(false)
const originalStatus = ref<EvolutionStatus>('draft')
const savedSnapshot = ref('')
const snapshot = computed(() =>
  JSON.stringify({
    attendedOn: form.attendedOn,
    report: form.report,
    intervention: form.intervention,
    clinicalResponse: form.clinicalResponse,
    nextSteps: form.nextSteps,
  }),
)
const isDirty = computed(() => savedSnapshot.value !== '' && snapshot.value !== savedSnapshot.value)
useUnsavedChanges(isDirty)
async function submit(status: EvolutionStatus) {
  if (!form.attendedOn || !form.report.trim()) {
    error.value = 'Data do atendimento e relato são obrigatórios.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const saved = await saveEvolution({ ...form, status })
    Object.assign(form, { id: saved.id, expectedRevision: saved.revision, status: saved.status })
    originalStatus.value = saved.status
    savedSnapshot.value = snapshot.value
    await router.replace({ name: 'evolution-edit', params: { evolutionId: saved.id } })
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Não foi possível salvar.'
  } finally {
    loading.value = false
  }
}
function requestPrimarySave() {
  if (originalStatus.value === 'finalized') finalizedEditOpen.value = true
  else void submit('finalized')
}
async function discard() {
  if (!id.value) return
  await discardDraft(id.value)
  savedSnapshot.value = snapshot.value
  await router.replace({ name: 'patient-evolutions' })
}
onMounted(async () => {
  if (!id.value) {
    savedSnapshot.value = snapshot.value
    return
  }
  try {
    const evolution = await getEvolution(id.value)
    Object.assign(form, {
      ...evolution,
      intervention: evolution.intervention ?? '',
      clinicalResponse: evolution.clinicalResponse ?? '',
      nextSteps: evolution.nextSteps ?? '',
      expectedRevision: evolution.revision,
    })
    originalStatus.value = evolution.status
    savedSnapshot.value = snapshot.value
  } catch {
    error.value = 'Não foi possível carregar a evolução.'
  }
})
</script>
<template>
  <section class="card">
    <header class="page-heading">
      <div>
        <h2>
          {{
            id
              ? originalStatus === 'draft'
                ? 'Continuar rascunho'
                : 'Editar evolução finalizada'
              : 'Nova evolução'
          }}
        </h2>
        <p v-if="originalStatus === 'finalized'">
          Ao salvar, a versão atual será preservada na auditoria.
        </p>
        <p v-else>Você pode manter o registro como rascunho ou finalizá-lo.</p>
      </div>
    </header>
    <AppAlert v-if="error" type="error" :message="error" />
    <form class="stack" @submit.prevent="requestPrimarySave">
      <div class="field">
        <label for="attended-on">Data do atendimento</label
        ><input id="attended-on" v-model="form.attendedOn" type="date" :max="today" required />
      </div>
      <div class="field">
        <label for="report">Demanda ou relato</label
        ><textarea id="report" v-model="form.report" rows="8" required></textarea>
      </div>
      <div class="field">
        <label for="intervention">Intervenção realizada</label
        ><textarea id="intervention" v-model="form.intervention"></textarea>
      </div>
      <div class="field">
        <label for="clinical-response">Resposta clínica</label
        ><textarea id="clinical-response" v-model="form.clinicalResponse"></textarea>
      </div>
      <div class="field">
        <label for="next-steps">Próximos passos</label
        ><textarea id="next-steps" v-model="form.nextSteps"></textarea>
      </div>
      <div class="actions form-actions">
        <button
          v-if="id && originalStatus === 'draft'"
          class="button button--danger"
          type="button"
          @click="discardOpen = true"
        >
          <Trash2 :size="18" />Descartar</button
        ><span class="spacer"></span
        ><RouterLink class="button button--ghost" :to="{ name: 'patient-evolutions' }"
          >Cancelar</RouterLink
        ><button
          v-if="originalStatus === 'draft'"
          class="button button--ghost"
          type="button"
          :disabled="loading"
          @click="submit('draft')"
        >
          <Save :size="18" />Salvar rascunho</button
        ><button class="button button--primary" :disabled="loading">
          {{ originalStatus === 'finalized' ? 'Salvar nova versão' : 'Finalizar evolução' }}
        </button>
      </div>
      <RouterLink
        v-if="id"
        class="attachment-link"
        :to="{ name: 'patient-attachments', query: { evolutionId: id } }"
        >Gerenciar anexos desta evolução</RouterLink
      >
    </form>
    <AppModal
      :open="discardOpen"
      title="Descartar rascunho"
      tone="danger"
      confirm-label="Descartar"
      @close="discardOpen = false"
      @confirm="discard"
      ><p>O rascunho será removido e não aparecerá no histórico clínico.</p></AppModal
    >
    <AppModal
      :open="finalizedEditOpen"
      title="Salvar nova versão"
      confirm-label="Salvar nova versão"
      @close="finalizedEditOpen = false"
      @confirm="((finalizedEditOpen = false), submit('finalized'))"
    >
      <p>A versão atual continuará íntegra na auditoria e esta edição será a versão vigente.</p>
    </AppModal>
  </section>
</template>
<style scoped>
.form-actions {
  margin-top: 0.5rem;
}
.attachment-link {
  display: inline-flex;
  color: var(--secondary);
  font-weight: 650;
  margin-top: 1rem;
}
.spacer {
  flex: 1;
}
@media (max-width: 640px) {
  .spacer {
    display: none;
  }
}
</style>
