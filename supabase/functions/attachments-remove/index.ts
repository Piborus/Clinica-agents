import { corsHeaders, json, userClient } from '../_shared/client.ts'
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) })
  if (request.method !== 'POST') return json({ code: 'METHOD_NOT_ALLOWED' }, 405, request)
  try {
    const { attachmentId } = await request.json()
    const supabase = userClient(request)
    const { data, error } = await supabase.rpc('set_attachment_status', {
      p_attachment_id: attachmentId,
      p_status: 'removing',
    })
    if (error || !data) return json({ code: 'NOT_FOUND' }, 404, request)
    const removal = await supabase.storage.from('clinical-attachments').remove([data.object_key])
    if (removal.error) {
      await supabase.rpc('set_attachment_status', {
        p_attachment_id: attachmentId,
        p_status: 'available',
      })
      return json({ code: 'INVALID_ATTACHMENT' }, 409, request)
    }
    const final = await supabase.rpc('set_attachment_status', {
      p_attachment_id: attachmentId,
      p_status: 'removed',
    })
    if (final.error) return json({ code: 'INVALID_ATTACHMENT' }, 409, request)
    return json({ removed: true }, 200, request)
  } catch {
    return json({ code: 'INVALID_ATTACHMENT' }, 422, request)
  }
})
