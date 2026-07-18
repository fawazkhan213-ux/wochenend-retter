import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { LocateFixed, MapPin, Navigation, Search, Copy } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { getSundayWeather } from "@/lib/weather.functions";
import { searchNearbyPlaces, searchTextPlaces, geocodeCity } from "@/lib/places.functions";
import { MapPreview } from "@/components/MapPreview";
import {
  distanceMeters,
  formatDistance,
  mapsSearchUrl,
  useGeolocation,
  type Coords,
} from "@/lib/geolocation";
import meadowImage from "@/assets/sonntag-meadow.jpg";
import { useI18n } from "@/lib/i18n";

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
  const geo = useGeolocation();
  const { t } = useI18n();
  const [city] = useLocalStorage<string>("sonntag.city", "Berlin");
  const [placeQuery, setPlaceQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const geocodeFn = useServerFn(geocodeCity);

  function copyToClipboard(text: string, label = t("Kopiert", "Copied")) {
    try {
      navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(t("Kopieren fehlgeschlagen", "Copy failed"));
      window.setTimeout(() => setCopied(null), 2000);
    }
  }

  async function useCityAsLocation() {
    setFallbackLoading(true);
    setFallbackError(null);
    try {
      const res = await geocodeFn({ data: { city } });
      geo.setCoords({ lat: res.lat, lng: res.lng });
    } catch (e) {
      setFallbackError(e instanceof Error ? e.message : t("Fehler beim Geocoding", "Geocoding error"));
    } finally {
      setFallbackLoading(false);
    }
  }

  // Scope the outing color palette to this route only.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "outing");
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  const weatherFn = useServerFn(getSundayWeather);
  const query = useQuery({
    queryKey: ["sunday-weather", city],
    queryFn: () => weatherFn({ data: { city } }),
    enabled: !!city,
    staleTime: 30 * 60 * 1000,
  });

  const placesFn = useServerFn(searchNearbyPlaces);
  const places = useQuery({
    queryKey: ["plan-nearby-visit", geo.coords?.lat, geo.coords?.lng],
    queryFn: () =>
      placesFn({
        data: {
          lat: geo.coords!.lat,
          lng: geo.coords!.lng,
          includedTypes: [
            "park",
            "museum",
            "cafe",
            "tourist_attraction",
          ],
          radius: 5000,
          maxResults: 12,
        },
      }),
    enabled: !!geo.coords,
    staleTime: 15 * 60 * 1000,
  });

  // "Aktualisieren" in the corner refreshes location AND everything that
  // depends on it — the Sunday weather and the nearby places.
  const refreshAll = () => {
    geo.request();
    query.refetch();
    places.refetch();
  };

  const textFn = useServerFn(searchTextPlaces);
  const textSearch = useQuery({
    queryKey: [
      "plan-text-search",
      submittedQuery,
      geo.coords?.lat,
      geo.coords?.lng,
    ],
    queryFn: () =>
      textFn({
        data: {
          query: submittedQuery,
          lat: geo.coords?.lat,
          lng: geo.coords?.lng,
          radius: 5000,
          maxResults: 5,
        },
      }),
    enabled: !!submittedQuery,
    staleTime: 5 * 60 * 1000,
  });

  const nearestForQuery = useMemo(() => {
    if (!textSearch.data || textSearch.data.length === 0) return null;
    if (!geo.coords) return textSearch.data[0];
    return [...textSearch.data].sort(
      (a, b) =>
        distanceMeters(geo.coords as Coords, { lat: a.lat, lng: a.lng }) -
        distanceMeters(geo.coords as Coords, { lat: b.lat, lng: b.lng }),
    )[0];
  }, [textSearch.data, geo.coords]);

  const withDistance = useMemo(() => {
    if (!places.data || !geo.coords) return [];
    return places.data
      .map((p) => ({
        ...p,
        distance: distanceMeters(geo.coords as Coords, { lat: p.lat, lng: p.lng }),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [places.data, geo.coords]);

  const glyphFor = (typeLabel: string): string => {
    const t = typeLabel.toLowerCase();
    if (t.includes("park")) return "🌳";
    if (t.includes("museum")) return "🏛";
    if (t.includes("café") || t.includes("cafe")) return "☕";
    return "📍";
  };

  const directionsUrl = (p: { lat: number; lng: number; name: string; mapsUri: string }) =>
    p.mapsUri ||
    `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&destination_place_id=${encodeURIComponent(
      p.name,
    )}`;

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <header className="px-5 pt-8 pb-6">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
          {t("Nächster Sonntag", "Next Sunday")}
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-balance">
          {t("Keine Termine, keine Hektik.", "No appointments, no rush.")}
        </h1>
      </header>

      <section className="px-5 mb-6">
        <div className="bg-white rounded-[20px] overflow-hidden ring-1 ring-black/5">
          {geo.coords ? (
            <MapPreview
              lat={geo.coords.lat}
              lng={geo.coords.lng}
              className="w-full aspect-[2/1]"
            />
          ) : (
            <img
              src={meadowImage}
              alt={t("Sonnige Wiese mit Picknickdecke", "Sunny meadow with picnic blanket")}
              width={1200}
              height={600}
              loading="lazy"
              className="w-full aspect-[2/1] object-cover"
            />
          )}
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium">{t("Wetter in", "Weather in")} {query.data?.city ?? city}</h2>
              <span className="text-sm opacity-70">
                {query.isLoading
                  ? "…"
                  : query.data
                    ? `${query.data.tempMax}° / ${query.data.tempMin}° · ${query.data.summary}`
                    : t("keine Daten", "no data")}
              </span>
            </div>
            <p className="text-sm opacity-80 leading-normal text-pretty">
              {geo.coords
                ? t(
                    "Dein Standort ist geteilt. Unten findest du Orte in der Nähe.",
                    "Your location is shared. Find nearby places below.",
                  )
                : query.data
                ? query.data.vibe === "sunny"
                  ? t("Rausgehen. Der Sonntag verlangt Sonne im Gesicht.", "Go out. Sunday calls for sun on your face.")
                  : query.data.vibe === "rainy"
                    ? t("Drinnen bleiben. Perfektes Wetter für Café, Kino, Sofa.", "Stay in. Perfect café, cinema, sofa weather.")
                    : t("Wechselhaft. Ein Spaziergang mit Regenjacke im Rucksack.", "Mixed. A walk with a rain jacket in the backpack.")
                : t("Gib deine Stadt ein, um wetterabhängige Vorschläge zu bekommen.", "Enter your city for weather-based suggestions.")}
            </p>
          </div>
        </div>
      </section>

      {/* Places to visit nearby */}
      <section className="px-5 mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
            {t("Orte in deiner Nähe", "Places near you")}
          </h2>
          <button
            onClick={refreshAll}
            disabled={geo.loading || query.isFetching || places.isFetching}
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-white ring-1 ring-black/5 flex items-center gap-1 disabled:opacity-50"
          >
            <LocateFixed className="size-3" />
            {geo.coords ? t("Aktualisieren", "Refresh") : t("Standort", "Location")}
          </button>
        </div>

        {!geo.coords && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-center text-sm text-zinc-500 flex flex-col items-center gap-3">
            <MapPin className="size-6 text-accent-yellow" />
            <p>{t("Standort teilen, um Parks, Museen und Cafés in deiner Nähe zu finden.", "Share your location to find parks, museums, and cafés near you.")}</p>
            {geo.error && (
              <p className="text-xs text-red-600 -mt-1">{geo.error}</p>
            )}
            <button
              onClick={geo.request}
              disabled={geo.loading}
              className="mt-1 bg-ink text-canvas rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {geo.loading ? t("Warte auf Standort …", "Waiting for location…") : t("Standort teilen", "Share location")}
            </button>
            <button
              onClick={useCityAsLocation}
              disabled={fallbackLoading}
              className="text-xs underline text-zinc-600 disabled:opacity-50"
            >
              {fallbackLoading
                ? t("Suche Koordinaten …", "Finding coordinates…")
                : t(`Stattdessen ${city} als Standort verwenden`, `Use ${city} as location instead`)}
            </button>
            {fallbackError && (
              <p className="text-xs text-red-600">{fallbackError}</p>
            )}
          </div>
        )}

        {geo.coords && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = placeQuery.trim();
              if (q) setSubmittedQuery(q);
            }}
            className="flex gap-2 bg-white p-2 rounded-2xl ring-1 ring-black/5 shadow-sm mb-3"
          >
            <input
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              placeholder={t("Laden oder Ort finden (z. B. Rewe, Späti)", "Find shop or place (e.g. Rewe, kiosk)")}
              className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="bg-ink text-canvas rounded-xl px-3 text-sm font-medium flex items-center gap-1"
            >
              <Search className="size-3" /> {t("Suchen", "Search")}
            </button>
          </form>
        )}

        {submittedQuery && textSearch.isLoading && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4 text-sm text-zinc-500 mb-3">
            {t(`Suche „${submittedQuery}“ …`, `Searching "${submittedQuery}"…`)}
          </div>
        )}

        {submittedQuery && !textSearch.isLoading && nearestForQuery && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4 mb-3 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-accent-yellow/40 flex items-center justify-center text-lg">
              📍
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {nearestForQuery.name}
              </div>
              <div className="text-xs text-zinc-500 truncate">
                {nearestForQuery.address}
                {geo.coords
                  ? ` · ${formatDistance(
                      distanceMeters(geo.coords as Coords, {
                        lat: nearestForQuery.lat,
                        lng: nearestForQuery.lng,
                      }),
                    )}`
                  : ""}
              </div>
            </div>
            <a
              href={directionsUrl(nearestForQuery)}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-xl bg-ink text-canvas flex items-center gap-1"
            >
              <Navigation className="size-3" /> {t("Route", "Route")}
            </a>
            <button
              onClick={() =>
                copyToClipboard(
                  `${nearestForQuery.name} — ${nearestForQuery.address} (${nearestForQuery.lat}, ${nearestForQuery.lng})`,
                  t("Ort in Zwischenablage", "Place to clipboard"),
                )
              }
              className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-xl bg-white ring-1 ring-black/10 flex items-center gap-1"
              aria-label={t("Standort kopieren", "Copy location")}
            >
              <Copy className="size-3" />
            </button>
          </div>
        )}

        {submittedQuery && !textSearch.isLoading && !nearestForQuery && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4 text-sm text-zinc-500 mb-3">
            {t(`Nichts gefunden für „${submittedQuery}“.`, `Nothing found for "${submittedQuery}".`)}
          </div>
        )}

        {geo.coords && places.isLoading && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-center text-sm text-zinc-500">
            {t("Suche Orte in deiner Nähe …", "Searching places near you…")}
          </div>
        )}

        {geo.coords && withDistance.length > 0 && (
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory">
            {withDistance.map((p) => (
              <div
                key={p.id}
                className="snap-start shrink-0 w-64 bg-white rounded-2xl ring-1 ring-black/5 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="size-9 rounded-lg bg-accent-yellow/40 flex items-center justify-center text-lg">
                    {glyphFor(p.typeLabel)}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    {formatDistance(p.distance)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-zinc-500 line-clamp-2">
                    {p.address}
                  </div>
                  {p.typeLabel && (
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-1">
                      {p.typeLabel}
                      {p.openNow === true
                        ? t(" · offen", " · open")
                        : p.openNow === false
                          ? t(" · geschlossen", " · closed")
                          : ""}
                    </div>
                  )}
                </div>
                <a
                  href={directionsUrl(p)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-xl bg-ink text-canvas flex items-center justify-center gap-1"
                >
                  <Navigation className="size-3" /> {t("Route öffnen", "Open route")}
                </a>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${p.name} — ${p.address} (${p.lat}, ${p.lng})`,
                      t("Ort in Zwischenablage", "Place to clipboard"),
                    )
                  }
                  className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-xl bg-white ring-1 ring-black/10 flex items-center justify-center gap-1"
                >
                  <Copy className="size-3" /> {t("Kopieren", "Copy")}
                </button>
              </div>
            ))}
          </div>
        )}

        {geo.coords && !places.isLoading && withDistance.length === 0 && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-center text-sm text-zinc-500">
            {t("Keine Orte in 5 km gefunden.", "No places found within 5 km.")}{" "}
            <a
              href={mapsSearchUrl(t("Parks in der Nähe", "Parks nearby"))}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {t("Auf Google Maps öffnen", "Open in Google Maps")}
            </a>
          </div>
        )}
      </section>

      <BottomNav />
      {copied && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-canvas text-xs font-medium px-4 py-2 rounded-full shadow-lg z-50">
          {copied} — {t("in Zwischenablage kopiert", "copied to clipboard")}
        </div>
      )}
    </div>
  );
}