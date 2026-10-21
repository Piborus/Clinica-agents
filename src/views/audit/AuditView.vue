<script setup lang="ts">
import { History } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import AppAlert from '@/components/AppAlert.vue'
import { usePatient } from '@/composables/usePatient'
import { listAudit } from '@/services/clinicalService'
import { useAuthStore } from '@/stores/auth'
import type { AuditEvent } from '@/types/domain'
import { formatDateTime } from '@/utils/formatters'
const { patient } = usePatient()
const auth = useAuthStore()
const items = ref<AuditEvent[]>([])
const error = ref('')
const labels: Record<string, string> = {
  patient: 'Cadastro',
  legal_guardian: 'Responsável',
  anamnesis: 'Anamnese',
  therapeutic_plan: 'Plano terapêutico',
  evolution: 'Evolução',
  attachment: 'Anexo',
}
const fieldLabels: Record<string, string> = {
  full_name: 'Nome completo',
  social_name: 'Nome social',
  birth_date: 'Data de nascimento',
  cpf: 'CPF',
  phone: 'Telefone',
  email: 'E-mail',
  status: 'Situação',
  content: 'Conteúdo',
  attended_on: 'Data do atendimento',
  report: 'Relato',
  intervention: 'Intervenção',
  clinical_response: 'Resposta clínica',
  next_steps: 'Próximos passos',
}
function changes(item: AuditEvent) {
  const before = item.previousData ?? {}
  const after = item.currentData ?? {}
  return Object.keys({ ...before, ...after }).filter(
    (key) =>
      !['owner_id', 'patient_id', 'updated_at', 'created_at', 'search_vector'].includes(key) &&
      JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  )
}
function displayValue(value: unknown) {
  if (value == null || value === '') return 'Não preenchido'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  return String(value)
}
onMounted(async () => {
  try {
    items.value = await listAudit(patient.value!.id)
  } catch {
    error.value = 'Não foi possível carregar a auditoria.'
  }
})
</script>
<template>
  <section class="stack">
    <header>
      <h2>Histórico de alterações</h2>
      <p class="muted">Versões protegidas para rastrear mudanças relevantes no prontuário.</p>
    </header>
    <AppAlert v-if="error" type="error" :message="error" />
    <div v-if="items.length" class="audit-list">
      <article v-for="item in items" :key="item.id" class="audit-item">
        <span class="audit-icon"><History :size="18" /></span>
        <div>
          <strong>{{ labels[item.entityType] || item.entityType }} · {{ item.action }}</strong
          ><small>{{ formatDateTime(item.createdAt) }} · {{ auth.profile?.fullName }}</small>
          <details v-if="changes(item).length">
            <summary>Consultar alterações</summary>
            <dl>
              <div v-for="field in changes(item)" :key="field" class="change-row">
                <dt>{{ fieldLabels[field] || field.replaceAll('_', ' ') }}</dt>
                <dd>
                  <span><b>Anterior</b>{{ displayValue(item.previousData?.[field]) }}</span>
                  <span><b>Atual</b>{{ displayValue(item.currentData?.[field]) }}</span>
                </dd>
              </div>
            </dl>
          </details>
        </div>
      </article>
    </div>
    <div v-else class="empty">
      <History :size="42" />
      <h2>Nenhuma alteração registrada</h2>
      <p>As próximas edições relevantes aparecerão aqui.</p>
    </div>
  </section>
</template>
<style scoped>
.muted {
  color: var(--ink-muted);
}
.audit-list {
  background: white;
  border: 1px solid #dfe5ed;
  border-radius: var(--radius-xl);
  overflow: hidden;
}
.audit-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  padding: 1rem;
  border-bottom: 1px solid #e8ebf0;
}
.audit-item:last-child {
  border: 0;
}
.audit-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--surface-container);
  color: var(--secondary);
}
.audit-item strong,
.audit-item small {
  display: block;
}
.audit-item small {
  color: var(--ink-muted);
  margin-top: 0.2rem;
}
.audit-item details {
  margin: 0.6rem 0 0;
  color: var(--ink-muted);
  font-size: 0.82rem;
}
.audit-item summary {
  cursor: pointer;
  color: var(--secondary);
  font-weight: 650;
}
.audit-item dl {
  display: grid;
  gap: 0.7rem;
}
.change-row {
  border-left: 2px solid var(--outline-soft);
  padding-left: 0.7rem;
}
.change-row dt,
.change-row b {
  color: var(--ink);
  font-weight: 650;
}
.change-row dd {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin: 0.35rem 0 0;
}
.change-row span,
.change-row b {
  display: block;
}
.change-row span {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
