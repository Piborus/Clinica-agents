import { createClient, type PostgrestError } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'

const url = import.meta.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'local-development-key'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)

export const supabase = createClient<Database>(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

type Functions = Database['public']['Functions']
type RpcResult<Name extends keyof Functions> = PromiseLike<{
  data: Functions[Name]['Returns'] | null
  error: PostgrestError | null
}>
type NullableRpcArgs<Args> = {
  [Key in keyof Args]: Args[Key] | null
}
const invokeRpc = supabase.rpc.bind(supabase) as unknown as (
  name: string,
  args: Record<string, unknown>,
) => PromiseLike<{ data: unknown; error: PostgrestError | null }>

export function callRpc<Name extends keyof Functions>(
  name: Name,
  args: NullableRpcArgs<Functions[Name]['Args']>,
): RpcResult<Name> {
  return invokeRpc(name, args) as RpcResult<Name>
}
