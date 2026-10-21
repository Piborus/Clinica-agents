import { inject, type InjectionKey, type Ref } from 'vue'
import type { Patient } from '@/types/domain'

export const patientKey: InjectionKey<{
  patient: Ref<Patient | null>
  reload: () => Promise<void>
}> = Symbol('patient')
export function usePatient() {
  const context = inject(patientKey)
  if (!context) throw new Error('Patient context is unavailable')
  return context
}
