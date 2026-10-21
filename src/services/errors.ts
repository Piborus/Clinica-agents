import { AppError, type AppErrorCode } from '@/types/domain'

const messages: Record<AppErrorCode, string> = {
  VALIDATION_ERROR: 'Revise os campos indicados e tente novamente.',
  UNAUTHENTICATED: 'Sua sessão expirou. Entre novamente para continuar.',
  NOT_FOUND: 'Este registro não foi encontrado.',
  DUPLICATE_CPF: 'Já existe um paciente com este CPF.',
  POSSIBLE_DUPLICATE: 'Encontramos um paciente com o mesmo nome e data de nascimento.',
  PATIENT_ARCHIVED: 'Reative o paciente antes de registrar uma nova evolução.',
  VERSION_CONFLICT: 'Este conteúdo foi alterado em outra sessão. Recarregue antes de salvar.',
  INVALID_ATTACHMENT: 'O arquivo não atende aos formatos ou ao tamanho permitido.',
  EXPORT_FAILED: 'Não foi possível gerar o prontuário. Tente novamente.',
  UNKNOWN: 'Não foi possível concluir a ação. Tente novamente.',
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error
  const candidate = error as { message?: string; code?: string; details?: unknown }
  const match = Object.keys(messages).find((code) => candidate?.message?.includes(code)) as
    AppErrorCode | undefined
  const code = match ?? 'UNKNOWN'
  return new AppError(code, messages[code], candidate?.details)
}
