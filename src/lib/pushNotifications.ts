// Browser-only helpers to initialize Firebase Cloud Messaging, request
// notification permission, and register a device subscription with our backend.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, isSupported, type Messaging } from "firebase/messaging";

import { supabase } from "@/integrations/supabase/client";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_PUBLIC_KEY as string;

const SUB_ID_KEY = "sonntag.push.subscription_id";
const DEVICE_SECRET_KEY = "sonntag.push.device_secret";

function getOrCreateDeviceSecret(): string {
  if (typeof window === "undefined") return "";
  let s = window.localStorage.getItem(DEVICE_SECRET_KEY);
  if (!s) {
    const buf = new Uint8Array(32);
    crypto.getRandomValues(buf);
    s = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
    window.localStorage.setItem(DEVICE_SECRET_KEY, s);
  }
  return s;
}

function getDeviceSecret(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEVICE_SECRET_KEY);
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export async function ensureMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (!(await isSupported().catch(() => false))) return null;
  if (!app) app = getApps()[0] ?? initializeApp(config);
  if (!messaging) messaging = getMessaging(app);
  return messaging;
}

export async function registerPush(): Promise<
  { ok: true; token: string; subscriptionId: string } | { ok: false; reason: string }
> {
  if (typeof window === "undefined") return { ok: false, reason: "not-browser" };
  if (!("Notification" in window) || !("serviceWorker" in navigator))
    return { ok: false, reason: "unsupported" };

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, reason: "denied" };

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const m = await ensureMessaging();
  if (!m) return { ok: false, reason: "unsupported" };

  const token = await getToken(m, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) return { ok: false, reason: "no-token" };

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Berlin";
  const userAgent = navigator.userAgent;
  const { data: sess } = await supabase.auth.getSession();
  const userId = sess.session?.user.id ?? null;

  let subscriptionId: string;
  if (userId) {
    // Authenticated flow: direct table access, RLS enforces owner scope.
    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert(
        { device_token: token, timezone, user_agent: userAgent, user_id: userId },
        { onConflict: "device_token" },
      )
      .select("id")
      .single();
    if (error || !data) return { ok: false, reason: error?.message ?? "db" };
    subscriptionId = data.id;
  } else {
    // Guest flow: server-side RPC verifies a per-device secret.
    const secret = getOrCreateDeviceSecret();
    const { data, error } = await supabase.rpc("guest_register_push", {
      _device_token: token,
      _timezone: timezone,
      _user_agent: userAgent,
      _device_secret: secret,
    });
    if (error || !data) return { ok: false, reason: error?.message ?? "db" };
    subscriptionId = data as string;
  }
  window.localStorage.setItem(SUB_ID_KEY, subscriptionId);
  return { ok: true, token, subscriptionId };
}

export function getStoredSubscriptionId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SUB_ID_KEY);
}

export type ReminderType = "friday_nudge" | "saturday_warning" | "sunday_plan" | "custom";

export type ReminderPref = {
  id: string;
  type: ReminderType;
  enabled: boolean;
  hour_local: number;
  minute_local: number;
  weekday: number | null;
  list_id: string | null;
};

const DEFAULTS: Record<Exclude<ReminderType, "custom">, { hour: number; minute: number }> = {
  friday_nudge: { hour: 18, minute: 0 },
  saturday_warning: { hour: 15, minute: 0 },
  sunday_plan: { hour: 10, minute: 0 },
};

export async function loadPrefs(subscriptionId: string): Promise<ReminderPref[]> {
  const { data: sess } = await supabase.auth.getSession();
  if (sess.session?.user) {
    const { data } = await supabase
      .from("reminder_prefs")
      .select("id, type, enabled, hour_local, minute_local, weekday, list_id")
      .eq("subscription_id", subscriptionId);
    return (data as ReminderPref[] | null) ?? [];
  }
  const secret = getDeviceSecret();
  if (!secret) return [];
  const { data } = await supabase.rpc("guest_list_prefs", {
    _subscription_id: subscriptionId,
    _device_secret: secret,
  });
  return ((data as ReminderPref[] | null) ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    enabled: r.enabled,
    hour_local: r.hour_local,
    minute_local: r.minute_local,
    weekday: r.weekday,
    list_id: r.list_id,
  }));
}

export async function togglePref(
  subscriptionId: string,
  type: Exclude<ReminderType, "custom">,
  enabled: boolean,
  hour?: number,
  minute?: number,
): Promise<void> {
  const h = hour ?? DEFAULTS[type].hour;
  const m = minute ?? DEFAULTS[type].minute;
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session?.user) {
    const secret = getDeviceSecret();
    if (!secret) return;
    await supabase.rpc("guest_upsert_standard_pref", {
      _subscription_id: subscriptionId,
      _device_secret: secret,
      _type: type,
      _enabled: enabled,
      _hour: h,
      _minute: m,
    });
    return;
  }
  const existing = await supabase
    .from("reminder_prefs")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .eq("type", type)
    .is("list_id", null)
    .maybeSingle();

  if (existing.data?.id) {
    await supabase
      .from("reminder_prefs")
      .update({ enabled, hour_local: h, minute_local: m })
      .eq("id", existing.data.id);
  } else {
    await supabase
      .from("reminder_prefs")
      .insert({ subscription_id: subscriptionId, type, enabled, hour_local: h, minute_local: m });
  }
}

export async function upsertCustom(
  subscriptionId: string,
  listId: string,
  weekday: number,
  hour: number,
  minute: number,
): Promise<void> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session?.user) {
    const secret = getDeviceSecret();
    if (!secret) return;
    await supabase.rpc("guest_upsert_custom_pref", {
      _subscription_id: subscriptionId,
      _device_secret: secret,
      _list_id: listId,
      _weekday: weekday,
      _hour: hour,
      _minute: minute,
    });
    return;
  }
  const existing = await supabase
    .from("reminder_prefs")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .eq("type", "custom")
    .eq("list_id", listId)
    .maybeSingle();

  if (existing.data?.id) {
    await supabase
      .from("reminder_prefs")
      .update({ enabled: true, weekday, hour_local: hour, minute_local: minute })
      .eq("id", existing.data.id);
  } else {
    await supabase.from("reminder_prefs").insert({
      subscription_id: subscriptionId,
      type: "custom",
      list_id: listId,
      weekday,
      hour_local: hour,
      minute_local: minute,
      enabled: true,
    });
  }
}

export async function deleteCustom(prefId: string): Promise<void> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session?.user) {
    const secret = getDeviceSecret();
    const subId = getStoredSubscriptionId();
    if (!secret || !subId) return;
    await supabase.rpc("guest_delete_pref", {
      _subscription_id: subId,
      _device_secret: secret,
      _pref_id: prefId,
    });
    return;
  }
  await supabase.from("reminder_prefs").delete().eq("id", prefId);
}