-- handle_new_user() solo la dispara el trigger al crearse un usuario; nadie debe poder llamarla desde la API pública.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
