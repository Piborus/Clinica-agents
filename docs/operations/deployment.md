# Operação e implantação

## Ambientes

Use projetos Supabase separados para staging e produção. A SPA aceita somente:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Nunca exponha `service_role`. Configure `ALLOWED_ORIGINS` nas Edge Functions com as origens exatas da SPA, separadas por vírgula. Sem essa variável, somente as origens locais de desenvolvimento são aceitas.

## Ordem de promoção

1. Execute `npm ci`, lint, type-check, unitários e build.
2. Inicie o Supabase local, aplique `supabase db reset` e rode `supabase test db`.
3. Aplique migrations em staging com `supabase db push`.
4. Publique as quatro Edge Functions e execute o E2E contra staging com dados sintéticos.
5. Aplique migrations em produção antes de publicar funções e SPA.
6. Faça smoke test de autenticação, RLS, upload privado e PDF antes de permitir dados reais.

Migrations de produção são progressivas. Não reverta uma implantação apagando tabelas ou versões clínicas.

## Requisitos do host estático

- Servir exclusivamente por HTTPS.
- Redirecionar rotas desconhecidas para `/index.html` sem interceptar arquivos existentes.
- Não cachear `index.html`; assets com hash podem usar cache imutável.
- Aplicar CSP equivalente a: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' blob: data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`.
- Aplicar os cabeçalhos de `public/_headers`, incluindo `Referrer-Policy`, CSP, HSTS, `X-Content-Type-Options` e `Permissions-Policy`.

## Produção

- Configure SMTP próprio e somente redirects oficiais no Supabase Auth.
- Ative backup/PITR compatível com o plano contratado e ensaie uma restauração antes do lançamento.
- Registre apenas código de erro, duração, função e ID técnico de requisição. Não registre nomes, CPF, conteúdo clínico ou nomes de arquivos.
- Monitore falhas de Edge Functions, autenticação, crescimento do Storage e registros `removing` que precisem de reconciliação.
