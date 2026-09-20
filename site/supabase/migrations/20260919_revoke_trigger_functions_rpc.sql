-- Les fonctions de trigger ne doivent pas être appelables via l'API (/rest/v1/rpc)
revoke execute on function public.protect_profile_role() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.auto_confirm_email() from public, anon, authenticated;
revoke execute on function public.orders_guard() from public, anon, authenticated;
revoke execute on function public.navettes_guard() from public, anon, authenticated;
