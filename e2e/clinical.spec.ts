import { createClient } from '@supabase/supabase-js'
import { expect, test } from '@playwright/test'

const apiUrl = process.env.API_URL ?? process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SERVICE_ROLE_KEY
const hasLocalBackend = Boolean(apiUrl && serviceRoleKey)

async function readConfirmationLink(email: string, after = 0): Promise<string> {
  let link = ''
  await expect
    .poll(
      async () => {
        const listResponse = await fetch('http://127.0.0.1:54324/api/v1/messages')
        if (!listResponse.ok) return ''
        const response = (await listResponse.json()) as {
          messages?: {
            ID: string
            Created: string
            To: { Address: string }[]
          }[]
        }
        const latest = (response.messages ?? [])
          .filter(
            (message) =>
              message.To.some((recipient) => recipient.Address === email) &&
              Date.parse(message.Created) >= after,
          )
          .sort((left, right) => Date.parse(right.Created) - Date.parse(left.Created))[0]
        if (!latest) return ''
        const messageResponse = await fetch(`http://127.0.0.1:54324/api/v1/message/${latest.ID}`)
        if (!messageResponse.ok) return ''
        const message = (await messageResponse.json()) as {
          HTML?: string
          Text?: string
        }
        const content = message.HTML ?? message.Text ?? ''
        link =
          content
            .match(/https?:\/\/[^\s"'<>]+/g)
            ?.find((candidate) => candidate.includes('/auth/v1/verify'))
            ?.replaceAll('&amp;', '&') ?? ''
        return link
      },
      { timeout: 15_000 },
    )
    .not.toBe('')
  return link
}

test.describe('clinical flow with local Supabase', () => {
  if (!hasLocalBackend) return

  test('creates and confirms a professional account through the local mailbox', async ({
    page,
  }) => {
    test.setTimeout(45_000)
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const email = `confirmacao-${suffix}@example.test`

    await page.goto('/cadastro')
    await page.getByLabel('Nome completo').fill('Profissional Confirmação')
    await page.getByLabel('UF do CRP').selectOption('SP')
    await page.getByLabel('Número do CRP').fill('12345')
    await page.getByLabel('E-mail').fill(email)
    await page.getByLabel('Senha', { exact: true }).fill('senha-confirmacao-segura')
    await page.getByLabel('Confirme a senha').fill('senha-confirmacao-segura')
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page).toHaveURL(/\/confirmar-email/)

    await page.goto(await readConfirmationLink(email))
    await expect(page).toHaveURL(/\/pacientes$/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'Pacientes' })).toBeVisible()

    await page.getByRole('button', { name: /Sair/ }).click()
    await page.getByRole('link', { name: 'Esqueci minha senha' }).click()
    await page.getByLabel('E-mail').fill(email)
    const requestedAt = Date.now() - 1_000
    await page.getByRole('button', { name: 'Enviar link' }).click()
    await expect(page.getByRole('status')).toContainText('Se o e-mail estiver cadastrado')
    await page.goto(await readConfirmationLink(email, requestedAt))
    await expect(page).toHaveURL(/\/redefinir-senha/)
    await page.getByLabel('Nova senha', { exact: true }).fill('nova-senha-confirmada')
    await page.getByLabel('Confirme a nova senha').fill('nova-senha-confirmada')
    await page.getByRole('button', { name: 'Salvar nova senha' }).click()
    await expect(page).toHaveURL(/\/pacientes$/)
  })

  test('covers patient, clinical record, attachment, PDF and cross-account isolation', async ({
    page,
  }) => {
    test.setTimeout(90_000)
    const admin = createClient(apiUrl!, serviceRoleKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const password = 'senha-clinica-segura'
    const firstEmail = `psi-a-${suffix}@example.test`
    const secondEmail = `psi-b-${suffix}@example.test`

    for (const [email, name, state] of [
      [firstEmail, 'Psicóloga Alice', 'SP'],
      [secondEmail, 'Psicólogo Bruno', 'RJ'],
    ]) {
      const { error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, crp_number: '12345', crp_state: state },
      })
      expect(error).toBeNull()
    }

    await page.goto('/entrar')
    await page.getByLabel('E-mail').fill(firstEmail)
    await page.getByLabel('Senha').fill(password)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/pacientes$/)

    await page.getByRole('link', { name: /Novo paciente/ }).click()
    await page.getByLabel('Nome completo').fill('Paciente E2E')
    await page.getByLabel('Data de nascimento').fill('1990-01-10')
    await page.getByLabel('CPF').fill('52998224725')
    await page.getByRole('button', { name: 'Salvar paciente' }).click()
    await expect(page).toHaveURL(/\/pacientes\/[0-9a-f-]+\/evolucoes$/)
    const patientId = page.url().match(/pacientes\/([^/]+)/)?.[1]
    expect(patientId).toBeTruthy()

    await page.getByRole('link', { name: 'Anamnese' }).click()
    await page.getByLabel('Conteúdo clínico').fill('Anamnese confirmada no teste de ponta a ponta.')
    await page.getByRole('button', { name: 'Salvar alterações' }).click()
    await expect(page.getByRole('status')).toContainText('versão anterior preservada')

    await page.getByRole('link', { name: 'Evoluções' }).click()
    await page.getByRole('link', { name: 'Nova evolução' }).click()
    await page.getByLabel('Demanda ou relato').fill('Relato clínico finalizado no teste.')
    await page.getByRole('button', { name: 'Salvar rascunho' }).click()
    await expect(page.getByRole('heading', { name: 'Continuar rascunho' })).toBeVisible()
    await page.getByRole('button', { name: 'Finalizar evolução' }).click()
    await expect(page.getByRole('heading', { name: 'Editar evolução finalizada' })).toBeVisible()

    await page.getByRole('link', { name: /Gerenciar anexos/ }).click()
    await page.locator('input[type=file]').setInputFiles({
      name: 'documento.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\n%%EOF'),
    })
    await expect(page.getByText('documento.pdf', { exact: true })).toBeVisible()
    await expect(page.locator('small').filter({ hasText: 'Evolução de' })).toBeVisible()

    await page.getByRole('button', { name: 'Exportar PDF' }).click()
    await expect(page.getByRole('dialog', { name: 'Confirmar exportação' })).toBeVisible()
    await page.getByRole('button', { name: 'Gerar PDF' }).click()
    await expect(page.getByTitle('Visualização do prontuário')).toBeVisible()
    await page.getByRole('button', { name: 'Fechar' }).click()

    await page.getByRole('button', { name: /Sair/ }).click()
    await page.getByLabel('E-mail').fill(secondEmail)
    await page.getByLabel('Senha').fill(password)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/pacientes$/)
    await page.goto(`/pacientes/${patientId}/evolucoes`)
    await expect(page).toHaveURL(/\/pacientes$/)
    await expect(page.getByRole('heading', { name: 'Pacientes' })).toBeVisible()
    await expect(page.getByText('Paciente E2E')).toHaveCount(0)
  })
})
