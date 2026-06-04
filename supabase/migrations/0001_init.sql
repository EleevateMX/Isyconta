-- ============================================================================
-- Isyconta · Migración v1 (init)
-- Portal cliente + avisos + seguimiento fiscal + mensajería interna.
-- Idempotente: usa IF NOT EXISTS / CREATE OR REPLACE.
-- Aplicar en Supabase Studio → SQL → Run.
-- ============================================================================

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type rol_usuario as enum ('CLIENTE', 'CONTADOR', 'ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_cuenta as enum ('PENDIENTE', 'APROBADO', 'SUSPENDIDO');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_obligacion as enum ('PENDIENTE', 'EN_PROCESO', 'PRESENTADA', 'PAGADA', 'VENCIDA');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_conversacion as enum ('ABIERTA', 'RESPONDIDA', 'CERRADA');
exception when duplicate_object then null; end $$;

-- ── Empresas (cada cliente = uno o más RFC) ──────────────────────────────────
create table if not exists empresas (
  id            uuid primary key default gen_random_uuid(),
  razon_social  text not null,
  rfc           text,
  regimen       text,
  contacto      text,
  telefono      text,
  email         text,
  notas         text,
  activo        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── Perfiles (1:1 con auth.users) ────────────────────────────────────────────
create table if not exists perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  nombre      text not null default '',
  telefono    text,
  rol         rol_usuario not null default 'CLIENTE',
  estado      estado_cuenta not null default 'PENDIENTE',
  empresa_id  uuid references empresas(id) on delete set null,
  notas       text,
  created_at  timestamptz not null default now()
);

-- ── Avisos (broadcast / por empresa / por usuario) ───────────────────────────
create table if not exists avisos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  cuerpo      text not null,
  prioridad   text not null default 'NORMAL', -- NORMAL | IMPORTANTE | URGENTE
  autor_id    uuid references perfiles(id) on delete set null,
  empresa_id  uuid references empresas(id) on delete cascade,  -- null = broadcast
  usuario_id  uuid references perfiles(id) on delete cascade,  -- null = no dirigido a 1
  publicado   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists avisos_lecturas (
  aviso_id    uuid not null references avisos(id) on delete cascade,
  usuario_id  uuid not null references perfiles(id) on delete cascade,
  leido_at    timestamptz not null default now(),
  primary key (aviso_id, usuario_id)
);

-- ── Seguimiento fiscal (sin facturar; solo dar seguimiento) ──────────────────
create table if not exists obligaciones_fiscales (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references empresas(id) on delete cascade,
  tipo        text not null,            -- IVA, ISR, DIOT, Nómina, Anual, etc.
  periodo     text not null,            -- '2026-05', '2026', '2026-Q2'...
  fecha_limite date,
  estado      estado_obligacion not null default 'PENDIENTE',
  monto       numeric(14,2),
  notas       text,
  actualizado_por uuid references perfiles(id) on delete set null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists idx_obligaciones_empresa on obligaciones_fiscales(empresa_id);
create index if not exists idx_obligaciones_limite on obligaciones_fiscales(fecha_limite);

-- ── Documentos (archivo CFDI, constancias, reportes) ─────────────────────────
create table if not exists documentos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references empresas(id) on delete cascade,
  tipo        text not null default 'OTRO', -- CFDI | CONSTANCIA | REPORTE | OTRO
  nombre      text not null,
  storage_path text not null,
  subido_por  uuid references perfiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── Mensajería interna (reemplazo de WhatsApp) ───────────────────────────────
create table if not exists conversaciones (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references empresas(id) on delete cascade,
  asunto      text not null,
  estado      estado_conversacion not null default 'ABIERTA',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists mensajes (
  id              uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references conversaciones(id) on delete cascade,
  autor_id        uuid references perfiles(id) on delete set null,
  cuerpo          text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_mensajes_conv on mensajes(conversacion_id, created_at);

-- ── Push notifications ───────────────────────────────────────────────────────
create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references perfiles(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- Helpers (SECURITY DEFINER para evitar recursión en RLS)
-- ============================================================================
create or replace function es_staff()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from perfiles
    where id = auth.uid()
      and rol in ('CONTADOR','ADMIN')
      and estado = 'APROBADO'
  );
$$;

create or replace function mi_empresa_id()
returns uuid language sql security definer stable set search_path = public as $$
  select empresa_id from perfiles where id = auth.uid();
$$;

create or replace function cuenta_aprobada()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and estado = 'APROBADO');
$$;

-- ============================================================================
-- Trigger: crear perfil automáticamente al registrarse (estado PENDIENTE)
-- ============================================================================
create or replace function _tg_nuevo_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into perfiles (id, email, nombre, rol, estado)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    'CLIENTE',
    'PENDIENTE'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function _tg_nuevo_perfil();

-- ============================================================================
-- RLS
-- ============================================================================
alter table empresas               enable row level security;
alter table perfiles               enable row level security;
alter table avisos                 enable row level security;
alter table avisos_lecturas        enable row level security;
alter table obligaciones_fiscales  enable row level security;
alter table documentos             enable row level security;
alter table conversaciones         enable row level security;
alter table mensajes               enable row level security;
alter table push_subscriptions     enable row level security;

-- perfiles: cada quien ve el suyo; staff ve todos
drop policy if exists perfiles_self on perfiles;
create policy perfiles_self on perfiles for select
  using (id = auth.uid() or es_staff());
drop policy if exists perfiles_update_self on perfiles;
create policy perfiles_update_self on perfiles for update
  using (id = auth.uid() or es_staff());
drop policy if exists perfiles_staff_all on perfiles;
create policy perfiles_staff_all on perfiles for all
  using (es_staff()) with check (es_staff());

-- empresas: cliente ve la suya; staff todo
drop policy if exists empresas_select on empresas;
create policy empresas_select on empresas for select
  using (es_staff() or id = mi_empresa_id());
drop policy if exists empresas_staff_write on empresas;
create policy empresas_staff_write on empresas for all
  using (es_staff()) with check (es_staff());

-- avisos: visibles si broadcast, o de mi empresa, o dirigidos a mí; staff todo
drop policy if exists avisos_select on avisos;
create policy avisos_select on avisos for select
  using (
    es_staff()
    or (publicado and (
      (empresa_id is null and usuario_id is null)
      or empresa_id = mi_empresa_id()
      or usuario_id = auth.uid()
    ))
  );
drop policy if exists avisos_staff_write on avisos;
create policy avisos_staff_write on avisos for all
  using (es_staff()) with check (es_staff());

-- lecturas de avisos: cada quien las suyas
drop policy if exists lecturas_self on avisos_lecturas;
create policy lecturas_self on avisos_lecturas for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- obligaciones: cliente lee las de su empresa; staff escribe todo
drop policy if exists oblig_select on obligaciones_fiscales;
create policy oblig_select on obligaciones_fiscales for select
  using (es_staff() or empresa_id = mi_empresa_id());
drop policy if exists oblig_staff_write on obligaciones_fiscales;
create policy oblig_staff_write on obligaciones_fiscales for all
  using (es_staff()) with check (es_staff());

-- documentos: cliente lee los de su empresa; staff todo
drop policy if exists docs_select on documentos;
create policy docs_select on documentos for select
  using (es_staff() or empresa_id = mi_empresa_id());
drop policy if exists docs_staff_write on documentos;
create policy docs_staff_write on documentos for all
  using (es_staff()) with check (es_staff());

-- conversaciones: cliente las de su empresa; staff todo
drop policy if exists conv_select on conversaciones;
create policy conv_select on conversaciones for select
  using (es_staff() or empresa_id = mi_empresa_id());
drop policy if exists conv_insert on conversaciones;
create policy conv_insert on conversaciones for insert
  with check (es_staff() or empresa_id = mi_empresa_id());
drop policy if exists conv_update on conversaciones;
create policy conv_update on conversaciones for update
  using (es_staff() or empresa_id = mi_empresa_id());

-- mensajes: visibles/insertables si puedo ver la conversación
drop policy if exists msg_select on mensajes;
create policy msg_select on mensajes for select
  using (exists (
    select 1 from conversaciones c
    where c.id = mensajes.conversacion_id
      and (es_staff() or c.empresa_id = mi_empresa_id())
  ));
drop policy if exists msg_insert on mensajes;
create policy msg_insert on mensajes for insert
  with check (
    autor_id = auth.uid()
    and exists (
      select 1 from conversaciones c
      where c.id = mensajes.conversacion_id
        and (es_staff() or c.empresa_id = mi_empresa_id())
    )
  );

-- push: cada quien las suyas
drop policy if exists push_self on push_subscriptions;
create policy push_self on push_subscriptions for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- ============================================================================
notify pgrst, 'reload schema';
