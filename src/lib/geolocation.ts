import { useCallback, useEffect, useState } from "react";

export type Coords = { lat: number; lng: number };

type State = {
  coords: Coords | null;
  error: string | null;
  loading: boolean;
};

const STORAGE_KEY = "sonntag.coords";
const MAX_AGE_MS = 30 * 60 * 1000;

type Stored = { coords: Coords; savedAt: number };

function readStored(): Stored | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useGeolocation() {
  const [state, setState] = useState<State>({
    coords: null,
    error: null,
    loading: false,
  });

  // Rehydrate cached coords on mount so pages that need location don't have
  // to prompt again on every navigation.
  useEffect(() => {
    const stored = readStored();
    if (stored) setState({ coords: stored.coords, error: null, loading: false });
  }, []);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({ coords: null, error: "Standort nicht verfügbar", loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ coords, savedAt: Date.now() } satisfies Stored),
          );
        } catch {
          // ignore quota
        }
        setState({ coords, error: null, loading: false });
      },
      (err) => {
        setState({
          coords: null,
          error:
            err.code === err.PERMISSION_DENIED
              ? "Standort-Freigabe abgelehnt"
              : "Standort konnte nicht ermittelt werden",
          loading: false,
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState({ coords: null, error: null, loading: false });
  }, []);

  return { ...state, request, clear };
}

// Convenience: haversine distance in meters — used to sort/label nearby places.
export function distanceMeters(a: Coords, b: Coords): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

// Build a Google Maps search URL for a place name / address. No API call
// needed — works from any device with Google Maps installed or the web app.
export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}