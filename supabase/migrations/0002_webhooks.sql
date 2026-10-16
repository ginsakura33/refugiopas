-- Refugio PAS — registro de avisos de Hotmart ya procesados (idempotencia: Hotmart REENVÍA eventos).
-- Solo el servidor (service role) lo toca: RLS activo y SIN políticas = nadie más puede leerlo.
create table if not exists public.webhook_events (
  id text primary key,
  evento text not null,
  recibido_at timestamptz not null default now()
);
alter table public.webhook_events enable row level security;

-- Una sola fila de suscripción por persona (cada aviso de Hotmart la actualiza).
create unique index if not exists subscriptions_user_unique on public.subscriptions (user_id);
