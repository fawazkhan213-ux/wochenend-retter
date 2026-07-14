import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

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

export default defineTool({
  name: "find_open_stores_nearby",
  title: "Find stores open now near a location",
  description:
    "Search stores (supermarkets, bakeries, kiosks, petrol stations) near coordinates in Germany and report which are open right now. Useful for planning a Sunday run.",
  inputSchema: {
    latitude: z.number().min(-90).max(90).describe("Latitude in decimal degrees."),
    longitude: z.number().min(-180).max(180).describe("Longitude in decimal degrees."),
    radiusMeters: z
      .number()
      .int()
      .min(100)
      .max(50000)
      .optional()
      .describe("Search radius in meters (default 3000)."),
    query: z
      .string()
      .optional()
      .describe("Optional store name filter to prefer, e.g. 'REWE', 'Bäckerei'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ latitude, longitude, radiusMeters, query }) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return { content: [{ type: "text", text: "Google Maps key missing" }], isError: true };
    }
    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        includedTypes: [
          "supermarket",
          "grocery_store",
          "convenience_store",
          "bakery",
          "gas_station",
        ],
        maxResultCount: 15,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: radiusMeters ?? 3000,
          },
        },
      }),
    });
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Places API failed: ${res.status}` }],
        isError: true,
      };
    }
    const json = (await res.json()) as {
      places?: Array<Record<string, unknown>>;
    };
    const q = query?.toLowerCase().trim();
    const places = (json.places ?? [])
      .map((p) => {
        const name = (p.displayName as { text?: string } | undefined)?.text ?? "";
        return {
          name,
          address: (p.formattedAddress as string) ?? "",
          openNow:
            (p.currentOpeningHours as { openNow?: boolean } | undefined)?.openNow ??
            null,
          hours:
            (p.regularOpeningHours as { weekdayDescriptions?: string[] } | undefined)
              ?.weekdayDescriptions ?? [],
          mapsUri: (p.googleMapsUri as string) ?? "",
          type:
            (p.primaryTypeDisplayName as { text?: string } | undefined)?.text ?? "",
        };
      })
      .filter((p) => p.name && (!q || p.name.toLowerCase().includes(q)));

    return {
      content: [{ type: "text", text: JSON.stringify(places, null, 2) }],
      structuredContent: { places },
    };
  },
});