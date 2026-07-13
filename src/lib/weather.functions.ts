import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Open-Meteo — free, no API key. We geocode the city, then fetch a compact
// daily forecast for the next Sunday. Called from the /plan route via useQuery.

const InputSchema = z.object({
  city: z.string().min(1).max(80),
});

type GeocodeResult = {
  results?: { latitude: number; longitude: number; name: string; country?: string }[];
};

type ForecastResult = {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    precipitation_probability_max?: number[];
  };
};

export type SundayWeather = {
  city: string;
  country?: string;
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitation: number;
  summary: string;
  vibe: "sunny" | "cloudy" | "rainy";
};

function summarize(code: number): { summary: string; vibe: SundayWeather["vibe"] } {
  // https://open-meteo.com/en/docs
  if (code === 0) return { summary: "Sonnig", vibe: "sunny" };
  if (code <= 2) return { summary: "Heiter", vibe: "sunny" };
  if (code === 3) return { summary: "Bewölkt", vibe: "cloudy" };
  if (code <= 48) return { summary: "Nebel", vibe: "cloudy" };
  if (code <= 67) return { summary: "Regen", vibe: "rainy" };
  if (code <= 77) return { summary: "Schnee", vibe: "cloudy" };
  if (code <= 82) return { summary: "Schauer", vibe: "rainy" };
  if (code <= 99) return { summary: "Gewitter", vibe: "rainy" };
  return { summary: "Wechselhaft", vibe: "cloudy" };
}

function nextSundayISO(): string {
  const now = new Date();
  const daysUntilSun = (7 - now.getDay()) % 7;
  const target = new Date(now);
  target.setDate(now.getDate() + (daysUntilSun === 0 ? 0 : daysUntilSun));
  return target.toISOString().slice(0, 10);
}

export const getSundayWeather = createServerFn({ method: "GET" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<SundayWeather | null> => {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", data.city);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "de");
    geoUrl.searchParams.set("format", "json");

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) return null;
    const geo = (await geoRes.json()) as GeocodeResult;
    const place = geo.results?.[0];
    if (!place) return null;

    const sundayISO = nextSundayISO();
    const fUrl = new URL("https://api.open-meteo.com/v1/forecast");
    fUrl.searchParams.set("latitude", String(place.latitude));
    fUrl.searchParams.set("longitude", String(place.longitude));
    fUrl.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max",
    );
    fUrl.searchParams.set("timezone", "Europe/Berlin");
    fUrl.searchParams.set("start_date", sundayISO);
    fUrl.searchParams.set("end_date", sundayISO);

    const fRes = await fetch(fUrl);
    if (!fRes.ok) return null;
    const forecast = (await fRes.json()) as ForecastResult;
    const daily = forecast.daily;
    if (!daily || !daily.time?.length) return null;

    const code = daily.weathercode[0];
    const { summary, vibe } = summarize(code);
    return {
      city: place.name,
      country: place.country,
      date: daily.time[0],
      tempMax: Math.round(daily.temperature_2m_max[0]),
      tempMin: Math.round(daily.temperature_2m_min[0]),
      weatherCode: code,
      precipitation: daily.precipitation_probability_max?.[0] ?? 0,
      summary,
      vibe,
    };
  });