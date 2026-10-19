-- Refugio PAS — Novedades (anuncios de clases, talleres, avisos) y administradores.
-- Aplicada en Supabase el 2026-10-18. Solo el servidor (service role) crea/edita anuncios.
-- Para hacer administrador a alguien: insert into public.admins (user_id) select id from auth.users where lower(email) = 'correo@ejemplo.com';

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
create policy "admins: ver lo mio" on public.admins for select to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.anuncios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 1 and 80),
  mensaje text not null check (char_length(mensaje) between 1 and 600),
  enlace text check (enlace is null or (enlace ~ '^https://' and char_length(enlace) <= 500)),
  boton text check (boton is null or char_length(boton) <= 30),
  audiencia text not null default 'todos' check (audiencia in ('todos', 'anual')),
  fecha_evento timestamptz,
  activo boolean not null default true,
  publicado_at timestamptz not null default now()
);
create index if not exists anuncios_publicado_idx on public.anuncios (publicado_at desc);
alter table public.anuncios enable row level security;
create policy "anuncios: ver los activos que me tocan" on public.anuncios for select to authenticated
  using (
    activo
    and (
      audiencia = 'todos'
      or exists (
        select 1 from public.subscriptions s
        where s.user_id = (select auth.uid()) and s.plan = 'anual'
      )
    )
  );

create table if not exists public.anuncio_lecturas (
  user_id uuid not null references auth.users (id) on delete cascade,
  anuncio_id uuid not null references public.anuncios (id) on delete cascade,
  leido_at timestamptz not null default now(),
  primary key (user_id, anuncio_id)
);
alter table public.anuncio_lecturas enable row level security;
create policy "lecturas: ver lo mio" on public.anuncio_lecturas for select to authenticated using ((select auth.uid()) = user_id);
create policy "lecturas: crear lo mio" on public.anuncio_lecturas for insert to authenticated with check ((select auth.uid()) = user_id);
