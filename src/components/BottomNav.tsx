import { Link } from "@tanstack/react-router";
import { Home, ShoppingBasket, MapPin, Sun, UserCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ITEMS = [
  { to: "/", de: "Start", en: "Home", Icon: Home },
  { to: "/shopping", de: "Einkauf", en: "Shop", Icon: ShoppingBasket },
  { to: "/open-sunday", de: "Offen", en: "Open", Icon: MapPin },
  { to: "/plan", de: "Plan", en: "Plan", Icon: Sun },
  { to: "/account", de: "Konto", en: "Account", Icon: UserCircle2 },
] as const;

export function BottomNav() {
  const { t } = useI18n();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-canvas/85 backdrop-blur-md border-t border-black/5 px-4 py-3">
      <div className="mx-auto max-w-md flex justify-between items-center gap-1">
        {ITEMS.map(({ to, de, en, Icon }) => (
          <Link
            key={to}
            to={to}
            data-tour-id={to}
            className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-ink/40 transition-colors [&.active]:bg-ink [&.active]:text-canvas"
            activeOptions={{ exact: true }}
            activeProps={{ className: "active" }}
          >
            <Icon className="size-5" strokeWidth={2} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {t(de, en)}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}