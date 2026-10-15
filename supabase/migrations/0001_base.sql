-- Refugio PAS — esquema base (Sesión 6). Se pega completo en Supabase → SQL Editor → Run.
-- Seguridad: RLS activo en TODAS las tablas; cada persona solo ve y escribe lo suyo.
-- `subscriptions` solo la escribe el servidor (webhook de Hotmart con la clave secreta).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  arquetipo text,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  plan text not null check (plan in ('mensual', 'anual')),
  estado text not null check (estado in ('prueba', 'activa', 'cancelada', 'vencida', 'reembolsada')),
  origen text not null default 'hotmart',
  transaccion text unique,
  vigente_hasta timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_email_idx on public.subscriptions (lower(email));

create table if not exists public.habit_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  fecha date not null,
  habito_id text not null,
  hecho boolean not null default true,
  primary key (user_id, fecha, habito_id)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  animo text,
  intensidad smallint check (intensidad between 1 and 10),
  texto text check (char_length(texto) <= 5000),
  created_at timestamptz not null default now()
);
create index if not exists journal_entries_user_id_idx on public.journal_entries (user_id, created_at desc);

create table if not exists public.module_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  modulo_id text not null,
  completado_at timestamptz not null default now(),
  primary key (user_id, modulo_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.habit_logs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.module_progress enable row level security;

create policy "profiles: ver lo mio" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: crear lo mio" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles: editar lo mio" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- subscriptions: solo lectura propia; las escrituras las hace el servidor (service role ignora RLS)
create policy "subscriptions: ver lo mio" on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id);

create policy "habit_logs: ver lo mio" on public.habit_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "habit_logs: crear lo mio" on public.habit_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "habit_logs: editar lo mio" on public.habit_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "habit_logs: borrar lo mio" on public.habit_logs for delete to authenticated using ((select auth.uid()) = user_id);

create policy "journal: ver lo mio" on public.journal_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "journal: crear lo mio" on public.journal_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "journal: editar lo mio" on public.journal_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "journal: borrar lo mio" on public.journal_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy "modulos: ver lo mio" on public.module_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "modulos: crear lo mio" on public.module_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "modulos: borrar lo mio" on public.module_progress for delete to authenticated using ((select auth.uid()) = user_id);

-- Al crearse una cuenta, se crea su perfil vacío automáticamente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
