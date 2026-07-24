import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Check,
  LogOut,
  RotateCcw,
  Sparkles,
  Trash2,
  UserCircle2,
  X,
  MessageCircleHeart,
  Shield,
  Lock,
  FileText,
  ChevronDown,
  Share2,
  Languages,
} from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { NotificationsCard } from "@/components/NotificationsCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  listDeletedLists,
  removeDeletedList,
  saveDeletedList,
  type DeletedListSnapshot,
} from "@/lib/deleted-lists.functions";
import type { ShoppingList } from "@/lib/shopping-lists";
import { useI18n, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Konto — Sonntagsruhe Planner" },
      {
        name: "description",
        content:
          "Konto verwalten, gelöschte Listen der letzten 30 Tage wiederherstellen und Favoriten sichern.",
      },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, hydrated } = useAuth();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <header className="px-5 pt-8 pb-6">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
          {t("Konto", "Account")}
        </p>
        <h1 className="text-2xl font-medium tracking-tight">
          {user
            ? t("Dein Konto.", "Your account.")
            : t("Mehr aus dem Sonntag holen.", "Get more out of Sunday.")}
        </h1>
      </header>

      {!hydrated ? (
        <section className="px-5">
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-sm text-zinc-500">
            {t("Lade …", "Loading …")}
          </div>
        </section>
      ) : user ? (
        <SignedIn email={user.email ?? t("Angemeldet", "Signed in")} />
      ) : (
        <SignedOut />
      )}

      <FeedbackCard />
      <ShareAppCard />
      <LanguageCard />
      <NotificationsCard />
      <PrivacySecurityCard />

      <BottomNav />
    </div>
  );
}

const LANG_LABELS: Record<Lang, { name: string; flag: string; selected: string }> = {
  de: { name: "Deutsch", flag: "🇩🇪", selected: "Ausgewählt" },
  en: { name: "English", flag: "🇬🇧", selected: "Selected" },
};

