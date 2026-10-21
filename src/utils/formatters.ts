export function digits(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCpf(value?: string | null): string {
  const normalized = digits(value ?? '').slice(0, 11)
  return normalized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatDate(value?: string | null): string {
  if (!value) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}

export function formatDateTime(value?: string | null): string {
  if (!value) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value))
}

export function calculateAge(birthDate: string, today = new Date()): number {
  const [year, month, day] = birthDate.split('-').map(Number)
  if (!year || !month || !day) return 0
  let age = today.getFullYear() - year
  const beforeBirthday =
    today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)
  if (beforeBirthday) age -= 1
  return age
}

export function isMinor(birthDate: string): boolean {
  return calculateAge(birthDate) < 18
}

export function fileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
