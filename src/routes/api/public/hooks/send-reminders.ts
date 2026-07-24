// Cron-invoked endpoint that iterates enabled reminder_prefs, matches them
// against the current local time in each subscription's timezone, and sends
// an FCM push via the HTTP v1 API.
//
// Called every 15 minutes by pg_cron with the Supabase anon apikey header.
// The /api/public/* prefix bypasses site auth; we still verify the apikey.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { SignJWT, importPKCS8 } from "jose";

type ReminderType = "friday_nudge" | "saturday_warning" | "sunday_plan" | "custom";

type Row = {
  id: string;
  type: ReminderType;
  enabled: boolean;
  hour_local: number;
  minute_local: number;
  weekday: number | null;
  list_id: string | null;
  last_sent_date: string | null;
  subscription_id: string;
  push_subscriptions: { id: string; device_token: string; timezone: string } | null;
};

const SLOT_MINUTES = 15;

function localParts(tz: string, now: Date): { weekday: number; hour: number; minute: number; ymd: string } {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const wdMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    weekday: wdMap[get("weekday")] ?? 0,
    hour: parseInt(get("hour"), 10),
    minute: parseInt(get("minute"), 10),
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

function matches(row: Row, now: Date): { ok: boolean; ymd: string } | null {
  const sub = row.push_subscriptions;
  if (!sub) return null;
  const parts = localParts(sub.timezone || "Europe/Berlin", now);

  // Fixed weekdays per type; custom uses the row's weekday.
  const expectedWeekday =
    row.type === "friday_nudge"
      ? 5
      : row.type === "saturday_warning"
        ? 6
        : row.type === "sunday_plan"
          ? 0
          : (row.weekday ?? -1);
  if (parts.weekday !== expectedWeekday) return { ok: false, ymd: parts.ymd };

  // Match within the current 15-minute slot.
  const nowMinutes = parts.hour * 60 + parts.minute;
  const targetMinutes = row.hour_local * 60 + row.minute_local;
  const diff = nowMinutes - targetMinutes;
  const ok = diff >= 0 && diff < SLOT_MINUTES;
  return { ok, ymd: parts.ymd };
}

const TEMPLATES: Record<ReminderType, { title: string; body: string; url: string }> = {
  friday_nudge: {
    title: "Freitagabend – Liste fertig?",
    body: "Morgen ist Samstag. Prüf schnell, ob alles auf der Einkaufsliste steht.",
    url: "/shopping",
  },
  saturday_warning: {
    title: "Ladenschluss rückt näher",
    body: "Nur noch wenige Stunden. Was fehlt für Sonntag?",
    url: "/",
  },
  sunday_plan: {
    title: "Sonntag offen: Orte in deiner Nähe",
    body: "Bäcker, Museen, Spätis – jetzt in der App entdecken.",
    url: "/plan",
  },
  custom: {
    title: "Erinnerung: deine Einkaufsliste",
    body: "Zeit, die Liste durchzugehen.",
    url: "/shopping",
  },
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(saJson: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.value;

  const sa = JSON.parse(saJson) as { client_email: string; private_key: string; token_uri: string };
  const key = await importPKCS8(sa.private_key, "RS256");
  const jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience(sa.token_uri)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const body = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: body.access_token, expiresAt: now + body.expires_in };
  return body.access_token;
}

async function sendFcm(
  projectId: string,
  token: string,
  accessToken: string,
  msg: { title: string; body: string; url: string },
): Promise<{ ok: boolean; status: number; error?: string }> {
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: msg.title, body: msg.body },
        data: { url: msg.url },
        webpush: { fcm_options: { link: msg.url } },
      },
    }),
  });
  if (res.ok) return { ok: true, status: res.status };
  return { ok: false, status: res.status, error: await res.text() };
}

export const Route = createFileRoute("/api/public/hooks/send-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const anon = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const apiKey = request.headers.get("apikey");
        if (apiKey !== anon) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        const projectId = "wochenend-retter";
        if (!saJson) {
          return new Response(JSON.stringify({ error: "missing-firebase-credentials" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Admin client to bypass RLS for the scheduled sweep.
        const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data, error } = await admin
          .from("reminder_prefs")
          .select(
            "id, type, enabled, hour_local, minute_local, weekday, list_id, last_sent_date, subscription_id, push_subscriptions!inner(id, device_token, timezone)",
          )
          .eq("enabled", true);
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const rows = (data as unknown as Row[]) ?? [];
        const now = new Date();
        let sent = 0;
        let skipped = 0;
        let failed = 0;

        let accessToken: string | null = null;

        for (const row of rows) {
          const m = matches(row, now);
          if (!m || !m.ok) {
            skipped++;
            continue;
          }
          if (row.last_sent_date === m.ymd) {
            skipped++;
            continue;
          }
          if (!accessToken) accessToken = await getAccessToken(saJson);
          const tpl = TEMPLATES[row.type];
          const result = await sendFcm(
            projectId,
            row.push_subscriptions!.device_token,
            accessToken,
            tpl,
          );
          if (result.ok) {
            sent++;
            await admin.from("reminder_prefs").update({ last_sent_date: m.ymd }).eq("id", row.id);
          } else {
            failed++;
            // 404/UNREGISTERED → drop the dead device token.
            if (result.status === 404 || (result.error && result.error.includes("UNREGISTERED"))) {
              await admin
                .from("push_subscriptions")
                .delete()
                .eq("id", row.push_subscriptions!.id);
            }
          }
        }

        return new Response(JSON.stringify({ sent, skipped, failed, checked: rows.length }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});