# PRD — PsiManager

> Tipo: PRD inicial · Data: 2026-10-21
> **Status:** Implementada
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

O PsiManager é um sistema web para psicólogos autônomos organizarem os dados de seus pacientes e os respectivos prontuários clínicos em um ambiente único, agradável e seguro. O primeiro recorte substitui controles em papel e planilhas por cadastros pesquisáveis, registros clínicos cronológicos, anexos protegidos e exportação do prontuário.

## 2. Problema que resolve

Psicólogos autônomos frequentemente mantêm dados cadastrais, anamneses, planos terapêuticos e evoluções em papel ou planilhas dispersas. Isso aumenta o tempo administrativo, dificulta localizar o histórico completo de um paciente, favorece duplicidades e perdas e torna mais difícil controlar alterações em informações clínicas sensíveis.

O PsiManager centraliza essas informações, preserva o histórico das mudanças e permite que o profissional encontre e consulte o prontuário com rapidez, sem misturar dados entre contas.

## 3. Público-alvo

Psicólogos autônomos que atendem pacientes adultos, crianças e adolescentes e atualmente organizam cadastros e prontuários principalmente em papel ou planilhas.

Pacientes e responsáveis legais são pessoas cadastradas, mas não acessam o sistema neste recorte.

## 4. Objetivo do recorte atual

Entregar um MVP no qual cada psicólogo possa criar sua conta profissional, cadastrar e localizar pacientes, registrar responsáveis legais quando necessário, manter anamnese, plano terapêutico e evoluções, anexar documentos e gerar um PDF legível do prontuário. Todos os dados devem permanecer isolados por profissional e as alterações relevantes devem ser auditáveis.

## 5. Funcionalidades

**Essenciais:**

- Cadastro de conta, confirmação de e-mail, login, encerramento de sessão e recuperação de senha.
- Perfil profissional com nome e identificação de CRP.
- Isolamento integral dos dados por psicólogo autenticado.
- Listagem, busca e filtros de pacientes ativos e arquivados.
- Cadastro e edição de pacientes adultos, crianças e adolescentes.
- Cadastro de um ou mais responsáveis legais para pacientes menores de 18 anos.
- Prevenção e alerta de possíveis cadastros duplicados.
- Arquivamento e reativação de pacientes sem exclusão definitiva pela interface.
- Anamnese e plano terapêutico editáveis, com histórico de alterações.
- Evoluções clínicas em rascunho ou finalizadas, com edição auditada.
- Histórico cronológico de evoluções com busca e filtros.
- Anexos gerais do paciente e anexos associados a uma evolução.
- Exportação e impressão do prontuário completo em PDF.
- Tratamento visível dos estados de carregamento, vazio, sucesso e erro.
- Interface responsiva e coerente com o sistema visual Serene Clinical definido no documento de referência do projeto.

**Desejáveis:**

- Não há funcionalidades desejáveis adicionais neste recorte. Recursos não essenciais foram explicitamente adiados para preservar o foco do MVP.

## 6. Fora do escopo

- Agenda, agendamento e gestão de sessões.
- Gestão financeira, honorários, cobranças e pagamentos.
- Portal ou conta de acesso para pacientes e responsáveis.
- Teleconsulta ou videoconferência.
- Aplicação e correção de testes psicológicos.
- Emissão de atestados, declarações e relatórios psicológicos específicos.
- Importação de pacientes por planilha ou migração automática de sistemas anteriores.
- Autenticação em dois fatores.
- Consulta externa ao conselho profissional ou comprovação de CRP ativo.
- Exclusão definitiva de pacientes pela interface.
- Fluxos jurídicos de consentimento, assinatura eletrônica ou representação legal.
- Incorporação de anexos, rascunhos ou histórico de auditoria ao PDF clínico.
- Gestão de clínicas, equipes, permissões entre profissionais ou compartilhamento de prontuários.

## 7. Regras de negócio

- Regra 1: cada psicólogo só pode visualizar e manipular sua própria conta e os pacientes, responsáveis, prontuários, versões e anexos pertencentes a ela.
- Regra 2: nome completo e data de nascimento são obrigatórios no cadastro de qualquer paciente.
- Regra 3: CPF, nome social, gênero/pronomes, telefone, e-mail, endereço, profissão ou escola, contato de emergência e observações são opcionais.
- Regra 4: paciente com menos de 18 anos na data do cadastro deve possuir ao menos um responsável legal.
- Regra 5: cada menor pode possuir vários responsáveis. Nome, vínculo, telefone e e-mail são obrigatórios para cada responsável; CPF é opcional.
- Regra 6: ao completar 18 anos, o paciente deixa de exigir responsável, mas os responsáveis já registrados permanecem no histórico até serem alterados pelo psicólogo.
- Regra 7: um CPF de paciente não pode se repetir dentro da mesma conta. Coincidência de nome completo e data de nascimento gera alerta, mas o psicólogo pode confirmar o novo cadastro.
- Regra 8: paciente arquivado continua consultável, porém não aceita novas evoluções até ser reativado.
- Regra 9: a evolução clínica contém data do atendimento, demanda ou relato, intervenção realizada, resposta clínica e próximos passos. Somente a data e o relato são obrigatórios.
- Regra 10: rascunhos de evolução podem ser alterados ou descartados e não integram o histórico clínico final nem o PDF.
- Regra 11: evoluções finalizadas podem ser editadas, mas não apagadas. Cada edição preserva a versão anterior, o momento e o autor da alteração.
- Regra 12: alterações em dados cadastrais sensíveis, responsáveis, anamnese e plano terapêutico também preservam histórico auditável.
- Regra 13: pacientes não são excluídos definitivamente pela interface; podem ser arquivados e reativados.
- Regra 14: anexos aceitos são PDF, JPG e PNG, com limite de 10 MB por arquivo.
- Regra 15: anexos podem pertencer ao cadastro geral do paciente ou a uma evolução específica e devem ser privados.
- Regra 16: o PDF contém identificação do paciente, responsáveis, anamnese, plano terapêutico e evoluções finalizadas em ordem cronológica. Não contém rascunhos, arquivos anexados nem auditoria.
- Regra 17: nome, e-mail, senha, número do CRP e estado do registro são obrigatórios para o psicólogo. O CRP é validado apenas quanto a preenchimento e formato no MVP.
- Regra 18: todas as telas do MVP devem seguir a referência [Serene Clinical — UI, layout e design](../stitch_psimanager_psychology_clinic_system/serene_clinical/DESIGN.md). Os tokens estruturados no cabeçalho desse documento prevalecem quando houver divergência com exemplos narrativos.

