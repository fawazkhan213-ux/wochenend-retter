import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { SUNDAY_CATEGORIES } from "@/lib/sunday-data";
import { getWeekendStatus, panicLabel } from "@/lib/time";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useHydrated } from "@/lib/useHydrated";
import { getActiveList, type ShoppingList } from "@/lib/shopping-lists";
import { getSundayWeather } from "@/lib/weather.functions";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

type CountdownUnit = "sec" | "hours" | "days";

function Dashboard() {
  const hydrated = useHydrated();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = useMemo(() => getWeekendStatus(now), [now]);
  const [lists] = useLocalStorage<ShoppingList[]>("sonntag.lists", []);
  const [activeId] = useLocalStorage<string | null>("sonntag.activeListId", null);
  const active = getActiveList(lists, activeId);
  const items = active?.items ?? [];
  const openCount = items.filter((i) => !i.done).length;

  const [unit, setUnit] = useLocalStorage<CountdownUnit>(
    "sonntag.countdownUnit",
    "sec",
  );
  const [city] = useLocalStorage<string>("sonntag.city", "Berlin");
  const [recentCategories, setRecentCategories] = useLocalStorage<string[]>(
    "sonntag.recentCategories",
    [],
  );
  const [showAllCategories, setShowAllCategories] = useState(false);

  const orderedCategories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: typeof SUNDAY_CATEGORIES = [];
    for (const id of recentCategories) {
      const cat = SUNDAY_CATEGORIES.find((c) => c.id === id);
      if (cat && !seen.has(cat.id)) {
        ordered.push(cat);
        seen.add(cat.id);
      }
    }
    for (const cat of SUNDAY_CATEGORIES) {
      if (!seen.has(cat.id)) ordered.push(cat);
    }
    return ordered;
  }, [recentCategories]);

  const visibleCategories = showAllCategories
    ? orderedCategories
    : orderedCategories.slice(0, 2);

  const trackCategory = (id: string) => {
    setRecentCategories((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)];
      return next.slice(0, 6);
    });
  };

  const weatherFn = useServerFn(getSundayWeather);
  const weather = useQuery({
    queryKey: ["dashboard-weather", city],
    queryFn: () => weatherFn({ data: { city } }),
    enabled: !!city,
    staleTime: 30 * 60 * 1000,
  });

  const totalHours = status.msUntilLadenschluss / 3_600_000;
  const totalDays = totalHours / 24;

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <header className="px-5 pt-8 pb-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
              {status.weekdayLabel}, {status.dateLabel}
            </p>
            <h1 className="text-2xl font-medium text-balance tracking-tight">
              {status.isSunday
                ? "Guten Morgen. Heute ist Ruhetag."
                : status.isSaturday
                  ? "Guten Morgen. Heute wird eingekauft."
                  : "Guten Morgen. Bald ist Wochenende."}
            </h1>
          </div>
          <div className="size-10 rounded-full bg-zinc-200 ring-1 ring-black/5 flex items-center justify-center text-sm font-display italic text-zinc-500">
            So
          </div>
        </div>
      </header>

      <section className="px-5 mb-8">
        <div className="bg-zinc-900 text-white rounded-[20px] p-6 ring-1 ring-black/5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`size-2 rounded-full ${
                  status.isSunday ? "bg-zinc-500" : "bg-accent-yellow animate-pulse"
                }`}
              />
              <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                {status.isSunday ? "Sonntagsruhe aktiv" : "Ladenschluss"}
              </span>
            </div>
            <div
              className="flex items-center rounded-full bg-white/5 ring-1 ring-white/10 p-0.5 text-[10px] font-semibold uppercase tracking-wider"
              role="group"
              aria-label="Einheit wählen"
            >
              {(["sec", "hours", "days"] as CountdownUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-2 py-1 rounded-full transition ${
                    unit === u
                      ? "bg-accent-yellow text-ink"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {u === "sec" ? "Sek" : u === "hours" ? "Std" : "Tage"}
                </button>
              ))}
            </div>
          </div>
          {unit === "sec" ? (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-6xl leading-none">
                {hydrated ? pad(status.hours) : "--"}
              </span>
              <span className="font-display text-4xl text-zinc-500">:</span>
              <span className="font-display text-6xl leading-none">
                {hydrated ? pad(status.minutes) : "--"}
              </span>
              <span className="font-display text-4xl text-zinc-500">:</span>
              <span className="font-display text-4xl leading-none text-zinc-500">
                {hydrated ? pad(status.seconds) : "--"}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-6xl leading-none">
                {hydrated
                  ? unit === "hours"
                    ? Math.floor(totalHours).toString()
                    : totalDays.toFixed(1).replace(".", ",")
                  : "--"}
              </span>
              <span className="font-display text-2xl text-zinc-500">
                {unit === "hours" ? "Std" : "Tage"}
              </span>
            </div>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
            {weather.data ? (
              <>
                <span>
                  {weather.data.vibe === "sunny"
                    ? "☀︎"
                    : weather.data.vibe === "rainy"
                      ? "☂"
                      : "☁"}
                </span>
                <span>
                  {weather.data.tempMax}° · {weather.data.summary} · {weather.data.city}
                </span>
              </>
            ) : (
              <span>Wetter wird geladen …</span>
            )}
          </div>
          <p className="mt-3 text-sm text-zinc-400 max-w-[35ch] text-pretty">
            {status.isSunday
              ? "Ruhezeit bis Montag früh. Kein Rasenmähen, kein Bohren, kein Waschen."
              : "Bis Samstag 20:00 Uhr haben die meisten Supermärkte geöffnet. Danach beginnt die große Sonntagsruhe."}
          </p>
        </div>
      </section>

      <section className="px-5 mb-10">
        <Link
          to="/shopping"
          className="block bg-white rounded-[20px] p-5 ring-1 ring-black/5 shadow-sm hover:ring-black/10 transition"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-semibold">Einkaufsliste</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase">
              {panicLabel(status.panicLevel)}
            </span>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500 mb-4">
              Noch nichts auf der Liste. Ein Preset wählen oder Artikel hinzufügen.
            </p>
          ) : (
            <ul className="space-y-3 mb-4">
              {items.slice(0, 3).map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div
                    className={`size-4 rounded-sm border ${
                      item.done
                        ? "bg-ink border-ink"
                        : "border-zinc-300"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      item.done ? "text-zinc-400 line-through" : ""
                    }`}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="w-full bg-accent-yellow text-ink font-medium text-sm py-2 px-3 rounded-lg ring-1 ring-accent-yellow flex items-center justify-center gap-2">
            <span>
              {openCount === 0 && items.length > 0
                ? "Alles erledigt"
                : items.length === 0
                  ? "Liste starten"
                  : `${openCount} offen — Liste öffnen`}
            </span>
          </div>
        </Link>
      </section>

      <section className="px-5 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
            {recentCategories.length > 0 ? "Zuletzt geöffnet" : "Sonntag offen"}
          </h3>
          <Link to="/open-sunday" className="text-xs text-ink/60 hover:text-ink">
            alle →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {visibleCategories.map((cat) => (
            <Link
              key={cat.id}
              to="/open-sunday"
              hash={cat.id}
              onClick={() => trackCategory(cat.id)}
              className="bg-white p-4 rounded-xl ring-1 ring-black/5 flex flex-col gap-3 hover:ring-black/10 transition"
            >
              <div className="size-8 bg-zinc-50 rounded-lg flex items-center justify-center ring-1 ring-black/5 font-display italic text-lg">
                {cat.glyph}
              </div>
              <div>
                <span className="text-sm font-medium block">{cat.name}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  {cat.hint}
                </span>
              </div>
            </Link>
          ))}
        </div>
        {orderedCategories.length > 2 && (
          <button
            onClick={() => setShowAllCategories((s) => !s)}
            className="mt-3 mx-auto flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-ink px-3 py-1.5 rounded-full bg-white ring-1 ring-black/5"
          >
            {showAllCategories ? "Weniger" : "Mehr anzeigen"}
            <ChevronDown
              className={`size-3 transition-transform ${
                showAllCategories ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </section>

      <section className="px-5">
        <Link
          to="/plan"
          className="block bg-zinc-100 rounded-[20px] overflow-hidden ring-1 ring-black/5"
        >
          <img
            src={planCardImage}
            alt="Sonntagsstillleben mit Buch und Kaffee"
            width={1200}
            height={600}
            loading="lazy"
            className="w-full aspect-[2/1] object-cover"
          />
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Sonntagsplan</h4>
              <span className="text-sm text-zinc-500">Wetter checken →</span>
            </div>
            <p className="text-sm text-zinc-600 leading-normal max-w-[48ch] text-pretty">
              Was tun mit dem Ruhetag? Ein paar Vorschläge, abhängig vom Wetter.
            </p>
          </div>
        </Link>
      </section>

      <BottomNav />
    </div>
  );
}

import planCardImage from "@/assets/sonntag-plan-card.jpg";
