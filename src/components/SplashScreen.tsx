import { useEffect, useState } from "react";

// Only shown when the app is launched from a home-screen icon (standalone
// display mode). Vanishes once the loading bar completes.
function isStandalone() {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean })
    .standalone;
  return Boolean(mm || iosStandalone);
}

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!isStandalone()) return;
    setVisible(true);
    const fade = window.setTimeout(() => setLeaving(true), 1400);
    const gone = window.setTimeout(() => setVisible(false), 1800);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(gone);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-canvas transition-opacity duration-500 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={leaving}
    >
      <img
        src="/app-icon-192.png"
        alt=""
        width={96}
        height={96}
        className="size-24 rounded-3xl shadow-lg mb-5"
      />
      <div className="font-display italic text-2xl text-ink mb-1">
        Wochenend-Retter
      </div>
      <p className="text-xs text-zinc-500 mb-8 uppercase tracking-wider">
        Dein Sonntag, sortiert
      </p>
      <div className="w-40 h-1 rounded-full bg-zinc-200 overflow-hidden">
        <div className="h-full bg-ink animate-[splash-load_1.4s_ease-out_forwards]" />
      </div>
      <style>{`
        @keyframes splash-load {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}