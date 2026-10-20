-- El índice parcial de 0006 no sirve para "on conflict (user_id, local_id)": se cambia por una restricción
-- única normal (los NULL no chocan entre sí, así que las entradas sin local_id siguen siendo posibles).
drop index if exists public.journal_entries_local_id_idx;
alter table public.journal_entries add constraint journal_entries_user_local_unique unique (user_id, local_id);
