create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.is_valid_uf(value text) returns boolean
language sql immutable strict set search_path = '' as $$
  select upper(value) = any(array['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'])
$$;
create or replace function private.is_valid_email(value text) returns boolean
language sql immutable strict set search_path = '' as $$
  select value ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
$$;
create or replace function private.is_valid_cpf(value text) returns boolean
language plpgsql immutable strict set search_path = '' as $$
declare total integer := 0; digit integer; expected integer;
begin
  if value !~ '^\d{11}$' or value ~ '^(\d)\1{10}$' then return false; end if;
  for digit in 1..9 loop total := total + substr(value,digit,1)::integer * (11-digit); end loop;
  expected := 11 - (total % 11); if expected >= 10 then expected := 0; end if;
  if expected <> substr(value,10,1)::integer then return false; end if;
  total := 0;
  for digit in 1..10 loop total := total + substr(value,digit,1)::integer * (12-digit); end loop;
  expected := 11 - (total % 11); if expected >= 10 then expected := 0; end if;
  return expected = substr(value,11,1)::integer;
end $$;

create type public.patient_status as enum ('active', 'archived');
create type public.evolution_status as enum ('draft', 'finalized');
create type public.attachment_status as enum ('available', 'removing', 'removed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) >= 3),
  email text not null check (private.is_valid_email(email)),
  crp_number text not null check (crp_number ~ '^\d{1,10}$'),
  crp_state text not null check (private.is_valid_uf(crp_state)),
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  full_name text not null check (length(trim(full_name)) >= 3),
  social_name text, birth_date date not null check (birth_date <= current_date), cpf text,
  gender_pronouns text, phone text, email text, postal_code text, street text, address_number text,
  address_complement text, district text, city text, state text, occupation_school text,
  emergency_name text, emergency_relationship text, emergency_phone text, notes text,
  status public.patient_status not null default 'active', archived_at timestamptz,
  revision bigint not null default 1 check (revision > 0),
  search_text text generated always as (lower(coalesce(full_name,'') || ' ' || coalesce(social_name,'') || ' ' || coalesce(cpf,''))) stored,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint patients_cpf_format check (cpf is null or private.is_valid_cpf(cpf)),
  constraint patients_phone_format check (phone is null or phone ~ '^\d{10,11}$'),
  constraint patients_emergency_phone_format check (emergency_phone is null or emergency_phone ~ '^\d{10,11}$'),
  constraint patients_email_format check (email is null or private.is_valid_email(email)),
  constraint patients_state_format check (state is null or private.is_valid_uf(state)),
  constraint patients_status_archive check ((status = 'active' and archived_at is null) or (status = 'archived' and archived_at is not null))
);
create unique index patients_owner_cpf_unique on public.patients(owner_id, cpf) where cpf is not null;
create unique index patients_id_owner_unique on public.patients(id, owner_id);
create index patients_owner_status_created_idx on public.patients(owner_id, status, created_at desc, id);
create index patients_search_trgm_idx on public.patients using gin(search_text extensions.gin_trgm_ops);

create table public.legal_guardians (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  full_name text not null check (length(trim(full_name)) >= 3), relationship text not null check (length(trim(relationship)) >= 2), phone text not null, email text not null, cpf text,
  revision bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint guardians_phone_format check (phone ~ '^\d{10,11}$'),
  constraint guardians_email_format check (private.is_valid_email(email)),
  constraint guardians_patient_owner_fk foreign key (patient_id,owner_id) references public.patients(id,owner_id) on delete restrict,
  constraint guardians_cpf_format check (cpf is null or private.is_valid_cpf(cpf))
);
create index guardians_owner_idx on public.legal_guardians(owner_id);
create index guardians_patient_idx on public.legal_guardians(patient_id);

create table public.anamneses (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete restrict,
  patient_id uuid not null unique references public.patients(id) on delete restrict, content text not null check (length(trim(content)) > 0),
  author_id uuid not null references public.profiles(id) on delete restrict, revision bigint not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint anamneses_author_owner check (author_id=owner_id),
  constraint anamneses_patient_owner_fk foreign key (patient_id,owner_id) references public.patients(id,owner_id) on delete restrict
);
create index anamneses_owner_idx on public.anamneses(owner_id);
create index anamneses_author_idx on public.anamneses(author_id);