## 8. Fluxos principais

### Fluxo 1 — Criar conta e acessar o sistema

1. O psicólogo informa seus dados profissionais, e-mail e senha.
2. O sistema valida os dados e solicita a confirmação do e-mail.
3. Após confirmar o e-mail, o psicólogo entra com suas credenciais.
4. Se esquecer a senha, solicita e conclui a recuperação por e-mail.
5. Ao sair, perde o acesso às áreas protegidas até autenticar-se novamente.

### Fluxo 2 — Cadastrar e localizar um paciente

1. O psicólogo acessa a lista de pacientes e inicia um cadastro.
2. Informa os dados obrigatórios e, quando desejar, os campos opcionais.
3. Para um menor, informa pelo menos um responsável legal.
4. O sistema verifica CPF repetido e possível coincidência de nome e nascimento.
5. Sem impedimentos, salva o cadastro e abre o perfil do paciente.
6. Posteriormente, o profissional localiza o paciente por busca ou filtros.

### Fluxo 3 — Manter o prontuário

1. No perfil do paciente, o psicólogo preenche ou atualiza a anamnese.
2. Registra ou atualiza o plano terapêutico.
3. Cria uma evolução, informa ao menos data e relato e a salva como rascunho.
4. Revisa e finaliza a evolução.
5. Consulta as evoluções finalizadas em ordem cronológica e usa busca ou filtros quando necessário.
6. Se editar conteúdo clínico, o sistema preserva a versão anterior na auditoria.

### Fluxo 4 — Gerenciar anexos

1. O psicólogo escolhe adicionar um documento geral ou vinculá-lo a uma evolução.
2. Seleciona um arquivo compatível de até 10 MB.
3. O sistema valida e armazena o arquivo de forma privada.
4. O psicólogo pode visualizar, baixar ou remover o anexo dentro do prontuário correspondente.

### Fluxo 5 — Arquivar ou reativar paciente

1. O psicólogo arquiva um paciente que não está em acompanhamento ativo.
2. O paciente deixa a lista padrão de ativos, mas permanece consultável.
3. Enquanto arquivado, o prontuário fica disponível para leitura e não aceita novas evoluções.
4. Ao reativá-lo, o sistema volta a permitir registros clínicos.

### Fluxo 6 — Exportar prontuário

1. O psicólogo acessa um paciente e solicita a exportação.
2. O sistema reúne os dados clínicos incluídos no documento.
3. O psicólogo confere a identificação do paciente e gera o PDF.
4. O arquivo é exibido para impressão ou download, sem rascunhos, anexos ou auditoria.

## 9. Critérios de aceite

- O psicólogo consegue criar e confirmar uma conta, entrar, sair e recuperar a senha.
- Um usuário autenticado nunca consegue consultar ou alterar dados pertencentes a outra conta.
- O sistema impede o cadastro de paciente sem nome completo ou data de nascimento.
- O sistema exige responsável legal para pacientes menores de 18 anos e permite vários responsáveis.
- O sistema bloqueia CPF duplicado na mesma conta e alerta sobre nome e nascimento coincidentes.
- O psicólogo consegue buscar, editar, arquivar e reativar seus pacientes.
- Paciente arquivado permanece consultável, mas não recebe novas evoluções.
- O psicólogo consegue manter anamnese, plano terapêutico e evoluções com histórico de alterações.
- Rascunhos podem ser descartados e não aparecem no histórico final nem no PDF.
- Evoluções finalizadas não podem ser apagadas e mantêm todas as versões após edição.
- O sistema rejeita anexos em formato não permitido ou acima de 10 MB.
- Anexos só podem ser acessados pelo proprietário dos dados.
- O PDF apresenta o conteúdo confirmado para exportação e omite rascunhos, anexos e auditoria.
- Falhas de carregamento, validação, permissão, armazenamento ou exportação apresentam mensagem compreensível e não simulam sucesso.
- As telas permanecem legíveis e operáveis nos layouts mobile, tablet e desktop descritos na referência de design.
- Navegação, formulários, estados, cartões e registros clínicos seguem a hierarquia visual do Serene Clinical sem apresentar atalhos inativos para módulos fora do MVP.

## 10. Stack

- Frontend: Vue com Vite e TypeScript, usando Vue Router para navegação e Pinia para estado compartilhado.
- Plataforma de backend: Supabase.
- Persistência: PostgreSQL gerenciado pelo Supabase.
- Identidade: autenticação e recuperação de acesso pelo Supabase.
- Arquivos: armazenamento privado do Supabase para anexos clínicos.
- Qualidade: Vitest e Vue Test Utils para comportamento de componentes e Playwright para fluxos críticos de ponta a ponta.

## 11. Justificativa da stack

O frontend já foi iniciado com Vue, Vite e TypeScript, portanto mantê-lo evita uma reescrita sem valor para o produto. O Supabase reúne autenticação, banco relacional e armazenamento privado, reduzindo a infraestrutura necessária para um MVP com dados relacionados e arquivos sensíveis. A combinação permite entregar rapidamente sem abrir mão do isolamento por usuário, de regras de acesso no backend e de evolução futura.

