import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

// Full-screen overlay when the device is offline. When connectivity returns,
// refresh the Supabase session so the user is "logged back in" seamlessly.
export function OfflineBanner() {
  const { t } = useI18n();
  const [online, setOnline] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setOnline(navigator.onLine);
    const goOnline = async () => {
      setOnline(true);
      try {
        await supabase.auth.refreshSession();
      } catch {
        /* noop */
      }
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!hydrated || online) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-canvas/95 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="max-w-sm text-center bg-white rounded-2xl ring-1 ring-black/10 p-8 shadow-xl">
        <div className="mx-auto size-14 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <WifiOff className="size-6 text-zinc-600" />
        </div>
        <h2 className="text-lg font-semibold mb-2">
          {t("Keine Internetverbindung", "No internet connection")}
        </h2>
        <p className="text-sm text-zinc-600">
          {t(
            "Bitte verbinde dich mit dem Internet, um fortzufahren. Sobald du wieder online bist, melden wir dich automatisch an.",
            "Please connect to the internet to continue. Once you're back online we'll sign you in again automatically.",
          )}
        </p>
      </div>
    </div>
  );
}
