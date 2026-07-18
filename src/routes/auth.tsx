import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "",
  }),
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

// Only accept same-origin relative paths as post-auth destinations.
function safeNext(next: string): string | null {
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

function AuthPage() {
  const { user, hydrated } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const safe = safeNext(next);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) {
      if (safe) {
        window.location.href = safe;
      } else {
        navigate({ to: "/account" });
      }
    }
  }, [hydrated, user, navigate, safe]);

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
          options: {
            data: { name: name.trim() },
            emailRedirectTo:
              window.location.origin + (safe ?? "/account"),
          },
        });
        if (error) throw error;
        setInfo(t("Konto erstellt. Du bist angemeldet.", "Account created. You are signed in."));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Da lief etwas schief.", "Something went wrong."));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + (safe ?? "/account"),
    });
    if (result.error) {
      setError(result.error.message ?? t("Google-Anmeldung fehlgeschlagen.", "Google sign-in failed."));
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans px-5 py-8">
      <Link
        to="/account"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 mb-6"
      >
        <ArrowLeft className="size-4" /> {t("Zurück", "Back")}
      </Link>
      <h1 className="text-3xl font-medium tracking-tight mb-2">
        {mode === "signin" ? t("Willkommen zurück.", "Welcome back.") : t("Konto erstellen.", "Create account.")}
      </h1>
      <p className="text-sm text-zinc-500 mb-8">
        {t("Sichere deine Listen, Favoriten und gelöschte Listen für 30 Tage.", "Save your lists, favourites, and deleted lists for 30 days.")}
      </p>

      <button
        onClick={google}
        className="w-full bg-white ring-1 ring-black/10 rounded-xl py-3 text-sm font-semibold mb-3 hover:ring-black/20"
      >
        {t("Mit Google fortfahren", "Continue with Google")}
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-black/10" />
        <span className="text-[10px] uppercase tracking-wider text-zinc-400">
          {t("oder E-Mail", "or email")}
        </span>
        <div className="flex-1 h-px bg-black/10" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Dein Name", "Your name")}
            maxLength={80}
            className="w-full bg-white ring-1 ring-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-ink"
          />
        )}
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
          placeholder={t("Passwort (min. 6 Zeichen)", "Password (min. 6 characters)")}
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
            ? t("Bitte warten…", "Please wait…")
            : mode === "signin"
              ? t("Anmelden", "Sign in")
              : t("Konto erstellen", "Create account")}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500 mt-6">
        {mode === "signin" ? t("Noch kein Konto?", "No account yet?") : t("Bereits ein Konto?", "Already have an account?")}{" "}
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="underline"
        >
          {mode === "signin" ? t("Registrieren", "Register") : t("Anmelden", "Sign in")}
        </button>
      </p>
    </div>
  );
}