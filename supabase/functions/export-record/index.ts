import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1'
import { corsHeaders, json, userClient } from '../_shared/client.ts'

type Snapshot = {
  professional: Record<string, unknown>
  patient: Record<string, unknown>
  guardians: Record<string, unknown>[]
  anamnesis: string | null
  therapeuticPlan: string | null
  evolutions: Record<string, unknown>[]
}
const A4: [number, number] = [595.28, 841.89]
const margin = 48
const lineHeight = 15
function formatDate(value: unknown) {
  if (!value) return 'Não informado'
  const [y, m, d] = String(value).split('-')
  return `${d}/${m}/${y}`
}
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) })
  if (request.method !== 'POST') return json({ code: 'METHOD_NOT_ALLOWED' }, 405, request)
  try {
    const { patientId } = await request.json()
    const supabase = userClient(request)
    const { data, error } = await supabase.rpc('get_patient_export_snapshot', {
      p_patient_id: patientId,
    })
    if (error || !data) return json({ code: 'NOT_FOUND' }, 404, request)
    const snapshot = data as Snapshot
    const pdf = await PDFDocument.create()
    const regular = await pdf.embedFont(StandardFonts.Helvetica)
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
    let page = pdf.addPage(A4)
    let y = A4[1] - margin
    const nextPage = () => {
      page = pdf.addPage(A4)
      y = A4[1] - margin
    }
    const ensure = (height: number) => {
      if (y - height < margin + 20) nextPage()
    }
    const wrap = (text: string, size = 10) => {
      const words = text.replace(/\s+/g, ' ').trim().split(' ')
      const lines: string[] = []
      let current = ''
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word
        if (regular.widthOfTextAtSize(candidate, size) > A4[0] - margin * 2) {
          if (current) lines.push(current)
          current = word
        } else current = candidate
      }
      if (current) lines.push(current)
      return lines
    }
    const text = (value: string, size = 10, isBold = false) => {
      const lines = wrap(value || 'Não preenchida', size)
      for (const line of lines) {
        ensure(lineHeight)
        page.drawText(line, {
          x: margin,
          y,
          size,
          font: isBold ? bold : regular,
          color: rgb(0.07, 0.11, 0.18),
        })
        y -= lineHeight
      }
      y -= 3
    }
    const heading = (value: string) => {
      ensure(32)
      y -= 8
      text(value, 15, true)
      page.drawLine({
        start: { x: margin, y: y + 1 },
        end: { x: A4[0] - margin, y: y + 1 },
        thickness: 0.6,
        color: rgb(0.75, 0.78, 0.8),
      })
      y -= 8
    }
    text('PsiManager — Prontuário clínico', 18, true)
    text(
      `Profissional: ${snapshot.professional.full_name} · CRP ${snapshot.professional.crp_state}/${snapshot.professional.crp_number}`,
      9,
    )
    y -= 8
    heading('Identificação do paciente')
    text(`Nome: ${snapshot.patient.social_name || snapshot.patient.full_name}`)
    if (snapshot.patient.social_name) text(`Nome civil: ${snapshot.patient.full_name}`)
    text(`Nascimento: ${formatDate(snapshot.patient.birth_date)}`)
    if (snapshot.guardians.length) {
      heading('Responsáveis legais')
      snapshot.guardians.forEach((guardian) =>
        text(
          `${guardian.full_name} · ${guardian.relationship} · ${guardian.phone} · ${guardian.email}`,
        ),
      )
    }
    heading('Anamnese')
    text(snapshot.anamnesis || 'Não preenchida')
    heading('Plano terapêutico')
    text(snapshot.therapeuticPlan || 'Não preenchido')
    heading('Evoluções finalizadas')
    if (!snapshot.evolutions.length) text('Nenhuma evolução finalizada.')
    for (const evolution of snapshot.evolutions) {
      ensure(60)
      text(formatDate(evolution.attended_on), 11, true)
      text(String(evolution.report))
      if (evolution.intervention) text(`Intervenção: ${evolution.intervention}`)
      if (evolution.clinical_response) text(`Resposta clínica: ${evolution.clinical_response}`)
      if (evolution.next_steps) text(`Próximos passos: ${evolution.next_steps}`)
      y -= 8
    }
    const pages = pdf.getPages()
    pages.forEach((item, index) =>
      item.drawText(
        `Gerado em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date())} · Página ${index + 1} de ${pages.length}`,
        { x: margin, y: 24, size: 8, font: regular, color: rgb(0.3, 0.33, 0.36) },
      ),
    )
    const bytes = await pdf.save()
    return new Response(bytes, {
      headers: {
        ...corsHeaders(request),
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="prontuario-${patientId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return json({ code: 'EXPORT_FAILED' }, 500, request)
  }
})
