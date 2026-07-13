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
};

type PlacesResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
    currentOpeningHours?: { openNow?: boolean };
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
  "places.regularOpeningHours.weekdayDescriptions",
  "places.googleMapsUri",
  "places.primaryTypeDisplayName",
].join(",");

const GATEWAY_URL =
  "https://connector-gateway.lovable.dev/google_maps/places/v1/places:searchNearby";

function normalize(json: PlacesResponse): NearbyPlace[] {
  return (json.places ?? [])
    .map((p) => ({
      id: p.id ?? "",
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? "",
      lat: p.location?.latitude ?? 0,
      lng: p.location?.longitude ?? 0,
      openNow: p.currentOpeningHours?.openNow ?? null,
      hours: p.regularOpeningHours?.weekdayDescriptions ?? [],
      mapsUri: p.googleMapsUri ?? "",
      typeLabel: p.primaryTypeDisplayName?.text ?? "",
    }))
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