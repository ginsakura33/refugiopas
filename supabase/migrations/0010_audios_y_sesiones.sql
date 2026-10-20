-- AUDIOS DE LA BIBLIOTECA: espacio PRIVADO. Solo se pueden escuchar con un plan vigente (el mismo criterio que
-- el candado de la app: prueba, activa o cancelada con fecha por vencer). Nadie sube desde la app: los sube la
-- dueña con la clave de servicio (que se salta estas reglas), así que no hay política de escritura.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audios', 'audios', false, 52428800, array['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/wav'])
on conflict (id) do update
  set public = false, file_size_limit = 52428800, allowed_mime_types = array['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/wav'];

create policy "audios: escuchar con plan vigente" on storage.objects for select to authenticated
  using (
    bucket_id = 'audios'
    and exists (
      select 1 from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.estado in ('prueba', 'activa', 'cancelada')
        and (s.vigente_hasta is null or s.vigente_hasta > now())
    )
  );

-- REGISTRO DE CÓMO SE SIENTE LA PERSONA ANTES Y DESPUÉS DE CADA AUDIO (escala 1 a 10 de calma).
-- `despues` queda vacío si la persona decidió omitirlo.
create table if not exists public.sesiones_audio (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null check (char_length(id) <= 60),
  audio_id text not null check (char_length(audio_id) <= 60),
  antes smallint not null check (antes between 1 and 10),
  despues smallint check (despues between 1 and 10),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists sesiones_audio_user_fecha_idx on public.sesiones_audio (user_id, created_at desc);

alter table public.sesiones_audio enable row level security;
create policy "sesiones_audio: ver lo mio" on public.sesiones_audio for select to authenticated using ((select auth.uid()) = user_id);
create policy "sesiones_audio: crear lo mio" on public.sesiones_audio for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sesiones_audio: borrar lo mio" on public.sesiones_audio for delete to authenticated using ((select auth.uid()) = user_id);