function LanguageCard() {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useI18n();

  const heading = lang === "de" ? "Sprache" : "Language";
  const subtitle =
    lang === "de"
      ? "Wähle die Sprache der App."
      : "Choose the app language.";
  const currentLabel = LANG_LABELS[lang];

  return (
    <section className="px-5 mb-10">
      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Languages className="size-3.5" /> {heading}
      </h3>
      <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
        >
          <div className="size-8 rounded-lg bg-zinc-50 flex items-center justify-center ring-1 ring-black/5 text-base">
            {currentLabel.flag}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{currentLabel.name}</div>
            <div className="text-[11px] text-zinc-500">{subtitle}</div>
          </div>
          <ChevronDown
            className={`size-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <ul className="border-t border-zinc-100 divide-y divide-zinc-100 animate-fade-in">
            {(Object.keys(LANG_LABELS) as Lang[]).map((code) => {
              const info = LANG_LABELS[code];
              const isActive = code === lang;
              return (
                <li key={code}>
                  <button
                    onClick={() => {
                      setLang(code);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50"
                  >
                    <span className="text-xl leading-none">{info.flag}</span>
                    <span className="flex-1 text-sm font-medium">
                      {info.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-accent-yellow text-ink">
                        {info.selected}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="text-[10px] text-zinc-400 mt-2 px-1">
        {lang === "de"
          ? "Weitere Sprachen folgen bald."
          : "More languages coming soon."}
      </p>
    </section>
  );
}

type PolicySection = "privacy" | "security" | "imprint";

function PrivacySecurityCard() {
  const [open, setOpen] = useState<PolicySection | null>(null);
  const { t } = useI18n();
  const toggle = (s: PolicySection) => setOpen((cur) => (cur === s ? null : s));

  const items: {
    id: PolicySection;
    label: string;
    Icon: typeof Shield;
    body: React.ReactNode;
  }[] = [
    {
      id: "privacy",
      label: t("Datenschutz", "Privacy"),
      Icon: Shield,
      body: (
        <>
          <p>
            {t(
              "Wochenend-Retter speichert deine Einkaufslisten, Favoriten und Einstellungen zuerst lokal auf deinem Gerät. Nur wenn du ein Konto anlegst, werden gelöschte Listen 30 Tage lang serverseitig aufbewahrt, damit du sie wiederherstellen kannst.",
              "Wochenend-Retter first stores your lists, favourites and settings locally on your device. Only if you create an account are deleted lists kept for 30 days on our servers so you can restore them.",
            )}
          </p>
          <p>
            {t(
              "Für Orte in deiner Nähe fragen wir – nur mit deiner Zustimmung – deinen Standort ab und schicken die Koordinaten an Google Maps. Wetterdaten kommen von Open-Meteo. Es gibt kein Tracking, keine Werbung, keine Weitergabe an Dritte.",
              "For nearby places we ask — only with your consent — for your location and send the coordinates to Google Maps. Weather comes from Open-Meteo. No tracking, no ads, no sharing with third parties.",
            )}
          </p>
        </>
      ),
    },
    {
      id: "security",
      label: t("Sicherheit", "Security"),
      Icon: Lock,
      body: (
        <>
          <p>
            {t(
              "Die App läuft komplett über verschlüsseltes HTTPS. Konten werden über unseren Backend-Anbieter mit gehashten Passwörtern verwaltet. Zugriff auf deine Daten hast ausschließlich du – auch wir sehen deine Listen nicht im Klartext.",
              "The app runs entirely over encrypted HTTPS. Accounts are managed by our backend provider with hashed passwords. Only you have access to your data — we can't see your lists in plaintext either.",
            )}
          </p>
          <p>
            {t(
              "Wenn du dich sicherer fühlen willst, wähle beim Anlegen des Kontos ein starkes, einzigartiges Passwort und melde dich auf fremden Geräten wieder ab.",
              "For extra safety, choose a strong, unique password when creating your account and sign out from devices that aren't yours.",
            )}
          </p>
        </>
      ),
    },
    {
      id: "imprint",
      label: t("Impressum", "Imprint"),
      Icon: FileText,
      body: (
        <>
          <p>
            {t(
              "Wochenend-Retter ist ein privates Hobby-Projekt, das dir den deutschen Wochenendrhythmus erleichtert. Anbieter-Kennzeichnung nach §5 TMG stellen wir gerne auf Anfrage bereit.",
              "Wochenend-Retter is a personal hobby project that makes the German weekend rhythm easier. Provider information under §5 TMG is available on request.",
            )}
          </p>
          <p>
            {t("Kontakt:", "Contact:")}{" "}
            <a className="underline" href="mailto:hallo@wochenend-retter.app">
              hallo@wochenend-retter.app
            </a>
          </p>
        </>
      ),
    },
  ];

  return (
    <section className="px-5 mb-10">
      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Shield className="size-3.5" /> {t("Datenschutz & Sicherheit", "Privacy & Security")}
      </h3>
      <div className="bg-white rounded-2xl ring-1 ring-black/5 overflow-hidden divide-y divide-zinc-100 shadow-sm">
        {items.map(({ id, label, Icon, body }) => {
          const isOpen = open === id;
          return (
            <div key={id}>
              <button
                onClick={() => toggle(id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <div className="size-8 rounded-lg bg-zinc-50 flex items-center justify-center ring-1 ring-black/5">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 text-sm font-medium">{label}</div>
                <ChevronDown
                  className={`size-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-xs text-zinc-600 leading-relaxed space-y-2">
                  {body}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-zinc-400 mt-2 px-1">
        {t(
          "Diese Inhalte werden nur eingeblendet, wenn du sie öffnest.",
          "These sections are only shown when you open them.",
        )}
      </p>
    </section>
  );
}

function FeedbackCard() {
  const { t } = useI18n();
  const feedbackEmail = "wochenendretter@gmail.com";
  const subject = encodeURIComponent("Wochenend-Retter · Feedback");
  const body = encodeURIComponent(
    "Hi! Mir gefällt an Wochenend-Retter besonders …\n\nVerbesserungsvorschlag:\n\n",
  );
  return (
    <section className="px-5 mb-10">
      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <MessageCircleHeart className="size-3.5" /> Feedback
      </h3>
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm">
        <div className="text-sm font-semibold mb-1">
          {t("Gefällt dir die App?", "Do you like the app?")}
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          {t(
            "Sag uns, was gut läuft — oder was noch fehlt. Jede Rückmeldung hilft, Wochenend-Retter besser zu machen.",
            "Tell us what's working — or what's missing. Every note helps make Wochenend-Retter better.",
          )}
        </p>
        <div className="flex gap-2">
          <a
            href={`mailto:${feedbackEmail}?subject=${subject}&body=${body}`}
            className="flex-1 text-center bg-ink text-canvas rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider"
          >
            {t("Feedback senden", "Send feedback")}
          </a>
          <a
            href={`mailto:${feedbackEmail}?subject=${encodeURIComponent("Wochenend-Retter · Idee")}`}
            className="flex-1 text-center bg-accent-yellow text-ink rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider"
          >
            {t("Idee vorschlagen", "Suggest an idea")}
          </a>
        </div>
      </div>
    </section>
  );
}

function ShareAppCard() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = "https://wochenend-retter.lovable.app";
    const shareData = {
      title: "Wochenend-Retter",
      text: "Ladenschluss-Countdown, Einkaufsliste & Sonntag offen — in einer App.",
      url,
    };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* noop */
    }
  };
  return (
    <section className="px-5 mb-10">
      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Share2 className="size-3.5" /> {t("App teilen", "Share app")}
      </h3>
      <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm">
        <div className="text-sm font-semibold mb-1">
          {t("Freunde einladen", "Invite friends")}
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          {t(
            "Teile Wochenend-Retter mit Familie und Freunden — damit niemand mehr Samstag um kurz vor acht verzweifelt zum Späti rennt.",
            "Share Wochenend-Retter with family and friends — so nobody has to sprint to a corner shop at 7:59pm on Saturday.",
          )}
        </p>
        <button
          onClick={share}
          className="w-full bg-ink text-canvas rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Share2 className="size-3.5" /> {t("Diese App teilen", "Share this app")}
        </button>
        {copied && (
          <div className="mt-3 text-center text-xs font-medium text-green-700 bg-green-50 rounded-lg py-2 ring-1 ring-green-200">
            {t("Link in die Zwischenablage kopiert", "Link copied to clipboard")}
          </div>
        )}
      </div>
    </section>
  );
}

