<script setup lang="ts">
import { Plus, Trash2 } from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppAlert from '@/components/AppAlert.vue'
import AppModal from '@/components/AppModal.vue'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { getPatient, savePatient } from '@/services/patientService'
import { AppError, type PatientInput } from '@/types/domain'
import { isMinor } from '@/utils/formatters'
import { patientSchema } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const patientId = computed(() =>
  typeof route.params.patientId === 'string' ? route.params.patientId : undefined,
)
const error = ref('')
const errors = ref<Record<string, string>>({})
const loading = ref(false)
const duplicateOpen = ref(false)
const duplicateSummary = ref<{ fullName: string; socialName?: string; birthDate: string } | null>(
  null,
)
const empty = (): PatientInput => ({
  fullName: '',
  socialName: '',
  birthDate: '',
  cpf: '',
  genderPronouns: '',
  phone: '',
  email: '',
  postalCode: '',
  street: '',
  addressNumber: '',
  addressComplement: '',
  district: '',
  city: '',
  state: '',
  occupationSchool: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  notes: '',
  guardians: [],
})
const form = reactive<PatientInput>(empty())
const savedSnapshot = ref('')
const snapshot = computed(() => JSON.stringify(form))
const isDirty = computed(() => savedSnapshot.value !== '' && snapshot.value !== savedSnapshot.value)
useUnsavedChanges(isDirty)
const needsGuardian = computed(() => Boolean(form.birthDate) && isMinor(form.birthDate))
function addGuardian() {
  form.guardians.push({ fullName: '', relationship: '', phone: '', email: '', cpf: '' })
}
function removeGuardian(index: number) {
  if (needsGuardian.value && form.guardians.length === 1) {
    errors.value.guardians = 'Pacientes menores precisam de um responsável.'
    return
  }
  form.guardians.splice(index, 1)
}
async function submit(override = false) {
  errors.value = {}
  error.value = ''
  const validation = patientSchema.safeParse(form)
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      errors.value[String(issue.path[0])] = issue.message
    }
    return
  }
  loading.value = true
  try {
    const saved = await savePatient({ ...form, duplicateOverride: override })
    duplicateOpen.value = false
    savedSnapshot.value = snapshot.value
    await router.replace({ name: 'patient', params: { patientId: saved.id } })
  } catch (reason) {
    if (reason instanceof AppError && reason.code === 'POSSIBLE_DUPLICATE') {
      try {
        const detail =
          typeof reason.details === 'string' ? JSON.parse(reason.details) : reason.details
        duplicateSummary.value = {
          fullName: String((detail as Record<string, unknown>)?.full_name ?? form.fullName),
          socialName: String((detail as Record<string, unknown>)?.social_name ?? '') || undefined,
          birthDate: String((detail as Record<string, unknown>)?.birth_date ?? form.birthDate),
        }
      } catch {
        duplicateSummary.value = { fullName: form.fullName, birthDate: form.birthDate }
      }
      duplicateOpen.value = true
    } else error.value = reason instanceof Error ? reason.message : 'Não foi possível salvar.'
  } finally {
    loading.value = false
  }
}
onMounted(async () => {
  if (!patientId.value) {
    savedSnapshot.value = snapshot.value
    return
  }
  try {
    const patient = await getPatient(patientId.value)
    Object.assign(form, {
      ...patient,
      id: patient.id,
      expectedRevision: patient.revision,
      socialName: patient.socialName ?? '',
      cpf: patient.cpf ?? '',
      genderPronouns: patient.genderPronouns ?? '',
      phone: patient.phone ?? '',
      email: patient.email ?? '',
      postalCode: patient.postalCode ?? '',
      street: patient.street ?? '',
      addressNumber: patient.addressNumber ?? '',
      addressComplement: patient.addressComplement ?? '',
      district: patient.district ?? '',
      city: patient.city ?? '',
      state: patient.state ?? '',
      occupationSchool: patient.occupationSchool ?? '',
      emergencyName: patient.emergencyName ?? '',
      emergencyRelationship: patient.emergencyRelationship ?? '',
      emergencyPhone: patient.emergencyPhone ?? '',
      notes: patient.notes ?? '',
    })
    savedSnapshot.value = snapshot.value
  } catch {
    error.value = 'Não foi possível carregar o cadastro.'
  }
})
</script>
<template>
  <section class="page">
    <header class="page-heading">
      <div>
        <h1>{{ patientId ? 'Editar cadastro' : 'Novo paciente' }}</h1>
        <p>
          Nome e nascimento são obrigatórios. Os demais dados ajudam a diferenciar e contatar o
          paciente.
        </p>
      </div>
    </header>
    <form class="card stack" @submit.prevent="submit(false)">
      <AppAlert v-if="error" type="error" :message="error" />
      <h2 class="section-heading">Identificação</h2>
      <div class="form-grid">
        <div class="field">
          <label for="full-name">Nome completo</label
          ><input id="full-name" v-model="form.fullName" required /><small
            v-if="errors.fullName"
            class="field-error"
            >{{ errors.fullName }}</small
          >
        </div>
        <div class="field">
          <label for="social-name">Nome social</label
          ><input id="social-name" v-model="form.socialName" />
        </div>
        <div class="field">
          <label for="birth-date">Data de nascimento</label
          ><input id="birth-date" v-model="form.birthDate" type="date" required /><small
            v-if="errors.birthDate"
            class="field-error"
            >{{ errors.birthDate }}</small
          >
        </div>
        <div class="field">
          <label for="cpf">CPF</label
          ><input id="cpf" v-model="form.cpf" inputmode="numeric" /><small
            v-if="errors.cpf"
            class="field-error"
            >{{ errors.cpf }}</small
          >
        </div>
        <div class="field">
          <label for="pronouns">Gênero e pronomes</label
          ><input id="pronouns" v-model="form.genderPronouns" />
        </div>
        <div class="field">
          <label for="occupation">Profissão ou escola</label
          ><input id="occupation" v-model="form.occupationSchool" />
        </div>
      </div>
      <h2 class="section-heading">Contato e endereço</h2>
      <div class="form-grid">
        <div class="field">
          <label for="phone">Telefone</label
          ><input id="phone" v-model="form.phone" inputmode="tel" /><small
            v-if="errors.phone"
            class="field-error"
            >{{ errors.phone }}</small
          >
        </div>
        <div class="field">
          <label for="patient-email">E-mail</label
          ><input id="patient-email" v-model="form.email" type="email" /><small
            v-if="errors.email"
            class="field-error"
            >{{ errors.email }}</small
          >
        </div>
        <div class="field">
          <label for="postal-code">CEP</label
          ><input id="postal-code" v-model="form.postalCode" inputmode="numeric" />
        </div>
        <div class="field">
          <label for="street">Logradouro</label><input id="street" v-model="form.street" />
        </div>
        <div class="field">
          <label for="number">Número</label><input id="number" v-model="form.addressNumber" />
        </div>
        <div class="field">
          <label for="complement">Complemento</label
          ><input id="complement" v-model="form.addressComplement" />
        </div>
        <div class="field">
          <label for="district">Bairro</label><input id="district" v-model="form.district" />
        </div>
        <div class="field">
          <label for="city">Cidade</label><input id="city" v-model="form.city" />
        </div>
        <div class="field">
          <label for="state">UF</label><input id="state" v-model="form.state" maxlength="2" />
          <small v-if="errors.state" class="field-error">{{ errors.state }}</small>
        </div>
      </div>
      <h2 class="section-heading">Emergência e observações</h2>
      <div class="form-grid">
        <div class="field">
          <label for="emergency-name">Contato de emergência</label
          ><input id="emergency-name" v-model="form.emergencyName" />
        </div>
        <div class="field">
          <label for="emergency-relationship">Vínculo</label
          ><input id="emergency-relationship" v-model="form.emergencyRelationship" />
        </div>
        <div class="field">
          <label for="emergency-phone">Telefone de emergência</label
          ><input id="emergency-phone" v-model="form.emergencyPhone" /><small
            v-if="errors.emergencyPhone"
            class="field-error"
            >{{ errors.emergencyPhone }}</small
          >
        </div>
        <div class="field span-2">
          <label for="notes">Observações</label
          ><textarea id="notes" v-model="form.notes"></textarea>
        </div>
      </div>
      <div class="section-row">
        <div>
          <h2>Responsáveis legais</h2>
          <p v-if="needsGuardian">Obrigatório porque o paciente é menor de 18 anos.</p>
          <p v-else>Opcional para pacientes adultos.</p>
        </div>
        <button class="button button--ghost button--small" type="button" @click="addGuardian">
          <Plus :size="17" />Adicionar responsável
        </button>
      </div>
      <small v-if="errors.guardians" class="field-error">{{ errors.guardians }}</small>
      <fieldset v-for="(guardian, index) in form.guardians" :key="index" class="guardian">
        <legend>Responsável {{ index + 1 }}</legend>
        <button
          class="remove"
          type="button"
          title="Remover responsável"
          @click="removeGuardian(index)"
        >
          <Trash2 :size="18" />
        </button>
        <div class="form-grid">
          <div class="field">
            <label :for="`guardian-name-${index}`">Nome completo</label
            ><input :id="`guardian-name-${index}`" v-model="guardian.fullName" required />
          </div>
          <div class="field">
            <label :for="`guardian-relationship-${index}`">Vínculo</label
            ><input
              :id="`guardian-relationship-${index}`"
              v-model="guardian.relationship"
              required
            />
          </div>
          <div class="field">
            <label :for="`guardian-phone-${index}`">Telefone</label
            ><input :id="`guardian-phone-${index}`" v-model="guardian.phone" required />
          </div>
          <div class="field">
            <label :for="`guardian-email-${index}`">E-mail</label
            ><input
              :id="`guardian-email-${index}`"
              v-model="guardian.email"
              type="email"
              required
            />
          </div>
          <div class="field">
            <label :for="`guardian-cpf-${index}`">CPF</label
            ><input :id="`guardian-cpf-${index}`" v-model="guardian.cpf" />
          </div>
        </div>
      </fieldset>
      <div class="actions form-actions">
        <RouterLink
          class="button button--ghost"
          :to="patientId ? { name: 'patient', params: { patientId } } : '/pacientes'"
          >Cancelar</RouterLink
        ><button class="button button--primary" :disabled="loading">
          {{ loading ? 'Salvando…' : 'Salvar paciente' }}
        </button>
      </div>
    </form>
    <AppModal
      :open="duplicateOpen"
      title="Possível cadastro duplicado"
      confirm-label="Cadastrar mesmo assim"
      @close="duplicateOpen = false"
      @confirm="submit(true)"
      ><p>
        Já existe um cadastro com o mesmo nome e data de nascimento. Confirme somente se forem
        pessoas diferentes.
      </p>
      <dl v-if="duplicateSummary" class="duplicate-summary">
        <div>
          <dt>Nome</dt>
          <dd>{{ duplicateSummary.fullName }}</dd>
        </div>
        <div v-if="duplicateSummary.socialName">
          <dt>Nome social</dt>
          <dd>{{ duplicateSummary.socialName }}</dd>
        </div>
        <div>
          <dt>Nascimento</dt>
          <dd>{{ duplicateSummary.birthDate }}</dd>
        </div>
      </dl></AppModal
    >
  </section>
</template>
<style scoped>
.section-row {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
  margin-top: 0.5rem;
}
.section-row h2 {
  margin-bottom: 0.3rem;
}
.section-row p {
  color: var(--ink-muted);
  margin: 0;
}
.guardian {
  position: relative;
  border: 1px solid var(--outline-soft);
  border-radius: var(--radius-lg);
  padding: 1rem;
}
.guardian legend {
  font-weight: 700;
  padding: 0 0.4rem;
}
.remove {
  position: absolute;
  right: 0.8rem;
  top: 0.6rem;
  border: 0;
  background: transparent;
  color: var(--danger);
  padding: 0.4rem;
}
.form-actions {
  justify-content: flex-end;
  margin-top: 1rem;
}
.duplicate-summary {
  display: grid;
  gap: 0.5rem;
  padding: 0.8rem;
  border-radius: var(--radius-lg);
  background: var(--surface-container);
}
.duplicate-summary div {
  display: grid;
  grid-template-columns: 110px 1fr;
}
.duplicate-summary dt {
  font-weight: 650;
}
.duplicate-summary dd {
  margin: 0;
}
@media (max-width: 640px) {
  .section-row {
    display: grid;
  }
}
</style>
