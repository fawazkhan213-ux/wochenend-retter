import { useEffect, useLayoutEffect, useState } from "react";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// First-run guided tour. Six pages: warm hello + one page per bottom-nav
// section. Steps 2-6 dim the whole screen and highlight the matching tab.
// User must press "Nicht mehr anzeigen" on the last step before continuing.

const KEY = "sonntag.tourDismissed";

type Step = {
  titleDe: string;
  titleEn: string;
  bodyDe: string;
  bodyEn: string;
  targetTourId?: string;
};

const STEPS: Step[] = [
  {
    titleDe: "Willkommen beim Wochenend-Retter",
    titleEn: "Welcome to Wochenend-Retter",
    bodyDe:
      "Kurze Tour durch die App – damit du am Sonntag nie wieder ratlos vorm Kühlschrank stehst. Fünf Bereiche, in einer Minute erklärt.",
    bodyEn:
      "A quick tour so you never stand clueless in front of the fridge on Sunday again. Five sections, explained in a minute.",
  },
  {
    titleDe: "Start",
    titleEn: "Home",
    bodyDe:
      "Deine Übersicht: Ladenschluss-Countdown, das Wetter fürs Wochenende und ein Blick auf deine Panik-Stufe.",
    bodyEn:
      "Your overview: closing-time countdown, weekend weather and a glance at your panic level.",
    targetTourId: "/",
  },
  {
    titleDe: "Einkauf",
    titleEn: "Shopping",
    bodyDe:
      "Erstelle Einkaufslisten, hake Dinge ab und sieh sofort, wie viele Sachen noch fehlen. Alles bleibt lokal auf deinem Gerät.",
    bodyEn:
      "Create lists, check items off and see how many are left. Everything stays local on your device.",
    targetTourId: "/shopping",
  },
  {
    titleDe: "Offen",
    titleEn: "Open",
    bodyDe:
      "Zeigt Läden in deiner Nähe, die gerade wirklich geöffnet haben – Tankstellen, Bäckereien, Kioske. Perfekt für den Sonntag.",
    bodyEn:
      "Shows shops near you that are actually open right now — gas stations, bakeries, kiosks. Perfect for Sunday.",
    targetTourId: "/open-sunday",
  },
  {
    titleDe: "Plan",
    titleEn: "Plan",
    bodyDe:
      "Plane dein Wochenende: Wetter, Orte in der Nähe und Ausflugsideen. Ein Tipp auf „Aktualisieren“ frischt alles auf.",
    bodyEn:
      "Plan your weekend: weather, nearby places and outing ideas. A tap on \u201CRefresh\u201D updates it all.",
    targetTourId: "/plan",
  },
  {
    titleDe: "Konto",
    titleEn: "Account",
    bodyDe:
      "Dein Profil, App teilen, Datenschutz & Sicherheit. Hier findest du außerdem den Vorschlag-Button für Feedback.",
    bodyEn:
      "Your profile, share the app, privacy & security. You'll also find the feedback button here.",
    targetTourId: "/account",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function TourOverlay() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    // small delay so the app has painted (nav element exists)
    const t = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  const step = STEPS[index];
  const targetId = step?.targetTourId;

  useLayoutEffect(() => {
    if (!visible) return;
    if (!targetId) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-tour-id="${targetId}"]`,
      );
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      const pad = 8;
      setRect({
        top: r.top - pad,
        left: r.left - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const id = window.setInterval(measure, 300);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.clearInterval(id);
    };
  }, [visible, targetId, index]);

  if (!visible) return null;

  const isLast = index === STEPS.length - 1;
  const isFirst = index === 0;

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[150]" role="dialog" aria-modal="true">
      {/* Backdrop with cut-out highlight */}
      {rect ? (
        <div
          className="absolute rounded-2xl ring-2 ring-accent-yellow transition-all duration-300"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/72" />
      )}

      {/* Tour card, centered */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
        <div className="pointer-events-auto bg-canvas rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="size-9 rounded-full bg-accent-yellow flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {index + 1} / {STEPS.length}
            </span>
          </div>

          <h2 className="font-display text-2xl leading-tight text-ink mb-2">
            {t(step.titleDe, step.titleEn)}
          </h2>
          <p className="text-sm text-zinc-600 mb-5">
            {t(step.bodyDe, step.bodyEn)}
          </p>

          {/* progress dots */}
          <div className="flex gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= index ? "bg-ink" : "bg-zinc-200"
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={dismiss}
              className="w-full bg-ink text-canvas rounded-xl py-3 text-sm font-semibold"
            >
              {t("Nicht mehr anzeigen & loslegen", "Don't show again & get started")}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  aria-label={t("Zurück", "Back")}
                  className="size-11 shrink-0 rounded-xl bg-zinc-100 flex items-center justify-center text-ink"
                >
                  <ChevronLeft className="size-5" />
                </button>
              )}
              <button
                onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))}
                className="flex-1 bg-ink text-canvas rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-1"
              >
                {t("Weiter", "Next")} <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function hasCompletedTour() {
  try {
    return Boolean(window.localStorage.getItem(KEY));
  } catch {
    return false;
  }
}