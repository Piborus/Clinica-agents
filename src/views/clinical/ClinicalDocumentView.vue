<script setup lang="ts">
import { History, Save } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import AppAlert from '@/components/AppAlert.vue'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { usePatient } from '@/composables/usePatient'
import { getClinicalDocument, saveClinicalDocument } from '@/services/clinicalService'
import type { ClinicalDocument, ClinicalDocumentType } from '@/types/domain'
import { formatDateTime } from '@/utils/formatters'
const props = defineProps<{ type: ClinicalDocumentType }>()
const { patient } = usePatient()
const document = ref<ClinicalDocument | null>(null)
const content = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')
const savedContent = ref('')
const isDirty = computed(() => content.value !== savedContent.value)
useUnsavedChanges(isDirty)
const title = computed(() =>
  props.type === 'anamnesis' ? 'Anamnese clínica' : 'Plano terapêutico',
)
const description = computed(() =>
  props.type === 'anamnesis'
    ? 'Registre o contexto inicial e as informações relevantes do acompanhamento.'
    : 'Mantenha objetivos e direcionamentos vigentes do acompanhamento.',
)
async function load() {
  if (!patient.value) return
  loading.value = true
  try {
    document.value = await getClinicalDocument(patient.value.id, props.type)
    content.value = document.value?.content ?? ''
    savedContent.value = content.value
  } catch {
    error.value = 'Não foi possível carregar o conteúdo.'
  } finally {
    loading.value = false
  }
}
async function save() {
  if (!content.value.trim()) {
    error.value = 'Escreva algum conteúdo antes de salvar.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    document.value = await saveClinicalDocument(
      patient.value!.id,
      props.type,
      content.value,
      document.value?.revision,
    )
    savedContent.value = content.value
    success.value = 'Alterações salvas e versão anterior preservada.'
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Não foi possível salvar.'
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>
<template>
  <article class="clinical-layout">
    <section class="card">
      <header class="document-heading">
        <div>
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>
        <span v-if="document" class="updated"
          >Atualizado em {{ formatDateTime(document.updatedAt) }}</span
        >
      </header>
      <AppAlert v-if="error" type="error" :message="error" /><AppAlert
        v-if="success"
        type="success"
        :message="success"
      />
      <div v-if="loading" class="skeleton"></div>
      <form v-else class="stack" @submit.prevent="save">
        <div class="field">
          <label for="clinical-content">Conteúdo clínico</label
          ><textarea
            id="clinical-content"
            v-model="content"
            rows="16"
            :placeholder="
              type === 'anamnesis'
                ? 'História, demanda, contexto familiar e observações clínicas…'
                : 'Objetivos, estratégias e direcionamentos terapêuticos…'
            "
          ></textarea>
        </div>
        <div class="actions">
          <button class="button button--primary" :disabled="saving">
            <Save :size="18" />{{ saving ? 'Salvando…' : 'Salvar alterações' }}
          </button>
        </div>
      </form>
    </section>
    <aside class="card card--quiet">
      <History :size="22" />
      <h3>Histórico protegido</h3>
      <p>
        Cada alteração concluída preserva a versão anterior, o autor e o momento da edição. Consulte
        os eventos na aba Auditoria.
      </p>
    </aside>
  </article>
</template>
<style scoped>
.clinical-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 1rem;
}
.document-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.document-heading p,
.updated,
.card--quiet p {
  color: var(--ink-muted);
}
.updated {
  font-size: 0.78rem;
  white-space: nowrap;
}
.card--quiet > svg {
  color: var(--secondary);
}
@media (max-width: 900px) {
  .clinical-layout {
    grid-template-columns: 1fr;
  }
  .document-heading {
    display: grid;
  }
}
</style>
