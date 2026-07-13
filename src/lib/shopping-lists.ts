export type ShoppingItem = {
  id: string;
  text: string;
  done: boolean;
  price?: number; // EUR, optional per-item price
};

export type ShoppingList = {
  id: string;
  name: string;
  tag: string; // freeform label, e.g. "Brunch", "Grill"
  createdAt: number;
  items: ShoppingItem[];
};

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function newList(name: string, tag = ""): ShoppingList {
  return {
    id: newId(),
    name: name.trim() || "Neue Liste",
    tag: tag.trim(),
    createdAt: Date.now(),
    items: [],
  };
}

// Resolve the currently-active list, falling back to the most recently
// created one so callers always render something when at least one exists.
export function getActiveList(
  lists: ShoppingList[],
  activeId: string | null,
): ShoppingList | null {
  if (lists.length === 0) return null;
  const hit = activeId ? lists.find((l) => l.id === activeId) : null;
  return hit ?? lists[lists.length - 1] ?? null;
}

// Plain-text export used by Web Share API and the clipboard fallback.
export function formatListForShare(list: ShoppingList): string {
  const header = list.tag ? `${list.name} (${list.tag})` : list.name;
  const body = list.items
    .map(
      (i) =>
        `${i.done ? "✓" : "•"} ${i.text}${
          typeof i.price === "number" ? ` — ${i.price.toFixed(2)} €` : ""
        }`,
    )
    .join("\n");
  const total = list.items.reduce(
    (sum, i) => sum + (typeof i.price === "number" ? i.price : 0),
    0,
  );
  const footer = total > 0 ? `\nSumme: ${total.toFixed(2)} €` : "";
  return `${header}\n\n${body || "(leer)"}${footer}\n\n— Sonntagsruhe Planner`;
}