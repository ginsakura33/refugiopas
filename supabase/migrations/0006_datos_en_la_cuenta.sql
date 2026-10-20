-- Datos de la persona que hasta ahora vivían solo en su celular: ánimo por día, hábitos propios y
-- entradas del diario (journal_entries ya existía: se le agrega local_id para no duplicar al sincronizar).
-- module_progress y habit_logs ya existían (con sus políticas). Todo con RLS por usuario.

create table if not exists public.animo_dias (
  user_id uuid not null references auth.users (id) on delete cascade,
  fecha date not null,
  animo text not null check (char_length(animo) <= 20),
  intensidad smallint not null check (intensidad between 1 and 10),
  updated_at timestamptz not null default now(),
  primary key (user_id, fecha)
);

create table if not exists public.habitos_propios (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null check (char_length(id) <= 40),
  nombre text not null check (char_length(nombre) between 1 and 40),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.journal_entries add column if not exists local_id text check (char_length(local_id) <= 60);
create unique index if not exists journal_entries_local_id_idx on public.journal_entries (user_id, local_id) where local_id is not null;

alter table public.animo_dias enable row level security;
alter table public.habitos_propios enable row level security;

create policy "animo_dias: ver lo mio" on public.animo_dias for select to authenticated using ((select auth.uid()) = user_id);
create policy "animo_dias: crear lo mio" on public.animo_dias for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "animo_dias: editar lo mio" on public.animo_dias for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "habitos_propios: ver lo mio" on public.habitos_propios for select to authenticated using ((select auth.uid()) = user_id);
create policy "habitos_propios: crear lo mio" on public.habitos_propios for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "habitos_propios: editar lo mio" on public.habitos_propios for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "habitos_propios: borrar lo mio" on public.habitos_propios for delete to authenticated using ((select auth.uid()) = user_id);