### 11.1 Referência de UI, layout e design

A fonte visual do PsiManager é o documento [Serene Clinical — UI, layout e design](../stitch_psimanager_psychology_clinic_system/serene_clinical/DESIGN.md). Ele deve orientar todas as specs deste PRD como requisito transversal, sem ampliar o escopo funcional.

**Direção visual:**

- Adotar o estilo “Warm Professional Minimalist”, equilibrando rigor clínico, acolhimento, discrição e baixa carga cognitiva.
- Usar espaço negativo generoso, superfícies suaves, divisores discretos e elevação difusa, evitando aparência hospitalar fria, sombras agressivas ou excesso de elementos decorativos.
- Aplicar os tokens de cor, tipografia, espaçamento, arredondamento e elevação definidos no cabeçalho estruturado do `DESIGN.md`. Em caso de divergência entre esses tokens e exemplos textuais no mesmo documento, os tokens estruturados são a fonte principal.
- Utilizar Plus Jakarta Sans e preservar a altura de linha ampliada prevista para anamneses, planos terapêuticos e evoluções longas.

**Layout responsivo:**

- Desktop a partir de 1280 px: navegação lateral recolhível, conteúdo em grade fluida e largura máxima de 1600 px.
- Tablet entre 768 px e 1279 px: grade adaptativa e navegação recolhida em drawer ou superfície compacta equivalente.
- Mobile abaixo de 768 px: fluxo principal em uma coluna, priorizando leitura, preenchimento e ações clínicas essenciais.
- O modo de densidade confortável é o padrão. A densidade compacta pode ser usada apenas onde houver alta concentração de registros, como a auditoria, sem comprometer leitura ou interação.

**Aplicação aos componentes do MVP:**

- Navegação: apresentar somente conta, pacientes e prontuários previstos neste recorte. Itens dos protótipos relativos a agenda, financeiro, teleconsulta ou outros módulos futuros não devem aparecer como atalhos sem função.
- Pacientes e prontuários: usar cartões e superfícies clínicas com hierarquia clara entre identificação, metadados, situação e ações.
- Formulários: inputs e áreas de texto devem possuir rótulos visíveis, foco perceptível, erros associados ao campo e espaço adequado para conteúdo clínico extenso.
- Ações: distinguir visualmente ações primárias, secundárias, discretas e destrutivas; arquivamento, descarte de rascunho e remoção de anexo exigem confirmação compatível com sua consequência.
- Estados: carregamento, vazio, sucesso, alerta e erro devem combinar texto, ícone ou estrutura visual; cor isolada não pode ser o único indicador.
- Situações como ativo, arquivado, rascunho e finalizado devem usar badges consistentes e permanecer compreensíveis sem depender apenas da cor.
- Interações devem ser utilizáveis por teclado, manter foco visível e preservar contraste e legibilidade nos tamanhos de tela previstos.

**Limites da referência:**

- O `DESIGN.md` define a linguagem visual, mas não adiciona funcionalidades ao MVP.
- Componentes de calendário, cobrança, teleconsulta e demais módulos fora do escopo servem apenas como exemplos do sistema visual e não devem ser implementados nesta entrega.
- Menções visuais a salvamento automático não tornam o autosave um requisito. Cada spec continua obedecendo aos comportamentos de salvamento definidos neste PRD.
- Os arquivos de protótipo em `docs/stitch_psimanager_psychology_clinic_system/` podem auxiliar a composição visual, mas as regras funcionais e os critérios de aceite deste PRD prevalecem em caso de conflito.

## 12. Fases de construção

### Fase 1 — Acesso e proteção

Objetivo: estabelecer a identidade do profissional e a separação segura dos dados antes de introduzir informações clínicas.

Specs:

- Spec 01 — Conta e perfil profissional.
- Spec 02 — Isolamento e auditoria de dados.

### Fase 2 — Gestão de pacientes

Objetivo: substituir os cadastros em papel e planilhas por uma base pesquisável e organizada.

Specs:

- Spec 03 — Lista, busca e filtros de pacientes.
- Spec 04 — Cadastro, responsáveis e ciclo de vida do paciente.

### Fase 3 — Prontuário clínico

Objetivo: centralizar a documentação longitudinal do acompanhamento psicológico.

Specs:

- Spec 05 — Anamnese clínica.
- Spec 06 — Plano terapêutico.
- Spec 07 — Evoluções e histórico clínico.

### Fase 4 — Documentos

Objetivo: complementar o prontuário com arquivos privados e uma saída documental legível.

Specs:

- Spec 08 — Anexos clínicos.
- Spec 09 — Exportação do prontuário em PDF.

## 13. Specs funcionais detalhadas

### Spec 01 — Conta e perfil profissional

