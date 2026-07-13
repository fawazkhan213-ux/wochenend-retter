// Client-side history + price memory for shopping items.
// Persisted in localStorage; used to power "häufig gekauft" chips and
// price prefill in the shopping page.

export type HistoryEntry = { text: string; count: number; lastAt: number };
export type PriceEntry = { avg: number; last: number; count: number };
export type PriceMemory = Record<string, PriceEntry>;

export function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

export function recordAddition(
  history: HistoryEntry[],
  text: string,
): HistoryEntry[] {
  const key = normalizeText(text);
  if (!key) return history;
  const idx = history.findIndex((h) => normalizeText(h.text) === key);
  if (idx === -1) {
    return [...history, { text: text.trim(), count: 1, lastAt: Date.now() }];
  }
  const next = [...history];
  next[idx] = {
    ...next[idx],
    count: next[idx].count + 1,
    lastAt: Date.now(),
  };
  return next;
}

export function topFrequent(
  history: HistoryEntry[],
  excludeTexts: string[],
  limit = 5,
): HistoryEntry[] {
  const excluded = new Set(excludeTexts.map(normalizeText));
  return history
    .filter((h) => h.count >= 2 && !excluded.has(normalizeText(h.text)))
    .sort((a, b) => b.count - a.count || b.lastAt - a.lastAt)
    .slice(0, limit);
}

export function recordPrice(
  memory: PriceMemory,
  text: string,
  price: number,
): PriceMemory {
  const key = normalizeText(text);
  if (!key || !isFinite(price) || price <= 0) return memory;
  const prev = memory[key];
  if (!prev) {
    return { ...memory, [key]: { avg: price, last: price, count: 1 } };
  }
  const count = prev.count + 1;
  const avg = (prev.avg * prev.count + price) / count;
  return { ...memory, [key]: { avg, last: price, count } };
}

export function rememberedPrice(
  memory: PriceMemory,
  text: string,
): number | null {
  const entry = memory[normalizeText(text)];
  if (!entry) return null;
  // round to nearest 0.10 €
  return Math.round(entry.avg * 10) / 10;
}

export function formatEUR(value: number): string {
  return value.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}