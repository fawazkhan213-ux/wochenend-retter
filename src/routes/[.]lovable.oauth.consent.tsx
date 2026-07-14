import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string; redirect_uri?: string } | null;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthNamespace = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauthClient() {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get(
      "authorization_id",
    )!;
    const { data, error } = await oauthClient().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold mb-2">Verbindung nicht möglich</h1>
        <p className="text-sm text-zinc-600">
          {(error as Error)?.message ?? String(error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "Externe App";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauthClient().approveAuthorization(authorization_id)
      : await oauthClient().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Keine Weiterleitung vom Auth-Server erhalten.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-6 py-10">
      <div className="max-w-md w-full bg-white ring-1 ring-black/10 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-medium tracking-tight mb-2">
          {clientName} mit Wochenend-Retter verbinden
        </h1>
        <p className="text-sm text-zinc-600 mb-4">
          {clientName} kann die verfügbaren Wochenend-Retter-Tools als dich aufrufen,
          solange du angemeldet bist.
        </p>
        <ul className="text-sm text-zinc-700 space-y-1 mb-6 list-disc pl-5">
          <li>Dein Profil lesen (Name, E-Mail)</li>
          <li>Deine kürzlich gelöschten Einkaufslisten anzeigen</li>
          <li>Offene Geschäfte in deiner Nähe suchen</li>
        </ul>
        <p className="text-xs text-zinc-500 mb-6">
          Backend-Regeln und deine Berechtigungen bleiben aktiv — {clientName} kann
          keine Daten sehen, auf die du selbst keinen Zugriff hast.
        </p>
        {error && <p role="alert" className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 bg-ink text-canvas rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
          >
            Zulassen
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 bg-white ring-1 ring-black/10 rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
          >
            Ablehnen
          </button>
        </div>
      </div>
    </main>
  );
}