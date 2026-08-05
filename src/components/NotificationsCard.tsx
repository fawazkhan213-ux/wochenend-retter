import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import {
  getStoredSubscriptionId,
  loadPrefs,
  registerPush,
  togglePref,
  type ReminderPref,
} from "@/lib/pushNotifications";

type FixedType = "friday_nudge" | "saturday_warning" | "sunday_plan";

const AUTO_TRY_KEY = "sonntag.push.auto_enabled_tried";
const DEFAULT_TIMES: Record<FixedType, { hour: number; minute: number }> = {
  friday_nudge: { hour: 18, minute: 0 },
  saturday_warning: { hour: 15, minute: 0 },
  sunday_plan: { hour: 10, minute: 0 },
};

export function NotificationsCard() {
  const { t, lang } = useI18n();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );
  const [subId, setSubId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<ReminderPref[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoTried = useRef(false);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true);
  const isIOS =
    typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const enableDefaults = useCallback(async (id: string, existing: ReminderPref[]) => {
    const missing = (Object.keys(DEFAULT_TIMES) as FixedType[]).filter(
      (type) => !existing.some((p) => p.type === type && !p.list_id),
    );
    for (const type of missing) {
      await togglePref(id, type, true, DEFAULT_TIMES[type].hour, DEFAULT_TIMES[type].minute);
    }
    return missing.length > 0;
  }, []);

  useEffect(() => {
    const id = getStoredSubscriptionId();
    if (id) {
      setSubId(id);
      loadPrefs(id).then(setPrefs);
      return;
    }
    // Installed as a web app + permission already granted → turn reminders on
    // automatically, once per device.
    if (autoTried.current) return;
    autoTried.current = true;
    if (!isStandalone) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (window.localStorage.getItem(AUTO_TRY_KEY)) return;
    window.localStorage.setItem(AUTO_TRY_KEY, "1");
    (async () => {
      const res = await registerPush();
      if (!res.ok) return;
      setPermission("granted");
      setSubId(res.subscriptionId);
      const p = await loadPrefs(res.subscriptionId);
      const added = await enableDefaults(res.subscriptionId, p);
      setPrefs(added ? await loadPrefs(res.subscriptionId) : p);
    })();
  }, [isStandalone, enableDefaults]);

  async function enable() {
    setBusy(true);
    setError(null);
    const res = await registerPush();
    if (!res.ok) {
      setBusy(false);
      setError(
        res.reason === "denied"
          ? t(
              "Benachrichtigungen wurden blockiert. Aktivier sie in den Browser-Einstellungen.",
              "Notifications were blocked. Enable them in your browser settings.",
            )
          : res.reason === "unsupported"
            ? t("Dein Gerät unterstützt keine Web-Push.", "This device does not support web push.")
            : t("Konnte nicht aktivieren.", "Could not enable."),
      );
      return;
    }
    setPermission("granted");
    setSubId(res.subscriptionId);
    const p = await loadPrefs(res.subscriptionId);
    const added = await enableDefaults(res.subscriptionId, p);
    setPrefs(added ? await loadPrefs(res.subscriptionId) : p);
    setBusy(false);
  }

  // Optimistic: update local state first so the row doesn't flicker or
  // re-layout while the request is in flight.
  async function onToggle(type: FixedType, enabled: boolean, hour?: number, minute?: number) {
    if (!subId) return;
    const h = hour ?? DEFAULT_TIMES[type].hour;
    const m = minute ?? DEFAULT_TIMES[type].minute;
    setPrefs((prev) => {
      const idx = prev.findIndex((p) => p.type === type && !p.list_id);
      if (idx === -1) {
        return [
          ...prev,
          {
            id: `optimistic-${type}`,
            type,
            enabled,
            hour_local: h,
            minute_local: m,
            weekday: null,
            list_id: null,
          },
        ];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], enabled, hour_local: h, minute_local: m };
      return next;
    });
    await togglePref(subId, type, enabled, h, m);
    setPrefs(await loadPrefs(subId));
  }

  const heading = t("Benachrichtigungen", "Notifications");

  if (isIOS && !isStandalone) {
    return (
      <section className="px-5 mb-10">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bell className="size-3.5" /> {heading}
        </h3>
        <div className="bg-amber-50 rounded-2xl ring-1 ring-amber-200 p-4 text-sm text-amber-900">
          {t(
            "Für Benachrichtigungen musst du die App zuerst zum Home-Bildschirm hinzufügen. Öffne dazu das Teilen-Menü in Safari und wähle „Zum Home-Bildschirm“.",
            "To receive notifications you need to add the app to your Home Screen first. Open the Share menu in Safari and choose “Add to Home Screen”.",
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 mb-10">
      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Bell className="size-3.5" /> {heading}
      </h3>
      <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-4 space-y-4">
        {permission !== "granted" || !subId ? (
          <>
            <p className="text-sm text-zinc-600">
              {t(
                "Kurze Erinnerungen zu Ladenschluss und Sonntag – max. 3 pro Woche. Jederzeit abbestellbar.",
                "Short reminders about closing time and Sunday — max 3 per week. Cancel anytime.",
              )}
            </p>
            <button
              onClick={enable}
              disabled={busy || permission === "denied"}
              className="w-full h-11 rounded-xl bg-ink text-canvas text-sm font-medium disabled:opacity-40"
            >
              {busy
                ? t("Aktiviere …", "Enabling …")
                : t("Benachrichtigungen aktivieren", "Enable notifications")}
            </button>
            {error && <p className="text-xs text-rose-600">{error}</p>}
          </>
        ) : (
          <>
            <p className="text-xs text-emerald-700 flex items-center gap-1.5">
              <Check className="size-3.5" />
              {t("Auf diesem Gerät aktiv.", "Active on this device.")}
            </p>
            <ReminderRow
              label={t("Freitagabend-Nudge", "Friday evening nudge")}
              subtitle={t("Fr 18:00 – Liste für morgen fertig?", "Fri 18:00 — list ready for tomorrow?")}
              type="friday_nudge"
              prefs={prefs}
              defaultHour={18}
              defaultMinute={0}
              onToggle={onToggle}
              showTime={false}
            />
            <ReminderRow
              label={t("Samstag Ladenschluss", "Saturday closing warning")}
              subtitle={t("Konfigurierbar – Default 15:00.", "Configurable — default 15:00.")}
              type="saturday_warning"
              prefs={prefs}
              defaultHour={15}
              defaultMinute={0}
              onToggle={onToggle}
              showTime={true}
            />
            <ReminderRow
              label={t("Sonntag Plan-Vorschlag", "Sunday plan suggestion")}
              subtitle={t("So 10:00 – Orte in deiner Nähe.", "Sun 10:00 — spots near you.")}
              type="sunday_plan"
              prefs={prefs}
              defaultHour={10}
              defaultMinute={0}
              onToggle={onToggle}
              showTime={false}
            />
          </>
        )}
      </div>
      {lang === "de" ? null : null}
    </section>
  );
}

function ReminderRow({
  label,
  subtitle,
  type,
  prefs,
  defaultHour,
  defaultMinute,
  onToggle,
  showTime,
}: {
  label: string;
  subtitle: string;
  type: FixedType;
  prefs: ReminderPref[];
  defaultHour: number;
  defaultMinute: number;
  onToggle: (t: FixedType, enabled: boolean, hour?: number, minute?: number) => void;
  showTime: boolean;
}) {
  const pref = prefs.find((p) => p.type === type && !p.list_id);
  const enabled = pref?.enabled ?? false;
  const hour = pref?.hour_local ?? defaultHour;
  const minute = pref?.minute_local ?? defaultMinute;
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-3 border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-zinc-500">{subtitle}</div>
        {showTime && enabled && (
          <input
            type="time"
            value={time}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":").map(Number);
              onToggle(type, true, h, m);
            }}
            className="mt-2 text-xs rounded-md ring-1 ring-black/10 px-2 py-1"
          />
        )}
      </div>
      <button
        onClick={() => onToggle(type, !enabled, hour, minute)}
        className={`h-6 w-11 rounded-full relative transition-colors ${enabled ? "bg-ink" : "bg-zinc-200"}`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-0.5 size-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
      {!enabled && <BellOff className="size-3.5 text-zinc-300" />}
    </div>
  );
}