function SignedOut() {
  const { t } = useI18n();
  const benefits = [
    t("Unbegrenzt viele Einkaufslisten anlegen", "Create unlimited shopping lists"),
    t("Gelöschte Listen 30 Tage lang wiederherstellen", "Restore deleted lists for 30 days"),
    t("Lieblings-Läden speichern und geräteübergreifend abrufen", "Save favourite shops and use them across devices"),
  ];
  return (
    <>
      <section className="px-5 mb-6">
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-full bg-accent-yellow flex items-center justify-center">
              <UserCircle2 className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {t("Noch kein Konto", "No account yet")}
              </div>
              <div className="text-xs text-zinc-500">
                {t(
                  "Ohne Anmeldung nutzbar — mit Konto komfortabler.",
                  "Usable without an account — nicer with one.",
                )}
              </div>
            </div>
          </div>
          <ul className="space-y-2 mb-5">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <Check className="size-4 mt-0.5 text-ink shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/auth"
            className="block text-center bg-ink text-canvas rounded-xl py-3 text-sm font-semibold"
          >
            {t("Konto erstellen", "Create account")}
          </Link>
          <Link
            to="/auth"
            className="block text-center text-xs text-zinc-500 mt-3 underline"
          >
            {t("Ich habe schon ein Konto", "I already have an account")}
          </Link>
        </div>
      </section>
    </>
  );
}

