
-- 1. Add per-device secret column
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS device_secret text;

-- 2. Remove broad anon access; keep authenticated-owner policies as-is
DROP POLICY IF EXISTS "anon can insert subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "anon can manage guest prefs" ON public.reminder_prefs;

-- Revoke direct anon table access (authenticated owner policies still apply)
REVOKE ALL ON public.push_subscriptions FROM anon;
REVOKE ALL ON public.reminder_prefs FROM anon;

-- 3. SECURITY DEFINER RPCs for guest flows (verify device_secret each call)

CREATE OR REPLACE FUNCTION public.guest_register_push(
  _device_token text,
  _timezone text,
  _user_agent text,
  _device_secret text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_existing_secret text;
  v_existing_user uuid;
BEGIN
  IF _device_secret IS NULL OR length(_device_secret) < 20 THEN
    RAISE EXCEPTION 'invalid device secret';
  END IF;

  SELECT id, device_secret, user_id
    INTO v_id, v_existing_secret, v_existing_user
  FROM public.push_subscriptions
  WHERE device_token = _device_token;

  IF v_id IS NULL THEN
    INSERT INTO public.push_subscriptions (device_token, timezone, user_agent, user_id, device_secret)
    VALUES (_device_token, COALESCE(_timezone, 'Europe/Berlin'), _user_agent, NULL, _device_secret)
    RETURNING id INTO v_id;
    RETURN v_id;
  END IF;

  -- Only allow update if caller proves ownership via matching secret,
  -- or if the existing row is an unclaimed guest with no secret yet.
  IF v_existing_user IS NOT NULL THEN
    RAISE EXCEPTION 'subscription owned by an account';
  END IF;
  IF v_existing_secret IS NOT NULL AND v_existing_secret <> _device_secret THEN
    RAISE EXCEPTION 'device secret mismatch';
  END IF;

  UPDATE public.push_subscriptions
     SET timezone = COALESCE(_timezone, timezone),
         user_agent = COALESCE(_user_agent, user_agent),
         device_secret = _device_secret,
         updated_at = now()
   WHERE id = v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.guest_verify(_subscription_id uuid, _device_secret text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.push_subscriptions
    WHERE id = _subscription_id
      AND user_id IS NULL
      AND device_secret IS NOT NULL
      AND device_secret = _device_secret
  );
$$;

CREATE OR REPLACE FUNCTION public.guest_list_prefs(_subscription_id uuid, _device_secret text)
RETURNS SETOF public.reminder_prefs
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.guest_verify(_subscription_id, _device_secret) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  RETURN QUERY SELECT * FROM public.reminder_prefs WHERE subscription_id = _subscription_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.guest_upsert_standard_pref(
  _subscription_id uuid,
  _device_secret text,
  _type reminder_type,
  _enabled boolean,
  _hour smallint,
  _minute smallint
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.guest_verify(_subscription_id, _device_secret) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT id INTO v_id FROM public.reminder_prefs
   WHERE subscription_id = _subscription_id AND type = _type AND list_id IS NULL
   LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.reminder_prefs (subscription_id, type, enabled, hour_local, minute_local)
    VALUES (_subscription_id, _type, _enabled, _hour, _minute)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.reminder_prefs
       SET enabled = _enabled, hour_local = _hour, minute_local = _minute, updated_at = now()
     WHERE id = v_id;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.guest_upsert_custom_pref(
  _subscription_id uuid,
  _device_secret text,
  _list_id text,
  _weekday smallint,
  _hour smallint,
  _minute smallint
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.guest_verify(_subscription_id, _device_secret) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT id INTO v_id FROM public.reminder_prefs
   WHERE subscription_id = _subscription_id AND type = 'custom' AND list_id = _list_id
   LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.reminder_prefs (subscription_id, type, list_id, weekday, hour_local, minute_local, enabled)
    VALUES (_subscription_id, 'custom', _list_id, _weekday, _hour, _minute, true)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.reminder_prefs
       SET enabled = true, weekday = _weekday, hour_local = _hour, minute_local = _minute, updated_at = now()
     WHERE id = v_id;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.guest_delete_pref(
  _subscription_id uuid,
  _device_secret text,
  _pref_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.guest_verify(_subscription_id, _device_secret) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  DELETE FROM public.reminder_prefs WHERE id = _pref_id AND subscription_id = _subscription_id;
END;
$$;

REVOKE ALL ON FUNCTION public.guest_register_push(text, text, text, text) FROM public;
REVOKE ALL ON FUNCTION public.guest_verify(uuid, text) FROM public;
REVOKE ALL ON FUNCTION public.guest_list_prefs(uuid, text) FROM public;
REVOKE ALL ON FUNCTION public.guest_upsert_standard_pref(uuid, text, reminder_type, boolean, smallint, smallint) FROM public;
REVOKE ALL ON FUNCTION public.guest_upsert_custom_pref(uuid, text, text, smallint, smallint, smallint) FROM public;
REVOKE ALL ON FUNCTION public.guest_delete_pref(uuid, text, uuid) FROM public;

GRANT EXECUTE ON FUNCTION public.guest_register_push(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_list_prefs(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_upsert_standard_pref(uuid, text, reminder_type, boolean, smallint, smallint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_upsert_custom_pref(uuid, text, text, smallint, smallint, smallint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_delete_pref(uuid, text, uuid) TO anon, authenticated;
