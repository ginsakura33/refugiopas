-- Refugio PAS — recordatorios suaves (notificaciones push). RLS: cada persona solo ve y cambia lo suyo.
-- El envío lo hace el servidor (service role) desde /api/cron/recordatorios.

create table if not exists public.recordatorio_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  activo boolean not null default true,
  hora text not null default '20:00' check (hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  zona text not null default 'America/Bogota' check (char_length(zona) <= 64),
  ultimo_envio date,
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  endpoint text primary key check (char_length(endpoint) <= 1000),
  user_id uuid not null references auth.users (id) on delete cascade,
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.recordatorio_prefs enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "prefs: ver lo mio" on public.recordatorio_prefs for select to authenticated using ((select auth.uid()) = user_id);
create policy "prefs: crear lo mio" on public.recordatorio_prefs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "prefs: editar lo mio" on public.recordatorio_prefs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "prefs: borrar lo mio" on public.recordatorio_prefs for delete to authenticated using ((select auth.uid()) = user_id);

create policy "push: ver lo mio" on public.push_subscriptions for select to authenticated using ((select auth.uid()) = user_id);
create policy "push: crear lo mio" on public.push_subscriptions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "push: borrar lo mio" on public.push_subscriptions for delete to authenticated using ((select auth.uid()) = user_id);
