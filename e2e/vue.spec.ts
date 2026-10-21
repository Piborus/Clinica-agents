import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('redirects the public root to the professional login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/entrar$/)
  await expect(page.getByRole('heading', { name: 'Entre no PsiManager' })).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()
})

test('keeps protected patient routes behind authentication', async ({ page }) => {
  await page.goto('/pacientes/00000000-0000-4000-8000-000000000000/evolucoes')
  await expect(page).toHaveURL(/\/entrar\?redirect=/)
  await expect(page.getByRole('heading', { name: 'Entre no PsiManager' })).toBeVisible()
})

test('validates password confirmation before sending account data', async ({ page }) => {
  await page.goto('/cadastro')
  await page.getByLabel('Nome completo').fill('Profissional Teste')
  await page.getByLabel('UF do CRP').selectOption('SP')
  await page.getByLabel('Número do CRP').fill('12345')
  await page.getByLabel('E-mail').fill('profissional@example.test')
  await page.getByLabel('Senha', { exact: true }).fill('senha-segura-1')
  await page.getByLabel('Confirme a senha').fill('senha-segura-2')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page.getByRole('alert')).toContainText('não coincidem')
})

test('offers password recovery without revealing account existence', async ({ page }) => {
  await page.goto('/recuperar-senha')
  await expect(page.getByRole('heading', { name: 'Recupere seu acesso' })).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByRole('button')).toContainText('Enviar link')
})

test('authentication layout remains operable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/entrar')
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()
  const card = page.locator('.auth-card')
  await expect(card).toBeVisible()
  expect((await card.boundingBox())?.width).toBeLessThanOrEqual(390)
})
