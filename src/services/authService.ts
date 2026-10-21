import { supabase } from './supabase'

export interface SignUpInput {
  fullName: string
  email: string
  password: string
  crpNumber: string
  crpState: string
}

export async function signUp(input: SignUpInput) {
  return supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: input.fullName.trim(),
        crp_number: input.crpNumber.replace(/\D/g, ''),
        crp_state: input.crpState,
      },
    },
  })
}
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password })
}
export async function resendConfirmation(email: string) {
  return supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  })
}
export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  })
}
export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password })
}
