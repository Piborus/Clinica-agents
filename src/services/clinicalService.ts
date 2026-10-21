import { normalizeError } from './errors'
import { callRpc, supabase } from './supabase'
import type {
  AuditEvent,
  ClinicalDocument,
  ClinicalDocumentType,
  Evolution,
  EvolutionInput,
} from '@/types/domain'
type Row = Record<string, unknown>
const nullable = (value: unknown) => (value == null ? null : String(value))
export async function getClinicalDocument(
  patientId: string,
  type: ClinicalDocumentType,
): Promise<ClinicalDocument | null> {
  const table = type === 'anamnesis' ? 'anamneses' : 'therapeutic_plans'
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle()
  if (error) throw normalizeError(error)
  if (!data) return null
  const row = data as Row
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    content: String(row.content),
    revision: Number(row.revision),
    updatedAt: String(row.updated_at),
  }
}
export async function saveClinicalDocument(
  patientId: string,
  type: ClinicalDocumentType,
  content: string,
  expectedRevision?: number,
) {
  const { error } = await callRpc('save_clinical_document', {
    p_patient_id: patientId,
    p_document_type: type,
    p_content: content.trim(),
    p_expected_revision: expectedRevision ?? null,
  })
  if (error) throw normalizeError(error)
  return getClinicalDocument(patientId, type)
}
function mapEvolution(row: Row): Evolution {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    attendedOn: String(row.attended_on),
    report: String(row.report),
    intervention: nullable(row.intervention),
    clinicalResponse: nullable(row.clinical_response),
    nextSteps: nullable(row.next_steps),
    status: String(row.status) as Evolution['status'],
    revision: Number(row.revision),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}
export async function listEvolutions(
  patientId: string,
  term = '',
  from?: string,
  to?: string,
): Promise<Evolution[]> {
  const { data, error } = await callRpc('list_evolutions', {
    p_patient_id: patientId,
    p_term: term.trim(),
    p_from: from || null,
    p_to: to || null,
    p_cursor_date: null,
    p_cursor_id: null,
    p_limit: 50,
  })
  if (error) throw normalizeError(error)
  return (data ?? []).map((row) => mapEvolution(row as unknown as Row))
}
export async function getEvolution(id: string): Promise<Evolution> {
  const { data, error } = await supabase.from('evolutions').select('*').eq('id', id).maybeSingle()
  if (error || !data) throw normalizeError(error ?? new Error('NOT_FOUND'))
  return mapEvolution(data as Row)
}
export async function saveEvolution(input: EvolutionInput): Promise<Evolution> {
  const { data, error } = await callRpc('save_evolution', {
    p_evolution_id: input.id ?? null,
    p_patient_id: input.patientId,
    p_attended_on: input.attendedOn,
    p_report: input.report.trim(),
    p_intervention: input.intervention.trim() || null,
    p_clinical_response: input.clinicalResponse.trim() || null,
    p_next_steps: input.nextSteps.trim() || null,
    p_status: input.status,
    p_expected_revision: input.expectedRevision ?? null,
  })
  if (error) throw normalizeError(error)
  return getEvolution(String(data?.id))
}
export async function discardDraft(id: string) {
  const { error } = await callRpc('discard_evolution_draft', { p_evolution_id: id })
  if (error) throw normalizeError(error)
}
export async function listAudit(patientId: string): Promise<AuditEvent[]> {
  const { data, error } = await supabase
    .from('audit_events')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw normalizeError(error)
  return ((data ?? []) as Row[]).map((row) => ({
    id: Number(row.id),
    entityType: String(row.entity_type),
    entityId: String(row.entity_id),
    action: String(row.action),
    actorId: String(row.actor_id),
    previousData: row.previous_data as Record<string, unknown> | null,
    currentData: row.current_data as Record<string, unknown> | null,
    createdAt: String(row.created_at),
  }))
}