- **Fase:** Fase 1 — Acesso e proteção
- **Objetivo (o quê):** Permitir que o psicólogo crie e confirme sua conta, autentique-se, recupere o acesso e mantenha sua identificação profissional.
- **Intenção (por quê):** Restringir o sistema ao profissional responsável e estabelecer a identidade usada em todos os registros e documentos.
- **Contexto:** É a porta de entrada do produto e antecede qualquer acesso a dados de pacientes.
- **Atores:** Psicólogo autônomo.
- **Descrição do comportamento:** O profissional cadastra nome, e-mail, senha, número do CRP e estado do registro. O sistema valida preenchimento, formato e unicidade do e-mail, envia confirmação e só libera a área protegida após a confirmação. Usuários confirmados podem entrar, sair, recuperar a senha por e-mail e atualizar nome e identificação profissional. Não há validação externa do CRP nem autenticação em dois fatores.
- **Entradas e saídas:** Entram dados profissionais e credenciais; saem confirmação de cadastro, mensagens de validação, sessão autenticada, comunicação de recuperação e perfil atualizado.
- **Dados/entidades envolvidos (conceitual):** Conta profissional: nome, e-mail, credencial, CRP, estado do CRP, confirmação do e-mail e datas de criação/alteração.
- **Estados e transições:** Cadastro pendente → e-mail confirmado → conta apta a autenticar; sessão ausente → autenticada → encerrada; senha vigente → recuperação solicitada → senha redefinida.
- **Regras de negócio:** E-mail é único; todos os campos definidos para o profissional são obrigatórios; CRP recebe apenas validação de formato; áreas clínicas exigem sessão válida.
- **Validações:** Formato de e-mail; política de senha; confirmação de senha; formato do CRP e estado; e-mail ainda não utilizado; validade do pedido de recuperação.
- **Fluxo do usuário (passo a passo):**
  1. O psicólogo preenche o cadastro.
  2. Corrige eventuais erros e confirma o envio.
  3. Confirma o endereço pelo e-mail recebido.
  4. Entra no sistema e visualiza sua área protegida.
  5. Quando necessário, encerra a sessão, recupera a senha ou atualiza o perfil.
- **Casos de borda e erros:** E-mail já usado orienta a entrar ou recuperar a senha; confirmação inválida ou expirada permite solicitar novo envio; credenciais incorretas não revelam qual campo falhou; falha de rede mantém o formulário e informa que a ação não foi concluída; usuário não confirmado recebe orientação clara.
- **Impacto no existente:** Substitui a tela padrão do scaffold pela entrada real da aplicação e passa a proteger as demais áreas.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um e-mail novo e dados válidos, quando o cadastro for enviado, então a conta fica pendente e uma confirmação é enviada.
  - Dada uma conta confirmada, quando credenciais válidas forem informadas, então o usuário acessa apenas sua área.
  - Dado um usuário que esqueceu a senha, quando concluir o fluxo recebido por e-mail, então consegue definir uma nova senha.
  - Dada uma sessão encerrada ou inválida, quando uma área protegida for acessada, então o sistema exige nova autenticação.
- **Definição de pronto:** Cadastro, confirmação, login, logout, recuperação e edição do perfil funcionam nos caminhos de sucesso e erro, com proteção das rotas clínicas.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Autenticação em dois fatores, login social, validação externa do CRP, equipes e perfis administrativos.

### Spec 02 — Isolamento e auditoria de dados

- **Fase:** Fase 1 — Acesso e proteção
- **Objetivo (o quê):** Garantir que todo dado clínico pertença a uma única conta e que alterações relevantes possam ser rastreadas.
- **Intenção (por quê):** Proteger a confidencialidade dos pacientes e evitar que edições apaguem silenciosamente o histórico clínico.
- **Contexto:** Regra transversal aplicada aos pacientes, responsáveis, anamnese, plano terapêutico, evoluções e anexos das specs seguintes.
- **Atores:** Psicólogo autenticado; sistema.
- **Descrição do comportamento:** Toda leitura, inclusão, alteração, arquivamento, exportação e acesso a arquivo é autorizada pelo proprietário dos dados. Alterações em dados cadastrais sensíveis, responsáveis e conteúdo clínico registram autor, momento, tipo da ação e conteúdo anterior necessário à reconstrução da versão. O histórico é interno e não integra o PDF clínico.
- **Entradas e saídas:** Entram identidade autenticada e ação solicitada; saem autorização ou negativa e, quando aplicável, um registro de auditoria consultável no contexto do item alterado.
- **Dados/entidades envolvidos (conceitual):** Proprietário; recurso protegido; ação; versão anterior e atual; autor; data e hora.
- **Estados e transições:** Recurso atual → alteração autorizada → nova versão atual com versão anterior preservada; solicitação não autorizada → negada sem alteração.
- **Regras de negócio:** O vínculo de propriedade não pode ser trocado pela interface; negar acesso apenas na interface não é suficiente, portanto a restrição vale na fonte dos dados e nos arquivos; registros de auditoria não são editáveis pelo usuário.
- **Validações:** Sessão válida; propriedade de cada recurso relacionado; consistência entre paciente, prontuário, evolução e anexo; presença do contexto de auditoria antes de concluir uma alteração sensível.
- **Fluxo do usuário (passo a passo):**
  1. O psicólogo solicita visualizar ou alterar um recurso.
  2. O sistema verifica identidade e propriedade.
  3. Se autorizado, executa a ação e registra a versão quando necessário.
  4. Se não autorizado, nega a operação sem revelar dados do recurso.
- **Casos de borda e erros:** Identificador inexistente ou de outra conta produz resposta neutra; sessão expirada interrompe a ação; falha ao registrar auditoria impede a confirmação da alteração; tentativa de combinar recursos de proprietários diferentes é rejeitada.
- **Impacto no existente:** Define a regra de segurança obrigatória para toda funcionalidade com dados reais.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dadas duas contas, quando uma tentar acessar diretamente um recurso da outra, então nenhum dado é retornado ou alterado.
  - Dado um conteúdo clínico existente, quando ele for editado, então a nova versão é exibida e a anterior permanece íntegra na auditoria.
  - Dada uma falha na criação da auditoria, quando uma alteração sensível for solicitada, então a alteração não é apresentada como concluída.
- **Definição de pronto:** Todos os recursos previstos no MVP aplicam propriedade, autorização e auditoria de forma consistente, inclusive em acessos diretos e arquivos.
- **Dependências:** Spec 01 — identidade autenticada e conta proprietária.
- **Fora do escopo desta spec:** Compartilhamento entre profissionais, painel de conformidade, exportação da auditoria e políticas jurídicas de retenção.

### Spec 03 — Lista, busca e filtros de pacientes

