import { useEffect, useState } from "react";
import { Share, Plus, X, Smartphone } from "lucide-react";

// One-time "Als Web-App speichern" hint. iOS Safari and Android/Chrome need
// different steps, so we detect the platform and show tailored instructions.
// The user's decision is remembered in localStorage.

type Platform = "ios" | "android" | "desktop" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows|Macintosh|Linux/i.test(ua)) return "desktop";
  return "other";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean })
    .standalone;
  return Boolean(mm || iosStandalone);
}

const KEY = "sonntag.installPromptDismissed";

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    if (isStandalone()) return;
    if (window.localStorage.getItem(KEY)) return;
    const p = detectPlatform();
    setPlatform(p);
    // Skip desktop — the OS install prompt is enough there.
    if (p !== "ios" && p !== "android") return;
    // Wait until the first-run tour has been dismissed, then show.
    const TOUR_KEY = "sonntag.tourDismissed";
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      if (window.localStorage.getItem(TOUR_KEY)) {
        window.setTimeout(() => !cancelled && setVisible(true), 600);
        return true;
      }
      return false;
    };
    if (check()) return;
    const id = window.setInterval(() => {
      if (check()) window.clearInterval(id);
    }, 500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-canvas rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-fade-in">
        <button
          onClick={dismiss}
          aria-label="Schließen"
          className="absolute top-3 right-3 size-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"
        >
          <X className="size-4" />
        </button>
        <div className="size-10 rounded-full bg-accent-yellow flex items-center justify-center mb-3">
          <Smartphone className="size-5" />
        </div>
        <h2 className="text-lg font-semibold mb-1">
          Als Web-App auf dem Home-Bildschirm speichern
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          So öffnet sich Wochenend-Retter mit einem Tipp – ohne Browser-Leiste
          und mit eigener App-Optik.
        </p>

        {platform === "ios" && (
          <ol className="text-sm text-ink space-y-2 mb-5">
            <li className="flex items-start gap-2">
              <span className="size-5 rounded-full bg-zinc-100 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>
                Tippe unten in Safari auf{" "}
                <Share className="inline size-4 -mt-0.5" aria-label="Teilen" />{" "}
                <b>Teilen</b>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="size-5 rounded-full bg-zinc-100 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>
                Wähle{" "}
                <b>„Zum Home-Bildschirm“</b>{" "}
                <Plus className="inline size-4 -mt-0.5" aria-hidden />.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="size-5 rounded-full bg-zinc-100 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>Bestätige mit <b>„Hinzufügen“</b> rechts oben.</span>
            </li>
          </ol>
        )}

        {platform === "android" && (
          <ol className="text-sm text-ink space-y-2 mb-5">
            <li className="flex items-start gap-2">
              <span className="size-5 rounded-full bg-zinc-100 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>
                Tippe in Chrome oben rechts auf das <b>⋮ Menü</b>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="size-5 rounded-full bg-zinc-100 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>
                Wähle{" "}
                <b>„App installieren“</b> oder{" "}
                <b>„Zum Startbildschirm zufügen“</b>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="size-5 rounded-full bg-zinc-100 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>Bestätige mit <b>„Installieren“</b>.</span>
            </li>
          </ol>
        )}

        <button
          onClick={dismiss}
          className="w-full bg-ink text-canvas rounded-xl py-3 text-sm font-semibold"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}