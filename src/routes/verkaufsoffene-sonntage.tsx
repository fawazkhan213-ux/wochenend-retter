import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/verkaufsoffene-sonntage")({
  head: () => ({
    meta: [
      {
        title:
          "Verkaufsoffener Sonntag 2026: NRW, Berlin, Hamburg — Wochenend-Retter",
      },
      {
        name: "description",
        content:
          "Verkaufsoffene Sonntage in Deutschland 2026: Termine für NRW, Berlin und Hamburg, Regeln nach Ladenöffnungsgesetz und Tipps, damit du am Wochenende nichts vergisst.",
      },
      {
        property: "og:title",
        content:
          "Verkaufsoffener Sonntag 2026 — Termine für NRW, Berlin, Hamburg",
      },
      {
        property: "og:description",
        content:
          "Alle Infos zu verkaufsoffenen Sonntagen in Deutschland: Termine, Regeln und wie du sie in deine Wochenendplanung einbaust.",
      },
      {
        property: "og:url",
        content:
          "https://wochenend-retter.lovable.app/verkaufsoffene-sonntage",
      },
      { property: "og:type", content: "article" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://wochenend-retter.lovable.app/verkaufsoffene-sonntage",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Was ist ein verkaufsoffener Sonntag?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ein verkaufsoffener Sonntag ist ein Sonntag, an dem Geschäfte in einer Stadt oder einem Stadtteil ausnahmsweise öffnen dürfen. Grundlage ist das jeweilige Landes-Ladenöffnungsgesetz. Meist ist die Öffnung an einen Anlass wie ein Stadtfest, einen Markt oder eine Messe gebunden.",
              },
            },
            {
              "@type": "Question",
              name: "Wie viele verkaufsoffene Sonntage sind pro Jahr erlaubt?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Die Zahl variiert je Bundesland. In Nordrhein-Westfalen sind bis zu acht verkaufsoffene Sonntage pro Kommune und Jahr möglich, in Berlin bis zu acht, in Hamburg bis zu vier. Die konkreten Termine legt die Stadt fest.",
              },
            },
            {
              "@type": "Question",
              name: "Welche Öffnungszeiten gelten am verkaufsoffenen Sonntag?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Üblich sind fünf Stunden zwischen 13:00 und 18:00 Uhr. Die genauen Zeiten legt jede Kommune fest und können je Termin abweichen.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: VerkaufsoffeneSonntagePage,
});

type Region = {
  name: string;
  maxPerYear: string;
  hint: string;
  cities: string[];
  sourceLabel: string;
  sourceUrl: string;
};

const REGIONS: Region[] = [
  {
    name: "Nordrhein-Westfalen",
    maxPerYear: "bis zu 8 Sonntage / Kommune",
    hint: "Größte Auswahl: Köln, Düsseldorf, Essen, Dortmund, Bochum, Bonn und viele Mittelstädte.",
    cities: ["Köln", "Düsseldorf", "Essen", "Dortmund", "Bochum", "Bonn", "Münster", "Aachen"],
    sourceLabel: "Städte- und Gemeindebund NRW",
    sourceUrl: "https://www.kommunen.nrw/",
  },
  {
    name: "Berlin",
    maxPerYear: "bis zu 8 Sonntage / Jahr",
    hint: "Termine gelten stadtweit und werden vom Senat vorab veröffentlicht.",
    cities: ["Mitte", "Charlottenburg", "Prenzlauer Berg", "Neukölln"],
    sourceLabel: "Berlin.de · Verkaufsoffene Sonntage",
    sourceUrl: "https://www.berlin.de/sen/wirtschaft/wirtschaft/branchen/handel/verkaufsoffene-sonntage/",
  },
  {
    name: "Hamburg",
    maxPerYear: "bis zu 4 Sonntage / Kommune",
    hint: "Meist an Stadtteilfeste gekoppelt — Innenstadt, Altona, Eppendorf, Bergedorf.",
    cities: ["Innenstadt", "Altona", "Eppendorf", "Bergedorf"],
    sourceLabel: "hamburg.de · Verkaufsoffene Sonntage",
    sourceUrl: "https://www.hamburg.de/verkaufsoffene-sonntage/",
  },
];

