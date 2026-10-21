import { supabase } from './supabase'
import { normalizeError } from './errors'
import type { Attachment } from '@/types/domain'
type Row = Record<string, unknown>
export async function listAttachments(patientId: string): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('patient_id', patientId)
    .neq('status', 'removed')
    .order('created_at', { ascending: false })
  if (error) throw normalizeError(error)
  return ((data ?? []) as Row[]).map((row) => ({
    id: String(row.id),
    patientId: String(row.patient_id),
    evolutionId: row.evolution_id ? String(row.evolution_id) : null,
    originalName: String(row.original_name),
    mimeType: String(row.mime_type),
    sizeBytes: Number(row.size_bytes),
    status: String(row.status) as Attachment['status'],
    createdAt: String(row.created_at),
  }))
}
async function token() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}
export async function uploadAttachment(
  patientId: string,
  file: File,
  onProgress: (value: number) => void,
  evolutionId?: string,
): Promise<void> {
  const accessToken = await token()
  return new Promise((resolve, reject) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/attachments-upload`
    const body = new FormData()
    body.append('file', file)
    body.append('patientId', patientId)
    if (evolutionId) body.append('evolutionId', evolutionId)
    const request = new XMLHttpRequest()
    request.open('POST', url)
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () =>
      request.status < 300 ? resolve() : reject(new Error('INVALID_ATTACHMENT'))
    request.onerror = () => reject(new Error('INVALID_ATTACHMENT'))
    request.send(body)
  })
}
export async function attachmentUrl(id: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('attachments-access', {
    body: { attachmentId: id },
  })
  if (error) throw normalizeError(error)
  return String((data as { url: string }).url)
}
export async function downloadAttachment(item: Attachment): Promise<void> {
  const url = await attachmentUrl(item.id)
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error('INVALID_ATTACHMENT')
  const objectUrl = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = item.originalName
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
export async function removeAttachment(id: string) {
  const { error } = await supabase.functions.invoke('attachments-remove', {
    body: { attachmentId: id },
  })
  if (error) throw normalizeError(error)
}
export interface PdfArtifact {
  url: string
  fileName: string
}
export async function exportRecord(patientId: string): Promise<PdfArtifact> {
  const accessToken = await token()
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-record`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId }),
  })
  if (!response.ok) throw new Error('EXPORT_FAILED')
  const blob = await response.blob()
  return {
    url: URL.createObjectURL(blob),
    fileName: `prontuario-${patientId}-${new Date().toISOString().slice(0, 10)}.pdf`,
  }
}
export function downloadPdf(artifact: PdfArtifact) {
  const link = document.createElement('a')
  link.href = artifact.url
  link.download = artifact.fileName
  link.click()
}
