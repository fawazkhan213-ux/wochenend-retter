import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { SHOPPING_PRESETS } from "@/lib/sunday-data";
import { useLocalStorage } from "@/lib/useLocalStorage";

type ShoppingItem = { id: string; text: string; done: boolean };

export const Route = createFileRoute("/shopping")({
  head: () => ({
    meta: [
      { title: "Einkaufsliste — Sonntagsruhe Planner" },
      {
        name: "description",
        content:
          "Deine Samstag-Einkaufsliste mit Presets für Brunch, Grillabend, Netflix-Sonntag.",
      },
      { property: "og:title", content: "Einkaufsliste — Sonntagsruhe" },
      {
        property: "og:description",
        content: "Panik-Score, Kategorien, Presets. Damit du nichts vergisst.",
      },
    ],
  }),
  component: ShoppingPage,
});

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function ShoppingPage() {
  const [items, setItems] = useLocalStorage<ShoppingItem[]>(
    "sonntag.shopping",
    [],
  );
  const [draft, setDraft] = useState("");

  const add = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setItems((prev) => [...prev, { id: newId(), text: clean, done: false }]);
  };

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    );

  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const loadPreset = (presetItems: string[]) => {
    const existing = new Set(items.map((i) => i.text.toLowerCase()));
    const additions = presetItems
      .filter((t) => !existing.has(t.toLowerCase()))
      .map((text) => ({ id: newId(), text, done: false }));
    setItems((prev) => [...prev, ...additions]);
  };

  const openCount = items.filter((i) => !i.done).length;

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <header className="px-5 pt-8 pb-6">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
          Wocheneinkauf
        </p>
        <h1 className="text-2xl font-medium tracking-tight">
          {openCount === 0
            ? "Alles im Kasten."
            : `${openCount} ${openCount === 1 ? "Ding" : "Dinge"} fehlen noch.`}
        </h1>
      </header>

      <section className="px-5 mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add(draft);
            setDraft("");
          }}
          className="flex gap-2 bg-white p-2 rounded-2xl ring-1 ring-black/5 shadow-sm"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="z. B. Sonntagsbrötchen"
            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="bg-ink text-canvas rounded-xl p-2 flex items-center justify-center"
            aria-label="Hinzufügen"
          >
            <Plus className="size-4" />
          </button>
        </form>
      </section>

      <section className="px-5 mb-8">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Presets
        </h3>
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2">
          {SHOPPING_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.items)}
              className="shrink-0 bg-white ring-1 ring-black/5 hover:ring-black/10 rounded-full px-4 py-2 text-sm font-medium"
            >
              + {p.name}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-8 text-center text-sm text-zinc-500">
            Deine Liste ist leer. Wähle ein Preset oder tippe etwas oben ein.
          </div>
        ) : (
          <ul className="bg-white rounded-2xl ring-1 ring-black/5 divide-y divide-zinc-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggle(item.id)}
                  aria-label={item.done ? "Als offen markieren" : "Als erledigt markieren"}
                  className={`size-5 rounded-sm border flex items-center justify-center transition ${
                    item.done
                      ? "bg-ink border-ink text-canvas"
                      : "border-zinc-300"
                  }`}
                >
                  {item.done && (
                    <svg viewBox="0 0 12 12" className="size-3">
                      <path
                        d="M2 6l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    item.done ? "text-zinc-400 line-through" : ""
                  }`}
                >
                  {item.text}
                </span>
                <button
                  onClick={() => remove(item.id)}
                  className="text-zinc-300 hover:text-zinc-600"
                  aria-label="Entfernen"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <BottomNav />
    </div>
  );
}