import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Share2, ListPlus, Check } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { SHOPPING_PRESETS } from "@/lib/sunday-data";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  formatListForShare,
  getActiveList,
  newId,
  newList,
  type ShoppingItem,
  type ShoppingList,
} from "@/lib/shopping-lists";

export const Route = createFileRoute("/shopping")({
  head: () => ({
    meta: [
      { title: "Einkaufslisten — Sonntagsruhe Planner" },
      {
        name: "description",
        content:
          "Mehrere benannte Einkaufslisten für Brunch, Grill, Wocheneinkauf — mit Presets und Teilen-Funktion.",
      },
      { property: "og:title", content: "Einkaufslisten — Sonntagsruhe" },
      {
        property: "og:description",
        content: "Panik-Score, Kategorien, Presets, Teilen. Damit du nichts vergisst.",
      },
    ],
  }),
  component: ShoppingPage,
});

function ShoppingPage() {
  const [lists, setLists] = useLocalStorage<ShoppingList[]>(
    "sonntag.lists",
    [],
  );
  const [activeId, setActiveId] = useLocalStorage<string | null>(
    "sonntag.activeListId",
    null,
  );
  const [draft, setDraft] = useState("");
  const [newListName, setNewListName] = useState("");
  const [newListTag, setNewListTag] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const active = getActiveList(lists, activeId);

  const createList = (name: string, tag: string) => {
    const list = newList(name, tag);
    setLists((prev) => [...prev, list]);
    setActiveId(list.id);
    setNewListName("");
    setNewListTag("");
    setShowNewForm(false);
    return list;
  };

  const ensureActive = (): ShoppingList => {
    if (active) return active;
    return createList("Standard", "Wocheneinkauf");
  };

  const updateActive = (updater: (l: ShoppingList) => ShoppingList) => {
    const target = ensureActive();
    setLists((prev) =>
      prev.map((l) => (l.id === target.id ? updater(l) : l)),
    );
  };

  const add = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    updateActive((l) => ({
      ...l,
      items: [...l.items, { id: newId(), text: clean, done: false } satisfies ShoppingItem],
    }));
  };

  const toggle = (id: string) =>
    updateActive((l) => ({
      ...l,
      items: l.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    }));

  const remove = (id: string) =>
    updateActive((l) => ({
      ...l,
      items: l.items.filter((i) => i.id !== id),
    }));

  const loadPreset = (presetItems: string[]) => {
    updateActive((l) => {
      const existing = new Set(l.items.map((i) => i.text.toLowerCase()));
      const additions = presetItems
        .filter((t) => !existing.has(t.toLowerCase()))
        .map<ShoppingItem>((text) => ({ id: newId(), text, done: false }));
      return { ...l, items: [...l.items, ...additions] };
    });
  };

  const deleteList = (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const shareActive = async () => {
    if (!active) return;
    const text = formatListForShare(active);
    const title = active.name;
    try {
      // Web Share API works on iOS, Android, and modern desktop browsers.
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ title, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareToast("In die Zwischenablage kopiert");
      setTimeout(() => setShareToast(null), 2500);
    } catch {
      // user cancelled or share failed — do nothing loud
    }
  };

  const items = active?.items ?? [];
  const openCount = items.filter((i) => !i.done).length;

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <header className="px-5 pt-8 pb-6">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
          Wocheneinkauf
        </p>
        <h1 className="text-2xl font-medium tracking-tight">
          {active
            ? openCount === 0 && items.length > 0
              ? "Alles im Kasten."
              : items.length === 0
                ? "Los geht's."
                : `${openCount} ${openCount === 1 ? "Ding" : "Dinge"} fehlen noch.`
            : "Deine Listen."}
        </h1>
      </header>

      {/* List switcher */}
      <section className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2">
          {lists.map((l) => {
            const isActive = active?.id === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setActiveId(l.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                  isActive
                    ? "bg-ink text-canvas ring-ink"
                    : "bg-white text-ink ring-black/5 hover:ring-black/10"
                }`}
              >
                {l.name}
                {l.tag && (
                  <span
                    className={`ml-2 text-[10px] uppercase tracking-wider ${
                      isActive ? "text-canvas/70" : "text-zinc-500"
                    }`}
                  >
                    {l.tag}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => setShowNewForm((s) => !s)}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-medium bg-accent-yellow text-ink flex items-center gap-1"
          >
            <ListPlus className="size-4" /> Neue Liste
          </button>
        </div>

        {showNewForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newListName.trim()) return;
              createList(newListName, newListTag);
            }}
            className="mt-3 bg-white rounded-2xl ring-1 ring-black/5 p-3 flex gap-2 shadow-sm"
          >
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Listen-Name"
              className="flex-1 min-w-0 bg-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink placeholder:text-zinc-400"
              autoFocus
            />
            <input
              value={newListTag}
              onChange={(e) => setNewListTag(e.target.value)}
              placeholder="Tag (Grill …)"
              className="w-28 bg-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="bg-ink text-canvas rounded-lg px-3 text-sm font-medium flex items-center"
              aria-label="Liste erstellen"
            >
              <Check className="size-4" />
            </button>
          </form>
        )}
      </section>

      {/* Active list controls */}
      {active && (
        <>
          <section className="px-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{active.name}</h2>
                {active.tag && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                    {active.tag}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={shareActive}
                  className="p-2 rounded-lg bg-white ring-1 ring-black/5 hover:ring-black/10"
                  aria-label="Liste teilen"
                  title="Liste teilen"
                >
                  <Share2 className="size-4" />
                </button>
                <button
                  onClick={() => deleteList(active.id)}
                  className="p-2 rounded-lg bg-white ring-1 ring-black/5 hover:ring-black/10 text-zinc-500"
                  aria-label="Liste löschen"
                  title="Liste löschen"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

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

            {shareToast && (
              <p className="mt-2 text-xs text-zinc-500 text-center">{shareToast}</p>
            )}
          </section>

          <section className="px-5 mb-8">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Presets zur Liste hinzufügen
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
                Diese Liste ist leer. Wähle ein Preset oder tippe etwas oben ein.
              </div>
            ) : (
              <ul className="bg-white rounded-2xl ring-1 ring-black/5 divide-y divide-zinc-100">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => toggle(item.id)}
                      aria-label={
                        item.done ? "Als offen markieren" : "Als erledigt markieren"
                      }
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
        </>
      )}

      {!active && (
        <section className="px-5">
          <div className="bg-white rounded-2xl ring-1 ring-black/5 p-8 text-center text-sm text-zinc-500">
            Noch keine Liste. Tippe oben auf <b>Neue Liste</b>, um zu starten.
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  );
}