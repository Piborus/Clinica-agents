import { corsHeaders, json, userClient } from '../_shared/client.ts'
import {
  detectAttachmentMime,
  MAX_ATTACHMENT_SIZE,
  validAttachmentExtension,
} from '../_shared/attachment-validation.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) })
  if (request.method !== 'POST') return json({ code: 'METHOD_NOT_ALLOWED' }, 405, request)
  try {
    const supabase = userClient(request)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return json({ code: 'UNAUTHENTICATED' }, 401, request)
    const form = await request.formData()
    const file = form.get('file')
    const patientId = form.get('patientId')
    const evolutionId = form.get('evolutionId')
    if (
      !(file instanceof File) ||
      typeof patientId !== 'string' ||
      file.size === 0 ||
      file.size > MAX_ATTACHMENT_SIZE
    )
      return json({ code: 'INVALID_ATTACHMENT' }, 422, request)
    const bytes = new Uint8Array(await file.arrayBuffer())
    const mime = detectAttachmentMime(bytes)
    if (!mime || !validAttachmentExtension(file.name, mime))
      return json({ code: 'INVALID_ATTACHMENT' }, 422, request)
    const attachmentId = crypto.randomUUID()
    const objectKey = `${user.id}/${patientId}/${attachmentId}`
    const upload = await supabase.storage
      .from('clinical-attachments')
      .upload(objectKey, bytes, { contentType: mime, upsert: false })
    if (upload.error) return json({ code: 'INVALID_ATTACHMENT' }, 422, request)
    const registered = await supabase.rpc('register_attachment', {
      p_patient_id: patientId,
      p_evolution_id: typeof evolutionId === 'string' ? evolutionId : null,
      p_original_name: file.name.slice(0, 240),
      p_mime_type: mime,
      p_size_bytes: file.size,
      p_object_key: objectKey,
    })
    if (registered.error) {
      await supabase.storage.from('clinical-attachments').remove([objectKey])
      return json({ code: 'NOT_FOUND' }, 404, request)
    }
    return json({ attachment: registered.data }, 201, request)
  } catch {
    return json({ code: 'INVALID_ATTACHMENT' }, 422, request)
  }
})
