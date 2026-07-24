
-- Push subscription per device. Guests supported via user_id NULL.
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO anon;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Guests and users can manage their own row by knowing the device_token
-- (the token itself is a device-scoped secret returned by FCM). Signed-in
-- users additionally see rows linked to their account.
CREATE POLICY "own subscription via user_id"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anon insert: allow creating a new subscription for a device.
CREATE POLICY "anon can insert subscription"
  ON public.push_subscriptions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Reminder preferences per subscription.
CREATE TYPE public.reminder_type AS ENUM (
  'friday_nudge',
  'saturday_warning',
  'sunday_plan',
  'custom'
);

CREATE TABLE public.reminder_prefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  type public.reminder_type NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  hour_local SMALLINT NOT NULL DEFAULT 15,   -- 0..23
  minute_local SMALLINT NOT NULL DEFAULT 0,  -- 0..59
  weekday SMALLINT,                          -- 0..6 (0=Sun) for 'custom'; NULL for fixed types
  list_id TEXT,                              -- optional client-side list reference
  last_sent_date DATE,                       -- dedup guard
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reminder_prefs_sub_idx ON public.reminder_prefs(subscription_id);
CREATE INDEX reminder_prefs_enabled_idx ON public.reminder_prefs(enabled) WHERE enabled = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_prefs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_prefs TO anon;
GRANT ALL ON public.reminder_prefs TO service_role;

ALTER TABLE public.reminder_prefs ENABLE ROW LEVEL SECURITY;

-- Users can manage prefs tied to their own subscriptions.
CREATE POLICY "own prefs via subscription owner"
  ON public.reminder_prefs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.push_subscriptions s
      WHERE s.id = reminder_prefs.subscription_id
        AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.push_subscriptions s
      WHERE s.id = reminder_prefs.subscription_id
        AND s.user_id = auth.uid()
    )
  );

-- Anon insert: allow attaching prefs to a guest (user_id NULL) subscription.
CREATE POLICY "anon can manage guest prefs"
  ON public.reminder_prefs FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.push_subscriptions s
      WHERE s.id = reminder_prefs.subscription_id
        AND s.user_id IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.push_subscriptions s
      WHERE s.id = reminder_prefs.subscription_id
        AND s.user_id IS NULL
    )
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER push_subscriptions_touch
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TRIGGER reminder_prefs_touch
  BEFORE UPDATE ON public.reminder_prefs
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
