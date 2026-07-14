import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, Plus, Trash2, LocateFixed, Sparkles, UserCircle2 } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { SUNDAY_CATEGORIES } from "@/lib/sunday-data";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useAuth } from "@/lib/useAuth";
import {
  distanceMeters,
  formatDistance,
  mapsSearchUrl,
  useGeolocation,
  type Coords,
} from "@/lib/geolocation";
import {
  searchNearbyPlaces,
  searchTextPlaces,
  geocodeCity,
  reverseGeocode,
  type NearbyPlace,
} from "@/lib/places.functions";

type Favorite = {
  id: string;
  name: string;
  category: string;
  note: string;
  mapsUri?: string;
  address?: string;
};

export const Route = createFileRoute("/open-sunday")({
  head: () => ({
    meta: [
      { title: "Sonntag offen — Sonntagsruhe Planner" },
      {
        name: "description",
        content:
          "Was am Sonntag in Deutschland offen hat — live in deiner Nähe: Späti, Tankstelle, Bäckerei, Apotheke.",
      },
      { property: "og:title", content: "Sonntag offen — Sonntagsruhe" },
      {
        property: "og:description",
        content:
          "Nahe Sonntags-Läden per Google Maps — plus deine eigenen Favoriten mit Route.",
      },
    ],
  }),
  component: OpenSundayPage,
});

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function OpenSundayPage() {
  const geo = useGeolocation();
  const [city] = useLocalStorage<string>("sonntag.city", "Berlin");
  const [activeCat, setActiveCat] = useState<string>(SUNDAY_CATEGORIES[0]!.id);
  const [favs, setFavs] = useLocalStorage<Favorite[]>("sonntag.favs", []);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(SUNDAY_CATEGORIES[0]!.id);
  const [note, setNote] = useState("");
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const geocodeFn = useServerFn(geocodeCity);
  const reverseFn = useServerFn(reverseGeocode);
  const textFn = useServerFn(searchTextPlaces);
  const { isAuthenticated, hydrated } = useAuth();

  // "Usual shopping spot" — derive a preferred brand from what the user
  // has already saved as favorites. Most-frequent name across all favorites
  // is the strongest local signal we have without pinging an AI service.
  const preferredBrand = useMemo(() => {
    if (favs.length === 0) return null;
    const freq = new Map<string, number>();
    for (const f of favs) {
      const key = f.name.trim().split(/\s+/)[0]?.toLowerCase();
      if (!key) continue;
      freq.set(key, (freq.get(key) ?? 0) + 1);
    }
    const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? null;
  }, [favs]);

  const preferredPlaces = useQuery({
    queryKey: [
      "preferred-brand",
      preferredBrand,
      geo.coords?.lat,
      geo.coords?.lng,
    ],
    queryFn: () =>
      textFn({
        data: {
          query: preferredBrand!,
          lat: geo.coords?.lat,
          lng: geo.coords?.lng,
          radius: 5000,
          maxResults: 4,
        },
      }),
    enabled: !!preferredBrand && !!geo.coords,
    staleTime: 15 * 60 * 1000,
  });

  const rankedPreferred = useMemo(() => {
    if (!preferredPlaces.data || !geo.coords) return [];
    return [...preferredPlaces.data]
      .map((p) => ({
        ...p,
        distance: distanceMeters(geo.coords as Coords, { lat: p.lat, lng: p.lng }),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  }, [preferredPlaces.data, geo.coords]);

  // Auto-request the browser location on first visit; if geolocation is
  // unavailable or times out, silently fall back to the saved city.
  useEffect(() => {
    if (!geo.coords && !geo.loading && !geo.error) {
      geo.request();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (geo.error && !geo.coords && !fallbackLoading) {
      setFallbackLoading(true);
      geocodeFn({ data: { city } })
        .then((res) => geo.setCoords({ lat: res.lat, lng: res.lng }))
        .catch(() => {})
        .finally(() => setFallbackLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.error, geo.coords]);

  // Reverse-geocode for a friendly location label instead of raw coordinates.
  const placeLabel = useQuery({
    queryKey: ["reverse-geocode", geo.coords?.lat, geo.coords?.lng],
    queryFn: () =>
      reverseFn({ data: { lat: geo.coords!.lat, lng: geo.coords!.lng } }),
    enabled: !!geo.coords,
    staleTime: 30 * 60 * 1000,
  });

  // Live suggestions as the user types a favorite (e.g. "lidl") — pulls the
  // nearest real matches via Google Places, ranked by distance.
  const [debouncedName, setDebouncedName] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedName(name.trim()), 350);
    return () => window.clearTimeout(t);
  }, [name]);

  const nameSuggest = useQuery({
    queryKey: [
      "fav-suggest",
      debouncedName,
      geo.coords?.lat,
      geo.coords?.lng,
    ],
    queryFn: () =>
      textFn({
        data: {
          query: debouncedName,
          lat: geo.coords?.lat,
          lng: geo.coords?.lng,
          radius: 5000,
          maxResults: 4,
        },
      }),
    enabled: debouncedName.length >= 2 && !!geo.coords,
    staleTime: 5 * 60 * 1000,
  });

  const rankedSuggest = useMemo(() => {
    if (!nameSuggest.data || !geo.coords) return [];
    return [...nameSuggest.data]
      .map((p) => ({
        ...p,
        distance: distanceMeters(geo.coords as Coords, { lat: p.lat, lng: p.lng }),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  }, [nameSuggest.data, geo.coords]);

  const cat = SUNDAY_CATEGORIES.find((c) => c.id === activeCat)!;
  const nearbyFn = useServerFn(searchNearbyPlaces);

  const nearby = useQuery({
    queryKey: ["nearby", activeCat, geo.coords?.lat, geo.coords?.lng],
    queryFn: () =>
      nearbyFn({
        data: {
          lat: geo.coords!.lat,
          lng: geo.coords!.lng,
          includedTypes: cat.placeTypes,
          radius: 2500,
          maxResults: 12,
        },
      }),
    enabled: !!geo.coords,
    staleTime: 10 * 60 * 1000,
  });

  const withDistance = useMemo(() => {
    if (!nearby.data || !geo.coords) return [];
    return nearby.data
      .map((p) => ({
        ...p,
        distance: distanceMeters(geo.coords as Coords, { lat: p.lat, lng: p.lng }),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [nearby.data, geo.coords]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setFavs((prev) => [
      ...prev,
      {
        id: newId(),
        name: name.trim(),
        category,
        note: note.trim(),
        mapsUri: mapsSearchUrl(name.trim()),
      },
    ]);
    setName("");
    setNote("");
  };

  const saveFromNearby = (place: NearbyPlace) => {
    setFavs((prev) => [
      ...prev,
      {
        id: newId(),
        name: place.name,
        category: activeCat,
        note: place.address,
        mapsUri: place.mapsUri || mapsSearchUrl(place.name),
        address: place.address,
      },
    ]);
  };

  const saveSuggestion = (place: NearbyPlace) => {
    setFavs((prev) => [
      ...prev,
      {
        id: newId(),
        name: place.name,
        category,
        note: place.address,
        mapsUri: place.mapsUri || mapsSearchUrl(place.name),
        address: place.address,
      },
    ]);
    setName("");
    setNote("");
  };

  const remove = (id: string) =>
    setFavs((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <header className="px-5 pt-8 pb-6">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
          Sonntag in Deutschland
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-balance">
          Was in deiner Nähe trotzdem aufhat.
        </h1>
      </header>

      {/* Location banner */}
      <section className="px-5 mb-6">
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4 flex items-center gap-3 shadow-sm">
          <div className="size-9 rounded-lg bg-zinc-50 ring-1 ring-black/5 flex items-center justify-center">
            <MapPin className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              {geo.coords
                ? "Standort aktiv"
                : geo.loading
                  ? "Standort wird ermittelt…"
                  : "Standort teilen für Nahe-Suche"}
            </div>
            <div className="text-xs text-zinc-500 truncate">
              {geo.error
                ? geo.error
                : geo.coords
                  ? placeLabel.data?.label ??
                    (placeLabel.isLoading ? "Ort wird erkannt …" : `${geo.coords.lat.toFixed(3)}, ${geo.coords.lng.toFixed(3)}`)
                  : "Google Maps zeigt Läden im Umkreis von 2,5 km."}
            </div>
          </div>
          <button
            onClick={geo.request}
            disabled={geo.loading}
            className="bg-ink text-canvas rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
          >
            <LocateFixed className="size-3.5" />
            {geo.coords ? "Aktualisieren" : "Freigeben"}
          </button>
        </div>
      </section>

      {/* Category tabs */}
      <section className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2">
          {SUNDAY_CATEGORIES.map((c) => {
            const isActive = c.id === activeCat;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                  isActive
                    ? "bg-ink text-canvas ring-ink"
                    : "bg-white text-ink ring-black/5 hover:ring-black/10"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Category context card */}
      <section className="px-5 mb-6">
        <div className="bg-white p-4 rounded-xl ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">{cat.name}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {cat.hint}
            </span>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">{cat.detail}</p>
        </div>
      </section>

      {/* Nearby list */}
      <section className="px-5 mb-10">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
          In deiner Nähe
        </h3>

        {!geo.coords && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-center text-sm text-zinc-500">
            Standort freigeben, um {cat.name}s in der Nähe zu sehen.
          </div>
        )}

        {geo.coords && nearby.isLoading && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-center text-sm text-zinc-500">
            Suche {cat.name}s in der Nähe…
          </div>
        )}

        {geo.coords && nearby.isError && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-center text-sm text-red-600">
            Konnte nichts laden. Später nochmal versuchen.
          </div>
        )}

        {geo.coords && !nearby.isLoading && withDistance.length === 0 && !nearby.isError && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-6 text-center text-sm text-zinc-500">
            Nichts im 2,5-km-Umkreis. Versuche eine andere Kategorie.
          </div>
        )}

        {withDistance.length > 0 && (
          <ul className="bg-white rounded-2xl ring-1 ring-black/5 divide-y divide-zinc-100 overflow-hidden">
            {withDistance.map((p) => (
              <li key={p.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    {p.openNow === true && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                        offen
                      </span>
                    )}
                    {p.openNow === false && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                        geschlossen
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{p.address}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {formatDistance(p.distance)}
                    {p.typeLabel ? ` · ${p.typeLabel}` : ""}
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <a
                    href={p.mapsUri || mapsSearchUrl(p.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-ink text-canvas flex items-center gap-1"
                  >
                    <Navigation className="size-3" /> Route
                  </a>
                  <button
                    onClick={() => saveFromNearby(p)}
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-accent-yellow text-ink"
                  >
                    merken
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Favorites */}
      <section className="px-5">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
          Deine Favoriten
        </h3>

        {hydrated && !isAuthenticated && (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4 mb-4 flex items-start gap-3 shadow-sm">
            <div className="size-9 rounded-full bg-accent-yellow flex items-center justify-center shrink-0">
              <UserCircle2 className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold mb-0.5">
                Favoriten geräteübergreifend sichern
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                Erstelle ein Konto, um Lieblings-Läden zu speichern und überall
                wieder abzurufen.
              </p>
              <Link
                to="/account"
                className="inline-block bg-ink text-canvas text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg"
              >
                Konto erstellen
              </Link>
            </div>
          </div>
        )}

        {preferredBrand && geo.coords && (
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-1 flex items-center gap-1">
              <Sparkles className="size-3" /> Dein üblicher Laden ·{" "}
              <span className="capitalize">{preferredBrand}</span>
            </p>
            {preferredPlaces.isLoading && (
              <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4 text-xs text-zinc-500">
                Suche „{preferredBrand}“ in deiner Nähe …
              </div>
            )}
            {!preferredPlaces.isLoading && rankedPreferred.length === 0 && (
              <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4 text-xs text-zinc-500">
                Keine Filialen in 5 km gefunden.
              </div>
            )}
            {rankedPreferred.length > 0 && (
              <ul className="bg-white rounded-2xl ring-1 ring-black/5 divide-y divide-zinc-100 overflow-hidden">
                {rankedPreferred.map((p) => (
                  <li key={p.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{p.address}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {formatDistance(p.distance)}
                      </div>
                    </div>
                    <a
                      href={p.mapsUri || mapsSearchUrl(p.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-ink text-canvas flex items-center gap-1 shrink-0"
                    >
                      <Navigation className="size-3" /> Route
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form
          onSubmit={add}
          className="bg-white rounded-2xl ring-1 ring-black/5 p-4 shadow-sm space-y-3 mb-4"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Späti Rosenthaler Ecke"
            className="w-full bg-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink placeholder:text-zinc-400"
          />
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 bg-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
            >
              {SUNDAY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="bis 22:00"
              className="flex-1 bg-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink placeholder:text-zinc-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent-yellow text-ink rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="size-4" /> Favorit speichern
          </button>
        </form>

        {debouncedName.length >= 2 && geo.coords && (
          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-1">
              Nächste Treffer für „{debouncedName}“
            </div>
            {nameSuggest.isLoading && (
              <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4 text-xs text-zinc-500">
                Suche in deiner Nähe …
              </div>
            )}
            {!nameSuggest.isLoading && rankedSuggest.length === 0 && (
              <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4 text-xs text-zinc-500">
                Keine Treffer im 5-km-Umkreis.
              </div>
            )}
            {rankedSuggest.length > 0 && (
              <ul className="bg-white rounded-2xl ring-1 ring-black/5 divide-y divide-zinc-100 overflow-hidden">
                {rankedSuggest.map((p) => (
                  <li key={p.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{p.address}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {formatDistance(p.distance)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <a
                        href={p.mapsUri || mapsSearchUrl(p.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-ink text-canvas flex items-center gap-1"
                      >
                        <Navigation className="size-3" /> Route
                      </a>
                      <button
                        onClick={() => saveSuggestion(p)}
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-accent-yellow text-ink"
                      >
                        merken
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {favs.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            Noch keine Favoriten. Tippe oben auf <b>merken</b> oder speichere manuell.
          </p>
        ) : (
          <ul className="bg-white rounded-2xl ring-1 ring-black/5 divide-y divide-zinc-100">
            {favs.map((f) => {
              const c = SUNDAY_CATEGORIES.find((x) => x.id === f.category);
              const uri = f.mapsUri || mapsSearchUrl(f.name);
              return (
                <li key={f.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="size-8 bg-zinc-50 rounded-lg flex items-center justify-center ring-1 ring-black/5 font-display italic text-sm">
                    {c?.glyph ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <div className="text-xs text-zinc-500 truncate">
                      {c?.name}
                      {f.note ? ` · ${f.note}` : ""}
                    </div>
                  </div>
                  <a
                    href={uri}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-ink text-canvas flex items-center gap-1"
                    aria-label="Route öffnen"
                  >
                    <Navigation className="size-3" /> Route
                  </a>
                  <button
                    onClick={() => remove(f.id)}
                    className="text-zinc-300 hover:text-zinc-600"
                    aria-label="Entfernen"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <BottomNav />
    </div>
  );
}