create table public.therapeutic_plans (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete restrict,
  patient_id uuid not null unique references public.patients(id) on delete restrict, content text not null check (length(trim(content)) > 0),
  author_id uuid not null references public.profiles(id) on delete restrict, revision bigint not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint therapeutic_plans_author_owner check (author_id=owner_id),
  constraint therapeutic_plans_patient_owner_fk foreign key (patient_id,owner_id) references public.patients(id,owner_id) on delete restrict
);
create index therapeutic_plans_owner_idx on public.therapeutic_plans(owner_id);
create index therapeutic_plans_author_idx on public.therapeutic_plans(author_id);

create table public.evolutions (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict, attended_on date not null check (attended_on <= current_date),
  report text not null check (length(trim(report)) > 0), intervention text, clinical_response text, next_steps text,
  status public.evolution_status not null default 'draft', author_id uuid not null references public.profiles(id) on delete restrict,
  revision bigint not null default 1, search_vector tsvector generated always as (to_tsvector('portuguese', coalesce(report,'') || ' ' || coalesce(intervention,'') || ' ' || coalesce(clinical_response,'') || ' ' || coalesce(next_steps,''))) stored,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint evolutions_author_owner check (author_id=owner_id),
  constraint evolutions_patient_owner_fk foreign key (patient_id,owner_id) references public.patients(id,owner_id) on delete restrict
);
create unique index evolutions_id_patient_owner_unique on public.evolutions(id,patient_id,owner_id);
create index evolutions_owner_patient_date_idx on public.evolutions(owner_id, patient_id, attended_on desc, created_at desc, id);
create index evolutions_patient_idx on public.evolutions(patient_id);
create index evolutions_author_idx on public.evolutions(author_id);
create index evolutions_search_idx on public.evolutions using gin(search_vector);

create table public.attachments (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict, evolution_id uuid references public.evolutions(id) on delete restrict,
  original_name text not null, mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760), object_key text not null unique,
  status public.attachment_status not null default 'available', author_id uuid not null references public.profiles(id) on delete restrict,
  removed_at timestamptz, revision bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint attachments_author_owner check (author_id=owner_id),
  constraint attachments_patient_owner_fk foreign key (patient_id,owner_id) references public.patients(id,owner_id) on delete restrict,
  constraint attachments_evolution_context_fk foreign key (evolution_id,patient_id,owner_id) references public.evolutions(id,patient_id,owner_id) on delete restrict
);
create index attachments_owner_patient_idx on public.attachments(owner_id, patient_id, status, created_at desc);
create index attachments_evolution_idx on public.attachments(evolution_id) where evolution_id is not null;
create index attachments_author_idx on public.attachments(author_id);

create table public.audit_events (
  id bigint generated always as identity primary key, owner_id uuid not null references public.profiles(id) on delete restrict,
  patient_id uuid references public.patients(id) on delete restrict, entity_type text not null, entity_id uuid not null,
  action text not null, actor_id uuid not null references public.profiles(id) on delete restrict,
  previous_data jsonb, current_data jsonb, created_at timestamptz not null default now(),
  constraint audit_actor_owner check (actor_id=owner_id)
);
create index audit_owner_patient_created_idx on public.audit_events(owner_id, patient_id, created_at desc, id desc);
create index audit_patient_idx on public.audit_events(patient_id) where patient_id is not null;
create index audit_actor_idx on public.audit_events(actor_id);

