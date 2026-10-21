export type PatientStatus = 'active' | 'archived'
export type EvolutionStatus = 'draft' | 'finalized'
export type AttachmentStatus = 'available' | 'removing' | 'removed'
export type ClinicalDocumentType = 'anamnesis' | 'therapeutic_plan'

export interface Profile {
  id: string
  fullName: string
  email: string
  crpNumber: string
  crpState: string
  revision: number
}

export interface LegalGuardianInput {
  id?: string
  fullName: string
  relationship: string
  phone: string
  email: string
  cpf: string
}

export interface PatientInput {
  id?: string
  expectedRevision?: number
  fullName: string
  socialName: string
  birthDate: string
  cpf: string
  genderPronouns: string
  phone: string
  email: string
  postalCode: string
  street: string
  addressNumber: string
  addressComplement: string
  district: string
  city: string
  state: string
  occupationSchool: string
  emergencyName: string
  emergencyRelationship: string
  emergencyPhone: string
  notes: string
  guardians: LegalGuardianInput[]
  duplicateOverride?: boolean
}

export interface PatientSummary {
  id: string
  fullName: string
  socialName: string | null
  birthDate: string
  cpf: string | null
  status: PatientStatus
  revision: number
  createdAt: string
}

export interface Patient extends PatientSummary {
  genderPronouns: string | null
  phone: string | null
  email: string | null
  postalCode: string | null
  street: string | null
  addressNumber: string | null
  addressComplement: string | null
  district: string | null
  city: string | null
  state: string | null
  occupationSchool: string | null
  emergencyName: string | null
  emergencyRelationship: string | null
  emergencyPhone: string | null
  notes: string | null
  guardians: LegalGuardianInput[]
  updatedAt: string
}

export interface ClinicalDocument {
  id: string
  patientId: string
  content: string
  revision: number
  updatedAt: string
}

export interface Evolution {
  id: string
  patientId: string
  attendedOn: string
  report: string
  intervention: string | null
  clinicalResponse: string | null
  nextSteps: string | null
  status: EvolutionStatus
  revision: number
  createdAt: string
  updatedAt: string
}

export interface EvolutionInput {
  id?: string
  patientId: string
  attendedOn: string
  report: string
  intervention: string
  clinicalResponse: string
  nextSteps: string
  status: EvolutionStatus
  expectedRevision?: number
}

export interface Attachment {
  id: string
  patientId: string
  evolutionId: string | null
  originalName: string
  mimeType: string
  sizeBytes: number
  status: AttachmentStatus
  createdAt: string
}

export interface AuditEvent {
  id: number
  entityType: string
  entityId: string
  action: string
  actorId: string
  previousData: Record<string, unknown> | null
  currentData: Record<string, unknown> | null
  createdAt: string
}

export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'NOT_FOUND'
  | 'DUPLICATE_CPF'
  | 'POSSIBLE_DUPLICATE'
  | 'PATIENT_ARCHIVED'
  | 'VERSION_CONFLICT'
  | 'INVALID_ATTACHMENT'
  | 'EXPORT_FAILED'
  | 'UNKNOWN'

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
  }
}