- **Fase:** Fase 2 — Gestão de pacientes
- **Objetivo (o quê):** Oferecer uma visão organizada dos pacientes e permitir localizar rapidamente um cadastro.
- **Intenção (por quê):** Eliminar a procura manual em papéis e planilhas e tornar o prontuário acessível com poucos passos.
- **Contexto:** É o ponto de entrada para o cadastro e o prontuário de cada paciente.
- **Atores:** Psicólogo autenticado.
- **Descrição do comportamento:** A área apresenta por padrão pacientes ativos pertencentes ao usuário, com identificação suficiente para diferenciar homônimos. O psicólogo pode buscar por nome, nome social ou CPF e filtrar por situação ativa ou arquivada. Pode limpar busca e filtros, abrir o perfil encontrado ou iniciar um novo cadastro.
- **Entradas e saídas:** Entram texto de busca, filtro de situação e ação de seleção; saem lista correspondente, quantidade encontrada, estado vazio ou perfil escolhido.
- **Dados/entidades envolvidos (conceitual):** Paciente: nome, nome social, data de nascimento, CPF quando existente e situação.
- **Estados e transições:** Carregando → lista, vazio ou erro; filtros alterados → resultados atualizados; item selecionado → perfil do paciente.
- **Regras de negócio:** Só aparecem pacientes da conta autenticada; ativos são o padrão; arquivados devem ser distinguíveis visualmente; busca não altera dados.
- **Validações:** Texto de busca normalizado; filtros reconhecidos; paciente selecionado ainda pertence ao usuário.
- **Fluxo do usuário (passo a passo):**
  1. O psicólogo abre a área de pacientes.
  2. Visualiza os ativos ou informa uma busca.
  3. Ajusta o filtro quando deseja encontrar arquivados.
  4. Abre o paciente ou inicia um novo cadastro.
- **Casos de borda e erros:** Sem pacientes, o sistema explica como cadastrar o primeiro; sem resultado, oferece limpar filtros; falha de carregamento oferece nova tentativa; homônimos mostram data de nascimento e outro identificador disponível.
- **Impacto no existente:** Introduz a navegação principal após a autenticação.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dados pacientes ativos e arquivados, quando a lista abrir, então somente os ativos aparecem por padrão.
  - Dado um nome, nome social ou CPF existente, quando o termo for buscado, então o paciente correspondente aparece.
  - Dado que nenhum item corresponda, quando a busca terminar, então um estado vazio orienta o usuário sem apagar os filtros silenciosamente.
- **Definição de pronto:** Lista, busca, filtros, estados de interface e abertura do perfil funcionam apenas com dados do proprietário.
- **Dependências:** Specs 01 e 02.
- **Fora do escopo desta spec:** Busca global em outras entidades, paginação avançada, relatórios e importação em massa.

### Spec 04 — Cadastro, responsáveis e ciclo de vida do paciente

- **Fase:** Fase 2 — Gestão de pacientes
- **Objetivo (o quê):** Permitir criar, editar, arquivar e reativar pacientes, incluindo os responsáveis necessários para menores.
- **Intenção (por quê):** Formar uma base cadastral confiável que sustente o prontuário sem duplicidades evitáveis ou perda de registros antigos.
- **Contexto:** O cadastro alimenta todas as funcionalidades clínicas e documentais posteriores.
- **Atores:** Psicólogo autenticado.
- **Descrição do comportamento:** O psicólogo informa nome completo e data de nascimento e pode preencher os demais dados opcionais. A idade determina a exigência de responsável. Cada responsável registra nome, vínculo, telefone e e-mail, com CPF opcional, e outros responsáveis podem ser adicionados ou removidos desde que a regra mínima seja mantida. Antes de salvar, o sistema bloqueia CPF já usado na conta e alerta sobre coincidência de nome e nascimento, permitindo confirmar este último caso. O perfil pode ser editado com auditoria, arquivado após confirmação e reativado depois.
- **Entradas e saídas:** Entram dados do paciente, responsáveis e comandos de ciclo de vida; saem cadastro salvo, alertas de duplicidade, validações e situação atualizada.
- **Dados/entidades envolvidos (conceitual):** Paciente: identificação, nascimento, contatos, endereço, dados pessoais opcionais, emergência, observações e situação; responsável: identificação, vínculo e contatos; histórico de mudanças.
- **Estados e transições:** Novo → ativo; ativo → arquivado; arquivado → ativo. Menor → adulto ao atingir 18 anos, removendo a obrigatoriedade futura sem apagar responsáveis existentes.
- **Regras de negócio:** Aplicam-se as regras 2 a 8 e 12 a 13 da seção 7; arquivamento não apaga prontuário; nova evolução exige paciente ativo.
- **Validações:** Campos obrigatórios; datas válidas; idade calculada pela data de nascimento; responsável mínimo para menor; telefone, e-mail e CPF quando informados; CPF único na conta; confirmação explícita do alerta por nome e nascimento.
- **Fluxo do usuário (passo a passo):**
  1. O psicólogo inicia ou edita o cadastro.
  2. Informa os dados do paciente.
  3. Se menor, adiciona ao menos um responsável.
  4. Resolve erros ou confirma possível homônimo.
  5. Salva e acessa o perfil.
  6. Quando necessário, arquiva ou reativa o paciente.
- **Casos de borda e erros:** Data futura é rejeitada; mudança de nascimento que torne o paciente menor passa a exigir responsável; remoção do último responsável de menor é bloqueada; CPF duplicado informa o conflito sem expor conta alheia; falha ao salvar preserva os dados digitados; arquivamento exige confirmação.
- **Impacto no existente:** Alimenta a lista de pacientes e cria o contexto obrigatório para prontuário e documentos.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um adulto com nome e nascimento válidos, quando salvar, então o cadastro ativo é criado sem exigir responsável.
  - Dado um menor sem responsável, quando salvar, então o sistema bloqueia e indica os campos necessários.
  - Dado um CPF já usado na conta, quando outro cadastro for enviado, então a duplicidade é bloqueada.
  - Dada coincidência de nome e nascimento, quando o psicólogo confirmar que são pessoas distintas, então o cadastro pode prosseguir.
  - Dado um paciente arquivado, quando for reativado, então volta a aceitar novos registros clínicos.
