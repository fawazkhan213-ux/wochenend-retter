import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { BottomNav } from "@/components/BottomNav";
import { ACTIVITIES } from "@/lib/sunday-data";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { getSundayWeather } from "@/lib/weather.functions";
import sundayImage from "@/assets/sonntag-park.jpg";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Sonntagsplan — Sonntagsruhe Planner" },
      {
        name: "description",
        content:
          "Wetterabhängige Vorschläge für den nächsten Sonntag: Spaziergang, Museum, Tatort, Café.",
      },
      { property: "og:title", content: "Sonntagsplan" },
      {
        property: "og:description",
        content: "Was tun mit dem Ruhetag? Vorschläge, abhängig vom Wetter.",
      },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const [city, setCity] = useLocalStorage<string>("sonntag.city", "Berlin");
  const [draft, setDraft] = useState("");
  const [savedPlan, setSavedPlan] = useLocalStorage<string | null>(
    "sonntag.savedPlan",
    null,
  );

  const weatherFn = useServerFn(getSundayWeather);
  const query = useQuery({
    queryKey: ["sunday-weather", city],
    queryFn: () => weatherFn({ data: { city } }),
    enabled: !!city,
    staleTime: 30 * 60 * 1000,
  });

  const vibe = query.data?.vibe ?? "any";
  const suggestions = useMemo(
    () =>
      ACTIVITIES.filter((a) => a.weather === vibe || a.weather === "any").slice(
        0,
        6,
      ),
    [vibe],
  );

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <header className="px-5 pt-8 pb-6">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
          Nächster Sonntag
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-balance">
          Keine Termine, keine Hektik.
        </h1>
      </header>

      <section className="px-5 mb-6">
        <div className="bg-zinc-100 rounded-[20px] overflow-hidden ring-1 ring-black/5">
          <img
            src={sundayImage}
            alt="Nebliger Sonntagmorgen im Park"
            width={1200}
            height={600}
            loading="lazy"
            className="w-full aspect-[2/1] object-cover"
          />
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Wetter in {query.data?.city ?? city}</h4>
              <span className="text-sm text-zinc-500">
                {query.isLoading
                  ? "…"
                  : query.data
                    ? `${query.data.tempMax}° / ${query.data.tempMin}° · ${query.data.summary}`
                    : "keine Daten"}
              </span>
            </div>
            <p className="text-sm text-zinc-600 leading-normal text-pretty">
              {query.data
                ? query.data.vibe === "sunny"
                  ? "Rausgehen. Der Sonntag verlangt Sonne im Gesicht."
                  : query.data.vibe === "rainy"
                    ? "Drinnen bleiben. Perfektes Wetter für Café, Kino, Sofa."
                    : "Wechselhaft. Ein Spaziergang mit Regenjacke im Rucksack."
                : "Gib deine Stadt ein, um wetterabhängige Vorschläge zu bekommen."}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) setCity(draft.trim());
            setDraft("");
          }}
          className="flex gap-2 bg-white p-2 rounded-2xl ring-1 ring-black/5 shadow-sm"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Andere Stadt (aktuell: ${city})`}
            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="bg-ink text-canvas rounded-xl px-4 text-sm font-medium"
          >
            Setzen
          </button>
        </form>
      </section>

      <section className="px-5">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
          Vorschläge
        </h3>
        <ul className="space-y-3">
          {suggestions.map((a) => {
            const active = savedPlan === a.title;
            return (
              <li
                key={a.title}
                className={`bg-white p-4 rounded-2xl ring-1 transition ${
                  active ? "ring-ink" : "ring-black/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-display italic text-lg leading-snug">
                    {a.title}
                  </h4>
                  <button
                    onClick={() => setSavedPlan(active ? null : a.title)}
                    className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ring-1 ${
                      active
                        ? "bg-ink text-canvas ring-ink"
                        : "bg-accent-yellow text-ink ring-accent-yellow"
                    }`}
                  >
                    {active ? "gemerkt" : "merken"}
                  </button>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">{a.blurb}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <BottomNav />
    </div>
  );
}