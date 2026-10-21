import { normalizeError } from './errors'
import { callRpc, supabase } from './supabase'
import type {
  LegalGuardianInput,
  Patient,
  PatientInput,
  PatientStatus,
  PatientSummary,
} from '@/types/domain'
import { digits } from '@/utils/formatters'

type Row = Record<string, unknown>
const text = (value: unknown) => (value == null ? null : String(value))

function mapSummary(row: Row): PatientSummary {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    socialName: text(row.social_name),
    birthDate: String(row.birth_date),
    cpf: text(row.cpf),
    status: String(row.status) as PatientStatus,
    revision: Number(row.revision),
    createdAt: String(row.created_at),
  }
}

function mapPatient(row: Row, guardians: LegalGuardianInput[] = []): Patient {
  return {
    ...mapSummary(row),
    genderPronouns: text(row.gender_pronouns),
    phone: text(row.phone),
    email: text(row.email),
    postalCode: text(row.postal_code),
    street: text(row.street),
    addressNumber: text(row.address_number),
    addressComplement: text(row.address_complement),
    district: text(row.district),
    city: text(row.city),
    state: text(row.state),
    occupationSchool: text(row.occupation_school),
    emergencyName: text(row.emergency_name),
    emergencyRelationship: text(row.emergency_relationship),
    emergencyPhone: text(row.emergency_phone),
    notes: text(row.notes),
    guardians,
    updatedAt: String(row.updated_at),
  }
}

export async function searchPatients(status: PatientStatus, term = '', cursor?: string) {
  const { data, error } = await callRpc('search_patients', {
    p_status: status,
    p_term: term.trim(),
    p_cursor: cursor ?? null,
    p_limit: 25,
  })
  if (error) throw normalizeError(error)
  return (data ?? []).map((row) => mapSummary(row as unknown as Row))
}

export async function getPatient(id: string): Promise<Patient> {
  const [{ data, error }, guardians] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).maybeSingle(),
    supabase.from('legal_guardians').select('*').eq('patient_id', id).order('created_at'),
  ])
  if (error || !data) throw normalizeError(error ?? new Error('NOT_FOUND'))
  const mappedGuardians = ((guardians.data ?? []) as Row[]).map((row) => ({
    id: String(row.id),
    fullName: String(row.full_name),
    relationship: String(row.relationship),
    phone: String(row.phone),
    email: String(row.email),
    cpf: String(row.cpf ?? ''),
  }))
  return mapPatient(data as Row, mappedGuardians)
}

export async function savePatient(input: PatientInput): Promise<Patient> {
  const payload = {
    full_name: input.fullName.trim(),
    social_name: input.socialName.trim() || null,
    birth_date: input.birthDate,
    cpf: digits(input.cpf) || null,
    gender_pronouns: input.genderPronouns.trim() || null,
    phone: digits(input.phone) || null,
    email: input.email.trim() || null,
    postal_code: digits(input.postalCode) || null,
    street: input.street.trim() || null,
    address_number: input.addressNumber.trim() || null,
    address_complement: input.addressComplement.trim() || null,
    district: input.district.trim() || null,
    city: input.city.trim() || null,
    state: input.state || null,
    occupation_school: input.occupationSchool.trim() || null,
    emergency_name: input.emergencyName.trim() || null,
    emergency_relationship: input.emergencyRelationship.trim() || null,
    emergency_phone: digits(input.emergencyPhone) || null,
    notes: input.notes.trim() || null,
  }
  const guardians = input.guardians.map((item) => ({
    id: item.id ?? null,
    full_name: item.fullName.trim(),
    relationship: item.relationship.trim(),
    phone: digits(item.phone),
    email: item.email.trim(),
    cpf: digits(item.cpf) || null,
  }))
  const { data, error } = await callRpc('save_patient_with_guardians', {
    p_patient_id: input.id ?? null,
    p_patient: payload,
    p_guardians: guardians,
    p_expected_revision: input.expectedRevision ?? null,
    p_duplicate_override: input.duplicateOverride ?? false,
  })
  if (error) throw normalizeError(error)
  return getPatient(String(data?.id))
}

export async function setPatientStatus(
  id: string,
  status: PatientStatus,
  expectedRevision: number,
) {
  const { error } = await callRpc('set_patient_status', {
    p_patient_id: id,
    p_status: status,
    p_expected_revision: expectedRevision,
  })
  if (error) throw normalizeError(error)
}
