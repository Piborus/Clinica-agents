begin;
create extension if not exists pgtap with schema extensions;
select plan(31);
insert into auth.users(id,email,raw_user_meta_data,email_confirmed_at) values
('11111111-1111-4111-8111-111111111111','alice@example.test','{"full_name":"Alice Teste","crp_number":"12345","crp_state":"SP"}',now()),
('22222222-2222-4222-8222-222222222222','bruno@example.test','{"full_name":"Bruno Teste","crp_number":"54321","crp_state":"RJ"}',now());
insert into public.patients(id,owner_id,full_name,birth_date) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Paciente Alice','1990-01-01'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','Paciente Bruno','1991-01-01');
insert into public.evolutions(id,owner_id,patient_id,attended_on,report,status,author_id) values
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',current_date,'Consulta Bruno','finalized','22222222-2222-4222-8222-222222222222');
set local role authenticated;
set local request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
select results_eq('select count(*) from public.patients',array[1::bigint],'RLS mostra apenas o paciente do usuário');
select results_eq($$select full_name from public.patients$$,array['Paciente Alice'::text],'RLS não vaza dados da outra conta');
select results_eq('select count(*) from public.audit_events',array[1::bigint],'Auditoria também fica isolada');
select throws_ok($$insert into public.audit_events(owner_id,entity_type,entity_id,action,actor_id) values('11111111-1111-4111-8111-111111111111','patient',gen_random_uuid(),'fake','11111111-1111-4111-8111-111111111111')$$,'42501',null,'Cliente não escreve auditoria');
select throws_ok($$select public.save_patient_with_guardians(null,'{"full_name":"Menor","birth_date":"2015-01-01"}'::jsonb,'[]'::jsonb,null,false)$$,null,'Menor sem responsável é rejeitado');
select lives_ok($$select public.save_patient_with_guardians(null,'{"full_name":"Adulto Novo","birth_date":"1992-01-01"}'::jsonb,'[]'::jsonb,null,false)$$,'Adulto pode ser criado sem responsável');
select results_eq($$select count(*) from public.evolutions$$,array[0::bigint],'Nenhuma evolução alheia é exposta');
select results_eq($$select count(*) from public.attachments$$,array[0::bigint],'Nenhum anexo alheio é exposto');
select throws_ok($$select public.save_patient_with_guardians(null,'{"full_name":"CPF Inválido","birth_date":"1990-01-01","cpf":"11111111111"}'::jsonb,'[]'::jsonb,null,false)$$,'23514',null,'CPF sem dígitos verificadores válidos é rejeitado no banco');
select lives_ok($$select public.save_patient_with_guardians(null,'{"full_name":"CPF Válido","birth_date":"1990-01-01","cpf":"52998224725"}'::jsonb,'[]'::jsonb,null,false)$$,'CPF válido é aceito');
select throws_ok($$select public.save_patient_with_guardians(null,'{"full_name":"Outro CPF","birth_date":"1992-02-02","cpf":"52998224725"}'::jsonb,'[]'::jsonb,null,false)$$,null,'CPF repetido na mesma conta é rejeitado');
select throws_ok($$select public.save_patient_with_guardians(null,'{"full_name":"Menor E-mail","birth_date":"2015-01-01"}'::jsonb,'[{"full_name":"Responsável Teste","relationship":"Mãe","phone":"11999999999","email":"invalido"}]'::jsonb,null,false)$$,'23514',null,'E-mail inválido de responsável é rejeitado no banco');
select lives_ok($$select public.save_patient_with_guardians(null,'{"full_name":"Menor Válido","birth_date":"2015-01-01"}'::jsonb,'[{"full_name":"Responsável Um","relationship":"Mãe","phone":"11999999999","email":"mae@example.test"},{"full_name":"Responsável Dois","relationship":"Pai","phone":"11888888888","email":"pai@example.test"}]'::jsonb,null,false)$$,'Menor aceita múltiplos responsáveis válidos');
select throws_ok($$select public.update_profile('Alice Teste','12345','ZZ',1)$$,'23514',null,'UF de CRP inexistente é rejeitada no banco');
select throws_ok($$update public.patients set owner_id='22222222-2222-4222-8222-222222222222' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,'42501',null,'Cliente não pode trocar proprietário');
select lives_ok($$select public.save_patient_with_guardians(null,'{"full_name":"Paciente Arquivar","birth_date":"1988-03-03"}'::jsonb,'[]'::jsonb,null,false)$$,'Paciente para arquivamento é criado');
select lives_ok($$select public.set_patient_status((select id from public.patients where full_name='Paciente Arquivar'),'archived',(select revision from public.patients where full_name='Paciente Arquivar'))$$,'Paciente pode ser arquivado');
select throws_ok($$select public.save_evolution(null,(select id from public.patients where full_name='Paciente Arquivar'),current_date,'Relato bloqueado',null,null,null,'finalized',null)$$,null,'Paciente arquivado não recebe nova evolução');
select lives_ok($$select public.save_evolution(null,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',current_date,'Consulta final',null,null,null,'finalized',null)$$,'Evolução finalizada pode ser criada');
select throws_ok($$delete from public.evolutions where report='Consulta final'$$,'42501',null,'Cliente não pode apagar evolução finalizada');
select lives_ok($$select public.save_evolution(null,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',current_date,'Consulta em rascunho',null,null,null,'draft',null)$$,'Rascunho pode ser criado');
select results_eq($$select count(*) from public.list_evolutions('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','consulta',null,null,null,null,50)$$,array[1::bigint],'Busca clínica retorna somente evolução finalizada');
select throws_ok($$select public.register_attachment('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','arquivo.pdf','application/pdf',100,'objeto')$$,null,'Vínculo de anexo com evolução alheia é rejeitado');
select throws_ok($$select public.save_patient_with_guardians('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','{"full_name":"Conflito","birth_date":"1990-01-01"}'::jsonb,'[]'::jsonb,999,false)$$,null,'Revisão divergente não sobrescreve paciente');
select results_eq($$select public.get_patient_export_snapshot('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') is null$$,array[true],'Exportação de paciente alheio não produz snapshot');
select throws_ok($$update public.audit_events set action='fake'$$,'42501',null,'Cliente não altera auditoria');
select results_eq($$select count(*) from public.patients where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,array[0::bigint],'Acesso direto ao ID de outra conta não retorna linha');
select lives_ok($$select public.discard_evolution_draft((select id from public.evolutions where report='Consulta em rascunho'))$$,'Rascunho pode ser descartado');
select results_eq($$select count(*) from public.evolutions where report='Consulta em rascunho'$$,array[0::bigint],'Rascunho descartado deixa de existir');
select results_eq($$select count(*) from public.evolutions where status='finalized'$$,array[1::bigint],'Evolução finalizada permanece no histórico');
select isnt_empty($$select 1 from public.audit_events where entity_type='evolution' and current_data->>'status'='finalized'$$,'Finalização gera auditoria na mesma transação');
select * from finish();
rollback;