- **Definição de pronto:** Cadastro completo, responsáveis múltiplos, duplicidades, edição auditada, arquivamento e reativação atendem às regras e aos erros descritos.
- **Dependências:** Specs 01, 02 e 03.
- **Fora do escopo desta spec:** Exclusão definitiva, importação em lote, acesso do responsável e assinatura de consentimentos.

### Spec 05 — Anamnese clínica

- **Fase:** Fase 3 — Prontuário clínico
- **Objetivo (o quê):** Permitir registrar e atualizar a anamnese do paciente como parte identificável do prontuário.
- **Intenção (por quê):** Centralizar as informações iniciais que contextualizam o acompanhamento e evitar documentos paralelos.
- **Contexto:** Fica no perfil do paciente e é distinta das evoluções cronológicas.
- **Atores:** Psicólogo autenticado.
- **Descrição do comportamento:** O psicólogo abre a seção de anamnese, registra conteúdo clínico textual, salva e volta a editá-lo quando necessário. A versão atual é exibida com a data da última atualização; cada alteração preserva a versão anterior e pode ser consultada internamente.
- **Entradas e saídas:** Entra conteúdo textual; saem versão atual, confirmação de salvamento, data de atualização e histórico de versões.
- **Dados/entidades envolvidos (conceitual):** Anamnese: paciente, conteúdo, autor, momento de criação e versões de alteração.
- **Estados e transições:** Ausente → preenchida; preenchida → atualizada com versão anterior preservada. Não há estado de aprovação.
- **Regras de negócio:** Apenas o proprietário acessa; conteúdo pertence a um paciente; alterações são auditadas; a versão atual integra o PDF.
- **Validações:** Paciente existente e pertencente à conta; conteúdo não vazio ao salvar; prevenção de envio duplicado.
- **Fluxo do usuário (passo a passo):**
  1. O psicólogo abre a anamnese do paciente.
  2. Preenche ou revisa o conteúdo.
  3. Salva e recebe confirmação.
  4. Quando necessário, consulta versões ou faz nova edição.
- **Casos de borda e erros:** Sem anamnese, há estado vazio com ação para começar; edição concorrente não deve sobrescrever silenciosamente uma versão mais nova; falha ao salvar mantém o texto disponível e informa o erro; paciente arquivado permite consulta e edição do conteúdo existente, mas não cria evolução.
- **Impacto no existente:** Acrescenta a primeira seção clínica ao perfil e passa a compor a exportação.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um paciente sem anamnese, quando o conteúdo for salvo, então ele passa a aparecer no prontuário.
  - Dada uma anamnese existente, quando for editada, então a nova versão aparece e a anterior permanece auditável.
  - Dada uma falha de salvamento, quando ocorrer, então o sistema não perde silenciosamente o texto digitado nem informa sucesso.
- **Definição de pronto:** Criação, consulta, edição, auditoria e estados de erro da anamnese funcionam e respeitam propriedade.
- **Dependências:** Specs 02 e 04.
- **Fora do escopo desta spec:** Modelos especializados de entrevista, assinatura, diagnóstico automatizado e acesso do paciente.

### Spec 06 — Plano terapêutico

- **Fase:** Fase 3 — Prontuário clínico
- **Objetivo (o quê):** Permitir registrar e manter o plano terapêutico vigente do paciente.
- **Intenção (por quê):** Tornar objetivos e direcionamentos do acompanhamento fáceis de consultar junto ao restante do prontuário.
- **Contexto:** Seção clínica independente da anamnese e das evoluções, vinculada ao paciente.
- **Atores:** Psicólogo autenticado.
- **Descrição do comportamento:** O psicólogo registra o conteúdo do plano, consulta sua versão atual e o atualiza ao longo do acompanhamento. Cada alteração preserva autor, momento e versão anterior. A versão atual integra o PDF.
- **Entradas e saídas:** Entra conteúdo textual do plano; saem plano vigente, confirmação, data de atualização e histórico interno.
- **Dados/entidades envolvidos (conceitual):** Plano terapêutico: paciente, conteúdo, autor, criação e versões.
- **Estados e transições:** Ausente → preenchido; preenchido → atualizado com histórico. Não há aprovação ou encerramento próprio.
- **Regras de negócio:** Somente o proprietário acessa; há um plano vigente por paciente neste recorte; nenhuma atualização elimina versões anteriores.
- **Validações:** Paciente válido e pertencente à conta; conteúdo não vazio; proteção contra submissão duplicada e conflito de versão.
- **Fluxo do usuário (passo a passo):**
  1. O psicólogo abre a seção do plano.
  2. Registra ou edita seu conteúdo.
  3. Salva e consulta a versão vigente.
  4. Se necessário, acessa o histórico de alterações.
- **Casos de borda e erros:** Estado inicial vazio orienta o preenchimento; conflito de edição exige recarregar ou comparar antes de substituir; falha de rede preserva o texto; acesso indevido é negado.
- **Impacto no existente:** Complementa o prontuário e a exportação clínica.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um paciente sem plano, quando um conteúdo válido for salvo, então ele se torna o plano vigente.
  - Dado um plano existente, quando for alterado, então a versão anterior permanece disponível na auditoria.
  - Dado o prontuário exportado, quando houver plano, então sua versão atual aparece no PDF.
- **Definição de pronto:** O plano pode ser criado, consultado e atualizado com auditoria, autorização e tratamento de erros.
- **Dependências:** Specs 02 e 04.
- **Fora do escopo desta spec:** Metas estruturadas com indicadores, lembretes, colaboração e modelos automáticos.

