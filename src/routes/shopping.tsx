import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Share2, ListPlus, Check, Sparkles, Lock } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { Confetti } from "@/components/Confetti";
import { SHOPPING_PRESETS } from "@/lib/sunday-data";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useAuth } from "@/lib/useAuth";
import { saveDeletedList } from "@/lib/deleted-lists.functions";
import {
  formatListForShare,
  getActiveList,
  newId,
  newList,
  type ShoppingItem,
  type ShoppingList,
} from "@/lib/shopping-lists";
import {
  formatEUR,
  recordAddition,
  recordPrice,
  rememberedPrice,
  topFrequent,
  type HistoryEntry,
  type PriceMemory,
} from "@/lib/itemHistory";
import { suggestItems } from "@/lib/suggestions.functions";

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
  const { isAuthenticated } = useAuth();
  const saveDeletedFn = useServerFn(saveDeletedList);
  const [showGuestGate, setShowGuestGate] = useState(false);
  const [lists, setLists] = useLocalStorage<ShoppingList[]>(
    "sonntag.lists",
    [],
  );
  const [activeId, setActiveId] = useLocalStorage<string | null>(
    "sonntag.activeListId",
    null,
  );
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    "sonntag.itemHistory",
    [],
  );
  const [priceMemory, setPriceMemory] = useLocalStorage<PriceMemory>(
    "sonntag.priceMemory",
    {},
  );
  const [draft, setDraft] = useState("");
  const [newListName, setNewListName] = useState("");
  const [newListTag, setNewListTag] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState<number | null>(null);
  const [celebratedListId, setCelebratedListId] = useState<string | null>(null);

  const active = getActiveList(lists, activeId);

  const createList = (name: string, tag: string) => {
    // Soft-block: guests can create up to 2 lists. The 3rd requires an account.
    if (!isAuthenticated && lists.length >= 2) {
      setShowGuestGate(true);
      return null;
    }
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
    // ensureActive should always yield a list — bypass the guest cap
    // for the very first automatic list.
    const created = newList("Standard", "Wocheneinkauf");
    setLists((prev) => (prev.length === 0 ? [created] : prev));
    if (!activeId) setActiveId(created.id);
    return created;
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
    const guess = rememberedPrice(priceMemory, clean);
    updateActive((l) => ({
      ...l,
      items: [
        ...l.items,
        {
          id: newId(),
          text: clean,
          done: false,
          ...(guess != null ? { price: guess } : {}),
        } satisfies ShoppingItem,
      ],
    }));
    setHistory((h) => recordAddition(h, clean));
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

  const setPrice = (id: string, price: number | undefined) => {
    updateActive((l) => ({
      ...l,
      items: l.items.map((i) =>
        i.id === id
          ? { ...i, price: price != null && price > 0 ? price : undefined }
          : i,
      ),
    }));
    const item = active?.items.find((i) => i.id === id);
    if (item && price != null && price > 0) {
      setPriceMemory((m) => recordPrice(m, item.text, price));
    }
  };

  const loadPreset = (presetItems: string[]) => {
    updateActive((l) => {
      const existing = new Set(l.items.map((i) => i.text.toLowerCase()));
      const additions = presetItems
        .filter((t) => !existing.has(t.toLowerCase()))
        .map<ShoppingItem>((text) => {
          const guess = rememberedPrice(priceMemory, text);
          return {
            id: newId(),
            text,
            done: false,
            ...(guess != null ? { price: guess } : {}),
          };
        });
      return { ...l, items: [...l.items, ...additions] };
    });
    presetItems.forEach((t) => setHistory((h) => recordAddition(h, t)));
  };

  const deleteList = (id: string) => {
    const target = lists.find((l) => l.id === id);
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeId === id) setActiveId(null);
    if (target && isAuthenticated) {
      // fire-and-forget; the account page reads this back.
      saveDeletedFn({ data: { list: target } }).catch(() => {});
    }
  };

  const shareActive = async () => {
    if (!active) return;
    const text = formatListForShare(active);
    const title = active.name;
    try {
      const nav: Navigator | undefined =
        typeof navigator === "undefined" ? undefined : navigator;
      // Web Share API works on iOS, Android, and modern desktop browsers.
      if (nav && typeof nav.share === "function") {
        await nav.share({ title, text });
        return;
      }
      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(text);
        setShareToast("In die Zwischenablage kopiert");
        setTimeout(() => setShareToast(null), 2500);
      }
    } catch {
      // user cancelled or share failed — do nothing loud
    }
  };

  const items = active?.items ?? [];
  const openCount = items.filter((i) => !i.done).length;
  const total = items.reduce(
    (sum, i) => sum + (typeof i.price === "number" ? i.price : 0),
    0,
  );

  // Celebrate once when the active list fully completes.
  useEffect(() => {
    if (!active) return;
    if (items.length === 0) return;
    if (openCount === 0 && celebratedListId !== active.id) {
      setConfettiTrigger(Date.now());
      setCelebratedListId(active.id);
      const t = setTimeout(() => {}, 3000);
      return () => clearTimeout(t);
    }
    if (openCount > 0 && celebratedListId === active.id) {
      // reset if the user re-opens an item
      setCelebratedListId(null);
    }
  }, [active, items.length, openCount, celebratedListId]);

  const frequent = useMemo(
    () => topFrequent(history, items.map((i) => i.text), 5),
    [history, items],
  );

  const suggestFn = useServerFn(suggestItems);
  const aiSuggestions = useQuery({
    queryKey: [
      "ai-suggestions",
      active?.id ?? "none",
      history.length,
      items.length,
    ],
    queryFn: () =>
      suggestFn({
        data: {
          history: history.map((h) => ({ text: h.text, count: h.count })),
          current: items.map((i) => i.text),
        },
      }),
    enabled: !!active && history.length >= 3,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <Confetti trigger={confettiTrigger} />
      {showGuestGate && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4">
          <div className="bg-canvas rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="size-10 rounded-full bg-accent-yellow flex items-center justify-center mb-3">
              <Lock className="size-5" />
            </div>
            <h2 className="text-lg font-semibold mb-1">
              Ab der 3. Liste brauchst du ein Konto
            </h2>
            <p className="text-sm text-zinc-500 mb-5">
              Mit einem kostenlosen Konto erstellst du unbegrenzt viele Listen
              und kannst gelöschte Listen 30 Tage lang wiederherstellen.
            </p>
            <div className="flex gap-2">
              <Link
                to="/auth"
                onClick={() => setShowGuestGate(false)}
                className="flex-1 bg-ink text-canvas rounded-xl py-2.5 text-sm font-semibold text-center"
              >
                Konto erstellen
              </Link>
              <button
                onClick={() => setShowGuestGate(false)}
                className="px-4 rounded-xl bg-zinc-100 text-sm font-medium"
              >
                Später
              </button>
            </div>
          </div>
        </div>
      )}
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

            {(frequent.length > 0 || (aiSuggestions.data && aiSuggestions.data.length > 0)) && (
              <div className="mt-4 space-y-3">
                {frequent.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      Häufig gekauft
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {frequent.map((h) => (
                        <button
                          key={h.text}
                          onClick={() => add(h.text)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white ring-1 ring-black/5 hover:ring-black/10"
                        >
                          + {h.text}
                          <span className="ml-1 text-zinc-400">{h.count}×</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {aiSuggestions.data && aiSuggestions.data.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
                      <Sparkles className="size-3" /> KI-Vorschläge
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {aiSuggestions.data.map((s) => (
                        <button
                          key={s}
                          onClick={() => add(s)}
                          className="text-xs px-3 py-1.5 rounded-full bg-accent-yellow/40 ring-1 ring-accent-yellow hover:bg-accent-yellow/60"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                    <label className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.10"
                        min="0"
                        value={item.price ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPrice(item.id, v === "" ? undefined : Number(v));
                        }}
                        placeholder="0,00"
                        aria-label={`Preis für ${item.text}`}
                        className="w-16 text-right bg-zinc-50 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ink placeholder:text-zinc-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="ml-1 text-xs text-zinc-400">€</span>
                    </label>
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

            {total > 0 && (
              <div className="mt-4 bg-ink text-canvas rounded-2xl px-5 py-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-canvas/60">
                  Summe
                </span>
                <span className="font-display text-2xl">{formatEUR(total)}</span>
              </div>
            )}

            {items.length > 0 && openCount === 0 && (
              <div className="mt-4 bg-accent-yellow rounded-2xl px-5 py-4 text-center text-sm font-medium">
                Alles erledigt für diese Woche 🎉
              </div>
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