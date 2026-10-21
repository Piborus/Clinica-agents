<script setup lang="ts">
import { Archive, Search, UserPlus, UsersRound } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'
import AppAlert from '@/components/AppAlert.vue'
import { searchPatients } from '@/services/patientService'
import type { PatientStatus, PatientSummary } from '@/types/domain'
import { formatCpf, formatDate } from '@/utils/formatters'

const patients = ref<PatientSummary[]>([])
const status = ref<PatientStatus>('active')
const term = ref('')
const isLoading = ref(true)
const error = ref('')
let timer: number | undefined
async function load() {
  isLoading.value = true
  error.value = ''
  try {
    patients.value = await searchPatients(status.value, term.value)
  } catch {
    error.value = 'Não foi possível carregar seus pacientes.'
  } finally {
    isLoading.value = false
  }
}
watch([status, term], () => {
  window.clearTimeout(timer)
  timer = window.setTimeout(load, 250)
})
onMounted(load)
</script>
<template>
  <section class="page">
    <header class="page-heading">
      <div>
        <h1>Pacientes</h1>
        <p>Encontre rapidamente um cadastro e continue o prontuário de onde parou.</p>
      </div>
      <RouterLink class="button button--primary" to="/pacientes/novo"
        ><UserPlus :size="18" />Novo paciente</RouterLink
      >
    </header>
    <div class="toolbar card card--quiet">
      <label class="search"
        ><Search :size="19" /><span class="sr-only">Buscar pacientes</span
        ><input v-model="term" placeholder="Buscar por nome, nome social ou CPF"
      /></label>
      <div class="segments" aria-label="Situação">
        <button :class="{ active: status === 'active' }" @click="status = 'active'">Ativos</button
        ><button :class="{ active: status === 'archived' }" @click="status = 'archived'">
          Arquivados
        </button>
      </div>
    </div>
    <AppAlert v-if="error" type="error" :message="error" />
    <div v-else-if="isLoading" class="stack">
      <div v-for="item in 3" :key="item" class="skeleton"></div>
    </div>
    <div v-else-if="patients.length" class="patient-list">
      <RouterLink
        v-for="patient in patients"
        :key="patient.id"
        class="patient-row"
        :to="{ name: 'patient', params: { patientId: patient.id } }"
        ><span class="monogram">{{ patient.fullName.charAt(0) }}</span
        ><span class="identity"
          ><strong>{{ patient.socialName || patient.fullName }}</strong
          ><small v-if="patient.socialName">Nome civil: {{ patient.fullName }}</small
          ><small
            >Nascimento: {{ formatDate(patient.birthDate)
            }}<template v-if="patient.cpf"> · CPF {{ formatCpf(patient.cpf) }}</template></small
          ></span
        ><span class="badge" :class="`badge--${patient.status}`">{{
          patient.status === 'active' ? 'Ativo' : 'Arquivado'
        }}</span></RouterLink
      >
    </div>
    <div v-else class="empty">
      <Archive v-if="status === 'archived'" :size="42" /><UsersRound v-else :size="42" />
      <h2>
        {{
          term
            ? 'Nenhum paciente encontrado'
            : status === 'active'
              ? 'Comece pelo primeiro paciente'
              : 'Nenhum paciente arquivado'
        }}
      </h2>
      <p>
        {{
          term
            ? 'Revise o termo ou limpe a busca para ver todos os cadastros.'
            : 'Os cadastros aparecerão aqui sem misturar dados de outras contas.'
        }}
      </p>
      <button v-if="term" class="button button--ghost" @click="term = ''">Limpar busca</button
      ><RouterLink
        v-else-if="status === 'active'"
        class="button button--primary"
        to="/pacientes/novo"
        >Cadastrar paciente</RouterLink
      >
    </div>
  </section>
</template>
<style scoped>
.toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.25rem;
}
.search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: white;
  border: 1px solid var(--outline-soft);
  border-radius: var(--radius);
  padding: 0 0.8rem;
}
.search input {
  width: 100%;
  min-height: 44px;
  border: 0;
  outline: 0;
  background: transparent;
}
.segments {
  display: flex;
  background: var(--surface-container);
  padding: 0.2rem;
  border-radius: var(--radius);
}
.segments button {
  border: 0;
  background: transparent;
  padding: 0.55rem 0.8rem;
  border-radius: 6px;
}
.segments .active {
  background: white;
  box-shadow: var(--shadow-1);
  font-weight: 650;
}
.patient-list {
  display: grid;
  gap: 0.65rem;
}
.patient-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  background: white;
  border: 1px solid #dfe5ed;
  border-radius: var(--radius-lg);
  padding: 1rem;
  text-decoration: none;
  transition: border-color 0.15s ease;
}
.patient-row:hover {
  border-color: var(--secondary);
}
.monogram {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: var(--surface-container);
  color: var(--primary);
  font-weight: 750;
}
.identity strong,
.identity small {
  display: block;
}
.identity small {
  color: var(--ink-muted);
  font-size: 0.78rem;
  margin-top: 0.2rem;
}
@media (max-width: 640px) {
  .toolbar {
    display: grid;
  }
  .patient-row {
    grid-template-columns: auto 1fr;
  }
  .patient-row > .badge {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
