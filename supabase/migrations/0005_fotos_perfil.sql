-- Foto de perfil: bucket PRIVADO "avatars". Cada persona solo ve/sube/borra lo de su carpeta
-- (avatars/<su user id>/avatar.jpg). La app la reduce a 256x256 JPEG antes de subirla; el bucket además
-- rechaza todo lo que no sea JPEG o pese más de 256 KB.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 262144, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = 262144, allowed_mime_types = array['image/jpeg'];

create policy "avatars: ver la mia" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: subir la mia" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: cambiar la mia" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: borrar la mia" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
