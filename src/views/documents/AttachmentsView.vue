<script setup lang="ts">
import { Download, Eye, FileImage, FileText, Paperclip, Trash2, Upload } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppAlert from '@/components/AppAlert.vue'
import AppModal from '@/components/AppModal.vue'
import { usePatient } from '@/composables/usePatient'
import {
  attachmentUrl,
  downloadAttachment,
  listAttachments,
  removeAttachment,
  uploadAttachment,
} from '@/services/documentService'
import type { Attachment } from '@/types/domain'
import type { Evolution } from '@/types/domain'
import { listEvolutions } from '@/services/clinicalService'
import { fileSize, formatDate, formatDateTime } from '@/utils/formatters'
const { patient } = usePatient()
const route = useRoute()
const items = ref<Attachment[]>([])
const evolutions = ref<Evolution[]>([])
const selectedEvolutionId = ref(
  typeof route.query.evolutionId === 'string' ? route.query.evolutionId : '',
)
const error = ref('')
const progress = ref<number | null>(null)
const removeTarget = ref<Attachment | null>(null)
async function load() {
  try {
    items.value = await listAttachments(patient.value!.id)
  } catch {
    error.value = 'Não foi possível carregar os anexos.'
  }
}
async function select(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (
    file.size === 0 ||
    file.size > 10 * 1024 * 1024 ||
    !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
  ) {
    error.value = 'Escolha PDF, JPG ou PNG com até 10 MB.'
    return
  }
  progress.value = 0
  try {
    await uploadAttachment(
      patient.value!.id,
      file,
      (value) => (progress.value = value),
      selectedEvolutionId.value || undefined,
    )
    await load()
  } catch {
    error.value = 'O arquivo não pôde ser enviado.'
  } finally {
    progress.value = null
    ;(event.target as HTMLInputElement).value = ''
  }
}
async function open(item: Attachment) {
  const preview = window.open('about:blank', '_blank')
  try {
    if (!preview) throw new Error('POPUP_BLOCKED')
    preview.opener = null
    preview.location.replace(await attachmentUrl(item.id))
  } catch {
    preview?.close()
    error.value = 'Não foi possível abrir o arquivo.'
  }
}
async function download(item: Attachment) {
  try {
    await downloadAttachment(item)
  } catch {
    error.value = 'Não foi possível baixar o arquivo.'
  }
}
async function remove() {
  if (!removeTarget.value) return
  try {
    await removeAttachment(removeTarget.value.id)
    removeTarget.value = null
    await load()
  } catch {
    error.value = 'Não foi possível remover o anexo.'
  }
}
function evolutionLabel(id: string | null) {
  if (!id) return 'Cadastro geral'
  const evolution = evolutions.value.find((item) => item.id === id)
  return evolution ? `Evolução de ${formatDate(evolution.attendedOn)}` : 'Evolução clínica'
}
onMounted(async () => {
  await load()
  try {
    evolutions.value = await listEvolutions(patient.value!.id)
  } catch {
    error.value = 'Os anexos foram carregados, mas os vínculos com evoluções estão indisponíveis.'
  }
})
</script>
<template>
  <section class="stack">
    <header class="content-heading">
      <div>
        <h2>Anexos clínicos</h2>
        <p>Documentos privados vinculados ao cadastro. Eles não entram no PDF do prontuário.</p>
      </div>
      <div class="upload-actions">
        <label class="field context-field">
          <span>Vincular ao</span>
          <select v-model="selectedEvolutionId">
            <option value="">Cadastro geral do paciente</option>
            <option v-for="evolution in evolutions" :key="evolution.id" :value="evolution.id">
              Evolução de {{ formatDate(evolution.attendedOn) }} ·
              {{ evolution.status === 'draft' ? 'rascunho' : 'finalizada' }}
            </option>
          </select>
        </label>
        <label class="button button--primary upload"
          ><Upload :size="18" />Adicionar arquivo<input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            @change="select"
        /></label>
      </div>
    </header>
    <AppAlert v-if="error" type="error" :message="error" />
    <div v-if="progress !== null" class="card">
      <div class="progress"><span :style="{ width: `${progress}%` }"></span></div>
      <p>Enviando arquivo… {{ progress }}%</p>
    </div>
    <div v-if="items.length" class="attachment-list">
      <article v-for="item in items" :key="item.id" class="attachment card">
        <span class="file-icon"
          ><FileText v-if="item.mimeType === 'application/pdf'" /><FileImage v-else
        /></span>
        <div>
          <strong>{{ item.originalName }}</strong
          ><small>{{ evolutionLabel(item.evolutionId) }}</small
          ><small>{{ fileSize(item.sizeBytes) }} · {{ formatDateTime(item.createdAt) }}</small
          ><small v-if="item.status === 'removing'" class="removing"
            >Remoção interrompida — conclua para reconciliar o arquivo.</small
          >
        </div>
        <div class="actions">
          <button
            v-if="item.status === 'available'"
            class="button button--ghost button--small"
            @click="open(item)"
          >
            <Eye :size="16" />Visualizar</button
          ><button
            v-if="item.status === 'available'"
            class="button button--ghost button--small"
            @click="download(item)"
          >
            <Download :size="16" />Baixar</button
          ><button class="button button--danger button--small" @click="removeTarget = item">
            <Trash2 :size="16" /><span>{{
              item.status === 'removing' ? 'Concluir remoção' : ''
            }}</span
            ><span class="sr-only">Remover {{ item.originalName }}</span>
          </button>
        </div>
      </article>
    </div>
    <div v-else-if="progress === null" class="empty">
      <Paperclip :size="42" />
      <h2>Nenhum anexo</h2>
      <p>Adicione documentos de apoio em PDF, JPG ou PNG, com até 10 MB.</p>
    </div>
    <AppModal
      :open="Boolean(removeTarget)"
      title="Remover anexo"
      tone="danger"
      confirm-label="Remover"
      @close="removeTarget = null"
      @confirm="remove"
      ><p>
        O arquivo deixará de estar acessível. A remoção permanecerá registrada na auditoria.
      </p></AppModal
    >
  </section>
</template>
<style scoped>
.content-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.content-heading p {
  color: var(--ink-muted);
}
.upload-actions {
  display: flex;
  align-items: end;
  gap: 0.7rem;
}
.context-field {
  min-width: 260px;
}
.context-field span {
  font-size: 0.78rem;
  color: var(--ink-muted);
}
.upload input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.attachment-list {
  display: grid;
  gap: 0.7rem;
}
.attachment {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}
.file-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--surface-container);
  color: var(--secondary);
}
.attachment strong,
.attachment small {
  display: block;
}
.attachment .removing {
  color: var(--danger);
}
.attachment small {
  color: var(--ink-muted);
  margin-top: 0.25rem;
}
.progress {
  height: 8px;
  border-radius: 99px;
  background: var(--surface-high);
  overflow: hidden;
}
.progress span {
  display: block;
  height: 100%;
  background: var(--secondary);
  transition: width 0.15s;
}
.card > p {
  margin: 0.6rem 0 0;
  color: var(--ink-muted);
}
@media (max-width: 640px) {
  .content-heading {
    display: grid;
  }
  .upload-actions {
    display: grid;
  }
  .context-field {
    min-width: 0;
  }
  .attachment {
    grid-template-columns: auto 1fr;
  }
  .attachment .actions {
    grid-column: 2;
  }
}
</style>