### Spec 07 — Evoluções e histórico clínico

- **Fase:** Fase 3 — Prontuário clínico
- **Objetivo (o quê):** Permitir criar rascunhos, finalizar evoluções, consultar o histórico cronológico e editar registros finalizados sem perder versões.
- **Intenção (por quê):** Registrar a continuidade do acompanhamento com flexibilidade de escrita e rastreabilidade clínica.
- **Contexto:** É o núcleo longitudinal do prontuário e utiliza o paciente ativo como contexto.
- **Atores:** Psicólogo autenticado.
- **Descrição do comportamento:** O profissional cria uma evolução com data do atendimento, demanda ou relato, intervenção, resposta clínica e próximos passos. Data e relato são obrigatórios. Pode salvar como rascunho, continuar depois, descartar o rascunho ou finalizá-lo. A evolução finalizada entra no histórico cronológico e no PDF, pode ser editada livremente e nunca pode ser apagada; cada edição cria uma versão auditável. O histórico permite pesquisar no conteúdo e filtrar por período.
- **Entradas e saídas:** Entram campos clínicos, situação desejada, termo de busca e período; saem rascunho, evolução finalizada, lista cronológica filtrada, validações e versões.
- **Dados/entidades envolvidos (conceitual):** Evolução: paciente, data do atendimento, relato, intervenção, resposta, próximos passos, situação, autor, criação, atualização e versões.
- **Estados e transições:** Nova → rascunho → finalizada; rascunho → descartado; finalizada → editada, permanecendo finalizada e gerando versão. Evolução finalizada não transita para excluída ou rascunho.
- **Regras de negócio:** Só paciente ativo recebe nova evolução; data e relato são obrigatórios para finalizar; rascunho não integra histórico final nem PDF; finalizada não pode ser apagada; edições são auditadas; ordenação padrão é cronológica, com critério consistente para datas iguais.
- **Validações:** Propriedade e situação do paciente; data válida; relato preenchido na finalização; período de filtro coerente; confirmação ao descartar rascunho; conflito de versão.
- **Fluxo do usuário (passo a passo):**
  1. O psicólogo abre um paciente ativo e inicia uma evolução.
  2. Preenche os campos e salva como rascunho.
  3. Retoma o rascunho, revisa e finaliza.
  4. Consulta a evolução no histórico e usa busca ou período para localizá-la.
  5. Se editar uma finalizada, confirma a nova versão sem apagar a anterior.
- **Casos de borda e erros:** Paciente arquivado bloqueia nova evolução e oferece reativação; data inválida impede finalização; saída com alterações não salvas pede confirmação; rascunho descartado exige confirmação; erro de salvamento mantém o conteúdo localmente disponível; edição concorrente não sobrescreve silenciosamente; busca sem resultado preserva filtros e orienta limpar.
- **Impacto no existente:** Torna o prontuário longitudinal e fornece o conjunto de evoluções para exportação e anexos específicos.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um paciente ativo, quando data e relato forem informados, então a evolução pode ser salva como rascunho ou finalizada.
  - Dado um rascunho, quando for descartado após confirmação, então ele deixa de existir e nunca aparece no histórico final.
  - Dada uma evolução finalizada, quando for editada, então o histórico exibe o conteúdo atual e preserva todas as versões anteriores.
  - Dado um paciente arquivado, quando o usuário tentar criar evolução, então a ação é bloqueada até a reativação.
  - Dado um período ou termo, quando o filtro for aplicado, então apenas evoluções finalizadas correspondentes aparecem.
- **Definição de pronto:** Rascunho, descarte, finalização, edição auditada, histórico, busca, filtros e bloqueio para arquivados funcionam de ponta a ponta.
- **Dependências:** Specs 02 e 04; Specs 05 e 06 fornecem o contexto clínico, mas não bloqueiam a criação de evolução.
- **Fora do escopo desta spec:** Agendamento, vínculo obrigatório com sessão, assinatura, bloqueio de edição por prazo e exclusão de evolução finalizada.

### Spec 08 — Anexos clínicos

- **Fase:** Fase 4 — Documentos
- **Objetivo (o quê):** Permitir armazenar, consultar, baixar e remover arquivos associados ao paciente ou a uma evolução.
- **Intenção (por quê):** Manter documentos de apoio junto ao prontuário, evitando arquivos dispersos e acesso público acidental.
- **Contexto:** Complementa o cadastro e as evoluções, sem incorporar os arquivos ao PDF.
- **Atores:** Psicólogo autenticado.
- **Descrição do comportamento:** No perfil ou em uma evolução, o psicólogo seleciona PDF, JPG ou PNG de até 10 MB. O sistema valida antes de concluir, indica o progresso, armazena privadamente e lista nome, tipo, tamanho, data e vínculo. O proprietário pode visualizar quando o formato permitir, baixar ou remover após confirmação. A remoção retira o arquivo disponível e registra a ação na auditoria.
- **Entradas e saídas:** Entram arquivo, vínculo e comando de remoção; saem progresso, metadados, acesso temporário protegido, download ou confirmação de remoção.
- **Dados/entidades envolvidos (conceitual):** Anexo: paciente, evolução opcional, nome, formato, tamanho, localização privada, autor, datas e situação.
- **Estados e transições:** Selecionado → enviando → disponível; envio → falhou e pode ser tentado novamente; disponível → removido. Um anexo de evolução sempre pertence ao mesmo paciente e proprietário.
- **Regras de negócio:** Apenas formatos e tamanho aprovados; armazenamento e acesso privados; remoção exige confirmação; anexos não integram o PDF; vínculo entre contas diferentes é proibido.
- **Validações:** Tipo real e extensão compatíveis; tamanho máximo; arquivo não vazio; paciente e evolução válidos; propriedade; vínculo coerente.
- **Fluxo do usuário (passo a passo):**
  1. O psicólogo escolhe o contexto geral ou uma evolução.
  2. Seleciona o arquivo.
  3. Acompanha a validação e o envio.
  4. Visualiza ou baixa o arquivo listado.
  5. Quando necessário, confirma sua remoção.