function SignedIn({ email }: { email: string }) {
  const qc = useQueryClient();
  const { t, lang } = useI18n();
  const [_lists, setLists] = useLocalStorage<ShoppingList[]>(
    "sonntag.lists",
    [],
  );
  const [toast, setToast] = useState<string | null>(null);

  const listFn = useServerFn(listDeletedLists);
  const removeFn = useServerFn(removeDeletedList);
  const saveFn = useServerFn(saveDeletedList);

  const deleted = useQuery({
    queryKey: ["deleted-lists"],
    queryFn: () => listFn(),
    staleTime: 60_000,
  });

  const flashToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const restore = async (id: string, snap: DeletedListSnapshot) => {
    setLists((prev) => {
      if (prev.some((l) => l.id === snap.id)) return prev;
      return [...prev, snap as unknown as ShoppingList];
    });
    await removeFn({ data: { id } });
    qc.invalidateQueries({ queryKey: ["deleted-lists"] });
    flashToast(t("Liste wiederhergestellt", "List restored"));
  };

  const forget = async (id: string) => {
    await removeFn({ data: { id } });
    qc.invalidateQueries({ queryKey: ["deleted-lists"] });
    flashToast(t("Endgültig gelöscht", "Permanently deleted"));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // expose the save fn to the shopping page via a light custom event bridge
  // (called from shopping.tsx on delete). See src/lib/deleted-lists-bridge.ts.
  void saveFn;

  return (
    <>
      <section className="px-5 mb-6">
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm flex items-center gap-3">
          <div className="size-10 rounded-full bg-ink text-canvas flex items-center justify-center font-semibold">
            {email.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{email}</div>
            <div className="text-xs text-zinc-500">{t("Angemeldet", "Signed in")}</div>
          </div>
          <button
            onClick={signOut}
            className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg bg-zinc-50 ring-1 ring-black/5 flex items-center gap-1"
          >
            <LogOut className="size-3.5" /> {t("Abmelden", "Sign out")}
          </button>
        </div>
      </section>

      <section className="px-5 mb-10">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="size-3.5" /> {t("Gelöschte Listen · 30 Tage", "Deleted lists · 30 days")}
        </h3>

        {deleted.isLoading && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-sm text-zinc-500">
            {t("Lade …", "Loading …")}
          </div>
        )}
        {deleted.isError && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-sm text-red-600">
            {t("Konnte nicht laden.", "Could not load.")}
          </div>
        )}
        {deleted.data && deleted.data.length === 0 && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-sm text-zinc-500 text-center">
            {t(
              "Keine gelöschten Listen. Was du löschst, erscheint hier für 30 Tage.",
              "No deleted lists. Anything you delete appears here for 30 days.",
            )}
          </div>
        )}
        {deleted.data && deleted.data.length > 0 && (
          <ul className="bg-white rounded-2xl ring-1 ring-black/5 divide-y divide-zinc-100 overflow-hidden">
            {deleted.data.map((row) => {
              const snap = row.list;
              const when = new Date(row.deletedAt);
              return (
                <li key={row.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {snap.name}
                        {snap.tag && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-zinc-500">
                            {snap.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {snap.items.length} {t("Einträge", "items")} ·{" "}
                        {t("gelöscht", "deleted")}{" "}
                        {when.toLocaleDateString(lang === "en" ? "en-GB" : "de-DE")}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => restore(row.id, snap)}
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-accent-yellow text-ink flex items-center gap-1"
                      >
                        <RotateCcw className="size-3" /> {t("Zurück", "Restore")}
                      </button>
                      <button
                        onClick={() => forget(row.id)}
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-100 text-zinc-500 flex items-center gap-1"
                      >
                        <Trash2 className="size-3" /> {t("Weg", "Remove")}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-canvas text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2">
            <Check className="size-3" /> {toast}
            <button onClick={() => setToast(null)}>
              <X className="size-3" />
            </button>
          </div>
        )}
      </section>
    </>
  );
}