create or replace function private.touch_revision() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); new.revision = old.revision + 1; return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function private.touch_revision();
create trigger patients_touch before update on public.patients for each row execute function private.touch_revision();
create trigger guardians_touch before update on public.legal_guardians for each row execute function private.touch_revision();
create trigger anamneses_touch before update on public.anamneses for each row execute function private.touch_revision();
create trigger plans_touch before update on public.therapeutic_plans for each row execute function private.touch_revision();
create trigger evolutions_touch before update on public.evolutions for each row execute function private.touch_revision();
create trigger attachments_touch before update on public.attachments for each row execute function private.touch_revision();

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,full_name,email,crp_number,crp_state)
  values(new.id, trim(new.raw_user_meta_data->>'full_name'), new.email, regexp_replace(new.raw_user_meta_data->>'crp_number','\D','','g'), upper(new.raw_user_meta_data->>'crp_state'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function private.audit_change() returns trigger language plpgsql security definer set search_path = '' as $$
declare old_json jsonb; new_json jsonb; owner uuid; patient uuid; entity_id uuid; should_write boolean := true;
begin
  old_json := case when tg_op='INSERT' then null else to_jsonb(old) - array['search_vector'] end;
  new_json := case when tg_op='DELETE' then null else to_jsonb(new) - array['search_vector'] end;
  owner := coalesce((new_json->>'owner_id')::uuid,(old_json->>'owner_id')::uuid);
  entity_id := coalesce((new_json->>'id')::uuid,(old_json->>'id')::uuid);
  patient := case when tg_table_name='patients' then entity_id else coalesce((new_json->>'patient_id')::uuid,(old_json->>'patient_id')::uuid) end;
  if tg_table_name='evolutions' and coalesce(new_json->>'status',old_json->>'status') <> 'finalized' then should_write:=false; end if;
  if tg_table_name='attachments' and coalesce(new_json->>'status','') <> 'removed' then should_write:=false; end if;
  if should_write then insert into public.audit_events(owner_id,patient_id,entity_type,entity_id,action,actor_id,previous_data,current_data) values(owner,patient,case tg_table_name when 'patients' then 'patient' when 'legal_guardians' then 'legal_guardian' when 'anamneses' then 'anamnesis' when 'therapeutic_plans' then 'therapeutic_plan' when 'evolutions' then 'evolution' when 'attachments' then 'attachment' else tg_table_name end,entity_id,lower(tg_op),coalesce((select auth.uid()),owner),old_json,new_json); end if;
  return coalesce(new,old);
end $$;
create trigger audit_patients after insert or update on public.patients for each row execute function private.audit_change();
create trigger audit_guardians after insert or update or delete on public.legal_guardians for each row execute function private.audit_change();
create trigger audit_anamneses after insert or update on public.anamneses for each row execute function private.audit_change();
create trigger audit_plans after insert or update on public.therapeutic_plans for each row execute function private.audit_change();
create trigger audit_evolutions after insert or update on public.evolutions for each row execute function private.audit_change();
create trigger audit_attachments after update on public.attachments for each row execute function private.audit_change();

revoke execute on all functions in schema private from public, anon, authenticated;

alter table public.profiles enable row level security; alter table public.patients enable row level security;
alter table public.legal_guardians enable row level security; alter table public.anamneses enable row level security;
alter table public.therapeutic_plans enable row level security; alter table public.evolutions enable row level security;
alter table public.attachments enable row level security; alter table public.audit_events enable row level security;
create policy profiles_select on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy patients_select on public.patients for select to authenticated using (owner_id=(select auth.uid()));
create policy guardians_select on public.legal_guardians for select to authenticated using (owner_id=(select auth.uid()));
create policy anamneses_select on public.anamneses for select to authenticated using (owner_id=(select auth.uid()));
create policy plans_select on public.therapeutic_plans for select to authenticated using (owner_id=(select auth.uid()));
create policy evolutions_select on public.evolutions for select to authenticated using (owner_id=(select auth.uid()));
create policy attachments_select on public.attachments for select to authenticated using (owner_id=(select auth.uid()));
create policy audit_select on public.audit_events for select to authenticated using (owner_id=(select auth.uid()));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles,public.patients,public.legal_guardians,public.anamneses,public.therapeutic_plans,public.evolutions,public.attachments,public.audit_events to authenticated;

create or replace function public.update_profile(p_full_name text,p_crp_number text,p_crp_state text,p_expected_revision bigint) returns public.profiles language plpgsql security definer set search_path='' as $$
declare result public.profiles;begin if (select auth.uid()) is null then raise exception 'UNAUTHENTICATED';end if;update public.profiles set full_name=trim(p_full_name),crp_number=regexp_replace(p_crp_number,'\D','','g'),crp_state=upper(p_crp_state) where id=(select auth.uid()) and revision=p_expected_revision returning * into result;if result.id is null then raise exception 'VERSION_CONFLICT';end if;return result;end$$;

create or replace function public.save_patient_with_guardians(p_patient_id uuid,p_patient jsonb,p_guardians jsonb,p_expected_revision bigint default null,p_duplicate_override boolean default false) returns public.patients language plpgsql security definer set search_path='' as $$
declare uid uuid:=(select auth.uid());result public.patients;guardian jsonb;duplicate jsonb;begin
  if uid is null then raise exception 'UNAUTHENTICATED';end if;
  if p_patient->>'birth_date'>current_date::text then raise exception 'VALIDATION_ERROR';end if;
  if age((p_patient->>'birth_date')::date)<interval '18 years' and jsonb_array_length(p_guardians)=0 then raise exception 'VALIDATION_ERROR';end if;
  if coalesce(p_patient->>'cpf','')<>'' and exists(select 1 from public.patients where owner_id=uid and cpf=p_patient->>'cpf' and id is distinct from p_patient_id) then raise exception 'DUPLICATE_CPF';end if;
  if not p_duplicate_override then
    select jsonb_build_object('id',id,'full_name',full_name,'social_name',social_name,'birth_date',birth_date)
      into duplicate from public.patients
      where owner_id=uid and lower(full_name)=lower(p_patient->>'full_name')
        and birth_date=(p_patient->>'birth_date')::date and id is distinct from p_patient_id
      order by created_at limit 1;
    if duplicate is not null then raise exception using message='POSSIBLE_DUPLICATE',detail=duplicate::text;end if;
  end if;
  if p_patient_id is null then insert into public.patients(owner_id,full_name,social_name,birth_date,cpf,gender_pronouns,phone,email,postal_code,street,address_number,address_complement,district,city,state,occupation_school,emergency_name,emergency_relationship,emergency_phone,notes) values(uid,trim(p_patient->>'full_name'),nullif(trim(p_patient->>'social_name'),''),(p_patient->>'birth_date')::date,nullif(p_patient->>'cpf',''),nullif(trim(p_patient->>'gender_pronouns'),''),nullif(p_patient->>'phone',''),nullif(trim(p_patient->>'email'),''),nullif(p_patient->>'postal_code',''),nullif(trim(p_patient->>'street'),''),nullif(trim(p_patient->>'address_number'),''),nullif(trim(p_patient->>'address_complement'),''),nullif(trim(p_patient->>'district'),''),nullif(trim(p_patient->>'city'),''),nullif(upper(p_patient->>'state'),''),nullif(trim(p_patient->>'occupation_school'),''),nullif(trim(p_patient->>'emergency_name'),''),nullif(trim(p_patient->>'emergency_relationship'),''),nullif(p_patient->>'emergency_phone',''),nullif(trim(p_patient->>'notes'),'')) returning * into result;
  else update public.patients set full_name=trim(p_patient->>'full_name'),social_name=nullif(trim(p_patient->>'social_name'),''),birth_date=(p_patient->>'birth_date')::date,cpf=nullif(p_patient->>'cpf',''),gender_pronouns=nullif(trim(p_patient->>'gender_pronouns'),''),phone=nullif(p_patient->>'phone',''),email=nullif(trim(p_patient->>'email'),''),postal_code=nullif(p_patient->>'postal_code',''),street=nullif(trim(p_patient->>'street'),''),address_number=nullif(trim(p_patient->>'address_number'),''),address_complement=nullif(trim(p_patient->>'address_complement'),''),district=nullif(trim(p_patient->>'district'),''),city=nullif(trim(p_patient->>'city'),''),state=nullif(upper(p_patient->>'state'),''),occupation_school=nullif(trim(p_patient->>'occupation_school'),''),emergency_name=nullif(trim(p_patient->>'emergency_name'),''),emergency_relationship=nullif(trim(p_patient->>'emergency_relationship'),''),emergency_phone=nullif(p_patient->>'emergency_phone',''),notes=nullif(trim(p_patient->>'notes'),'') where id=p_patient_id and owner_id=uid and revision=p_expected_revision returning * into result;if result.id is null then raise exception 'VERSION_CONFLICT';end if;delete from public.legal_guardians where patient_id=result.id and owner_id=uid;end if;
  for guardian in select * from jsonb_array_elements(p_guardians) loop insert into public.legal_guardians(owner_id,patient_id,full_name,relationship,phone,email,cpf) values(uid,result.id,trim(guardian->>'full_name'),trim(guardian->>'relationship'),guardian->>'phone',trim(guardian->>'email'),nullif(guardian->>'cpf',''));end loop;return result;
end$$;

create or replace function public.set_patient_status(p_patient_id uuid,p_status public.patient_status,p_expected_revision bigint) returns public.patients language plpgsql security definer set search_path='' as $$declare result public.patients;begin update public.patients set status=p_status,archived_at=case when p_status='archived' then now() else null end where id=p_patient_id and owner_id=(select auth.uid()) and revision=p_expected_revision returning * into result;if result.id is null then raise exception 'VERSION_CONFLICT';end if;return result;end$$;

create or replace function public.search_patients(p_status public.patient_status default 'active',p_term text default '',p_cursor timestamptz default null,p_limit integer default 25) returns setof public.patients language sql security definer set search_path='' stable as $$select * from public.patients where owner_id=(select auth.uid()) and status=p_status and (p_cursor is null or created_at<p_cursor) and (trim(p_term)='' or search_text ilike '%'||lower(p_term)||'%' or (regexp_replace(p_term,'\D','','g')<>'' and search_text ilike '%'||regexp_replace(p_term,'\D','','g')||'%')) order by created_at desc,id limit least(greatest(p_limit,1),50)$$;

create or replace function public.save_clinical_document(p_patient_id uuid,p_document_type text,p_content text,p_expected_revision bigint default null) returns jsonb language plpgsql security definer set search_path='' as $$declare uid uuid:=(select auth.uid());result jsonb;begin if not exists(select 1 from public.patients where id=p_patient_id and owner_id=uid) then raise exception 'NOT_FOUND';end if;if length(trim(p_content))=0 then raise exception 'VALIDATION_ERROR';end if;if p_document_type='anamnesis' then insert into public.anamneses(owner_id,patient_id,content,author_id) values(uid,p_patient_id,trim(p_content),uid) on conflict(patient_id) do update set content=excluded.content,author_id=uid where public.anamneses.owner_id=uid and (p_expected_revision is null or public.anamneses.revision=p_expected_revision) returning to_jsonb(public.anamneses.*) into result;elsif p_document_type='therapeutic_plan' then insert into public.therapeutic_plans(owner_id,patient_id,content,author_id) values(uid,p_patient_id,trim(p_content),uid) on conflict(patient_id) do update set content=excluded.content,author_id=uid where public.therapeutic_plans.owner_id=uid and (p_expected_revision is null or public.therapeutic_plans.revision=p_expected_revision) returning to_jsonb(public.therapeutic_plans.*) into result;else raise exception 'VALIDATION_ERROR';end if;if result is null then raise exception 'VERSION_CONFLICT';end if;return result;end$$;

create or replace function public.save_evolution(p_evolution_id uuid,p_patient_id uuid,p_attended_on date,p_report text,p_intervention text,p_clinical_response text,p_next_steps text,p_status public.evolution_status,p_expected_revision bigint default null) returns public.evolutions language plpgsql security definer set search_path='' as $$declare uid uuid:=(select auth.uid());result public.evolutions;begin if length(trim(p_report))=0 or p_attended_on is null then raise exception 'VALIDATION_ERROR';end if;if p_evolution_id is null then if not exists(select 1 from public.patients where id=p_patient_id and owner_id=uid and status='active') then raise exception 'PATIENT_ARCHIVED';end if;insert into public.evolutions(owner_id,patient_id,attended_on,report,intervention,clinical_response,next_steps,status,author_id) values(uid,p_patient_id,p_attended_on,trim(p_report),nullif(trim(p_intervention),''),nullif(trim(p_clinical_response),''),nullif(trim(p_next_steps),''),p_status,uid) returning * into result;else update public.evolutions set attended_on=p_attended_on,report=trim(p_report),intervention=nullif(trim(p_intervention),''),clinical_response=nullif(trim(p_clinical_response),''),next_steps=nullif(trim(p_next_steps),''),status=case when status='finalized' then 'finalized' else p_status end,author_id=uid where id=p_evolution_id and patient_id=p_patient_id and owner_id=uid and revision=p_expected_revision returning * into result;if result.id is null then raise exception 'VERSION_CONFLICT';end if;end if;return result;end$$;
create or replace function public.discard_evolution_draft(p_evolution_id uuid) returns void language plpgsql security definer set search_path='' as $$begin delete from public.evolutions where id=p_evolution_id and owner_id=(select auth.uid()) and status='draft';if not found then raise exception 'NOT_FOUND';end if;end$$;
create or replace function public.list_evolutions(p_patient_id uuid,p_term text default '',p_from date default null,p_to date default null,p_cursor_date date default null,p_cursor_id uuid default null,p_limit integer default 50) returns setof public.evolutions language sql security definer set search_path='' stable as $$select * from public.evolutions where owner_id=(select auth.uid()) and patient_id=p_patient_id and ((trim(p_term)='' and p_from is null and p_to is null) or status='finalized') and (trim(p_term)='' or search_vector@@websearch_to_tsquery('portuguese',p_term)) and (p_from is null or attended_on>=p_from) and (p_to is null or attended_on<=p_to) and (p_cursor_date is null or (attended_on,id)<(p_cursor_date,p_cursor_id)) order by status asc,attended_on desc,created_at desc,id desc limit least(greatest(p_limit,1),100)$$;

create or replace function public.get_patient_export_snapshot(p_patient_id uuid) returns jsonb language sql security definer set search_path='' stable as $$select jsonb_build_object('professional',(select to_jsonb(p)-array['created_at','updated_at','revision'] from public.profiles p where p.id=(select auth.uid())),'patient',(select to_jsonb(pt)-array['search_text','owner_id'] from public.patients pt where pt.id=p_patient_id and pt.owner_id=(select auth.uid())),'guardians',coalesce((select jsonb_agg(to_jsonb(g)-array['owner_id','patient_id']) from public.legal_guardians g where g.patient_id=p_patient_id and g.owner_id=(select auth.uid())),'[]'::jsonb),'anamnesis',(select content from public.anamneses where patient_id=p_patient_id and owner_id=(select auth.uid())),'therapeuticPlan',(select content from public.therapeutic_plans where patient_id=p_patient_id and owner_id=(select auth.uid())),'evolutions',coalesce((select jsonb_agg(to_jsonb(e)-array['owner_id','search_vector'] order by attended_on,created_at,id) from public.evolutions e where e.patient_id=p_patient_id and e.owner_id=(select auth.uid()) and e.status='finalized'),'[]'::jsonb)) where exists(select 1 from public.patients where id=p_patient_id and owner_id=(select auth.uid()))$$;

create or replace function public.register_attachment(p_patient_id uuid,p_evolution_id uuid,p_original_name text,p_mime_type text,p_size_bytes bigint,p_object_key text) returns public.attachments language plpgsql security definer set search_path='' as $$declare uid uuid:=(select auth.uid());result public.attachments;begin if not exists(select 1 from public.patients where id=p_patient_id and owner_id=uid) or (p_evolution_id is not null and not exists(select 1 from public.evolutions where id=p_evolution_id and patient_id=p_patient_id and owner_id=uid)) then raise exception 'NOT_FOUND';end if;insert into public.attachments(owner_id,patient_id,evolution_id,original_name,mime_type,size_bytes,object_key,author_id) values(uid,p_patient_id,p_evolution_id,p_original_name,p_mime_type,p_size_bytes,p_object_key,uid) returning * into result;return result;end$$;
create or replace function public.set_attachment_status(p_attachment_id uuid,p_status public.attachment_status) returns public.attachments language plpgsql security definer set search_path='' as $$declare result public.attachments;begin update public.attachments set status=p_status,removed_at=case when p_status='removed' then now() else null end where id=p_attachment_id and owner_id=(select auth.uid()) returning * into result;if result.id is null then raise exception 'NOT_FOUND';end if;return result;end$$;

revoke execute on all functions in schema public from public,anon;
grant execute on function public.update_profile(text,text,text,bigint),public.save_patient_with_guardians(uuid,jsonb,jsonb,bigint,boolean),public.set_patient_status(uuid,public.patient_status,bigint),public.search_patients(public.patient_status,text,timestamptz,integer),public.save_clinical_document(uuid,text,text,bigint),public.save_evolution(uuid,uuid,date,text,text,text,text,public.evolution_status,bigint),public.discard_evolution_draft(uuid),public.list_evolutions(uuid,text,date,date,date,uuid,integer),public.get_patient_export_snapshot(uuid),public.register_attachment(uuid,uuid,text,text,bigint,text),public.set_attachment_status(uuid,public.attachment_status) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('clinical-attachments','clinical-attachments',false,10485760,array['application/pdf','image/jpeg','image/png']) on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
create policy storage_owner_select on storage.objects for select to authenticated using(bucket_id='clinical-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy storage_owner_insert on storage.objects for insert to authenticated with check(bucket_id='clinical-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy storage_owner_delete on storage.objects for delete to authenticated using(bucket_id='clinical-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text);