- **Casos de borda e erros:** Formato ou tamanho inválido é rejeitado antes de confirmar; interrupção do envio permite nova tentativa e não cria item disponível incompleto; arquivo ausente no armazenamento apresenta erro; sessão expirada interrompe acesso; tentativa de vínculo a evolução de outro paciente é rejeitada.
- **Impacto no existente:** Acrescenta documentos ao perfil e às evoluções, aumentando o volume e a sensibilidade dos dados protegidos.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um PDF, JPG ou PNG de até 10 MB, quando enviado em contexto válido, então ele aparece apenas no prontuário proprietário.
  - Dado um arquivo acima do limite ou incompatível, quando selecionado, então o envio é rejeitado com motivo claro.
  - Dado um anexo disponível, quando a remoção for confirmada, então o arquivo deixa de estar acessível e a ação fica auditada.
  - Dada outra conta, quando tentar acessar o endereço do arquivo, então o conteúdo não é entregue.
- **Definição de pronto:** Envio, listagem, visualização, download, remoção, falhas e acesso privado funcionam nos dois tipos de vínculo.
- **Dependências:** Specs 02 e 04; Spec 07 para vínculo opcional a evolução.
- **Fora do escopo desta spec:** Assinatura eletrônica, edição de arquivos, reconhecimento de texto, antivírus como funcionalidade visível e inclusão dos binários no PDF.

### Spec 09 — Exportação do prontuário em PDF

- **Fase:** Fase 4 — Documentos
- **Objetivo (o quê):** Gerar uma representação legível e imprimível do prontuário clínico atual do paciente.
- **Intenção (por quê):** Dar portabilidade ao registro e permitir impressão sem exigir a montagem manual de informações dispersas.
- **Contexto:** Consolida dados produzidos pelas specs de paciente, anamnese, plano e evoluções.
- **Atores:** Psicólogo autenticado.
- **Descrição do comportamento:** A partir do perfil do paciente, o psicólogo solicita a exportação, confere a identificação e gera um PDF com identificação do paciente, responsáveis registrados, anamnese vigente, plano vigente e evoluções finalizadas em ordem cronológica. Seções sem conteúdo são omitidas ou claramente identificadas como não preenchidas, sem inventar dados. Rascunhos, anexos e auditoria nunca entram. O arquivo pode ser visualizado, baixado e impresso.
- **Entradas e saídas:** Entram paciente selecionado e confirmação de geração; sai um PDF identificado, consistente com os dados autorizados no momento da geração.
- **Dados/entidades envolvidos (conceitual):** Perfil profissional; paciente; responsáveis; anamnese vigente; plano vigente; evoluções finalizadas; data e hora da geração.
- **Estados e transições:** Solicitação → gerando → disponível ou erro. A exportação não muda o prontuário.
- **Regras de negócio:** Somente o proprietário exporta; conteúdo obedece ao conjunto confirmado; ordem das evoluções é cronológica; rascunhos, anexos e auditoria são excluídos; conteúdo deve permanecer legível em tela e impressão.
- **Validações:** Sessão e propriedade; paciente existente; dados ainda disponíveis no momento da geração; geração completa antes de oferecer o arquivo.
- **Fluxo do usuário (passo a passo):**
  1. O psicólogo abre o paciente e escolhe exportar.
  2. Confere a identificação e confirma.
  3. Aguarda a geração sem repetir a solicitação acidentalmente.
  4. Visualiza, baixa ou imprime o PDF.
- **Casos de borda e erros:** Prontuário sem anamnese, plano ou evolução ainda gera documento coerente com indicação das ausências; conteúdo longo quebra páginas sem cortar informações; caracteres especiais são preservados; falha de geração permite tentar novamente; paciente de outra conta ou sessão expirada não produz arquivo.
- **Impacto no existente:** Cria uma saída derivada, sem alterar nem duplicar o estado clínico original.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um prontuário completo, quando o PDF for gerado, então contém identificação, responsáveis, anamnese, plano e evoluções finalizadas em ordem cronológica.
  - Dados rascunhos, anexos e versões de auditoria, quando o PDF for gerado, então nenhum deles aparece.
  - Dado conteúdo extenso e caracteres acentuados, quando o documento for aberto ou impresso, então permanece completo e legível.
  - Dada uma falha de geração, quando ocorrer, então nenhum arquivo incompleto é apresentado como válido e o usuário pode tentar novamente.
- **Definição de pronto:** Geração, visualização, download e impressão produzem conteúdo correto, autorizado e legível para prontuários completos e incompletos.
- **Dependências:** Specs 01, 02, 04, 05, 06 e 07.
- **Fora do escopo desta spec:** Anexar arquivos ao PDF, incluir auditoria, assinatura digital, modelos de atestado ou declaração e envio por e-mail.

## 14. Ordem recomendada de implementação

1. Spec 01 — Conta e perfil profissional.
2. Spec 02 — Isolamento e auditoria de dados.
3. Spec 03 — Lista, busca e filtros de pacientes.
4. Spec 04 — Cadastro, responsáveis e ciclo de vida do paciente.
5. Spec 05 — Anamnese clínica.
6. Spec 06 — Plano terapêutico.
7. Spec 07 — Evoluções e histórico clínico.
8. Spec 08 — Anexos clínicos.
9. Spec 09 — Exportação do prontuário em PDF.

Seguir essa ordem evita implementar dados clínicos antes da identidade e do isolamento, estabelece o paciente antes de seus registros dependentes e deixa os recursos documentais para quando todo o conteúdo de origem já estiver definido.
