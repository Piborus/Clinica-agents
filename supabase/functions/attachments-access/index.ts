import { corsHeaders, json, userClient } from '../_shared/client.ts'
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) })
  if (request.method !== 'POST') return json({ code: 'METHOD_NOT_ALLOWED' }, 405, request)
  try {
    const { attachmentId } = await request.json()
    const supabase = userClient(request)
    const { data, error } = await supabase
      .from('attachments')
      .select('object_key,status')
      .eq('id', attachmentId)
      .eq('status', 'available')
      .maybeSingle()
    if (error || !data) return json({ code: 'NOT_FOUND' }, 404, request)
    const signed = await supabase.storage
      .from('clinical-attachments')
      .createSignedUrl(data.object_key, 300)
    if (signed.error) return json({ code: 'NOT_FOUND' }, 404, request)
    return json({ url: signed.data.signedUrl }, 200, request)
  } catch {
    return json({ code: 'NOT_FOUND' }, 404, request)
  }
})
