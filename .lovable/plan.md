
# Sonntagsruhe Planner

A mobile-first web app that helps people in Germany survive the "everything is closed on Sunday" reality: plan your Saturday shop, find what IS open on Sunday (Spätis, Tankstellen, Bahnhof-Rewe, Bäckereien), and get inspiration for Sunday activities.

## Core features (v1)

1. **Saturday Shopping List**
   - Add items you'll need for the weekend, grouped by category (Frühstück, Abendessen, Getränke, Haushalt).
   - "Panic score" that grows as Saturday afternoon approaches and items are still unchecked.
   - Quick-add presets: "Brunch für 4", "Grillabend", "Netflix-Abend".

2. **Sunday Open Now**
   - Curated list of place types that are typically open on Sunday: Spätis, Tankstellen, Bahnhof-Supermärkte, Bäckereien (Sonntagsbrötchen), Apotheken-Notdienst, Blumenläden.
   - User adds their city; app shows category tiles with tips ("Bahnhof Rewe: bis 22 Uhr, meist teurer").
   - Users can save personal favorites ("mein Späti um die Ecke").

3. **Sunday Activity Planner**
   - Weather-aware suggestions (sunny → Park, Biergarten, Flohmarkt; rainy → Museum, Café, Kino, Brettspiele).
   - Curated Sunday-friendly ideas: Spaziergang, Tatort um 20:15, Brunch, Wandern, Museums-Sonntag.
   - Save a plan for the upcoming Sunday.

4. **Weekend Dashboard (home)**
   - Countdown to "Ladenschluss Samstag" (Saturday 20:00 for most Bundesländer).
   - Today's status: "Es ist Sonntag — Ruhetag" with quick access to what's open + your plan.
   - Ruhezeiten reminder card (no laundry, no drilling on Sundays).

## Out of scope for v1

- No real-time store hours API integration (curated categories + user-added favorites instead).
- No accounts / cloud sync — everything stored locally in the browser.
- No maps integration (can be added later).

## Technical approach

- **Stack**: TanStack Start (already scaffolded), Tailwind v4, shadcn components.
- **Routes**:
  - `/` — Weekend Dashboard with countdown + status card.
  - `/shopping` — Saturday shopping list with categories + presets.
  - `/open-sunday` — Category tiles + user favorites.
  - `/plan` — Sunday activity planner with weather-based suggestions.
  - Each route gets its own `head()` with unique title + description.
- **State**: `localStorage` (shopping items, favorites, saved Sunday plans, city). Read inside `useEffect` to avoid SSR hydration mismatches.
- **Weather**: free Open-Meteo API (no key needed) called from a `createServerFn`, keyed by city → lat/lon via their geocoding endpoint.
- **Time logic**: small util that returns `{ weekday, hoursUntilLadenschluss, isSonntag }` used by the dashboard.
- **Design direction**: warm, cozy, slightly playful German-feel — think Sunday morning light, Brötchen, a bit of Tatort dusk. I'll generate 3 design directions before building so you can pick the vibe.

## Build order

1. Generate 3 design directions → you pick one.
2. Set up routes, shared layout, nav, metadata.
3. Weekend Dashboard with live countdown.
4. Shopping list with presets + panic score.
5. Open-on-Sunday categories + favorites.
6. Sunday planner with Open-Meteo weather + suggestions.
7. Polish: empty states, mobile nav, small delight animations.

Approve this and I'll start with the design directions.
