<script setup lang="ts">
import { Archive, Download, RotateCcw } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppAlert from '@/components/AppAlert.vue'
import AppModal from '@/components/AppModal.vue'
import { patientKey } from '@/composables/usePatient'
import { downloadPdf, exportRecord, type PdfArtifact } from '@/services/documentService'
import { getPatient, setPatientStatus } from '@/services/patientService'
import type { Patient } from '@/types/domain'
import { formatDate } from '@/utils/formatters'
const route = useRoute()
const patient = ref<Patient | null>(null)
const loading = ref(true)
const error = ref('')
const confirmStatus = ref(false)
const exportConfirm = ref(false)
const exporting = ref(false)
const pdf = ref<PdfArtifact | null>(null)
const pdfFrame = ref<HTMLIFrameElement>()
const patientId = computed(() => String(route.params.patientId))
async function reload() {
  loading.value = true
  try {
    patient.value = await getPatient(patientId.value)
  } catch {
    error.value = 'Não foi possível carregar o paciente.'
  } finally {
    loading.value = false
  }
}
provide(patientKey, { patient, reload })
onMounted(reload)
async function changeStatus() {
  if (!patient.value) return
  const next = patient.value.status === 'active' ? 'archived' : 'active'
  try {
    await setPatientStatus(patient.value.id, next, patient.value.revision)
    confirmStatus.value = false
    await reload()
  } catch (reason) {
    error.value =
      reason instanceof Error ? reason.message : 'Não foi possível atualizar a situação.'
  }
}
async function download() {
  exportConfirm.value = false
  exporting.value = true
  try {
    pdf.value = await exportRecord(patientId.value)
  } catch {
    error.value = 'Não foi possível gerar o prontuário.'
  } finally {
    exporting.value = false
  }
}
function closePdf() {
  if (pdf.value) URL.revokeObjectURL(pdf.value.url)
  pdf.value = null
}
function printPdf() {
  pdfFrame.value?.contentWindow?.print()
}
onBeforeUnmount(closePdf)
</script>
<template>
  <section class="page">
    <AppAlert v-if="error" type="error" :message="error" />
    <div v-if="loading" class="skeleton"></div>
    <template v-else-if="patient"
      ><header class="patient-header">
        <div class="patient-title">
          <span class="patient-avatar">{{ patient.fullName.charAt(0) }}</span>
          <div>
            <div class="cluster">
              <h1>{{ patient.socialName || patient.fullName }}</h1>
              <span class="badge" :class="`badge--${patient.status}`">{{
                patient.status === 'active' ? 'Ativo' : 'Arquivado'
              }}</span>
            </div>
            <p>
              <span v-if="patient.socialName">{{ patient.fullName }} · </span
              >{{ formatDate(patient.birthDate)
              }}<span v-if="patient.occupationSchool"> · {{ patient.occupationSchool }}</span>
            </p>
          </div>
        </div>
        <div class="actions">
          <button class="button button--ghost" :disabled="exporting" @click="exportConfirm = true">
            <Download :size="18" />{{ exporting ? 'Gerando…' : 'Exportar PDF' }}</button
          ><button
            class="button"
            :class="patient.status === 'active' ? 'button--danger' : 'button--secondary'"
            @click="confirmStatus = true"
          >
            <Archive v-if="patient.status === 'active'" :size="18" /><RotateCcw
              v-else
              :size="18"
            />{{ patient.status === 'active' ? 'Arquivar' : 'Reativar' }}
          </button>
        </div>
      </header>
      <nav class="tabs" aria-label="Prontuário">
        <RouterLink :to="{ name: 'patient-edit' }">Cadastro</RouterLink
        ><RouterLink :to="{ name: 'patient-anamnesis' }">Anamnese</RouterLink
        ><RouterLink :to="{ name: 'patient-plan' }">Plano terapêutico</RouterLink
        ><RouterLink :to="{ name: 'patient-evolutions' }">Evoluções</RouterLink
        ><RouterLink :to="{ name: 'patient-attachments' }">Anexos</RouterLink
        ><RouterLink :to="{ name: 'patient-audit' }">Auditoria</RouterLink>
      </nav>
      <RouterView /></template
    ><AppModal
      :open="confirmStatus"
      :title="patient?.status === 'active' ? 'Arquivar paciente' : 'Reativar paciente'"
      :tone="patient?.status === 'active' ? 'danger' : 'primary'"
      :confirm-label="patient?.status === 'active' ? 'Arquivar' : 'Reativar'"
      @close="confirmStatus = false"
      @confirm="changeStatus"
      ><p v-if="patient?.status === 'active'">
        O prontuário continuará disponível para consulta, mas não aceitará novas evoluções.
      </p>
      <p v-else>Novas evoluções voltarão a ser permitidas.</p></AppModal
    >
    <AppModal
      :open="exportConfirm"
      title="Confirmar exportação"
      confirm-label="Gerar PDF"
      @close="exportConfirm = false"
      @confirm="download"
    >
      <p>
        O PDF será gerado para <strong>{{ patient?.socialName || patient?.fullName }}</strong> e
        conterá responsáveis, anamnese, plano terapêutico e somente evoluções finalizadas.
      </p>
    </AppModal>
    <AppModal
      :open="Boolean(pdf)"
      title="Prontuário pronto"
      cancel-label="Fechar"
      confirm-label="Baixar PDF"
      wide
      @close="closePdf"
      @confirm="pdf && downloadPdf(pdf)"
    >
      <div class="pdf-actions">
        <p>Confira o documento antes de baixar ou imprimir.</p>
        <button class="button button--ghost" type="button" @click="printPdf">Imprimir</button>
      </div>
      <iframe
        v-if="pdf"
        ref="pdfFrame"
        class="pdf-preview"
        :src="pdf.url"
        title="Visualização do prontuário"
      ></iframe>
    </AppModal>
  </section>
</template>
<style scoped>
.patient-header {
  background: linear-gradient(115deg, #fff 65%, #edf7f2);
  border: 1px solid #dfe5ed;
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}
.patient-title {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.patient-title h1 {
  margin: 0;
}
.patient-title p {
  margin: 0.35rem 0 0;
  color: var(--ink-muted);
}
.patient-avatar {
  width: 62px;
  height: 62px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  background: var(--primary);
  color: white;
  font-size: 1.5rem;
  font-weight: 750;
}
.tabs {
  display: flex;
  overflow: auto;
  gap: 0.25rem;
  margin: 1rem 0 1.5rem;
  border-bottom: 1px solid var(--outline-soft);
}
.tabs a {
  padding: 0.8rem 0.9rem;
  text-decoration: none;
  white-space: nowrap;
  color: var(--ink-muted);
  border-bottom: 3px solid transparent;
}
.tabs a.router-link-active {
  color: var(--primary);
  border-color: var(--secondary);
  font-weight: 700;
}
.pdf-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.pdf-preview {
  width: 100%;
  height: min(62vh, 680px);
  border: 1px solid var(--outline-soft);
  border-radius: var(--radius-lg);
}
@media (max-width: 760px) {
  .patient-header {
    display: grid;
  }
  .patient-title {
    align-items: start;
  }
  .patient-avatar {
    width: 48px;
    height: 48px;
  }
  .tabs {
    margin-inline: -1rem;
    padding-inline: 1rem;
  }
}
</style>
