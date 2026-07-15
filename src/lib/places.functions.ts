import { createServerFn } from "@tanstack/react-start";

export type NearbyPlace = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  openNow: boolean | null;
  hours: string[];
  mapsUri: string;
  typeLabel: string;
  /** Minutes until the store closes today, when known and currently open. */
  closesInMinutes: number | null;
};

type PlacesResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
    currentOpeningHours?: {
      openNow?: boolean;
      periods?: Array<{
        open?: { day?: number; hour?: number; minute?: number };
        close?: { day?: number; hour?: number; minute?: number };
      }>;
    };
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    googleMapsUri?: string;
    primaryTypeDisplayName?: { text?: string };
  }>;
};

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.currentOpeningHours.openNow",
  "places.currentOpeningHours.periods",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.googleMapsUri",
  "places.primaryTypeDisplayName",
].join(",");

const GATEWAY_URL =
  "https://connector-gateway.lovable.dev/google_maps/places/v1/places:searchNearby";

function normalize(json: PlacesResponse): NearbyPlace[] {
  return (json.places ?? [])
    .map((p) => {
      const openNow = p.currentOpeningHours?.openNow ?? null;
      let closesInMinutes: number | null = null;
      if (openNow && p.currentOpeningHours?.periods) {
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const nowDay = now.getDay(); // Google uses 0=Sunday, matches JS
        let best: number | null = null;
        for (const per of p.currentOpeningHours.periods) {
          const c = per.close;
          if (!c || typeof c.hour !== "number") continue;
          const cDay = c.day ?? nowDay;
          const cMin = c.hour * 60 + (c.minute ?? 0);
          let delta = (cDay - nowDay) * 1440 + cMin - nowMin;
          if (delta < 0) delta += 7 * 1440;
          if (delta >= 0 && (best === null || delta < best)) best = delta;
        }
        closesInMinutes = best;
      }
      return {
        id: p.id ?? "",
        name: p.displayName?.text ?? "",
        address: p.formattedAddress ?? "",
        lat: p.location?.latitude ?? 0,
        lng: p.location?.longitude ?? 0,
        openNow,
        hours: p.regularOpeningHours?.weekdayDescriptions ?? [],
        mapsUri: p.googleMapsUri ?? "",
        typeLabel: p.primaryTypeDisplayName?.text ?? "",
        closesInMinutes,
      };
    })
    .filter((p) => p.id && p.name);
}

export const searchNearbyPlaces = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      lat: number;
      lng: number;
      includedTypes: string[];
      radius?: number;
      maxResults?: number;
      languageCode?: string;
    }) => {
      if (typeof data.lat !== "number" || typeof data.lng !== "number") {
        throw new Error("lat/lng required");
      }
      if (!Array.isArray(data.includedTypes) || data.includedTypes.length === 0) {
        throw new Error("includedTypes required");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !gmKey) {
      throw new Error("Google Maps connector credentials missing");
    }

    const body = {
      includedTypes: data.includedTypes,
      maxResultCount: Math.min(Math.max(data.maxResults ?? 12, 1), 20),
      languageCode: data.languageCode ?? "de",
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: { latitude: data.lat, longitude: data.lng },
          radius: Math.min(Math.max(data.radius ?? 2500, 100), 50000),
        },
      },
    };

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmKey,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Places searchNearby failed [${response.status}]: ${errText}`);
      throw new Error(`Places request failed [${response.status}]`);
    }

    const json = (await response.json()) as PlacesResponse;
    return normalize(json);
  });

const GEOCODE_URL =
  "https://connector-gateway.lovable.dev/google_maps/maps/api/geocode/json";

export const geocodeCity = createServerFn({ method: "POST" })
  .inputValidator((data: { city: string }) => {
    if (typeof data.city !== "string" || !data.city.trim()) {
      throw new Error("city required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !gmKey) {
      throw new Error("Google Maps connector credentials missing");
    }

    const url = `${GEOCODE_URL}?address=${encodeURIComponent(data.city.trim())}&language=de`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmKey,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Geocode failed [${response.status}]: ${errText}`);
      throw new Error(`Geocode request failed [${response.status}]`);
    }

    const json = (await response.json()) as {
      status?: string;
      results?: Array<{
        formatted_address?: string;
        geometry?: { location?: { lat?: number; lng?: number } };
      }>;
    };

    const hit = json.results?.[0];
    const loc = hit?.geometry?.location;
    if (!hit || typeof loc?.lat !== "number" || typeof loc?.lng !== "number") {
      throw new Error(`Keine Koordinaten für „${data.city}“ gefunden`);
    }
    return {
      lat: loc.lat,
      lng: loc.lng,
      formatted: hit.formatted_address ?? data.city,
    };
  });

export const reverseGeocode = createServerFn({ method: "POST" })
  .inputValidator((data: { lat: number; lng: number }) => {
    if (typeof data.lat !== "number" || typeof data.lng !== "number") {
      throw new Error("lat/lng required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !gmKey) {
      throw new Error("Google Maps connector credentials missing");
    }
    const url = `${GEOCODE_URL}?latlng=${data.lat},${data.lng}&language=de&result_type=neighborhood|locality|postal_town|sublocality`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmKey,
      },
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error(`Reverse geocode failed [${response.status}]: ${errText}`);
      throw new Error(`Reverse geocode failed [${response.status}]`);
    }
    const json = (await response.json()) as {
      results?: Array<{
        formatted_address?: string;
        address_components?: Array<{ long_name?: string; types?: string[] }>;
      }>;
    };
    const hit = json.results?.[0];
    // Prefer neighborhood/locality name if we can find one.
    const comps = hit?.address_components ?? [];
    const preferred =
      comps.find((c) => c.types?.includes("neighborhood"))?.long_name ||
      comps.find((c) => c.types?.includes("sublocality"))?.long_name ||
      comps.find((c) => c.types?.includes("locality"))?.long_name ||
      comps.find((c) => c.types?.includes("postal_town"))?.long_name;
    return {
      label: preferred ?? hit?.formatted_address ?? "Unbekannter Ort",
      formatted: hit?.formatted_address ?? "",
    };
  });

const TEXT_GATEWAY_URL =
  "https://connector-gateway.lovable.dev/google_maps/places/v1/places:searchText";

export const searchTextPlaces = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      query: string;
      lat?: number;
      lng?: number;
      radius?: number;
      maxResults?: number;
      languageCode?: string;
    }) => {
      if (typeof data.query !== "string" || !data.query.trim()) {
        throw new Error("query required");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey || !gmKey) {
      throw new Error("Google Maps connector credentials missing");
    }

    const body: Record<string, unknown> = {
      textQuery: data.query.trim(),
      maxResultCount: Math.min(Math.max(data.maxResults ?? 5, 1), 10),
      languageCode: data.languageCode ?? "de",
    };
    if (typeof data.lat === "number" && typeof data.lng === "number") {
      body.locationBias = {
        circle: {
          center: { latitude: data.lat, longitude: data.lng },
          radius: Math.min(Math.max(data.radius ?? 5000, 100), 50000),
        },
      };
    }

    const response = await fetch(TEXT_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmKey,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Places searchText failed [${response.status}]: ${errText}`);
      throw new Error(`Places request failed [${response.status}]`);
    }

    const json = (await response.json()) as PlacesResponse;
    return normalize(json);
  });