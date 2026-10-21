<script setup lang="ts">
import { FileClock, Filter, Plus, Search } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import AppAlert from '@/components/AppAlert.vue'
import { usePatient } from '@/composables/usePatient'
import { listEvolutions } from '@/services/clinicalService'
import type { Evolution } from '@/types/domain'
import { formatDate, formatDateTime } from '@/utils/formatters'
const { patient } = usePatient()
const evolutions = ref<Evolution[]>([])
const term = ref('')
const from = ref('')
const to = ref('')
const loading = ref(true)
const error = ref('')
const drafts = computed(() => evolutions.value.filter((item) => item.status === 'draft'))
const finalized = computed(() => evolutions.value.filter((item) => item.status === 'finalized'))
async function load() {
  if (from.value && to.value && from.value > to.value) {
    error.value = 'A data inicial deve ser anterior à data final.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    evolutions.value = await listEvolutions(patient.value!.id, term.value, from.value, to.value)
  } catch {
    error.value = 'Não foi possível carregar as evoluções.'
  } finally {
    loading.value = false
  }
}
function clearFilters() {
  term.value = ''
  from.value = ''
  to.value = ''
  void load()
}
onMounted(load)
</script>
<template>
  <section class="stack">
    <header class="content-heading">
      <div>
        <h2>Linha do tempo clínica</h2>
        <p>Evoluções finalizadas em destaque e rascunhos separados do histórico final.</p>
      </div>
      <RouterLink
        v-if="patient?.status === 'active'"
        class="button button--primary"
        :to="{ name: 'evolution-new' }"
        ><Plus :size="18" />Nova evolução</RouterLink
      ><span v-else class="alert alert--info">Reative o paciente para registrar uma evolução.</span>
    </header>
    <form class="filters" @submit.prevent="load">
      <label
        ><Search :size="18" /><span class="sr-only">Pesquisar conteúdo</span
        ><input v-model="term" placeholder="Pesquisar no conteúdo"
      /></label>
      <div class="date-field"><span>De</span><input v-model="from" type="date" /></div>
      <div class="date-field"><span>Até</span><input v-model="to" type="date" /></div>
      <button class="button button--ghost" type="submit"><Filter :size="17" />Filtrar</button>
    </form>
    <AppAlert v-if="error" type="error" :message="error" />
    <div v-if="loading" class="skeleton"></div>
    <div v-else-if="evolutions.length" class="evolution-groups">
      <section v-if="drafts.length && !term && !from && !to" class="drafts-panel">
        <header>
          <h3>Rascunhos</h3>
          <span>{{ drafts.length }}</span>
        </header>
        <div class="draft-list">
          <article v-for="evolution in drafts" :key="evolution.id" class="draft-entry card">
            <div>
              <span class="badge badge--draft">Rascunho</span>
              <strong>{{ formatDate(evolution.attendedOn) }}</strong>
              <p>{{ evolution.report }}</p>
            </div>
            <RouterLink
              class="button button--ghost button--small"
              :to="{ name: 'evolution-edit', params: { evolutionId: evolution.id } }"
              >Continuar</RouterLink
            >
          </article>
        </div>
      </section>
      <section v-if="finalized.length">
        <h3 class="history-title">Histórico final</h3>
        <div class="timeline">
          <article v-for="evolution in finalized" :key="evolution.id" class="entry card">
            <span class="timeline-dot"></span>
            <header>
              <div>
                <h3>{{ formatDate(evolution.attendedOn) }}</h3>
                <span class="badge badge--finalized">Finalizada</span>
              </div>
              <RouterLink
                class="button button--ghost button--small"
                :to="{ name: 'evolution-edit', params: { evolutionId: evolution.id } }"
                >Ver e editar</RouterLink
              >
            </header>
            <p class="prose">{{ evolution.report }}</p>
            <dl v-if="evolution.intervention || evolution.clinicalResponse || evolution.nextSteps">
              <div v-if="evolution.intervention">
                <dt>Intervenção</dt>
                <dd>{{ evolution.intervention }}</dd>
              </div>
              <div v-if="evolution.clinicalResponse">
                <dt>Resposta clínica</dt>
                <dd>{{ evolution.clinicalResponse }}</dd>
              </div>
              <div v-if="evolution.nextSteps">
                <dt>Próximos passos</dt>
                <dd>{{ evolution.nextSteps }}</dd>
              </div>
            </dl>
            <small>Última atualização: {{ formatDateTime(evolution.updatedAt) }}</small>
          </article>
        </div>
      </section>
    </div>
    <div v-else class="empty">
      <FileClock :size="42" />
      <h2>Nenhuma evolução encontrada</h2>
      <p>
        {{
          term || from || to
            ? 'Os filtros não encontraram registros finalizados.'
            : 'Registre a primeira evolução para iniciar a linha do tempo clínica.'
        }}
      </p>
      <button v-if="term || from || to" class="button button--ghost" @click="clearFilters">
        Limpar filtros
      </button>
    </div>
  </section>
</template>
<style scoped>
.content-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}
.content-heading h2 {
  margin-bottom: 0.3rem;
}
.content-heading p {
  color: var(--ink-muted);
}
.filters {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  background: white;
  border: 1px solid #dfe5ed;
  border-radius: var(--radius-lg);
  padding: 0.7rem;
}
.filters > label {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.filters input {
  border: 0;
  outline: 0;
  min-height: 38px;
  min-width: 0;
}
.date-field {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border-left: 1px solid var(--outline-soft);
  padding-left: 0.7rem;
  font-size: 0.78rem;
}
.timeline {
  position: relative;
  display: grid;
  gap: 1rem;
  padding-left: 1.3rem;
}
.evolution-groups,
.draft-list {
  display: grid;
  gap: 1rem;
}
.drafts-panel {
  border: 1px solid var(--outline-soft);
  border-radius: var(--radius-xl);
  padding: 1rem;
  background: var(--surface-container);
}
.drafts-panel > header,
.draft-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.drafts-panel > header span {
  color: var(--ink-muted);
}
.draft-entry p {
  margin: 0.4rem 0 0;
  color: var(--ink-muted);
}
.draft-entry strong {
  margin-left: 0.6rem;
}
.history-title {
  margin-bottom: 1rem;
}
.timeline:before {
  content: '';
  position: absolute;
  left: 0.28rem;
  top: 1rem;
  bottom: 1rem;
  width: 2px;
  background: var(--surface-high);
}
.entry {
  position: relative;
}
.timeline-dot {
  position: absolute;
  left: -1.57rem;
  top: 1.7rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--secondary);
  border: 3px solid var(--surface);
}
.entry header,
.entry header > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}
.entry h3 {
  margin: 0;
}
.entry dl {
  display: grid;
  gap: 0.65rem;
  background: var(--surface-low);
  padding: 1rem;
  border-radius: var(--radius-md);
}
.entry dt {
  font-weight: 700;
  font-size: 0.78rem;
}
.entry dd {
  margin: 0.2rem 0 0;
  line-height: 1.55;
}
.entry > small {
  color: var(--ink-muted);
}
@media (max-width: 760px) {
  .content-heading,
  .filters {
    display: grid;
  }
  .date-field {
    border-left: 0;
    padding-left: 0;
  }
  .entry header {
    align-items: start;
  }
}
</style>
