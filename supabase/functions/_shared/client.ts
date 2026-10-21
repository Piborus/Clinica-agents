import { createClient } from 'npm:@supabase/supabase-js@2'

export function corsHeaders(request?: Request) {
  const configured = Deno.env
    .get('ALLOWED_ORIGINS')
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const allowed = configured?.length
    ? configured
    : ['http://localhost:5173', 'http://localhost:4173']
  const requested = request?.headers.get('Origin')
  const origin = requested && allowed.includes(requested) ? requested : allowed[0]
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

export function userClient(request: Request) {
  const authorization = request.headers.get('Authorization') ?? ''
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
    { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } },
  )
}

export function json(body: unknown, status = 200, request?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
