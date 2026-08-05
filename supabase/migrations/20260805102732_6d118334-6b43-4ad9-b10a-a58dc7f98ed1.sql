-- Lock down all SECURITY DEFINER / trigger functions by default
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guest_verify(uuid, text) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.guest_register_push(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guest_list_prefs(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guest_upsert_standard_pref(uuid, text, reminder_type, boolean, smallint, smallint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guest_upsert_custom_pref(uuid, text, text, smallint, smallint, smallint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guest_delete_pref(uuid, text, uuid) FROM PUBLIC, anon, authenticated;

-- Re-grant only the guest RPCs the app calls (each verifies the per-device secret internally)
GRANT EXECUTE ON FUNCTION public.guest_register_push(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_list_prefs(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_upsert_standard_pref(uuid, text, reminder_type, boolean, smallint, smallint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_upsert_custom_pref(uuid, text, text, smallint, smallint, smallint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_delete_pref(uuid, text, uuid) TO anon, authenticated;