# v1.1 — Benachrichtigungen (Web Push)

Ziel: Wenn Nutzer:innen die App auf dem Home-Bildschirm gespeichert haben, bekommen sie zeitgesteuerte Erinnerungen — auch wenn die App geschlossen ist. Funktioniert auf Android/Desktop sofort, auf iPhone/iPad ab iOS 16.4 nach dem "Zum Home-Bildschirm hinzufügen"-Schritt (den wir schon prompten).

Kein Account nötig — Erinnerungen funktionieren pro Gerät.

## Reminder-Typen (v1.1)

1. **Freitagabend-Nudge** — Fr 18:00: "Liste für morgen fertig?"
2. **Samstag Ladenschluss-Warnung** — Sa, konfigurierbar (Default 15:00): "Noch X Stunden bis Ladenschluss"
3. **Sonntag Plan-Vorschlag** — So 10:00: "Sonntag offen: Orte in deiner Nähe"
4. **Eigene Zeit für Einkauf-Erinnerung** — im Einkauf-Tab: "Erinnere mich am [Wochentag] um [Uhrzeit]"

Alle vier sind einzeln an/aus-schaltbar.

## User-Flow

1. Neuer Bereich **"Benachrichtigungen"** in der Konto-Seite mit einer Karte pro Reminder-Typ.
2. Beim ersten Aktivieren: kurzer erklärender Screen ("Wir schicken dir max. 3 Erinnerungen die Woche. Du kannst jederzeit abbestellen.") → dann Browser-Permission-Prompt.
3. Nach Zustimmung: Service Worker registriert, FCM-Token geholt, im Backend gespeichert mit Timezone + Reminder-Präferenzen.
4. Extra Einstiegspunkt in **Einkauf-Tab**: "🔔 An diese Liste erinnern lassen" mit Wochentag+Uhrzeit-Picker → speichert einen custom Reminder.
5. In Konto: alle aktiven Reminders einsehbar, einzeln deaktivierbar.

## Reihenfolge der Umsetzung

**Phase A — Infrastruktur (kein UI):**
- Firebase Cloud Messaging Projekt einrichten. Der User muss dazu ein Firebase-Projekt anlegen und uns 4 Werte geben (Web-App-Config: apiKey, projectId, messagingSenderId, appId — alle publishable, gehen ins Frontend) + einen VAPID Public Key + einen Server-Key/Service-Account für den Server. Ich erkläre das Schritt-für-Schritt, wenn wir soweit sind.
- `public/firebase-messaging-sw.js` als Push-Service-Worker (separat vom PWA-App-Shell, so wie in der Lovable-Doku vorgesehen).
- Backend-Tabelle `push_subscriptions`: `id`, `user_id` (nullable für Gäste), `device_token` (unique), `timezone`, `endpoint`, `created_at`. RLS + GRANTs wie üblich.
- Backend-Tabelle `reminder_prefs`: `id`, `subscription_id`, `type` (`friday_nudge` / `saturday_warning` / `sunday_plan` / `custom`), `enabled`, `hour_local`, `minute_local`, `weekday` (0–6, nur für custom), `list_id` (optional, für "erinnere mich an DIESE Liste").
- Server-Funktion `registerPushSubscription`: nimmt FCM-Token + Timezone entgegen, upsert in DB. Gäste bekommen anon `user_id = null`, funktioniert per Device-Token.
- Server-Funktion `updateReminderPref`: an/aus + Zeit setzen.

**Phase B — Sender:**
- Server-Route `/api/public/hooks/send-reminders` (Signatur-verifiziert via `apikey`-Header, siehe schedule-jobs-modern). Iteriert reminder_prefs, filtert nach passender lokaler Uhrzeit (jetzt in der Timezone der Subscription), schickt FCM-Push mit vorgefertigtem Titel/Body/Deeplink pro Typ.
- **pg_cron**: läuft alle 15 Minuten (`*/15 * * * *`), ruft die Route. So decken wir alle Zeitzonen und alle Viertelstunden-Slots ab, ohne zu spammen.
- Deduplication: `sent_at` pro (subscription, type, date) gespeichert, damit derselbe User denselben Reminder nicht mehrfach am selben Tag bekommt.

**Phase C — Frontend UI:**
- Neue Datei `src/lib/pushNotifications.ts`: `initFirebase()`, `requestPermission()`, `getToken()`, `saveSubscription()`.
- Neue Karte in `src/routes/account.tsx`: "Benachrichtigungen" mit Toggle pro Reminder-Typ + Uhrzeit-Picker für Samstag-Warnung.
- Erweiterung `src/routes/shopping.tsx`: neuer "🔔 Erinnerung setzen"-Button pro Liste öffnet ein kleines Sheet mit Wochentag+Uhrzeit.
- i18n-Einträge für alle neuen Strings (DE + EN).
- iOS-Hinweis: wenn `!isStandalone && iOS`, zeigen wir vor dem Permission-Prompt einen Extra-Screen "Für Benachrichtigungen musst du die App zuerst zum Home-Bildschirm hinzufügen" mit Link zum bestehenden InstallPrompt.

## Technische Details (dev-relevant)

- FCM statt Web Push direkt: FCM handhabt VAPID, iOS-Zustellung und Token-Refresh sauber. Alternative wäre eine eigene `web-push`-Node-Implementierung, aber die läuft nicht sauber im Cloudflare Worker Runtime — FCM ist HTTP-only und Worker-kompatibel.
- Der Messaging-Service-Worker (`firebase-messaging-sw.js`) ist explizit von der Lovable-PWA-Regel ausgenommen — er läuft in Preview und Production, kein Konflikt mit unserer manifest-only PWA-Strategie.
- FCM Config-Werte (apiKey, projectId, appId, messagingSenderId, VAPID public key) sind **publishable** → gehen als `VITE_FIREBASE_*` env vars ins Frontend.
- FCM Server-Credentials (Service Account JSON) → als Secret gespeichert, nur im Server benutzt.
- `push_subscriptions` erlaubt `user_id NULL` → Gast-Devices werden nur via Token identifiziert. Bei späterem Login mergen wir das Token auf die User-ID.

## Was ich vor dem Build brauche

1. Bestätigung: **iOS-User müssen die App zum Home-Bildschirm hinzufügen, damit Benachrichtigungen dort funktionieren** — wir zeigen das transparent an, aber die Einschränkung selbst können wir nicht umgehen.
2. Ein neues **Firebase-Projekt** (kostenlos, ich schicke dir 3 Screenshots-Level-Anleitung, wenn wir soweit sind). Du gibst mir dann die 5 publishable Config-Werte + 1 Service-Account-JSON.
3. Wenn du willst, kann ich die Beispieltexte für alle 4 Reminder-Typen zusammen mit dir festlegen bevor wir bauen — sie sind kurz, aber prägend für den Ton.

## Was nicht in v1.1 kommt (aber später gut passen würde)

- Rich-Push mit Bild (z.B. Wetter-Icon)
- Ort-basierte Trigger ("Du bist in der Nähe eines Ladens, der bald schließt")
- Wöchentliche Zusammenfassung ("Deine Woche im Überblick")

Diese sparen wir uns für v1.2, wenn v1.1 sich in der Praxis bewährt.
