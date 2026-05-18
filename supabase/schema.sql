-- =====================================================
-- We Clínica · Sistema Financeiro · Schema Supabase
-- =====================================================
-- Rode este arquivo no SQL Editor do Supabase (uma vez).
-- Ajuste políticas RLS conforme necessidade.

create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. USUÁRIOS PERMITIDOS (controle de acesso)
-- =====================================================
create table if not exists usuarios_permitidos (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nome text not null,
  role text not null default 'operacional' check (role in ('admin','operacional')),
  ativo boolean not null default true,
  created_at timestamptz default now()
);

-- =====================================================
-- 2. CLIENTES (pacientes)
-- =====================================================
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  responsavel text,
  telefone text,
  email text,
  obs text,
  created_at timestamptz default now()
);

-- =====================================================
-- 3. PRESTADORES (psicólogos e ATs)
-- =====================================================
create table if not exists prestadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('psicologo','at')),
  com numeric not null default 0,
  obs text,
  ativo boolean not null default true,
  created_at timestamptz default now()
);

-- =====================================================
-- 4. PLANO DE CONTAS
-- =====================================================
create table if not exists plano_contas (
  id uuid primary key default gen_random_uuid(),
  cod text not null,
  nome text not null,
  tipo text not null check (tipo in ('receita','despesa')),
  cat text,
  created_at timestamptz default now()
);

-- =====================================================
-- 5. PREMISSAS GLOBAIS
-- =====================================================
create table if not exists premissas (
  chave text primary key,
  valor numeric not null default 0,
  updated_at timestamptz default now()
);

-- =====================================================
-- 6. LANÇAMENTOS
-- =====================================================
create table if not exists lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('receita','despesa')),
  descricao text not null,
  valor numeric not null,
  data date not null,
  data_competencia date,
  data_vencimento date,
  data_pagamento date,
  conta_id uuid references plano_contas(id),
  cliente_id uuid references clientes(id),
  prestador_id uuid references prestadores(id),
  forma_pagamento text,
  status text not null default 'pendente'
    check (status in ('pendente','recebido','pago','cancelado','projecao')),
  horas numeric default 0,
  obs text,
  auto_comissao boolean not null default false,
  ref_lanc_id uuid references lancamentos(id) on delete cascade,
  sexta date,
  conciliado boolean not null default false,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_lancamentos_data on lancamentos(data);
create index if not exists idx_lancamentos_tipo on lancamentos(tipo);
create index if not exists idx_lancamentos_status on lancamentos(status);
create index if not exists idx_lancamentos_prestador on lancamentos(prestador_id);
create index if not exists idx_lancamentos_ref on lancamentos(ref_lanc_id);
create index if not exists idx_lancamentos_sexta on lancamentos(sexta);

-- =====================================================
-- 7. AUDIT LOG
-- =====================================================
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  user_nome text,
  acao text not null,
  entidade text not null,
  detalhes text,
  created_at timestamptz default now()
);

create index if not exists idx_audit_created on audit_log(created_at desc);

-- =====================================================
-- 8. RLS — checa membership em usuarios_permitidos
-- =====================================================
alter table usuarios_permitidos enable row level security;
alter table clientes enable row level security;
alter table prestadores enable row level security;
alter table plano_contas enable row level security;
alter table premissas enable row level security;
alter table lancamentos enable row level security;
alter table audit_log enable row level security;

-- Função helper: usuário atual é permitido e ativo?
create or replace function is_permitido() returns boolean
language sql stable as $$
  select exists (
    select 1 from usuarios_permitidos
    where email = auth.email() and ativo = true
  );
$$;

create or replace function is_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from usuarios_permitidos
    where email = auth.email() and ativo = true and role = 'admin'
  );
$$;

-- usuarios_permitidos: leitura por qualquer autenticado (precisa pra checar self);
-- escrita só admin
drop policy if exists "perm_select" on usuarios_permitidos;
create policy "perm_select" on usuarios_permitidos
  for select using (auth.role() = 'authenticated');

drop policy if exists "perm_admin_write" on usuarios_permitidos;
create policy "perm_admin_write" on usuarios_permitidos
  for insert with check (is_admin());
create policy "perm_admin_update" on usuarios_permitidos
  for update using (is_admin()) with check (is_admin());
create policy "perm_admin_delete" on usuarios_permitidos
  for delete using (is_admin());

-- Demais tabelas: qualquer permitido lê e escreve
do $$
declare t text;
begin
  for t in select unnest(array[
    'clientes','prestadores','plano_contas','premissas','lancamentos','audit_log'
  ]) loop
    execute format('drop policy if exists "perm_all_%s" on %I;', t, t);
    execute format(
      'create policy "perm_all_%s" on %I for all using (is_permitido()) with check (is_permitido());',
      t, t
    );
  end loop;
end $$;

-- =====================================================
-- 9. SEED — plano de contas e premissas padrão
-- =====================================================
insert into plano_contas (cod, nome, tipo, cat) values
  ('1.1', 'Sessão individual', 'receita', 'Atendimento'),
  ('1.2', 'Sessão em grupo', 'receita', 'Atendimento'),
  ('1.3', 'Avaliação diagnóstica', 'receita', 'Atendimento'),
  ('1.4', 'Programa intensivo', 'receita', 'Atendimento'),
  ('1.9', 'Outras receitas', 'receita', 'Outros'),
  ('2.1', 'Aluguel', 'despesa', 'Ocupação'),
  ('2.2', 'Pró-labore', 'despesa', 'Pessoal'),
  ('2.3', 'Comissões prestadores', 'despesa', 'Pessoal'),
  ('2.4', 'Impostos e tributos', 'despesa', 'Fiscal'),
  ('2.5', 'Material clínico', 'despesa', 'Operacional'),
  ('2.6', 'Taxas bancárias/cartão', 'despesa', 'Financeiro'),
  ('2.7', 'Tecnologia e sistemas', 'despesa', 'Tecnologia'),
  ('2.8', 'Marketing', 'despesa', 'Marketing'),
  ('2.9', 'Outros custos', 'despesa', 'Outros')
on conflict do nothing;

insert into premissas (chave, valor) values
  ('imposto', 11.33),
  ('pix', 0),
  ('dinheiro', 0),
  ('transferencia', 0),
  ('debito', 1.5),
  ('credito_vista', 2.5),
  ('credito_par', 3.5),
  ('boleto', 0)
on conflict (chave) do nothing;

-- =====================================================
-- 10. PRIMEIRO ADMIN — substitua pelo email antes de rodar
-- =====================================================
-- insert into usuarios_permitidos (email, nome, role)
-- values ('seu-email@dominio.com', 'Seu Nome', 'admin')
-- on conflict (email) do update set role='admin', ativo=true;
