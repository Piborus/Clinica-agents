import { z } from 'zod'

import { digits, isMinor } from './formatters'

export const BRAZIL_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const

export function isValidCpf(value: string): boolean {
  const cpf = digits(value)
  if (!cpf) return true
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  const calculate = (length: number) => {
    const total = cpf
      .slice(0, length)
      .split('')
      .reduce((sum, digit, index) => sum + Number(digit) * (length + 1 - index), 0)
    const remainder = (total * 10) % 11
    return remainder === 10 ? 0 : remainder
  }
  return calculate(9) === Number(cpf[9]) && calculate(10) === Number(cpf[10])
}

const optionalEmail = z.string().trim().email('Informe um e-mail válido.').or(z.literal(''))
const optionalPhone = z
  .string()
  .refine(
    (value) => !value || [10, 11].includes(digits(value).length),
    'Informe um telefone com DDD.',
  )

export const guardianSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().trim().min(3, 'Informe o nome do responsável.'),
  relationship: z.string().trim().min(2, 'Informe o vínculo.'),
  phone: z
    .string()
    .refine((value) => [10, 11].includes(digits(value).length), 'Informe um telefone com DDD.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  cpf: z.string().refine(isValidCpf, 'CPF inválido.'),
})

export const patientSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Informe o nome completo.'),
    birthDate: z
      .string()
      .min(1, 'Informe a data de nascimento.')
      .refine(
        (value) => new Date(`${value}T00:00:00`) <= new Date(),
        'A data não pode estar no futuro.',
      ),
    cpf: z.string().refine(isValidCpf, 'CPF inválido.'),
    email: optionalEmail,
    phone: optionalPhone,
    emergencyPhone: optionalPhone.optional(),
    state: z
      .string()
      .refine(
        (value) =>
          !value || BRAZIL_STATES.includes(value.toUpperCase() as (typeof BRAZIL_STATES)[number]),
        'Informe uma UF válida.',
      )
      .optional(),
    guardians: z.array(guardianSchema),
  })
  .superRefine((value, context) => {
    if (isMinor(value.birthDate) && value.guardians.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['guardians'],
        message: 'Inclua ao menos um responsável legal.',
      })
    }
  })
