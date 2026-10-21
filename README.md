# PsiManager

SPA para psicólogos autônomos administrarem pacientes, responsáveis, anamnese, plano terapêutico, evoluções, anexos privados e exportação do prontuário.

## Stack

- Vue, Vite, TypeScript, Vue Router e Pinia
- Supabase Auth, PostgreSQL com RLS, Storage privado e Edge Functions
- Vitest, Vue Test Utils, Playwright e pgTAP

## Desenvolvimento

1. Copie `.env.example` para `.env.local`.
2. Instale Docker Desktop ou Podman.
3. Execute `npm install` e `npm run db:start`.
4. Copie a URL e a chave pública exibidas pelo Supabase CLI para `.env.local`.
5. Execute `npm run db:reset`, `npm run db:types` e `npm run dev`.

O seed não cria dados clínicos. Use apenas dados sintéticos durante desenvolvimento e testes.

## Verificação

```sh
npm run lint
npm run type-check
npm run test:unit -- --run
npm run build
npm run db:test
npm run test:e2e -- --project=chromium
```

Consulte [implantação e operação](docs/operations/deployment.md) antes de conectar um ambiente com dados reais.
