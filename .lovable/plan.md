# Plan — Sonntagsruhe Planner: v3 features

## 1. Dashboard countdown box — unit toggle + weather

- Keep the current black card + display type. Add two small controls in the top-right:
  - **Unit toggle**: `Sek · Std · Tage` (segmented pill). Persist choice in `localStorage`.
    - `Sek` (default): keep current `HH:MM:SS`
    - `Std`: single big number = total hours remaining
    - `Tage`: single big number = days remaining (decimal like "2,3")
- **Weather chip** below the countdown, inside the same card: small row like `☀︎ 14° · leicht bewölkt · Berlin`. Reuse existing `getSundayWeather` server fn and the persisted `sonntag.city`. Falls back to "—" while loading. Muted zinc-400 text so it doesn't fight the numbers.

## 2. Shopping — AI item suggestions from history

- Track every added item in a new `sonntag.itemHistory` localStorage: `{ text, count, lastAt }`.
- Below the "add item" input in `/shopping`, show up to 5 chips: `häufig gekauft` — the top items by count (excluding items already on the active list). Tap → adds to the active list.
- Use Lovable AI (`google/gemini-3-flash-preview`) via a new `suggestItems` server fn: given the history + current list, returns 3 smart contextual suggestions ("You bought Milch 4× in last 3 weeks — nachfüllen?"). Show as a separate "Vorschläge" strip with a subtle sparkle icon. Cache result for 10 min per list.

## 3. Party popper when list is complete

- When the active list transitions from "at least one open" → "all done AND at least 1 item", fire a one-shot confetti burst (canvas-confetti or a small inline SVG-particles component — no dependency needed, ~40 lines).
- Also show a small toast/banner: `Alles erledigt für diese Woche 🎉`.
- Track a `celebratedListId` in state so it only fires once per completion event.

## 4. Prices + total + AI price memory

- Extend `ShoppingItem` with optional `price?: number` (EUR).
- Each row gets a compact price input (`0,00 €`, right-aligned, ~72px wide).
- Sticky footer above the bottom nav on `/shopping`: **Summe: 12,40 €** — sum of all items with a price.
- **Price memory**: new `sonntag.priceMemory` localStorage `{ [normalizedText]: { avg, last, count } }`. Update whenever a user sets a price. When adding a new item, prefill the price with the remembered average (rounded to nearest 0,10 €). Small "≈" prefix indicates it's a remembered guess until edited.
- Keep purely client-side; no server calls needed for price memory (AI feature only for suggestions in step 2).

## 5. Plan section — outing color palette

- Introduce a `data-theme="outing"` scope on the `/plan` root wrapper that overrides CSS variables locally in `src/styles.css`:
  - `--canvas`: warm sunlit cream (`oklch(0.97 0.03 90)`)
  - `--ink`: deep forest (`oklch(0.28 0.06 155)`)
  - Accent: golden-orange (`oklch(0.78 0.16 65)`)
  - Card surface: white with a faint peach tint
- Replace the dark misty park hero image with a bright outdoor illustration (generate new asset — sun-drenched meadow / picnic vibe, flat Bauhaus style).
- Update cards on `/plan` to use the new surface + accent so the whole page reads as "let's go outside", not "quiet ruin".
- Other routes stay on the original canvas.

## 6. Places to visit nearby (replaces current "In deiner Nähe" block)

- Remove the museum/cinema toggle + list on `/plan`.
- Add a dedicated **"Orte in deiner Nähe"** section:
  - One "Standort teilen" CTA if no coords.
  - Once we have coords: fetch a mixed set (park, museum, cafe, tourist_attraction) via existing `searchNearbyPlaces` — one call, `includedTypes` = all four.
  - Show as a horizontally-scrollable card row: each card = name, category glyph, distance, "Route öffnen" → opens Google Maps directions (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`), using existing `mapsSearchUrl`/we already have `mapsUri` from the server fn.
- Same section replaces the earlier removed UI; nothing else on the page depends on the old museum toggle.

## 7. Technical notes

- New files:
  - `src/lib/itemHistory.ts` (history + price memory helpers)
  - `src/lib/suggestions.functions.ts` (Lovable AI server fn)
  - `src/components/Confetti.tsx` (dependency-free particle burst)
- Edits:
  - `src/routes/index.tsx` — unit toggle, weather chip
  - `src/routes/shopping.tsx` — history chips, AI suggestions, prices, total, confetti
  - `src/routes/plan.tsx` — outing theme wrapper, new Places section, remove old nearby block
  - `src/styles.css` — `[data-theme="outing"]` overrides
  - `src/assets/` — new bright outdoor hero image (generated)
- No schema changes, no Cloud needed for this batch. Google Maps + Lovable AI Gateway are already connected.

Ready to build on approval.