function VerkaufsoffeneSonntagePage() {
  return (
    <main className="min-h-screen bg-canvas text-ink font-sans pb-16">
      <header className="px-5 pt-8 pb-4">
        <Link
          to="/open-sunday"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 mb-6"
        >
          <ArrowLeft className="size-4" /> Sonntags offen
        </Link>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
          Ratgeber
        </p>
        <h1 className="text-3xl font-medium tracking-tight text-balance mb-3">
          Verkaufsoffener Sonntag 2026: Termine, Regeln, Städte.
        </h1>
        <p className="text-base text-zinc-600 leading-relaxed text-pretty">
          In Deutschland gilt die Sonntagsruhe — mit Ausnahmen. An
          verkaufsoffenen Sonntagen dürfen Geschäfte für ein paar Stunden
          öffnen. Hier erfährst du, wo, wann und wie du sie in deinen
          Wochenendplan einbaust.
        </p>
      </header>

      <section className="px-5 mb-8">
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShoppingBag className="size-3.5" /> Kurz erklärt
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            Ein <strong>verkaufsoffener Sonntag</strong> ist ein von der
            Kommune genehmigter Sonntag, an dem der Einzelhandel öffnen darf
            — meist von 13 bis 18 Uhr. Rechtsgrundlage sind die
            Ladenöffnungsgesetze der Bundesländer; die Termine müssen in der
            Regel an einen Anlass wie ein Stadt- oder Straßenfest gekoppelt
            sein.
          </p>
          <p className="text-sm leading-relaxed">
            Wichtig: Termine gelten oft nicht flächendeckend, sondern für
            einzelne Stadtteile. Ein Blick auf die Website der Stadt lohnt
            sich immer, bevor du losfährst.
          </p>
        </div>
      </section>

      <section className="px-5 mb-8">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <MapPin className="size-3.5" /> Verkaufsoffene Sonntage nach Region
        </h2>
        <div className="space-y-3">
          {REGIONS.map((r) => (
            <article
              key={r.name}
              className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-medium">{r.name}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-accent-yellow text-ink shrink-0">
                  {r.maxPerYear}
                </span>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                {r.hint}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {r.cities.map((c) => (
                  <span
                    key={c}
                    className="text-[11px] font-medium px-2 py-1 rounded-full bg-zinc-50 ring-1 ring-black/5"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <a
                href={r.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold underline text-ink"
              >
                Aktuelle Termine: {r.sourceLabel} ↗
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 mb-8">
        <div className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CalendarDays className="size-3.5" /> Termine finden
          </h2>
          <p className="text-sm leading-relaxed mb-2">
            Da die Städte selbst über verkaufsoffene Sonntage entscheiden,
            gibt es keine bundesweite Liste. Am zuverlässigsten sind:
          </p>
          <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1 mb-3">
            <li>die Website deiner Stadt (Suchbegriff „verkaufsoffener Sonntag [Stadt]“)</li>
            <li>die Seiten der örtlichen Werbe- oder Citygemeinschaft</li>
            <li>Aushänge im Einzelhandel ein paar Wochen vor dem Termin</li>
          </ul>
          <p className="text-sm leading-relaxed">
            Für alles, was auch an gewöhnlichen Sonntagen offen ist —
            Bäckereien, Tankstellen, Cafés, Museen — nutzt du die
            Standort-Suche in Wochenend-Retter.
          </p>
        </div>
      </section>

      <section className="px-5 mb-8">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Häufige Fragen
        </h2>
        <div className="space-y-3">
          <details className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm group">
            <summary className="text-sm font-semibold cursor-pointer list-none flex justify-between items-center">
              Wie viele verkaufsoffene Sonntage darf eine Stadt haben?
              <span className="text-zinc-400 group-open:rotate-180 transition">⌄</span>
            </summary>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Das regelt jedes Bundesland selbst. In NRW und Berlin sind bis
              zu acht Sonntage pro Kommune und Jahr möglich, in Hamburg bis
              zu vier. Bayern erlaubt bis zu vier, Sachsen bis zu vier.
            </p>
          </details>
          <details className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm group">
            <summary className="text-sm font-semibold cursor-pointer list-none flex justify-between items-center">
              Welche Uhrzeit gilt am verkaufsoffenen Sonntag?
              <span className="text-zinc-400 group-open:rotate-180 transition">⌄</span>
            </summary>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Üblich sind fünf Stunden zwischen 13 und 18 Uhr. Manche Städte
              erlauben 12–17 oder 13–19 Uhr. Die genaue Zeit steht in der
              Bekanntmachung der Stadt.
            </p>
          </details>
          <details className="bg-white rounded-2xl ring-1 ring-black/5 p-5 shadow-sm group">
            <summary className="text-sm font-semibold cursor-pointer list-none flex justify-between items-center">
              Haben Supermärkte am verkaufsoffenen Sonntag geöffnet?
              <span className="text-zinc-400 group-open:rotate-180 transition">⌄</span>
            </summary>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Grundsätzlich ja — Supermärkte fallen unter das
              Ladenöffnungsgesetz. In der Praxis öffnen aber nicht alle
              Filialen: Es hängt vom Betreiber und vom Standort ab. Prüfe die
              Website deiner Filiale.
            </p>
          </details>
        </div>
      </section>

      <section className="px-5">
        <div className="bg-ink text-canvas rounded-2xl p-5">
          <h2 className="text-lg font-medium mb-2">
            Nichts mehr vergessen am Wochenende.
          </h2>
          <p className="text-sm opacity-80 mb-4">
            Wochenend-Retter erinnert dich rechtzeitig an den Ladenschluss
            am Samstag und zeigt dir, was am Sonntag in deiner Nähe offen
            hat.
          </p>
          <div className="flex gap-2">
            <Link
              to="/open-sunday"
              className="flex-1 text-center bg-accent-yellow text-ink rounded-xl py-2.5 text-sm font-semibold"
            >
              Sonntags offen
            </Link>
            <Link
              to="/shopping"
              className="flex-1 text-center bg-white/10 text-canvas rounded-xl py-2.5 text-sm font-semibold ring-1 ring-white/20"
            >
              Einkaufsliste
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}