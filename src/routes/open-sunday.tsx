import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { SUNDAY_CATEGORIES } from "@/lib/sunday-data";
import { useLocalStorage } from "@/lib/useLocalStorage";

type Favorite = { id: string; name: string; category: string; note: string };

export const Route = createFileRoute("/open-sunday")({
  head: () => ({
    meta: [
      { title: "Sonntag offen — Sonntagsruhe Planner" },
      {
        name: "description",
        content:
          "Was am Sonntag in Deutschland offen hat: Späti, Tankstelle, Bahnhof-Supermarkt, Bäckerei, Notdienst-Apotheke.",
      },
      { property: "og:title", content: "Sonntag offen — Sonntagsruhe" },
      {
        property: "og:description",
        content:
          "Kategorien, die auch sonntags aufhaben — plus deine eigenen Favoriten um die Ecke.",
      },
    ],
  }),
  component: OpenSundayPage,
});

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function OpenSundayPage() {
  const [favs, setFavs] = useLocalStorage<Favorite[]>("sonntag.favs", []);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(SUNDAY_CATEGORIES[0]!.id);
  const [note, setNote] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setFavs((prev) => [
      ...prev,
      { id: newId(), name: name.trim(), category, note: note.trim() },
    ]);
    setName("");
    setNote("");
  };

  const remove = (id: string) =>
    setFavs((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans pb-32">
      <header className="px-5 pt-8 pb-6">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
          Sonntag in Deutschland
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-balance">
          Was heute trotzdem aufhat.
        </h1>
      </header>

      <section className="px-5 mb-10">
        <div className="grid grid-cols-1 gap-3">
          {SUNDAY_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              id={cat.id}
              className="bg-white p-4 rounded-xl ring-1 ring-black/5 flex gap-4 scroll-mt-8"
            >
              <div className="size-10 shrink-0 bg-zinc-50 rounded-lg flex items-center justify-center ring-1 ring-black/5 font-display italic text-xl">
                {cat.glyph}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{cat.name}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {cat.hint}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {cat.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
          Deine Favoriten
        </h3>

        <form
          onSubmit={add}
          className="bg-white rounded-2xl ring-1 ring-black/5 p-4 shadow-sm space-y-3 mb-4"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Späti Rosenthaler Ecke"
            className="w-full bg-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink placeholder:text-zinc-400"
          />
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 bg-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
            >
              {SUNDAY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="bis 22:00"
              className="flex-1 bg-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink placeholder:text-zinc-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent-yellow text-ink rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="size-4" /> Favorit speichern
          </button>
        </form>

        {favs.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            Noch keine Favoriten. Speichere deinen Späti um die Ecke.
          </p>
        ) : (
          <ul className="bg-white rounded-2xl ring-1 ring-black/5 divide-y divide-zinc-100">
            {favs.map((f) => {
              const cat = SUNDAY_CATEGORIES.find((c) => c.id === f.category);
              return (
                <li key={f.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="size-8 bg-zinc-50 rounded-lg flex items-center justify-center ring-1 ring-black/5 font-display italic text-sm">
                    {cat?.glyph ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <div className="text-xs text-zinc-500">
                      {cat?.name}
                      {f.note ? ` · ${f.note}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(f.id)}
                    className="text-zinc-300 hover:text-zinc-600"
                    aria-label="Entfernen"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <BottomNav />
    </div>
  );
}