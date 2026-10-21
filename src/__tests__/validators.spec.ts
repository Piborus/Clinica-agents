import { describe, expect, it } from 'vitest'

import { calculateAge, digits, formatCpf, isMinor } from '@/utils/formatters'
import { isValidCpf, patientSchema } from '@/utils/validators'

describe('formatters and business validation', () => {
  it('normalizes and formats CPF values', () => {
    expect(digits('529.982.247-25')).toBe('52998224725')
    expect(formatCpf('52998224725')).toBe('529.982.247-25')
  })

  it('validates CPF check digits', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('111.111.111-11')).toBe(false)
  })

  it('calculates age around the birthday boundary', () => {
    expect(calculateAge('2000-10-22', new Date(2026, 9, 21))).toBe(25)
    expect(calculateAge('2000-10-21', new Date(2026, 9, 21))).toBe(26)
  })

  it('requires a guardian for a minor', () => {
    const result = patientSchema.safeParse({
      fullName: 'Paciente Menor',
      birthDate: '2015-01-01',
      cpf: '',
      email: '',
      phone: '',
      guardians: [],
    })
    expect(isMinor('2015-01-01')).toBe(true)
    expect(result.success).toBe(false)
  })

  it('accepts an adult without guardians', () => {
    const result = patientSchema.safeParse({
      fullName: 'Paciente Adulto',
      birthDate: '1990-01-01',
      cpf: '',
      email: '',
      phone: '',
      guardians: [],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid optional contact and state values', () => {
    const result = patientSchema.safeParse({
      fullName: 'Paciente Adulto',
      birthDate: '1990-01-01',
      cpf: '',
      email: 'inválido',
      phone: '123',
      emergencyPhone: '456',
      state: 'ZZ',
      guardians: [],
    })
    expect(result.success).toBe(false)
  })
})
