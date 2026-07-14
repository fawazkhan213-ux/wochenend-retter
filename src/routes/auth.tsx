import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Anmelden — Sonntagsruhe Planner" },
      {
        name: "description",
        content:
          "Erstelle ein Konto oder melde dich an, um deine Listen und Favoriten zu sichern.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) navigate({ to: "/account" });
  }, [hydrated, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/account" },
        });
        if (error) throw error;
        setInfo("Konto erstellt. Du bist angemeldet.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Da lief etwas schief.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/account",
    });
    if (result.error) {
      setError(result.error.message ?? "Google-Anmeldung fehlgeschlagen.");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans px-5 py-8">
      <Link
        to="/account"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 mb-6"
      >
        <ArrowLeft className="size-4" /> Zurück
      </Link>
      <h1 className="text-3xl font-medium tracking-tight mb-2">
        {mode === "signin" ? "Willkommen zurück." : "Konto erstellen."}
      </h1>
      <p className="text-sm text-zinc-500 mb-8">
        Sichere deine Listen, Favoriten und gelöschte Listen für 30 Tage.
      </p>

      <button
        onClick={google}
        className="w-full bg-white ring-1 ring-black/10 rounded-xl py-3 text-sm font-semibold mb-3 hover:ring-black/20"
      >
        Mit Google fortfahren
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-black/10" />
        <span className="text-[10px] uppercase tracking-wider text-zinc-400">
          oder E-Mail
        </span>
        <div className="flex-1 h-px bg-black/10" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="du@example.com"
          className="w-full bg-white ring-1 ring-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-ink"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort (min. 6 Zeichen)"
          className="w-full bg-white ring-1 ring-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-ink"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {info && <p className="text-xs text-green-700">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-canvas rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
        >
          {loading
            ? "Bitte warten…"
            : mode === "signin"
              ? "Anmelden"
              : "Konto erstellen"}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500 mt-6">
        {mode === "signin" ? "Noch kein Konto?" : "Bereits ein Konto?"}{" "}
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="underline"
        >
          {mode === "signin" ? "Registrieren" : "Anmelden"}
        </button>
      </p>
    </div>
  );
}