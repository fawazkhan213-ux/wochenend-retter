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
} from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
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

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <header className="px-5 pt-8 pb-6">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
          Konto
        </p>
        <h1 className="text-2xl font-medium tracking-tight">
          {user ? "Dein Konto." : "Mehr aus dem Sonntag holen."}
        </h1>
      </header>

      {!hydrated ? (
        <section className="px-5">
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-sm text-zinc-500">
            Lade …
          </div>
        </section>
      ) : user ? (
        <SignedIn email={user.email ?? "Angemeldet"} />
      ) : (
        <SignedOut />
      )}

      <FeedbackCard />
      <PrivacySecurityCard />

      <BottomNav />
    </div>
  );
}

type PolicySection = "privacy" | "security" | "imprint";

function PrivacySecurityCard() {
  const [open, setOpen] = useState<PolicySection | null>(null);
  const toggle = (s: PolicySection) => setOpen((cur) => (cur === s ? null : s));

  const items: {
    id: PolicySection;
    label: string;
    Icon: typeof Shield;
    body: React.ReactNode;
  }[] = [
    {
      id: "privacy",
      label: "Datenschutz",
      Icon: Shield,
      body: (
        <>
          <p>
            Wochenend-Retter speichert deine Einkaufslisten, Favoriten und
            Einstellungen zuerst lokal auf deinem Gerät. Nur wenn du ein Konto
            anlegst, werden gelöschte Listen 30 Tage lang serverseitig
            aufbewahrt, damit du sie wiederherstellen kannst.
          </p>
          <p>
            Für Orte in deiner Nähe fragen wir – nur mit deiner Zustimmung –
            deinen Standort ab und schicken die Koordinaten an Google Maps.
            Wetterdaten kommen von Open-Meteo. Es gibt kein Tracking, keine
            Werbung, keine Weitergabe an Dritte.
          </p>
        </>
      ),
    },
    {
      id: "security",
      label: "Sicherheit",
      Icon: Lock,
      body: (
        <>
          <p>
            Die App läuft komplett über verschlüsseltes HTTPS. Konten werden
            über unseren Backend-Anbieter mit gehashten Passwörtern verwaltet.
            Zugriff auf deine Daten hast ausschließlich du – auch wir sehen
            deine Listen nicht im Klartext.
          </p>
          <p>
            Wenn du dich sicherer fühlen willst, wähle beim Anlegen des Kontos
            ein starkes, einzigartiges Passwort und melde dich auf fremden
            Geräten wieder ab.
          </p>
        </>
      ),
    },
    {
      id: "imprint",
      label: "Impressum",
      Icon: FileText,
      body: (
        <>
          <p>
            Wochenend-Retter ist ein privates Hobby-Projekt, das dir den
            deutschen Wochenendrhythmus erleichtert. Anbieter-Kennzeichnung
            nach §5 TMG stellen wir gerne auf Anfrage bereit.
          </p>
          <p>
            Kontakt:{" "}
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
        <Shield className="size-3.5" /> Datenschutz &amp; Sicherheit
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
        Diese Inhalte werden nur eingeblendet, wenn du sie öffnest.
      </p>
    </section>
  );
}

function FeedbackCard() {
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
        <div className="text-sm font-semibold mb-1">Gefällt dir die App?</div>
        <p className="text-xs text-zinc-500 mb-4">
          Sag uns, was gut läuft — oder was noch fehlt. Jede Rückmeldung hilft,
          Wochenend-Retter besser zu machen.
        </p>
        <div className="flex gap-2">
          <a
            href={`mailto:hallo@wochenend-retter.app?subject=${subject}&body=${body}`}
            className="flex-1 text-center bg-ink text-canvas rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider"
          >
            Feedback senden
          </a>
          <a
            href={`mailto:hallo@wochenend-retter.app?subject=${encodeURIComponent("Wochenend-Retter · Idee")}`}
            className="flex-1 text-center bg-accent-yellow text-ink rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider"
          >
            Idee vorschlagen
          </a>
        </div>
      </div>
    </section>
  );
}

function SignedOut() {
  const benefits = [
    "Unbegrenzt viele Einkaufslisten anlegen",
    "Gelöschte Listen 30 Tage lang wiederherstellen",
    "Lieblings-Läden speichern und geräteübergreifend abrufen",
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
              <div className="text-sm font-semibold">Noch kein Konto</div>
              <div className="text-xs text-zinc-500">
                Ohne Anmeldung nutzbar — mit Konto komfortabler.
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
            Konto erstellen
          </Link>
          <Link
            to="/auth"
            className="block text-center text-xs text-zinc-500 mt-3 underline"
          >
            Ich habe schon ein Konto
          </Link>
        </div>
      </section>
    </>
  );
}

function SignedIn({ email }: { email: string }) {
  const qc = useQueryClient();
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
    flashToast("Liste wiederhergestellt");
  };

  const forget = async (id: string) => {
    await removeFn({ data: { id } });
    qc.invalidateQueries({ queryKey: ["deleted-lists"] });
    flashToast("Endgültig gelöscht");
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
            <div className="text-xs text-zinc-500">Angemeldet</div>
          </div>
          <button
            onClick={signOut}
            className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg bg-zinc-50 ring-1 ring-black/5 flex items-center gap-1"
          >
            <LogOut className="size-3.5" /> Abmelden
          </button>
        </div>
      </section>

      <section className="px-5 mb-10">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="size-3.5" /> Gelöschte Listen · 30 Tage
        </h3>

        {deleted.isLoading && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-sm text-zinc-500">
            Lade …
          </div>
        )}
        {deleted.isError && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-sm text-red-600">
            Konnte nicht laden.
          </div>
        )}
        {deleted.data && deleted.data.length === 0 && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-sm text-zinc-500 text-center">
            Keine gelöschten Listen. Was du löschst, erscheint hier für 30 Tage.
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
                        {snap.items.length} Einträge · gelöscht{" "}
                        {when.toLocaleDateString("de-DE")}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => restore(row.id, snap)}
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-accent-yellow text-ink flex items-center gap-1"
                      >
                        <RotateCcw className="size-3" /> Zurück
                      </button>
                      <button
                        onClick={() => forget(row.id)}
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-100 text-zinc-500 flex items-center gap-1"
                      >
                        <Trash2 className="size-3" /> Weg
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